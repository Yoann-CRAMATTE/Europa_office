// Lecture et écriture du bloc <script type="application/europa+json">.
// C'est le seul endroit du fichier qui contient des données utilisateur.

import { valider, type DocumentEuropa } from './document.js'

const ID_BLOC = 'europa-doc'

/** Tout "<" doit être échappé, sinon le navigateur ferme le <script> trop tôt. */
export function encoder (doc: DocumentEuropa): string {
  return JSON.stringify(doc, null, 2)
    .replace(/</g, '\\u003c')
    .replace(RegExp(String.fromCharCode(0x2028), 'g'), '\\u2028')
    .replace(RegExp(String.fromCharCode(0x2029), 'g'), '\\u2029')
}

/** Lit le document embarqué dans la page courante. `null` si le bloc est vide. */
export function lireDocumentEmbarque (): DocumentEuropa | null {
  const bloc = document.getElementById(ID_BLOC)
  const brut = bloc?.textContent?.trim()
  if (!brut) return null
  return valider(JSON.parse(brut))
}

/** Réinjecte le document dans le DOM, puis renvoie le HTML complet du fichier. */
export function serialiserFichier (doc: DocumentEuropa): string {
  const bloc = document.getElementById(ID_BLOC)
  if (!bloc) throw new Error('Bloc document introuvable : fichier corrompu.')
  doc.modifie = new Date().toISOString()
  bloc.textContent = '\n' + encoder(doc) + '\n'
  return '<!DOCTYPE html>\n' + document.documentElement.outerHTML
}

/** Déclenche le téléchargement du fichier reconstruit. */
export function enregistrerSous (doc: DocumentEuropa, nomFichier?: string): void {
  const html = serialiserFichier(doc)
  const nom = nomFichier ?? `${doc.titre || 'document'}.europa.html`
  const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }))
  const a = document.createElement('a')
  a.href = url
  a.download = nom
  a.click()
  URL.revokeObjectURL(url)
}
