# Backend do Geotinho com Gemini 3.6 Flash (Cloudflare Workers)

Este Worker recebe as perguntas do MDSync e encaminha ao Gemini 3.6 Flash um resumo geotécnico selecionado. Este modelo foi escolhido porque o Gemini 4 Argon requer nível pago, enquanto o projeto do usuário está no nível gratuito. O Worker também serve os arquivos estáticos do MDSync pelo binding `ASSETS`. A chave Gemini é armazenada como Worker Secret e não entra no código, no frontend ou no repositório.

## Publicar e cadastrar a chave

1. Na raiz do repositório, gere os arquivos estáticos com `npm run build`. O deploy automático da Cloudflare usa o `wrangler.json` da raiz.
2. Cadastre `GEMINI_API_KEY` como Worker Secret no Worker `mdsync---mining-geotechnical-data`; sem a chave, a rota de chat responde com configuração pendente.
3. Revogue a chave que foi compartilhada na conversa e gere outra no [Google AI Studio](https://aistudio.google.com/app/apikey).
4. Para usar o Wrangler localmente, autentique a CLI e execute `npx wrangler@latest secret put GEMINI_API_KEY` na raiz do repositório. Cole a chave nova somente no prompt interativo; a Cloudflare mantém o valor criptografado como segredo.
5. O MDSync usa a própria URL do site como endpoint do chat (`/api/chat`), sem exigir configuração adicional no navegador.

O Worker limita o corpo da requisição, o tamanho da pergunta e do histórico, restringe CORS às origens configuradas, e aplica um limite aproximado de 12 chamadas por minuto por IP e por localidade Cloudflare. Limites do Workers Rate Limiting são eventualmente consistentes e locais por região; configure também limites/alertas de uso no projeto Google AI Studio.

## Configuração

O arquivo `wrangler.toml` define as origens web do MDSync e o binding de rate limit. Para testar outro domínio, atualize `ALLOWED_ORIGINS` com a origem completa (protocolo e host, sem caminho) e publique novamente. Em produção, mantenha somente origens necessárias.

## Rotas

- `GET /health`: estado básico e modelo configurado.
- `POST /api/chat`: recebe `{ prompt, history, context }` e devolve `{ text, model }`.

O resumo automático enviado ao modelo inclui dados geotécnicos selecionados, mas exclui cadastros de clientes, contratos e chaves. O texto e o histórico digitados pelo usuário também são enviados ao Google Gemini 3.6 Flash para responder à conversa.

