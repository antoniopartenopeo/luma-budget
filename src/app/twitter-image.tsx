import { ImageResponse } from "next/og"

export const size = {
  width: 1200,
  height: 630
}

export const contentType = "image/png"

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background:
            "radial-gradient(circle at top, rgba(255,255,255,0.5), transparent 36%), linear-gradient(135deg, #e7fffc 0%, #baf3ef 38%, #eefaf9 100%)",
          color: "#082f49",
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 36,
            borderRadius: 40,
            border: "1px solid rgba(255,255,255,0.6)",
            background: "rgba(255,255,255,0.4)",
            boxShadow: "0 40px 120px -70px rgba(15,23,42,0.55)"
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            padding: "72px 80px"
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
                fontSize: 28,
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#0891b2"
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 16,
                  transform: "rotate(45deg)",
                  background: "linear-gradient(135deg, #0e7490, #67e8f9)"
                }}
              />
              Numa Budget
            </div>

            <div
              style={{
                fontSize: 86,
                lineHeight: 0.92,
                fontWeight: 800,
                letterSpacing: "-0.05em",
                color: "#0f172a",
                maxWidth: 820
              }}
            >
              Capisci il mese prima che ti travolga.
            </div>

            <div
              style={{
                fontSize: 32,
                lineHeight: 1.35,
                fontWeight: 500,
                color: "rgba(15,23,42,0.78)",
                maxWidth: 860
              }}
            >
              Numa legge i tuoi movimenti, stima cosa potrebbe restarti e ti dice se una nuova spesa fissa e davvero sostenibile. Tutto in locale.
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: 14,
              fontSize: 24,
              fontWeight: 600,
              color: "rgba(15,23,42,0.75)"
            }}
          >
            <span>Tutto in locale</span>
            <span>•</span>
            <span>Zero cloud obbligatorio</span>
            <span>•</span>
            <span>Nessun account per iniziare</span>
          </div>
        </div>
      </div>
    ),
    size
  )
}
