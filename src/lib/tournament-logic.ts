import type { Match, Standing, Group } from './tournament-types';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getRoundLabel(totalRounds: number, round: number): string {
  const remaining = totalRounds - round;
  if (remaining === 0) return 'Finale';
  if (remaining === 1) return 'Demi-finales';
  if (remaining === 2) return 'Quarts de finale';
  return `Tour ${round + 1}`;
}

// ============ KNOCKOUT ============

export function generateBracket(players: string[]): Match[] {
  const shuffled = shuffle(players);
  let size = 4;
  while (size < shuffled.length) size *= 2;

  const padded = [...shuffled];
  const totalRounds = Math.log2(size);
  const matches: Match[] = [];

  for (let i = 0; i < size / 2; i++) {
    const p1 = padded[i * 2] || '';
    const p2 = padded[i * 2 + 1] || '';
    const isBye = !p1 || !p2;
    matches.push({
      id: `r0-m${i}`,
      player1: p1,
      player2: p2,
      winner: isBye ? (p1 || p2) : null,
      round: 0,
      roundLabel: getRoundLabel(totalRounds, 0),
      status: isBye ? 'completed' : (i === 0 ? 'active' : 'pending'),
      bracketPosition: i,
    });
  }

  for (let r = 1; r < totalRounds; r++) {
    const matchesInRound = size / Math.pow(2, r + 1);
    for (let i = 0; i < matchesInRound; i++) {
      matches.push({
        id: `r${r}-m${i}`,
        player1: '',
        player2: '',
        winner: null,
        round: r,
        roundLabel: getRoundLabel(totalRounds, r),
        status: 'pending',
        bracketPosition: i,
      });
    }
  }

  return processAdvancement(matches, totalRounds);
}

function processAdvancement(matches: Match[], totalRounds: number): Match[] {
  const result = [...matches];

  for (let r = 0; r < totalRounds - 1; r++) {
    const roundMatches = result.filter(m => m.round === r);
    const nextRoundMatches = result.filter(m => m.round === r + 1);

    for (let i = 0; i < roundMatches.length; i += 2) {
      const nextMatchIdx = Math.floor(i / 2);
      const nextMatch = nextRoundMatches[nextMatchIdx];
      if (!nextMatch) continue;

      const m1 = roundMatches[i];
      const m2 = roundMatches[i + 1];

      if (m1?.winner) {
        const nmIdx = result.findIndex(m => m.id === nextMatch.id);
        result[nmIdx] = { ...result[nmIdx], player1: m1.winner };
      }
      if (m2?.winner) {
        const nmIdx = result.findIndex(m => m.id === nextMatch.id);
        result[nmIdx] = { ...result[nmIdx], player2: m2.winner };
      }
    }
  }

  const firstPending = result.find(m => m.status === 'pending' && m.player1 && m.player2);
  if (firstPending) {
    const idx = result.findIndex(m => m.id === firstPending.id);
    result[idx] = { ...result[idx], status: 'active' };
  }

  return result;
}

