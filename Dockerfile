# =============================================================================
# ANAMNESIS — single container, single port, single artefact.
#
# Exists so the deployment does not depend on the AI Studio wrapper's implicit
# behaviour, and so the whole thing can be reproduced on a laptop if a hosted
# URL fails on the day.
#
#   docker build --build-arg API_SHARED_SECRET=... -t anamnesis .
#   docker run --rm -p 3000:3000 --env-file .env anamnesis
#
# API_SHARED_SECRET is needed at BUILD time as well as run time. The browser
# has to present it, so vite compiles it into the client bundle. Setting it
# only as a runtime variable gives you a server that demands the header and a
# client that never sends one — every request 401s.
# =============================================================================

# ---- build -----------------------------------------------------------------
# bun, because bun.lock is the project's lockfile. npm ignores it and would
# resolve fresh versions, so the image would not match what was tested.
FROM oven/bun:1 AS build
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

ARG API_SHARED_SECRET=""
ENV API_SHARED_SECRET=$API_SHARED_SECRET

# vite emits dist/ ; esbuild emits dist/server.cjs
RUN bun run build

# ---- runtime dependencies --------------------------------------------------
# Resolved separately so the runtime image carries no build tooling. This is
# only safe because server.ts imports vite lazily, inside the development
# branch; a top-level import would make the server fail to boot here.
FROM oven/bun:1 AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

# ---- runtime ---------------------------------------------------------------
FROM node:22-slim AS runtime
WORKDIR /app

# Production is the default branch, matching server.ts. This must not be
# 'development' or the container would try to start a Vite dev server.
ENV NODE_ENV=production
ENV PORT=3000

# esbuild runs with --packages=external, so runtime dependencies ship unbundled.
COPY --from=deps  /app/node_modules ./node_modules
COPY --from=build /app/dist         ./dist
COPY --from=build /app/package.json ./

# Drop privileges. The image needs no write access to anything it serves.
USER node

EXPOSE 3000

# /api/health reports the resolved model, timeout and auth posture, so a
# misconfigured container is diagnosable from outside without reading logs.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist/server.cjs"]
