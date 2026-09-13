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

## Point 4 — Un classeur d'onglets typés, qui interagissent

**Dit :** « Je veux que dans un même fichier on puisse faire un équivalent Excel,
PDF... On pourrait très bien avoir un système comme sous Excel où on a un onglet
qui correspond à Word, l'onglet suivant qui correspond à un PDF, l'onglet suivant
à un PowerPoint, l'onglet suivant un deuxième Word, etc. Chaque onglet qu'on va
créer aura une fonction. Je vois quelque chose comme un plus qui permet de créer
un onglet, et après on lui attribue ce que c'est : Word, Excel, etc. Et donc on
peut faire vivre dans un seul fichier plusieurs Word, Excel, PDF, etc. qui
interagissent ensemble. »

**Ce que je retiens :**

Le fichier n'est pas un document, c'est un **classeur**. Une barre d'onglets en
bas, comme les feuilles d'Excel. Un bouton `+` ajoute un onglet, et l'on choisit
alors son type. Plusieurs onglets peuvent partager le même type : deux textes,
trois feuilles de calcul, dans le même fichier.

C'est le point le plus structurant de toute la liste. Il tranche et éclaire les
précédents :

- il **confirme le point 1** : un seul fichier porte toute la suite ;
- il **donne sa raison d'être au point 2** : sans format commun, des onglets de
  types différents ne peuvent pas interagir ;
- il **annule la décision D-003** : tous les modules sont embarqués, sans
  discussion possible.

**« Qui interagissent ensemble » — c'est là qu'est la valeur.**

C'est ce qu'Office fait mal : coller un tableau Excel dans Word produit une copie
morte, ou un objet lié fragile qui casse dès que le fichier bouge. Ici tout vit
dans le même fichier, donc un lien entre onglets ne peut pas se rompre.

Ce que cela permet, concrètement :
- une cellule d'un texte qui affiche un total calculé dans une feuille de calcul,
  et qui se met à jour toute seule ;
- un graphique dans une présentation nourri par un tableau d'un autre onglet ;
- un tableau récapitulatif qui agrège plusieurs onglets ;
- un chiffre cité dans trois onglets, corrigé une seule fois.

Cela suppose un mécanisme de **référence entre onglets**, du type
`onglet:cellule` ou `onglet:élément`, et un graphe de dépendances tenu par le
noyau — pas par les modules. C'est la brique centrale à concevoir.

**Ambiguïté à lever — que veut dire « un onglet PDF » ?**

PDF n'est pas un type d'éditeur, c'est un format de sortie figé. Deux lectures :

| Lecture | Ce que ça veut dire | Effort |
|---|---|---|
| **Onglet à destination PDF** | un document mis en page pour l'impression, exporté en PDF | moyen |
| **PDF importé** | un PDF existant, affiché et annoté dans l'onglet | élevé — il faut embarquer un moteur de rendu PDF |

Les deux sont défendables, mais ce ne sont pas les mêmes chantiers.
→ **Question à poser à Yoann** une fois la liste terminée.

**Conséquences à assumer :**

1. **Le poids.** Chaque fichier porte tous les modules, même un classeur d'un seul
   onglet. Ordre de grandeur visé, à tenir : environ 300 à 500 Ko à vide. C'est
   dix fois moins qu'un `.docx` vide ouvert dans Word, mais cinquante fois plus
   que le socle actuel. Cela reste tout à fait envoyable par courriel.
2. **Le modèle de document change.** `module` au niveau racine disparaît : le
   document devient une liste d'onglets, chacun portant son type et son contenu.
   La refonte est à faire avant d'écrire le moindre module métier.
3. **Le noyau grossit.** Il porte désormais la barre d'onglets, les références
   entre onglets et le graphe de dépendances. Ce n'est plus un simple aiguilleur.

**Question ouverte (plus tard) :** le mot de passe du point 1 protège-t-il le
classeur entier, ou peut-on chiffrer un onglet en particulier ?

---

## Point 5 — Images converties en SVG

**Dit :** « Pour toute image importée, par exemple dans un Word, je veux que
celle-ci soit automatiquement transformée en SVG. Comme ça on ne stocke pas une
image dans le rendu de sortie mais bien du code, et après on ajuste avec un
coefficient de grossissement et la position de l'image dans le document. »

