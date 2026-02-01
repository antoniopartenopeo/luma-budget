import { useState, useEffect } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface PrivacyState {
    isPrivacyMode: boolean
    togglePrivacy: () => void
    setPrivacy: (value: boolean) => void
}

const useBasePrivacyStore = create<PrivacyState>()(
    persist(
        (set) => ({
            isPrivacyMode: false,
            togglePrivacy: () => set((state) => ({ isPrivacyMode: !state.isPrivacyMode })),
            setPrivacy: (value) => set({ isPrivacyMode: value }),
        }),
        {
            name: 'numa-privacy-storage',
        }
    )
)

export const usePrivacyStore = () => {
    const store = useBasePrivacyStore()
    const [isHydrated, setIsHydrated] = useState(false)

    useEffect(() => {
        // Use micro-task to avoid synchronous setState warning
        Promise.resolve().then(() => {
            setIsHydrated(true)
        })
    }, [])

    return {
        ...store,
        isPrivacyMode: isHydrated ? store.isPrivacyMode : false
    }
}
