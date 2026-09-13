# Architecture

## Principe directeur

Un document = un fichier HTML = l'application + les données.
Aucun serveur, aucune installation, aucun compte, aucun appel réseau.

## Anatomie d'un fichier `.europa.html`

```
<!DOCTYPE html>
  <script type="application/europa+json" id="europa-doc">   <- DONNÉES, en clair
  <script id="europa-rt-css" type="europa/deflate-b64">     <- CSS compressé
  <script id="europa-rt"     type="europa/deflate-b64">     <- JS compressé
  <script> amorce DecompressionStream </script>             <- ~40 lignes en clair
```

Seul le premier bloc contient des données utilisateur. Il reste en JSON lisible :
un humain ou un agent peut l'éditer au bloc-notes sans outil. Les deux blocs
base64 sont du code, jamais des données.

## Schéma en couches

```
        modules/texte   modules/tableur   modules/diapos   modules/notes
              \              |                 |               /
               \-------------+-----------------+--------------/
                                    |
                          noyau/  (contrat Module)
                document · serialize · crypto · pwgate · modules
                                    |
                        outils/empaqueter.mjs
                                    |
                          fichier .europa.html
```

Le noyau ne connaît **jamais** la structure interne d'un module : il transporte
`contenu` sans l'inspecter. Un module ne connaît **jamais** le format du fichier :
il reçoit un objet et un contexte. Cette frontière est ce qui permet d'ajouter un
module sans toucher au reste.

## Contrat d'un module

```ts
interface Module<C> {
  nom: NomModule
  libelle: string
  contenuVierge (): C
  monter (hote: HTMLElement, doc: DocumentEuropa<C>, ctx: Contexte): () => void
}
```

`monter` renvoie sa fonction de démontage : c'est ce qui rendra possible, plus
tard, un document qui contient plusieurs modules (un tableau dans un texte).

## Le problème du poids — et sa réponse

Le risque du modèle fichier unique est l'obésité : si chaque document embarque
toute la suite, un mémo de deux pages pèse 3 Mo.

Réponse retenue : **l'empaqueteur ne met dans un fichier que le module dont ce
document a besoin.** Un document Notes n'embarque pas le tableur.

Budget de poids fixé par module, runtime compressé :

| Module | Budget | Réel |
|---|---|---|
| Noyau seul | 15 Ko | **2,9 Ko** |
| Notes | 25 Ko | **2,9 Ko** (noyau inclus) |
| Texte | 250 Ko | à venir |
| Tableur | 350 Ko | à venir |
| Diapos | 400 Ko | à venir |

Dépasser un budget est un signal d'alerte, pas une fatalité — mais cela doit être
une décision consciente, inscrite dans `03-DECISIONS.md`.

## Choix techniques et raisons

| Choix | Raison |
|---|---|
| TypeScript strict | Un bug de sérialisation corrompt un document utilisateur. Le typage est une assurance, pas un confort. |
| esbuild, pas Vite/webpack | Une dépendance, zéro configuration, compilation en millisecondes. |
| Aucun framework d'interface | Chaque kilo-octet est payé par chaque document, pour toujours. React coûterait 45 Ko avant d'écrire une ligne utile. |
| `deflate-raw` natif | Disponible dans le navigateur depuis 2023. Aucune bibliothèque de décompression à embarquer. |
| Code en anglais, documentation en français | Les identifiants suivent la convention universelle du langage ; tout ce qui se lit est en français. |

## Limite structurelle à connaître

Un navigateur **ne peut pas réécrire le fichier qu'il a ouvert** depuis `file://`.
« Enregistrer » produit donc un téléchargement, pas une écriture en place.
Trois pistes, à trancher plus tard :

1. `showSaveFilePicker()` (File System Access API) — écriture en place réelle,
   mais Chrome et Edge uniquement, pas Firefox ni Safari.
2. Téléchargement classique — universel, mais accumule les copies numérotées.
3. Sauvegarde de secours dans IndexedDB, restaurée à la réouverture du fichier.

Retenu pour l'instant : téléchargement classique, avec avertissement avant
fermeture si des modifications sont en attente.
