import { describe, expect, it } from "vitest"
import { getProfileInitials, normalizeSettingsProfile } from "../profile-utils"

describe("profile-utils", () => {
    it("normalizes first and last name while preserving a trimmed legacy displayName", () => {
        expect(
            normalizeSettingsProfile({
                firstName: "  Mario ",
                lastName: " Rossi  ",
                displayName: "  Mario Rossi "
            })
        ).toEqual({
            firstName: "Mario",
            lastName: "Rossi",
            displayName: "Mario Rossi"
        })
    })

    it("hydrates first and last name from a legacy displayName when dedicated fields are missing", () => {
        expect(
            normalizeSettingsProfile({
                displayName: "Mario Rossi"
            })
        ).toEqual({
            firstName: "Mario",
            lastName: "Rossi",
            displayName: "Mario Rossi"
        })
    })

    it("derives initials from normalized profile data", () => {
        expect(getProfileInitials({ firstName: "Mario", lastName: "Rossi" })).toBe("MR")
        expect(getProfileInitials({ displayName: "Ada" })).toBe("A")
        expect(getProfileInitials(undefined)).toBeNull()
    })
})
