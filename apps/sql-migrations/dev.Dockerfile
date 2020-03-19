FROM node:12-alpine
RUN apk --no-cache add curl bash
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
CMD exec /bin/sh -c "trap : TERM INT; ./migrate.sh && (while true; do sleep 1000; done) & wait"
