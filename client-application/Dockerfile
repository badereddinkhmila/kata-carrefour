FROM oven/bun:1-alpine AS build
WORKDIR /app

COPY package.json bun.lock* ./

RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile

COPY . .
RUN bun run build

FROM nginx:1.27-alpine
RUN rm -rf /usr/share/nginx/html/* /etc/nginx/conf.d/*
COPY --from=build /app/dist /usr/share/nginx/html
COPY default.conf.template /etc/nginx/templates/default.conf.template

# Keeps the standard Nginx entrypoint valid outside an observability deployment.
ENV FARO_COLLECTOR_UPSTREAM=127.0.0.1:12347
ENV FARO_DNS_RESOLVER=127.0.0.11

EXPOSE 80
