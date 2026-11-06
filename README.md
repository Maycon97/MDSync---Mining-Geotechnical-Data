# React + Vite

## Geotinho com Gemini 4 Argon

O chat do Geotinho envia as perguntas ao endpoint `/api/chat` do mesmo Cloudflare Worker que serve o site, ligado ao Gemini 4 Argon. A chave Gemini deve existir apenas como Worker Secret `GEMINI_API_KEY`, nunca no frontend ou no repositório. Instruções de publicação estão em [`backend/argon-chat/README.md`](backend/argon-chat/README.md).

Se o segredo `GEMINI_API_KEY` ainda não estiver cadastrado no Worker, o chat informa que o serviço está sem configuração. A chave nunca é enviada ao navegador.

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
