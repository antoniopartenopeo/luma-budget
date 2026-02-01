
export type ContextLevel = 'info' | 'success' | 'warning' | 'danger'

export interface ContextMessage {
    id: string
    level: ContextLevel
    title: string
    message: string
    actionLabel?: string
    actionUrl?: string
}

export type SmartContextMap = Record<string, ContextMessage>
