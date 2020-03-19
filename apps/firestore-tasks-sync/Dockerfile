FROM node:12-alpine
RUN apk --no-cache add curl bash

WORKDIR /src/@shared
COPY ./@shared/package.json ./@shared/package-lock.json ./
RUN npm install

WORKDIR /src/firestore-tasks-sync
COPY ./firestore-tasks-sync/package.json ./firestore-tasks-sync/package-lock.json ./
RUN npm install

COPY @shared /src/@shared
COPY firestore-tasks-sync /src/firestore-tasks-sync

CMD npm run start
