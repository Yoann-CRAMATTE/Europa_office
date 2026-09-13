// Module Notes — le plus simple de la suite.
// Sa raison d'être ici : valider la chaîne complète noyau -> module -> fichier.
// Les modules lourds (texte, tableur) suivront le même contrat.

import type { Module, Contexte } from '../../noyau/src/modules.js'
import type { DocumentEuropa } from '../../noyau/src/document.js'

export interface ContenuNotes {
  texte: string
}

export const moduleNotes: Module<ContenuNotes> = {
  nom: 'notes',
  libelle: 'Notes',

  contenuVierge () {
    return { texte: '' }
  },

  monter (hote: HTMLElement, doc: DocumentEuropa<ContenuNotes>, ctx: Contexte) {
    hote.innerHTML = `
      <div class="eu-cadre">
        <header class="eu-barre">
          <input class="eu-titre" value="" aria-label="Titre du document" />
          <button class="eu-bouton" type="button">Enregistrer</button>
        </header>
        <textarea class="eu-zone" spellcheck="true"
          aria-label="Contenu de la note"></textarea>
      </div>`

    const titre = hote.querySelector('.eu-titre') as HTMLInputElement
    const zone = hote.querySelector('.eu-zone') as HTMLTextAreaElement
    const bouton = hote.querySelector('.eu-bouton') as HTMLButtonElement

    // value via propriété, jamais via l'attribut HTML : pas d'injection possible.
    titre.value = doc.titre
    zone.value = doc.contenu.texte

    const surTitre = () => { doc.titre = titre.value; ctx.marquerModifie() }
    const surTexte = () => { doc.contenu.texte = zone.value; ctx.marquerModifie() }
    const surClic = () => ctx.enregistrer()

    titre.addEventListener('input', surTitre)
    zone.addEventListener('input', surTexte)
    bouton.addEventListener('click', surClic)

    return () => {
      titre.removeEventListener('input', surTitre)
      zone.removeEventListener('input', surTexte)
      bouton.removeEventListener('click', surClic)
      hote.innerHTML = ''
    }
  }
}
