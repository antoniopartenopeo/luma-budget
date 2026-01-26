"use client"

import { useState } from "react"
import { Settings2, CheckCircle2, AlertCircle, Loader2, User, Palette, Coins, Target, Zap } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useSettings, useUpsertSettings } from "@/features/settings/api/use-settings"
import { ThemePreference, CurrencyCode, InsightsSensitivity } from "@/features/settings/api/types"
import { MacroSection } from "@/components/patterns/macro-section"

export function PreferencesSection() {
    const { data: settings, isLoading: isSettingsLoading, isError: isSettingsError } = useSettings()
    const upsertSettings = useUpsertSettings()
    const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle")

    const handleThemeChange = (theme: string) => {
        setSaveStatus("saving")
        upsertSettings.mutate({ theme: theme as ThemePreference }, {
            onSuccess: () => {
                setSaveStatus("success")
                setTimeout(() => setSaveStatus("idle"), 2000)
            },
            onError: () => {
                setSaveStatus("error")
                setTimeout(() => setSaveStatus("idle"), 3000)
            }
        })
    }

    const handleCurrencyChange = (currency: string) => {
        setSaveStatus("saving")
        upsertSettings.mutate({ currency: currency as CurrencyCode }, {
            onSuccess: () => {
                setSaveStatus("success")
                setTimeout(() => setSaveStatus("idle"), 2000)
            },
            onError: () => {
                setSaveStatus("error")
                setTimeout(() => setSaveStatus("idle"), 3000)
            }
        })
    }

    const handleSuperfluousTargetChange = (value: string) => {
        const num = parseInt(value, 10)
        if (isNaN(num)) return

        setSaveStatus("saving")
        upsertSettings.mutate({ superfluousTargetPercent: num }, {
            onSuccess: () => {
                setSaveStatus("success")
                setTimeout(() => setSaveStatus("idle"), 2000)
            },
            onError: () => {
                setSaveStatus("error")
                setTimeout(() => setSaveStatus("idle"), 3000)
            }
        })
    }

    const handleInsightsSensitivityChange = (value: string) => {
        setSaveStatus("saving")
        upsertSettings.mutate({ insightsSensitivity: value as InsightsSensitivity }, {
            onSuccess: () => {
                setSaveStatus("success")
                setTimeout(() => setSaveStatus("idle"), 2000)
            },
            onError: () => {
                setSaveStatus("error")
                setTimeout(() => setSaveStatus("idle"), 3000)
            }
        })
    }

    return (
        <MacroSection
            title={
                <div className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                    <Settings2 className="h-6 w-6" />
                    Preferenze
                </div>
            }
            description="Personalizza aspetto e comportamento dell'applicazione."
            headerActions={
                <div className="text-sm font-normal">
                    {saveStatus === "saving" && (
                        <span className="text-muted-foreground flex items-center">
                            <Loader2 className="h-3 w-3 mr-2 animate-spin" /> Salvataggio...
                        </span>
                    )}
                    {saveStatus === "success" && (
                        <span className="text-green-600 flex items-center">
                            <CheckCircle2 className="h-3 w-3 mr-2" /> Salvato
                        </span>
                    )}
                    {saveStatus === "error" && (
                        <span className="text-destructive flex items-center">
                            <AlertCircle className="h-3 w-3 mr-2" /> Errore
                        </span>
                    )}
                </div>
            }
        >
            {isSettingsLoading ? (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-10 w-full md:w-[280px]" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-10 w-full md:w-[280px]" />
                    </div>
                </div>
            ) : isSettingsError ? (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Errore</AlertTitle>
                    <AlertDescription>
                        Impossibile caricare le preferenze. Verranno usati i valori predefiniti.
                    </AlertDescription>
                </Alert>
            ) : (
                <div className="space-y-8">
                    {/* Section 1: Identità & Aspetto */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-primary/80">
                            <User className="h-4 w-4" />
                            <span>Identità e Interfaccia</span>
                        </div>
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Profile Name */}
                            <div className="space-y-2 col-span-2 md:col-span-2">
                                <Label htmlFor="displayName" className="flex items-center gap-2">
                                    Nome Profilo
                                </Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="displayName"
                                        placeholder="Il tuo nome (es. Mario)"
                                        value={settings?.profile?.displayName || ""}
                                        onChange={(e) => upsertSettings.mutate({
                                            profile: { ...settings?.profile, displayName: e.target.value }
                                        })}
                                        disabled={upsertSettings.isPending}
                                        className="pl-9"
                                    />
                                </div>
                                <p className="text-[10px] text-muted-foreground">
                                    Visualizzato nella barra laterale.
                                </p>
                            </div>

                            {/* Theme */}
                            <div className="space-y-2">
                                <Label htmlFor="theme-select" className="flex items-center gap-2">
                                    <Palette className="h-4 w-4 text-muted-foreground" />
                                    Tema
                                </Label>
                                <Select
                                    value={settings?.theme || "system"}
                                    onValueChange={handleThemeChange}
                                    disabled={upsertSettings.isPending}
                                >
                                    <SelectTrigger id="theme-select">
                                        <SelectValue placeholder="Seleziona tema" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="system">Sistema (Auto)</SelectItem>
                                        <SelectItem value="light">Chiaro</SelectItem>
                                        <SelectItem value="dark">Scuro</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Currency */}
                            <div className="space-y-2">
                                <Label htmlFor="currency-select" className="flex items-center gap-2">
                                    <Coins className="h-4 w-4 text-muted-foreground" />
                                    Valuta
                                </Label>
                                <Select
                                    value={settings?.currency || "EUR"}
                                    onValueChange={handleCurrencyChange}
                                    disabled={upsertSettings.isPending}
                                >
                                    <SelectTrigger id="currency-select">
                                        <SelectValue placeholder="Seleziona valuta" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="EUR">Euro (€)</SelectItem>
                                        <SelectItem value="USD">Dollaro ($)</SelectItem>
                                        <SelectItem value="GBP">Sterlina (£)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Section 2: Analisi & Obiettivi */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-primary/80">
                            <Target className="h-4 w-4" />
                            <span>Analisi e Obiettivi</span>
                        </div>
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="superfluous-target" className="flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                                    Target Spese Superflue
                                </Label>
                                <div className="flex items-center gap-3">
                                    <Input
                                        id="superfluous-target"
                                        type="number"
                                        min={0}
                                        max={100}
                                        value={settings?.superfluousTargetPercent ?? 10}
                                        onChange={(e) => handleSuperfluousTargetChange(e.target.value)}
                                        disabled={upsertSettings.isPending}
                                        className="w-full"
                                    />
                                    <span className="text-sm text-muted-foreground font-medium">%</span>
                                </div>
                                <p className="text-[10px] text-muted-foreground">
                                    Soglia massima consigliata per gli acquisti non essenziali.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="sensitivity-select" className="flex items-center gap-2">
                                    <Zap className="h-4 w-4 text-muted-foreground" />
                                    Sensibilità Insights
                                </Label>
                                <Select
                                    value={settings?.insightsSensitivity || "medium"}
                                    onValueChange={handleInsightsSensitivityChange}
                                    disabled={upsertSettings.isPending}
                                >
                                    <SelectTrigger id="sensitivity-select">
                                        <SelectValue placeholder="Seleziona sensibilità" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Bassa (Meno avvisi)</SelectItem>
                                        <SelectItem value="medium">Media (Bilanciata)</SelectItem>
                                        <SelectItem value="high">Alta (Più avvisi)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-[10px] text-muted-foreground">
                                    {settings?.insightsSensitivity === "low"
                                        ? "Mostra solo cambiamenti grandi."
                                        : settings?.insightsSensitivity === "high"
                                            ? "Più avvisi, anche per cambiamenti piccoli."
                                            : "Livello bilanciato consigliato."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </MacroSection>
    )
}
