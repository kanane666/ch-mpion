import { useTournament } from '@/lib/tournament-context';
import { getDirectQualifiersCount } from '@/lib/tournament-logic';

export function WildcardScreen() {
  const { state, dispatch } = useTournament();
  const { groups, qualifiedPlayers, wildcardSlots, wildcardCandidates, selectedWildcards } = state;

  const canConfirm = selectedWildcards.length === wildcardSlots;

  return (
    <div className="min-h-screen bg-radial-gradient p-4 md:p-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-3">
          <span className="text-2xl animate-float">🏆</span>
          <h1 className="text-2xl md:text-3xl font-bold font-heading text-gradient">CHAMPION</h1>
          <span className="text-xs font-bold uppercase tracking-widest bg-primary/15 text-primary px-3 py-1 rounded-full border border-primary/20">
            Résultats des poules
          </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Group results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map(g => {
            const qCount = getDirectQualifiersCount(g.players.length);
            return (
              <div key={g.name} className="glass-card p-4 hover:border-glass-hover transition-all duration-300">
                <h3 className="text-sm font-bold font-heading text-foreground mb-3">Poule {g.name}</h3>
                <div className="space-y-1">
                  {g.standings.map((s, i) => (
                    <div
                      key={s.player}
                      className={`flex justify-between text-xs py-1.5 px-2.5 rounded-lg transition-all ${
                        i < qCount
                          ? 'bg-gradient-to-r from-primary/15 to-transparent text-primary font-bold border border-primary/15'
                          : 'text-muted-foreground'
                      }`}
                    >
                      <span>{i + 1}. {s.player}</span>
                      <span>{s.points} pts</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Qualified */}
        <div className="glass-card p-6">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-3">
            Qualifiés directs ({qualifiedPlayers.length})
          </h2>
          <div className="flex flex-wrap gap-2">
            {qualifiedPlayers.map(p => (
              <span key={p} className="bg-gradient-to-r from-primary/20 to-purple-glow/10 text-primary px-3 py-1.5 rounded-full text-sm font-bold border border-primary/20 shadow-[0_0_10px_oklch(0.5_0.2_270/15%)]">
                {p}
              </span>
            ))}
          </div>
        </div>

        {/* Wildcards */}
        {wildcardSlots > 0 && (
          <div className="glass-card p-6">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1">
              Meilleurs 3es — {wildcardSlots} place{wildcardSlots > 1 ? 's' : ''} disponible{wildcardSlots > 1 ? 's' : ''}
            </h2>
            <p className="text-xs text-muted-foreground mb-4">
              Sélectionnez exactement {wildcardSlots} joueur{wildcardSlots > 1 ? 's' : ''} ({selectedWildcards.length}/{wildcardSlots})
            </p>
            <div className="space-y-2">
              {wildcardCandidates.map((c, i) => {
                const isSelected = selectedWildcards.includes(c.player);
                return (
                  <button
                    key={c.player}
                    onClick={() => dispatch({ type: 'TOGGLE_WILDCARD', player: c.player })}
                    className={`w-full flex justify-between items-center px-4 py-3 rounded-xl transition-all duration-300 text-sm ${
                      isSelected
                        ? 'bg-gradient-to-r from-primary to-purple-glow text-primary-foreground shadow-[0_0_15px_oklch(0.5_0.2_270/25%)]'
                        : 'bg-secondary/40 hover:bg-secondary/70 text-foreground border border-glass-border'
                    }`}
                  >
                    <span className="font-bold flex items-center gap-2">
                      {isSelected && <span className="text-primary-foreground">✓</span>}
                      {i + 1}. {c.player}
                    </span>
                    <span className="text-xs opacity-70">{c.points} pts — {c.wins}V {c.draws}N {c.losses}D</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <button
          onClick={() => dispatch({ type: 'CONFIRM_WILDCARDS' })}
          disabled={wildcardSlots > 0 && !canConfirm}
          className="btn-champion w-full py-4 text-lg"
        >
          🚀 Lancer la phase finale
        </button>
      </div>
    </div>
  );
}
