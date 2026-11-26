# @captcha-la/svelte

[English](https://github.com/Captcha-La/svelte/blob/main/README.md) · [简体中文](https://github.com/Captcha-La/svelte/blob/main/README.zh-CN.md) · [日本語](https://github.com/Captcha-La/svelte/blob/main/README.ja.md) · [한국어](https://github.com/Captcha-La/svelte/blob/main/README.ko.md) · [Español](https://github.com/Captcha-La/svelte/blob/main/README.es.md) · **Português (BR)** · [Deutsch](https://github.com/Captcha-La/svelte/blob/main/README.de.md)

Componente e action Svelte oficiais do CAPTCHA Captchala - proteção CAPTCHA inteligente para suas aplicações Svelte e SvelteKit.

[![npm version](https://img.shields.io/npm/v/@captcha-la/svelte.svg)](https://www.npmjs.com/package/@captcha-la/svelte)
[![npm downloads](https://img.shields.io/npm/dm/@captcha-la/svelte.svg)](https://www.npmjs.com/package/@captcha-la/svelte)
[![license](https://img.shields.io/npm/l/@captcha-la/svelte.svg)](https://github.com/Captcha-La/svelte/blob/main/LICENSE)

- Componente `<Captchala>` e action `use:captchala`
- Funciona com Svelte 4 e Svelte 5 (modo runes ou legacy); não precisa de pré-processador TypeScript
- Seguro para SSR no SvelteKit: nada é executado no servidor
- Carrega o SDK do CAPTCHA a partir da CDN em tempo de execução, então você sempre tem a proteção mais recente

## Instalação

```bash
npm install @captcha-la/svelte
# or
yarn add @captcha-la/svelte
# or
pnpm add @captcha-la/svelte
```

## Início rápido

### Usando o componente

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

As props de callback funcionam no Svelte 4 e 5. No Svelte 4 você também pode escutar com
`on:success`, `on:error`, `on:close` e `on:ready` (o payload fica em `event.detail`).

<a id="action-approach"></a>
### Usando a action

A action monta o widget dentro de um elemento ou, no modo bind, vincula o widget ao
elemento em que é usada, por exemplo o seu próprio botão de envio:

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

| Prop | Tipo | Padrão | Descrição |
|------|------|---------|-------------|
| `appKey` | `string` | *obrigatório* | Sua chave de aplicação Captchala |
| `serverToken` | `string` | - | Token de desafio de uso único, emitido pelo servidor. Obrigatório quando o app tem `server_token_required=true`. Veja [Produção: modo serverToken](#production-using-servertoken) abaixo. |
| `product` | `'popup' \| 'float' \| 'embed' \| 'bind'` | `'popup'` | Modo de exibição |
| `action` | `string` | `'default'` | Identificador da ação (ex.: 'login', 'register', 'checkout') |
| `lang` | `string` | idioma do navegador | Código de idioma (`'zh-CN'`, `'en'`, `'ja'` etc.); sem valor = idioma do navegador. Alterá-lo troca o idioma sem recriar o widget |
| `theme` | `string \| object` | - | String de preset ou `{ custom: { brightness: 'light' \| 'dark' \| 'system', ... } }`. Omita para seguir o sistema |
| `bindTo` | `string \| HTMLElement` | - | Elemento ou seletor ao qual vincular (somente para `product="bind"`) |
| `onServerTokenExpired` | `() => Promise<string \| null> \| string \| null` | - | Chamado quando o `serverToken` é rejeitado. Retorne um novo token para tentar mais uma vez, ou `null` para repassar o erro |
| `onSuccess` | `(result) => void` | - | Callback de sucesso (também o evento `success`) |
| `onExpired` | `() => void` | - | O pass token expirou antes de ser usado (dispara uma vez, no lugar de `onError`; o widget mostra a expiração). Veja [Expiração do token](#token-expiry) |
| `onError` | `(error) => void` | - | Callback de erro (também o evento `error`) |
| `onClose` | `() => void` | - | Callback de fechamento (também o evento `close`) |
| `onReady` | `() => void` | - | Callback de pronto (também o evento `ready`) |
| `class` | `string` | - | Nome de classe do contêiner |
| `style` | `string` | - | Estilos inline do contêiner |

Alterar `appKey`, `product`, `action`, `bindTo`, `serverToken` ou `theme` recria o widget.

## Métodos (via `bind:this`)

```svelte
<script>
  import { Captchala } from '@captcha-la/svelte'

  let captcha
</script>

<Captchala bind:this={captcha} appKey="your-key" />
<button on:click={() => captcha.verify()}>Verify</button>
```

| Método | Descrição |
|--------|-------------|
| `verify()` | Dispara a verificação |
| `reset()` | Redefine o estado do CAPTCHA |
| `destroy()` | Destrói a instância do CAPTCHA |
| `bind(selector)` | Vincula a um elemento (para o modo 'bind'). Chama-se `bind` porque `bindTo` é a prop |
| `setLang(lang)` | Troca o idioma sem recriar o widget |
| `getInstance()` | A instância do SDK subjacente |

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

Quando as opções mudam, o widget é recriado se `appKey`, `product`, `action`,
`bindTo`, `serverToken` ou `theme` mudaram (mantenha o objeto `theme` em uma variável
em vez de escrevê-lo inline); uma mudança em `lang` troca o idioma sem recriar o widget;
os callbacks são sempre lidos na versão mais atual.

<a id="token-expiry"></a>
## Expiração do token

O pass token recebido em `onSuccess` é válido por tempo limitado. Se o usuário demorar demais
para enviar, o widget mostra que a verificação expirou (a barra
ou a caixa de seleção pede para verificar novamente; no modo `bind` nada é exibido, já que o
botão é seu) e `onExpired` dispara uma vez, no lugar de `onError`. Você decide o que
mais acontece, por exemplo mostrar sua própria mensagem e chamar `reset()` e depois `verify()`
para iniciar uma nova verificação (o mesmo padrão de `expired-callback` +
`reset()` + `execute()` em outros widgets de CAPTCHA):

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

O tratamento de expiração é ativado pela prop `onExpired`; o evento `expired` também é
disparado, mas somente quando a prop está definida. Sem `onExpired`,
`onError` dispara uma vez (classe `expired`), como antes. `onExpired` nunca dispara para
tokens offline ou degradados. A opção `onExpired` da action funciona da mesma forma.

## Modos de exibição

### Modo popup (padrão)
Mostra um botão que abre um diálogo popup de CAPTCHA.

```svelte
<Captchala appKey="your-key" product="popup" />
```

### Modo float
Exibe um widget de CAPTCHA flutuante inline.

```svelte
<Captchala appKey="your-key" product="float" />
```

### Modo embed
Incorpora o CAPTCHA diretamente na página.

```svelte
<Captchala appKey="your-key" product="embed" />
```

### Modo bind com a action
Ideal para envio de formulários - verifica quando o usuário clica no seu botão. Veja
[usando a action](#action-approach) acima.

## SvelteKit e SSR

O pacote é seguro para SSR. Durante a renderização no servidor (e a pré-renderização), o
componente gera um contêiner vazio; o SDK é carregado somente no navegador,
a partir de `onMount`. Actions nunca são executadas no servidor. Não são necessárias verificações de `browser` nem
`ssr = false`.

Observações:
- Não chame `loadCaptchalaSDK()` no nível superior do módulo em uma função load de `+page.js` /
  `+layout.js` que roda no servidor; ela é rejeitada fora do navegador.
- Busque o `serverToken` no navegador a partir do seu próprio endpoint `+server.js` (veja abaixo),
  ou retorne-o de uma função `load` do servidor, para que o app secret permaneça no
  servidor.

<a id="production-using-servertoken"></a>
## Produção: usando `serverToken`

Para produção (login, cadastro, pagamento etc.) recomendamos o
**fluxo de token emitido pelo servidor**. Seu backend guarda o app secret, chama
`POST /v1/server/challenge/issue` com `X-App-Key` + `X-App-Secret` para gerar um
`server_token` de uso único (TTL de 5 minutos) e entrega esse token ao navegador.
O navegador então renderiza o widget com `serverToken`:

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

Exemplo de endpoint de backend (SvelteKit, `src/routes/api/captcha-token/+server.js`):

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

Observações:
- Nunca coloque o `X-App-Secret` no código do navegador. No SvelteKit, leia-o de `$env/dynamic/private` ou `$env/static/private`.
- Cada `server_token` só pode ser usado uma única vez. Gere um novo antes de cada montagem do widget.
- Apps legados com `server_token_required=false` ainda podem usar o fluxo público apenas com `appKey`.

## Validação no servidor

Depois de receber o token em `onSuccess`, valide-o no seu servidor,
por exemplo em uma form action do SvelteKit:

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

## Suporte a TypeScript

As definições de tipo estão incluídas:

```ts
import {
  Captchala,
  captchala,
  type CaptchalaResult,
  type CaptchalaActionOptions,
  type CaptchalaInstance
} from '@captcha-la/svelte'
```

## Exemplo

Um app SvelteKit (pré-renderizado, com duas rotas) fica em [`example/`](./example).
Primeiro compile o pacote (`npm install && npm run build`), depois execute
`npm install && npm run dev` em `example/` e abra
`http://localhost:5173/?appKey=your-app-key`.

## Licença

Licença MIT - veja [LICENSE](./LICENSE) para mais detalhes.

## Links

- [Site](https://captcha.la)
- [Documentação](https://docs.captcha.la/sdk/web)
- [Painel](https://dash.captcha.la)
