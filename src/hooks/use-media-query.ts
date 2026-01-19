import { useSyncExternalStore } from "react"

/**
 * Hook to detect media query matches
 * Usage: const isDesktop = useMediaQuery("(min-width: 768px)")
 */
export function useMediaQuery(query: string): boolean {
    const subscribe = (callback: () => void) => {
        const media = window.matchMedia(query)
        // Check for modern API
        if (media.addEventListener) {
            media.addEventListener("change", callback)
            return () => media.removeEventListener("change", callback)
        } else {
            // Fallback for older browsers
            media.addListener(callback)
            return () => media.removeListener(callback)
        }
    }

    const getSnapshot = () => {
        return window.matchMedia(query).matches
    }

    const getServerSnapshot = () => {
        return false
    }

    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
