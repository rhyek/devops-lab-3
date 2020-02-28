trap down 1 2 3 6

down() {
  docker-compose down;
}

docker-compose up -d && npx mocha --require ts-node/register --watch --watch-files src src/**/*.spec.ts
