FROM node:12-alpine
RUN apk --no-cache add curl bash
RUN apk --no-cache --virtual build-dependencies add python python-dev build-base

# WORKDIR /src/@shared
# RUN npm install kafka-avro@3.0.2
# WORKDIR /src/todos
# RUN npm install kafka-avro@3.0.2

WORKDIR /src/@shared
COPY ./@shared/package.json ./@shared/package-lock.json ./
RUN npm install

WORKDIR /src/todos
COPY ./todos/package.json ./todos/package-lock.json ./
RUN npm install

RUN apk del build-dependencies

COPY @shared /src/@shared
COPY todos /src/todos

CMD npm run dev
