<!--
  CaptchaLa CAPTCHA widget for Svelte 4 and 5.

  Renders an empty container on the server; the SDK is loaded from the CDN in
  the browser when the component mounts.
-->
<script>
  // Plain JavaScript with JSDoc types, so Svelte 4 projects need no TypeScript preprocessor.
  import { createEventDispatcher, onDestroy, onMount } from 'svelte'
  import { loadCaptchalaSDK } from './loader.js'

  /** @typedef {import('./types.js').CaptchalaInstance} CaptchalaInstance */
  /** @typedef {import('./types.js').CaptchalaProduct} CaptchalaProduct */
  /** @typedef {import('./types.js').CaptchalaResult} CaptchalaResult */
  /** @typedef {import('./types.js').CaptchalaServerTokenHandler} CaptchalaServerTokenHandler */

  /**
   * Your public CaptchaLa app key.
   * @type {string}
   */
  export let appKey
  /**
   * Display mode.
   * @type {CaptchalaProduct}
   */
  export let product = 'popup'
  /**
   * Business scene, e.g. 'login'.
   * @type {string}
   */
  export let action = 'default'
  /**
   * Language code. Unset = the browser language. Changing it switches language in place.
   * @type {string | undefined}
   */
  export let lang = undefined
  /**
   * Theme: preset string or { custom: { brightness: 'light' | 'dark' | 'system', ... } }.
   * @type {any}
   */
  export let theme = undefined
  /**
   * Element or selector to bind to (only for product="bind").
   * @type {string | HTMLElement | undefined}
   */
  export let bindTo = undefined
  /**
   * One-time token issued by your backend via POST /v1/server/challenge/issue.
   * @type {string | undefined}
   */
  export let serverToken = undefined
  /**
   * Called when serverToken is rejected; return a new token to retry once, or null.
   * @type {CaptchalaServerTokenHandler | undefined}
   */
  export let onServerTokenExpired = undefined

  /**
   * Verification passed. Also dispatched as the `success` event.
   * @type {((result: CaptchalaResult) => void) | undefined}
   */
  export let onSuccess = undefined
  /**
   * Loading or verification failed. Also dispatched as the `error` event.
   * @type {((error: any) => void) | undefined}
   */
  export let onError = undefined
  /**
   * The challenge panel was closed. Also dispatched as the `close` event.
   * @type {(() => void) | undefined}
   */
  export let onClose = undefined
  /**
   * The widget is ready. Also dispatched as the `ready` event.
   * @type {(() => void) | undefined}
   */
  export let onReady = undefined
  /**
   * The pass token of the last success expired before it was used. Fires once,
   * instead of onError, and the `expired` event is dispatched too. The widget
   * shows the expiry either way; call reset() then verify() for a new
   * verification. Without this prop the expiry is reported through onError.
   * @type {(() => void) | undefined}
   */
  export let onExpired = undefined

  let className = ''
  /** Class names for the container. */
  export { className as class }
  /**
   * Inline style for the container.
   * @type {string}
   */
  export let style = ''

  /** @type {import('svelte').EventDispatcher<{ success: CaptchalaResult; error: any; close: void; ready: void; expired: void }>} */
  const dispatch = createEventDispatcher()

  /** @type {HTMLDivElement} */
  let container
  /** @type {CaptchalaInstance | null} */
  let instance = null
  let mounted = false
  let destroyed = false
  let seq = 0
  /** @type {ReturnType<typeof setTimeout> | null} */
  let timer = null
  /** @type {unknown[] | null} */
  let lastKey = null

  function teardown() {
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

  async function init() {
    const mySeq = ++seq
    lastKey = [appKey, product, action, bindTo, serverToken, theme, !!onExpired]
    appliedLang = lang
    try {
      await loadCaptchalaSDK()
      if (destroyed || mySeq !== seq || !container) return
      const Captchala = /** @type {any} */ (window).Captchala
      if (!Captchala) return

      teardown()
      while (container.firstChild) container.removeChild(container.firstChild)

      const handler = onServerTokenExpired
      /** @type {CaptchalaInstance} */
      const inst = Captchala.init({
        appKey,
        product,
        action,
        lang,
        theme,
        serverToken,
        onServerTokenExpired: handler ? () => handler() ?? null : undefined
      })
      inst
        .onReady(() => {
          onReady?.()
          dispatch('ready')
        })
        .onSuccess((/** @type {CaptchalaResult} */ result) => {
          onSuccess?.(result)
          dispatch('success', result)
        })
        .onError((/** @type {any} */ err) => {
          onError?.(err)
          dispatch('error', err)
        })
        .onClose(() => {
          onClose?.()
          dispatch('close')
        })
      // Registered only with a handler: without one the SDK reports expiry via onError.
      if (onExpired && typeof inst.onExpired === 'function') {
        inst.onExpired(() => {
          onExpired?.()
          dispatch('expired')
        })
      }

      if (product === 'bind') {
        if (bindTo) inst.bindTo(bindTo)
      } else {
        inst.appendTo(container)
      }
      instance = inst
    } catch (err) {
      if (destroyed) return
      onError?.(err)
      dispatch('error', err)
    }
  }

  function scheduleInit() {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      timer = null
      init()
    }, 100)
  }

  // Key props rebuild the widget (debounced); lang is switched in place.
  $: key = [appKey, product, action, bindTo, serverToken, theme, !!onExpired]
  $: if (mounted && lastKey && key.some((v, i) => v !== /** @type {unknown[]} */ (lastKey)[i])) scheduleInit()
  $: applyLang(lang)

  let appliedLang = lang
  /** @param {string | undefined} next */
  function applyLang(next) {
    if (!next || next === appliedLang) return
    appliedLang = next
    instance?.setLang?.(next)
  }

  onMount(() => {
    mounted = true
    init()
  })

  onDestroy(() => {
    destroyed = true
    if (timer) clearTimeout(timer)
    teardown()
  })

  /** Opens the challenge (popup / bind modes). */
  export function verify() {
    instance?.verify()
  }

  /** Resets the widget state. */
  export function reset() {
    instance?.reset()
  }

  /** Destroys the SDK instance. */
  export function destroy() {
    teardown()
  }

  /**
   * Binds the challenge to an element (bind mode).
   * @param {string | HTMLElement} target
   */
  export function bind(target) {
    instance?.bindTo(target)
  }

  /**
   * Switches the language in place.
   * @param {string} next
   */
  export function setLang(next) {
    instance?.setLang?.(next)
  }

  /**
   * The raw SDK instance, or null before it is ready.
   * @returns {CaptchalaInstance | null}
   */
  export function getInstance() {
    return instance
  }
</script>

<div
  bind:this={container}
  class="captchala-container {className}"
  class:captchala-container--bind={product === 'bind'}
  {style}
></div>

<style>
  .captchala-container {
    min-height: 50px;
  }
  .captchala-container--bind {
    min-height: 0;
    position: absolute;
    width: 0;
    height: 0;
    overflow: hidden;
  }
</style>
