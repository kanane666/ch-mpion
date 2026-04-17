import { useState } from 'react';
import { useTournament } from '@/lib/tournament-context';
import type { Group } from '@/lib/tournament-types';

export function CoupeScreen() {
  const { state, dispatch } = useTournament();
  const { groups } = state;
  const [activeGroupIdx, setActiveGroupIdx] = useState(0);

  const activeGroup = groups[activeGroupIdx];
  const allGroupsDone = groups.every(g => g.matches.every(m => m.status === 'completed'));

  function selectGroupWinner(groupName: string, matchId: string, winner: string) {
    dispatch({ type: 'SELECT_GROUP_WINNER', groupName, matchId, winner });
  }

  return (
    <div className="min-h-screen bg-radial-gradient p-4 md:p-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-3">
          <span className="text-2xl animate-float">🏆</span>
          <h1 className="text-2xl md:text-3xl font-bold font-heading text-gradient">CHAMPION</h1>
          <span className="text-xs font-bold uppercase tracking-widest bg-primary/15 text-primary px-3 py-1 rounded-full border border-primary/20">
            Phase de poules
          </span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 max-w-[1400px] mx-auto">
        {/* Left: Group tabs */}
        <div className="lg:flex-[1]">
          <div className="glass-card p-4">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-3">Poules</h2>
            <div className="space-y-2 max-h-[70vh] overflow-y-auto">
              {groups.map((g, i) => {
                const done = g.matches.every(m => m.status === 'completed');
                const completed = g.matches.filter(m => m.status === 'completed').length;
                return (
                  <button
                    key={g.name}
                    onClick={() => setActiveGroupIdx(i)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl transition-all duration-300 text-sm ${
                      i === activeGroupIdx
                        ? 'bg-gradient-to-r from-primary to-purple-glow text-primary-foreground shadow-[0_0_15px_oklch(0.5_0.2_270/25%)]'
                        : 'bg-secondary/40 hover:bg-secondary/70 text-foreground'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold font-heading">Poule {g.name}</span>
                      <span className={`text-xs ${done ? 'text-green-400' : 'opacity-70'}`}>
                        {done ? '✓' : `${completed}/${g.matches.length}`}
                      </span>
                    </div>
                    <div className="text-xs opacity-60">{g.players.length} joueurs</div>
                  </button>
                );
              })}
            </div>

            {allGroupsDone && (
              <button
                onClick={() => dispatch({ type: 'FINISH_GROUP_STAGE' })}
                className="btn-champion w-full mt-4 py-3 text-sm"
              >
                Résultats des poules →
              </button>
            )}
          </div>
        </div>

        {/* Center: Active group match */}
        <div className="lg:flex-[2]">
          {activeGroup && <GroupMatchView group={activeGroup} onSelectWinner={selectGroupWinner} />}
        </div>

        {/* Right: Active group standings */}
        <div className="lg:flex-[1]">
          {activeGroup && <GroupStandings group={activeGroup} />}
        </div>
      </div>
    </div>
  );
}

function GroupMatchView({ group, onSelectWinner }: { group: Group; onSelectWinner: (gn: string, mid: string, w: string) => void }) {
  const activeMatch = group.matches.find(m => m.status === 'active');
  const completed = group.matches.filter(m => m.status === 'completed').length;
  const total = group.matches.length;

  return (
    <div>
      {activeMatch ? (
        <div className="glass-card p-8 animate-scale-up">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1 text-center">
            Poule {group.name} — Match en cours
          </h2>
          <p className="text-xs text-primary mb-6 text-center">{completed + 1} / {total}</p>

          <div className="flex items-center justify-center gap-4 mb-6 flex-wrap">
            <button
              onClick={() => onSelectWinner(group.name, activeMatch.id, activeMatch.player1)}
              className="bg-secondary/60 hover:bg-gradient-to-br hover:from-primary hover:to-purple-glow hover:text-primary-foreground transition-all duration-300 rounded-xl px-6 py-5 text-foreground font-bold font-heading text-lg min-w-[100px] border border-glass-border hover:border-transparent hover:shadow-[0_0_20px_oklch(0.5_0.2_270/30%)]"
            >
              {activeMatch.player1}
            </button>
            <button
              onClick={() => onSelectWinner(group.name, activeMatch.id, 'draw')}
              className="bg-accent/40 hover:bg-muted-foreground hover:text-background transition-all duration-200 rounded-xl px-4 py-5 text-muted-foreground font-bold font-heading text-sm border border-dashed border-muted-foreground/30"
            >
              NUL
            </button>
            <button
              onClick={() => onSelectWinner(group.name, activeMatch.id, activeMatch.player2)}
              className="bg-secondary/60 hover:bg-gradient-to-br hover:from-primary hover:to-purple-glow hover:text-primary-foreground transition-all duration-300 rounded-xl px-6 py-5 text-foreground font-bold font-heading text-lg min-w-[100px] border border-glass-border hover:border-transparent hover:shadow-[0_0_20px_oklch(0.5_0.2_270/30%)]"
            >
              {activeMatch.player2}
            </button>
          </div>
          <p className="text-xs text-center text-muted-foreground/70">Cliquez sur le vainqueur ou NUL</p>
        </div>
      ) : (
        <div className="glass-card p-8 text-center text-muted-foreground">
          Tous les matchs de la Poule {group.name} sont terminés ✓
        </div>
      )}

      {/* Progress bar */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
          <span>Poule {group.name}: {completed} / {total} matchs</span>
          <span>{total > 0 ? Math.round((completed / total) * 100) : 0}%</span>
        </div>
        <div className="h-2 bg-secondary/50 rounded-full overflow-hidden">
          <div
            className="h-full progress-bar-gradient rounded-full transition-all duration-500"
            style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Match history for this group */}
      <div className="mt-4 glass-card p-4">
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2">Historique Poule {group.name}</h3>
        <div className="space-y-1 max-h-40 overflow-y-auto">
          {group.matches.filter(m => m.status === 'completed').map(m => (
            <div key={m.id} className="text-xs py-1.5 border-b border-glass-border last:border-0 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary/50 shrink-0" />
              <span className={m.winner === m.player1 ? 'text-foreground font-bold' : 'text-muted-foreground'}>{m.player1}</span>
              <span className="text-muted-foreground/50">{m.winner === 'draw' ? ' = ' : ' vs '}</span>
              <span className={m.winner === m.player2 ? 'text-foreground font-bold' : 'text-muted-foreground'}>{m.player2}</span>
              {m.winner === 'draw' && <span className="text-accent ml-1 text-[10px]">(NUL)</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function GroupStandings({ group }: { group: Group }) {
  return (
    <div className="glass-card p-4">
      <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-3">
        Classement Poule {group.name}
      </h2>
      <div className="max-h-[60vh] overflow-y-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-muted-foreground/70 uppercase tracking-wider">
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
            {group.standings.map((s, i) => {
              const isTied = i > 0 && group.standings[i - 1].points === s.points;
              return (
                <tr
                  key={s.player}
                  className={`border-t border-glass-border ${
                    i === 0 && s.points > 0 ? 'bg-gradient-to-r from-primary/15 to-transparent text-primary' : 'text-foreground'
                  }`}
                >
                  <td className="py-2 font-bold text-xs">{i + 1}</td>
                  <td className="py-2 font-heading font-bold text-xs">
                    {s.player}
                    {isTied && <span className="text-accent ml-1 text-[10px]">(égalité)</span>}
                  </td>
                  <td className="py-2 text-center font-bold text-xs">{s.points}</td>
                  <td className="py-2 text-center text-xs">{s.wins}</td>
                  <td className="py-2 text-center text-xs">{s.draws}</td>
                  <td className="py-2 text-center text-xs">{s.losses}</td>
                  <td className="py-2 text-center text-muted-foreground text-xs">{s.played}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
