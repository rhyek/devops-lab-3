FROM node:12-alpine
RUN apk --no-cache add curl
COPY ./tasks/package.json ./tasks/package-lock.json /src/tasks/
WORKDIR /src/tasks
RUN npm install
COPY @shared /src/@shared
COPY tasks /src/tasks
EXPOSE 8080
CMD npm run dev
# CMD ["/bin/sleep", "100000"]
