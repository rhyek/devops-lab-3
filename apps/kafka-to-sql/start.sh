kafka_connect_host=localhost:8083

export CONNECT_REST_ADVERTISED_HOST_NAME=$(hostname -I)

/etc/confluent/docker/run &

wait_counter=0
echo "Waiting for Kafka Connect to start listening on kafka-connect ⏳"
while true; do
  status=$(curl -s -o /dev/null -w %{http_code} http://$kafka_connect_host/connectors)
  if [ $status -eq 000 ]; then
    wait_counter=$((wait_counter+1))
    echo "Kafka Connect listener HTTP status: $status (waiting for 200)"
    if [ $wait_counter = 15 ]; then
      echo 'Waited too long!';
      exit 1;
    else
      echo "Retries: $wait_counter"
      sleep 3
    fi
  else
    break
  fi
done


echo -e "\n--\n+> Creating Kafka Connect Podffsdtdsdssgrfessqls sink"

set -e

curl --fail --silent --show-error -X PUT http://$kafka_connect_host/connectors/jdbc_sink_postgresql_00/config -H "Content-Type: application/json" -d '{
  "connector.class": "io.confluent.connect.jdbc.JdbcSinkConnector",
  "tasks.max": 1,
  "topics": "users",
  "connection.url": "jdbc:postgresql://192.168.0.12:5433/db",
  "connection.user": "user",
  "connection.password": "pass",
  "auto.create": false,
  "insert.mode": "upsert",
  "pk.mode": "record_value",
  "pk.fields": "id"
}'

echo 'Done.';

trap : TERM INT; sleep infinity & wait
