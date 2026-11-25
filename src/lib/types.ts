/** Display mode of the widget. */
export type CaptchalaProduct = 'popup' | 'float' | 'embed' | 'bind'

/** Result passed to the success handler. Send `token` to your backend for validation. */
export interface CaptchalaResult {
  token: string
  type: string
  action: string
  offline?: boolean
  clientOnly?: boolean
}

/**
 * Called when the current `serverToken` is rejected (invalid, used up, wrong app).
 * Return a new token to retry once, or null to surface the error.
 */
export type CaptchalaServerTokenHandler = () => Promise<string | null> | string | null

/** Options shared by the component and the `captchala` action. */
export interface CaptchalaOptions {
  /** Your public CaptchaLa app key. */
  appKey: string
  /** Display mode. Default `'popup'`. */
  product?: CaptchalaProduct
  /** Business scene, e.g. `'login'`, `'register'`. Default `'default'`. */
  action?: string
  /** Language code (`'en'`, `'zh-CN'`, ...). Unset = the browser language. */
  lang?: string
  /** Theme: preset string or `{ custom: { brightness: 'light' | 'dark' | 'system', ... } }`. */
  theme?: any
  /** One-time token issued by your backend via `POST /v1/server/challenge/issue`. */
  serverToken?: string
  /** See {@link CaptchalaServerTokenHandler}. */
  onServerTokenExpired?: CaptchalaServerTokenHandler
}

/** The SDK instance returned by `window.Captchala.init()`. */
export interface CaptchalaInstance {
  onReady(cb: () => void): CaptchalaInstance
  onSuccess(cb: (result: CaptchalaResult) => void): CaptchalaInstance
  onError(cb: (error: any, detail?: any) => void): CaptchalaInstance
  onClose(cb: () => void): CaptchalaInstance
  onExpired?(cb: () => void): CaptchalaInstance
  appendTo(target: string | HTMLElement): CaptchalaInstance
  bindTo(target: string | HTMLElement): CaptchalaInstance
  verify(): void
  reset(): void
  destroy(): void
  setLang?(lang: string): void
  [key: string]: any
}
