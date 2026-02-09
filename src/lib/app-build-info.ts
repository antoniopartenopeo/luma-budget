export type AppBuildInfo = {
    version: string
    env: string
    buildTime: string
    gitSha: string
}

function normalize(value: string | undefined, fallback: string): string {
    if (typeof value !== "string") return fallback
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : fallback
}

export function getAppBuildInfo(): AppBuildInfo {
    return {
        // Keep static env accesses so Next.js can inline NEXT_PUBLIC_* on client bundles.
        version: normalize(process.env.NEXT_PUBLIC_APP_VERSION, "unknown"),
        env: normalize(process.env.NODE_ENV, "unknown"),
        buildTime: normalize(process.env.NEXT_PUBLIC_BUILD_TIME, "unknown"),
        gitSha: normalize(process.env.NEXT_PUBLIC_GIT_SHA, "local"),
    }
}
