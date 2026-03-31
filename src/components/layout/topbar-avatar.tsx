"use client"

import { User } from "lucide-react"

interface TopbarAvatarProps {
    initials: string | null
}

/**
 * Compact avatar chip (40×40) used in both desktop and mobile topbar.
 * Shows user initials when available, fallback User icon otherwise.
 */
export function TopbarAvatar({ initials }: TopbarAvatarProps) {
    return (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
            {initials ? (
                <span className="text-[10px] font-bold leading-none">{initials}</span>
            ) : (
                <User className="h-4 w-4" />
            )}
        </div>
    )
}
