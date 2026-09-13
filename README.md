# Europa Office

Suite bureautique où **un document est un fichier**.

Pas d'installation, pas de compte, pas de serveur, pas de connexion. Vous
double-cliquez sur un fichier `.europa.html`, il s'ouvre dans votre navigateur et
devient son propre éditeur. Vous l'envoyez par courriel, le destinataire
double-clique : il a le document *et* le logiciel.

## État

Version 0.1.0 — socle technique opérationnel, un module de démonstration.
L'état détaillé et à jour vit dans [`memoire/00-ETAT-PROJET.md`](memoire/00-ETAT-PROJET.md).

## Ce qui est acquis

- Empaquetage en fichier unique : runtime compressé, données en clair et lisibles
- Chiffrement par mot de passe (AES-GCM 256, PBKDF2-SHA256 310 000 itérations)
- **Zéro appel réseau** — vérifié par un test qui échoue si une requête part
- Module Notes fonctionnel, validant le contrat noyau/module

Un document Notes complet pèse **7,5 Ko**.

## Démarrer

```bash
npm install
npm run demo               # produit dist/demo.europa.html
node tests/fumee.mjs       # test de fumée dans Chromium
node tests/chiffrement.mjs # aller-retour de chiffrement
npx tsc --noEmit           # vérification des types
```

Puis ouvrez `dist/demo.europa.html` dans un navigateur.

## Organisation

```
noyau/     contrat commun : document, sérialisation, chiffrement, modules
modules/   applications de la suite (notes, puis texte, tableur, diapos)
outils/    empaqueteur fichier unique
tests/     tests exécutés dans un vrai navigateur
docs/      spécification du format de fichier
memoire/   état, architecture, journal et décisions du projet
```

## Documentation

- [Format de fichier](docs/format-europa.md)
- [Architecture](memoire/01-ARCHITECTURE.md)
- [Décisions](memoire/03-DECISIONS.md)
- [Journal](memoire/02-JOURNAL.md)

## Licence

MIT