**L'objectif est juste. Le moyen ne marche pas pour toutes les images.**

### Ce qui ne tient pas

SVG est un format **vectoriel** : des formes décrites mathématiquement. Une photo
est une image **matricielle** : une grille de pixels. Il n'existe aucune
conversion fidèle de l'une vers l'autre.

Deux façons de « mettre une photo en SVG », et aucune ne donne ce qui est
recherché :

1. **Envelopper le bitmap** — `<svg><image href="data:image/jpeg;base64,…"/></svg>`.
   C'est un SVG, mais il contient toujours la photo entière. Zéro gain de poids,
   et le grossissement reste flou. Emballage, pas conversion.
2. **Vectoriser réellement** (Potrace, ImageTracer) — l'algorithme redessine
   l'image en tracés. Sur une photographie, cela produit soit une bouillie
   méconnaissable, soit des dizaines de milliers de tracés : le SVG devient
   **plus lourd que la photo d'origine**, couramment de cinq à cinquante fois.
   C'est l'inverse de l'effet recherché.

**Et le bénéfice visé n'a pas besoin du SVG.** Coefficient d'agrandissement et
position sont des propriétés du document, pas du format d'image. Une image
matricielle les porte déjà. Le seul avantage réel du vectoriel est la netteté à
n'importe quelle échelle, et à l'impression.

### Ce que je propose à la place — conversion conditionnelle

Le bon réflexe est de regarder **ce qu'est l'image** avant de décider :

| Nature de l'image | Traitement | Ce qu'on y gagne |
|---|---|---|
| Logo, dessin au trait, schéma, icône, capture d'écran à aplats | **vectorisation en SVG** | plus léger *et* net à toute échelle — le souhait est pleinement atteint |
| Photographie, dégradé, texture | **conservée en matriciel**, recompressée en WebP ou AVIF et redimensionnée à la taille d'affichage utile | souvent cinq à dix fois plus léger que l'original, sans perte visible |

La détection peut être automatique : nombre de couleurs distinctes, proportion de
zones uniformes, netteté des contours. Ces indicateurs séparent très bien un logo
d'une photo. En cas de doute, proposer le choix à l'utilisateur avec un aperçu
des deux résultats et leurs poids respectifs.

**Dans les deux cas, le document manipule le même objet** : une ressource, un
coefficient d'échelle, une position. Le module ne sait pas, et n'a pas besoin de
savoir, si la ressource est vectorielle ou matricielle. Le souhait de Yoann est
donc tenu du point de vue de l'usage.

### Risque de sécurité à ne pas manquer

Un fichier SVG peut contenir du JavaScript (`<script>`, attributs `onload`,
`href` en `javascript:`). Importer un SVG venu de l'extérieur dans un document
ouvrirait exactement la faille écartée au point 2 bis en refusant le format JS.

**Règle à poser :** tout SVG entrant est assaini avant d'être stocké — scripts,
gestionnaires d'événements et références externes retirés. Un SVG produit par
notre propre vectorisation est sûr par construction ; un SVG importé ne l'est
jamais.

### À faire avant de trancher

Mesurer sur des cas réels : un logo, un organigramme, une capture d'écran, une
photo. Comparer poids d'origine, poids vectorisé, poids recompressé, et rendu
visuel. Trois chiffres et quatre images trancheront le débat mieux que ce texte.
**À faire quand la liste des points sera close.**

---

## Point 6 — Onglet « data », références par case, grille créée à la demande

**Dit :** « On va ajouter dans les onglets un format qu'on pourrait appeler data,
qui lui ne sert qu'à faire des tableaux de données, car le Excel te fera un
tableau mais peut faire aussi une espèce d'affichage. Je veux que dans un onglet
Word je puisse appeler un onglet Excel et la case A2. Dans un équivalent Excel ou
data, on ne crée pas tout de suite des milliers de lignes et de colonnes, on les
crée au fur et à mesure du besoin pour alléger le fichier. »

Trois demandes distinctes.

### 6.1 — Un type d'onglet « data », séparé du tableur

