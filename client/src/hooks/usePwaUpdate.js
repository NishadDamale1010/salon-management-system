import { useCallback, useEffect, useRef } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { toast } from "sonner";
import { BUILD_ID } from "../generated/buildMeta.js";

const UPDATE_CHECK_INTERVAL_MS = 5 * 60 * 1000;
const UPDATE_TOAST_ID = "pwa-update";

export function usePwaUpdate() {
    const registrationRef = useRef(null);
    const updateToastShownRef = useRef(false);
    const updateServiceWorkerRef = useRef(() => Promise.resolve());
    const setNeedRefreshRef = useRef(() => {});

    const showUpdateToast = useCallback(() => {
        if (updateToastShownRef.current) return;

        updateToastShownRef.current = true;
        toast.info("App update available", {
            id: UPDATE_TOAST_ID,
            description: "A new version is ready with the latest features.",
            duration: Infinity,
            action: {
                label: "Update",
                onClick: () => {
                    updateServiceWorkerRef.current(true);
                },
            },
        });
    }, []);

    const {
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(registration) {
            registrationRef.current = registration;
            registration?.update();
        },
        onRegisterError(error) {
            console.error("Service worker registration failed:", error);
        },
        onNeedRefresh() {
            setNeedRefreshRef.current(true);
            showUpdateToast();
        },
    });

    useEffect(() => {
        updateServiceWorkerRef.current = updateServiceWorker;
        setNeedRefreshRef.current = setNeedRefresh;
    }, [updateServiceWorker, setNeedRefresh]);

    const showUpdatePrompt = useCallback(() => {
        setNeedRefresh(true);
        showUpdateToast();
    }, [setNeedRefresh, showUpdateToast]);

    const checkRemoteVersion = useCallback(async () => {
        try {
            const response = await fetch(`/version.json?${Date.now()}`, {
                cache: "no-store",
            });

            if (!response.ok) return;

            const { buildId } = await response.json();
            if (buildId && buildId !== BUILD_ID) {
                showUpdatePrompt();
            }
        } catch {
            // Ignore network errors during version check
        }
    }, [showUpdatePrompt]);

    const checkForUpdates = useCallback(() => {
        registrationRef.current?.update();
        checkRemoteVersion();
    }, [checkRemoteVersion]);

    useEffect(() => {
        checkForUpdates();

        const onVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                checkForUpdates();
            }
        };

        const onFocus = () => checkForUpdates();
        const onPageShow = (event) => {
            if (event.persisted) {
                checkForUpdates();
            }
        };

        document.addEventListener("visibilitychange", onVisibilityChange);
        window.addEventListener("focus", onFocus);
        window.addEventListener("pageshow", onPageShow);

        const intervalId = window.setInterval(checkForUpdates, UPDATE_CHECK_INTERVAL_MS);

        return () => {
            document.removeEventListener("visibilitychange", onVisibilityChange);
            window.removeEventListener("focus", onFocus);
            window.removeEventListener("pageshow", onPageShow);
            window.clearInterval(intervalId);
        };
    }, [checkForUpdates]);

    const applyUpdate = useCallback(() => {
        toast.dismiss(UPDATE_TOAST_ID);
        updateToastShownRef.current = false;
        updateServiceWorker(true);
    }, [updateServiceWorker]);

    const dismissUpdate = useCallback(() => {
        setNeedRefresh(false);
        toast.dismiss(UPDATE_TOAST_ID);
        updateToastShownRef.current = false;
    }, [setNeedRefresh]);

    return {
        needRefresh,
        applyUpdate,
        dismissUpdate,
        checkForUpdates,
    };
}
