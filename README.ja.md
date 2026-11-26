# @captcha-la/svelte

[English](https://github.com/Captcha-La/svelte/blob/main/README.md) · [简体中文](https://github.com/Captcha-La/svelte/blob/main/README.zh-CN.md) · **日本語** · [한국어](https://github.com/Captcha-La/svelte/blob/main/README.ko.md) · [Español](https://github.com/Captcha-La/svelte/blob/main/README.es.md) · [Português (BR)](https://github.com/Captcha-La/svelte/blob/main/README.pt-BR.md) · [Deutsch](https://github.com/Captcha-La/svelte/blob/main/README.de.md)

Captchala 公式の Svelte 用 CAPTCHA コンポーネントおよびアクションです。Svelte / SvelteKit アプリケーションをスマートな CAPTCHA で保護します。

[![npm version](https://img.shields.io/npm/v/@captcha-la/svelte.svg)](https://www.npmjs.com/package/@captcha-la/svelte)
[![npm downloads](https://img.shields.io/npm/dm/@captcha-la/svelte.svg)](https://www.npmjs.com/package/@captcha-la/svelte)
[![license](https://img.shields.io/npm/l/@captcha-la/svelte.svg)](https://github.com/Captcha-La/svelte/blob/main/LICENSE)

- `<Captchala>` コンポーネントと `use:captchala` アクション
- Svelte 4 と Svelte 5（runes モード / レガシーモード）に対応。TypeScript プリプロセッサは不要です
- SvelteKit で SSR セーフ：サーバー側では何も実行されません
- CAPTCHA SDK は実行時に CDN から読み込まれるため、常に最新の保護機能を利用できます

## インストール

```bash
npm install @captcha-la/svelte
# or
yarn add @captcha-la/svelte
# or
pnpm add @captcha-la/svelte
```

## クイックスタート

### コンポーネントを使う方法

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

コールバック props は Svelte 4 と 5 の両方で動作します。Svelte 4 では
`on:success`、`on:error`、`on:close`、`on:ready` でイベントを受け取ることもできます（ペイロードは `event.detail` に入ります）。

<a id="action-approach"></a>
### アクションを使う方法

アクションはウィジェットを要素の中にマウントします。bind モードでは、アクションを付けた要素
（たとえば独自の送信ボタン）にウィジェットをバインドします。

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

| Prop | 型 | デフォルト | 説明 |
|------|------|---------|-------------|
| `appKey` | `string` | *必須* | Captchala のアプリケーションキー |
| `serverToken` | `string` | - | サーバーが発行するワンタイムのチャレンジトークン。アプリで `server_token_required=true` の場合は必須です。後述の [本番環境：serverToken モード](#production-using-servertoken) を参照してください。 |
| `product` | `'popup' \| 'float' \| 'embed' \| 'bind'` | `'popup'` | 表示モード |
| `action` | `string` | `'default'` | アクション識別子（例：'login'、'register'、'checkout'） |
| `lang` | `string` | ブラウザの言語 | 言語コード（`'zh-CN'`、`'en'`、`'ja'` など）。未指定時はブラウザの言語を使用します。変更するとその場で言語が切り替わります |
| `theme` | `string \| object` | - | プリセット文字列、または `{ custom: { brightness: 'light' \| 'dark' \| 'system', ... } }`。省略するとシステム設定に従います |
| `bindTo` | `string \| HTMLElement` | - | バインド先の要素またはセレクター（`product="bind"` の場合のみ） |
| `onServerTokenExpired` | `() => Promise<string \| null> \| string \| null` | - | `serverToken` が拒否されたときに呼ばれます。新しいトークンを返すと 1 回だけ再試行し、`null` を返すとエラーとして通知します |
| `onSuccess` | `(result) => void` | - | 成功時のコールバック（`success` イベントでも受け取れます） |
| `onExpired` | `() => void` | - | pass token が使用前に期限切れになったとき（`onError` の代わりに 1 回だけ発火し、ウィジェットに期限切れが表示されます）。[トークンの有効期限](#token-expiry) を参照してください |
| `onError` | `(error) => void` | - | エラー時のコールバック（`error` イベントでも受け取れます） |
| `onClose` | `() => void` | - | クローズ時のコールバック（`close` イベントでも受け取れます） |
| `onReady` | `() => void` | - | 準備完了時のコールバック（`ready` イベントでも受け取れます） |
| `class` | `string` | - | コンテナのクラス名 |
| `style` | `string` | - | コンテナのインラインスタイル |

`appKey`、`product`、`action`、`bindTo`、`serverToken`、`theme` を変更すると、ウィジェットが再構築されます。

## メソッド（`bind:this` 経由）

```svelte
<script>
  import { Captchala } from '@captcha-la/svelte'

  let captcha
</script>

<Captchala bind:this={captcha} appKey="your-key" />
<button on:click={() => captcha.verify()}>Verify</button>
```

| メソッド | 説明 |
|--------|-------------|
| `verify()` | 検証を開始します |
| `reset()` | CAPTCHA の状態をリセットします |
| `destroy()` | CAPTCHA インスタンスを破棄します |
| `bind(selector)` | 要素にバインドします（'bind' モード用）。`bindTo` が prop 名のため、メソッド名は `bind` になっています |
| `setLang(lang)` | その場で言語を切り替えます |
| `getInstance()` | 内部の SDK インスタンスを返します |

## `use:captchala` アクション

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

オプションが変更されたとき、`appKey`、`product`、`action`、`bindTo`、`serverToken`、`theme` のいずれかが
変わっていればウィジェットを再構築します（`theme` オブジェクトはインラインで書かず、変数に保持してください）。
`lang` の変更ではその場で言語が切り替わります。コールバックは常に最新のものが参照されます。

<a id="token-expiry"></a>
## トークンの有効期限

`onSuccess` で受け取る pass token の有効期間には制限があります。ユーザーが送信までに時間をかけすぎると、
ウィジェットに検証の期限切れが表示され（バーまたはチェックボックスが再検証を求めます。`bind` モードでは
ボタンがアプリ側のものなので何も表示されません）、`onError` の代わりに `onExpired` が 1 回だけ発火します。
その後の処理はアプリ側で決められます。たとえば独自のメッセージを表示し、`reset()` に続けて `verify()` を呼び出して
新しい検証を開始できます（他の CAPTCHA ウィジェットでの `expired-callback` + `reset()` + `execute()` と同じパターンです）。

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

期限切れの処理は `onExpired` prop を指定すると有効になります。`expired` イベントも
発行されますが、prop が設定されている場合に限ります。`onExpired` がない場合は、従来どおり
`onError` が 1 回だけ発火します（class は `expired`）。オフライントークンや縮退トークンでは `onExpired` は発火しません。
アクションの `onExpired` オプションも同じように動作します。

## 表示モード

### Popup モード（デフォルト）
ボタンを表示し、クリックすると CAPTCHA のポップアップダイアログを開きます。

```svelte
<Captchala appKey="your-key" product="popup" />
```

### Float モード
インラインのフローティング CAPTCHA ウィジェットを表示します。

```svelte
<Captchala appKey="your-key" product="float" />
```

### Embed モード
CAPTCHA をページに直接埋め込みます。

```svelte
<Captchala appKey="your-key" product="embed" />
```

### アクションでの Bind モード
フォーム送信に最適です。ユーザーが独自のボタンをクリックしたときに検証します。上記の
[アクションを使う方法](#action-approach) を参照してください。

## SvelteKit と SSR

このパッケージは SSR セーフです。サーバーレンダリング（およびプリレンダリング）中、
コンポーネントは空のコンテナを出力するだけで、SDK はブラウザ上で `onMount` から読み込まれます。
アクションがサーバーで実行されることはありません。`browser` のチェックや
`ssr = false` は不要です。

注意事項：
- サーバーで実行される `+page.js` / `+layout.js` の load 関数で、モジュールのトップレベルから
  `loadCaptchalaSDK()` を呼び出さないでください。ブラウザ以外では reject されます。
- `serverToken` はブラウザから独自の `+server.js` エンドポイント（後述）経由で取得するか、
  サーバーの `load` 関数から返してください。こうすることでアプリシークレットをサーバー内に留められます。

<a id="production-using-servertoken"></a>
## 本番環境：`serverToken` の利用

本番環境（ログイン、登録、決済など）では、**サーバー発行トークンフロー** を推奨します。
バックエンドがアプリシークレットを保持し、`X-App-Key` + `X-App-Secret` を付けて
`POST /v1/server/challenge/issue` を呼び出し、ワンタイムの `server_token`（TTL 5 分）を発行して、
そのトークンをブラウザに渡します。ブラウザは `serverToken` を指定してウィジェットを描画します。

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

バックエンドエンドポイントの例（SvelteKit、`src/routes/api/captcha-token/+server.js`）：

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

注意事項：
- `X-App-Secret` をブラウザのコードに埋め込まないでください。SvelteKit では `$env/dynamic/private` または `$env/static/private` から読み込みます。
- 各 `server_token` は 1 回しか使用できません。ウィジェットをマウントするたびに再発行してください。
- `server_token_required=false` のレガシーアプリでは、引き続き公開 `appKey` のみのフローを利用できます。

## サーバーサイド検証

`onSuccess` でトークンを受け取ったら、サーバーで検証します。
SvelteKit のフォームアクションでの例：

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

## TypeScript サポート

型定義が同梱されています：

```ts
import {
  Captchala,
  captchala,
  type CaptchalaResult,
  type CaptchalaActionOptions,
  type CaptchalaInstance
} from '@captcha-la/svelte'
```

## サンプル

SvelteKit アプリ（プリレンダリング、2 ルート構成）が [`example/`](./example) にあります。
まずパッケージをビルドし（`npm install && npm run build`）、次に `example/` で
`npm install && npm run dev` を実行して
`http://localhost:5173/?appKey=your-app-key` を開いてください。

## ライセンス

MIT License - 詳細は [LICENSE](./LICENSE) を参照してください。

## リンク

- [公式サイト](https://captcha.la)
- [ドキュメント](https://docs.captcha.la/sdk/web)
- [ダッシュボード](https://dash.captcha.la)
