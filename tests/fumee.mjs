// Test de fumée : ouvre un fichier .europa.html dans Chromium et vérifie
// que la chaîne décompression -> montage -> aller-retour du document tient.

import { chromium } from 'playwright'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'
import assert from 'node:assert/strict'

const fichier = resolve(process.argv[2] ?? 'dist/demo.europa.html')
const navigateur = await chromium.launch()
const page = await navigateur.newPage()

const erreurs = []
page.on('pageerror', e => erreurs.push(e.message))
page.on('console', m => { if (m.type() === 'error') erreurs.push(m.text()) })

// Aucune requête réseau ne doit sortir : le fichier est censé être autonome.
const reseau = []
page.on('request', r => { if (!r.url().startsWith('file:') && !r.url().startsWith('blob:')) reseau.push(r.url()) })

await page.goto(pathToFileURL(fichier).href)
// Signature Playwright : (fonction, argument, options). Sans le `null`,
// les options seraient prises pour l'argument et le délai ignoré.
await page.waitForFunction(() => window.europa !== undefined, null, { timeout: 10_000 })
  .catch(async () => {
    const visible = await page.evaluate(() => document.body.innerText.trim())
    throw new Error('Le runtime n\'a pas démarré. Affiché à l\'écran : ' + visible)
  })

// 1. le runtime a démarré et exposé le document
const doc = await page.evaluate(() => window.europa.doc)
assert.equal(doc.format, 'europa/1', 'format du document')
assert.equal(doc.module, 'notes', 'module du document')

// 2. le module a bien été monté
await page.waitForSelector('.eu-zone', { timeout: 5000 })
assert.equal(await page.locator('.eu-titre').inputValue(), doc.titre, 'titre affiché')

// 3. l'écran d'amorce a disparu
await page.waitForSelector('#europa-amorce', { state: 'detached', timeout: 5000 })

// 4. une saisie est bien retenue dans le modèle
await page.locator('.eu-zone').fill('Bonjour Europa')
assert.equal(
  await page.evaluate(() => window.europa.doc.contenu.texte),
  'Bonjour Europa',
  'saisie propagée au document'
)

// 5. aller-retour : le fichier resérialisé se relit et contient la saisie
const html = await page.evaluate(() => {
  const bloc = document.getElementById('europa-doc')
  bloc.textContent = '\n' + JSON.stringify(window.europa.doc, null, 2).replace(/</g, '\\u003c') + '\n'
  return '<!DOCTYPE html>\n' + document.documentElement.outerHTML
})
assert.ok(html.includes('Bonjour Europa'), 'saisie présente dans le fichier resérialisé')
assert.ok(!/<script[^>]*>[^<]*<script/.test(html), 'pas de script imbriqué')

// 6. autonomie réseau
assert.deepEqual(reseau, [], `appels réseau inattendus : ${reseau.join(', ')}`)

// 7. aucune erreur JS
assert.deepEqual(erreurs, [], `erreurs console : ${erreurs.join(' | ')}`)

await navigateur.close()
console.log('Test de fumée : 7/7 OK  (' + fichier + ')')
