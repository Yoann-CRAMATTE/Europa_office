# Journal des modifications

Ordre antichronologique. Une entrée par instruction traitée.

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
