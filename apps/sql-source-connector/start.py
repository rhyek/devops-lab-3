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
        if wait_counter < 15:
            time.sleep(3)
        else:
            print("Waited too long.")
            sys.exit(1)

print("Creating Kafka Connect Postgresql Source Connector")

r = requests.put(
    "http://{}/connectors/sql-source/config".format(
        kafka_connect_host),
    json={
        "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
        "plugin.name": "pgoutput",
        "slot.name": "debezium_tasks",
        "publication.name": "debezium_tasks",
        "database.server.name": "debezium-pg",
        "table.whitelist": "public.tasks",
        "database.hostname": os.environ["DB_HOST"],
        "database.port": os.environ["DB_PORT"],
        "database.user": os.environ["DB_USER"],
        "database.password": os.environ["DB_PASS"],
        "database.dbname": os.environ["DB_DBNAME"],
    },
)
print(r.status_code)
r.raise_for_status()

# print("Creating Kafka Connect Firestore Sink Connector")

# r = requests.put(
#     "http://{}/connectors/firestore-sink/config".format(
#         kafka_connect_host),
#     json={
# "task.max": 1,
# "plugin.path": "/usr/lib/firestore-sink.so",
# "config": {
#     "log.level": "TRACE",
#     "encoding.key": "string",
#     "encoding.value": "json",
#     "topic": "debezium-pg.public.tasks",
#     "firestore.collection.debezium-pg.public.tasks": "tasks",
#     "firestore.delete.on.null.values": True,
#     "firestore.project.id": "devops-lab-3-dev",
#     "firestore.credentials.file.json": {
#         "type": "service_account",
#         "project_id": "devops-lab-3-dev",
#         "private_key_id": "340897bc308693d6150c7f9e4c231e08a928238c",
#         "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDdAO4bU9LXoRKZ\nXQFJPlRs0L8pvrvkd6ysloJpN+FzII1Q0djZ2jcu9I3sXx/kJt662t02kp5HzVt+\nCC1QepDRZatfRolM1QqqGwNhJWb/CqwHKGa9t9mjSfKLj8dnqkxlEGOXeSj1w6uD\ngjyCnSdRlhrXnOjqPl7Uv5QLpJ+Q8XKuZfT1HsZUvBAGrSD++U4AIFi1Ww637zah\nkzlZ/225KqxEX0ofKHE9jMwdWnvvGjVBc3UyO3BfEhslUzFZ+UYVHiTtOF/ATANu\nF1InOxLH1iKeNB7yx2YfmcSDxxfzfb2DFCIWj08jPHD0bm5Ocyjoh9PlZ5A0aDv8\nmupJIY/dAgMBAAECggEAAgs8QhnXdT52AhLkOQ2v0TI2OmG05VfrMgA4V4nFQ3/P\nEfeTqYjrm4fc3vOoQ1kBFIa2ptN0GrAXz9J6iZtNYJDJcdmgpnD0wGSWKbbwI2nk\njZjLKA3Q7PVfnivOIwBmF98vB86xv5Tq+3RGY/zZFfEtJJMjOLT39cBWoBIj/NhC\nZUlZM1qpNvFzCPOhXJTLvb9lnVMT90zis1fkDlXJcb157hVQwzEP0j4+2o66BerP\nH9cU7cXhie2Js+uc+tP2yqv/oeYcflmLOkLy2bO46nMhP2ooCpblhuKLu8870qJc\ns1KU6pQTgsVqnJgXcdZYm6nwW+4aMssMtaF4KHecIQKBgQD7k+FHpXoPldfkvNuD\nPrKXmOp4ivuYyn0byfO5BcIRA4PGtCBUmyoyfpPYW3lThDRWd20Bonc22lYmohE+\n63/2dGF+3gvyBRjBRArp7Ce3/RyYCfpEHMDtfRuMIDmFwcche7Z0UW7l/kpijUWt\nbdjs832irVJdYYZANadFNT/Z7QKBgQDg43bpwGQP0oEsmObQTd+aFfjb2Sdfoqn7\n/zP3LHnwZt7qeuWbobfJtFe74Exy3QJns5g5rGYzGDyN+nHCbsBC5jinysXhOW58\nEbrXi/iyBgx/Elg98o/HE74eDTve3k0WDwS18EvVzP789FthJ9GA7Snx6ySPlCPf\nXBm0kDMPsQKBgQDBtoGN6HYPUCL4Bw/DhGCB6IYKoYHPiYNCBYP8YNmovhsWwpXu\nb7fTP7HZs729OBwQxE6UJqRDAWW6w6oh17YlcEGuLY3nIlOIZTs+GdAPlP8SdwRU\ntAs+EspGYH3KZ4ZMWvUHpbiNsftW3U7clquk8Gw5+dlk+/YitO2Cldj/lQKBgQDJ\nmH7XqmTInj63uNVoM/bXDQ1KH08hdxMEWFDAKbmh3MXF0qeTrROxGB5xx+8gJKjs\nR12VjcsL0JUv/SsPTfLBxdlR6P8cGDzHsakZYlttUujO3KYH2jIzFqqeC+T4s7TM\nqmfhpOiGXz7RiUeFP4maFoA8YjsjDnxd1RUh/QYY8QKBgQDt1roG7Zx3o7+xxoMH\nkUVOrvAGLM/TiV1zNrMStZWcANqjkq/P33xSZRBhgN9Z02oub4bSQpQ2mK1bW31/\nqB/3snnZe2EGPedIw89cZFx3NuzoG59DJi6N6o2uBVZYiJzyyJH4QRXXaKRDz1YV\nqVitQU/Kv/arw/IAHiGrwfoD+A==\n-----END PRIVATE KEY-----\n",
#         "client_email": "firebase-adminsdk-b17xj@devops-lab-3-dev.iam.gserviceaccount.com",
#         "client_id": "106553480921000154355",
#         "auth_uri": "https://accounts.google.com/o/oauth2/auth",
#         "token_uri": "https://oauth2.googleapis.com/token",
#         "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
#         "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-b17xj%40devops-lab-3-dev.iam.gserviceaccount.com"
#     }
# }
#     },
# )
# print(r.status_code)
# r.raise_for_status()

print("Done.")

running = True


def sigterm():
    global running
    running = False


signal.signal(signal.SIGTERM, sigterm)

while running:
    time.sleep(2)
print('Kafka Connect closing...')
