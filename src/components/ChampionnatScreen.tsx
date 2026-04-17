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
        <div className="inline-flex items-center gap-3">
          <span className="text-2xl animate-float">🏆</span>
          <h1 className="text-2xl md:text-3xl font-bold font-heading text-gradient">CHAMPION</h1>
          <span className="text-xs font-bold uppercase tracking-widest bg-primary/15 text-primary px-3 py-1 rounded-full border border-primary/20">
            Championnat
          </span>
        </div>
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
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span>{completedCount} / {totalCount} matchs joués</span>
              <span>{totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%</span>
            </div>
            <div className="h-2 bg-secondary/50 rounded-full overflow-hidden">
              <div
                className="h-full progress-bar-gradient rounded-full transition-all duration-500"
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
  const medalColors = [
    'bg-gradient-to-r from-gold/15 to-transparent text-gold',
    'bg-gradient-to-r from-silver/10 to-transparent text-silver',
    'bg-gradient-to-r from-bronze/10 to-transparent text-bronze',
  ];

  return (
    <div className="glass-card p-4 md:p-6">
      <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">Classement</h2>
      <div className="max-h-[60vh] overflow-y-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-muted-foreground/70 uppercase tracking-wider">
              <th className="text-left pb-3">#</th>
              <th className="text-left pb-3">Joueur</th>
              <th className="text-center pb-3">Pts</th>
              <th className="text-center pb-3">V</th>
              <th className="text-center pb-3">N</th>
              <th className="text-center pb-3">D</th>
              <th className="text-center pb-3">MJ</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((s, i) => (
              <tr
                key={s.player}
                className={`border-t border-glass-border transition-all duration-300 ${
                  i < 3 && s.points > 0 ? medalColors[i] : 'text-foreground'
                }`}
              >
                <td className="py-2.5 font-bold">{i + 1}</td>
                <td className="py-2.5 font-heading font-bold">{s.player}</td>
                <td className="py-2.5 text-center font-bold">{s.points}</td>
                <td className="py-2.5 text-center">{s.wins}</td>
                <td className="py-2.5 text-center">{s.draws}</td>
                <td className="py-2.5 text-center">{s.losses}</td>
                <td className="py-2.5 text-center text-muted-foreground">{s.played}</td>
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
  const allowDraw = !isPlayoff;

  return (
    <div className={`glass-card p-8 animate-scale-up ${isPlayoff ? 'glow-active' : ''}`}>
      {isPlayoff && (
        <div className="text-center mb-3">
          <span className="text-xs font-bold uppercase bg-gradient-to-r from-primary/20 to-purple-glow/20 text-primary px-4 py-1.5 rounded-full border border-primary/20">
            {match.playoffType === 'final' ? '🏆 Finale' : '🥉 Petite Finale'}
          </span>
        </div>
      )}
      <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1 text-center">
        {isPlayoff ? '' : 'Match en cours'}
      </h2>
      <p className="text-xs text-primary mb-6 text-center">{match.roundLabel}</p>

      <div className="flex items-center justify-center gap-4 mb-6 flex-wrap">
        <button
          onClick={() => onSelectWinner(match.id, match.player1)}
          className="bg-secondary/60 hover:bg-gradient-to-br hover:from-primary hover:to-purple-glow hover:text-primary-foreground transition-all duration-300 rounded-xl px-6 py-5 text-foreground font-bold font-heading text-lg min-w-[120px] border border-glass-border hover:border-transparent hover:shadow-[0_0_20px_oklch(0.5_0.2_270/30%)]"
        >
          {match.player1}
        </button>
        {allowDraw && (
          <button
            onClick={() => onSelectWinner(match.id, 'draw')}
            className="bg-accent/40 hover:bg-muted-foreground hover:text-background transition-all duration-200 rounded-xl px-4 py-5 text-muted-foreground font-bold font-heading text-sm border border-dashed border-muted-foreground/30"
          >
            NUL
          </button>
        )}
        <button
          onClick={() => onSelectWinner(match.id, match.player2)}
          className="bg-secondary/60 hover:bg-gradient-to-br hover:from-primary hover:to-purple-glow hover:text-primary-foreground transition-all duration-300 rounded-xl px-6 py-5 text-foreground font-bold font-heading text-lg min-w-[120px] border border-glass-border hover:border-transparent hover:shadow-[0_0_20px_oklch(0.5_0.2_270/30%)]"
        >
          {match.player2}
        </button>
      </div>

      <p className="text-xs text-center text-muted-foreground/70">
        Cliquez sur le vainqueur pour valider
      </p>
    </div>
  );
}

function MatchHistory({ matches }: { matches: { id: string; player1: string; player2: string; winner: string | null; status: string; roundLabel: string }[] }) {
  const completed = matches.filter(m => m.status === 'completed');

  return (
    <div className="glass-card p-4 md:p-6">
      <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">Historique</h2>
      {completed.length === 0 ? (
        <p className="text-xs text-muted-foreground/60">Aucun match joué</p>
      ) : (
        <div className="space-y-1 max-h-[60vh] overflow-y-auto">
          {completed.map(m => (
            <div key={m.id} className="text-xs py-2 border-b border-glass-border last:border-0 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary/50 shrink-0" />
              <span className={m.winner === m.player1 ? 'text-foreground font-bold' : m.winner === 'draw' ? 'text-muted-foreground' : 'text-muted-foreground'}>
                {m.player1}
              </span>
              <span className="text-muted-foreground/50">
                {m.winner === 'draw' ? ' = ' : ' vs '}
              </span>
              <span className={m.winner === m.player2 ? 'text-foreground font-bold' : m.winner === 'draw' ? 'text-muted-foreground' : 'text-muted-foreground'}>
                {m.player2}
              </span>
              {m.winner === 'draw' && <span className="text-accent ml-1 text-[10px]">(NUL)</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
