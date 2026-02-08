"use client"

import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { useCallback, Suspense } from "react"
import { Settings2, Database, Download, Wrench, Loader2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PreferencesSection } from "@/features/settings/components/preferences-section"
import { CategoriesSection } from "@/features/settings/components/categories-section"
import { BackupSection } from "@/features/settings/components/backup-section"
import { AdvancedSection } from "@/features/settings/components/advanced-section"
import { PageHeader } from "@/components/ui/page-header"

const VALID_TABS = ["preferences", "categories", "backup", "advanced"] as const
type TabValue = typeof VALID_TABS[number]
const DEFAULT_TAB: TabValue = "preferences"

function isValidTab(tab: string | null): tab is TabValue {
    return tab !== null && VALID_TABS.includes(tab as TabValue)
}

function SettingsContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const pathname = usePathname()

    // Read tab from URL, fallback to default if invalid
    const tabParam = searchParams.get("tab")
    const activeTab = isValidTab(tabParam) ? tabParam : DEFAULT_TAB

    const handleTabChange = useCallback((value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value === DEFAULT_TAB) {
            params.delete("tab")
        } else {
            params.set("tab", value)
        }
        const query = params.toString()
        router.replace(`${pathname}${query ? `?${query}` : ""}`, { scroll: false })
    }, [searchParams, router, pathname])

    return (
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="flex w-full overflow-x-auto overflow-y-hidden mb-8 bg-muted/20 p-1 rounded-xl scrollbar-hide">
                <TabsTrigger value="preferences" className="flex-1 gap-2 min-w-[100px] sm:min-w-0" aria-label="Preferenze">
                    <Settings2 className="h-4 w-4 hidden xs:block" aria-hidden="true" />
                    <span>Preferenze</span>
                </TabsTrigger>
                <TabsTrigger value="categories" className="flex-1 gap-2 min-w-[100px] sm:min-w-0" aria-label="Categorie">
                    <Database className="h-4 w-4 hidden xs:block" aria-hidden="true" />
                    <span>Categorie</span>
                </TabsTrigger>
                <TabsTrigger value="backup" className="flex-1 gap-2 min-w-[100px] sm:min-w-0" aria-label="Backup">
                    <Download className="h-4 w-4 hidden xs:block" aria-hidden="true" />
                    <span>Backup</span>
                </TabsTrigger>
                <TabsTrigger value="advanced" className="flex-1 gap-2 min-w-[100px] sm:min-w-0" aria-label="Avanzate">
                    <Wrench className="h-4 w-4 hidden xs:block" aria-hidden="true" />
                    <span>Avanzate</span>
                </TabsTrigger>
            </TabsList>

            <TabsContent value="preferences">
                <PreferencesSection />
            </TabsContent>

            <TabsContent value="categories">
                <CategoriesSection />
            </TabsContent>

            <TabsContent value="backup">
                <BackupSection />
            </TabsContent>

            <TabsContent value="advanced">
                <AdvancedSection />
            </TabsContent>
        </Tabs>
    )
}

function SettingsLoading() {
    return (
        <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
    )
}

// ... existing code ...

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <div className="mb-8">
                <PageHeader
                    title={
                        <span className="flex items-center gap-3">
                            <Settings2 className="h-8 w-8" />
                            Impostazioni
                        </span>
                    }
                    description="Configura le preferenze dell'applicazione e gestisci i tuoi dati."
                />
            </div>

            <Suspense fallback={<SettingsLoading />}>
                <SettingsContent />
            </Suspense>
        </div>
    )
}
