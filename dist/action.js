import { loadCaptchalaSDK } from './loader.js';
const REINIT_KEYS = [
    'appKey',
    'product',
    'action',
    'bindTo',
    'serverToken',
    'theme'
];
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
export function captchala(node, options) {
    let opts = options;
    let instance = null;
    let destroyed = false;
    let seq = 0;
    const teardown = () => {
        if (instance) {
            const inst = instance;
            instance = null;
            try {
                inst.destroy();
            }
            catch {
                // already gone
            }
        }
    };
    const init = async () => {
        const mySeq = ++seq;
        try {
            await loadCaptchalaSDK();
            if (destroyed || mySeq !== seq)
                return;
            const Captchala = window.Captchala;
            if (!Captchala)
                return;
            teardown();
            const o = opts;
            const product = o.product || 'popup';
            const inst = Captchala.init({
                appKey: o.appKey,
                product,
                action: o.action || 'default',
                lang: o.lang,
                theme: o.theme,
                serverToken: o.serverToken,
                onServerTokenExpired: o.onServerTokenExpired
                    ? () => opts.onServerTokenExpired?.() ?? null
                    : undefined
            });
            // Handlers read the latest options, so changing a callback needs no rebuild.
            inst
                .onReady(() => opts.onReady?.())
                .onSuccess((result) => opts.onSuccess?.(result))
                .onError((err) => opts.onError?.(err))
                .onClose(() => opts.onClose?.());
            if (o.onExpired && typeof inst.onExpired === 'function') {
                inst.onExpired(() => opts.onExpired?.());
            }
            if (product === 'bind') {
                inst.bindTo(o.bindTo || node);
            }
            else {
                while (node.firstChild)
                    node.removeChild(node.firstChild);
                inst.appendTo(node);
            }
            instance = inst;
            o.onInit?.(inst);
        }
        catch (err) {
            if (!destroyed)
                opts.onError?.(err);
        }
    };
    init();
    return {
        update(next) {
            const prev = opts;
            opts = next;
            const rebuild = REINIT_KEYS.some((k) => prev[k] !== next[k]) || !!prev.onExpired !== !!next.onExpired;
            if (rebuild) {
                init();
            }
            else if (next.lang && next.lang !== prev.lang) {
                instance?.setLang?.(next.lang);
            }
        },
        destroy() {
            destroyed = true;
            teardown();
        }
    };
}