export function advanceKnockoutWinner(matches: Match[], matchId: string, winner: string): { matches: Match[]; champion: string | null } {
  let result = matches.map(m =>
    m.id === matchId ? { ...m, winner, status: 'completed' as const } : m
  );

  const completedMatch = result.find(m => m.id === matchId)!;
  const round = completedMatch.round;
  const totalRounds = Math.max(...result.map(m => m.round)) + 1;

  if (round === totalRounds - 1) {
    return { matches: result, champion: winner };
  }

  const pos = completedMatch.bracketPosition!;
  const pairIndex = Math.floor(pos / 2);
  const isFirst = pos % 2 === 0;

  const nextRoundMatches = result.filter(m => m.round === round + 1);
  const nextMatch = nextRoundMatches[pairIndex];

  if (nextMatch) {
    const nmIdx = result.findIndex(m => m.id === nextMatch.id);
    if (isFirst) {
      result[nmIdx] = { ...result[nmIdx], player1: winner };
    } else {
      result[nmIdx] = { ...result[nmIdx], player2: winner };
    }
  }

  result = result.map(m => m.status === 'active' ? { ...m, status: 'pending' as const } : m);
  result = result.map(m => m.winner ? { ...m, status: 'completed' as const } : m);

  // Auto-advance BYE matches
  for (const m of result) {
    if (m.status === 'pending' && m.player1 === '[BYE]' && m.player2) {
      const idx = result.findIndex(mm => mm.id === m.id);
      result[idx] = { ...result[idx], winner: m.player2, status: 'completed' as const };
    } else if (m.status === 'pending' && m.player2 === '[BYE]' && m.player1) {
      const idx = result.findIndex(mm => mm.id === m.id);
      result[idx] = { ...result[idx], winner: m.player1, status: 'completed' as const };
    }
  }

  // Re-advance after BYEs
  const totalR = Math.max(...result.map(m => m.round)) + 1;
  for (let r = 0; r < totalR - 1; r++) {
    const rMatches = result.filter(m => m.round === r && m.status === 'completed');
    const nrMatches = result.filter(m => m.round === r + 1);
    for (const cm of rMatches) {
      if (!cm.winner) continue;
      const p = cm.bracketPosition!;
      const pi = Math.floor(p / 2);
      const isF = p % 2 === 0;
      const nm = nrMatches[pi];
      if (!nm) continue;
      const nmi = result.findIndex(m => m.id === nm.id);
      if (isF && !result[nmi].player1) {
        result[nmi] = { ...result[nmi], player1: cm.winner };
      } else if (!isF && !result[nmi].player2) {
        result[nmi] = { ...result[nmi], player2: cm.winner };
      }
    }
  }

  // Check final
  const finalMatch = result.find(m => m.round === totalRounds - 1 && m.status === 'completed' && m.winner);
  if (finalMatch) {
    return { matches: result, champion: finalMatch.winner! };
  }

  const nextPlayable = result.find(m => m.status === 'pending' && m.player1 && m.player2 && m.player1 !== '[BYE]' && m.player2 !== '[BYE]');
  if (nextPlayable) {
    const idx = result.findIndex(m => m.id === nextPlayable.id);
    result[idx] = { ...result[idx], status: 'active' };
  }

  return { matches: result, champion: null };
}

// ============ ROUND ROBIN / CHAMPIONNAT ============

export function generateRoundRobin(players: string[]): Match[] {
  const matches: Match[] = [];
  let matchNum = 0;

  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      matches.push({
        id: `rr-m${matchNum}`,
        player1: players[i],
        player2: players[j],
        winner: null,
        round: 0,
        roundLabel: 'Phase de groupes',
        status: 'pending',
      });
      matchNum++;
    }
  }

  const shuffled = shuffle(matches);
  return shuffled.map((m, i) => ({
    ...m,
    id: `rr-m${i}`,
    status: i === 0 ? 'active' as const : 'pending' as const,
  }));
}

export function calculateStandings(players: string[], matches: Match[]): Standing[] {
  const standings: Standing[] = players.map(p => ({
    player: p,
    points: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    played: 0,
  }));

  for (const match of matches) {
    if (match.status !== 'completed' || match.isPlayoff) continue;
    if (match.winner === 'draw') {
      const p1Idx = standings.findIndex(s => s.player === match.player1);
      const p2Idx = standings.findIndex(s => s.player === match.player2);
      if (p1Idx >= 0) { standings[p1Idx].points += 1; standings[p1Idx].draws += 1; standings[p1Idx].played += 1; }
      if (p2Idx >= 0) { standings[p2Idx].points += 1; standings[p2Idx].draws += 1; standings[p2Idx].played += 1; }
    } else if (match.winner) {
      const winnerIdx = standings.findIndex(s => s.player === match.winner);
      const loser = match.player1 === match.winner ? match.player2 : match.player1;
      const loserIdx = standings.findIndex(s => s.player === loser);
      if (winnerIdx >= 0) { standings[winnerIdx].points += 3; standings[winnerIdx].wins += 1; standings[winnerIdx].played += 1; }
      if (loserIdx >= 0) { standings[loserIdx].losses += 1; standings[loserIdx].played += 1; }
    }
  }

  return standings.sort((a, b) => b.points - a.points || b.wins - a.wins || a.player.localeCompare(b.player));
}

