# @captcha-la/svelte

[English](https://github.com/Captcha-La/svelte/blob/main/README.md) · [简体中文](https://github.com/Captcha-La/svelte/blob/main/README.zh-CN.md) · [日本語](https://github.com/Captcha-La/svelte/blob/main/README.ja.md) · [한국어](https://github.com/Captcha-La/svelte/blob/main/README.ko.md) · [Español](https://github.com/Captcha-La/svelte/blob/main/README.es.md) · [Português (BR)](https://github.com/Captcha-La/svelte/blob/main/README.pt-BR.md) · **Deutsch**

Offizielle Captchala-CAPTCHA-Komponente und -Action für Svelte - intelligenter CAPTCHA-Schutz für Ihre Svelte- und SvelteKit-Anwendungen.

[![npm version](https://img.shields.io/npm/v/@captcha-la/svelte.svg)](https://www.npmjs.com/package/@captcha-la/svelte)
[![npm downloads](https://img.shields.io/npm/dm/@captcha-la/svelte.svg)](https://www.npmjs.com/package/@captcha-la/svelte)
[![license](https://img.shields.io/npm/l/@captcha-la/svelte.svg)](https://github.com/Captcha-La/svelte/blob/main/LICENSE)

- Komponente `<Captchala>` und Action `use:captchala`
- Funktioniert mit Svelte 4 und Svelte 5 (Runes- oder Legacy-Modus); kein TypeScript-Präprozessor nötig
- SSR-sicher in SvelteKit: Auf dem Server wird nichts ausgeführt
- Lädt das CAPTCHA SDK zur Laufzeit vom CDN, sodass Sie immer den aktuellen Schutz erhalten

## Installation

```bash
npm install @captcha-la/svelte
# or
yarn add @captcha-la/svelte
# or
pnpm add @captcha-la/svelte
```

## Schnellstart

### Mit der Komponente

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

Callback-Props funktionieren in Svelte 4 und 5. In Svelte 4 können Sie zusätzlich mit
`on:success`, `on:error`, `on:close` und `on:ready` lauschen (die Nutzdaten stehen in `event.detail`).

<a id="action-approach"></a>
### Mit der Action

Die Action bindet das Widget in ein Element ein oder koppelt es im Bind-Modus an
das Element, auf dem sie verwendet wird, zum Beispiel Ihren eigenen Absenden-Button:

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

| Prop | Typ | Standard | Beschreibung |
|------|------|---------|-------------|
| `appKey` | `string` | *erforderlich* | Ihr Captchala-Anwendungsschlüssel |
| `serverToken` | `string` | - | Einmaliges, vom Server ausgestelltes Challenge-Token. Erforderlich, wenn die App `server_token_required=true` hat. Siehe [Produktion: serverToken-Modus](#production-using-servertoken) unten. |
| `product` | `'popup' \| 'float' \| 'embed' \| 'bind'` | `'popup'` | Anzeigemodus |
| `action` | `string` | `'default'` | Aktionskennung (z. B. 'login', 'register', 'checkout') |
| `lang` | `string` | Browsersprache | Sprachcode (`'zh-CN'`, `'en'`, `'ja'` usw.); nicht gesetzt = Browsersprache. Eine Änderung schaltet die Sprache direkt um |
| `theme` | `string \| object` | - | Preset-String oder `{ custom: { brightness: 'light' \| 'dark' \| 'system', ... } }`. Weglassen, um dem System zu folgen |
| `bindTo` | `string \| HTMLElement` | - | Element oder Selektor zum Binden (nur für `product="bind"`) |
| `onServerTokenExpired` | `() => Promise<string \| null> \| string \| null` | - | Wird aufgerufen, wenn `serverToken` abgelehnt wird. Geben Sie ein neues Token zurück, um einmal erneut zu versuchen, oder `null`, um den Fehler weiterzugeben |
| `onSuccess` | `(result) => void` | - | Erfolgs-Callback (auch das Event `success`) |
| `onExpired` | `() => void` | - | Das pass token ist abgelaufen, bevor es verwendet wurde (wird einmal ausgelöst, statt `onError`; das Widget zeigt den Ablauf an). Siehe [Ablauf des Tokens](#token-expiry) |
| `onError` | `(error) => void` | - | Fehler-Callback (auch das Event `error`) |
| `onClose` | `() => void` | - | Schließen-Callback (auch das Event `close`) |
| `onReady` | `() => void` | - | Bereit-Callback (auch das Event `ready`) |
| `class` | `string` | - | Klassenname des Containers |
| `style` | `string` | - | Inline-Styles des Containers |

Eine Änderung von `appKey`, `product`, `action`, `bindTo`, `serverToken` oder `theme` baut das Widget neu auf.

## Methoden (über `bind:this`)

```svelte
<script>
  import { Captchala } from '@captcha-la/svelte'

  let captcha
</script>

<Captchala bind:this={captcha} appKey="your-key" />
<button on:click={() => captcha.verify()}>Verify</button>
```

| Methode | Beschreibung |
|--------|-------------|
| `verify()` | Verifizierung auslösen |
| `reset()` | CAPTCHA-Zustand zurücksetzen |
| `destroy()` | CAPTCHA-Instanz zerstören |
| `bind(selector)` | An ein Element binden (für den 'bind'-Modus). Heißt `bind`, weil `bindTo` der Prop ist |
| `setLang(lang)` | Sprache direkt umschalten |
| `getInstance()` | Die zugrunde liegende SDK-Instanz |

## Action `use:captchala`

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

Ändern sich die Optionen, wird das Widget neu aufgebaut, wenn sich `appKey`, `product`, `action`,
`bindTo`, `serverToken` oder `theme` geändert hat (halten Sie ein `theme`-Objekt in einer Variablen,
statt es inline zu schreiben); eine Änderung von `lang` schaltet die Sprache direkt um;
Callbacks werden immer aktuell gelesen.

<a id="token-expiry"></a>
## Ablauf des Tokens

Das pass token aus `onSuccess` ist nur begrenzt gültig. Wartet der Nutzer zu lange
mit dem Absenden, zeigt das Widget an, dass die Verifizierung abgelaufen ist (die Leiste
bzw. Checkbox fordert zur erneuten Verifizierung auf; im `bind`-Modus wird nichts angezeigt,
da der Button Ihnen gehört), und `onExpired` wird einmal ausgelöst, statt `onError`. Was
sonst passiert, entscheiden Sie, zum Beispiel eine eigene Meldung anzeigen und `reset()` und dann `verify()`
aufrufen, um eine neue Verifizierung zu starten (dasselbe Muster wie `expired-callback` +
`reset()` + `execute()` bei anderen CAPTCHA-Widgets):

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

Die Ablaufbehandlung wird über den Prop `onExpired` aktiviert; das Event `expired` wird
ebenfalls ausgelöst, aber nur, wenn der Prop gesetzt ist. Ohne `onExpired` wird
wie bisher einmal `onError` ausgelöst (Klasse `expired`). `onExpired` wird nie für
Offline- oder Degraded-Tokens ausgelöst. Die Option `onExpired` der Action funktioniert genauso.

## Anzeigemodi

### Popup-Modus (Standard)
Zeigt einen Button, der einen CAPTCHA-Dialog als Popup öffnet.

```svelte
<Captchala appKey="your-key" product="popup" />
```

### Float-Modus
Zeigt ein schwebendes CAPTCHA-Widget inline an.

```svelte
<Captchala appKey="your-key" product="float" />
```

### Embed-Modus
Bettet das CAPTCHA direkt in die Seite ein.

```svelte
<Captchala appKey="your-key" product="embed" />
```

### Bind-Modus mit der Action
Ideal für Formularübermittlungen - verifiziert, wenn der Nutzer auf Ihren Button klickt. Siehe
[Mit der Action](#action-approach) oben.

## SvelteKit und SSR

Das Paket ist SSR-sicher. Beim Server-Rendering (und Prerendering) gibt die
Komponente einen leeren Container aus; das SDK wird nur im Browser geladen,
aus `onMount`. Actions laufen nie auf dem Server. Es sind weder `browser`-Prüfungen
noch `ssr = false` nötig.

Hinweise:
- Rufen Sie `loadCaptchalaSDK()` nicht auf oberster Modulebene in einer `+page.js`- /
  `+layout.js`-Load-Funktion auf, die auf dem Server läuft; außerhalb des Browsers wird die Promise abgelehnt.
- Holen Sie das `serverToken` im Browser von Ihrem eigenen `+server.js`-Endpunkt (siehe unten)
  oder geben Sie es aus einer serverseitigen `load`-Funktion zurück, damit das App-Secret auf
  dem Server bleibt.

<a id="production-using-servertoken"></a>
## Produktion: `serverToken` verwenden

Für die Produktion (Login, Registrierung, Zahlung usw.) empfehlen wir den
**Ablauf mit serverseitig ausgestelltem Token**. Ihr Backend hält das App-Secret, ruft
`POST /v1/server/challenge/issue` mit `X-App-Key` + `X-App-Secret` auf, um ein
einmaliges `server_token` (5 Minuten TTL) zu erzeugen, und übergibt dieses Token an den Browser.
Der Browser rendert das Widget dann mit `serverToken`:

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

Beispiel für einen Backend-Endpunkt (SvelteKit, `src/routes/api/captcha-token/+server.js`):

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

Hinweise:
- Betten Sie `X-App-Secret` niemals in Browser-Code ein. Lesen Sie es in SvelteKit aus `$env/dynamic/private` oder `$env/static/private`.
- Jedes `server_token` kann genau einmal verwendet werden. Erzeugen Sie vor jedem Mounten des Widgets ein neues.
- Ältere Apps mit `server_token_required=false` können weiterhin den öffentlichen Ablauf nur mit `appKey` nutzen.

## Serverseitige Validierung

Nachdem Sie das Token aus `onSuccess` erhalten haben, validieren Sie es auf Ihrem Server,
zum Beispiel in einer SvelteKit-Form-Action:

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

## TypeScript-Unterstützung

Typdefinitionen sind enthalten:

```ts
import {
  Captchala,
  captchala,
  type CaptchalaResult,
  type CaptchalaActionOptions,
  type CaptchalaInstance
} from '@captcha-la/svelte'
```

## Beispiel

Eine SvelteKit-App (vorgerendert, mit zwei Routen) liegt in [`example/`](./example).
Bauen Sie zuerst das Paket (`npm install && npm run build`), führen Sie dann
`npm install && npm run dev` in `example/` aus und öffnen Sie
`http://localhost:5173/?appKey=your-app-key`.

## Lizenz

MIT-Lizenz - Details siehe [LICENSE](./LICENSE).

## Links

- [Website](https://captcha.la)
- [Dokumentation](https://docs.captcha.la/sdk/web)
- [Dashboard](https://dash.captcha.la)
