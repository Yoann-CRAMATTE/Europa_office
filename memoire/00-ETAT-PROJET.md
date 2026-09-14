# État du projet — Europa Office

> Fichier de référence. À relire en premier au début de chaque session,
> à mettre à jour à la fin de chaque instruction. Évite de relire tout le code.

**Dernière mise à jour :** 14/09/2026
**Version :** 0.1.0
**Branche de travail :** `claude/file-analysis-631qfh`

## En une phrase

> Un projet complet, dans un seul fichier, avec une seule interface.

Chaque classeur est un fichier HTML autonome : il s'ouvre par double-clic,
fonctionne hors-ligne, sans serveur, sans installation, et se transmet par simple
pièce jointe.

## Où en est le projet

**Phase : recueil du besoin, terminé à 19 points, et première maquette validée.**
Aucun module métier n'est encore écrit. Le socle technique de la première journée
reste valable pour sa mécanique, mais son modèle de document est à refondre —
il ne connaît pas encore les classeurs à onglets.

## Vocabulaire — à employer partout (décision D-005)

| Terme | Ce que c'est |
|---|---|
| **Classeur** | le fichier entier |
| **Onglet** | un document d'un type donné, dans ce classeur |
| **Feuille** | une unité à l'intérieur d'un onglet |

**Six modules :** Texte · Tableur · Data · Diapos · Formulaire · PDF
Jamais « Word », « Excel » ni « PowerPoint ».

## Ce qui existe

| Brique | État | Emplacement |
|---|---|---|
| Cahier des charges, 19 points | **à jour** | `memoire/04-SOUHAITS.md` |
| Maquette d'interface | **validée dans l'ensemble** | `maquettes/interface-v1.html` |
| Empaqueteur fichier unique | opérationnel | `outils/empaqueter.mjs` |
| Chiffrement AES-GCM + PBKDF2 | opérationnel | `noyau/src/crypto.ts` |
| Porte de mot de passe | opérationnel | `noyau/src/pwgate.ts` |
| Sérialisation, registre de modules | opérationnel, **à refondre** | `noyau/src/` |
| Module Notes | démonstration, **sera remplacé** | `modules/notes/` |
| Tests navigateur | 15 assertions vertes | `tests/` |

## Mesures réelles

| Indicateur | Valeur |
|---|---|
| Maquette d'interface complète | 30 Ko |
| Document Notes du socle | 7,5 Ko |
| Appels réseau à l'ouverture | **0** (vérifié par test) |
| `crypto.subtle` en `file://` | disponible (vérifié) |

## Ce qui n'existe pas encore

- Le modèle de classeur à onglets et feuilles — **le premier chantier**
- Les six modules métier
- Les références entre onglets et leur graphe de dépendances
- Les ressources en blocs séparés (points 11 et 12)
- Le format `.eo` en archive ZIP
- L'import CSV, l'export PDF, les formulaires remplissables
- La notion de modèle en lecture seule

## Décisions prises

| | Décision | Statut |
|---|---|---|
| D-001 | Fichier unique autonome | actée |
| D-002 | Aucune télémétrie, aucun appel réseau | actée |
| D-003 | Un document n'embarque que son module | **remplacée par D-006** |
| D-004 | Quel module en premier | **en attente** |
| D-005 | Vocabulaire du projet | actée |
| D-006 | Chaque classeur embarque toute la suite | actée |

## À trancher, une fois le recueil clos

1. **L'ordre de construction** — D-004, à reprendre depuis le cas d'essai du point 15.
2. **Le sens de « rendement »** pour le format commun — point 2.
3. **`.eo` seul ou `.eo.html` + `.eo`** — points 2 bis et 12.3.
4. **Moteur de rendu PDF embarqué** — point 12.1, environ 1 Mo.
5. **Réviser `01-ARCHITECTURE.md`** — ses budgets de poids sont caducs.

## Commandes

```bash
npm install
npm run verifier          # types + tests navigateur
npm run demo              # produit dist/demo.europa.html
```

Maquette : ouvrir `maquettes/interface-v1.html` dans un navigateur.
