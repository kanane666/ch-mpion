import { useState } from 'react';
import { useTournament } from '@/lib/tournament-context';
import type { TournamentFormat } from '@/lib/tournament-types';
import { Link } from '@tanstack/react-router';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

const FORMAT_OPTIONS: { value: TournamentFormat; label: string; desc: string; badge?: string }[] = [
  { value: 'knockout', label: 'Knockout', desc: 'Élimination directe' },
  { value: 'championnat', label: 'Championnat', desc: 'Tous contre tous (round-robin)' },
  { value: 'coupe', label: 'Coupe avec poules', desc: 'Phase de groupes + élimination', badge: 'BÊTA' },
];

export function SetupScreen() {
  const { state, dispatch } = useTournament();
  const [playerName, setPlayerName] = useState('');
  const [autoCount, setAutoCount] = useState(8);
  const [showCoupeModal, setShowCoupeModal] = useState(false);

  const players = state.players;
  const canStart = players.length >= 4;

  function addPlayer() {
    const name = playerName.trim();
    if (!name || players.includes(name)) return;
    dispatch({ type: 'SET_PLAYERS', players: [...players, name] });
    setPlayerName('');
  }

  function removePlayer(name: string) {
    dispatch({ type: 'SET_PLAYERS', players: players.filter(p => p !== name) });
  }

  function autoGenerate() {
    const generated = Array.from({ length: autoCount }, (_, i) => `Joueur ${i + 1}`);
    dispatch({ type: 'SET_PLAYERS', players: generated });
  }

  const suggestedGroups = players.length >= 4 ? Math.max(2, Math.min(Math.floor(players.length / 3), 8)) : 2;

  function handleStart() {
    if (state.format === 'coupe') {
      dispatch({ type: 'SHUFFLE_GROUPS' });
      setTimeout(() => dispatch({ type: 'START_TOURNAMENT' }), 50);
    } else {
      dispatch({ type: 'START_TOURNAMENT' });
    }
  }

  function handleFormatSelect(format: TournamentFormat) {
    if (format === 'coupe' && state.format !== 'coupe') {
      dispatch({ type: 'SET_FORMAT', format });
      setShowCoupeModal(true);
    } else {
      dispatch({ type: 'SET_FORMAT', format });
    }
  }

  function getGroupPreview() {
    const n = players.length;
    const g = state.numGroups;
    if (n < 4 || g < 2) return null;
    const base = Math.floor(n / g);
    const remainder = n % g;
    const groups = Array.from({ length: g }, (_, i) => ({
      name: String.fromCharCode(65 + i),
      size: base + (i < remainder ? 1 : 0),
    }));
    return groups;
  }

  const groupPreview = state.format === 'coupe' ? getGroupPreview() : null;

  return (
    <div className="min-h-screen bg-radial-gradient flex items-center justify-center p-4 md:p-8">
      <div className="glass-card p-8 md:p-10 w-full max-w-lg animate-scale-up">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground font-heading tracking-tight">
            CHAMPION <span className="text-3xl">🏆</span>
          </h1>
          <Link
            to="/about"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
          >
            À propos
          </Link>
        </div>

        {/* Format Selection */}
        <div className="mb-8">
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-3">Format</h2>
          <div className="space-y-2">
            {FORMAT_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => handleFormatSelect(opt.value)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-between ${
                  state.format === opt.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary/50 hover:bg-secondary text-foreground'
                }`}
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold font-heading">{opt.label}</span>
                  {opt.badge && (
                    <span
                      className="inline-block px-1.5 py-0.5 rounded-full text-[10px] font-bold uppercase leading-none"
                      style={{ backgroundColor: '#F59E0B', color: '#000' }}
                    >
                      {opt.badge}
                    </span>
                  )}
                  <span className="text-sm opacity-70">— {opt.desc}</span>
                </div>
                {opt.value === 'coupe' && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCoupeModal(true);
                    }}
                    className="text-muted-foreground hover:text-foreground transition-colors ml-2 shrink-0"
                    title="Informations sur ce mode"
                  >
                    ℹ️
                  </button>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Players */}
        <div className="mb-8">
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-3">
            Ajouter des participants
            <span className="ml-2 text-primary">({players.length})</span>
          </h2>

          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={playerName}
              onChange={e => setPlayerName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addPlayer()}
              placeholder="Nom du joueur…"
              maxLength={30}
              className="flex-1 bg-input/50 border border-border rounded-lg px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
            <button
              onClick={addPlayer}
              disabled={!playerName.trim()}
              className="btn-champion px-4 py-2.5 text-sm"
            >
              +
            </button>
          </div>

          {/* Auto generate */}
          <div className="flex items-center gap-3 mb-4">
            <label className="text-sm text-muted-foreground">Générer</label>
            <input
              type="number"
              min={4}
              max={999}
              value={autoCount}
              onChange={e => setAutoCount(Math.max(4, parseInt(e.target.value) || 4))}
              className="w-16 bg-input/50 border border-border rounded-lg px-2 py-1.5 text-foreground text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <button onClick={autoGenerate} className="text-sm text-primary hover:underline">
              joueurs automatiquement
            </button>
          </div>

          {/* Player chips */}
          {players.length > 0 && (
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
              {players.map((p, i) => (
                <span
                  key={p}
                  className="inline-flex items-center gap-1.5 bg-secondary/80 text-secondary-foreground rounded-full px-3 py-1 text-sm animate-scale-up"
                  style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}
                >
                  {p}
                  <button
                    onClick={() => removePlayer(p)}
                    className="text-muted-foreground hover:text-destructive transition-colors ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          {players.length > 0 && players.length < 4 && (
            <p className="text-xs text-muted-foreground mt-2">Minimum 4 participants requis</p>
          )}
        </div>

        {/* Coupe config */}
        {state.format === 'coupe' && players.length >= 4 && (
          <div className="mb-8">
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-3">Configuration des poules</h2>
            <div className="flex items-center gap-3 mb-3">
              <label className="text-sm text-foreground">Nombre de poules</label>
              <input
                type="number"
                min={2}
                max={Math.floor(players.length / 2)}
                value={state.numGroups}
                onChange={e => dispatch({ type: 'SET_NUM_GROUPS', numGroups: Math.max(2, parseInt(e.target.value) || 2) })}
                className="w-16 bg-input/50 border border-border rounded-lg px-2 py-1.5 text-foreground text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <span className="text-xs text-muted-foreground">(suggéré: {suggestedGroups})</span>
            </div>

            {groupPreview && (
              <div className="bg-secondary/30 rounded-lg p-3 text-sm">
                <p className="text-muted-foreground mb-1">
                  {players.length} joueurs → {state.numGroups} poules :
                </p>
                <div className="flex flex-wrap gap-2">
                  {groupPreview.map(g => (
                    <span key={g.name} className="bg-primary/20 text-primary px-2 py-0.5 rounded text-xs font-bold">
                      Poule {g.name} ({g.size})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Start Button */}
        <button
          onClick={handleStart}
          disabled={!canStart}
          className="btn-champion w-full py-4 text-lg"
        >
          Commencer le tournoi
        </button>
      </div>

      {/* Coupe Tutorial Modal */}
      <Dialog open={showCoupeModal} onOpenChange={setShowCoupeModal}>
        <DialogContent className="glass-card border-border max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-heading text-foreground">
              🧩 Comment fonctionne la Coupe avec Poules ?
            </DialogTitle>
            <DialogDescription asChild>
              <div className="text-sm text-muted-foreground space-y-4 mt-4">
                <p>Ce mode se déroule en deux phases :</p>

                <div>
                  <p className="font-bold text-foreground mb-1">📌 Phase de poules</p>
                  <p>
                    Les joueurs sont répartis en groupes. Chaque joueur affronte tous les autres joueurs de son groupe.
                  </p>
                  <ul className="list-disc list-inside mt-1 space-y-0.5">
                    <li>Victoire = 3 pts | Nul = 1 pt | Défaite = 0 pt</li>
                    <li>Les meilleurs de chaque poule se qualifient pour la suite.</li>
                  </ul>
                </div>

                <div>
                  <p className="font-bold text-foreground mb-1">🏆 Phase finale</p>
                  <p>
                    Les qualifiés s'affrontent en élimination directe jusqu'au champion.
                  </p>
                  <ul className="list-disc list-inside mt-1 space-y-0.5">
                    <li>Des places supplémentaires peuvent être attribuées aux meilleurs 3es de chaque poule.</li>
                    <li>En cas d'égalité de points, le nombre de victoires départage les joueurs.</li>
                  </ul>
                </div>

                <p className="text-xs opacity-70">
                  ⚠️ Ce mode est en version bêta. Certaines fonctionnalités peuvent évoluer.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2 mt-4">
            <button
              onClick={() => setShowCoupeModal(false)}
              className="btn-champion w-full py-3 text-sm"
            >
              J'AI COMPRIS — CONTINUER
            </button>
            <button
              onClick={() => {
                dispatch({ type: 'SET_FORMAT', format: 'knockout' });
                setShowCoupeModal(false);
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors text-center py-2"
            >
              CHANGER DE FORMAT
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
