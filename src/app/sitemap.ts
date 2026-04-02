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
    },
    {
      url: `${baseUrl.origin}/transactions/import`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9
    },
    {
      url: `${baseUrl.origin}/faq`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7
    },
    {
      url: `${baseUrl.origin}/privacy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7
    },
    {
      url: `${baseUrl.origin}/updates`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7
    }
  ]
}
