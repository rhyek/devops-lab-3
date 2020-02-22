FROM node:12-alpine
RUN apk --no-cache add curl
COPY ./users/package.json ./users/package-lock.json /src/users/
WORKDIR /src/users
RUN npm install
COPY @shared /src/@shared
COPY users /src/users
EXPOSE 8080
CMD npm run dev
