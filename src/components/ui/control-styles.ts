import { cva } from "class-variance-authority"

export const premiumFieldLabelClassName =
  "pl-1 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground/80"

export const premiumHelperTextClassName =
  "text-xs font-medium leading-relaxed text-muted-foreground/80"

export const premiumSectionEyebrowClassName =
  "flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-primary/80"

export const metricEyebrowClassName =
  "text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground/80"

const premiumControlChrome =
  "border-white/30 bg-white/58 shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_18px_36px_-28px_rgba(15,23,42,0.42)] backdrop-blur-md hover:bg-white/72 focus-visible:border-primary/35 focus-visible:ring-primary/15 dark:border-white/12 dark:bg-white/[0.06] dark:hover:bg-white/[0.09] dark:focus-visible:border-primary/40"

export const inputControlVariants = cva(
  "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground w-full min-w-0 rounded-[var(--radius-md)] border px-3 py-1 text-base shadow-xs outline-none transition-all duration-300 ease-out md:text-sm touch-manipulation file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "border-input bg-transparent focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30",
        premium: premiumControlChrome,
      },
      density: {
        default: "h-9",
        compact: "h-8 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      density: "default",
    },
  }
)

export const textareaControlVariants = cva(
  "w-full rounded-[var(--radius-md)] border px-3 py-2 text-base shadow-xs outline-none transition-all duration-300 ease-out md:text-sm touch-manipulation placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30",
        premium: premiumControlChrome,
      },
      density: {
        default: "min-h-[96px]",
        compact: "min-h-[80px]",
      },
    },
    defaultVariants: {
      variant: "default",
      density: "default",
    },
  }
)

export const selectTriggerVariants = cva(
  "flex w-fit items-center justify-between gap-2 rounded-[var(--radius-md)] border px-3 whitespace-nowrap outline-none transition-all duration-300 ease-out touch-manipulation disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2",
  {
    variants: {
      variant: {
        default:
          "border-input bg-transparent text-foreground shadow-xs data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 dark:hover:bg-input/50",
        premium:
          "text-foreground data-[placeholder]:text-muted-foreground/80 [&_svg:not([class*='text-'])]:text-muted-foreground/75 " +
          premiumControlChrome,
      },
      density: {
        default: "h-9 py-2 text-sm",
        compact: "h-8 py-1.5 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      density: "default",
    },
  }
)

export const selectContentVariants = cva(
  "relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
  {
    variants: {
      variant: {
        default:
          "bg-popover text-popover-foreground rounded-md border shadow-md",
        premium:
          "glass-panel rounded-[1.5rem] border border-white/45 p-1.5 text-popover-foreground shadow-2xl dark:border-white/12",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export const tabsListVariants = cva(
  "inline-flex items-center justify-center text-muted-foreground",
  {
    variants: {
      variant: {
        default: "h-9 w-fit rounded-lg bg-muted p-[3px]",
        premium:
          "glass-card h-auto w-fit rounded-[1.25rem] border border-white/30 bg-white/55 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] dark:border-white/10 dark:bg-white/[0.05]",
      },
      density: {
        default: "",
        compact: "gap-1 p-1",
      },
    },
    defaultVariants: {
      variant: "default",
      density: "default",
    },
  }
)

export const tabsTriggerVariants = cva(
  "inline-flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap outline-none disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-[3px] focus-visible:outline-1 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "h-[calc(100%-1px)] rounded-md border border-transparent px-2 py-1 text-sm font-medium text-foreground transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring data-[state=active]:bg-background data-[state=active]:shadow-sm dark:text-muted-foreground dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 dark:data-[state=active]:text-foreground",
        premium:
          "rounded-[1rem] border border-transparent px-3 py-2 text-sm font-semibold text-muted-foreground transition-all duration-300 ease-out hover:text-foreground focus-visible:border-primary/25 focus-visible:ring-primary/15 data-[state=active]:border-white/30 data-[state=active]:bg-background/92 data-[state=active]:text-foreground data-[state=active]:shadow-[0_18px_32px_-24px_rgba(15,23,42,0.42)] dark:data-[state=active]:border-white/10 dark:data-[state=active]:bg-white/[0.08]",
      },
      density: {
        default: "min-h-[2.75rem]",
        compact: "min-h-9",
      },
    },
    defaultVariants: {
      variant: "default",
      density: "default",
    },
  }
)
