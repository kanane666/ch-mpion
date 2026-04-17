import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (localStorage.getItem('champion-install-dismissed')) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!deferredPrompt || dismissed) return null;

  const handleInstall = async () => {
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
    setDismissed(true);
  };

  const handleDismiss = () => {
    localStorage.setItem('champion-install-dismissed', '1');
    setDismissed(true);
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md animate-scale-up">
      <div className="glass-card flex items-center gap-3 p-4 border border-glass-border shadow-[0_8px_32px_oklch(0_0_0/30%)]">
        <span className="text-2xl">📲</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-foreground">Installer CHAMPION sur votre téléphone ?</p>
        </div>
        <button
          onClick={handleInstall}
          className="btn-champion px-4 py-2 text-xs shrink-0"
        >
          INSTALLER
        </button>
        <button
          onClick={handleDismiss}
          className="text-muted-foreground hover:text-foreground text-lg leading-none transition-colors"
          aria-label="Fermer"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
