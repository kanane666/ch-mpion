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

const FORMAT_OPTIONS: { value: TournamentFormat; label: string; desc: string; icon: string; badge?: string }[] = [
  { value: 'knockout', label: 'Knockout', desc: 'Élimination directe', icon: '⚡' },
  { value: 'championnat', label: 'Championnat', desc: 'Tous contre tous', icon: '🏆' },
  { value: 'coupe', label: 'Coupe', desc: 'Poules + élimination', icon: '🧩', badge: 'BÊTA' },
];

const FORMAT_LABELS: Record<TournamentFormat, string> = {
  knockout: 'Knockout',
  championnat: 'Championnat',
  coupe: 'Coupe avec poules',
};

type Step = 1 | 2 | 3;

export function SetupScreen() {
  const { state, dispatch } = useTournament();
  const [playerName, setPlayerName] = useState('');
  const [showCoupeModal, setShowCoupeModal] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>(1);

  const players = state.players;
  const canContinue = players.length >= 4;

  function addPlayer() {
    const name = playerName.trim();
    if (!name || players.includes(name)) return;
    dispatch({ type: 'SET_PLAYERS', players: [...players, name] });
    setPlayerName('');
  }

  function removePlayer(name: string) {
    dispatch({ type: 'SET_PLAYERS', players: players.filter(p => p !== name) });
  }

  function autoGenerate(count: number) {
    const generated = Array.from({ length: count }, (_, i) => `Joueur ${i + 1}`);
    dispatch({ type: 'SET_PLAYERS', players: generated });
  }

  const PRESETS = [4, 8, 12, 16];
  function isActivePreset(n: number) {
    return players.length === n && players.every((p, i) => p === `Joueur ${i + 1}`);
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
    // Auto-advance to step 2
    setCurrentStep(2);
  }

  function getGroupPreview() {
    const n = players.length;
    const g = state.numGroups;
    if (n < 4 || g < 2) return null;
    const base = Math.floor(n / g);
    const remainder = n % g;
    return Array.from({ length: g }, (_, i) => ({
      name: String.fromCharCode(65 + i),
      size: base + (i < remainder ? 1 : 0),
    }));
  }

  const groupPreview = state.format === 'coupe' ? getGroupPreview() : null;

  function goToStep(step: Step) {
    // Allow going back freely; forward only if previous step is complete
    if (step === 1) return setCurrentStep(1);
    if (step === 2 && state.format) return setCurrentStep(2);
    if (step === 3 && canContinue) return setCurrentStep(3);
  }

  const stepLabels: Record<Step, string> = { 1: 'Format', 2: 'Joueurs', 3: 'Lancer' };
  const isStepComplete = (s: Step) => {
    if (s === 1) return !!state.format && currentStep > 1;
    if (s === 2) return canContinue && currentStep > 2;
    return false;
  };

  return (
    <div className="min-h-screen bg-radial-gradient flex items-center justify-center p-4 md:p-8">
      <div className="glass-card p-6 md:p-10 w-full max-w-lg animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <span className="text-3xl md:text-4xl animate-float">🏆</span>
            <h1 className="text-3xl md:text-4xl font-bold font-heading tracking-tight text-gradient">
              CHAMPION
            </h1>
          </div>
          <Link
            to="/about"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
          >
            À propos
          </Link>
        </div>

        {/* Step indicator */}
        <div className="mb-10">
          <div className="flex items-center justify-between gap-2">
            {([1, 2, 3] as Step[]).map((s, idx) => {
              const complete = isStepComplete(s);
              const current = currentStep === s;
              return (
                <div key={s} className="flex items-center flex-1">
                  <button
                    onClick={() => goToStep(s)}
                    className="flex flex-col items-center gap-1.5 group"
                  >
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold font-heading transition-all duration-300 ${
                        complete
                          ? 'bg-emerald-500 text-white shadow-[0_0_15px_oklch(0.7_0.18_150/40%)]'
                          : current
                          ? 'bg-gradient-to-br from-primary to-purple-glow text-primary-foreground shadow-[0_0_18px_oklch(0.5_0.2_270/45%)] scale-110'
                          : 'bg-secondary/40 text-muted-foreground border border-glass-border'
                      }`}
                    >
                      {complete ? '✓' : s}
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${
                        current ? 'text-foreground' : complete ? 'text-emerald-400' : 'text-muted-foreground/60'
                      }`}
                    >
                      {stepLabels[s]}
                    </span>
                  </button>
                  {idx < 2 && (
                    <div
                      className={`flex-1 h-0.5 mx-1 mb-5 rounded transition-colors ${
                        isStepComplete(s) ? 'bg-emerald-500/60' : 'bg-glass-border'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 1 — Format */}
        {currentStep === 1 && (
          <div className="animate-scale-up">
            <h2 className="text-xl font-bold font-heading text-foreground mb-1">Choisissez un format</h2>
            <p className="text-sm text-muted-foreground mb-6">Comment voulez-vous jouer ce tournoi ?</p>

            <div className="space-y-3">
              {FORMAT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleFormatSelect(opt.value)}
                  className={`w-full text-left px-5 py-4 rounded-2xl transition-all duration-300 flex items-center gap-4 group ${
                    state.format === opt.value
                      ? 'bg-gradient-to-r from-primary to-purple-glow text-primary-foreground shadow-[0_0_25px_oklch(0.5_0.2_270/35%)] scale-[1.02]'
                      : 'bg-secondary/40 hover:bg-secondary/70 text-foreground border border-transparent hover:border-glass-border hover:scale-[1.01]'
                  }`}
                >
                  <span className="text-3xl shrink-0">{opt.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold font-heading text-base">{opt.label}</span>
                      {opt.badge && (
                        <span
                          className="inline-block px-1.5 py-0.5 rounded-full text-[10px] font-bold uppercase leading-none"
                          style={{ backgroundColor: '#F59E0B', color: '#000' }}
                        >
                          {opt.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs opacity-70 mt-0.5">{opt.desc}</p>
                  </div>
                  {opt.value === 'coupe' && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowCoupeModal(true);
                      }}
                      className="text-muted-foreground hover:text-foreground transition-colors shrink-0 text-lg"
                      title="Informations sur ce mode"
                    >
                      ℹ️
                    </button>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2 — Players */}
        {currentStep === 2 && (
          <div className="animate-scale-up">
            <h2 className="text-xl font-bold font-heading text-foreground mb-1">Ajoutez vos joueurs</h2>
            <p className="text-sm text-muted-foreground mb-6">Minimum 4 joueurs pour démarrer</p>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={playerName}
                onChange={e => setPlayerName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addPlayer()}
                placeholder="Nom du joueur…"
                maxLength={30}
                className="flex-1 bg-secondary/40 border border-glass-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all"
              />
              <button
                onClick={addPlayer}
                disabled={!playerName.trim()}
                className="btn-champion px-5 py-3 text-sm font-bold"
              >
                + Ajouter
              </button>
            </div>

            {/* Quick generation */}
            <div className="mb-5 p-4 bg-secondary/20 rounded-xl border border-glass-border">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-3">
                ⚡ Génération rapide
              </h3>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map(n => {
                  const active = isActivePreset(n);
                  return (
                    <button
                      key={n}
                      onClick={() => autoGenerate(n)}
                      className={`rounded-full px-4 py-2 text-sm font-bold transition-all duration-200 ${
                        active
                          ? 'bg-gradient-to-r from-primary to-purple-glow text-primary-foreground shadow-[0_0_15px_oklch(0.5_0.2_270/40%)] scale-105'
                          : 'border border-glass-border bg-transparent text-foreground hover:bg-secondary/40 hover:border-primary/40 hover:scale-[1.03]'
                      }`}
                    >
                      {n} joueurs
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Génère des joueurs automatiquement — modifiables après
              </p>
            </div>

            {/* Counter */}
            <div className="mb-3">
              <span
                className={`inline-block px-3 py-1.5 rounded-full text-sm font-bold transition-colors ${
                  players.length >= 4
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-secondary/40 text-muted-foreground border border-glass-border'
                }`}
              >
                {players.length} joueur{players.length > 1 ? 's' : ''} ajouté{players.length > 1 ? 's' : ''}
                {players.length >= 4 && ' ✓'}
              </span>
            </div>

            {/* Player chips */}
            {players.length > 0 && (
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1 mb-5">
                {players.map((p, i) => (
                  <span
                    key={p}
                    className="inline-flex items-center gap-1.5 bg-secondary/60 text-secondary-foreground rounded-full px-3 py-1.5 text-sm border border-glass-border animate-scale-up"
                    style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}
                  >
                    {p}
                    <button
                      onClick={() => removePlayer(p)}
                      className="text-muted-foreground hover:text-destructive transition-colors ml-0.5 text-xs"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Coupe config */}
            {state.format === 'coupe' && players.length >= 4 && (
              <div className="mb-5 p-4 bg-secondary/20 rounded-xl border border-glass-border">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-3">Configuration des poules</h3>
                <div className="flex items-center gap-3 mb-3">
                  <label className="text-sm text-foreground">Nombre de poules</label>
                  <input
                    type="number"
                    min={2}
                    max={Math.floor(players.length / 2)}
                    value={state.numGroups}
                    onChange={e => dispatch({ type: 'SET_NUM_GROUPS', numGroups: Math.max(2, parseInt(e.target.value) || 2) })}
                    className="w-16 bg-secondary/40 border border-glass-border rounded-lg px-2 py-1.5 text-foreground text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <span className="text-xs text-muted-foreground">(suggéré: {suggestedGroups})</span>
                </div>
                {groupPreview && (
                  <div className="flex flex-wrap gap-2">
                    {groupPreview.map(g => (
                      <span key={g.name} className="bg-primary/15 text-primary px-2.5 py-1 rounded-lg text-xs font-bold border border-primary/20">
                        Poule {g.name} ({g.size})
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Nav */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentStep(1)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2"
              >
                ← Retour
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                disabled={!canContinue}
                className="btn-champion flex-1 py-3 text-sm font-bold"
              >
                Continuer →
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Launch */}
        {currentStep === 3 && (
          <div className="animate-scale-up text-center">
            <h2 className="text-xl font-bold font-heading text-foreground mb-1">Prêt à lancer le tournoi ?</h2>
            <p className="text-sm text-muted-foreground mb-6">Vérifiez votre configuration ci-dessous</p>

            <div className="bg-secondary/30 rounded-2xl p-5 border border-glass-border mb-6 text-left">
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Format</span>
                  <span className="font-bold text-foreground">{FORMAT_LABELS[state.format]}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Joueurs</span>
                  <span className="font-bold text-foreground">{players.length}</span>
                </div>
                {state.format === 'coupe' && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Poules</span>
                    <span className="font-bold text-foreground">{state.numGroups}</span>
                  </div>
                )}
              </div>

              {state.format === 'coupe' && groupPreview && (
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-glass-border">
                  {groupPreview.map(g => (
                    <span key={g.name} className="bg-primary/15 text-primary px-2.5 py-1 rounded-lg text-xs font-bold border border-primary/20">
                      Poule {g.name} ({g.size})
                    </span>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleStart}
              disabled={!canContinue}
              className="btn-champion w-full py-4 text-base font-bold tracking-wide"
            >
              🏆 COMMENCER LE TOURNOI
            </button>
            <button
              onClick={() => setCurrentStep(2)}
              className="mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Modifier
            </button>
          </div>
        )}
      </div>

      {/* Coupe Tutorial Modal */}
      <Dialog open={showCoupeModal} onOpenChange={setShowCoupeModal}>
        <DialogContent className="glass-card border-glass-border max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-heading text-foreground">
              🧩 Comment fonctionne la Coupe avec Poules ?
            </DialogTitle>
            <DialogDescription asChild>
              <div className="text-sm text-muted-foreground space-y-4 mt-4">
                <p>Ce mode se déroule en deux phases :</p>

                <div className="bg-secondary/30 rounded-xl p-4 border border-glass-border">
                  <p className="font-bold text-foreground mb-1">📌 Phase de poules</p>
                  <p>
                    Les joueurs sont répartis en groupes. Chaque joueur affronte tous les autres joueurs de son groupe.
                  </p>
                  <ul className="list-disc list-inside mt-1 space-y-0.5">
                    <li>Victoire = 3 pts | Nul = 1 pt | Défaite = 0 pt</li>
                    <li>Les meilleurs de chaque poule se qualifient pour la suite.</li>
                  </ul>
                </div>

                <div className="bg-secondary/30 rounded-xl p-4 border border-glass-border">
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
