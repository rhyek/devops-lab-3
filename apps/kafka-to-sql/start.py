import os
import sys
import subprocess
import re
import time
import signal
import requests

kafka_connect_host = "localhost:8083"

os.environ["CONNECT_REST_ADVERTISED_HOST_NAME"] = (subprocess.check_output(
    ["hostname", "-I"]).decode("UTF-8").split(" ")[0])

subprocess.Popen(["/etc/confluent/docker/run"])

wait_counter = 0
print("Waiting for Kafka Connect API to be ready ⏳")
while True:
    try:
        r = requests.get("http://{}/connectors".format(kafka_connect_host))
        status = r.status_code
        r.raise_for_status()
    except (requests.ConnectionError):
        status = 0
    if status == 200:
        break
    else:
        print("Kafka Connect API not ready yet... retry # {}".format(
            wait_counter))
        wait_counter += 1
        if wait_counter < 15:
            time.sleep(3)
        else:
            print("Waited too long!")
            sys.exit(1)

print("Creating Kafka Connect Postgresql Sink")

regex = re.compile(r"^postgresql://(?P<user>.+):(?P<pass>.+)@(?P<rest>.+)$")
m = regex.match(os.environ["DB_URL"])

r = requests.put(
    "http://{}/connectors/jdbc_sink_postgresql_users_00/config".format(
        kafka_connect_host),
    json={
        "connector.class": "io.confluent.connect.jdbc.JdbcSinkConnector",
        "tasks.max": '1',
        "topics": "users",
        "connection.url": "jdbc:postgresql://{}".format(m.group("rest")),
        "connection.user": m.group("user"),
        "connection.password": m.group("pass"),
        "auto.create": "false",
        "insert.mode": "upsert",
        "pk.mode": "record_value",
        "pk.fields": "id",
    },
)
print(r.status_code)
r.raise_for_status()

r = requests.put(
    "http://{}/connectors/jdbc_sink_postgresql_tasks_00/config".format(
        kafka_connect_host),
    json={
        "connector.class": "io.confluent.connect.jdbc.JdbcSinkConnector",
        "tasks.max": '1',
        "topics": "tasks",
        "connection.url": "jdbc:postgresql://{}".format(m.group("rest")),
        "connection.user": m.group("user"),
        "connection.password": m.group("pass"),
        "auto.create": "false",
        "insert.mode": "upsert",
        "pk.mode": "record_value",
        "pk.fields": "id",

        "transforms": "RenameField",
        "transforms.RenameField.type": "org.apache.kafka.connect.transforms.ReplaceField$Value",
        "transforms.RenameField.renames": "ownerId:owner_id,assigneeId:assignee_id,createdAt:created_at"
    },
)
print(r.status_code)
r.raise_for_status()

print("Done.")

running = True


def sigterm():
    global running
    running = False


signal.signal(signal.SIGTERM, sigterm)

while running:
    time.sleep(2)
print('Kafka Connect closing...')
