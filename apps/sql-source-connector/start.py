import os
import sys
import subprocess
import time
import signal
import requests
import json

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
    except (requests.ConnectionError, requests.exceptions.HTTPError):
        status = 0
    if status == 200:
        break
    else:
        print("Kafka Connect API not ready yet... retry # {}".format(
            wait_counter))
        wait_counter += 1
        if wait_counter < 20:
            time.sleep(3)
        else:
            print("Waited too long.")
            sys.exit(1)

print("Creating Kafka Connect Postgresql Source Connector.")

r = requests.put(
    "http://{}/connectors/sql-source/config".format(
        kafka_connect_host),
    json={
        "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
        "plugin.name": "pgoutput",
        "slot.name": "debezium_todos",
        "publication.name": "debezium_todos",
        "database.server.name": "debezium-pg",
        "table.whitelist": "public.todos",
        "database.hostname": os.environ["DB_HOST"],
        "database.port": os.environ["DB_PORT"],
        "database.user": os.environ["DB_USER"],
        "database.password": os.environ["DB_PASS"],
        "database.dbname": os.environ["DB_DBNAME"],
        "tombstones.on.delete": False
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
