import { useEffect } from "react";
import { useLocation } from "wouter";

/**
 * Hook that scrolls to the top of the page when the route changes.
 */
export function useScrollToTopOnNavigate() {
    const [location] = useLocation();

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "instant" });
    }, [location]);
}
