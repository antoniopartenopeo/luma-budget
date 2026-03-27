import type { MetadataRoute } from "next"

function resolveBaseUrl(): URL {
  const candidate =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NUMA_APP_URL ??
    "http://localhost:3000"

  try {
    return new URL(candidate)
  } catch {
    return new URL("http://localhost:3000")
  }
}

export default function robots(): MetadataRoute.Robots {
  const baseUrl = resolveBaseUrl()

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/brain",
          "/dashboard",
          "/insights",
          "/settings",
          "/simulator",
          "/transactions",
          "/updates"
        ]
      }
    ],
    sitemap: `${baseUrl.origin}/sitemap.xml`,
    host: baseUrl.origin
  }
}
