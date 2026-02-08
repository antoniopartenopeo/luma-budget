import { describe, it } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'

const VAULT_DIR = path.resolve(__dirname, '..')

describe('Logic Vault Integrity', () => {
    it('should not contain forbidden imports in Logic files', () => {
        const files = fs.readdirSync(VAULT_DIR)
            .filter(f => f.endsWith('.ts') && !f.endsWith('.test.ts'))

        const forbiddenPatterns = [
            'src/app',
            'components/ui',
            'framer-motion',
            'react-dom',
            'next/navigation',
            'next/image'
        ]

        files.forEach(file => {
            const content = fs.readFileSync(path.join(VAULT_DIR, file), 'utf-8')
            forbiddenPatterns.forEach(pattern => {
                if (content.includes(pattern)) {
                    throw new Error(`Forbidden import '${pattern}' found in vault file: ${file}. Logic must be UI-free.`)
                }
            })
        })
    })

    it('should rely on numeric money logic (no parseFloat)', () => {
        const files = fs.readdirSync(VAULT_DIR)
            .filter(f => f.endsWith('.ts') && !f.endsWith('.test.ts'))

        files.forEach(file => {
            const content = fs.readFileSync(path.join(VAULT_DIR, file), 'utf-8')
            // Simple check, might have false positives if 'parseFloat' is in comments, but good guard rail
            if (content.includes('parseFloat')) {
                // Allow specific exceptions if documented, otherwise strict
                if (!content.includes('// ALLOW-PARSEFLOAT')) {
                    throw new Error(`Forbidden 'parseFloat' found in vault file: ${file}. Use integer math (cents).`)
                }
            }
        })
    })
})
