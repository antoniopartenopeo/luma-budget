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

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = resolveBaseUrl()

  return [
    {
      url: `${baseUrl.origin}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1
    }
  ]
}
