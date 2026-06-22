# Two-stage build for verbadeck on Coolify.
# Stage 1 builds the Vite client in ISOLATION (its own node_modules) so workspace hoisting
# doesn't break Vite's resolution of vite/vite-plugin-pwa. Stage 2 runs the Express server,
# which serves /api + /ws and the built client (../client/dist).

# --- stage 1: client ---
FROM node:20-slim AS client
WORKDIR /client
COPY client/package*.json ./
# --include=dev is required: Coolify injects NODE_ENV=production, which would otherwise make
# npm skip devDependencies (vite, @vitejs/plugin-react, vite-plugin-pwa all live there).
RUN npm install --include=dev
COPY client/ ./
RUN npx vite build

# --- stage 2: server runtime ---
FROM node:20-slim
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install --omit=dev
COPY server/ ./
COPY --from=client /client/dist /app/client/dist
ENV NODE_ENV=production
ENV PORT=3002
EXPOSE 3002
CMD ["node", "server.js"]
