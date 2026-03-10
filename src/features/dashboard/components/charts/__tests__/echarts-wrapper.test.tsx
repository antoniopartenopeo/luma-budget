import { render, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { EChartsWrapper } from "../echarts-wrapper"

const resizeSpy = vi.fn()
const setOptionSpy = vi.fn()
const disposeSpy = vi.fn()
const onSpy = vi.fn()
const offSpy = vi.fn()
const isDisposedSpy = vi.fn(() => false)
const initSpy = vi.fn()
const getInstanceByDomSpy = vi.fn(() => undefined)

vi.mock("echarts", () => ({
    init: initSpy,
    getInstanceByDom: getInstanceByDomSpy,
}))

describe("EChartsWrapper", () => {
    let observeSpy: ReturnType<typeof vi.fn>
    let disconnectSpy: ReturnType<typeof vi.fn>
    let cancelAnimationFrameSpy: ReturnType<typeof vi.fn>
    let observerCallback: ResizeObserverCallback | null

    beforeEach(() => {
        resizeSpy.mockReset()
        setOptionSpy.mockReset()
        disposeSpy.mockReset()
        onSpy.mockReset()
        offSpy.mockReset()
        isDisposedSpy.mockReset()
        isDisposedSpy.mockReturnValue(false)
        initSpy.mockReset()
        getInstanceByDomSpy.mockReset()
        getInstanceByDomSpy.mockReturnValue(undefined)
        observeSpy = vi.fn()
        disconnectSpy = vi.fn()
        observerCallback = null

        initSpy.mockReturnValue({
            resize: resizeSpy,
            setOption: setOptionSpy,
            dispose: disposeSpy,
            on: onSpy,
            off: offSpy,
            isDisposed: isDisposedSpy,
        })

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

    it("initializes echarts, drives resize from ResizeObserver, and disposes cleanly", async () => {
        const onChartReady = vi.fn()
        const eventHandlers = { click: vi.fn() }
        const { container, unmount } = render(
            <EChartsWrapper option={{}} onChartReady={onChartReady} onEvents={eventHandlers} />
        )

        await waitFor(() => {
            expect(initSpy).toHaveBeenCalled()
            expect(onChartReady).toHaveBeenCalled()
            expect(container.firstChild).toHaveAttribute("aria-busy", "false")
        })

        expect(observeSpy).toHaveBeenCalled()
        expect(setOptionSpy).toHaveBeenCalled()
        expect(onSpy).toHaveBeenCalledWith("click", eventHandlers.click)

        observerCallback?.([] as unknown as ResizeObserverEntry[], {} as ResizeObserver)
        expect(resizeSpy).toHaveBeenCalled()

        unmount()
        expect(cancelAnimationFrameSpy).toHaveBeenCalledWith(1)
        expect(disconnectSpy).toHaveBeenCalled()
        expect(offSpy).toHaveBeenCalledWith("click", eventHandlers.click)
        expect(disposeSpy).toHaveBeenCalled()
    })

    it("renders safely when ResizeObserver is unavailable", async () => {
        vi.stubGlobal("ResizeObserver", undefined)

        const { unmount } = render(<EChartsWrapper option={{}} />)

        await waitFor(() => {
            expect(initSpy).toHaveBeenCalled()
        })

        expect(observeSpy).not.toHaveBeenCalled()
        unmount()
        expect(disconnectSpy).not.toHaveBeenCalled()
    })
})
