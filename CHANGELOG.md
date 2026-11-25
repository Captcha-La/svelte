# Changelog

## 1.0.0

- Initial release.
- `<Captchala>` component with the props `appKey`, `product`, `action`, `lang`, `theme`,
  `bindTo`, `serverToken`, `onServerTokenExpired`, callback props `onSuccess`, `onError`,
  `onClose`, `onReady`, `onExpired`, and the matching `success` / `error` / `close` /
  `ready` / `expired` events. Methods via `bind:this`: `verify()`, `reset()`, `destroy()`,
  `bind()`, `setLang()`, `getInstance()`.
- `onExpired`: called once when the pass token of the last success expires before it was
  used, instead of `onError`. Without it, `onError` fires once.
- `use:captchala` action: mounts the widget into an element, or in bind mode binds it to the
  element it is used on.
- Changing `lang` switches the language in place; other key props rebuild the widget.
- Works with Svelte 4 and Svelte 5. SSR safe in SvelteKit: the SDK is loaded only in the browser.
