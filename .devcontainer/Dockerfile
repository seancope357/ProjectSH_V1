ARG NODE_VERSION=20
FROM node:${NODE_VERSION}-bullseye

RUN corepack enable

WORKDIR /workspace

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 3000 3001
CMD ["npm", "run", "dev"]