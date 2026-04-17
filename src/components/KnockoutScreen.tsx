import { useTournament } from '@/lib/tournament-context';
import type { Match } from '@/lib/tournament-types';

export function KnockoutScreen() {
  const { state, dispatch } = useTournament();
  const { matches } = state;

  const activeMatch = matches.find(m => m.status === 'active');
  const maxRound = Math.max(...matches.map(m => m.round));
  const rounds = Array.from({ length: maxRound + 1 }, (_, i) => i);

  function selectWinner(matchId: string, winner: string) {
    dispatch({ type: 'SELECT_WINNER', matchId, winner });
  }

  return (
    <div className="min-h-screen bg-radial-gradient p-4 md:p-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-3">
          <span className="text-2xl animate-float">🏆</span>
          <h1 className="text-2xl md:text-3xl font-bold font-heading text-gradient">
            CHAMPION
          </h1>
          <span className="text-xs font-bold uppercase tracking-widest bg-primary/15 text-primary px-3 py-1 rounded-full border border-primary/20">
            Knockout
          </span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 max-w-[1400px] mx-auto">
        <div className="flex-1 lg:flex-[2] overflow-x-auto">
          <BracketView matches={matches} rounds={rounds} activeMatchId={activeMatch?.id || null} onSelectWinner={selectWinner} />
        </div>

        <div className="lg:flex-1">
          {activeMatch ? (
            <ActiveMatchCard match={activeMatch} onSelectWinner={selectWinner} />
          ) : (
            <div className="glass-card p-6 text-center text-muted-foreground">
              Tournoi terminé
            </div>
          )}
        </div>

        <div className="lg:flex-1">
          <ProgressPanel matches={matches} rounds={rounds} />
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
      <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">Tableau</h2>
      <div className="flex gap-8 min-w-max items-center">
        {rounds.map(round => {
          const roundMatches = matches.filter(m => m.round === round);
          const gap = Math.pow(2, round) * 12;
          return (
            <div key={round} className="flex flex-col justify-around" style={{ gap: `${gap}px` }}>
              <div className="text-xs text-muted-foreground font-bold uppercase mb-2 text-center tracking-wider">
                {roundMatches[0]?.roundLabel || `Tour ${round + 1}`}
              </div>
              {roundMatches.map(match => (
                <BracketMatchCard
                  key={match.id}
                  match={match}
                  isActive={match.id === activeMatchId}
                  onSelectWinner={onSelectWinner}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BracketMatchCard({ match, isActive, onSelectWinner }: {
  match: Match;
  isActive: boolean;
  onSelectWinner: (matchId: string, winner: string) => void;
}) {
  const canClick = isActive && !match.winner;
  
  return (
    <div className={`w-44 rounded-xl border transition-all duration-300 overflow-hidden ${
      isActive ? 'border-primary/50 glow-active' : 'border-glass-border'
    } bg-card/60 backdrop-blur-sm`}>
      {[match.player1, match.player2].map((player, i) => (
        <button
          key={i}
          disabled={!canClick || !player}
          onClick={() => player && onSelectWinner(match.id, player)}
          className={`w-full px-3 py-2.5 text-sm text-left transition-all duration-200 ${
            i === 0 ? 'border-b border-glass-border' : ''
          } ${
            !player
              ? 'text-muted-foreground/30 italic'
              : match.winner === player
              ? 'bg-gradient-to-r from-primary/20 to-purple-glow/10 text-primary font-bold'
              : match.winner && match.winner !== player
              ? 'text-muted-foreground/40 line-through'
              : canClick
              ? 'hover:bg-primary/10 text-foreground cursor-pointer'
              : 'text-foreground'
          }`}
        >
          {player || '—'}
          {match.winner === player && <span className="float-right text-primary">✓</span>}
        </button>
      ))}
    </div>
  );
}

function ActiveMatchCard({ match, onSelectWinner }: {
  match: Match;
  onSelectWinner: (matchId: string, winner: string) => void;
}) {
  return (
    <div className="glass-card p-6 animate-scale-up glow-active">
      <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1">Match en cours</h2>
      <p className="text-xs text-primary mb-6">{match.roundLabel}</p>

      <div className="flex items-center justify-center gap-4 mb-6">
        <PlayerButton name={match.player1} onClick={() => onSelectWinner(match.id, match.player1)} />
        <span className="text-2xl font-bold text-muted-foreground/50 animate-pulse">VS</span>
        <PlayerButton name={match.player2} onClick={() => onSelectWinner(match.id, match.player2)} />
      </div>

      <p className="text-xs text-center text-muted-foreground/70">
        Cliquez sur le vainqueur
      </p>
    </div>
  );
}

function PlayerButton({ name, onClick }: { name: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="bg-secondary/60 hover:bg-gradient-to-br hover:from-primary hover:to-purple-glow hover:text-primary-foreground transition-all duration-300 rounded-xl px-5 py-4 text-foreground font-bold font-heading text-center min-w-[100px] border border-glass-border hover:border-transparent hover:shadow-[0_0_20px_oklch(0.5_0.2_270/30%)]"
    >
      {name}
    </button>
  );
}

function ProgressPanel({ matches, rounds }: { matches: Match[]; rounds: number[] }) {
  const completed = matches.filter(m => m.status === 'completed');
  const total = matches.filter(m => m.player1 && m.player2).length;

  return (
    <div className="glass-card p-6">
      <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">Progression</h2>
      
      <div className="mb-4">
        <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
          <span>{completed.length} / {total} matchs</span>
          <span>{total > 0 ? Math.round((completed.length / total) * 100) : 0}%</span>
        </div>
        <div className="h-2 bg-secondary/50 rounded-full overflow-hidden">
          <div
            className="h-full progress-bar-gradient rounded-full transition-all duration-500"
            style={{ width: `${total > 0 ? (completed.length / total) * 100 : 0}%` }}
          />
        </div>
      </div>

      <div className="space-y-3">
        {rounds.map(round => {
          const roundMatches = matches.filter(m => m.round === round && m.player1 && m.player2);
          if (roundMatches.length === 0) return null;
          return (
            <div key={round}>
              <div className="text-xs font-bold text-primary mb-1">{roundMatches[0].roundLabel}</div>
              {roundMatches.map(m => (
                <div key={m.id} className="text-xs text-muted-foreground py-0.5 flex items-center gap-1.5">
                  {m.status === 'completed' ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
                      <span>
                        <span className={m.winner === m.player1 ? 'text-foreground font-bold' : ''}>{m.player1}</span>
                        {' vs '}
                        <span className={m.winner === m.player2 ? 'text-foreground font-bold' : ''}>{m.player2}</span>
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 shrink-0" />
                      <span className="opacity-50">{m.player1} vs {m.player2}</span>
                    </>
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
