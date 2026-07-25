import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" />
        ),
        error: (
          <OctagonXIcon className="size-4" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        unstyled: false,
        classNames: {
          toast:
            "cn-toast !gap-3 !rounded-xl !border !p-4 !shadow-xl !items-start [&_[data-icon]]:mt-0.5 [&_[data-icon]]:shrink-0",
          title: "!text-sm !font-semibold",
          error:
            "!border-border !bg-popover !text-popover-foreground [&_[data-icon]]:!text-destructive",
          success:
            "!border-border !bg-popover !text-popover-foreground [&_[data-icon]]:!text-brand",
          warning:
            "!border-border !bg-popover !text-popover-foreground [&_[data-icon]]:!text-amber-500",
          info: "!border-border !bg-popover !text-popover-foreground [&_[data-icon]]:!text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
