import { createFileRoute } from "@tanstack/react-router";
import { TournamentProvider, useTournament } from "@/lib/tournament-context";
import { SetupScreen } from "@/components/SetupScreen";
import { KnockoutScreen } from "@/components/KnockoutScreen";
import { ChampionnatScreen } from "@/components/ChampionnatScreen";
import { CoupeScreen } from "@/components/CoupeScreen";
import { WildcardScreen } from "@/components/WildcardScreen";
import { FinalPhaseScreen } from "@/components/FinalPhaseScreen";
import { ResultsScreen } from "@/components/ResultsScreen";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CHAMPION 🏆 — Gestion de Tournois" },
      { name: "description", content: "Application de gestion de tournois avec modes Knockout, Championnat et Coupe avec poules." },
      { property: "og:title", content: "CHAMPION 🏆 — Gestion de Tournois" },
      { property: "og:description", content: "Créez et gérez vos tournois facilement." },
    ],
  }),
  component: Index,
});

function TournamentApp() {
  const { state } = useTournament();

  if (state.phase === 'setup') return <SetupScreen />;
  if (state.phase === 'results') return <ResultsScreen />;

  if (state.format === 'knockout') return <KnockoutScreen />;
  if (state.format === 'championnat') return <ChampionnatScreen />;

  // Coupe avec poules
  if (state.phase === 'group_stage') return <CoupeScreen />;
  if (state.phase === 'wildcard_selection') return <WildcardScreen />;
  if (state.phase === 'final_phase') return <FinalPhaseScreen />;

  return <SetupScreen />;
}

function Index() {
  return (
    <TournamentProvider>
      <TournamentApp />
    </TournamentProvider>
  );
}
