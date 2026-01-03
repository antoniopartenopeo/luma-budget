/**
 * Delays execution for a given amount of time.
 * In test environment (NODE_ENV === "test"), it resolves immediately.
 * 
 * @param ms Delay in milliseconds
 */
export async function delay(ms: number): Promise<void> {
    if (process.env.NODE_ENV === "test") {
        return Promise.resolve()
    }
    return new Promise((resolve) => setTimeout(resolve, ms))
}
