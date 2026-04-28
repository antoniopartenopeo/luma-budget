import type { AppSettingsV1 } from "./api/types"

type SettingsProfile = AppSettingsV1["profile"]

const MAX_PROFILE_NAME_LENGTH = 50

function normalizeProfileSegment(value: unknown): string {
    if (typeof value !== "string") return ""
    return value.trim().slice(0, MAX_PROFILE_NAME_LENGTH)
}

export function normalizeSettingsProfile(profile: SettingsProfile | null | undefined): NonNullable<SettingsProfile> {
    const legacyDisplayName = normalizeProfileSegment(profile?.displayName)
    const legacyTokens = legacyDisplayName.split(/\s+/).filter(Boolean)
    const legacyFirstName = legacyTokens[0] ?? ""
    const legacyLastName = legacyTokens.length > 1 ? legacyTokens.slice(1).join(" ") : ""

    return {
        firstName: normalizeProfileSegment(profile?.firstName) || legacyFirstName,
        lastName: normalizeProfileSegment(profile?.lastName) || legacyLastName,
        displayName: legacyDisplayName,
    }
}

export function getProfileInitials(profile: SettingsProfile | null | undefined): string | null {
    const normalizedProfile = normalizeSettingsProfile(profile)

    if (normalizedProfile.firstName && normalizedProfile.lastName) {
        return `${normalizedProfile.firstName[0]}${normalizedProfile.lastName[0]}`.toUpperCase()
    }

    if (normalizedProfile.firstName) return normalizedProfile.firstName[0].toUpperCase()
    if (normalizedProfile.lastName) return normalizedProfile.lastName[0].toUpperCase()
    return null
}