export function advanceChampionnatMatch(
  matches: Match[],
  matchId: string,
  winner: string, // can be 'draw'
  players: string[]
): { matches: Match[]; standings: Standing[]; champion: string | null; secondPlace: string | null; thirdPlace: string | null } {
  let result = matches.map(m =>
    m.id === matchId ? { ...m, winner, status: 'completed' as const } : m
  );

  const standings = calculateStandings(players, result);

  const groupMatches = result.filter(m => !m.isPlayoff);
  const allGroupDone = groupMatches.every(m => m.status === 'completed');

  if (allGroupDone) {
    const playoffMatches = result.filter(m => m.isPlayoff);

    if (playoffMatches.length === 0) {
      const top4 = standings.slice(0, Math.min(4, standings.length));

      if (top4.length >= 2) {
        result.push({
          id: 'playoff-final',
          player1: top4[0].player,
          player2: top4[1].player,
          winner: null,
          round: 1,
          roundLabel: 'Finale',
          status: 'active',
          isPlayoff: true,
          playoffType: 'final',
        });
      }

      if (top4.length >= 4) {
        result.push({
          id: 'playoff-bronze',
          player1: top4[2].player,
          player2: top4[3].player,
          winner: null,
          round: 1,
          roundLabel: 'Petite Finale',
          status: 'pending',
          isPlayoff: true,
          playoffType: 'bronze',
        });
      }
    } else {
      const updatedPlayoffs = result.filter(m => m.isPlayoff);
      const allDone = updatedPlayoffs.every(m => m.status === 'completed');

      if (allDone) {
        const finalMatch = updatedPlayoffs.find(m => m.playoffType === 'final');
        const bronzeMatch = updatedPlayoffs.find(m => m.playoffType === 'bronze');

        return {
          matches: result,
          standings,
          champion: finalMatch?.winner || null,
          secondPlace: finalMatch ? (finalMatch.player1 === finalMatch.winner ? finalMatch.player2 : finalMatch.player1) : null,
          thirdPlace: bronzeMatch?.winner || null,
        };
      }
    }
  }

  const nextPending = result.find(m => m.status === 'pending' && m.player1 && m.player2);
  if (nextPending) {
    const idx = result.findIndex(m => m.id === nextPending.id);
    result[idx] = { ...result[idx], status: 'active' };
  }

  return { matches: result, standings, champion: null, secondPlace: null, thirdPlace: null };
}

// ============ COUPE AVEC POULES ============

export function distributePlayersIntoGroups(players: string[], numGroups: number): Group[] {
  const shuffled = shuffle(players);
  const groups: Group[] = Array.from({ length: numGroups }, (_, i) => ({
    name: String.fromCharCode(65 + i),
    players: [],
    matches: [],
    standings: [],
  }));

  shuffled.forEach((player, i) => {
    groups[i % numGroups].players.push(player);
  });

  // Sort so larger groups first
  groups.sort((a, b) => b.players.length - a.players.length);

  // Generate matches & standings for each group
  for (const group of groups) {
    group.matches = generateGroupMatches(group.name, group.players);
    group.standings = calculateStandings(group.players, group.matches);
  }

  return groups;
}

