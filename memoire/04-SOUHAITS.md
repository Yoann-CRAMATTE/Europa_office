# Souhaits de Yoann — cahier des charges en cours

> Prise de notes en cours de dictée. **Rien n'est implémenté à partir de ce
> fichier tant que la liste n'est pas complète et validée.**
> Les points arrivent dans l'ordre où Yoann les donne.

**Ouvert le :** 13/09/2026
**Statut :** en cours de recueil — points suivants attendus

---

## Point 1 — Un seul fichier HTML pour toute la suite

**Dit :** « Je veux un seul fichier HTML qui sert d'office, on supprime le lien
vers l'extérieur et on garde le système de codage. Si l'utilisateur va le coder
avec un mot de passe. »

**Ce que je retiens :**

1. **Un fichier unique = toute la suite**, pas un fichier par type de document.
   Le même fichier HTML sait ouvrir et éditer tous les types (texte, tableur,
   diapos, notes). C'est l'office entier dans un fichier.

2. **Aucun lien vers l'extérieur.** Zéro requête réseau : pas de télémétrie, pas
   de vérification de mise à jour, pas de CDN, pas de police distante.
   Confirme et renforce la décision D-002.

3. **Chiffrement conservé, au choix de l'utilisateur.** Le mot de passe est
   optionnel : l'utilisateur décide de protéger son document ou non. Le mécanisme
   déjà en place (AES-GCM 256 / PBKDF2-SHA256) est conservé.

**Écart avec l'existant à arbitrer :**
La décision D-003 dit aujourd'hui l'inverse : « un document n'embarque que son
module », pour limiter le poids. Le point 1 demande l'office complet dans chaque
fichier. Les deux ne peuvent pas tenir ensemble.
→ Conséquence à mesurer et à assumer : chaque document pèsera le poids de la
suite entière, quel que soit son contenu. À trancher une fois tous les points
recueillis. Ne rien modifier avant.

**Questions restées ouvertes (à poser plus tard, pas maintenant) :**
- Un fichier vierge « application » d'où l'on crée des documents, ou bien chaque
  document est-il lui-même l'office complet ?
- Le mot de passe protège-t-il le document seul, ou l'accès à l'application ?

---

## Point 2 — Un format de sortie commun à tous les modules

**Dit :** « Il faut qu'on trouve un format de fichier de sortie qui permette de
maximiser le rendement entre l'équivalent Word, l'équivalent Excel, l'équivalent
PowerPoint et les futurs équivalents. »

**Ce que je retiens :**

Un seul modèle de données partagé par tous les modules, plutôt que quatre formats
étanches. C'est le bon réflexe, et c'est structurant : pris trop tard, il oblige à
tout réécrire.

**Ce que ça apporte concrètement, si le format est vraiment commun :**

- Un tableau créé dans le tableur se colle dans le document texte sans conversion,
  et reste un tableau vivant.
- Un titre, une couleur, une police se définissent une fois et valent partout :
  les styles nommés sont partagés entre modules.
- Un module nouveau (base de données, formulaire, diagramme) réutilise l'existant
  au lieu de repartir de zéro.
- Le code de sérialisation, d'annulation/rétablissement, de recherche et de
  chiffrement s'écrit **une seule fois** dans le noyau.

**Ambiguïté à lever — trois lectures possibles de « rendement » :**

1. **Mutualisation du code** — un maximum de logique partagée entre modules.
2. **Compacité du fichier** — le format produit les fichiers les plus légers.
3. **Fidélité des échanges** — un contenu passe d'un module à l'autre, et vers
   Word/Excel/PowerPoint, sans rien perdre.

Ces trois objectifs tirent dans des directions différentes et ne se maximisent pas
ensemble. À arbitrer.

**Pistes techniques relevées, à départager plus tard :**

- **Modèle en blocs universel.** Tout contenu est un bloc typé (paragraphe,
  cellule, image, tableau, diapositive), avec des propriétés communes et des
  propriétés propres au type. Un tableau est le même objet, qu'il vive dans un
  document texte, une feuille de calcul ou une diapositive. C'est la piste la plus
  prometteuse pour le sens 1 et le sens 3.
- **Séparation stricte contenu / mise en forme.** Le contenu ne porte que des
  références à des styles nommés, définis une seule fois dans le document.
- **Grille partagée.** Le tableur, les tableaux du traitement de texte et la mise
  en page des diapositives reposent sur le même moteur de grille.

**Point de vigilance :** un format trop universel devient un plus petit
dénominateur commun, incapable d'exprimer les spécificités de chaque module
(les formules et le graphe de dépendances du tableur, la pagination du texte).
Le format devra prévoir des zones propres à chaque module que les autres
transportent sans les comprendre.

### Point 2 bis — Format JSON, extension `.eo`

**Dit :** « Toujours dans le point deux, le format pourrait être de type JS ou
JSON, mais avec une extension de type `.eo`. »

**Ce que je retiens :** JSON pour la structure, `.eo` pour l'extension
(Europa Office).

**JSON plutôt que JS — tranché, et c'est important.**
JSON est de la donnée inerte. Un fichier `.js` est du **code exécutable** : un
document reçu par courriel pourrait alors exécuter n'importe quoi à l'ouverture.
Ce serait la faille de sécurité majeure du projet. JSON, et rien d'autre.
Le format actuel (`application/europa+json`) est déjà conforme.

