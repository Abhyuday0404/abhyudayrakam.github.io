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
