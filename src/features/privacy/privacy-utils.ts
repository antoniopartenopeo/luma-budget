import { cn } from "@/lib/utils"

/**
 * Standard CSS class for blurring obfuscated content.
 * Applies a blur filter, reduces opacity, and prevents text selection.
 * Includes a smooth transition.
 */
export const PRIVACY_BLUR_CLASS = "blur-md select-none opacity-50 transition-all duration-300"

/**
 * Helper to conditionally apply the privacy blur.
 * @param isPrivate - The toggle state
 * @param className - Optional additional classes
 */
export function getPrivacyClass(isPrivate: boolean, className?: string) {
    return cn(isPrivate ? PRIVACY_BLUR_CLASS : "transition-all duration-300", className)
}
