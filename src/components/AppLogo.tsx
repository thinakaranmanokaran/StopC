import { ClipboardCheck } from "lucide-react";
import { appConfig } from "@/config/appConfig";

export function AppLogo({ size = 22 }: { size?: number }) {
  if (appConfig.logoUrl) {
    return (
      <img
        src={appConfig.logoUrl}
        alt={appConfig.logoAlt}
        width={size}
        height={size}
        style={{ objectFit: "contain", flexShrink: 0 }}
        onError={(e) => {
          // If the configured URL 404s/fails, don't leave a broken image icon.
          (e.currentTarget as HTMLImageElement).style.display = "none";
        }}
      />
    );
  }
  return <ClipboardCheck size={size} style={{ flexShrink: 0 }} />;
}
