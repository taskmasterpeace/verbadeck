# Single-service production image for verbadeck (Coolify).
# Builds the Vite client and runs the Express server, which serves client/dist + /api + /ws.
FROM node:20-slim
WORKDIR /app

# install all workspace deps (root + client + server)
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/
RUN npm ci

# build the client (-> client/dist). Use vite directly: tsc is hoisted out of the
# client workspace's PATH, and vite/esbuild transpiles without a separate type-check.
COPY . .
RUN cd client && npx vite build

ENV NODE_ENV=production
ENV PORT=3002
EXPOSE 3002
# start the server (it now serves the built client too)
CMD ["npm", "start", "--workspace=server"]
