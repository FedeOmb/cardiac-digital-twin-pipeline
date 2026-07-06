# Stage 1: build — usa node solo per compilare
FROM node:20-alpine AS builder

RUN apk add --no-cache git

ARG GLANCE_VERSION=v4.25.2
RUN git clone --depth 1 --branch ${GLANCE_VERSION} \
    https://github.com/Kitware/glance.git /app

WORKDIR /app
RUN npm install

ENV NODE_OPTIONS=--openssl-legacy-provider

RUN npm run build:release
# Output in /app/dist/

# Stage 2: runtime — nginx leggero, nessun node
FROM nginx:alpine

# Copia solo i file statici compilati
COPY --from=builder /app/dist/ /usr/share/nginx/html/

# Configurazione nginx per servire anche i file mesh via /meshes/
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000