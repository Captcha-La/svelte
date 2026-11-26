# @captcha-la/svelte

[English](https://github.com/Captcha-La/svelte/blob/main/README.md) · [简体中文](https://github.com/Captcha-La/svelte/blob/main/README.zh-CN.md) · [日本語](https://github.com/Captcha-La/svelte/blob/main/README.ja.md) · **한국어** · [Español](https://github.com/Captcha-La/svelte/blob/main/README.es.md) · [Português (BR)](https://github.com/Captcha-La/svelte/blob/main/README.pt-BR.md) · [Deutsch](https://github.com/Captcha-La/svelte/blob/main/README.de.md)

Captchala CAPTCHA 공식 Svelte 컴포넌트 및 액션입니다. Svelte와 SvelteKit 애플리케이션을 스마트 CAPTCHA로 보호합니다.

[![npm version](https://img.shields.io/npm/v/@captcha-la/svelte.svg)](https://www.npmjs.com/package/@captcha-la/svelte)
[![npm downloads](https://img.shields.io/npm/dm/@captcha-la/svelte.svg)](https://www.npmjs.com/package/@captcha-la/svelte)
[![license](https://img.shields.io/npm/l/@captcha-la/svelte.svg)](https://github.com/Captcha-La/svelte/blob/main/LICENSE)

- `<Captchala>` 컴포넌트와 `use:captchala` 액션 제공
- Svelte 4와 Svelte 5(runes 모드 또는 legacy 모드) 모두 지원하며, TypeScript 전처리기가 필요 없습니다
- SvelteKit에서 SSR 안전: 서버에서는 아무것도 실행되지 않습니다
- 런타임에 CDN에서 CAPTCHA SDK를 불러오므로 항상 최신 보호 기능을 사용할 수 있습니다

## 설치

```bash
npm install @captcha-la/svelte
# or
yarn add @captcha-la/svelte
# or
pnpm add @captcha-la/svelte
```

## 빠른 시작

### 컴포넌트 방식

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

콜백 prop은 Svelte 4와 5에서 모두 동작합니다. Svelte 4에서는
`on:success`, `on:error`, `on:close`, `on:ready`로도 수신할 수 있습니다(페이로드는 `event.detail`에 담깁니다).

<a id="action-approach"></a>
### 액션 방식

액션은 위젯을 요소 안에 마운트하거나, bind 모드에서는 액션이 적용된
요소(예: 직접 만든 제출 버튼)에 위젯을 바인딩합니다.

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

| Prop | 타입 | 기본값 | 설명 |
|------|------|---------|-------------|
| `appKey` | `string` | *필수* | Captchala 애플리케이션 키 |
| `serverToken` | `string` | - | 서버가 발급하는 일회용 챌린지 토큰. 앱에 `server_token_required=true`가 설정된 경우 필수입니다. 아래 [프로덕션: serverToken 모드](#production-using-servertoken)를 참고하세요. |
| `product` | `'popup' \| 'float' \| 'embed' \| 'bind'` | `'popup'` | 표시 모드 |
| `action` | `string` | `'default'` | 액션 식별자(예: 'login', 'register', 'checkout') |
| `lang` | `string` | 브라우저 언어 | 언어 코드(`'zh-CN'`, `'en'`, `'ja'` 등). 지정하지 않으면 브라우저 언어를 사용합니다. 값을 바꾸면 위젯을 다시 만들지 않고 언어만 전환됩니다 |
| `theme` | `string \| object` | - | 프리셋 문자열 또는 `{ custom: { brightness: 'light' \| 'dark' \| 'system', ... } }`. 생략하면 시스템 설정을 따릅니다 |
| `bindTo` | `string \| HTMLElement` | - | 바인딩할 요소 또는 선택자(`product="bind"`일 때만) |
| `onServerTokenExpired` | `() => Promise<string \| null> \| string \| null` | - | `serverToken`이 거부되었을 때 호출됩니다. 새 토큰을 반환하면 한 번 재시도하고, `null`을 반환하면 오류를 그대로 전달합니다 |
| `onSuccess` | `(result) => void` | - | 성공 콜백(`success` 이벤트로도 전달) |
| `onExpired` | `() => void` | - | pass token이 사용되기 전에 만료됨(`onError` 대신 한 번 호출되며, 위젯에 만료 상태가 표시됩니다). [토큰 만료](#token-expiry) 참고 |
| `onError` | `(error) => void` | - | 오류 콜백(`error` 이벤트로도 전달) |
| `onClose` | `() => void` | - | 닫힘 콜백(`close` 이벤트로도 전달) |
| `onReady` | `() => void` | - | 준비 완료 콜백(`ready` 이벤트로도 전달) |
| `class` | `string` | - | 컨테이너 클래스 이름 |
| `style` | `string` | - | 컨테이너 인라인 스타일 |

`appKey`, `product`, `action`, `bindTo`, `serverToken`, `theme`를 변경하면 위젯이 다시 생성됩니다.

## 메서드(`bind:this` 사용)

```svelte
<script>
  import { Captchala } from '@captcha-la/svelte'

  let captcha
</script>

<Captchala bind:this={captcha} appKey="your-key" />
<button on:click={() => captcha.verify()}>Verify</button>
```

| 메서드 | 설명 |
|--------|-------------|
| `verify()` | 인증 시작 |
| `reset()` | CAPTCHA 상태 초기화 |
| `destroy()` | CAPTCHA 인스턴스 제거 |
| `bind(selector)` | 요소에 바인딩('bind' 모드용). `bindTo`는 prop 이름이므로 메서드 이름은 `bind`입니다 |
| `setLang(lang)` | 위젯을 다시 만들지 않고 언어 전환 |
| `getInstance()` | 내부 SDK 인스턴스 반환 |

## `use:captchala` 액션

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

옵션이 바뀌면 `appKey`, `product`, `action`, `bindTo`, `serverToken`, `theme` 중
하나라도 변경된 경우 위젯이 다시 생성됩니다(`theme` 객체는 인라인으로 쓰지 말고
변수에 담아 두세요). `lang`만 바뀌면 위젯을 다시 만들지 않고 언어만 전환되며,
콜백은 항상 최신 값을 읽습니다.

<a id="token-expiry"></a>
## 토큰 만료

`onSuccess`로 받은 pass token은 유효 시간이 정해져 있습니다. 사용자가 제출하기까지
너무 오래 기다리면 위젯에 인증이 만료되었다고 표시되고(바 또는 체크박스가 다시
인증하라고 안내합니다. `bind` 모드에서는 버튼이 직접 만든 것이므로 아무것도 표시되지
않습니다) `onError` 대신 `onExpired`가 한 번 호출됩니다. 그 밖의 처리는 직접
결정합니다. 예를 들어 자체 메시지를 보여 주고 `reset()`에 이어 `verify()`를 호출해
새 인증을 시작할 수 있습니다(다른 CAPTCHA 위젯의 `expired-callback` +
`reset()` + `execute()`와 같은 패턴입니다).

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

만료 처리는 `onExpired` prop을 지정해야 활성화됩니다. `expired` 이벤트도
발생하지만 prop이 지정된 경우에만 발생합니다. `onExpired`가 없으면 기존과 같이
`onError`가 한 번 호출됩니다(클래스 `expired`). 오프라인 토큰이나 degraded 토큰에서는
`onExpired`가 호출되지 않습니다. 액션의 `onExpired` 옵션도 같은 방식으로 동작합니다.

## 표시 모드

### 팝업 모드(기본값)
버튼을 표시하고, 버튼을 누르면 CAPTCHA 팝업 대화상자가 열립니다.

```svelte
<Captchala appKey="your-key" product="popup" />
```

### 플로팅 모드
인라인 플로팅 CAPTCHA 위젯을 표시합니다.

```svelte
<Captchala appKey="your-key" product="float" />
```

### 임베드 모드
CAPTCHA를 페이지에 직접 삽입합니다.

```svelte
<Captchala appKey="your-key" product="embed" />
```

### 액션을 사용한 바인드 모드
폼 제출에 가장 적합합니다. 사용자가 직접 만든 버튼을 클릭할 때 인증합니다. 위의
[액션 방식](#action-approach)을 참고하세요.

## SvelteKit과 SSR

이 패키지는 SSR에 안전합니다. 서버 렌더링(및 사전 렌더링) 중에는 컴포넌트가 빈
컨테이너만 출력하며, SDK는 브라우저에서 `onMount` 시점에만 로드됩니다. 액션은
서버에서 실행되지 않습니다. `browser` 검사나 `ssr = false`는 필요 없습니다.

참고:
- 서버에서 실행되는 `+page.js` / `+layout.js` load 함수의 모듈 최상위에서
  `loadCaptchalaSDK()`를 호출하지 마세요. 브라우저 밖에서는 reject됩니다.
- 앱 시크릿이 서버에만 머물도록, `serverToken`은 브라우저에서 직접 만든 `+server.js`
  엔드포인트(아래 참고)로 가져오거나 서버 `load` 함수에서 반환하세요.

<a id="production-using-servertoken"></a>
## 프로덕션: `serverToken` 사용

프로덕션(로그인, 회원가입, 결제 등)에서는 **서버 발급 토큰 플로우**를 권장합니다.
백엔드가 앱 시크릿을 보관하고, `X-App-Key` + `X-App-Secret`으로
`POST /v1/server/challenge/issue`를 호출해 일회용 `server_token`(TTL 5분)을 발급받은 뒤
그 토큰을 브라우저에 전달합니다. 브라우저는 `serverToken`으로 위젯을 렌더링합니다.

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

백엔드 엔드포인트 예시(SvelteKit, `src/routes/api/captcha-token/+server.js`):

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

참고:
- `X-App-Secret`을 브라우저 코드에 절대 넣지 마세요. SvelteKit에서는 `$env/dynamic/private` 또는 `$env/static/private`에서 읽으세요.
- 각 `server_token`은 정확히 한 번만 사용할 수 있습니다. 위젯을 마운트할 때마다 새로 발급하세요.
- `server_token_required=false`인 기존 앱은 공개 `appKey`만 사용하는 플로우를 계속 쓸 수 있습니다.

## 서버 측 검증

`onSuccess`에서 토큰을 받으면 서버에서 검증하세요. 예를 들어 SvelteKit 폼
액션에서는 다음과 같이 합니다.

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

## TypeScript 지원

타입 정의가 포함되어 있습니다.

```ts
import {
  Captchala,
  captchala,
  type CaptchalaResult,
  type CaptchalaActionOptions,
  type CaptchalaInstance
} from '@captcha-la/svelte'
```

## 예제

SvelteKit 앱(사전 렌더링, 라우트 2개)이 [`example/`](./example)에 있습니다.
먼저 패키지를 빌드한 뒤(`npm install && npm run build`), `example/`에서
`npm install && npm run dev`를 실행하고
`http://localhost:5173/?appKey=your-app-key`를 여세요.

## 라이선스

MIT License - 자세한 내용은 [LICENSE](./LICENSE)를 참고하세요.

## 링크

- [웹사이트](https://captcha.la)
- [문서](https://docs.captcha.la/sdk/web)
- [대시보드](https://dash.captcha.la)
