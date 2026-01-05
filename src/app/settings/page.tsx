"use client"

import { Settings2, Database, Download, Wrench } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PreferencesSection } from "./_components/preferences-section"
import { CategoriesSection } from "./_components/categories-section"
import { BackupSection } from "./_components/backup-section"
import { AdvancedSection } from "./_components/advanced-section"

export default function SettingsPage() {
    return (
        <div className="container mx-auto py-6 px-4 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    <Settings2 className="h-8 w-8" />
                    Impostazioni
                </h1>
                <p className="text-muted-foreground mt-2">
                    Configura le preferenze dell&apos;applicazione e gestisci i tuoi dati.
                </p>
            </div>

            <Tabs defaultValue="preferences" className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-8">
                    <TabsTrigger value="preferences" className="gap-2">
                        <Settings2 className="h-4 w-4 hidden sm:block" />
                        Preferenze
                    </TabsTrigger>
                    <TabsTrigger value="categories" className="gap-2">
                        <Database className="h-4 w-4 hidden sm:block" />
                        Categorie
                    </TabsTrigger>
                    <TabsTrigger value="backup" className="gap-2">
                        <Download className="h-4 w-4 hidden sm:block" />
                        Backup
                    </TabsTrigger>
                    <TabsTrigger value="advanced" className="gap-2">
                        <Wrench className="h-4 w-4 hidden sm:block" />
                        Avanzate
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
        </div>
    )
}
