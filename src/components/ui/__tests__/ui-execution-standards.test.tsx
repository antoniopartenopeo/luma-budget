import { readFileSync } from "node:fs"
import { join } from "node:path"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Button } from "../button"
import { Input } from "../input"
import { Textarea } from "../textarea"

const GLOBALS_CSS_PATH = join(process.cwd(), "src/app/globals.css")

describe("UI execution standards baseline", () => {
    it("keeps visible focus replacement when outline is removed on buttons", () => {
        render(<Button>Apri</Button>)
        const button = screen.getByRole("button", { name: "Apri" })

        expect(button).toHaveClass("outline-none")
        expect(button).toHaveClass("focus-visible:border-ring", "focus-visible:ring-[3px]")
    })

    it("keeps mobile non-zoom typography contract on inputs", () => {
        render(<Input aria-label="Nome" />)
        const input = screen.getByRole("textbox", { name: "Nome" })

        expect(input).toHaveClass("text-base", "md:text-sm", "min-w-0")
    })

    it("keeps mobile non-zoom typography contract on textareas", () => {
        render(<Textarea aria-label="Note" />)
        const textarea = screen.getByRole("textbox", { name: "Note" })

        expect(textarea).toHaveClass("text-base", "md:text-sm")
    })

    it("preserves reduced-motion safety net for global animation primitives", () => {
        const css = readFileSync(GLOBALS_CSS_PATH, "utf-8")

        expect(css).toContain("@media (prefers-reduced-motion: reduce)")
        expect(css).toContain(".animate-enter-up")
        expect(css).toContain(".animate-pulse-soft")
        expect(css).toContain(".animate-flash-green")
        expect(css).toContain(".animate-ping-slow")
        expect(css).toContain(".animate-spin-slow")
    })
})

