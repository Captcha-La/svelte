# @captcha-la/svelte

[English](./README.md) · [简体中文](./README.zh-CN.md)

Official Captchala CAPTCHA Svelte component and action - Smart CAPTCHA protection for your Svelte and SvelteKit applications.

[![npm version](https://img.shields.io/npm/v/@captcha-la/svelte.svg)](https://www.npmjs.com/package/@captcha-la/svelte)
[![npm downloads](https://img.shields.io/npm/dm/@captcha-la/svelte.svg)](https://www.npmjs.com/package/@captcha-la/svelte)
[![license](https://img.shields.io/npm/l/@captcha-la/svelte.svg)](https://github.com/Captcha-La/svelte/blob/main/LICENSE)

- `<Captchala>` component and `use:captchala` action
- Works with Svelte 4 and Svelte 5 (runes or legacy mode); no TypeScript preprocessor needed
- SSR safe in SvelteKit: nothing runs on the server
- Loads the CAPTCHA SDK from the CDN at runtime, so you always get the latest protection

## Installation

```bash
npm install @captcha-la/svelte
# or
yarn add @captcha-la/svelte
# or
pnpm add @captcha-la/svelte
```

## Quick Start

### Component Approach

```svelte
<script>
  import { Captchala } from '@captcha-la/svelte'

  function handleSuccess(result) {
    console.log('Verification successful!')
    console.log('Token:', result.token)
    // Send token to your server for validation
  }
</script>

<Captchala
  appKey="your-app-key"
  product="popup"
  onSuccess={handleSuccess}
  onError={(err) => console.error(err)}
/>
```

Callback props work in Svelte 4 and 5. In Svelte 4 you can also listen with
`on:success`, `on:error`, `on:close` and `on:ready` (the payload is in `event.detail`).

### Action Approach

The action mounts the widget into an element, or in bind mode binds it to the
element it is used on, for example your own submit button:

```svelte
<script>
  import { captchala } from '@captcha-la/svelte'

  let token = ''
</script>

<form method="POST">
  <input type="email" name="email" placeholder="Email" />
  <input type="password" name="password" placeholder="Password" />
  <input type="hidden" name="captcha_token" value={token} />
  <button
    type="button"
    use:captchala={{
      appKey: 'your-app-key',
      product: 'bind',
      action: 'login',
      onSuccess: (result) => {
        token = result.token
        // Continue with form submission
      }
    }}
  >
    Login
  </button>
</form>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `appKey` | `string` | *required* | Your Captchala application key |
| `serverToken` | `string` | - | One-time, server-issued challenge token. Required when the app has `server_token_required=true`. See [Production: serverToken mode](#production-using-servertoken) below. |
| `product` | `'popup' \| 'float' \| 'embed' \| 'bind'` | `'popup'` | Display mode |
| `action` | `string` | `'default'` | Action identifier (e.g., 'login', 'register', 'checkout') |
| `lang` | `string` | browser language | Language code (`'zh-CN'`, `'en'`, `'ja'`, etc.); unset = the browser language. Changing it switches the language in place |
| `theme` | `string \| object` | - | Preset string or `{ custom: { brightness: 'light' \| 'dark' \| 'system', ... } }`. Omit to follow the system |
| `bindTo` | `string \| HTMLElement` | - | Element or selector to bind to (only for `product="bind"`) |
| `onServerTokenExpired` | `() => Promise<string \| null> \| string \| null` | - | Called when `serverToken` is rejected. Return a new token to retry once, or `null` to surface the error |
| `onSuccess` | `(result) => void` | - | Success callback (also the `success` event) |
| `onExpired` | `() => void` | - | The pass token expired before it was used (fires once, instead of `onError`; the widget shows the expiry). See [Token expiry](#token-expiry) |
| `onError` | `(error) => void` | - | Error callback (also the `error` event) |
| `onClose` | `() => void` | - | Close callback (also the `close` event) |
| `onReady` | `() => void` | - | Ready callback (also the `ready` event) |
| `class` | `string` | - | Container class name |
| `style` | `string` | - | Container inline styles |

Changing `appKey`, `product`, `action`, `bindTo`, `serverToken` or `theme` rebuilds the widget.

## Methods (via `bind:this`)

```svelte
<script>
  import { Captchala } from '@captcha-la/svelte'

  let captcha
</script>

<Captchala bind:this={captcha} appKey="your-key" />
<button on:click={() => captcha.verify()}>Verify</button>
```

| Method | Description |
|--------|-------------|
| `verify()` | Trigger verification |
| `reset()` | Reset CAPTCHA state |
| `destroy()` | Destroy CAPTCHA instance |
| `bind(selector)` | Bind to element (for 'bind' mode). Named `bind` because `bindTo` is the prop |
| `setLang(lang)` | Switch the language in place |
| `getInstance()` | The underlying SDK instance |

## `use:captchala` Action

```ts
use:captchala={{
  appKey,           // string - required
  product,          // 'popup' | 'float' | 'embed' | 'bind'
  action, lang, theme, serverToken, onServerTokenExpired,
  bindTo,           // bind mode: defaults to the element the action is on
  onSuccess, onError, onClose, onReady, onExpired,
  onInit            // (instance) => void - the SDK instance, for verify() / reset()
}}
```

When the options change, the widget is rebuilt if `appKey`, `product`, `action`,
`bindTo`, `serverToken` or `theme` changed (keep a `theme` object in a variable
rather than writing it inline); a `lang` change switches the language in place;
callbacks are always read fresh.

## Token expiry

The pass token from `onSuccess` is valid for a limited time. If the user waits too
long before submitting, the widget shows that the verification expired (the bar
or checkbox asks to verify again; in `bind` mode nothing is shown, since the
button is yours) and `onExpired` fires once, instead of `onError`. You decide what
else happens, for example show your own message and call `reset()` then `verify()`
to start a new verification (the same pattern as an `expired-callback` +
`reset()` + `execute()` in other CAPTCHA widgets):

```svelte
<script>
  import { Captchala } from '@captcha-la/svelte'

  let captcha
  let token = ''
  let expired = false

  function verifyAgain() {
    expired = false
    captcha.reset()
    captcha.verify()
  }
</script>

<Captchala
  bind:this={captcha}
  appKey="your-app-key"
  onSuccess={(r) => { token = r.token; expired = false }}
  onExpired={() => { token = ''; expired = true }}
/>
{#if expired}
  <p>Token expired. <button on:click={verifyAgain}>Verify again</button></p>
{/if}
```

Expiry handling is switched on by the `onExpired` prop; the `expired` event is
dispatched as well, but only when the prop is set. Without `onExpired`,
`onError` fires once (class `expired`), as before. `onExpired` never fires for
offline or degraded tokens. The action's `onExpired` option works the same way.

## Display Modes

### Popup Mode (Default)
Shows a button that triggers a popup CAPTCHA dialog.

```svelte
<Captchala appKey="your-key" product="popup" />
```

### Float Mode
Displays an inline floating CAPTCHA widget.

```svelte
<Captchala appKey="your-key" product="float" />
```

### Embed Mode
Embeds the CAPTCHA directly in the page.

```svelte
<Captchala appKey="your-key" product="embed" />
```

### Bind Mode with the Action
Best for form submissions - verifies when the user clicks your button. See the
[action approach](#action-approach) above.

## SvelteKit and SSR

The package is SSR safe. During server rendering (and prerendering) the
component outputs an empty container; the SDK is loaded only in the browser,
from `onMount`. Actions never run on the server. No `browser` checks or
`ssr = false` are needed.

Notes:
- Do not call `loadCaptchalaSDK()` at module top level in a `+page.js` /
  `+layout.js` load function that runs on the server; it rejects outside the browser.
- Fetch the `serverToken` from your own `+server.js` endpoint (see below) in the
  browser, or return it from a server `load` function, so the app secret stays on
  the server.

## Production: using `serverToken`

For production (login, registration, payment, etc.) we recommend the
**server-issued token flow**. Your backend holds the app secret, calls
`POST /v1/server/challenge/issue` with `X-App-Key` + `X-App-Secret` to mint a
one-time `server_token` (5-minute TTL), and hands that token to the browser.
The browser then renders the widget with `serverToken`:

```svelte
<script>
  import { onMount } from 'svelte'
  import { Captchala } from '@captcha-la/svelte'

  let serverToken

  onMount(async () => {
    // Your own backend endpoint that proxies /v1/server/challenge/issue
    const r = await fetch('/api/captcha-token')
    serverToken = (await r.json()).server_token
  })
</script>

{#if serverToken}
  <Captchala
    {serverToken}
    appKey="pk_your_public_app_key"
    action="login"
    onSuccess={(r) => console.log('pass_token:', r.token)}
  />
{:else}
  <div>Loading...</div>
{/if}
```

Example backend endpoint (SvelteKit, `src/routes/api/captcha-token/+server.js`):

```js
import { json } from '@sveltejs/kit'
import { env } from '$env/dynamic/private'

export async function GET() {
  const r = await fetch('https://verify.captcha.la/v1/server/challenge/issue', {
    method: 'POST',
    headers: {
      'X-App-Key': env.CAPTCHALA_APP_KEY,
      'X-App-Secret': env.CAPTCHALA_APP_SECRET,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'action=login&ttl=300'
  })
  const { data } = await r.json()
  return json({ server_token: data.server_token })
}
```

Notes:
- Never embed `X-App-Secret` in browser code. In SvelteKit, read it from `$env/dynamic/private` or `$env/static/private`.
- Each `server_token` can be used exactly once. Regenerate before every widget mount.
- Legacy apps with `server_token_required=false` can still use the public `appKey`-only flow.

## Server-side Validation

After receiving the token from `onSuccess`, validate it on your server, for
example in a SvelteKit form action:

```js
// src/routes/login/+page.server.js
import { fail } from '@sveltejs/kit'
import { env } from '$env/dynamic/private'

export const actions = {
  default: async ({ request, getClientAddress }) => {
    const form = await request.formData()
    const response = await fetch('https://verify.captcha.la/v1/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-App-Key': env.CAPTCHALA_APP_KEY,
        'X-App-Secret': env.CAPTCHALA_APP_SECRET
      },
      // pass_token = result.token from onSuccess; client_ip is optional but recommended
      body: JSON.stringify({ pass_token: form.get('captcha_token'), client_ip: getClientAddress() })
    })

    const result = await response.json()
    if (!(result.code === 0 && result.data.valid === true)) {
      return fail(400, { captcha: 'invalid' })
    }
    // Token is valid, proceed with the request
  }
}
```

## TypeScript Support

Type definitions are included:

```ts
import {
  Captchala,
  captchala,
  type CaptchalaResult,
  type CaptchalaActionOptions,
  type CaptchalaInstance
} from '@captcha-la/svelte'
```

## Example

A SvelteKit app (prerendered, with two routes) lives in [`example/`](./example).
Build the package first (`npm install && npm run build`), then run
`npm install && npm run dev` in `example/` and open
`http://localhost:5173/?appKey=your-app-key`.

## License

MIT License - see [LICENSE](./LICENSE) for details.

## Links

- [Website](https://captcha.la)
- [Documentation](https://docs.captcha.la/sdk/web)
- [Dashboard](https://dash.captcha.la)
