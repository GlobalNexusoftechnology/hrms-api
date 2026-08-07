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

# Copy compiled application
COPY --from=builder /usr/src/app/dist ./dist

# Copy uploads folder
COPY uploads ./uploads

# Create upload directories and set permissions
RUN mkdir -p \
    /usr/src/app/uploads/profiles \
    /usr/src/app/uploads/documents \
    /usr/src/app/uploads/organization/documents \
 && chown -R node:node /usr/src/app/uploads

USER node

EXPOSE 6543

CMD ["node", "dist/main.js"]