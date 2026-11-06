# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Deployment configuration

Set `VITE_API_BASE_URL` to the backend origin before building:

- Local development: copy `.env.example` to `.env`; its default is `http://localhost:8000`.
- Vercel: set `VITE_API_BASE_URL` to `https://roadrakshak-ai.onrender.com`.

The map page also requires `VITE_GOOGLE_MAPS_API_KEY`. Configure a browser key restricted to the deployed frontend domain in Vercel; do not commit it.

In Render, set `ALLOWED_ORIGINS` to the comma-separated frontend origins, for example `https://road-rakshak-ap5sguadw-amal-e1d9.vercel.app`. Local development origins are allowed by the backend automatically. Redeploy after changing environment variables.
