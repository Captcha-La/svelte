<script>
  import { browser } from '$app/environment'
  import { Captchala, captchala } from '@captcha-la/svelte'

  // Pass ?appKey=...&serverToken=... in the URL, or edit the default below.
  // During prerendering there is no URL query, so the default is used on the server.
  const params = browser ? new URLSearchParams(location.search) : new URLSearchParams()
  const appKey = params.get('appKey') || 'YOUR_APP_KEY'
  const serverToken = params.get('serverToken') || undefined

  let lang = $state('en')
  let token = $state('')
  let events = $state([])
  let widget = $state()

  const log = (name, detail) =>
    (events = [...events, detail === undefined ? name : `${name}: ${typeof detail === 'string' ? detail : JSON.stringify(detail)}`])
</script>

<section class="box">
  <h2>Component (float mode)</h2>
  <div id="widget">
    <Captchala
      bind:this={widget}
      {appKey}
      {serverToken}
      {lang}
      product="float"
      action="login"
      onReady={() => log('ready')}
      onSuccess={(r) => { token = r.token; log('success') }}
      onExpired={() => { token = ''; log('expired') }}
      onError={(e) => log('error', e)}
      onClose={() => log('close')}
    />
  </div>
  <button id="lang-ja" onclick={() => (lang = 'ja')}>Language: ja</button>
  <button id="lang-en" onclick={() => (lang = 'en')}>Language: en</button>
  <button id="reset" onclick={() => widget?.reset()}>Reset</button>
  <p>Token: <code id="token">{token || '-'}</code></p>
</section>

<section class="box">
  <h2>use:captchala action (bind mode)</h2>
  <button
    id="submit"
    use:captchala={{
      appKey,
      product: 'bind',
      action: 'login',
      onSuccess: (r) => log('bind success: ' + r.token.slice(0, 8)),
      onError: (e) => log('bind error', e)
    }}
  >
    Sign in
  </button>
</section>

<pre id="events">{events.join('\n')}</pre>

<style>
  .box { max-width: 400px; margin-top: 16px; }
  button { margin: 4px 4px 4px 0; }
  pre { background: #f1f5f9; padding: 8px; font-size: 12px; white-space: pre-wrap; }
</style>
