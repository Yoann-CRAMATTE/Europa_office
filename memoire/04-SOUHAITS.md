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

---

## Point 3 — (à venir)
