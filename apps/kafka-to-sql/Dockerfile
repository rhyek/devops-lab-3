FROM confluentinc/cp-kafka-connect:5.4.0

ENV CONNECT_GROUP_ID='kafkatosql'
ENV CONNECT_CONFIG_STORAGE_TOPIC="kafkatosql-config"
ENV CONNECT_OFFSET_STORAGE_TOPIC="kafkatosql-offsets"
ENV CONNECT_STATUS_STORAGE_TOPIC="kafkatosql-status"
ENV CONNECT_KEY_CONVERTER="org.apache.kafka.connect.storage.StringConverter"
ENV CONNECT_VALUE_CONVERTER="io.confluent.connect.avro.AvroConverter"
ENV CONNECT_LOG4J_ROOT_LOGLEVEL="ERROR"
ENV CONNECT_PLUGIN_PATH="/usr/share/java,/usr/share/confluent-hub-components"

RUN confluent-hub install --no-prompt confluentinc/kafka-connect-jdbc:5.4.0
RUN apt-get update && apt-get install python3 python3-pip -y
RUN pip3 install requests

WORKDIR /app
COPY start.py .
# CMD sleep infinity
# CMD ./start.sh && exec /bin/bash -c "trap : TERM INT; sleep infinity & wait"
# CMD exec /bin/bash -c "trap : TERM INT; sleep infinity & wait"
CMD exec python3 -u ./start.py
