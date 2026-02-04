
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MacroSection } from '../macro-section'
import { KpiCard } from '../kpi-card'
import { SubSectionCard } from '../sub-section-card'
import { Calculator } from 'lucide-react'

// UI Governance Regression Test Suite (Automated via Vitest)
// References: .agent/rules/ui-regression-checklist.md

describe('UI Governance Compliance (Premium 3D)', () => {

    describe('MacroSection (Monolithic Card)', () => {
        it('should enforce 40px border radius (rounded-[2.5rem])', () => {
            render(<MacroSection title="Test Macro"><div /></MacroSection>)
            const card = screen.getByTestId('macro-card')
            expect(card).toHaveClass('rounded-[2.5rem]')
        })

        it('should use glass-panel surface material', () => {
            render(<MacroSection title="Test Material"><div /></MacroSection>)
            const card = screen.getByTestId('macro-card')
            // glass-panel isn't a direct class on Card in the source, it's composed of bg-white/60 etc.
            // But the spec says "glass-panel" class preferred.
            // Checking actual classes applied in macro-section.tsx: "bg-white/60 ... backdrop-blur-xl"
            expect(card.className).toContain('backdrop-blur-xl')
        })

        it('should possess shadow-xl for elevation', () => {
            render(<MacroSection title="Test Shadow"><div /></MacroSection>)
            const card = screen.getByTestId('macro-card')
            expect(card).toHaveClass('shadow-xl')
        })
    })

    describe('KpiCard (Premium 3D Cards)', () => {
        it('should not use flat styles (shadow-none) by default', () => {
            render(<KpiCard title="Test KPI" value="€100" icon={Calculator} />)
            // KpiCard renders a Card. We can search for the title and go up, or add testid.
            // Using title search:
            // const title = screen.getByText('Test KPI')
            // The Card is a parent.
            // Let's rely on class "glass-card" which should be present.
            // Or look for any element with glass-card.
            // KpiCard likely wraps everything in a div or Card that has glass-card.

            // Note: KpiCard source uses: <Card className={cn("rounded-xl h-full glass-card", ...)}>
            // So we can find by class.
            const card = document.querySelector('.glass-card')
            expect(card).toBeInTheDocument()
            if (card) {
                expect(card).not.toHaveClass('shadow-none')
                expect(card).not.toHaveClass('border-none')
            }
        })

        it('should support semantic tones without breaking 3D structure', () => {
            render(<KpiCard title="Tone KPI" value="€100" icon={Calculator} tone="positive" />)
            const card = screen.getByText('Tone KPI').closest('.glass-card')
            expect(card).toBeInTheDocument()
            // Ensure it keeps glass-card even with tone
            expect(card).toHaveClass('glass-card')
        })
    })

    describe('SubSectionCard (Inner Depth)', () => {
        it('should use glass-card for inner depth', () => {
            render(<SubSectionCard label="Inner Card">Content</SubSectionCard>)
            // SubSectionCard applies styles to a div
            const card = screen.getByText('Content').closest('div.glass-card')
            expect(card).toBeInTheDocument()
        })

        it('should reject flat variants if implemented (future proofing)', () => {
            // This test ensures we don't accidentally introduce a 'flat' variant prop that removes shadows
            render(<SubSectionCard label="Standard" variant="default">Content</SubSectionCard>)
            const card = screen.getByText('Standard').closest('div')
            expect(card).not.toHaveClass('shadow-none')
        })
    })
})
