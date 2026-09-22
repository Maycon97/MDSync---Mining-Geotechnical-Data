# Regra Obrigatória e Indispensável de Deploy e Versionamento

## Instrução Permanente do Usuário
Toda e qualquer atualização, refatoração, correção ou nova funcionalidade realizada no projeto DEVE OBRIGATORIAMENTE seguir o fluxo abaixo:

1. **Subir no Repositório GitHub**:
   - Commitar todas as alterações com mensagens claras e semânticas.
   - Fazer `git push origin master` (ou branch ativa).
2. **Publicar no GitHub Pages**:
   - Executar `npm run deploy` (que roda `vite build` e publica via `gh-pages -d dist`).
   - Confirmar o status de publicação.

Esta ação é INDISPENSÁVEL e deve ser realizada em todas as iterações de desenvolvimento sem necessidade de solicitação adicional.
