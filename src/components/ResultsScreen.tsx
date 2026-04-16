import { useEffect, useRef } from 'react';
import { useTournament } from '@/lib/tournament-context';

export function ResultsScreen() {
  const { state, dispatch } = useTournament();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: { x: number; y: number; vx: number; vy: number; color: string; size: number; rotation: number; rotSpeed: number }[] = [];
    const colors = ['#FFD700', '#2563EB', '#FF6B6B', '#4ADE80', '#A78BFA', '#FB923C'];

    for (let i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        vx: (Math.random() - 0.5) * 3,
        vy: Math.random() * 3 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 10,
      });
    }

    let animId: number;
    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();

        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotSpeed;
        p.vy += 0.02;

        if (p.y > canvas.height + 20) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
          p.vy = Math.random() * 3 + 1;
        }
      }
      animId = requestAnimationFrame(animate);
    }
    animate();
    return () => cancelAnimationFrame(animId);
  }, []);

  const podium = [
    { place: '🥇', label: '1er', player: state.champion, colorClass: 'text-gold', bgClass: 'bg-gold/10 border-gold/30' },
    { place: '🥈', label: '2ème', player: state.secondPlace, colorClass: 'text-silver', bgClass: 'bg-silver/10 border-silver/30' },
    { place: '🥉', label: '3ème', player: state.thirdPlace, colorClass: 'text-bronze', bgClass: 'bg-bronze/10 border-bronze/30' },
  ];

  function handleShare() {
    const text = `🏆 CHAMPION — ${state.champion} a remporté le tournoi !`;
    navigator.clipboard.writeText(text);
    alert('Copié dans le presse-papier !');
  }

  return (
    <div className="min-h-screen bg-radial-gradient flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-10" />

      <div className="relative z-20 text-center max-w-xl w-full">
        <div className="animate-trophy-bounce text-7xl mb-4">🏆</div>
        <h1 className="text-4xl md:text-5xl font-bold font-heading text-foreground mb-2 animate-fade-up">
          CHAMPION
        </h1>
        <p className="text-muted-foreground mb-10 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          Le tournoi est terminé !
        </p>

        <div className="space-y-4 mb-10">
          {podium.map((p, i) => (
            p.player && (
              <div
                key={i}
                className={`glass-card p-5 border ${p.bgClass} animate-fade-up flex items-center gap-4`}
                style={{ animationDelay: `${0.2 + i * 0.15}s` }}
              >
                <span className="text-4xl">{p.place}</span>
                <div className="text-left">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">{p.label}</div>
                  <div className={`text-xl font-bold font-heading ${p.colorClass}`}>{p.player}</div>
                </div>
              </div>
            )
          ))}
        </div>

        <div className="flex gap-3 justify-center animate-fade-up" style={{ animationDelay: '0.6s' }}>
          <button
            onClick={() => dispatch({ type: 'RESET' })}
            className="btn-champion"
          >
            Nouveau tournoi
          </button>
          <button
            onClick={handleShare}
            className="btn-champion bg-secondary text-secondary-foreground hover:bg-secondary/80"
            style={{ background: 'var(--secondary)' }}
          >
            Partager
          </button>
        </div>
      </div>
    </div>
  );
}
