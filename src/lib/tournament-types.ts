export type TournamentFormat = 'knockout' | 'championnat' | 'coupe';
export type Phase = 'setup' | 'playing' | 'group_stage' | 'wildcard_selection' | 'final_phase' | 'results';

export interface Match {
  id: string;
  player1: string;
  player2: string;
  winner: string | null; // 'draw' for draws
  round: number;
  roundLabel: string;
  status: 'pending' | 'active' | 'completed';
  bracketPosition?: number;
  isPlayoff?: boolean;
  playoffType?: 'final' | 'bronze';
  groupName?: string; // For coupe mode
}

export interface Standing {
  player: string;
  points: number;
  wins: number;
  draws: number;
  losses: number;
  played: number;
}

export interface Group {
  name: string;
  players: string[];
  matches: Match[];
  standings: Standing[];
}

export interface TournamentState {
  format: TournamentFormat;
  players: string[];
  matches: Match[];
  currentMatchIndex: number;
  standings: Standing[];
  phase: Phase;
  champion: string | null;
  secondPlace: string | null;
  thirdPlace: string | null;
  // Coupe avec poules
  numGroups: number;
  groups: Group[];
  wildcardSlots: number;
  qualifiedPlayers: string[];
  wildcardCandidates: Standing[];
  selectedWildcards: string[];
  finalBracket: Match[];
}

export type TournamentAction =
  | { type: 'SET_FORMAT'; format: TournamentFormat }
  | { type: 'SET_PLAYERS'; players: string[] }
  | { type: 'SET_NUM_GROUPS'; numGroups: number }
  | { type: 'SHUFFLE_GROUPS' }
  | { type: 'START_TOURNAMENT' }
  | { type: 'SELECT_WINNER'; matchId: string; winner: string }
  | { type: 'SELECT_GROUP_WINNER'; groupName: string; matchId: string; winner: string }
  | { type: 'FINISH_GROUP_STAGE' }
  | { type: 'TOGGLE_WILDCARD'; player: string }
  | { type: 'CONFIRM_WILDCARDS' }
  | { type: 'SELECT_FINAL_WINNER'; matchId: string; winner: string }
  | { type: 'RESET' };
