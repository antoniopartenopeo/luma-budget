import '@testing-library/jest-dom'

if (typeof window !== "undefined") {
    if (typeof window.matchMedia !== "function") {
        Object.defineProperty(window, "matchMedia", {
            writable: true,
            value: (query: string) => ({
                matches: query.includes("pointer: fine") || query.includes("hover: hover"),
                media: query,
                onchange: null,
                addListener: () => undefined,
                removeListener: () => undefined,
                addEventListener: () => undefined,
                removeEventListener: () => undefined,
                dispatchEvent: () => false,
            }),
        })
    }

    Object.defineProperty(window, "scrollTo", {
        writable: true,
        value: () => undefined,
    })
}

if (typeof HTMLElement !== "undefined" && typeof HTMLElement.prototype.scrollTo !== "function") {
    Object.defineProperty(HTMLElement.prototype, "scrollTo", {
        writable: true,
        value: () => undefined,
    })
}
