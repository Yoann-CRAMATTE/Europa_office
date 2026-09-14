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
**Statut :** ~~actée~~ **REMPLACÉE par D-006** · 14/09/2026

L'empaqueteur ne met dans un fichier que le module nécessaire à ce document.

*Pourquoi :* sans cette règle, chaque document pèse le poids de la suite entière.

*Conséquence à traiter :* ouvrir un document `tableur` avec une construction qui
ne contient que `notes` produit une erreur explicite. Un mécanisme de récupération
reste à concevoir.

*Pourquoi elle tombe :* les points 1, 4 et 11 du cahier des charges demandent
l'inverse — un seul fichier portant toute la suite, et le regroupement primant sur
la légèreté. Voir D-006.

---

## D-004 — Quel module métier en premier ?
**Statut :** EN ATTENTE — à reprendre à la lumière du cahier des charges

*Remarque du 14/09 :* la question posée ci-dessous précédait le recueil des
souhaits. Le point 15 désigne désormais un cas d'essai de référence — la
réclamation pour surconsommation — qui appelle plusieurs modules à la fois.
L'ordre de construction est donc à redéfinir à partir de ce cas, et non du seul
critère de l'effort.

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

---

## D-005 — Le vocabulaire du projet
**Statut :** actée · 14/09/2026 — tranchée par Yoann

**Trois niveaux :** un **classeur** est le fichier entier ; un **onglet** est un
document d'un type donné dans ce classeur ; une **feuille** est une unité à
l'intérieur d'un onglet.

**Six modules :** Texte, Tableur, Data, Diapos, Formulaire, PDF.

Le noyau et le format de fichier ne connaissent que le mot « feuille ». Chaque
module l'affiche sous son nom d'usage : page, feuille de calcul, vue,
diapositive, section.

*Pourquoi ces noms :* ils se comprennent sans rien apprendre. Et ils évitent les
marques déposées — Word, Excel et PowerPoint désignent les logiciels de
quelqu'un d'autre, on ne s'en sert ni pour nommer ni pour décrire.

*Portée :* interface, documentation, code, commentaires et messages d'erreur.
Ces mots-là et pas d'autres.

---

## D-006 — Chaque classeur embarque toute la suite
**Statut :** actée · 14/09/2026 — remplace D-003

Un fichier Europa contient les six modules, quel que soit le nombre d'onglets
qu'il porte.

*Pourquoi :* points 1, 4 et 11 du cahier des charges. Un classeur peut recevoir
un onglet de n'importe quel type à tout moment ; un fichier qui n'embarquerait
que ses modules du jour deviendrait illisible dès qu'on y ajouterait autre chose.
Et le but énoncé au point 13 est de tenir un projet entier dans un fichier, pas
de produire des fichiers légers.

*Ce qu'on accepte en échange :* des fichiers de quelques centaines de kilooctets
à quelques mégaoctets, même pour un classeur d'un seul onglet.

*Le critère qui remplace le poids :* le fichier s'ouvre-t-il en un temps
acceptable, et se transmet-il encore par courriel ? Les budgets par module
inscrits dans `01-ARCHITECTURE.md` sont caducs et ce document est à réviser.