L'intuition est bonne et rarement tenue par les suites existantes : séparer la
**donnée** de l'**espace de calcul**. Encore faut-il que la frontière soit nette,
sinon l'utilisateur ne saura jamais lequel des deux choisir.

Frontière proposée :

| | **data** | **tableur** |
|---|---|---|
| Nature | une table structurée | une grille libre |
| Colonnes | typées et nommées : texte, nombre, date, booléen, liste de choix, lien vers un autre onglet | aucune, on écrit où l'on veut |
| Mise en forme | aucune par cellule, l'apparence vient du type | libre, cellule par cellule |
| Formules | calculs par colonne | formules libres dans chaque cellule |
| Rôle | **la source de vérité** | **l'espace de travail** |

Le type des colonnes n'est pas un détail de confort : il garantit qu'une colonne
« montant » ne contiendra jamais « environ 300 € », et c'est ce qui rend les
totaux et les références fiables.

Conséquence utile : `data` devient la cible naturelle des références entre
onglets, et le point d'entrée d'un futur import de données extérieures.

### 6.2 — Référencer une case d'un autre onglet

Confirme et précise le point 4. Une écriture du type `Budget!A2` dans un onglet
texte, un calcul ou une présentation.

**Piège à traiter dès la conception : que devient `A2` si l'on insère une ligne
au-dessus ?**

Une référence par coordonnées se décale silencieusement, et le document affiche
alors la mauvaise valeur sans rien signaler. C'est le défaut le plus courant de
ce genre de mécanisme.

Réponse : **chaque ligne et chaque colonne portent un identifiant interne
stable**, invisible pour l'utilisateur. La référence pointe sur cet identifiant.
`A2` n'est qu'un affichage, recalculé à chaque déplacement. Insérer, déplacer ou
trier ne casse alors plus rien. Supprimer la cible doit produire une erreur
visible, jamais une valeur fausse.

Dans un onglet `data`, la référence sera plus lisible encore, par nom de colonne
plutôt que par lettre : `Budget.montant` sur une ligne identifiée.

### 6.3 — Grille créée au fur et à mesure

Bon réflexe, et c'est ainsi que procèdent les moteurs sérieux. **Deux problèmes
distincts** se cachent derrière cette demande, et il faut les traiter tous les
deux :

1. **Le stockage.** Ne mémoriser que les cellules réellement remplies, sous forme
   de dictionnaire (`{"A2": …, "D17": …}`) et non de matrice. Une feuille de dix
   cellules utiles pèse dix cellules, quelle que soit la taille apparente de la
   grille. C'est ce que demande Yoann, et c'est acquis.
2. **L'affichage.** Moins évident, et tout aussi décisif : une grille de dix mille
   cellules affichées d'un coup, ce sont dix mille éléments dans la page, et un
   navigateur à genoux. Il faut n'afficher que les cellules réellement visibles à
   l'écran et les recycler au défilement. Sans cela, le fichier reste léger mais
   l'application devient inutilisable.

Le premier allège le fichier, le second garde l'application vivante. Les deux
sont à prévoir.

### 6.4 — Précision de Yoann sur le stockage creux

**Dit :** « Imaginons que j'ai une case remplie en A1 et une autre case remplie en
ZZ1, on ne va pas afficher toutes les cases vides dans le fichier entre les deux.
Il faut qu'on puisse dire au fichier : il y a une donnée là, une autre donnée là.
Ça optimise le chargement. »

**Acté.** C'est bien le stockage creux décrit en 6.3, et l'exemple en donne la
mesure : entre `A1` et `ZZ1` il y a **702 colonnes**. Une grille pleine
enregistrerait 702 cellules pour deux valeurs utiles. Un stockage creux en
enregistre deux. Le fichier est 351 fois plus petit sur cette ligne, et il y a
351 fois moins de JSON à lire à l'ouverture — le gain porte donc bien sur le
poids **et** sur le temps de chargement, comme Yoann le relève.

**Point à concilier avec le 6.2.** La clé de stockage ne peut pas être `"A1"` :
cette notation se décale dès qu'on insère une ligne ou une colonne, ce qui est
exactement le piège écarté plus haut. La clé doit reposer sur les identifiants
stables.

