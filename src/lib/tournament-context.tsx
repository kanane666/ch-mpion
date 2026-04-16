import { createContext, useContext, useReducer, type ReactNode } from 'react';
import type { TournamentState, TournamentAction } from './tournament-types';
import {
  generateBracket,
  generateRoundRobin,
  advanceKnockoutWinner,
  advanceChampionnatMatch,
  calculateStandings,
  distributePlayersIntoGroups,
  advanceGroupMatch,
  computeQualification,
  generateFinalBracket,
} from './tournament-logic';

const initialState: TournamentState = {
  format: 'knockout',
  players: [],
  matches: [],
  currentMatchIndex: 0,
  standings: [],
  phase: 'setup',
  champion: null,
  secondPlace: null,
  thirdPlace: null,
  numGroups: 2,
  groups: [],
  wildcardSlots: 0,
  qualifiedPlayers: [],
  wildcardCandidates: [],
  selectedWildcards: [],
  finalBracket: [],
};

function tournamentReducer(state: TournamentState, action: TournamentAction): TournamentState {
  switch (action.type) {
    case 'SET_FORMAT':
      return { ...state, format: action.format };
    case 'SET_PLAYERS':
      return { ...state, players: action.players };
    case 'SET_NUM_GROUPS':
      return { ...state, numGroups: action.numGroups };
    case 'SHUFFLE_GROUPS': {
      if (state.format !== 'coupe' || state.players.length < 4) return state;
      const groups = distributePlayersIntoGroups(state.players, state.numGroups);
      return { ...state, groups };
    }
    case 'START_TOURNAMENT': {
      if (state.format === 'knockout') {
        const matches = generateBracket(state.players);
        return { ...state, matches, phase: 'playing', currentMatchIndex: 0 };
      }
      if (state.format === 'championnat') {
        const matches = generateRoundRobin(state.players);
        const standings = calculateStandings(state.players, matches);
        return { ...state, matches, standings, phase: 'playing', currentMatchIndex: 0 };
      }
      if (state.format === 'coupe') {
        // Generate groups with matches
        let groups = state.groups.length > 0 ? state.groups : distributePlayersIntoGroups(state.players, state.numGroups);
        // Activate first match of first group
        groups = groups.map((g, gi) => {
          if (gi === 0 && g.matches.length > 0) {
            const ms = [...g.matches];
            ms[0] = { ...ms[0], status: 'active' };
            return { ...g, matches: ms };
          }
          return g;
        });
        return { ...state, groups, phase: 'group_stage' };
      }
      return state;
    }
    case 'SELECT_WINNER': {
      if (state.format === 'knockout') {
        const { matches, champion } = advanceKnockoutWinner(state.matches, action.matchId, action.winner);
        let secondPlace = null;
        let thirdPlace = null;
        if (champion) {
          const maxRound = Math.max(...matches.map(m => m.round));
          const finalMatch = matches.find(m => m.round === maxRound && m.status === 'completed');
          if (finalMatch) {
            secondPlace = finalMatch.player1 === champion ? finalMatch.player2 : finalMatch.player1;
          }
          const semiFinals = matches.filter(m => m.round === maxRound - 1);
          const semiLosers = semiFinals.map(m => m.player1 === m.winner ? m.player2 : m.player1).filter(Boolean);
          thirdPlace = semiLosers[0] || null;
        }
        return { ...state, matches, champion, secondPlace, thirdPlace, phase: champion ? 'results' : state.phase };
      } else {
        const { matches, standings, champion, secondPlace, thirdPlace } = advanceChampionnatMatch(
          state.matches, action.matchId, action.winner, state.players
        );
        return { ...state, matches, standings, champion, secondPlace, thirdPlace, phase: champion ? 'results' : state.phase };
      }
    }
    case 'SELECT_GROUP_WINNER': {
      const groups = advanceGroupMatch(state.groups, action.groupName, action.matchId, action.winner);
      return { ...state, groups };
    }
    case 'FINISH_GROUP_STAGE': {
      const { directQualifiers, wildcardSlots, wildcardCandidates } = computeQualification(state.groups);
      const qualifiedPlayers = directQualifiers.map(q => q.player);
      if (wildcardSlots === 0) {
        // Go directly to final phase
        const finalBracket = generateFinalBracket(qualifiedPlayers);
        return { ...state, qualifiedPlayers, wildcardSlots: 0, wildcardCandidates: [], selectedWildcards: [], finalBracket, phase: 'final_phase' };
      }
      return { ...state, qualifiedPlayers, wildcardSlots, wildcardCandidates, selectedWildcards: [], phase: 'wildcard_selection' };
    }
    case 'TOGGLE_WILDCARD': {
      const { selectedWildcards, wildcardSlots } = state;
      if (selectedWildcards.includes(action.player)) {
        return { ...state, selectedWildcards: selectedWildcards.filter(p => p !== action.player) };
      }
      if (selectedWildcards.length >= wildcardSlots) return state;
      return { ...state, selectedWildcards: [...selectedWildcards, action.player] };
    }
    case 'CONFIRM_WILDCARDS': {
      const allQualified = [...state.qualifiedPlayers, ...state.selectedWildcards];
      const finalBracket = generateFinalBracket(allQualified);
      return { ...state, finalBracket, phase: 'final_phase' };
    }
    case 'SELECT_FINAL_WINNER': {
      const { matches: bracket, champion } = advanceKnockoutWinner(state.finalBracket, action.matchId, action.winner);
      if (champion) {
        const maxRound = Math.max(...bracket.map(m => m.round));
        const finalMatch = bracket.find(m => m.round === maxRound && m.status === 'completed');
        const secondPlace = finalMatch ? (finalMatch.player1 === champion ? finalMatch.player2 : finalMatch.player1) : null;
        return { ...state, finalBracket: bracket, champion, secondPlace, phase: 'results' };
      }
      return { ...state, finalBracket: bracket };
    }
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

const TournamentContext = createContext<{
  state: TournamentState;
  dispatch: React.Dispatch<TournamentAction>;
} | null>(null);

export function TournamentProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(tournamentReducer, initialState);
  return (
    <TournamentContext.Provider value={{ state, dispatch }}>
      {children}
    </TournamentContext.Provider>
  );
}

export function useTournament() {
  const ctx = useContext(TournamentContext);
  if (!ctx) throw new Error('useTournament must be used within TournamentProvider');
  return ctx;
}
