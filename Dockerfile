# FROM node:20-alpine

# WORKDIR /app

# COPY package*.json ./

# RUN npm install

# COPY . .

# RUN npx prisma generate

# EXPOSE 5000

# CMD ["npm", "run", "dev"]



FROM node:22-alpine AS base

WORKDIR /app

COPY package*.json ./
COPY prisma.config.ts ./
COPY tsconfig.json ./
COPY prisma ./prisma

RUN npm ci

COPY src ./src

RUN npx prisma generate
RUN npm run build

ENV NODE_ENV=production

EXPOSE 5000

CMD ["npm", "start"]
