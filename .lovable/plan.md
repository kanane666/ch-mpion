

# Plan — Bug Coupe (groupes B+) + Refonte UX Setup

## 1. BUG FIX — Coupe avec poules : sélection impossible dans groupes B/C/D+

**Cause racine identifiée :** Dans `src/lib/tournament-context.tsx`, l'action `START_TOURNAMENT` pour le format `coupe` n'active **que le premier match du premier groupe** :

```ts
groups = groups.map((g, gi) => {
  if (gi === 0 && g.matches.length > 0) { // ← seul groupe 0 !
    ms[0] = { ...ms[0], status: 'active' };
  }
  return g;
});
```

Résultat : pour les Poules B, C, D…, aucun match n'a le statut `'active'`. Dans `CoupeScreen.tsx`, `GroupMatchView` fait `group.matches.find(m => m.status === 'active')` → renvoie `undefined` → aucun bouton de sélection ne s'affiche, donc clic impossible.

Bonne nouvelle : la logique par-groupe est déjà correcte. `advanceGroupMatch(groups, groupName, …)` filtre par `g.name !== groupName` et ne touche que le bon groupe. Idem pour `calculateStandings` qui reçoit `g.players` et `g.matches` du groupe ciblé. Il n'y a donc PAS de `currentMatchIndex` global à corriger — chaque groupe a déjà ses propres `matches` et `standings` indépendants.

**Correction (1 ligne de logique) — `src/lib/tournament-context.tsx` :**
- Modifier `START_TOURNAMENT` pour activer le premier match pending de **chaque** groupe :
```ts
groups = groups.map((g) => {
  if (g.matches.length === 0) return g;
  const ms = [...g.matches];
  ms[0] = { ...ms[0], status: 'active' };
  return { ...g, matches: ms };
});
```

**Vérifications attendues après fix :**
- Poule B/C/D affichent bien leur match actif et les 3 boutons (J1 / NUL / J2)
- Cliquer dans Poule B ne change ni les matches ni le classement de Poule A (déjà garanti par `advanceGroupMatch`)
- Compteur "X/Y matchs" correct par groupe (déjà calculé localement dans `GroupMatchView`)
- Switch entre onglets préserve la progression (l'état est dans `state.groups[i]`, pas dans un état local d'onglet)

## 2. UX — Refonte Setup Screen en wizard 3 étapes

**Fichier modifié :** `src/components/SetupScreen.tsx` uniquement. Aucune modif de logique, reducer, types ou autre composant.

### Structure visuelle

```text
┌─────────────────────────────────────┐
│   🏆 CHAMPION         À propos →    │
│                                     │
│   ① ─── ② ─── ③                    │
│  Format  Joueurs  Lancer            │
│                                     │
│   [Contenu de l'étape courante]     │
└─────────────────────────────────────┘
```

### Step indicator (haut)
- 3 cercles numérotés ① ② ③ reliés par une ligne
- État courant : cercle bleu rempli + label en blanc
- État complété : cercle vert avec ✓
- État inactif : cercle gris + label muted
- Labels sous chaque cercle : "Format", "Joueurs", "Lancer"

### Étape 1 — "Choisissez un format"
- Titre h2 : "Choisissez un format"
- 3 grandes tuiles cliquables (verticales, full-width sur mobile, ou grid 3 cols sur desktop) :
  - ⚡ **Knockout** — "Élimination directe"
  - 🏆 **Championnat** — "Tous contre tous"
  - 🧩 **Coupe** + badge BÊTA — "Poules + élimination" + icône ℹ️
- Tuile sélectionnée : gradient bleu→violet + glow
- Sélectionner une tuile → passe automatiquement à l'étape 2 (et garde la possibilité de revenir)

### Étape 2 — "Ajoutez vos joueurs"
- Titre h2 : "Ajoutez vos joueurs"
- Input "Nom du joueur…" + bouton large "+ Ajouter"
- Toggle/section "Générer automatiquement" : input nombre + bouton secondaire
- Compteur en évidence : "**X joueurs ajoutés**" (vert si ≥4, sinon gris)
- Grid de chips joueurs (scrollable si beaucoup)
- Si format = coupe : afficher la config "Nombre de poules" + preview (gardée telle quelle)
- Bouton "← Retour" pour revenir à l'étape 1
- Si ≥4 joueurs : bouton "Continuer →" pour aller à l'étape 3

### Étape 3 — "C'est parti !"
- Titre h2 : "Prêt à lancer le tournoi ?"
- Carte récap : "**Format :** Knockout · **Joueurs :** 8 · (si coupe : **Poules :** 3)"
- Si coupe : preview des poules
- Bouton XL bleu/violet : "🏆 COMMENCER LE TOURNOI"
- Lien "← Modifier" pour revenir à l'étape 2

### Logique du wizard
- `useState` local : `currentStep: 1 | 2 | 3`
- Auto-avance : sélection de format → step 2 ; clic "Continuer" en step 2 → step 3
- Clics sur le step indicator : permettent de naviguer en arrière vers une étape déjà complétée
- Modal Coupe BÊTA : conservée à l'identique, déclenchée à la sélection du format
- Aucun changement aux dispatch (`SET_FORMAT`, `SET_PLAYERS`, `SET_NUM_GROUPS`, `SHUFFLE_GROUPS`, `START_TOURNAMENT`) ni au flow de démarrage

### Ce qui ne change pas
- Tournament context, reducer, types, logic
- KnockoutScreen, ChampionnatScreen, CoupeScreen, etc.
- Modal tutoriel Coupe (contenu et comportement identiques)
- Style visuel global (glassmorphism + gradient bleu-violet conservés)

