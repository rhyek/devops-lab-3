FROM node:12-alpine
RUN apk --no-cache add curl
COPY ./auth/package.json ./auth/package-lock.json /src/auth/
WORKDIR /src/auth
RUN npm install
COPY @shared /src/@shared
COPY auth /src/auth
EXPOSE 8080
CMD npm run dev
# CMD ["/bin/sleep", "100000"]
