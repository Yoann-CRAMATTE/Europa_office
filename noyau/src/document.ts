// Modèle de document commun à tous les modules de la suite.
// Un document Europa est du JSON. Les modules n'en définissent que `contenu`.

export type NomModule = 'texte' | 'tableur' | 'diapos' | 'notes' | 'dessin'

export interface DocumentEuropa<C = unknown> {
  /** Version du conteneur. Sert à migrer les fichiers anciens. */
  format: 'europa/1'
  /** Module qui sait interpréter `contenu`. */
  module: NomModule
  titre: string
  /** Date ISO 8601 de création. */
  cree: string
  /** Date ISO 8601 de la dernière écriture. */
  modifie?: string
  auteur?: string
  /** Charge utile propre au module. Le noyau ne l'inspecte jamais. */
  contenu: C
  /** Ressources binaires (images, polices) en data-URI, adressées par clé. */
  ressources?: Record<string, string>
}

export function documentVierge (module: NomModule, titre: string): DocumentEuropa {
  return {
    format: 'europa/1',
    module,
    titre,
    cree: new Date().toISOString(),
    contenu: []
  }
}

/** Vérifie qu'un objet inconnu est un document exploitable. Lance sinon. */
export function valider (valeur: unknown): DocumentEuropa {
  if (typeof valeur !== 'object' || valeur === null) {
    throw new Error('Document illisible : ce n’est pas un objet JSON.')
  }
  const d = valeur as Partial<DocumentEuropa>
  if (d.format !== 'europa/1') {
    throw new Error(`Format inconnu : ${String(d.format)}. Attendu : europa/1.`)
  }
  if (typeof d.module !== 'string') {
    throw new Error('Document sans module : impossible de savoir quoi l’ouvrir avec.')
  }
  return d as DocumentEuropa
}
