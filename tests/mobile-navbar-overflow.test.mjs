import assert from "node:assert/strict"
import test from "node:test"

const CDP_BASE_URL = process.env.CDP_BASE_URL ?? "http://127.0.0.1:9225"
const APP_URL = process.env.APP_URL ?? "http://127.0.0.1:3100/"
const OPERATION_TIMEOUT_MS = 5_000
const TEST_TIMEOUT_MS = 30_000

function remainingTimeout(deadline, maximum = OPERATION_TIMEOUT_MS) {
  const remaining = deadline - Date.now()
  if (remaining <= 0) throw new Error("Browser test exceeded its overall deadline")
  return Math.min(maximum, remaining)
}

async function sleep(milliseconds, deadline) {
  await new Promise((resolve) => setTimeout(resolve, Math.min(milliseconds, remainingTimeout(deadline))))
  remainingTimeout(deadline)
}

async function openTarget(url, deadline) {
  const response = await fetch(`${CDP_BASE_URL}/json/new?${encodeURIComponent(url)}`, {
    method: "PUT",
    signal: AbortSignal.timeout(remainingTimeout(deadline)),
  })
  assert.equal(response.ok, true, `Could not create Chrome target: ${response.status}`)
  return response.json()
}

class CdpClient {
  constructor(url, deadline) {
    this.socket = new WebSocket(url)
    this.deadline = deadline
    this.nextId = 1
    this.pending = new Map()
  }

  async connect() {
    await new Promise((resolve, reject) => {
      const cleanup = () => {
        clearTimeout(timeout)
        this.socket.removeEventListener("open", onOpen)
        this.socket.removeEventListener("error", onError)
      }
      const onOpen = () => {
        cleanup()
        resolve()
      }
      const onError = (error) => {
        cleanup()
        reject(error)
      }
      const timeout = setTimeout(() => {
        cleanup()
        this.socket.close()
        reject(new Error("Timed out connecting to Chrome CDP"))
      }, remainingTimeout(this.deadline))
      this.socket.addEventListener("open", onOpen, { once: true })
      this.socket.addEventListener("error", onError, { once: true })
    })
    this.socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data)
      if (!message.id) return
      const pending = this.pending.get(message.id)
      if (!pending) return
      this.pending.delete(message.id)
      if (message.error) pending.reject(new Error(JSON.stringify(message.error)))
      else pending.resolve(message.result)
    })
  }

  send(method, params = {}) {
    const id = this.nextId++
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pending.delete(id)
        reject(new Error(`Timed out waiting for CDP command: ${method}`))
      }, remainingTimeout(this.deadline))
      this.pending.set(id, {
        resolve: (result) => {
          clearTimeout(timeout)
          resolve(result)
        },
        reject: (error) => {
          clearTimeout(timeout)
          reject(error)
        },
      })
      try {
        this.socket.send(JSON.stringify({ id, method, params }))
      } catch (error) {
        this.pending.delete(id)
        clearTimeout(timeout)
        reject(error)
      }
    })
  }

  async evaluate(expression) {
    const result = await this.send("Runtime.evaluate", { expression, returnByValue: true })
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text)
    return result.result.value
  }

  close() {
    for (const pending of this.pending.values()) pending.reject(new Error("CDP connection closed"))
    this.pending.clear()
    this.socket.close()
  }
}