function generateGroupMatches(groupName: string, players: string[]): Match[] {
  const matches: Match[] = [];
  let num = 0;
  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      matches.push({
        id: `g${groupName}-m${num}`,
        player1: players[i],
        player2: players[j],
        winner: null,
        round: 0,
        roundLabel: `Poule ${groupName}`,
        status: 'pending',
        groupName,
      });
      num++;
    }
  }
  const shuffled = shuffle(matches);
  return shuffled.map((m, i) => ({ ...m, id: `g${groupName}-m${i}` }));
}

export function getDirectQualifiersCount(groupSize: number): number {
  if (groupSize <= 3) return 1;
  return 2;
}

function nextPowerOf2(n: number): number {
  let p = 2;
  while (p < n) p *= 2;
  return p;
}

export function computeQualification(groups: Group[]): {
  directQualifiers: { player: string; rank: number; group: string }[];
  wildcardSlots: number;
  wildcardCandidates: Standing[];
} {
  const directQualifiers: { player: string; rank: number; group: string }[] = [];
  const thirdPlaceFinishers: (Standing & { group: string })[] = [];

  for (const group of groups) {
    const qCount = getDirectQualifiersCount(group.players.length);
    for (let i = 0; i < qCount && i < group.standings.length; i++) {
      directQualifiers.push({ player: group.standings[i].player, rank: i + 1, group: group.name });
    }
    if (group.standings.length >= 3) {
      thirdPlaceFinishers.push({ ...group.standings[2], group: group.name });
    }
  }

  const target = nextPowerOf2(directQualifiers.length);
  let wildcardSlots = 0;
  if (directQualifiers.length < target) {
    wildcardSlots = Math.min(target - directQualifiers.length, thirdPlaceFinishers.length);
  }

  const wildcardCandidates = thirdPlaceFinishers
    .sort((a, b) => b.points - a.points || b.wins - a.wins || a.player.localeCompare(b.player));

  return { directQualifiers, wildcardSlots, wildcardCandidates };
}

export function generateFinalBracket(qualifiedPlayers: string[]): Match[] {
  const size = nextPowerOf2(qualifiedPlayers.length);
  const padded = [...qualifiedPlayers];
  while (padded.length < size) padded.push('[BYE]');

  const totalRounds = Math.log2(size);
  const matches: Match[] = [];

  for (let i = 0; i < size / 2; i++) {
    const p1 = padded[i * 2];
    const p2 = padded[i * 2 + 1];
    const isBye = p1 === '[BYE]' || p2 === '[BYE]';
    matches.push({
      id: `final-r0-m${i}`,
      player1: p1,
      player2: p2,
      winner: isBye ? (p1 === '[BYE]' ? p2 : p1) : null,
      round: 0,
      roundLabel: getRoundLabel(totalRounds, 0),
      status: isBye ? 'completed' : 'pending',
      bracketPosition: i,
    });
  }

  for (let r = 1; r < totalRounds; r++) {
    const matchesInRound = size / Math.pow(2, r + 1);
    for (let i = 0; i < matchesInRound; i++) {
      matches.push({
        id: `final-r${r}-m${i}`,
        player1: '',
        player2: '',
        winner: null,
        round: r,
        roundLabel: getRoundLabel(totalRounds, r),
        status: 'pending',
        bracketPosition: i,
      });
    }
  }

  return processAdvancement(matches, totalRounds);
}

export function advanceGroupMatch(
  groups: Group[],
  groupName: string,
  matchId: string,
  winner: string // can be 'draw'
): Group[] {
  return groups.map(g => {
    if (g.name !== groupName) return g;
    let newMatches = g.matches.map(m =>
      m.id === matchId ? { ...m, winner, status: 'completed' as const } : m
    );
    // Activate next pending
    const hasActive = newMatches.some(m => m.status === 'active');
    if (!hasActive) {
      const next = newMatches.find(m => m.status === 'pending');
      if (next) {
        newMatches = newMatches.map(m => m.id === next.id ? { ...m, status: 'active' as const } : m);
      }
    }
    const newStandings = calculateStandings(g.players, newMatches);
    return { ...g, matches: newMatches, standings: newStandings };
  });
}
