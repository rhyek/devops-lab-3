FROM confluentinc/cp-kafka-connect:5.4.0

RUN apt-get update && apt-get install python3 python3-pip -y
RUN pip3 install requests

ENV CONNECT_GROUP_ID='sql-source-connector'
ENV CONNECT_CONFIG_STORAGE_TOPIC="sql-source-connector-config"
ENV CONNECT_OFFSET_STORAGE_TOPIC="sql-source-connector-offsets"
ENV CONNECT_STATUS_STORAGE_TOPIC="sql-source-connector-status"
ENV CONNECT_LOG4J_ROOT_LOGLEVEL="ERROR"
ENV CONNECT_PLUGIN_PATH="/usr/share/java,/usr/share/confluent-hub-components,/usr/lib/kafka-connectors"
ENV CONNECT_KEY_CONVERTER="org.apache.kafka.connect.storage.StringConverter"
ENV CONNECT_VALUE_CONVERTER="org.apache.kafka.connect.json.JsonConverter"
ENV CONNECT_KEY_CONVERTER_SCHEMAS_ENABLE="false"
ENV CONNECT_VALUE_CONVERTER_SCHEMAS_ENABLE="false"

RUN confluent-hub install --no-prompt debezium/debezium-connector-postgresql:1.0.0
RUN mkdir -p /usr/lib/kafka-connectors

WORKDIR /app
COPY start.py .

CMD exec python3 -u ./start.py