Forme envisagée, qui reste lisible à l'œil nu dans le JSON :

```json
{
  "colonnes": [{ "id": "c1", "nom": "Poste" }, { "id": "c9", "nom": "Montant" }],
  "lignes":   [{ "id": "l1" }, { "id": "l2" }],
  "cellules": {
    "l1:c1": { "v": "Fournitures" },
    "l1:c9": { "v": 1240.5 }
  }
}
```

Seules les cellules remplies figurent dans `cellules`. `A1` reste ce que
l'utilisateur voit ; `l1:c1` est ce que le fichier retient. L'ordre d'affichage
vient de l'ordre des listes `colonnes` et `lignes`, ce qui rend le déplacement et
le tri gratuits : on réordonne la liste, aucune cellule ne bouge.

---

## Point 7 — L'onglet data comme micro base de données, et la balise d'appel

**Dit :** « Je reviens sur la différence entre un tableau Excel et un tableau
data, il faudra bien le notifier. Je tiens à garder ce tableau data qui permet
d'avoir une espèce de micro base de données pure et dure. Si je dis que la
colonne B c'est une somme, toute la colonne B ne peut être qu'une somme. On
pourrait avoir une ligne d'en-tête directement et une ligne qu'on appelle de
somme, obligatoire. Ce qui permet de dire dans un Word que le chiffre d'affaires
est égal, et là on met une balise qui fait directement appel à la case de l'onglet
data, ligne somme, colonne B. »

### Reformulation, pour vérifier que j'ai bien compris

Un onglet `data` n'est pas une feuille de calcul : c'est une **table**, avec une
forme imposée qui ne se négocie pas.

1. **Une ligne d'en-tête, toujours présente.** On ne peut ni la supprimer ni
   écrire ailleurs sans passer par elle. Elle nomme les colonnes.
2. **Chaque colonne porte un type, déclaré une fois.** Si la colonne B est
   déclarée « montant », alors chaque cellule de la colonne B est un montant. On
   ne peut pas y écrire du texte libre. Le type n'est pas une suggestion, c'est une
   contrainte que le module fait respecter.
3. **Une ligne de total, toujours présente en bas.** Elle n'est pas saisie par
   l'utilisateur : elle est calculée. Pour une colonne de montants, elle donne la
   somme.
4. **Dans un onglet texte, on n'écrit pas le chiffre : on pose une balise.** On
   tape « Le chiffre d'affaires est de », puis on insère une balise qui pointe sur
   le total de la colonne B de l'onglet data. Le texte affiche la valeur, mais le
   fichier ne retient que la référence. La donnée change dans le tableau, la phrase
   se met à jour toute seule.

C'est une **base de données miniature** : des colonnes typées, des contraintes
respectées, des agrégats calculés — et un texte qui cite la donnée au lieu de la
recopier.

### Pourquoi c'est plus solide que ça n'en a l'air

La ligne de total étant **structurelle**, la référence qui la vise ne porte pas
sur une position mais sur un rôle : « le total de la colonne Montant », et non
« la ligne 47 ». Ajouter cent lignes de données ne la déplace pas.

Cela règle par construction le piège du point 6.2 : il n'y a plus rien à décaler.
C'est la forme de référence la plus robuste du projet, et elle doit être la voie
recommandée pour citer un chiffre dans un texte.

### Ce qui reste à préciser

**Le mot « somme » recouvre deux choses**, et il faut les séparer :

- le **type** de la colonne : texte, nombre, **montant**, date, booléen, choix,
  lien vers un autre onglet ;
- l'**agrégat** affiché en bas de cette colonne : somme, moyenne, minimum,
  maximum, nombre de valeurs, ou aucun.

Une colonne « montant » proposera la somme par défaut, mais on doit pouvoir
demander la moyenne à la place. Deux réglages distincts, pas un seul.

**Question ouverte :** que fait la ligne de total sous une colonne de texte ?
Rien, un décompte, ou la case reste vide ? À trancher.

### « Il faudra bien le notifier » — comment distinguer les deux à l'écran

Pour que l'utilisateur ne confonde jamais les deux types d'onglets :

