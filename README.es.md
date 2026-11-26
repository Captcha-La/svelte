# @captcha-la/svelte

[English](https://github.com/Captcha-La/svelte/blob/main/README.md) · [简体中文](https://github.com/Captcha-La/svelte/blob/main/README.zh-CN.md) · [日本語](https://github.com/Captcha-La/svelte/blob/main/README.ja.md) · [한국어](https://github.com/Captcha-La/svelte/blob/main/README.ko.md) · **Español** · [Português (BR)](https://github.com/Captcha-La/svelte/blob/main/README.pt-BR.md) · [Deutsch](https://github.com/Captcha-La/svelte/blob/main/README.de.md)

Componente y acción oficiales de Svelte para Captchala CAPTCHA: protección CAPTCHA inteligente para tus aplicaciones Svelte y SvelteKit.

[![npm version](https://img.shields.io/npm/v/@captcha-la/svelte.svg)](https://www.npmjs.com/package/@captcha-la/svelte)
[![npm downloads](https://img.shields.io/npm/dm/@captcha-la/svelte.svg)](https://www.npmjs.com/package/@captcha-la/svelte)
[![license](https://img.shields.io/npm/l/@captcha-la/svelte.svg)](https://github.com/Captcha-La/svelte/blob/main/LICENSE)

- Componente `<Captchala>` y acción `use:captchala`
- Funciona con Svelte 4 y Svelte 5 (modo runes o legacy); no necesita preprocesador de TypeScript
- Seguro para SSR en SvelteKit: no se ejecuta nada en el servidor
- Carga el SDK de CAPTCHA desde la CDN en tiempo de ejecución, así siempre tienes la protección más reciente

## Instalación

```bash
npm install @captcha-la/svelte
# or
yarn add @captcha-la/svelte
# or
pnpm add @captcha-la/svelte
```

## Inicio rápido

### Con el componente

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

Las props de callback funcionan en Svelte 4 y 5. En Svelte 4 también puedes escuchar
`on:success`, `on:error`, `on:close` y `on:ready` (los datos llegan en `event.detail`).

<a id="action-approach"></a>
### Con la acción

La acción monta el widget dentro de un elemento o, en modo bind, lo vincula al
elemento donde se usa, por ejemplo tu propio botón de envío:

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

| Prop | Tipo | Valor por defecto | Descripción |
|------|------|---------|-------------|
| `appKey` | `string` | *obligatorio* | La clave de tu aplicación Captchala |
| `serverToken` | `string` | - | Token de desafío de un solo uso emitido por el servidor. Obligatorio cuando la aplicación tiene `server_token_required=true`. Consulta [Producción: modo serverToken](#production-using-servertoken) más abajo. |
| `product` | `'popup' \| 'float' \| 'embed' \| 'bind'` | `'popup'` | Modo de visualización |
| `action` | `string` | `'default'` | Identificador de la acción (p. ej., 'login', 'register', 'checkout') |
| `lang` | `string` | idioma del navegador | Código de idioma (`'zh-CN'`, `'en'`, `'ja'`, etc.); sin definir = el idioma del navegador. Si lo cambias, el idioma se actualiza sin recargar el widget |
| `theme` | `string \| object` | - | Cadena de preset o `{ custom: { brightness: 'light' \| 'dark' \| 'system', ... } }`. Omítelo para seguir el tema del sistema |
| `bindTo` | `string \| HTMLElement` | - | Elemento o selector al que vincularse (solo con `product="bind"`) |
| `onServerTokenExpired` | `() => Promise<string \| null> \| string \| null` | - | Se llama cuando se rechaza el `serverToken`. Devuelve un token nuevo para reintentar una vez, o `null` para propagar el error |
| `onSuccess` | `(result) => void` | - | Callback de éxito (también el evento `success`) |
| `onExpired` | `() => void` | - | El pass token caducó antes de usarse (se dispara una vez, en lugar de `onError`; el widget muestra la caducidad). Consulta [Caducidad del token](#token-expiry) |
| `onError` | `(error) => void` | - | Callback de error (también el evento `error`) |
| `onClose` | `() => void` | - | Callback de cierre (también el evento `close`) |
| `onReady` | `() => void` | - | Callback de listo (también el evento `ready`) |
| `class` | `string` | - | Nombre de clase del contenedor |
| `style` | `string` | - | Estilos en línea del contenedor |

Cambiar `appKey`, `product`, `action`, `bindTo`, `serverToken` o `theme` reconstruye el widget.

## Métodos (mediante `bind:this`)

```svelte
<script>
  import { Captchala } from '@captcha-la/svelte'

  let captcha
</script>

<Captchala bind:this={captcha} appKey="your-key" />
<button on:click={() => captcha.verify()}>Verify</button>
```

| Método | Descripción |
|--------|-------------|
| `verify()` | Inicia la verificación |
| `reset()` | Restablece el estado del CAPTCHA |
| `destroy()` | Destruye la instancia del CAPTCHA |
| `bind(selector)` | Vincula a un elemento (para el modo 'bind'). Se llama `bind` porque `bindTo` es la prop |
| `setLang(lang)` | Cambia el idioma sin recargar el widget |
| `getInstance()` | La instancia subyacente del SDK |

## Acción `use:captchala`

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

Cuando cambian las opciones, el widget se reconstruye si cambió `appKey`, `product`, `action`,
`bindTo`, `serverToken` o `theme` (guarda el objeto `theme` en una variable
en lugar de escribirlo en línea); un cambio de `lang` actualiza el idioma sin recargar;
los callbacks siempre se leen en su versión más reciente.

<a id="token-expiry"></a>
## Caducidad del token

El pass token que recibes en `onSuccess` es válido durante un tiempo limitado. Si el usuario tarda
demasiado en enviar el formulario, el widget indica que la verificación caducó (la barra
o la casilla piden verificar de nuevo; en modo `bind` no se muestra nada, porque el
botón es tuyo) y `onExpired` se dispara una vez, en lugar de `onError`. Tú decides qué
más ocurre, por ejemplo mostrar tu propio mensaje y llamar a `reset()` y luego a `verify()`
para iniciar una nueva verificación (el mismo patrón que `expired-callback` +
`reset()` + `execute()` en otros widgets de CAPTCHA):

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

El manejo de la caducidad se activa con la prop `onExpired`; también se
emite el evento `expired`, pero solo cuando la prop está definida. Sin `onExpired`,
`onError` se dispara una vez (clase `expired`), como hasta ahora. `onExpired` nunca se dispara
para tokens offline o degradados. La opción `onExpired` de la acción funciona igual.

## Modos de visualización

### Modo popup (por defecto)
Muestra un botón que abre un diálogo emergente de CAPTCHA.

```svelte
<Captchala appKey="your-key" product="popup" />
```

### Modo float
Muestra un widget de CAPTCHA flotante en línea.

```svelte
<Captchala appKey="your-key" product="float" />
```

### Modo embed
Inserta el CAPTCHA directamente en la página.

```svelte
<Captchala appKey="your-key" product="embed" />
```

### Modo bind con la acción
Ideal para envíos de formularios: verifica cuando el usuario hace clic en tu botón. Consulta
el [enfoque con la acción](#action-approach) más arriba.

## SvelteKit y SSR

El paquete es seguro para SSR. Durante el renderizado en servidor (y el prerenderizado) el
componente genera un contenedor vacío; el SDK solo se carga en el navegador,
desde `onMount`. Las acciones nunca se ejecutan en el servidor. No hacen falta comprobaciones de `browser`
ni `ssr = false`.

Notas:
- No llames a `loadCaptchalaSDK()` en el nivel superior del módulo dentro de una función load de `+page.js` /
  `+layout.js` que se ejecute en el servidor; falla (rechaza la promesa) fuera del navegador.
- Obtén el `serverToken` desde tu propio endpoint `+server.js` (ver más abajo) en el
  navegador, o devuélvelo desde una función `load` de servidor, para que el secreto de la aplicación se quede en
  el servidor.

<a id="production-using-servertoken"></a>
## Producción: uso de `serverToken`

Para producción (inicio de sesión, registro, pagos, etc.) recomendamos el
**flujo con token emitido por el servidor**. Tu backend guarda el secreto de la aplicación, llama a
`POST /v1/server/challenge/issue` con `X-App-Key` + `X-App-Secret` para generar
un `server_token` de un solo uso (TTL de 5 minutos) y entrega ese token al navegador.
Después, el navegador renderiza el widget con `serverToken`:

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

Ejemplo de endpoint de backend (SvelteKit, `src/routes/api/captcha-token/+server.js`):

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

Notas:
- Nunca incluyas `X-App-Secret` en el código del navegador. En SvelteKit, léelo desde `$env/dynamic/private` o `$env/static/private`.
- Cada `server_token` se puede usar exactamente una vez. Genera uno nuevo antes de cada montaje del widget.
- Las aplicaciones antiguas con `server_token_required=false` pueden seguir usando el flujo público solo con `appKey`.

## Validación en el servidor

Después de recibir el token en `onSuccess`, valídalo en tu servidor, por
ejemplo en una form action de SvelteKit:

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

## Soporte de TypeScript

Las definiciones de tipos están incluidas:

```ts
import {
  Captchala,
  captchala,
  type CaptchalaResult,
  type CaptchalaActionOptions,
  type CaptchalaInstance
} from '@captcha-la/svelte'
```

## Ejemplo

En [`example/`](./example) hay una aplicación SvelteKit (prerenderizada, con dos rutas).
Primero compila el paquete (`npm install && npm run build`), luego ejecuta
`npm install && npm run dev` en `example/` y abre
`http://localhost:5173/?appKey=your-app-key`.

## Licencia

Licencia MIT: consulta [LICENSE](./LICENSE) para más detalles.

## Enlaces

- [Sitio web](https://captcha.la)
- [Documentación](https://docs.captcha.la/sdk/web)
- [Panel de control](https://dash.captcha.la)
