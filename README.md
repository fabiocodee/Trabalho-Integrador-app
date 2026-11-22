# jwt-app (front-end da biblioteca)

React + Vite. Requer a API rodando em http://localhost:3000.

    npm install
    npm run dev      # http://localhost:5173

A URL da API fica em `.env` (`VITE_API_URL`).

Tokens: salvos em localStorage (legível por JS; um XSS poderia roubá-los). O interceptor em
`src/api.js` renova o access token ao receber 401, com um único refresh por vez e fila para
as demais requisições; se o refresh falhar, limpa a sessão e volta ao login.
Menus de admin ficam ocultos para atendentes, mas a API também bloqueia (403).
