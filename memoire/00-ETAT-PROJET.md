# État du projet — Europa Office

> Fichier de référence. À relire en premier au début de chaque session,
> à mettre à jour à la fin de chaque instruction. Évite de relire tout le code.

**Dernière mise à jour :** 13/09/2026
**Version :** 0.1.0
**Branche de travail :** `claude/file-analysis-631qfh`

## En une phrase

Suite bureautique où chaque document est un fichier HTML unique et autonome :
il s'ouvre par double-clic, fonctionne hors-ligne, sans serveur, sans installation,
et se transmet par simple pièce jointe.

## Ce qui fonctionne aujourd'hui

| Brique | État | Emplacement |
|---|---|---|
| Empaqueteur fichier unique | **opérationnel** | `outils/empaqueter.mjs` |
| Modèle de document + validation | **opérationnel** | `noyau/src/document.ts` |
| Sérialisation / enregistrement | **opérationnel** | `noyau/src/serialize.ts` |
| Chiffrement AES-GCM + PBKDF2 | **opérationnel** | `noyau/src/crypto.ts` |
| Porte de mot de passe | **opérationnel** | `noyau/src/pwgate.ts` |
| Registre de modules | **opérationnel** | `noyau/src/modules.ts` |
| Module Notes (démonstration) | **opérationnel** | `modules/notes/` |
| Tests navigateur | **15 assertions vertes** | `tests/` |

## Mesures réelles

| Indicateur | Valeur | Comparaison |
|---|---|---|
| Poids d'un document Notes complet | **7,5 Ko** | Bento/slides : 674 Ko |
| Runtime noyau (compressé) | 2,9 Ko | — |
| Appels réseau à l'ouverture | **0** | Bento : 2 (télémétrie + MAJ) |
| `crypto.subtle` en `file://` | disponible (vérifié) | — |

## Ce qui n'existe pas encore

- Module Texte (traitement de texte paginé)
- Module Tableur (moteur de formules)
- Module Diapos
- Import / export `.docx`, `.xlsx`, `.pptx`
- Chargement d'un document d'un module non embarqué
- Impression / export PDF
- Historique des versions dans le fichier

## Décision en attente

**Quel module métier construire en premier ?** Voir `03-DECISIONS.md`, décision D-004.

## Commandes

```bash
npm install
npm run build:noyau     # compile le runtime
npm run demo            # produit dist/demo.europa.html
node tests/fumee.mjs    # test de fumée navigateur
node tests/chiffrement.mjs
npx tsc --noEmit        # vérification des types
```
