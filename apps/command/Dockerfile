FROM node:24-slim

WORKDIR /workspace

RUN corepack enable

COPY . .

RUN pnpm install --frozen-lockfile \
    && pnpm --filter @makido/contracts build \
    && pnpm --filter @makido/command build

ENV NODE_ENV=production

EXPOSE 50051

USER node

CMD ["node", "apps/command/dist/main.js"]