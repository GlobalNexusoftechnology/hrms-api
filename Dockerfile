# ---------- Builder ----------
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    pango-dev \
    jpeg-dev \
    giflib-dev

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# ---------- Production ----------
FROM node:20-alpine

WORKDIR /usr/src/app

RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    pango-dev \
    jpeg-dev \
    giflib-dev

ENV NODE_ENV=production

COPY package*.json ./

RUN npm install --omit=dev

COPY --from=builder /usr/src/app/dist ./dist

# Copy uploads if they exist
COPY uploads ./uploads

# Create writable directories
RUN mkdir -p \
    /usr/src/app/uploads/profiles \
    /usr/src/app/uploads/documents \
    /usr/src/app/uploads/organization/documents \
    /usr/src/app/logs \
    && chown -R node:node /usr/src/app/uploads \
    && chown -R node:node /usr/src/app/logs

USER node

EXPOSE 6543

CMD ["node", "dist/main.js"]