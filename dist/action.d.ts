import type { CaptchalaInstance, CaptchalaOptions, CaptchalaResult } from './types.js';
export interface CaptchalaActionOptions extends CaptchalaOptions {
    /**
     * Element or selector to bind to in bind mode. Defaults to the element the
     * action is used on, so `<button use:captchala={{ product: 'bind', ... }}>`
     * opens the challenge when that button is clicked.
     */
    bindTo?: string | HTMLElement;
    onSuccess?: (result: CaptchalaResult) => void;
    onError?: (error: any) => void;
    onClose?: () => void;
    onReady?: () => void;
    /**
     * The pass token of the last success expired before it was used. Fires once,
     * instead of onError. Without it the expiry is reported through onError.
     */
    onExpired?: () => void;
    /** Receives the SDK instance after each (re)initialisation, for verify() / reset(). */
    onInit?: (instance: CaptchalaInstance) => void;
}
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
export declare function captchala(node: HTMLElement, options: CaptchalaActionOptions): {
    update(next: CaptchalaActionOptions): void;
    destroy(): void;
};
