

## Plan — Refonte du bloc "Générer automatiquement" (Step 2)

**Fichier modifié :** `src/components/SetupScreen.tsx` uniquement.

### Changements

**Supprimer** la ligne actuelle (input number + bouton "joueurs") située entre le champ d'ajout manuel et le compteur de joueurs.

**Remplacer par** une section "⚡ Génération rapide" :

```text
┌────────────────────────────────────────────┐
│ ⚡ GÉNÉRATION RAPIDE                       │
│                                            │
│  [4 joueurs] [8 joueurs] [12 j.] [16 j.]   │
│                                            │
│  Génère des joueurs automatiquement —      │
│  modifiables après                         │
└────────────────────────────────────────────┘
```

### Détails visuels

- Conteneur : `bg-secondary/20 rounded-xl border border-glass-border p-4` (même style que les autres sections)
- Titre : `⚡ GÉNÉRATION RAPIDE` en `text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground`
- Boutons preset (4 / 8 / 12 / 16) :
  - Disposition : `flex flex-wrap gap-2`
  - Forme pill : `rounded-full px-4 py-2 text-sm font-bold`
  - Style par défaut (outline) : `border border-glass-border bg-transparent text-foreground hover:bg-secondary/40 hover:border-primary/40`
  - Style actif (quand `players.length === preset` ET tous les noms = "Joueur 1..N") : gradient `from-primary to-purple-glow text-primary-foreground` + glow subtil
- Texte helper en dessous : `text-xs text-muted-foreground mt-3` → "Génère des joueurs automatiquement — modifiables après"

### Logique (inchangée fonctionnellement)

- Au clic sur un preset N : `dispatch({ type: 'SET_PLAYERS', players: Array.from({length: N}, (_, i) => 'Joueur ' + (i+1)) })`
- Réutilise la fonction `autoGenerate` existante en lui passant le nombre directement (refactor mineur : `autoGenerate(count: number)`)
- Suppression du `useState` `autoCount` (devenu inutile)
- Détection du preset actif : helper `isActivePreset(n)` qui vérifie `players.length === n && players.every((p, i) => p === 'Joueur ' + (i+1))`

### Ce qui ne change pas

- Champ d'ajout manuel au-dessus (input + bouton "+ Ajouter") : intact
- Compteur de joueurs en dessous : intact
- Liste des chips joueurs : intacte
- Toute la logique de tournoi, le reducer, les autres étapes du wizard

