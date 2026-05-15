import React, { useEffect, useCallback, useState } from "react";
import { useSession } from "next-auth/react";
import { trpc } from "../utils/trpc";
import { toast } from "react-toastify";
import { useRouter } from "next/router";

import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import useIsMobile from "../utils/useIsMobile";

interface WelcomeTutorialProps {
  onComplete?: () => void;
}

const WelcomeTutorial: React.FC<WelcomeTutorialProps> = ({ onComplete }) => {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [isCompleting, setIsCompleting] = useState(false);
  // Use the exact same mobile detection as the main page
  const isMobile = useIsMobile();

  const utils = trpc.useContext();

  const completeTutorialMutation = trpc.user.completeTutorial.useMutation({
    onSuccess: async () => {
      utils.user.me.invalidate();
      // Update session to reflect tutorial completion
      await update();
      setIsCompleting(false); // Reset completion flag
      onComplete?.();
    },
    onError: (error) => {
      console.error("Error completing tutorial:", error);
      setIsCompleting(false); // Reset completion flag on error
      toast.error("Something went wrong. Please try again.");
    },
  });

  const handleComplete = useCallback(async () => {
    if (isCompleting) return; // Prevent multiple completions
    setIsCompleting(true);
    try {
      await completeTutorialMutation.mutateAsync();
    } catch (error) {
      setIsCompleting(false); // Reset if error occurs
    }
  }, [completeTutorialMutation, isCompleting]);

  useEffect(() => {
    if (!session?.user?.name) return;

    let driverInstance: any;

    if (!isMobile) {
      // Desktop driver configuration
      driverInstance = driver({
        popoverClass: "welcome-tutorial-popover",
        showProgress: true,
        allowClose: true,
        overlayColor: "rgba(0, 0, 0, 0.4)",
        steps: [
          {
            popover: {
              title: `Welcome to Carpool, ${session.user.name.split(" ")[0]}!`,
              description:
                "Let's take a quick tour to help you get started with NU Carpool.",
              showButtons: ["next", "close"],
              nextBtnText: "Show Me Around",
            },
          },
          {
            element: '[data-testid="explore-sidebar"]',
            popover: {
              title: "These are drivers",
              description:
                "Browse through available drivers in your area. You can view their profiles, ratings, and routes.",
              side: "right",
              align: "start",
            },
          },
          {
            element: "#map",
            popover: {
              title: "This is the map",
              description:
                "Explore the map to find the best routes and nearby drivers.",
              side: "top",
              align: "center",
            },
          },
          {
            element: '[data-testid="navigation-desktop"]',
            popover: {
              title: "This is the navigation bar",
              description:
                "Navigate through your requests, group details, and profile.",
              side: "bottom",
              align: "center",
            },
          },
          {
            popover: {
              title: "You're all set!",
              description:
                "Enjoy using NU Carpool to find or offer rides with your fellow students.",
              showButtons: ["close"],
            },
          },
        ],
        onCloseClick: () => {
          handleComplete();
          return true; // Allow close
        },
        // Handle normal tour completion
        onDestroyed: () => {
          handleComplete();
        },
        // Handle early exit with confirmation
        onDestroyStarted: () => {
          if (
            driverInstance.hasNextStep() &&
            !confirm("Are you sure you want to skip the tour?")
          ) {
            return false; // Prevent destruction
          }
          driverInstance.destroy(); // Ensure all instances are destroyed
          return true; // Allow destruction
        },
      });
    } else {
      // Mobile driver configuration
      driverInstance = driver({
        popoverClass: "welcome-tutorial-popover",
        showProgress: true,
        allowClose: true,
        overlayColor: "rgba(0, 0, 0, 0.4)",
        steps: [
          {
            popover: {
              title: `Welcome to Carpool, ${session.user.name.split(" ")[0]}!`,
              description:
                "Let's take a quick tour to help you get started with NU Carpool.",
              showButtons: ["next", "close"],
              nextBtnText: "Show Me Around",
            },
          },
          {
            element: '[data-testid="explore-sidebar"]',
            popover: {
              title: "These are drivers",
              description:
                "Browse through available drivers in your area. You can view their profiles, ratings, and routes.",
              side: "top",
              align: "center",
            },
          },
          {
            element: "#map",
            popover: {
              title: "This is the map",
              description:
                "Explore the map to find the best routes and nearby drivers.",
              side: "top",
              align: "center",
            },
          },
          {
            element: '[data-testid="navigation"]',
            popover: {
              title: "This is the navigation bar",
              description:
                "Navigate through your requests, group details, and profile.",
              side: "top",
              align: "center",
            },
          },
          {
            popover: {
              title: "You're all set!",
              description:
                "Enjoy using NU Carpool to find or offer rides with your fellow students.",
              showButtons: ["close"],
            },
          },
        ],
        onCloseClick: () => {
          handleComplete();
          return true; // Allow close
        },
        // Handle normal tour completion
        onDestroyed: () => {
          handleComplete();
        },
        // Handle early exit with confirmation
        onDestroyStarted: () => {
          if (
            driverInstance.hasNextStep() &&
            !confirm("Are you sure you want to skip the tour?")
          ) {
            return false; // Prevent destruction
          }
          driverInstance.destroy(); // Ensure all instances are destroyed
          return true; // Allow destruction
        },
      });
    }

    // Start the appropriate tour
    driverInstance.drive();

    return () => {
      driverInstance.destroy();
    };
  }, [session?.user?.name, handleComplete, isMobile]);

  if (!session?.user?.name) {
    return null;
  }

  return null; // driver.js handles the UI
};

export default WelcomeTutorial;