**Conflit réel entre l'extension `.eo` et le point 1 :**

Le point 1 veut un fichier qu'on ouvre par double-clic, sans rien installer.
Or un fichier nommé `budget.eo` n'est associé à aucun logiciel : au double-clic,
le système demande « avec quoi ouvrir ? » et le navigateur peut refuser de
l'interpréter comme du HTML. L'extension `.html` est ce qui rend le double-clic
possible. Les deux souhaits ne tiennent pas ensemble tels quels.

**Trois sorties possibles, à arbitrer :**

| Option | Ce qu'on gagne | Ce qu'on perd |
|---|---|---|
| **`budget.eo.html`** — double extension | double-clic conservé, identité `.eo` visible dans le nom | l'extension réelle reste `.html` |
| **`.eo` pur** | identité propre et nette | exige une association système, donc une installation : contredit le point 1 |
| **`.eo` = document seul, sans moteur** | fichier minuscule (quelques Ko), idéal pour archiver, échanger, versionner | nécessite l'application pour être ouvert |

**Piste recommandée : les deux formats, chacun son rôle.**

- `.eo.html` — le document complet et autonome, celui qu'on envoie et qu'on
  double-clique. C'est le format de tous les jours.
- `.eo` — le document nu en JSON, sans le moteur. Sert à l'archivage longue durée,
  à l'échange entre systèmes, au suivi de version, et à l'édition par un outil
  tiers ou un agent. L'application sait ouvrir et produire les deux.

Un même contenu, deux emballages. Le JSON à l'intérieur est strictement identique :
un `.eo.html` privé de son moteur redonne exactement le `.eo`.

**À confirmer par Yoann plus tard :** cette piste te convient-elle, ou tiens-tu à
`.eo` comme extension unique ?

---

## Point 3 — Interface calquée sur celle de Bento

**Dit :** « On va partir sur une interface qui ressemble à celle que je t'ai donnée
via le fichier modèle Bento. »

**Correction préalable — erreur de ma première analyse.**
J'avais dit que ce fichier était un modèle vierge sans contenu. Le bloc de
données est bien vide, mais c'était une conclusion fausse en pratique : le
runtime contient un deck de démonstration codé en dur (fonction `u2()`,
« Bento Slides Showcase », une douzaine de diapositives) qu'il affiche quand le
bloc est vide. Ouvert dans un navigateur, le fichier montre donc une présentation
complète et une interface d'édition entière. Rien n'a été perdu.

### Interface relevée, écran par écran

Disposition en trois colonnes, thème **clair**, une seule couleur d'accent
(corail `#FF9E8A`) sur un fond blanc cassé.

**Barre supérieure**
`logo · titre du document éditable · pastille du nom de fichier · annuler /
rétablir · outils d'insertion (Texte, Forme, Image, Média, Tableau, Graphique,
Commentaire) · imprimer · Partager · Enregistrer (avec menu déroulant) ·
langue · aide`

Les outils d'insertion sont au centre, en accès direct : un clic, pas un menu.

**Colonne gauche — navigateur de document**
Miniatures numérotées, rendu réel et miniaturisé du contenu (pas une icône
générique). Entre deux miniatures apparaît une poignée `+` d'insertion au survol.
La colonne se replie par une languette `‹`.

**Centre — le canevas**
Le document sur fond quadrillé discret. Zoom en bas à droite (`−` `71 %` `+`) et
bouton de lancement du diaporama. Manipulation directe des éléments : sélection,
déplacement, redimensionnement.

**Colonne droite — panneau de propriétés contextuel**
Sections repliables dépendant de la sélection : `DIAPOSITIVE` (format, fond,
transition, masquer), `DIAPORAMA`, `INTERACTIVITÉ`, `DISPOSITION`,
`NOTES DE L'ORATEUR` (zone de saisie libre). Se replie par une languette `›`.

### Ce que je retiens pour Europa

1. **Trois colonnes repliables** — navigateur à gauche, canevas au centre,
   propriétés à droite. Cette structure vaut pour les trois modules : la colonne
   gauche liste les diapositives, ou les pages, ou les feuilles de calcul.
2. **Panneau de propriétés contextuel** — le contenu du panneau dépend de ce qui
   est sélectionné. C'est ce qui évite les menus à tiroirs.
3. **Insertion en accès direct** dans la barre supérieure, pas enfouie.
4. **Miniatures vivantes** — un rendu réel réduit, pas une icône.
5. **Thème clair** avec une seule couleur d'accent.
   → Le socle actuel d'Europa est en thème **sombre** : à basculer. Prévoir les
   deux et suivre le réglage du système.
6. **Manipulation directe** sur le canevas, avec zoom.

### Écart à traiter

Bento est un éditeur de canevas libre : on pose des objets où l'on veut. Un
traitement de texte est un flux qui se recompose, un tableur est une grille.
La même ossature à trois colonnes les accueille tous, mais **le centre change de
nature selon le module**. C'est le noyau qui fournit l'ossature et le panneau de
propriétés ; chaque module fournit son centre.

### Réserve

Bento s'appuie sur `moveable` et `selecto` (MIT) pour la manipulation d'objets.
Refaire cela de zéro est coûteux. À décider : reprendre ces bibliothèques, ou
écrire notre propre couche plus légère. Ce choix pèse sur le budget de poids.

---

## Point 4 — (à venir)
