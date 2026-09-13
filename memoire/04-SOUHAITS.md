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

## Point 2 — (à venir)

---

## Point 3 — (à venir)
