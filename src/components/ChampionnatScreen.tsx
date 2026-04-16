import { useTournament } from '@/lib/tournament-context';

export function ChampionnatScreen() {
  const { state, dispatch } = useTournament();
  const { matches, standings } = state;

  const activeMatch = matches.find(m => m.status === 'active');
  const completedCount = matches.filter(m => m.status === 'completed').length;
  const totalCount = matches.length;

  function selectWinner(matchId: string, winner: string) {
    dispatch({ type: 'SELECT_WINNER', matchId, winner });
  }

  return (
    <div className="min-h-screen bg-radial-gradient p-4 md:p-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold font-heading text-foreground">
          CHAMPION 🏆 <span className="text-primary text-lg font-normal">— Championnat</span>
        </h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 max-w-[1400px] mx-auto">
        <div className="flex-1 lg:flex-[1]">
          <StandingsTable standings={standings} />
        </div>

        <div className="flex-1 lg:flex-[2]">
          {activeMatch ? (
            <MatchCard match={activeMatch} onSelectWinner={selectWinner} />
          ) : (
            <div className="glass-card p-8 text-center text-muted-foreground">
              Tous les matchs sont terminés
            </div>
          )}

          <div className="mt-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>{completedCount} / {totalCount} matchs joués</span>
              <span>{totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex-1 lg:flex-[1]">
          <MatchHistory matches={matches} />
        </div>
      </div>
    </div>
  );
}

function StandingsTable({ standings }: { standings: { player: string; points: number; wins: number; draws: number; losses: number; played: number }[] }) {
  return (
    <div className="glass-card p-4 md:p-6">
      <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Classement</h2>
      <div className="max-h-[60vh] overflow-y-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-muted-foreground uppercase tracking-wider">
              <th className="text-left pb-2">#</th>
              <th className="text-left pb-2">Joueur</th>
              <th className="text-center pb-2">Pts</th>
              <th className="text-center pb-2">V</th>
              <th className="text-center pb-2">N</th>
              <th className="text-center pb-2">D</th>
              <th className="text-center pb-2">MJ</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((s, i) => (
              <tr
                key={s.player}
                className={`border-t border-border transition-all duration-300 ${
                  i === 0 && s.points > 0 ? 'bg-primary/10 text-primary' : 'text-foreground'
                }`}
              >
                <td className="py-2 font-bold">{i + 1}</td>
                <td className="py-2 font-heading font-bold">{s.player}</td>
                <td className="py-2 text-center font-bold">{s.points}</td>
                <td className="py-2 text-center">{s.wins}</td>
                <td className="py-2 text-center">{s.draws}</td>
                <td className="py-2 text-center">{s.losses}</td>
                <td className="py-2 text-center text-muted-foreground">{s.played}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MatchCard({ match, onSelectWinner }: {
  match: { id: string; player1: string; player2: string; roundLabel: string; isPlayoff?: boolean; playoffType?: string };
  onSelectWinner: (matchId: string, winner: string) => void;
}) {
  const isPlayoff = match.isPlayoff;
  const allowDraw = !isPlayoff; // No draws in playoffs

  return (
    <div className={`glass-card p-8 animate-scale-up ${isPlayoff ? 'glow-active' : ''}`}>
      {isPlayoff && (
        <div className="text-center mb-2">
          <span className="text-xs font-bold uppercase bg-primary/20 text-primary px-3 py-1 rounded-full">
            {match.playoffType === 'final' ? '🏆 Finale' : '🥉 Petite Finale'}
          </span>
        </div>
      )}
      <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-1 text-center">
        {isPlayoff ? '' : 'Match en cours'}
      </h2>
      <p className="text-xs text-primary mb-6 text-center">{match.roundLabel}</p>

      <div className="flex items-center justify-center gap-4 mb-6 flex-wrap">
        <button
          onClick={() => onSelectWinner(match.id, match.player1)}
          className="bg-secondary hover:bg-primary hover:text-primary-foreground transition-all duration-200 rounded-xl px-6 py-5 text-foreground font-bold font-heading text-lg min-w-[120px]"
        >
          {match.player1}
        </button>
        {allowDraw && (
          <button
            onClick={() => onSelectWinner(match.id, 'draw')}
            className="bg-accent hover:bg-muted-foreground hover:text-background transition-all duration-200 rounded-xl px-4 py-5 text-muted-foreground font-bold font-heading text-sm"
          >
            NUL
          </button>
        )}
        <button
          onClick={() => onSelectWinner(match.id, match.player2)}
          className="bg-secondary hover:bg-primary hover:text-primary-foreground transition-all duration-200 rounded-xl px-6 py-5 text-foreground font-bold font-heading text-lg min-w-[120px]"
        >
          {match.player2}
        </button>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        Cliquez sur le vainqueur pour valider
      </p>
    </div>
  );
}

function MatchHistory({ matches }: { matches: { id: string; player1: string; player2: string; winner: string | null; status: string; roundLabel: string }[] }) {
  const completed = matches.filter(m => m.status === 'completed');

  return (
    <div className="glass-card p-4 md:p-6">
      <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Historique</h2>
      {completed.length === 0 ? (
        <p className="text-xs text-muted-foreground">Aucun match joué</p>
      ) : (
        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          {completed.map(m => (
            <div key={m.id} className="text-xs py-1.5 border-b border-border last:border-0">
              <span className={m.winner === m.player1 ? 'text-foreground font-bold' : m.winner === 'draw' ? 'text-muted-foreground' : 'text-muted-foreground'}>
                {m.player1}
              </span>
              <span className="text-muted-foreground">
                {m.winner === 'draw' ? ' = ' : ' vs '}
              </span>
              <span className={m.winner === m.player2 ? 'text-foreground font-bold' : m.winner === 'draw' ? 'text-muted-foreground' : 'text-muted-foreground'}>
                {m.player2}
              </span>
              {m.winner === 'draw' && <span className="text-accent ml-1">(NUL)</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
