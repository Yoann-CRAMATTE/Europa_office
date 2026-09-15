# Journal des modifications

Ordre antichronologique. Une entrée par instruction traitée.

---

## 15/09/2026 — Identité visuelle vérifiée par un test

**Demande :** vérifier que dans chaque module le logo figure non seulement dans
l'onglet en bas, mais aussi dans la barre de fonctions.

**Fait :** `tests/identite-visuelle.mjs`, ajouté à `npm test`. Il ne se contente
pas de constater une présence : il compare les **tracés SVG** entre la case du
ruban, l'onglet en bas et le menu de création, et refuse qu'ils diffèrent.

Quatre contrôles par onglet, plus un sur le menu :
1. la case d'identité existe dans le ruban et porte le nom du module ;
2. le tracé du logo y est identique à celui de l'onglet en bas ;
3. la couleur du ruban suit celle de l'onglet ;
4. un module garde le même logo d'un onglet à l'autre, et diffère de tous les
   autres ;
5. le menu de création reprend les six mêmes logos.

**Résultat : les six modules passent.** Sept onglets contrôlés.

**Corrigé en cours de route :** la première version du test se trompait
elle-même — un classeur peut contenir plusieurs onglets d'un même type, ici deux
onglets Data, et la déduplication comparait alors Data contre lui-même. Le test
distingue désormais la constance d'un module et sa distinction d'avec les autres.

---

## 14/09/2026 — Vocabulaire arrêté, feuilles empilées dans la maquette

**Demande :** un onglet doit pouvoir contenir plusieurs feuilles, affichées l'une
sous l'autre pour le texte ; et fixer le nom des modules.

**Vocabulaire arrêté** (point 19.2) : **classeur** pour le fichier entier,
**onglet** pour un document, **feuille** pour une unité à l'intérieur. Les six
modules s'appellent Texte, Tableur, Data, Diapos, Formulaire et PDF. Le noyau ne
connaît que le mot « feuille » ; chaque module l'affiche sous son nom d'usage —
page, feuille de calcul, vue, diapositive, section.

**Maquette corrigée :**
- le module Texte empile désormais ses pages en flux continu, séparées par un
  repère de saut de page — c'est ce qui manquait ;
- le module Diapos montre plusieurs diapositives dans le même onglet ;
- le module PDF montre plusieurs pages ;
- chaque feuille porte son numéro, la barre du bas dit « Classeur · 7 onglets ».

**Vérifié dans Chromium :** deux pages empilées et un saut de page dans Texte,
deux diapositives dans Diapos, aucune erreur console.

---

## 13/09/2026 — Première maquette d'interface

**Demande :** voir un premier jet visuel, même sans rien de connecté.

**Produit :** `maquettes/interface-v1.html` — fichier unique de 27 Ko, sans
dépendance ni appel réseau. Montre l'ossature décrite aux points 3, 17 et 18,
appliquée au cas réel du point 15 : une réclamation d'usager pour surconsommation,
en sept onglets.

Ce qui vit dans la maquette : la bascule d'un onglet à l'autre change le ruban,
la couleur d'accent, la colonne de gauche, le centre et le panneau de propriétés.
Le menu d'ajout d'onglet s'ouvre. Tout le reste est figé.

**Vérifié dans Chromium :** sept onglets rendus, aucune erreur console, aucune
requête réseau, libellés du ruban non tronqués.

**Corrigé en cours de route :**
- Le ruban tronquait le nom des groupes : sa hauteur ne tenait pas compte des
  libellés d'outils sur deux lignes.
- Toutes les icônes du ruban étaient identiques, faute d'un jeu propre aux outils.
  Trente-quatre icônes distinctes ont été dessinées.

**Limites assumées :** aucune logique réelle, contenus factices, thème clair
seulement, icônes de types encore proches les unes des autres pour tableur et data.

---

## 13/09/2026 — Socle initial

**Demande :** « Sur ce principe, on va développer une suite type office complète. »
(faisant suite à l'analyse d'un fichier `bento/slides`)

**Contexte de départ :** dépôt vide, zéro commit.

**Produit :**
- `outils/empaqueter.mjs` — empaqueteur fichier unique (deflate-raw + base64 +
  amorce `DecompressionStream`), reprend la technique de Bento en la simplifiant.
- `noyau/src/` — modèle de document, sérialisation, chiffrement, registre de
  modules, porte de mot de passe, feuille de style de base.
- `modules/notes/` — module minimal, sert de preuve que le contrat noyau tient.
- `tests/fumee.mjs`, `tests/chiffrement.mjs`, `tests/module-absent.mjs` —
  tests exécutés dans un Chromium réel.
- `memoire/`, `docs/format-europa.md`, `README.md`.

**Vérifié :**
- `npx tsc --noEmit` : aucune erreur.
- Test de fumée : 7/7 — démarrage, montage, saisie propagée, aller-retour du
  fichier, écran d'amorce retiré, **zéro appel réseau**, zéro erreur console.
- Test module absent : 3/3 — un document dont le module n'est pas embarqué
  affiche un message nommant le module, jamais une page blanche.
- Test de chiffrement : 5/5 — aller-retour fidèle, mauvais mot de passe rejeté,
  aucune donnée en clair dans le paquet, `crypto.subtle` disponible en `file://`.

**Corrigé en cours de route :**
- L'échappement des séparateurs de ligne U+2028/U+2029 insérait les caractères
  bruts dans le source, ce qui cassait la syntaxe du fichier. Remplacé par
  `RegExp(String.fromCharCode(0x2028))`.
- `Uint8Array.from()` produit un type refusé par l'API WebCrypto en TypeScript
  strict. Construction explicite du tableau à la place.

**Écarts assumés :**
- Un seul module, volontairement trivial : valider le socle avant d'engager un
  moteur métier lourd.
- Aucune interopérabilité `.docx`/`.xlsx` à ce stade.