- **une icône et une couleur propres** à chaque type dans la barre d'onglets ;
- **une apparence différente** : l'onglet data montre des en-têtes de colonnes
  nommées et typées, pas des lettres A, B, C ; ses lignes sont numérotées mais ses
  colonnes portent des noms ;
- **le type visible dans l'en-tête de chaque colonne**, sous forme de petite
  mention ou de pictogramme ;
- **un refus explicite et expliqué** quand on saisit une valeur qui ne respecte
  pas le type, plutôt qu'une acceptation silencieuse ;
- **une aide au choix** au moment de créer l'onglet : « données structurées » ou
  « feuille de calcul libre », avec une phrase disant à quoi sert chacune.

### 7.1 — Les types de colonne, validés par Yoann

**Dit :** « Oui tu as raison pour les types de colonne, il faudra cette somme si
c'est une date, du booléen ou autre. »

**Acté :** la distinction entre le **type** d'une colonne et l'**agrégat** affiché
en bas est retenue, et chaque type appelle ses propres agrégats. Une date ne
s'additionne pas, un booléen non plus — mais tous deux ont un résumé qui a du sens.

Ce qui répond du même coup à la question laissée ouverte au point 7 : sous une
colonne de texte, la ligne de total affiche un **décompte**, pas une case vide.

### Types à prévoir, et ce que chacun résume

| Type | Contient | Agrégats possibles | Par défaut |
|---|---|---|---|
| **Texte** | texte libre | nombre de valeurs, nombre de valeurs distinctes, nombre de vides | nombre de valeurs |
| **Nombre** | entier ou décimal | somme, moyenne, médiane, minimum, maximum, décompte | somme |
| **Montant** | nombre + devise | somme, moyenne, minimum, maximum | **somme** |
| **Pourcentage** | nombre affiché en % | moyenne, minimum, maximum | moyenne |
| **Date** | une date | plus ancienne, plus récente, étendue en jours | étendue |
| **Date et heure** | date + heure | idem | étendue |
| **Durée** | une durée | somme, moyenne, minimum, maximum | somme |
| **Booléen** | oui / non | nombre de oui, part de oui en % | nombre de oui |
| **Choix** | une valeur d'une liste fermée | répartition par valeur, valeur la plus fréquente | répartition |
| **Choix multiple** | plusieurs valeurs d'une liste | répartition par valeur | répartition |
| **Lien** | renvoi vers une ligne d'un autre onglet | nombre de liens, nombre de cibles distinctes | nombre de liens |
| **Calcul** | résultat d'une formule sur la ligne | ceux du type produit par la formule | selon le résultat |
| **Texte contraint** | courriel, adresse web, téléphone | nombre de valeurs, nombre d'invalides | nombre de valeurs |

**Deux règles qui découlent de ce tableau :**

1. **L'agrégat proposé dépend du type** — on ne propose jamais « somme » sous une
   colonne de dates. La liste offerte à l'utilisateur est filtrée par le type,
   ce qui rend l'erreur impossible plutôt que signalée.
2. **Chaque agrégat est citable depuis un texte.** La balise du point 7 ne vise
   pas seulement une somme : « le chiffre d'affaires est de », mais aussi « la
   commande la plus ancienne date du », ou « 68 % des dossiers sont traités ».

**Reste à trancher plus tard :** peut-on afficher plusieurs agrégats sous une même
colonne — par exemple somme et moyenne côte à côte — ou un seul par colonne ?

---

## Point 8 — L'onglet PDF sert à produire des formulaires remplissables

**Dit :** « Je t'ai dit que je voulais un onglet PDF : ça permet de créer des PDF
avec des champs remplissables. »

**Ambiguïté du point 4 levée.** C'est bien la première lecture : l'onglet PDF est
une **destination de production**, pas un lecteur de PDF importés. Mais avec une
exigence supplémentaire que je n'avais pas envisagée : le PDF produit n'est pas
figé, il contient des **champs interactifs** que le destinataire remplit dans son
propre lecteur.

### Ce que cela suppose techniquement

Un PDF interactif repose sur un mécanisme normalisé appelé AcroForm : champs de
texte, cases à cocher, boutons radio, listes déroulantes, et le cas échéant zone
de signature. Il faut donc écrire nous-mêmes ce mécanisme dans le fichier PDF
produit, depuis le navigateur, hors ligne.

