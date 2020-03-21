FROM node:12-alpine
RUN apk --no-cache add curl bash

WORKDIR /src/@shared
COPY ./@shared/package.json ./@shared/package-lock.json ./
RUN npm install

WORKDIR /src/firestore-todos-sync
COPY ./firestore-todos-sync/package.json ./firestore-todos-sync/package-lock.json ./
RUN npm install

COPY @shared /src/@shared
COPY firestore-todos-sync /src/firestore-todos-sync

CMD npm run start
