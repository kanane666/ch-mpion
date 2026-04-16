import { useTournament } from '@/lib/tournament-context';
import { getDirectQualifiersCount } from '@/lib/tournament-logic';

export function WildcardScreen() {
  const { state, dispatch } = useTournament();
  const { groups, qualifiedPlayers, wildcardSlots, wildcardCandidates, selectedWildcards } = state;

  const canConfirm = selectedWildcards.length === wildcardSlots;

  return (
    <div className="min-h-screen bg-radial-gradient p-4 md:p-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold font-heading text-foreground">
          CHAMPION 🏆 <span className="text-primary text-lg font-normal">— Résultats de phase de poules</span>
        </h1>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Group results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map(g => {
            const qCount = getDirectQualifiersCount(g.players.length);
            return (
              <div key={g.name} className="glass-card p-4">
                <h3 className="text-sm font-bold font-heading text-foreground mb-2">Poule {g.name}</h3>
                <div className="space-y-1">
                  {g.standings.map((s, i) => (
                    <div
                      key={s.player}
                      className={`flex justify-between text-xs py-1 px-2 rounded ${
                        i < qCount ? 'bg-primary/15 text-primary font-bold' : 'text-muted-foreground'
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
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-3">
            Qualifiés directs ({qualifiedPlayers.length})
          </h2>
          <div className="flex flex-wrap gap-2">
            {qualifiedPlayers.map(p => (
              <span key={p} className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-bold">
                {p}
              </span>
            ))}
          </div>
        </div>

        {/* Wildcards */}
        {wildcardSlots > 0 && (
          <div className="glass-card p-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-1">
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
                    className={`w-full flex justify-between items-center px-4 py-2.5 rounded-lg transition-all text-sm ${
                      isSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary/50 hover:bg-secondary text-foreground'
                    }`}
                  >
                    <span className="font-bold">{i + 1}. {c.player}</span>
                    <span className="text-xs opacity-70">{c.points} pts — {c.wins}V {c.draws}N {c.losses}D</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <button
          onClick={() => {
            if (wildcardSlots > 0) {
              dispatch({ type: 'CONFIRM_WILDCARDS' });
            } else {
              dispatch({ type: 'CONFIRM_WILDCARDS' });
            }
          }}
          disabled={wildcardSlots > 0 && !canConfirm}
          className="btn-champion w-full py-4 text-lg"
        >
          Lancer la phase finale
        </button>
      </div>
    </div>
  );
}
