# 1) deps
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install

# 2) build
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build
RUN npx prisma generate

# 3) runtime
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY package*.json ./

RUN npm install --omit=dev

COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma

# ajuste a porta se sua API usa outra
EXPOSE 3333

# IMPORTANTE: você precisa ter um entrypoint real em dist
# (ex: dist/server.js). Se o output do tsup gerar outro nome, a gente ajusta.
CMD ["node", "dist/server.js"]