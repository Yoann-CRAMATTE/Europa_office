# Format de fichier `.europa.html`

Version du conteneur : `europa/1`

## Vue d'ensemble

Un fichier Europa est un document HTML valide. Ouvert dans un navigateur, il
devient l'éditeur de son propre contenu. Ouvert dans un éditeur de texte, il
montre ses données en JSON lisible.

## Le bloc de données

```html
<script type="application/europa+json" id="europa-doc">
{
  "format": "europa/1",
  "module": "notes",
  "titre": "Compte rendu",
  "cree": "2026-09-13T15:22:28.066Z",
  "modifie": "2026-09-13T16:04:11.902Z",
  "contenu": { "texte": "..." }
}
</script>
```

### Champs du conteneur

| Champ | Type | Obligatoire | Rôle |
|---|---|---|---|
| `format` | `"europa/1"` | oui | Version du conteneur. Permet de migrer les fichiers anciens. |
| `module` | chaîne | oui | Module capable d'interpréter `contenu`. |
| `titre` | chaîne | oui | Titre affiché, et nom proposé à l'enregistrement. |
| `cree` | ISO 8601 | oui | Date de création. |
| `modifie` | ISO 8601 | non | Écrite à chaque enregistrement. |
| `auteur` | chaîne | non | Libre. |
| `contenu` | quelconque | oui | Charge utile du module. Le noyau ne l'inspecte jamais. |
| `ressources` | objet | non | Images et polices en data-URI, adressées par clé. |

## Règle d'échappement — impérative

Tout caractère `<` présent dans le JSON **doit** être écrit `<`.
Sans cela, le navigateur ferme le `<script>` au premier `</` rencontré et le
document devient illisible.

Les séparateurs Unicode U+2028 et U+2029 doivent également être échappés.

L'écriture passe toujours par `encoder()` (`noyau/src/serialize.ts`), qui
applique ces trois règles. N'écrivez jamais le bloc à la main sans elles.

## Document chiffré

Quand un mot de passe est posé, le même bloc contient à la place :

```json
{
  "format": "europa/1-chiffre",
  "kdf": "PBKDF2-SHA256",
  "iterations": 310000,
  "sel": "<16 octets en base64>",
  "iv": "<12 octets en base64>",
  "charge": "<document JSON chiffré, en base64>"
}
```

Chiffrement AES-GCM 256 bits. La clé est dérivée du mot de passe par PBKDF2-SHA256,
310 000 itérations (recommandation OWASP 2023). Sel et vecteur d'initialisation
tirés aléatoirement à chaque enregistrement.

AES-GCM authentifie la charge : un mot de passe erroné fait échouer le
déchiffrement, il ne produit jamais de données corrompues silencieusement.

**Le mot de passe ne quitte jamais le navigateur et n'est stocké nulle part.
Perdu, il rend le document définitivement illisible.**

## Blocs de runtime

```html
<script id="europa-rt-css" type="europa/deflate-b64">...</script>
<script id="europa-rt"     type="europa/deflate-b64">...</script>
```

CSS et JavaScript compressés en `deflate-raw`, encodés en base64. Aucune donnée
utilisateur. Reconstruits à chaque empaquetage : toute modification manuelle est
perdue au prochain build.

## Prérequis navigateur

`DecompressionStream` : Chrome 80+, Edge 80+, Firefox 113+, Safari 16.4+.
Sur un navigateur plus ancien, l'amorce affiche un message explicite — le bloc de
données, lui, reste intact et récupérable à la main.

## Pour un agent IA qui édite un document

1. Ne modifier **que** le bloc `id="europa-doc"`.
2. Échapper chaque `<` en `<`.
3. Ne jamais régénérer le fichier entier ni toucher aux blocs base64.
4. Mettre `modifie` à jour.
5. Respecter le schéma de `contenu` propre au module visé.
