FROM node:12-alpine
RUN apk --no-cache add curl bash
RUN apk --no-cache --virtual build-dependencies add python python-dev build-base

WORKDIR /src/@shared
COPY ./@shared/package.json ./@shared/package-lock.json ./
RUN npm install

WORKDIR /src/users
COPY ./users/package.json ./users/package-lock.json ./
RUN npm install

RUN apk del build-dependencies

COPY @shared /src/@shared
COPY users /src/users

CMD npm run dev
