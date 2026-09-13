// Registre des modules. Chaque application de la suite s'enregistre ici.
// Le noyau ne connaît d'un module que ce contrat : monter, démonter, exporter.

import type { DocumentEuropa, NomModule } from './document.js'

export interface Module<C = unknown> {
  nom: NomModule
  libelle: string
  /** Contenu d'un document neuf pour ce module. */
  contenuVierge (): C
  /** Affiche le document dans le conteneur. Renvoie une fonction de démontage. */
  monter (hote: HTMLElement, doc: DocumentEuropa<C>, ctx: Contexte): () => void
}

export interface Contexte {
  /** À appeler dès qu'une modification doit être retenue. */
  marquerModifie (): void
  /** Enregistre le fichier sur le disque de l'utilisateur. */
  enregistrer (): void
}

const registre = new Map<NomModule, Module<any>>()

export function enregistrerModule (m: Module<any>): void {
  if (registre.has(m.nom)) throw new Error(`Module déjà enregistré : ${m.nom}`)
  registre.set(m.nom, m)
}

export function obtenirModule (nom: NomModule): Module<any> | undefined {
  return registre.get(nom)
}

export function modulesDisponibles (): Module<any>[] {
  return [...registre.values()]
}
