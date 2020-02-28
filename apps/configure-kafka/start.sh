# register schemas first
set -e

schema=$(echo '{
  "name": "user",
  "type": "record",
  "namespace": "devopslab3",
  "fields": [
    {
      "name": "id",
      "type": "string"
    },
    {
      "name": "email",
      "type": "string"
    },
    {
      "name": "name",
      "type": "string"
    },
    {
      "name": "external_id",
      "type": "string"
    }
  ]
}' | jq -c | sed 's/"/\\"/g')

curl --fail --silent --show-error -i -X POST http://"$KAFKA_SCHEMA_REGISTRY"/subjects/users-value/versions \
  -H "Content-Type: application/vnd.schemaregistry.v1+json" \
  -d '{
    "schema": "'"$schema"'"
  }'

echo -e "\nKafka setup completed!"
