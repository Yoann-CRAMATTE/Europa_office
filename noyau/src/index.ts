// Amorçage du runtime. Exécuté après décompression, dans la page elle-même.

import { documentVierge, type DocumentEuropa } from './document.js'
import { lireDocumentEmbarque, enregistrerSous } from './serialize.js'
import { obtenirModule } from './modules.js'
import { estChiffre, dechiffrer } from './crypto.js'
import { demanderMotDePasse } from './pwgate.js'
import { moduleNotes } from '../../modules/notes/index.js'

// Modules embarqués dans cette construction.
import { enregistrerModule } from './modules.js'
enregistrerModule(moduleNotes)

declare global {
  interface Window {
    europa: {
      doc: DocumentEuropa
      enregistrer: () => void
      version: string
    }
  }
}

async function demarrer (): Promise<void> {
  const hote = document.getElementById('europa-app')
  if (!hote) throw new Error('Conteneur #europa-app introuvable.')

  let doc: DocumentEuropa

  // Un document chiffré occupe le même bloc : on le déverrouille avant tout.
  const brut = document.getElementById('europa-doc')?.textContent?.trim()
  const analyse: unknown = brut ? JSON.parse(brut) : null

  if (estChiffre(analyse)) {
    const motDePasse = await demanderMotDePasse(mdp => dechiffrer(analyse, mdp))
    doc = JSON.parse(motDePasse)
  } else {
    doc = lireDocumentEmbarque() ?? documentVierge('notes', 'Document sans titre')
  }

  const module = obtenirModule(doc.module)
  if (!module) {
    throw new Error(
      `Ce fichier est un document "${doc.module}" mais ce module n’est pas ` +
      'embarqué dans cette construction.'
    )
  }

  // Un contenu vide signifie document neuf : on laisse le module le peupler.
  if (doc.contenu == null || (Array.isArray(doc.contenu) && doc.contenu.length === 0)) {
    doc.contenu = module.contenuVierge()
  }

  let modifie = false
  const ctx = {
    marquerModifie () {
      modifie = true
      document.title = '• ' + doc.titre
    },
    enregistrer () {
      enregistrerSous(doc)
      modifie = false
      document.title = doc.titre
    }
  }

  module.monter(hote, doc, ctx)
  document.title = doc.titre

  // Ctrl/Cmd+S enregistre, comme dans n'importe quelle suite bureautique.
  addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault()
      ctx.enregistrer()
    }
  })

  // Le navigateur ne peut pas écrire sur le fichier ouvert : on avertit.
  addEventListener('beforeunload', e => {
    if (modifie) e.preventDefault()
  })

  window.europa = { doc, enregistrer: ctx.enregistrer, version: 'europa/1' }
  document.getElementById('europa-amorce')?.classList.add('fini')
  setTimeout(() => document.getElementById('europa-amorce')?.remove(), 400)
}

demarrer().catch((e: unknown) => {
  const msg = e instanceof Error ? e.message : String(e)
  document.body.innerHTML =
    `<div style="position:fixed;inset:0;display:flex;align-items:center;` +
    `justify-content:center;padding:40px;text-align:center">${msg}</div>`
})
