/**
 * Loads the CaptchaLa web SDK from the CDN.
 *
 * The core SDK is CDN-only so it can be updated in real time. This module
 * injects the small loader script (`captchala-loader.js`), which in turn loads
 * the SDK with its own host fallback, and resolves once `window.Captchala`
 * exists. Safe to call many times: concurrent calls share one load.
 */
/**
 * Loads the SDK once. Resolves when `window.Captchala` is available.
 * Rejects outside a browser (SSR) and when every CDN host failed; a later call
 * tries again.
 */
export declare function loadCaptchalaSDK(): Promise<void>;
/** True once the SDK is available on the page. */
export declare function isCaptchalaLoaded(): boolean;
