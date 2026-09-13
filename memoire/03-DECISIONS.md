# Décisions d'architecture

Une décision par section. On n'efface jamais : on ajoute une décision qui
remplace la précédente, en la marquant « remplacée ».

---

## D-001 — Fichier unique autonome, pas d'application web
**Statut :** actée · 13/09/2026

Chaque document embarque son moteur. Pas de serveur, pas de compte, pas de CDN.

*Pourquoi :* c'est le seul modèle où un document reste lisible dans dix ans sans
dépendre de la survie d'un service. Un fichier sur une clé USB suffit.

*Ce qu'on accepte en échange :* des fichiers plus lourds, pas d'édition
collaborative en temps réel, pas de réécriture en place du fichier ouvert.

---

## D-002 — Aucune télémétrie, aucun appel réseau
**Statut :** actée · 13/09/2026

Le fichier `bento/slides` analysé contactait Cloudflare Insights à chaque
ouverture et vérifiait ses mises à jour en ligne. Europa n'aura ni l'un ni l'autre.

*Pourquoi :* un document bureautique peut contenir des données personnelles ou
professionnelles. Il n'a aucune raison de signaler son ouverture à qui que ce soit.
C'est aussi une condition d'usage en administration.

*Comment c'est tenu :* le test de fumée échoue si la moindre requête réseau part.

---

## D-003 — Un document n'embarque que son module
**Statut :** actée · 13/09/2026

L'empaqueteur ne met dans un fichier que le module nécessaire à ce document.

*Pourquoi :* sans cette règle, chaque document pèse le poids de la suite entière.

*Conséquence à traiter :* ouvrir un document `tableur` avec une construction qui
ne contient que `notes` produit une erreur explicite. Un mécanisme de récupération
reste à concevoir.

---

## D-004 — Quel module métier en premier ?
**Statut :** EN ATTENTE — décision de Yoann

Options :

| Option | Effort | Intérêt | Risque principal |
|---|---|---|---|
| **Texte** | élevé | usage quotidien, base des courriers et rapports | moteur de pagination et d'impression |
| **Tableur** | très élevé | le plus différenciant | moteur de formules et graphe de dépendances |
| **Diapos** | moyen | terrain déjà balisé par Bento | faible valeur ajoutée face à l'existant |
| **Notes enrichies** | faible | livrable rapide, socle du module Texte | ambition limitée |

*Recommandation :* **Texte**, en deux temps. D'abord un éditeur riche non paginé
(le gros du travail utile), puis la pagination et l'impression. Le tableur ensuite,
en réutilisant la grille pour les tableaux du module Texte.
