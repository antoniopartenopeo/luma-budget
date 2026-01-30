export type GoalType = 'growth' | 'comfort' | 'security'

export const GOAL_TYPE_LABELS: Record<GoalType, string> = {
    growth: "Crescita",
    comfort: "Comfort",
    security: "Sicurezza"
}

export const GOAL_TYPES = Object.keys(GOAL_TYPE_LABELS) as GoalType[]
