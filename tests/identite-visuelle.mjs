// Point 18 et suite : le logo d'un module doit apparaître au MÊME tracé
// dans la case d'identité du ruban et dans son onglet en bas de fenêtre.
// Ce test échoue si l'un des six modules perd l'un des deux.

import { chromium } from 'playwright'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'
import assert from 'node:assert/strict'

const fichier = resolve(process.argv[2] ?? 'maquettes/interface-v1.html')
const navigateur = await chromium.launch()
const page = await navigateur.newPage({ viewport: { width: 1420, height: 860 } })
await page.goto(pathToFileURL(fichier).href)
await page.waitForSelector('.onglet')

// Récupère la suite des tracés d'une icône : c'est sa signature de forme.
const trace = (sel) => page.$eval(sel, e =>
  [...e.querySelectorAll('path,rect,circle')]
    .map(f => f.tagName + ':' + (f.getAttribute('d') ?? f.getAttribute('x') + ',' + f.getAttribute('width') ?? ''))
    .join('|'))

const onglets = await page.$$eval('.onglet', els =>
  els.map(e => ({ id: e.dataset.id, nom: e.textContent.trim() })))

assert.ok(onglets.length >= 6, 'la maquette doit couvrir les six modules')

// Un classeur peut contenir plusieurs onglets du même type : on indexe par
// module, pour vérifier la constance d'un côté et la distinction de l'autre.
const parModule = new Map()
const rapport = []

for (const o of onglets) {
  await page.click(`.onglet[data-id="${o.id}"]`)
  await page.waitForTimeout(140)

  // 1. la case d'identité existe dans le ruban, et porte un nom
  const identite = await page.$('.identite')
  assert.ok(identite, `onglet ${o.id} : aucune case d'identité dans le ruban`)
  const nom = (await page.$eval('.identite .nom', e => e.textContent.trim()))
  assert.ok(nom.length > 0, `onglet ${o.id} : case d'identité sans nom de module`)

  // 2. le tracé du ruban et celui de l'onglet sont identiques
  const tRuban = await trace('.identite .jeton')
  const tOnglet = await trace(`.onglet[data-id="${o.id}"] .jeton`)
  assert.equal(tOnglet, tRuban,
    `onglet ${o.id} (${nom}) : le logo du ruban diffère de celui de l'onglet`)

  // 3. la couleur du module est bien reprise par les deux
  const couleurs = await page.evaluate(id => {
    const norm = c => getComputedStyle(document.body).color && c
    return {
      ruban: norm(getComputedStyle(document.querySelector('.identite')).color),
      onglet: norm(getComputedStyle(document.querySelector(`.onglet[data-id="${id}"]`)).color),
      accent: getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()
    }
  }, o.id)
  assert.equal(couleurs.ruban, couleurs.onglet,
    `onglet ${o.id} (${nom}) : la couleur du ruban ne suit pas celle de l'onglet`)
  assert.ok(couleurs.accent, `onglet ${o.id} : aucune couleur d'accent posée`)

  // 4. un module garde le même logo partout, et diffère de tous les autres
  if (parModule.has(nom)) {
    assert.equal(parModule.get(nom).trace, tRuban,
      `le module ${nom} n'a pas le même logo d'un onglet à l'autre`)
  } else {
    for (const [autre, v] of parModule) {
      assert.notEqual(v.trace, tRuban, `les modules ${autre} et ${nom} ont le même logo`)
    }
    parModule.set(nom, { trace: tRuban, couleur: couleurs.accent })
  }
  rapport.push({ module: nom, onglet: o.id, couleur: couleurs.accent })
}

assert.equal(parModule.size, 6, `six modules attendus, ${parModule.size} trouvés`)

// 5. le menu de création reprend les mêmes logos : un symbole appris une fois.
await page.click('#plus')
await page.waitForSelector('.voile.ouvert')
const choix = await page.$$eval('.choix', els => els.map(e => ({
  nom: e.querySelector('b').textContent.trim(),
  trace: [...e.querySelector('.jeton').querySelectorAll('path,rect,circle')]
    .map(f => f.tagName + ':' + (f.getAttribute('d') ?? f.getAttribute('x') + ',' + f.getAttribute('width') ?? ''))
    .join('|')
})))
assert.equal(choix.length, 6, 'le menu de création doit proposer les six modules')
for (const c of choix) {
  assert.ok(parModule.has(c.nom), `module ${c.nom} absent de la barre d'onglets`)
  assert.equal(c.trace, parModule.get(c.nom).trace,
    `le module ${c.nom} n'a pas le même logo dans le menu de création que dans le ruban`)
}

await navigateur.close()
console.log("Identité visuelle : OK — ruban, onglet et menu de création concordent\n")
for (const [m, v] of parModule) {
  const ongl = rapport.filter(r => r.module === m).map(r => r.onglet).join(', ')
  console.log(`  ${m.padEnd(11)} ${v.couleur.padEnd(8)} onglets : ${ongl}`)
}
console.log(`\n  ${onglets.length} onglets contrôlés, ${parModule.size} modules, 4 contrôles par onglet`)
