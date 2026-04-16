import { useTournament } from '@/lib/tournament-context';
import type { Match } from '@/lib/tournament-types';

export function FinalPhaseScreen() {
  const { state, dispatch } = useTournament();
  const { finalBracket } = state;

  const activeMatch = finalBracket.find(m => m.status === 'active');
  const maxRound = finalBracket.length > 0 ? Math.max(...finalBracket.map(m => m.round)) : 0;
  const rounds = Array.from({ length: maxRound + 1 }, (_, i) => i);

  function selectWinner(matchId: string, winner: string) {
    dispatch({ type: 'SELECT_FINAL_WINNER', matchId, winner });
  }

  return (
    <div className="min-h-screen bg-radial-gradient p-4 md:p-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold font-heading text-foreground">
          CHAMPION 🏆 <span className="text-primary text-lg font-normal">— Phase finale</span>
        </h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 max-w-[1400px] mx-auto">
        <div className="flex-1 lg:flex-[2] overflow-x-auto">
          <BracketView matches={finalBracket} rounds={rounds} activeMatchId={activeMatch?.id || null} onSelectWinner={selectWinner} />
        </div>

        <div className="lg:flex-1">
          {activeMatch ? (
            <div className="glass-card p-6 animate-scale-up glow-active">
              <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-1">Match en cours</h2>
              <p className="text-xs text-primary mb-6">{activeMatch.roundLabel}</p>
              <div className="flex items-center justify-center gap-4 mb-6">
                <button
                  onClick={() => selectWinner(activeMatch.id, activeMatch.player1)}
                  className="bg-secondary hover:bg-primary hover:text-primary-foreground transition-all duration-200 rounded-xl px-5 py-4 text-foreground font-bold font-heading min-w-[100px]"
                >
                  {activeMatch.player1}
                </button>
                <span className="text-2xl font-bold text-muted-foreground">VS</span>
                <button
                  onClick={() => selectWinner(activeMatch.id, activeMatch.player2)}
                  className="bg-secondary hover:bg-primary hover:text-primary-foreground transition-all duration-200 rounded-xl px-5 py-4 text-foreground font-bold font-heading min-w-[100px]"
                >
                  {activeMatch.player2}
                </button>
              </div>
              <p className="text-xs text-center text-muted-foreground">Cliquez sur le vainqueur</p>
            </div>
          ) : (
            <div className="glass-card p-6 text-center text-muted-foreground">Tournoi terminé</div>
          )}
        </div>
      </div>
    </div>
  );
}

function BracketView({ matches, rounds, activeMatchId, onSelectWinner }: {
  matches: Match[];
  rounds: number[];
  activeMatchId: string | null;
  onSelectWinner: (matchId: string, winner: string) => void;
}) {
  return (
    <div className="glass-card p-4 md:p-6 overflow-x-auto">
      <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Tableau final</h2>
      <div className="flex gap-8 min-w-max items-center">
        {rounds.map(round => {
          const roundMatches = matches.filter(m => m.round === round);
          const gap = Math.pow(2, round) * 12;
          return (
            <div key={round} className="flex flex-col justify-around" style={{ gap: `${gap}px` }}>
              <div className="text-xs text-muted-foreground font-bold uppercase mb-2 text-center">
                {roundMatches[0]?.roundLabel || `Tour ${round + 1}`}
              </div>
              {roundMatches.map(match => (
                <div
                  key={match.id}
                  className={`w-44 rounded-lg border transition-all duration-300 ${
                    match.id === activeMatchId ? 'border-primary glow-active' : 'border-border'
                  } bg-card/80`}
                >
                  {[match.player1, match.player2].map((player, i) => (
                    <button
                      key={i}
                      disabled={match.id !== activeMatchId || !player || player === '[BYE]'}
                      onClick={() => player && player !== '[BYE]' && onSelectWinner(match.id, player)}
                      className={`w-full px-3 py-2 text-sm text-left transition-all duration-200 ${
                        i === 0 ? 'rounded-t-lg border-b border-border' : 'rounded-b-lg'
                      } ${
                        !player
                          ? 'text-muted-foreground/30 italic'
                          : player === '[BYE]'
                          ? 'text-muted-foreground/30 italic'
                          : match.winner === player
                          ? 'bg-primary/20 text-primary font-bold'
                          : match.winner && match.winner !== player
                          ? 'text-muted-foreground/40 line-through'
                          : match.id === activeMatchId
                          ? 'hover:bg-primary/10 text-foreground cursor-pointer'
                          : 'text-foreground'
                      }`}
                    >
                      {player || '—'}
                      {match.winner === player && <span className="float-right">✓</span>}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
