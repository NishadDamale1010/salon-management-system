import { useState, useEffect } from "react";

export function useInstallPrompt() {
  const [installPromptEvent, setInstallPromptEvent] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the default browser install prompt
      e.preventDefault();
      // Store the event for later triggering
      setInstallPromptEvent(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Check if the app is already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstallable(false);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const triggerInstall = async () => {
    if (!installPromptEvent) return false;

    // Show the browser's install prompt
    installPromptEvent.prompt();

    // Wait for the user's choice
    const { outcome } = await installPromptEvent.userChoice;
    
    // Clear the stored event
    setInstallPromptEvent(null);
    setIsInstallable(false);

    return outcome === "accepted";
  };

  return { isInstallable, triggerInstall };
}
