FROM node:12-alpine
RUN apk --no-cache add curl
COPY ./webapp/package.json ./webapp/package-lock.json /src/webapp/
WORKDIR /src/webapp
RUN npm install
COPY @shared /src/@shared
COPY webapp /src/webapp
EXPOSE 8080
CMD exec npm run dev
# CMD ["/bin/sleep", "100000"]