/* eslint-disable @typescript-eslint/no-require-imports */
const { app, BrowserWindow, shell } = require("electron")

function resolveStartUrl() {
  if (process.env.NUMA_ELECTRON_START_URL) return process.env.NUMA_ELECTRON_START_URL
  if (process.env.NUMA_APP_URL) return process.env.NUMA_APP_URL
  if (!app.isPackaged) return "http://localhost:3000"
  return null
}

function createErrorHtml(message) {
  const safeMessage = String(message).replace(/</g, "&lt;").replace(/>/g, "&gt;")
  return `data:text/html;charset=UTF-8,<!doctype html><html><body style="font-family:-apple-system,system-ui,sans-serif;padding:24px;background:#0b0f14;color:#e8edf2"><h1 style="margin:0 0 10px;font-size:22px">NUMA Budget</h1><p style="margin:0 0 8px;line-height:1.5">Desktop shell avviata, ma URL frontend non raggiungibile.</p><pre style="white-space:pre-wrap;background:#111822;padding:12px;border-radius:8px">${safeMessage}</pre></body></html>`
}

function setupExternalNavigationGuards(window) {
  window.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: "deny" }
  })

  window.webContents.on("will-navigate", (event, url) => {
    const currentUrl = window.webContents.getURL()
    const currentOrigin = currentUrl ? new URL(currentUrl).origin : null
    const targetOrigin = new URL(url).origin
    if (currentOrigin && targetOrigin !== currentOrigin) {
      event.preventDefault()
      shell.openExternal(url)
    }
  })
}

async function createMainWindow() {
  const mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1100,
    minHeight: 720,
    backgroundColor: "#0b0f14",
    title: "NUMA Budget",
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
    },
  })

  setupExternalNavigationGuards(mainWindow)

  const startUrl = resolveStartUrl()
  if (!startUrl) {
    await mainWindow.loadURL(
      createErrorHtml(
        "Imposta NUMA_ELECTRON_START_URL o NUMA_APP_URL per indicare il frontend (https://...)."
      )
    )
    return
  }

  try {
    await mainWindow.loadURL(startUrl)
  } catch (error) {
    await mainWindow.loadURL(createErrorHtml(error?.message ?? "Errore sconosciuto"))
  }
}

app.whenReady().then(() => {
  createMainWindow()
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
  })
})

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit()
})
