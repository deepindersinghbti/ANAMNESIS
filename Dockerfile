# =============================================================================
# ANAMNESIS — single container, single port, single artefact.
#
# Exists so the deployment does not depend on the AI Studio wrapper's implicit
# behaviour, and so the whole thing can be reproduced on a laptop if a hosted
# URL fails on the day.
#
#   docker build -t anamnesis .
#   docker run --rm -p 3000:3000 --env-file .env anamnesis
#
# API_SHARED_SECRET is read at BUILD time as well as run time: the browser has
# to present it, so vite compiles it into the bundle. Pass it as a build arg
# when building an image that will be deployed:
#
#   docker build --build-arg API_SHARED_SECRET=... -t anamnesis .
# =============================================================================

# ---- build -----------------------------------------------------------------
FROM node:22-slim AS build
WORKDIR /app

# Dependencies first, so a source-only change does not re-resolve them.
COPY package.json bun.lock ./
RUN npm install --no-audit --no-fund

COPY . .

# Compiled into the client bundle by vite.config.ts. Empty is valid: the
# server then decides whether an unauthenticated request is acceptable.
ARG API_SHARED_SECRET=""
ENV API_SHARED_SECRET=$API_SHARED_SECRET

# vite emits dist/ ; esbuild emits dist/server.cjs
RUN npm run build

# ---- runtime ---------------------------------------------------------------
FROM node:22-slim AS runtime
WORKDIR /app

# Production is the default branch, matching server.ts. NODE_ENV must not be
# 'development' here or the container would try to start a Vite dev server.
ENV NODE_ENV=production
ENV PORT=3000

# --packages=external leaves runtime dependencies unbundled, so they ship.
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

# Drop privileges. The image needs no write access to anything it serves.
USER node

EXPOSE 3000

# The health route reports the resolved model, timeout and auth posture, so a
# misconfigured container is visible from outside without reading its logs.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist/server.cjs"]
