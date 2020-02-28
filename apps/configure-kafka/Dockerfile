FROM alpine:3.11
RUN apk add --no-cache jq curl
WORKDIR /app
COPY start.sh .
CMD exec ./start.sh
