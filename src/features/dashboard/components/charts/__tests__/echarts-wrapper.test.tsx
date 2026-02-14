import { render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { EChartsWrapper } from "../echarts-wrapper"

const resizeSpy = vi.fn()
let capturedProps: Record<string, unknown> | null = null

vi.mock("next/dynamic", () => ({
    default: () => {
        return (props: Record<string, unknown>) => {
            capturedProps = props
            const onChartReady = props.onChartReady as ((instance: unknown) => void) | undefined
            onChartReady?.({ resize: resizeSpy })
            return <div data-testid="mock-echarts" />
        }
    }
}))

describe("EChartsWrapper", () => {
    let observeSpy: ReturnType<typeof vi.fn>
    let disconnectSpy: ReturnType<typeof vi.fn>
    let cancelAnimationFrameSpy: ReturnType<typeof vi.fn>
    let observerCallback: ResizeObserverCallback | null

    beforeEach(() => {
        resizeSpy.mockReset()
        capturedProps = null
        observeSpy = vi.fn()
        disconnectSpy = vi.fn()
        observerCallback = null

        class ResizeObserverMock {
            constructor(cb: ResizeObserverCallback) {
                observerCallback = cb
            }
            observe = observeSpy
            disconnect = disconnectSpy
        }

        vi.stubGlobal("ResizeObserver", ResizeObserverMock)
        vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
            cb(0)
            return 1
        })
        cancelAnimationFrameSpy = vi.fn()
        vi.stubGlobal("cancelAnimationFrame", cancelAnimationFrameSpy)
    })

    afterEach(() => {
        vi.unstubAllGlobals()
    })

    it("disables internal autoResize and wires custom resize observer lifecycle", () => {
        const { unmount } = render(<EChartsWrapper option={{}} />)

        expect(screen.getByTestId("mock-echarts")).toBeInTheDocument()
        expect(capturedProps?.autoResize).toBe(false)
        expect(observeSpy).toHaveBeenCalled()

        observerCallback?.([] as unknown as ResizeObserverEntry[], {} as ResizeObserver)
        expect(resizeSpy).toHaveBeenCalled()

        unmount()
        expect(cancelAnimationFrameSpy).toHaveBeenCalledWith(1)
        expect(disconnectSpy).toHaveBeenCalled()
    })

    it("renders safely when ResizeObserver is unavailable", () => {
        vi.stubGlobal("ResizeObserver", undefined)

        const { unmount } = render(<EChartsWrapper option={{}} />)

        expect(screen.getByTestId("mock-echarts")).toBeInTheDocument()
        expect(capturedProps?.autoResize).toBe(false)
        expect(observeSpy).not.toHaveBeenCalled()
        unmount()
        expect(disconnectSpy).not.toHaveBeenCalled()
    })
})
