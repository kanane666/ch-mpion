import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/about')({
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen bg-radial-gradient flex items-center justify-center p-4 md:p-8">
      <div className="glass-card p-8 md:p-10 w-full max-w-lg animate-scale-up text-center">
        <div className="text-5xl mb-4 animate-float">🏆</div>

        <h1 className="text-3xl md:text-4xl font-bold font-heading tracking-tight mb-2 text-gradient">
          CHAMPION
        </h1>

        <p className="text-sm text-muted-foreground mb-6">
          Version 1.0 —{' '}
          <span
            className="inline-block px-1.5 py-0.5 rounded-full text-[10px] font-bold uppercase leading-none"
            style={{ backgroundColor: '#F59E0B', color: '#000' }}
          >
            BÊTA
          </span>
        </p>

        <div className="text-sm text-foreground/80 space-y-4 text-left mb-8">
          <p>
            CHAMPION est une application de gestion de tournois sportifs et compétitifs,
            conçue pour être simple, rapide et accessible à tous.
          </p>
          <p>
            Créée pour les compétitions entre amis, en famille, en école, ou en événement,
            elle permet de générer et suivre n'importe quel tournoi en quelques secondes.
          </p>
        </div>

        <div className="border-t border-glass-border pt-6 mb-6">
          <p className="text-xs text-muted-foreground uppercase tracking-[0.2em] mb-3">Développée avec passion par</p>
          <p className="text-lg font-bold text-foreground font-heading">Ababacar Dieng</p>
          <p className="text-sm text-muted-foreground">Ingénieur en Génie Logiciel</p>
          <a
            href="mailto:diengbabacar666@gmail.com"
            className="inline-block mt-2 text-sm text-primary hover:underline transition-colors"
          >
            📧 diengbabacar666@gmail.com
          </a>
        </div>

        <blockquote className="border-l-2 border-primary pl-4 text-sm italic text-muted-foreground mb-8 text-left">
          "Chaque grand champion a d'abord commencé par un premier tournoi."
        </blockquote>

        <p className="text-xs text-muted-foreground mb-6">
          Pour toute question, suggestion ou rapport de bug,
          n'hésitez pas à envoyer un message directement par email.
        </p>

        <Link
          to="/"
          className="btn-champion inline-block px-6 py-3 text-sm"
        >
          ← RETOUR AU TOURNOI
        </Link>
      </div>
    </div>
  );
}
