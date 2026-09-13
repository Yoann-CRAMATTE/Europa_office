// Vérifie l'aller-retour de chiffrement dans un vrai navigateur, en file://.
// Point critique : crypto.subtle exige un "secure context" — il faut prouver
// qu'un fichier ouvert depuis le disque y a droit, sinon la fonction est morte.

import { chromium } from 'playwright'
import { build } from 'esbuild'
import assert from 'node:assert/strict'

const paquet = await build({
  entryPoints: ['noyau/src/crypto.ts'],
  bundle: true, format: 'esm', write: false
})
const js = paquet.outputFiles[0].text

const navigateur = await chromium.launch()
const page = await navigateur.newPage()
// Page servie en file:// via un document vide sur disque.
await page.goto('file:///dev/null')

assert.equal(
  await page.evaluate(() => typeof crypto?.subtle),
  'object',
  'crypto.subtle indisponible en file:// : le chiffrement serait inutilisable'
)

const url = 'data:text/javascript;base64,' + Buffer.from(js).toString('base64')
const resultat = await page.evaluate(async (u) => {
  const m = await import(u)
  const clair = JSON.stringify({ format: 'europa/1', secret: 'données confidentielles' })
  const paquet = await m.chiffrer(clair, 'motdepasse-correct')

  let refus = null
  try { await m.dechiffrer(paquet, 'mauvais-mot-de-passe') }
  catch (e) { refus = e.message }

  return {
    estChiffre: m.estChiffre(paquet),
    fuite: JSON.stringify(paquet).includes('confidentielles'),
    iterations: paquet.iterations,
    retour: await m.dechiffrer(paquet, 'motdepasse-correct'),
    attendu: clair,
    refus
  }
}, url)

assert.equal(resultat.estChiffre, true, 'le paquet est reconnu comme chiffré')
assert.equal(resultat.fuite, false, 'aucune donnée en clair dans le paquet')
assert.equal(resultat.retour, resultat.attendu, 'déchiffrement fidèle')
assert.equal(resultat.refus, 'Mot de passe incorrect.', 'un mauvais mot de passe est rejeté')
assert.ok(resultat.iterations >= 310_000, 'itérations PBKDF2 suffisantes')

await navigateur.close()
console.log('Test de chiffrement : 5/5 OK  (crypto.subtle disponible en file://)')
