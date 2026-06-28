import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "sonner";
import AppRouter from "../routes";
import UpdateToast from "../components/pwa/UpdateToast";
import InstallBanner from "../components/pwa/InstallBanner";
import OfflinePage from "../components/pwa/OfflinePage";
import { usePwaUpdate } from "../hooks/usePwaUpdate";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
    },
  },
});

export default function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const { needRefresh, applyUpdate, dismissUpdate } = usePwaUpdate();

  if (!isOnline) {
    return <OfflinePage />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AppRouter />
      <Toaster
        position="top-right"
        richColors
        theme="dark"
        toastOptions={{
          style: {
            background: "var(--color-surface-2)",
            border: "1px solid var(--color-border)",
            color: "var(--color-text-primary)",
          },
        }}
      />
      
      {/* PWA Elements */}
      <InstallBanner />
      <UpdateToast
        needRefresh={needRefresh}
        updateServiceWorker={applyUpdate}
        close={dismissUpdate}
      />

      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
