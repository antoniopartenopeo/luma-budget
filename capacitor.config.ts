import type { CapacitorConfig } from "@capacitor/cli";

const appUrl = process.env.NUMA_APP_URL ?? "http://localhost:3000";

const config: CapacitorConfig = {
  appId: "com.numa.budget",
  appName: "NUMA Budget",
  webDir: "public",
  server: {
    url: appUrl,
    cleartext: appUrl.startsWith("http://"),
  },
};

export default config;
