# @captcha-la/svelte

[English](https://github.com/Captcha-La/svelte/blob/main/README.md) · **简体中文** · [日本語](https://github.com/Captcha-La/svelte/blob/main/README.ja.md) · [한국어](https://github.com/Captcha-La/svelte/blob/main/README.ko.md) · [Español](https://github.com/Captcha-La/svelte/blob/main/README.es.md) · [Português (BR)](https://github.com/Captcha-La/svelte/blob/main/README.pt-BR.md) · [Deutsch](https://github.com/Captcha-La/svelte/blob/main/README.de.md)

Captchala 验证码 Svelte 官方组件与 action —— 为你的 Svelte / SvelteKit 应用提供智能 CAPTCHA 防护。

[![npm version](https://img.shields.io/npm/v/@captcha-la/svelte.svg)](https://www.npmjs.com/package/@captcha-la/svelte)
[![npm downloads](https://img.shields.io/npm/dm/@captcha-la/svelte.svg)](https://www.npmjs.com/package/@captcha-la/svelte)
[![license](https://img.shields.io/npm/l/@captcha-la/svelte.svg)](https://github.com/Captcha-La/svelte/blob/main/LICENSE)

- `<Captchala>` 组件与 `use:captchala` action
- 同时支持 Svelte 4 与 Svelte 5（runes 或 legacy 模式），无需 TypeScript 预处理器
- SvelteKit SSR 安全：服务端不执行任何代码
- 运行时从 CDN 加载验证码 SDK，始终获得最新防护

## 安装

```bash
npm install @captcha-la/svelte
# or
yarn add @captcha-la/svelte
# or
pnpm add @captcha-la/svelte
```

## 快速上手

### 组件方式

```svelte
<script>
  import { Captchala } from '@captcha-la/svelte'

  function handleSuccess(result) {
    console.log('验证成功')
    console.log('Token:', result.token)
    // 把 token 提交到你自己的后端校验
  }
</script>

<Captchala
  appKey="your-app-key"
  product="popup"
  onSuccess={handleSuccess}
  onError={(err) => console.error(err)}
/>
```

回调 props 在 Svelte 4 和 5 中都可用。Svelte 4 也可以用 `on:success`、`on:error`、
`on:close`、`on:ready` 监听（参数在 `event.detail` 中）。

### Action 方式

action 会把组件挂载到元素中；bind 模式下则绑定到使用它的元素上，例如你自己的提交按钮：

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
        // 继续提交表单
      }
    }}
  >
    登录
  </button>
</form>
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `appKey` | `string` | *必填* | 你的 Captchala 应用 Key |
| `serverToken` | `string` | - | 由服务端签发的一次性挑战 token。应用开启 `server_token_required=true` 时必填。见下方 [生产环境：使用 serverToken](#生产环境使用-servertoken) |
| `product` | `'popup' \| 'float' \| 'embed' \| 'bind'` | `'popup'` | 显示模式 |
| `action` | `string` | `'default'` | 业务场景标识（如 'login'、'register'、'checkout'） |
| `lang` | `string` | 浏览器语言 | 语言代码（`'zh-CN'`、`'en'`、`'ja'` 等）；不设置则跟随浏览器语言。修改后原地切换语言 |
| `theme` | `string \| object` | - | 预设名或 `{ custom: { brightness: 'light' \| 'dark' \| 'system', ... } }`；不设置则跟随系统 |
| `bindTo` | `string \| HTMLElement` | - | 绑定的元素或选择器（仅 `product="bind"`） |
| `onServerTokenExpired` | `() => Promise<string \| null> \| string \| null` | - | `serverToken` 被拒绝时调用。返回新 token 会重试一次，返回 `null` 则抛出错误 |
| `onSuccess` | `(result) => void` | - | 成功回调（同时派发 `success` 事件） |
| `onExpired` | `() => void` | - | pass token 在使用前已过期（只触发一次，代替 `onError`；组件会显示已过期）。见 [Token 过期](#token-过期) |
| `onError` | `(error) => void` | - | 错误回调（同时派发 `error` 事件） |
| `onClose` | `() => void` | - | 关闭回调（同时派发 `close` 事件） |
| `onReady` | `() => void` | - | 就绪回调（同时派发 `ready` 事件） |
| `class` | `string` | - | 容器 class |
| `style` | `string` | - | 容器内联样式 |

修改 `appKey`、`product`、`action`、`bindTo`、`serverToken` 或 `theme` 会重建组件实例。

## 调用方法（`bind:this`）

```svelte
<script>
  import { Captchala } from '@captcha-la/svelte'

  let captcha
</script>

<Captchala bind:this={captcha} appKey="your-key" />
<button on:click={() => captcha.verify()}>验证</button>
```

| 方法 | 说明 |
|------|------|
| `verify()` | 触发验证 |
| `reset()` | 重置验证码状态 |
| `destroy()` | 销毁验证码实例 |
| `bind(selector)` | 绑定到元素（'bind' 模式）。因 `bindTo` 已是 prop，方法名为 `bind` |
| `setLang(lang)` | 原地切换语言 |
| `getInstance()` | 底层 SDK 实例 |

## `use:captchala` Action

```ts
use:captchala={{
  appKey,           // string - 必填
  product,          // 'popup' | 'float' | 'embed' | 'bind'
  action, lang, theme, serverToken, onServerTokenExpired,
  bindTo,           // bind 模式：默认为 action 所在元素
  onSuccess, onError, onClose, onReady, onExpired,
  onInit            // (instance) => void - SDK 实例，可调用 verify() / reset()
}}
```

参数变化时：`appKey`、`product`、`action`、`bindTo`、`serverToken` 或 `theme` 变化会重建
实例（`theme` 对象请放在变量中，不要内联书写）；`lang` 变化原地切换语言；回调总是读取最新值。

## Token 过期

`onSuccess` 给出的 pass token 有效期有限。如果用户等待太久才提交，组件会显示验证已过期
（滑条或复选框提示重新验证；`bind` 模式下按钮是你自己的，所以不显示），并触发一次
`onExpired`，代替 `onError`。其余行为由你决定，例如显示自己的提示，再调用 `reset()` 和
`verify()` 发起新的验证（与其他验证码组件中 `expired-callback` + `reset()` +
`execute()` 的用法相同）：

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
  <p>验证已过期。<button on:click={verifyAgain}>重新验证</button></p>
{/if}
```

过期处理由 `onExpired` prop 开启；设置了该 prop 时也会派发 `expired` 事件。没有
`onExpired` 时，与之前一样触发一次 `onError`（class 为 `expired`）。离线或降级 token
不会触发 `onExpired`。action 的 `onExpired` 选项用法相同。

## 显示模式

### Popup 模式（默认）
显示一个按钮，点击后弹出验证码对话框。

```svelte
<Captchala appKey="your-key" product="popup" />
```

### Float 模式
在页面内显示浮动的验证码组件。

```svelte
<Captchala appKey="your-key" product="float" />
```

### Embed 模式
将验证码直接嵌入页面。

```svelte
<Captchala appKey="your-key" product="embed" />
```

### Bind 模式（配合 action）
最适合表单提交场景——用户点击你的按钮时再验证。见上方 [Action 方式](#action-方式)。

## SvelteKit 与 SSR

本包 SSR 安全。服务端渲染（以及预渲染）时组件只输出一个空容器；SDK 只在浏览器中、
在 `onMount` 里加载。action 从不在服务端运行。无需 `browser` 判断，也无需 `ssr = false`。

注意：
- 不要在会于服务端运行的 `+page.js` / `+layout.js` load 函数顶层调用 `loadCaptchalaSDK()`，
  它在浏览器外会 reject。
- `serverToken` 请在浏览器中从你自己的 `+server.js` 接口获取（见下文），或由服务端
  `load` 函数返回，确保 app secret 只留在服务端。

## 生产环境：使用 `serverToken`

生产环境（登录、注册、支付等）推荐使用 **服务端签发 token 流程**。你的后端持有 app
secret，带上 `X-App-Key` + `X-App-Secret` 调用 `POST /v1/server/challenge/issue`
生成一次性 `server_token`（有效期 5 分钟），再交给浏览器。浏览器用 `serverToken`
渲染组件：

```svelte
<script>
  import { onMount } from 'svelte'
  import { Captchala } from '@captcha-la/svelte'

  let serverToken

  onMount(async () => {
    // 你自己的后端接口，内部代理 /v1/server/challenge/issue
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
  <div>加载中...</div>
{/if}
```

后端接口示例（SvelteKit，`src/routes/api/captcha-token/+server.js`）：

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

注意：
- 永远不要把 `X-App-Secret` 写进浏览器代码。SvelteKit 中请从 `$env/dynamic/private` 或 `$env/static/private` 读取。
- 每个 `server_token` 只能使用一次，每次挂载组件前重新获取。
- `server_token_required=false` 的旧应用仍可只用公开 `appKey` 接入。

## 服务端校验

从 `onSuccess` 拿到 token 后，在你的服务端校验，例如在 SvelteKit form action 中：

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
      // pass_token = onSuccess 返回的 result.token；client_ip 可选但推荐传
      body: JSON.stringify({ pass_token: form.get('captcha_token'), client_ip: getClientAddress() })
    })

    const result = await response.json()
    if (!(result.code === 0 && result.data.valid === true)) {
      return fail(400, { captcha: 'invalid' })
    }
    // token 有效，继续处理请求
  }
}
```

## TypeScript 支持

内置类型定义：

```ts
import {
  Captchala,
  captchala,
  type CaptchalaResult,
  type CaptchalaActionOptions,
  type CaptchalaInstance
} from '@captcha-la/svelte'
```

## 示例

[`example/`](./example) 目录是一个 SvelteKit 应用（预渲染，两个路由）。先构建本包
（`npm install && npm run build`），再在 `example/` 中运行 `npm install && npm run dev`，
打开 `http://localhost:5173/?appKey=your-app-key`。

## 开源协议

MIT License - 详见 [LICENSE](./LICENSE)。

## 链接

- [官网](https://captcha.la)
- [文档](https://docs.captcha.la/sdk/web)
- [控制台](https://dash.captcha.la)
