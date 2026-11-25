<script>
  let { children } = $props()
</script>

<h1>CaptchaLa + SvelteKit</h1>
<nav>
  <a id="nav-captcha" href="/">Captcha</a>
  <a id="nav-other" href="/other">Other page</a>
</nav>

{@render children()}

<style>
  :global(body) { font-family: system-ui, sans-serif; margin: 0; padding: 24px; color: #0f172a; }
  nav a { margin-right: 12px; }
</style>
