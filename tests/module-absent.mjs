// Décision D-003 : un document n'embarque que son module. Ouvrir un document
// d'un autre module doit donc échouer — mais lisiblement, jamais par une page
// blanche. Ce test verrouille ce comportement.

import { chromium } from 'playwright'
import { pathToFileURL } from 'node:url'
import { execFileSync } from 'node:child_process'
import { writeFileSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'
import assert from 'node:assert/strict'

const docTableur = resolve('dist/tmp-tableur.json')
const fichier = resolve('dist/tmp-tableur.europa.html')

writeFileSync(docTableur, JSON.stringify({
  format: 'europa/1',
  module: 'tableur',
  titre: 'Budget 2027',
  cree: new Date().toISOString(),
  contenu: { cellules: {} }
}))

// Construction qui ne contient que le module notes.
execFileSync('node', ['outils/empaqueter.mjs',
  '--runtime', 'dist/noyau.js', '--css', 'noyau/src/base.css',
  '--doc', docTableur, '--sortie', fichier], { stdio: 'ignore' })

const navigateur = await chromium.launch()
const page = await navigateur.newPage()
await page.goto(pathToFileURL(fichier).href)

const texte = await page.locator('body').innerText({ timeout: 5000 })
assert.match(texte, /tableur/, 'le message doit nommer le module manquant')
assert.match(texte, /n.est pas embarqu/, 'le message doit expliquer la cause')
assert.ok(texte.trim().length > 0, 'jamais de page blanche')

await navigateur.close()
rmSync(docTableur, { force: true })
rmSync(fichier, { force: true })
console.log('Test module absent : 3/3 OK  (échec lisible, pas de page blanche)')
