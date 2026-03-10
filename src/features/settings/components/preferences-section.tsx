"use client"

import { useState, useSyncExternalStore } from "react"
import { CheckCircle2, AlertCircle, Loader2, User, Palette, Coins, Target, Zap } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useSettings, useUpsertSettings } from "@/features/settings/api/use-settings"
import { AppSettingsV1, ThemePreference, CurrencyCode, InsightsSensitivity } from "@/features/settings/api/types"
import { MacroSection } from "@/components/patterns/macro-section"
import {
    premiumFieldLabelClassName,
    premiumHelperTextClassName,
    premiumSectionEyebrowClassName,
} from "@/components/ui/control-styles"
import { cn } from "@/lib/utils"

interface PreferenceFieldProps {
    label: string
    htmlFor?: string
    helper?: string
    icon?: React.ReactNode
    loading?: boolean
    children: React.ReactNode
}

function PreferenceField({
    label,
    htmlFor,
    helper,
    icon,
    loading = false,
    children,
}: PreferenceFieldProps) {
    return (
        <div className="rounded-[1.75rem] border border-white/30 bg-white/45 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-md dark:border-white/10 dark:bg-white/[0.04]">
            <div className="space-y-3">
                <Label
                    htmlFor={htmlFor}
                    className={cn(premiumFieldLabelClassName, "flex items-center gap-2")}
                >
                    {icon}
                    <span>{label}</span>
                </Label>

                {loading ? (
                    <div className="space-y-2">
                        <Skeleton className="h-11 w-full rounded-[1rem]" />
                        {helper ? <Skeleton className="h-3.5 w-4/5 rounded-full" /> : null}
                    </div>
                ) : (
                    <>
                        {children}
                        {helper ? (
                            <p className={cn(premiumHelperTextClassName, "pt-1")}>{helper}</p>
                        ) : null}
                    </>
                )}
            </div>
        </div>
    )
}

