/**
 * Loads the CaptchaLa web SDK from the CDN.
 *
 * The core SDK is CDN-only so it can be updated in real time. This module
 * injects the small loader script (`captchala-loader.js`), which in turn loads
 * the SDK with its own host fallback, and resolves once `window.Captchala`
 * exists. Safe to call many times: concurrent calls share one load.
 */

const LOADER_HOSTS = ['cdn.captcha-cdn.net', 'cdn.captchala.com']
const LOADER_PATH = '/captchala-loader.js'
const LOADER_TIMEOUT = 10000

let pending: Promise<void> | null = null

function win(): any {
  return typeof window === 'undefined' ? undefined : (window as any)
}

function toError(err: unknown, fallback: string): Error {
  if (err instanceof Error) return err
  if (typeof err === 'string' && err) return new Error(err)
  return new Error(fallback)
}

/** Waits for a loader script that the page added itself (for example in index.html). */
function waitForExistingLoader(): Promise<boolean> {
  return new Promise((resolve) => {
    const started = Date.now()
    const timer = setInterval(() => {
      const w = win()
      if (w.Captchala || typeof w.loadCaptchala === 'function') {
        clearInterval(timer)
        resolve(true)
      } else if (Date.now() - started >= LOADER_TIMEOUT) {
        clearInterval(timer)
        resolve(false)
      }
    }, 50)
  })
}

function injectLoader(index: number): Promise<void> {
  return new Promise((resolve, reject) => {
    if (index >= LOADER_HOSTS.length) {
      reject(new Error('Failed to load the Captchala loader from all CDN hosts'))
      return
    }
    const script = document.createElement('script')
    script.src = `https://${LOADER_HOSTS[index]}${LOADER_PATH}`
    script.async = true
    let settled = false

    const next = () => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      script.onload = script.onerror = null
      if (script.parentNode) script.parentNode.removeChild(script)
      injectLoader(index + 1).then(resolve, reject)
    }

    const timer = setTimeout(next, LOADER_TIMEOUT)
    script.onerror = next
    script.onload = () => {
      if (settled) return
      if (typeof win().loadCaptchala !== 'function' && !win().Captchala) {
        next()
        return
      }
      settled = true
      clearTimeout(timer)
      script.onload = script.onerror = null
      resolve()
    }
    document.head.appendChild(script)
  })
}

async function ensureLoader(): Promise<void> {
  const w = win()
  if (w.Captchala || typeof w.loadCaptchala === 'function') return
  if (document.querySelector('script[src*="captchala-loader.js"]')) {
    if (await waitForExistingLoader()) return
  }
  await injectLoader(0)
}

/**
 * Loads the SDK once. Resolves when `window.Captchala` is available.
 * Rejects outside a browser (SSR) and when every CDN host failed; a later call
 * tries again.
 */
export function loadCaptchalaSDK(): Promise<void> {
  const w = win()
  if (!w || typeof document === 'undefined') {
    return Promise.reject(new Error('Captchala can only be loaded in a browser'))
  }
  if (w.Captchala) return Promise.resolve()
  if (!pending) {
    pending = ensureLoader()
      .then(
        () =>
          new Promise<void>((resolve, reject) => {
            if (w.Captchala) {
              resolve()
              return
            }
            w.loadCaptchala(
              () => resolve(),
              (err: unknown) => reject(toError(err, 'Failed to load the Captchala SDK'))
            )
          })
      )
      .catch((err) => {
        pending = null
        throw toError(err, 'Failed to load the Captchala SDK')
      })
  }
  return pending
}

/** True once the SDK is available on the page. */
export function isCaptchalaLoaded(): boolean {
  const w = win()
  return !!(w && w.Captchala)
}
