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
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold font-heading text-foreground">
          CHAMPION 🏆 <span className="text-primary text-lg font-normal">— Knockout</span>
        </h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 max-w-[1400px] mx-auto">
        {/* Left: Bracket */}
        <div className="flex-1 lg:flex-[2] overflow-x-auto">
          <BracketView matches={matches} rounds={rounds} activeMatchId={activeMatch?.id || null} onSelectWinner={selectWinner} />
        </div>

        {/* Center: Active Match */}
        <div className="lg:flex-1">
          {activeMatch ? (
            <ActiveMatchCard match={activeMatch} onSelectWinner={selectWinner} />
          ) : (
            <div className="glass-card p-6 text-center text-muted-foreground">
              Tournoi terminé
            </div>
          )}
        </div>

        {/* Right: Progress */}
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
      <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Tableau</h2>
      <div className="flex gap-8 min-w-max items-center">
        {rounds.map((round, ri) => {
          const roundMatches = matches.filter(m => m.round === round);
          const gap = Math.pow(2, round) * 12;
          return (
            <div key={round} className="flex flex-col justify-around" style={{ gap: `${gap}px` }}>
              <div className="text-xs text-muted-foreground font-bold uppercase mb-2 text-center">
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
    <div className={`w-44 rounded-lg border transition-all duration-300 ${
      isActive ? 'border-primary glow-active' : 'border-border'
    } bg-card/80`}>
      {[match.player1, match.player2].map((player, i) => (
        <button
          key={i}
          disabled={!canClick || !player}
          onClick={() => player && onSelectWinner(match.id, player)}
          className={`w-full px-3 py-2 text-sm text-left transition-all duration-200 ${
            i === 0 ? 'rounded-t-lg border-b border-border' : 'rounded-b-lg'
          } ${
            !player
              ? 'text-muted-foreground/30 italic'
              : match.winner === player
              ? 'bg-primary/20 text-primary font-bold'
              : match.winner && match.winner !== player
              ? 'text-muted-foreground/40 line-through'
              : canClick
              ? 'hover:bg-primary/10 text-foreground cursor-pointer'
              : 'text-foreground'
          }`}
        >
          {player || '—'}
          {match.winner === player && <span className="float-right">✓</span>}
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
      <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-1">Match en cours</h2>
      <p className="text-xs text-primary mb-6">{match.roundLabel}</p>

      <div className="flex items-center justify-center gap-4 mb-6">
        <PlayerButton
          name={match.player1}
          onClick={() => onSelectWinner(match.id, match.player1)}
        />
        <span className="text-2xl font-bold text-muted-foreground">VS</span>
        <PlayerButton
          name={match.player2}
          onClick={() => onSelectWinner(match.id, match.player2)}
        />
      </div>

      <p className="text-xs text-center text-muted-foreground">
        Cliquez sur le vainqueur
      </p>
    </div>
  );
}

function PlayerButton({ name, onClick }: { name: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="bg-secondary hover:bg-primary hover:text-primary-foreground transition-all duration-200 rounded-xl px-5 py-4 text-foreground font-bold font-heading text-center min-w-[100px]"
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
      <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Progression</h2>
      
      <div className="mb-4">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>{completed.length} / {total} matchs</span>
          <span>{total > 0 ? Math.round((completed.length / total) * 100) : 0}%</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
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
                <div key={m.id} className="text-xs text-muted-foreground py-0.5">
                  {m.status === 'completed' ? (
                    <span>
                      <span className={m.winner === m.player1 ? 'text-foreground font-bold' : ''}>{m.player1}</span>
                      {' vs '}
                      <span className={m.winner === m.player2 ? 'text-foreground font-bold' : ''}>{m.player2}</span>
                    </span>
                  ) : (
                    <span className="opacity-50">{m.player1} vs {m.player2}</span>
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
