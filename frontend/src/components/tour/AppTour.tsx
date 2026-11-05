import Joyride, { ACTIONS, CallBackProps, EVENTS, STATUS, Step } from "react-joyride";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";

const TOUR_STORAGE_PREFIX = "medyra:tour:v1:";
const TOUR_PENDING_KEY = "medyra:tour:pending";

const AppTour = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  const userKey = user?.id ? String(user.id) : user?.email ?? null;
  const storageKey = userKey ? `${TOUR_STORAGE_PREFIX}${userKey}` : null;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!media) return;
    const handleChange = (event: MediaQueryListEvent) => {
      setReduceMotion(event.matches);
    };
    setReduceMotion(media.matches);
    if (media.addEventListener) {
      media.addEventListener("change", handleChange);
      return () => media.removeEventListener("change", handleChange);
    }
  }, []);

  useEffect(() => {
    if (!storageKey || !user) {
      setRun(false);
      return;
    }
    if (location.pathname !== "/admin") {
      setRun(false);
      return;
    }
    const pending = sessionStorage.getItem(TOUR_PENDING_KEY) === "true";
    const completed = localStorage.getItem(storageKey) === "done";
    if (pending || !completed) {
      setStepIndex(0);
      setRun(true);
      sessionStorage.removeItem(TOUR_PENDING_KEY);
    } else {
      setRun(false);
    }
  }, [location.pathname, storageKey, user]);

  const steps = useMemo<Step[]>(
    () => [
      {
        target: '[data-tour="nav-brand"]',
        title: "Welcome to Medyra",
        content: "This quick tour shows where everything is.",
        disableBeacon: true
      },
      {
        target: '[data-tour="dash-kpis"]',
        title: "Dashboard",
        content: "Your clinic overview at a glance."
      },
      {
        target: '[data-tour="nav-patients"]',
        title: "Patients",
        content: "Create and manage patient records here."
      },
      {
        target: '[data-tour="nav-appointments"]',
        title: "Appointments",
        content: "Track visits and statuses here."
      },
      {
        target: '[data-tour="nav-new-appointment"]',
        title: "New appointment",
        content: "Schedule a new appointment in seconds."
      },
      {
        target: '[data-tour="nav-profile"]',
        title: "Profile",
        content: "Update your profile and preferences here."
      }
    ],
    []
  );

  const handleCallback = (data: CallBackProps) => {
    const { status, type, action } = data;
    if (!storageKey) return;
    if (type === EVENTS.TARGET_NOT_FOUND) {
      setStepIndex((prev) => prev + 1);
      return;
    }
    if (type === EVENTS.STEP_AFTER) {
      const delta = action === ACTIONS.PREV ? -1 : 1;
      setStepIndex((prev) => prev + delta);
    }
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      localStorage.setItem(storageKey, "done");
      setRun(false);
    }
  };

  if (!user || !storageKey) return null;

  return (
    <Joyride
      steps={steps}
      run={run}
      stepIndex={stepIndex}
      callback={handleCallback}
      continuous
      showSkipButton
      scrollToFirstStep
      disableOverlayClose={false}
      disableScrolling={reduceMotion}
      spotlightPadding={14}
      styles={{
        options: {
          arrowColor: "rgb(var(--color-surface) / 0.92)",
          backgroundColor: "rgb(var(--color-surface) / 0.92)",
          overlayColor: "rgba(15, 23, 42, 0.45)",
          textColor: "rgb(var(--color-text))",
          primaryColor: "rgb(var(--color-primary))",
          width: 320,
          zIndex: 9999
        },
        tooltip: {
          border: "1px solid rgb(var(--color-border) / 0.6)",
          backdropFilter: "blur(16px)",
          borderRadius: 18,
          boxShadow: "var(--shadow-card)"
        },
        tooltipContainer: {
          textAlign: "left"
        },
        buttonNext: {
          background: "rgb(var(--color-primary))",
          color: "rgb(var(--color-text))",
          borderRadius: 999,
          padding: "8px 16px",
          fontWeight: 600
        },
        buttonBack: {
          marginRight: 8,
          color: "rgb(var(--color-text-muted))"
        },
        buttonSkip: {
          color: "rgb(var(--color-text-muted))"
        }
      }}
    />
  );
};

export default AppTour;