**Faisable**, deux voies :

| Voie | Poids | Ce qu'on y gagne, ce qu'on y perd |
|---|---|---|
| **`pdf-lib`** (MIT) | environ 300 à 400 Ko | sait déjà tout faire, éprouvé — mais pèse presque autant que le budget total visé pour la suite |
| **Générateur maison** | 40 à 80 Ko estimés | maîtrise du poids et du résultat — mais c'est un vrai chantier, et l'embarquement des polices en est la partie délicate |

**À trancher plus tard**, en mesurant. Il n'est pas exclu de commencer avec
`pdf-lib` pour valider l'usage, puis de le remplacer une fois le besoin réel connu.

### La question des polices

Pour être fidèle partout, un PDF doit embarquer ses polices. Sans cela, on se
limite aux quatorze polices standard du format (Helvetica, Times, Courier et
leurs variantes), qui n'ont pas besoin d'être embarquées et affichent
correctement les accents français.

Compromis proposé pour commencer : polices standard uniquement, donc PDF légers
et compatibles partout. L'embarquement de polices viendra ensuite, quand le
besoin typographique se fera sentir.

### L'usage que ce point ouvre, et que Yoann n'a pas encore formulé

Si un onglet PDF peut produire un formulaire, et qu'un onglet `data` contient des
lignes typées, alors **un formulaire peut être pré-rempli depuis les données**.

Autrement dit : quarante attestations nominatives, chacune avec ses champs déjà
remplis et le reste laissé à compléter, produites en une fois depuis un tableau
de quarante lignes. C'est du publipostage, mais dans un seul fichier, sans
serveur et sans logiciel installé.

C'est un usage direct pour un service en relation avec des usagers. À vérifier
avec Yoann : est-ce bien ce qu'il a en tête, ou est-ce un usage à part ?

### Question ouverte, à poser quand la liste sera close

**Le retour des formulaires est-il dans le périmètre ?**

Produire le formulaire est une chose. Le récupérer rempli et en dépouiller les
réponses dans un onglet `data` en est une autre, nettement plus lourde : lire un
PDF coûte bien plus cher que l'écrire.

La boucle complète — formulaire produit, envoyé, rempli, renvoyé, dépouillé —
aurait une valeur considérable, mais elle double au moins le chantier. Ce n'est
pas la même ambition, et cela doit être décidé, pas subi.

### À ne pas oublier

Un formulaire destiné au public gagne à être accessible aux lecteurs d'écran :
champs nommés, ordre de tabulation cohérent, langue déclarée. C'est peu coûteux
si c'est prévu dès le départ, très coûteux à rattraper après coup.

---

## Point 9 — Retour des formulaires en phase 2, et un onglet « formulaire »

**Dit :** « Tu peux mettre effectivement le retour des formulaires dans un second
temps. D'ailleurs on pourrait aussi avoir un onglet formulaire. »

### 9.1 — Le dépouillement des PDF passe en phase 2

**Acté.** Produire des PDF à champs remplissables reste dans le périmètre initial.
Relire un PDF rempli pour en verser les réponses dans un onglet `data` est
reporté. Décision prise, pas subie.

### 9.2 — Un onglet formulaire — et il règle le problème du retour autrement

L'idée est meilleure que son détour par le PDF, parce qu'elle reste dans la
logique du projet : **le fichier est le véhicule**.

Le mécanisme, tel que je le vois :

1. On construit le formulaire dans un onglet dédié. Ses champs **dérivent des
   colonnes d'un onglet `data`** : les types, les libellés et les contraintes sont
   déjà là, il n'y a rien à redéfinir.
2. On envoie le fichier au destinataire.
3. Celui-ci l'ouvre par double-clic, voit **le formulaire seul**, le remplit, et
   enregistre.
4. Chaque réponse devient **une ligne de l'onglet `data`**.
5. Il renvoie le fichier. Les réponses sont dedans.

Aucun serveur, aucun envoi, aucun compte — et surtout **aucune lecture de PDF à
écrire**. Le retour des réponses, qui coûtait cher en 8, devient presque gratuit
ici. Les deux voies se complètent : le PDF pour qui exige un PDF, l'onglet
formulaire pour qui veut la boucle complète.

