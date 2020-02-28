FROM node:12-alpine
RUN apk --no-cache add curl
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
CMD ./migrate.sh

