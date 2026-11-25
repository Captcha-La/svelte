# @captcha-la/svelte example (SvelteKit)

Two prerendered routes: `/` shows the `<Captchala>` component (float mode) and the
`use:captchala` action on a button (bind mode); `/other` has no CAPTCHA, so switching
routes destroys and re-creates the widget. Prerendering exercises server-side rendering.

```bash
# in the repository root
npm install && npm run build
# then here
npm install
npm run dev      # http://localhost:5173/?appKey=your-app-key
npm run build    # static site in build/
```

Add `&serverToken=...` to the URL to pass a server-issued token. The page origin must be
allowed for your app in the dashboard.
