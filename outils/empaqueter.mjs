#!/usr/bin/env node
// Empaqueteur Europa Office
// Assemble un runtime JS + CSS + un document JSON en UN fichier HTML autonome.
// Le runtime est compressé en deflate-raw puis encodé en base64 ; le navigateur
// le décompresse à l'ouverture via DecompressionStream. Le document, lui, reste
// en clair et lisible : c'est la seule partie qu'un humain ou un agent doit éditer.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { deflateRawSync } from 'node:zlib'
import { dirname, resolve } from 'node:path'

const APP = 'europa-office'

// ---------------------------------------------------------------- arguments
function lireArguments (argv) {
  const o = { titre: 'Document Europa', module: 'texte', doc: null, css: null }
  for (let i = 0; i < argv.length; i += 2) {
    const cle = argv[i]?.replace(/^--/, '')
    const val = argv[i + 1]
    if (cle && val !== undefined) o[cle] = val
  }
  return o
}

// Un "<" dans le JSON fermerait prématurément le <script>. On l'échappe.
// Idem pour les séparateurs de ligne Unicode, illégaux dans certains parseurs.
function jsonSurEchappe (valeur) {
  return JSON.stringify(valeur, null, 2)
    .replace(/</g, '\\u003c')
    .replace(RegExp(String.fromCharCode(0x2028), 'g'), '\\u2028')
    .replace(RegExp(String.fromCharCode(0x2029), 'g'), '\\u2029')
}

function compresser (texte) {
  return deflateRawSync(Buffer.from(texte, 'utf8'), { level: 9 }).toString('base64')
}

// ------------------------------------------------------------------ gabarit
function gabarit ({ titre, module: mod, docJson, rtB64, cssB64, version }) {
  return `<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="generator" content="${APP} ${version}" />
    <title>${titre.replace(/[<&]/g, c => (c === '<' ? '&lt;' : '&amp;'))}</title>
    <!--
      Europa Office — document autonome (module : ${mod})
      MIT License

      STRUCTURE DE CE FICHIER
      · Le contenu utilisateur est le bloc <script type="application/europa+json"
        id="europa-doc"> ci-dessous : du JSON lisible. C'est LE SEUL bloc à
        éditer. Tout "<" y est échappé en \\u003c.
      · Les blocs base64 sont le runtime compressé (deflate-raw). Aucune donnée
        utilisateur dedans. Ne pas y toucher.
      · Aucun appel réseau : ce fichier fonctionne hors-ligne, sans serveur et
        sans télémétrie.
    -->
    <script type="application/europa+json" id="europa-doc">
${docJson}
    </script>
    <style>
      html,body{margin:0;height:100%;background:#0d1b2e;color:#f2f0ea;
        font:15px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif}
      #europa-amorce{position:fixed;inset:0;display:grid;place-content:center;
        justify-items:center;gap:18px;transition:opacity .4s ease}
      #europa-amorce.fini{opacity:0;pointer-events:none}
      .eu-marque{width:72px;height:72px;border-radius:18px;background:#16273e;
        box-shadow:0 10px 34px rgba(0,0,0,.5)}
      .eu-mot{letter-spacing:.4em;text-transform:uppercase;font-size:13px;
        text-indent:.4em;opacity:.85}
      @media (prefers-reduced-motion:reduce){#europa-amorce{transition:none}}
    </style>
  </head>
  <body>
    <div id="europa-amorce" aria-hidden="true">
      <div class="eu-marque"></div>
      <div class="eu-mot">Europa</div>
    </div>
    <div id="europa-app"></div>
    <script id="europa-rt-css" type="europa/deflate-b64">${cssB64}</script>
    <script id="europa-rt" type="europa/deflate-b64">${rtB64}</script>
    <script>
(async () => {
  const echec = (msg) => {
    const d = document.createElement('div')
    d.style.cssText = 'position:fixed;inset:0;display:flex;align-items:center;' +
      'justify-content:center;padding:40px;text-align:center;background:#0d1b2e;' +
      'color:#f2f0ea;font:16px/1.6 sans-serif;z-index:9999'
    d.innerHTML = msg
    document.body.appendChild(d)
    document.getElementById('europa-amorce')?.remove()
  }
  if (typeof DecompressionStream === 'undefined') {
    echec('Ce fichier requiert un navigateur de 2023 ou plus r\\u00e9cent ' +
      '(Chrome 80+, Edge, Firefox 113+, Safari 16.4+).<br>' +
      'Le document lui-m\\u00eame est intact : ouvrez-le dans un navigateur \\u00e0 jour.')
    return
  }
  const decompresser = async (id) => {
    const b64 = document.getElementById(id).textContent.trim()
    const octets = Uint8Array.from(atob(b64), c => c.charCodeAt(0))
    const flux = new Blob([octets]).stream()
      .pipeThrough(new DecompressionStream('deflate-raw'))
    return await new Response(flux).text()
  }
  try {
    const style = document.createElement('style')
    style.id = 'europa-rt-style'
    style.textContent = await decompresser('europa-rt-css')
    document.head.appendChild(style)
    const js = await decompresser('europa-rt')
    const url = URL.createObjectURL(new Blob([js], { type: 'text/javascript' }))
    await import(url)
    URL.revokeObjectURL(url)
  } catch (e) {
    echec('Ce fichier n\\u2019a pas pu d\\u00e9marrer : ' + (e?.message ?? e))
  }
})()
    </script>
  </body>
</html>
`
}

// --------------------------------------------------------------------- main
const a = lireArguments(process.argv.slice(2))
if (!a.runtime || !a.sortie) {
  console.error('usage: empaqueter.mjs --runtime <js> [--css <css>] --sortie <html>')
  console.error('       [--doc <json>] [--titre <titre>] [--module <nom>]')
  process.exit(1)
}

const version = JSON.parse(readFileSync(new URL('../package.json', import.meta.url))).version
const js = readFileSync(resolve(a.runtime), 'utf8')
const css = a.css ? readFileSync(resolve(a.css), 'utf8') : ''

// Document vierge par défaut. Le schéma vit dans docs/format-europa.md.
const doc = a.doc
  ? JSON.parse(readFileSync(resolve(a.doc), 'utf8'))
  : { format: 'europa/1', module: a.module, titre: a.titre, cree: new Date().toISOString(), contenu: [] }

const html = gabarit({
  titre: a.titre,
  module: doc.module ?? a.module,
  docJson: jsonSurEchappe(doc),
  rtB64: compresser(js),
  cssB64: compresser(css),
  version
})

mkdirSync(dirname(resolve(a.sortie)), { recursive: true })
writeFileSync(resolve(a.sortie), html, 'utf8')

const ko = n => (n / 1024).toFixed(1) + ' Ko'
console.log(`${a.sortie}  ${ko(Buffer.byteLength(html))}`)
console.log(`  runtime ${ko(js.length)} -> ${ko(compresser(js).length)} (base64 compressé)`)
console.log(`  css     ${ko(css.length)} -> ${ko(compresser(css).length)}`)
console.log(`  document ${ko(Buffer.byteLength(jsonSurEchappe(doc)))} (en clair)`)
