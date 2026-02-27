import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NUMA Budget",
    short_name: "NUMA",
    description: "Gestisci le tue finanze con semplicità",
    start_url: "/",
    display: "standalone",
    scope: "/",
    background_color: "#ffffff",
    theme_color: "#0ea5a8",
    lang: "it-IT",
    categories: ["finance", "productivity"],
    icons: [
      {
        src: "/pwa/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/pwa/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/pwa/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