test("the navbar overflow rules are mobile-only", { timeout: TEST_TIMEOUT_MS }, async () => {
  const deadline = Date.now() + TEST_TIMEOUT_MS - 1_000
  const target = await openTarget("about:blank", deadline)
  const cdp = new CdpClient(target.webSocketDebuggerUrl, deadline)

  try {
    await cdp.connect()
    await cdp.send("Page.enable")
    await cdp.send("Runtime.enable")
    await cdp.send("Network.enable")
    await cdp.send("Network.setCacheDisabled", { cacheDisabled: true })
    await cdp.send("Network.setBypassServiceWorker", { bypass: true })
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: 390,
      height: 844,
      deviceScaleFactor: 3,
      mobile: true,
      screenWidth: 390,
      screenHeight: 844,
    })
    await cdp.send("Page.navigate", { url: APP_URL })

    let ready = false
    for (let attempt = 0; attempt < 80; attempt += 1) {
      ready = await cdp.evaluate(
        `document.readyState === "complete" && !!document.querySelector('button[aria-label="Abrir menú"]')`,
      )
      if (ready) break
      await sleep(250, deadline)
    }
    assert.equal(ready, true, "Navbar did not become ready")
    await sleep(500, deadline)

    const viewport = await cdp.evaluate(`(() => {
      const overlay = [...document.querySelectorAll("body *")].find((element) =>
        String(element.className || "").includes("fixed inset-0"),
      )
      const panel = [...document.querySelectorAll("body *")].find((element) =>
        String(element.className || "").includes("translate-x-full"),
      )
      return {
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        screenWidth: screen.width,
        htmlOverflowX: getComputedStyle(document.documentElement).overflowX,
        bodyOverflowX: getComputedStyle(document.body).overflowX,
        overlayClass: String(overlay?.className || ""),
        overlayWidth: overlay ? getComputedStyle(overlay).width : null,
        overlayRect: overlay ? { left: overlay.getBoundingClientRect().left, right: overlay.getBoundingClientRect().right } : null,
        panelClass: String(panel?.className || ""),
        panelWidth: panel ? getComputedStyle(panel).width : null,
        panelRect: panel ? { left: panel.getBoundingClientRect().left, right: panel.getBoundingClientRect().right } : null,
      }
    })()`)

    assert.equal(viewport.clientWidth, viewport.screenWidth)
    assert.equal(viewport.htmlOverflowX, "clip")
    assert.equal(viewport.bodyOverflowX, "clip")
    assert.equal(
      viewport.scrollWidth,
      viewport.clientWidth,
      `Closed menu widened page: ${JSON.stringify(viewport)}`,
    )

    await cdp.evaluate(`document.querySelector('button[aria-label="Abrir menú"]')?.click()`)
    await sleep(400, deadline)

    const viewportOpen = await cdp.evaluate(`(() => {
      const closeButton = document.querySelector('button[aria-label="Cerrar menú"]')
      const rect = closeButton?.getBoundingClientRect()
      const style = closeButton ? getComputedStyle(closeButton) : null
      const hit = rect ? document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2) : null
      return {
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        bodyOverflow: document.body.style.overflow,
        closeButtonVisible:
          !!closeButton &&
          !!rect &&
          rect.width > 0 &&
          rect.height > 0 &&
          rect.left >= 0 &&
          rect.right <= innerWidth &&
          rect.top >= 0 &&
          rect.bottom <= innerHeight &&
          style?.display !== "none" &&
          style?.visibility === "visible" &&
          Number(style?.opacity) > 0 &&
          (hit === closeButton || closeButton.contains(hit)),
      }
    })()`)
    assert.equal(viewportOpen.scrollWidth, viewportOpen.clientWidth)
    assert.equal(viewportOpen.bodyOverflow, "hidden")
    assert.equal(viewportOpen.closeButtonVisible, true)

    await cdp.evaluate(`document.querySelector('button[aria-label="Cerrar menú"]')?.click()`)
    await sleep(400, deadline)

    const viewportAfterClose = await cdp.evaluate(`({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      bodyOverflow: document.body.style.overflow,
      bodyOverflowX: getComputedStyle(document.body).overflowX,
    })`)
    assert.equal(
      viewportAfterClose.scrollWidth,
      viewportAfterClose.clientWidth,
      `Closing the menu restored horizontal overflow: ${JSON.stringify(viewportAfterClose)}`,
    )
    assert.equal(viewportAfterClose.bodyOverflowX, "clip")
    assert.equal(viewportAfterClose.bodyOverflow, "")

    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: 1280,
      height: 800,
      deviceScaleFactor: 1,
      mobile: false,
      screenWidth: 1280,
      screenHeight: 800,
    })
    await cdp.send("Page.navigate", { url: APP_URL })

    let desktopReady = false
    for (let attempt = 0; attempt < 80; attempt += 1) {
      desktopReady = await cdp.evaluate(`document.readyState === "complete"`)
      if (desktopReady) break
      await sleep(250, deadline)
    }
    assert.equal(desktopReady, true, "Desktop page did not become ready")

    const desktopOverflow = await cdp.evaluate(`({
      html: getComputedStyle(document.documentElement).overflowX,
      body: getComputedStyle(document.body).overflowX,
    })`)
    assert.notEqual(desktopOverflow.html, "clip")
    assert.notEqual(desktopOverflow.body, "clip")
  } finally {
    await cdp.send("Page.close").catch(() => {})
    cdp.close()
  }
})
