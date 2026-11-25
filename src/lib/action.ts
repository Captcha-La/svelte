import { loadCaptchalaSDK } from './loader.js'
import type { CaptchalaInstance, CaptchalaOptions, CaptchalaResult } from './types.js'

export interface CaptchalaActionOptions extends CaptchalaOptions {
  /**
   * Element or selector to bind to in bind mode. Defaults to the element the
   * action is used on, so `<button use:captchala={{ product: 'bind', ... }}>`
   * opens the challenge when that button is clicked.
   */
  bindTo?: string | HTMLElement
  onSuccess?: (result: CaptchalaResult) => void
  onError?: (error: any) => void
  onClose?: () => void
  onReady?: () => void
  /**
   * The pass token of the last success expired before it was used. Fires once,
   * instead of onError. Without it the expiry is reported through onError.
   */
  onExpired?: () => void
  /** Receives the SDK instance after each (re)initialisation, for verify() / reset(). */
  onInit?: (instance: CaptchalaInstance) => void
}

const REINIT_KEYS: (keyof CaptchalaActionOptions)[] = [
  'appKey',
  'product',
  'action',
  'bindTo',
  'serverToken',
  'theme'
]

/**
 * Svelte action that mounts the widget into (or binds it to) an element.
 *
 * ```svelte
 * <div use:captchala={{ appKey: 'your-app-key', product: 'float', onSuccess }} />
 * <button use:captchala={{ appKey: 'your-app-key', product: 'bind', onSuccess }}>Sign in</button>
 * ```
 *
 * Actions only run in the browser, so this is safe with SvelteKit SSR.
 */
export function captchala(node: HTMLElement, options: CaptchalaActionOptions) {
  let opts = options
  let instance: CaptchalaInstance | null = null
  let destroyed = false
  let seq = 0

  const teardown = () => {
    if (instance) {
      const inst = instance
      instance = null
      try {
        inst.destroy()
      } catch {
        // already gone
      }
    }
  }

  const init = async () => {
    const mySeq = ++seq
    try {
      await loadCaptchalaSDK()
      if (destroyed || mySeq !== seq) return
      const Captchala = (window as any).Captchala
      if (!Captchala) return
      teardown()

      const o = opts
      const product = o.product || 'popup'
      const inst: CaptchalaInstance = Captchala.init({
        appKey: o.appKey,
        product,
        action: o.action || 'default',
        lang: o.lang,
        theme: o.theme,
        serverToken: o.serverToken,
        onServerTokenExpired: o.onServerTokenExpired
          ? () => opts.onServerTokenExpired?.() ?? null
          : undefined
      })
      // Handlers read the latest options, so changing a callback needs no rebuild.
      inst
        .onReady(() => opts.onReady?.())
        .onSuccess((result: CaptchalaResult) => opts.onSuccess?.(result))
        .onError((err: any) => opts.onError?.(err))
        .onClose(() => opts.onClose?.())
      if (o.onExpired && typeof inst.onExpired === 'function') {
        inst.onExpired(() => opts.onExpired?.())
      }

      if (product === 'bind') {
        inst.bindTo(o.bindTo || node)
      } else {
        while (node.firstChild) node.removeChild(node.firstChild)
        inst.appendTo(node)
      }
      instance = inst
      o.onInit?.(inst)
    } catch (err) {
      if (!destroyed) opts.onError?.(err)
    }
  }

  init()

  return {
    update(next: CaptchalaActionOptions) {
      const prev = opts
      opts = next
      const rebuild =
        REINIT_KEYS.some((k) => prev[k] !== next[k]) || !!prev.onExpired !== !!next.onExpired
      if (rebuild) {
        init()
      } else if (next.lang && next.lang !== prev.lang) {
        instance?.setLang?.(next.lang)
      }
    },
    destroy() {
      destroyed = true
      teardown()
    }
  }
}