export function PreferencesSection() {
    const { data: settings, isLoading: isSettingsLoading, isError: isSettingsError } = useSettings()
    const upsertSettings = useUpsertSettings()
    const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle")
    const isHydrated = useSyncExternalStore(
        () => () => undefined,
        () => true,
        () => false
    )

    const commitPatch = (patch: Partial<Omit<AppSettingsV1, "version">>) => {
        setSaveStatus("saving")
        upsertSettings.mutate(patch, {
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

    const handleThemeChange = (theme: string) => {
        commitPatch({ theme: theme as ThemePreference })
    }

    const handleCurrencyChange = (currency: string) => {
        commitPatch({ currency: currency as CurrencyCode })
    }

    const handleSuperfluousTargetChange = (value: string) => {
        const num = parseInt(value, 10)
        if (isNaN(num)) return

        commitPatch({ superfluousTargetPercent: num })
    }

    const handleInsightsSensitivityChange = (value: string) => {
        commitPatch({ insightsSensitivity: value as InsightsSensitivity })
    }

    const showLoading = !isHydrated || isSettingsLoading

    return (
        <MacroSection
            title="Preferenze"
            description="Personalizza l'app e il modo in cui accompagna i tuoi movimenti."
            headerActions={
                <div className="text-sm font-normal">
                    {saveStatus === "saving" && (
                        <span className="text-muted-foreground flex items-center">
                            <Loader2 className="h-3 w-3 mr-2 animate-spin-slow" /> Sto salvando...
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
            {isHydrated && isSettingsError ? (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Errore</AlertTitle>
                        <AlertDescription>
                        Non riesco a caricare le preferenze. Per ora uso i valori predefiniti.
                        </AlertDescription>
                </Alert>
            ) : (
                <div className="space-y-8">
                    <div className="space-y-4">
                        <div className={premiumSectionEyebrowClassName}>
                            <User className="h-4 w-4" />
                            <span>Identità e Interfaccia</span>
                        </div>
                        <div className="grid gap-4 xl:grid-cols-2">
                            <PreferenceField
                                label="Nome"
                                htmlFor="firstName"
                                loading={showLoading}
                                icon={<User className="h-3.5 w-3.5 text-muted-foreground" />}
                            >
                                <div className="relative">
                                    <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="firstName"
                                        variant="premium"
                                        placeholder="Es. Mario"
                                        value={settings?.profile?.firstName || ""}
                                        onChange={(e) => upsertSettings.mutate({
                                            profile: { ...settings?.profile, firstName: e.target.value }
                                        })}
                                        disabled={upsertSettings.isPending}
                                        className="h-11 pl-10"
                                    />
                                </div>
                            </PreferenceField>

                            <PreferenceField
                                label="Cognome"
                                htmlFor="lastName"
                                loading={showLoading}
                                helper="In alto vedrai le iniziali del nome e del cognome."
                                icon={<User className="h-3.5 w-3.5 text-muted-foreground" />}
                            >
                                <div className="relative">
                                    <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="lastName"
                                        variant="premium"
                                        placeholder="Es. Rossi"
                                        value={settings?.profile?.lastName || ""}
                                        onChange={(e) => upsertSettings.mutate({
                                            profile: { ...settings?.profile, lastName: e.target.value }
                                        })}
                                        disabled={upsertSettings.isPending}
                                        className="h-11 pl-10"
                                    />
                                </div>
                            </PreferenceField>

                            <PreferenceField
                                label="Tema"
                                htmlFor="theme-select"
                                loading={showLoading}
                                icon={<Palette className="h-3.5 w-3.5 text-muted-foreground" />}
                            >
                                <Select
                                    value={settings?.theme || "system"}
                                    onValueChange={handleThemeChange}
                                    disabled={upsertSettings.isPending}
                                >
                                    <SelectTrigger id="theme-select" variant="premium" className="h-11 w-full">
                                        <SelectValue placeholder="Seleziona tema" />
                                    </SelectTrigger>
                                    <SelectContent variant="premium">
                                        <SelectItem value="system">Sistema (Auto)</SelectItem>
                                        <SelectItem value="light">Chiaro</SelectItem>
                                        <SelectItem value="dark">Scuro</SelectItem>
                                    </SelectContent>
                                </Select>
                            </PreferenceField>

                            <PreferenceField
                                label="Valuta"
                                htmlFor="currency-select"
                                loading={showLoading}
                                icon={<Coins className="h-3.5 w-3.5 text-muted-foreground" />}
                            >
                                <Select
                                    value={settings?.currency || "EUR"}
                                    onValueChange={handleCurrencyChange}
                                    disabled={upsertSettings.isPending}
                                >
                                    <SelectTrigger id="currency-select" variant="premium" className="h-11 w-full">
                                        <SelectValue placeholder="Seleziona valuta" />
                                    </SelectTrigger>
                                    <SelectContent variant="premium">
                                        <SelectItem value="EUR">Euro (€)</SelectItem>
                                        <SelectItem value="USD">Dollaro ($)</SelectItem>
                                        <SelectItem value="GBP">Sterlina (£)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </PreferenceField>
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                        <div className={premiumSectionEyebrowClassName}>
                            <Target className="h-4 w-4" />
                            <span>Analisi e Obiettivi</span>
                        </div>
                        <div className="grid gap-4 xl:grid-cols-2">
                            <PreferenceField
                                label="Target Spese Superflue"
                                htmlFor="superfluous-target"
                                loading={showLoading}
                                helper="La soglia consigliata per tenere sotto controllo le spese non essenziali."
                                icon={<AlertCircle className="h-3.5 w-3.5 text-muted-foreground" />}
                            >
                                <div className="relative">
                                    <Input
                                        id="superfluous-target"
                                        variant="premium"
                                        type="number"
                                        min={0}
                                        max={100}
                                        value={settings?.superfluousTargetPercent ?? 10}
                                        onChange={(e) => handleSuperfluousTargetChange(e.target.value)}
                                        disabled={upsertSettings.isPending}
                                        className="h-11 w-full pr-10 text-right font-bold tabular-nums tracking-tight"
                                    />
                                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
                                        %
                                    </span>
                                </div>
                            </PreferenceField>

                            <PreferenceField
                                label="Sensibilita Insights"
                                htmlFor="sensitivity-select"
                                loading={showLoading}
                                helper={
                                    settings?.insightsSensitivity === "low"
                                        ? "Mostra solo cambiamenti molto evidenti."
                                        : settings?.insightsSensitivity === "high"
                                            ? "Ti avvisa anche quando i cambiamenti sono piccoli."
                                            : "Livello bilanciato per l'uso quotidiano."
                                }
                                icon={<Zap className="h-3.5 w-3.5 text-muted-foreground" />}
                            >
                                <Select
                                    value={settings?.insightsSensitivity || "medium"}
                                    onValueChange={handleInsightsSensitivityChange}
                                    disabled={upsertSettings.isPending}
                                >
                                    <SelectTrigger
                                        id="sensitivity-select"
                                        variant="premium"
                                        className="h-11 w-full"
                                    >
                                        <SelectValue placeholder="Seleziona sensibilità" />
                                    </SelectTrigger>
                                    <SelectContent variant="premium">
                                        <SelectItem value="low">Bassa (Meno avvisi)</SelectItem>
                                        <SelectItem value="medium">Media (Bilanciata)</SelectItem>
                                        <SelectItem value="high">Alta (Più avvisi)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </PreferenceField>
                        </div>
                    </div>
                </div>
            )}
        </MacroSection>
    )
}