### Ce que cela impose et qui n'existe pas encore

**Un mode « remplissage », distinct du mode édition.** À l'ouverture, le fichier
doit pouvoir se présenter comme un formulaire et rien d'autre : ni barre
d'onglets, ni éditeur, ni accès aux autres onglets. Le destinataire n'est pas
l'auteur, il ne doit pas hériter de ses outils.

**Un export réduit — et c'est un vrai point de confidentialité.** Si le classeur
contient aussi des notes internes, un budget, d'autres réponses déjà collectées,
envoyer le fichier entier reviendrait à tout divulguer. Il faut donc pouvoir
produire une copie ne contenant **que** le formulaire et la structure vide de
l'onglet `data` visé. À ne pas traiter comme une option de confort : sans cela,
la fonction est dangereuse à l'usage.

**Une fusion des retours.** Vingt destinataires renvoient vingt fichiers, chacun
avec sa ligne. Il faut pouvoir les verser dans le classeur d'origine sans
écraser quoi que ce soit, et sans créer de doublon si un fichier est déposé deux
fois.

### Questions ouvertes, pour plus tard

- Le formulaire accepte-t-il plusieurs réponses dans un même fichier, ou une
  seule par fichier envoyé ?
- Le destinataire peut-il revenir sur sa réponse après enregistrement ?
- Faut-il verrouiller le formulaire, pour qu'il ne soit pas modifiable par celui
  qui le remplit ?

---

## Point 10 — Le PDF n'est pas un onglet, c'est une sortie

**Dit :** « Je précise : le PDF, c'est pour pouvoir générer un PDF. Mais je ne
vois pas si c'est encore utile du coup, avec le formulaire. Parce que si on
voulait faire un PDF formulaire unique à envoyer, on va le faire à partir de
l'équivalent Word. »

**Tu as raison, et c'est un allègement réel. Le point 8 est révisé.**

PDF n'est pas une nature de document, c'est un **format de sortie**. En faire un
type d'onglet était une erreur d'analyse de ma part au point 4 : cela obligeait à
concevoir un éditeur de PDF, alors qu'il ne s'agit que d'imprimer ce qui existe
déjà ailleurs.

### Ce qui remplace l'onglet PDF

**Une action d'export, disponible depuis n'importe quel onglet.** Pas un type,
une fonction transversale du noyau :

| Depuis | Produit |
|---|---|
| texte | le document mis en page |
| tableur / data | le tableau, avec ses en-têtes et sa ligne de total |
| diapos | les diapositives, ou le support avec les notes |
| **formulaire** | **un PDF à champs remplissables** |

Le dernier cas est le seul qui demande le mécanisme interactif du point 8. Et il
est simple à produire : un onglet formulaire porte déjà des champs typés et
nommés — les transposer en champs PDF est direct, il n'y a rien à inventer.

### Ce qu'on y gagne

- **un type d'onglet en moins** à concevoir, écrire et expliquer ;
- **le générateur PDF écrit une seule fois**, au lieu d'un éditeur PDF entier ;
- **une règle simple à retenir** : on ne crée jamais un PDF, on exporte en PDF ;
- **le poids du module PDF retombe** : produire un PDF est bien plus léger que
  d'en afficher et d'en éditer un.

### Le seul cas où le PDF garde une valeur propre

Quand le destinataire **n'ouvrira pas le fichier Europa** : un usager, une
administration, une pièce à archiver, un contexte où seul un PDF est accepté.
Il remplit alors le formulaire dans son propre lecteur, sans rien installer.

C'est précisément le rôle laissé au PDF, et il suffit. La boucle complète
— envoi, remplissage, retour, dépouillement — passe par l'onglet formulaire du
point 9 ; le PDF reste la porte de sortie vers l'extérieur.

### Conséquence sur la liste des types d'onglets

L'onglet PDF est retiré. Les types retenus à ce stade :
**texte · tableur · data · diapos · formulaire**.

Une synthèse consolidée sera dressée quand la liste des points sera close.

---

## Point 11 — (à venir)
