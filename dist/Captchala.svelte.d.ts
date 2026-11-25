export default Captchala;
type Captchala = SvelteComponent<{
    appKey: string;
    product?: CaptchalaProduct | undefined;
    action?: string | undefined;
    lang?: string | undefined;
    theme?: any;
    bindTo?: string | HTMLElement | undefined;
    serverToken?: string | undefined;
    onServerTokenExpired?: CaptchalaServerTokenHandler | undefined;
    onSuccess?: ((result: CaptchalaResult) => void) | undefined;
    onError?: ((error: any) => void) | undefined;
    onClose?: (() => void) | undefined;
    onReady?: (() => void) | undefined;
    onExpired?: (() => void) | undefined;
    class?: string | undefined;
    style?: string | undefined;
    verify?: (() => void) | undefined;
    reset?: (() => void) | undefined;
    destroy?: (() => void) | undefined;
    bind?: ((target: string | HTMLElement) => void) | undefined;
    setLang?: ((next: string) => void) | undefined;
    getInstance?: (() => CaptchalaInstance | null) | undefined;
}, {
    ready: CustomEvent<any>;
    success: CustomEvent<any>;
    error: CustomEvent<any>;
    close: CustomEvent<any>;
    expired: CustomEvent<any>;
} & {
    [evt: string]: CustomEvent<any>;
}, {}> & {
    $$bindings?: string | undefined;
} & {
    verify: () => void;
    reset: () => void;
    destroy: () => void;
    bind: (target: string | HTMLElement) => void;
    setLang: (next: string) => void;
    getInstance: () => CaptchalaInstance | null;
};
declare const Captchala: $$__sveltets_2_IsomorphicComponent<{
    appKey: string;
    product?: import("./types.js").CaptchalaProduct | undefined;
    action?: string | undefined;
    lang?: string | undefined;
    theme?: any;
    bindTo?: string | HTMLElement | undefined;
    serverToken?: string | undefined;
    onServerTokenExpired?: import("./types.js").CaptchalaServerTokenHandler | undefined;
    onSuccess?: ((result: import("./types.js").CaptchalaResult) => void) | undefined;
    onError?: ((error: any) => void) | undefined;
    onClose?: (() => void) | undefined;
    onReady?: (() => void) | undefined;
    onExpired?: (() => void) | undefined;
    class?: string | undefined;
    style?: string | undefined;
    verify?: (() => void) | undefined;
    reset?: (() => void) | undefined;
    destroy?: (() => void) | undefined;
    bind?: ((target: string | HTMLElement) => void) | undefined;
    setLang?: ((next: string) => void) | undefined;
    getInstance?: (() => import("./types.js").CaptchalaInstance | null) | undefined;
}, {
    ready: CustomEvent<any>;
    success: CustomEvent<any>;
    error: CustomEvent<any>;
    close: CustomEvent<any>;
    expired: CustomEvent<any>;
} & {
    [evt: string]: CustomEvent<any>;
}, {}, {
    verify: () => void;
    reset: () => void;
    destroy: () => void;
    bind: (target: string | HTMLElement) => void;
    setLang: (next: string) => void;
    getInstance: () => import("./types.js").CaptchalaInstance | null;
}, string>;
interface $$__sveltets_2_IsomorphicComponent<Props extends Record<string, any> = any, Events extends Record<string, any> = any, Slots extends Record<string, any> = any, Exports = {}, Bindings = string> {
    new (options: import("svelte").ComponentConstructorOptions<Props>): import("svelte").SvelteComponent<Props, Events, Slots> & {
        $$bindings?: Bindings;
    } & Exports;
    (internal: unknown, props: Props & {
        $$events?: Events;
        $$slots?: Slots;
    }): Exports & {
        $set?: any;
        $on?: any;
    };
    z_$$bindings?: Bindings;
}
