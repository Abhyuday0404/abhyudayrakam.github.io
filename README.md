# Abhyuday Rakam Portfolio

Personal portfolio with a static HTML, CSS, and JavaScript entry point. The archive also includes an alternate React implementation in `src/`; it is preserved as source and is not the active page.

## Develop and build

```sh
npm ci
npm run dev
npm run build
```

Production files are generated in `dist/`. Dependencies and build output are intentionally excluded from Git.

## Cloudflare Pages

- Production branch: `main`
- Root directory: repository root
- Build command: `npm run build`
- Output directory: `dist`
- No environment variables are required by the current portfolio.

Never commit credentials or `.env` files.

## Cloudflare Workers

The Worker name in `wrangler.jsonc` matches the existing Cloudflare project.
The Worker serves only the built files in `dist/`; no server-side code is needed.

In Cloudflare, open the Worker, then Settings > Build:

- Production branch: `main`
- Root directory: repository root
- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`

Save these settings before retrying deployment. Cloudflare Workers Builds requires
its build command to be configured in the dashboard; the custom build command in
`wrangler.jsonc` is for local Wrangler usage.

The explicit assets configuration avoids Wrangler's automatic framework setup.

## Contact email delivery

The contact form forwards submissions through FormSubmit to
`abhyudayrakam0404@gmail.com`. The recipient must activate the form using the
confirmation email sent by FormSubmit after its first submission. Check Spam if
needed. Until activation is completed, inbox delivery is not verified.

The form uses native required/email validation, a honeypot, and an AJAX request
with a timeout and visible failure feedback. If JavaScript is unavailable, it
submits directly to FormSubmit and returns to `/thanks.html` after submission.
No email credentials or API keys are stored in this repository.
