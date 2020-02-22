helm repo add stable https://kubernetes-charts.storage.googleapis.com
helm repo update
helm install my-nginx stable/nginx-ingress --version 1.31.0 --set controller.service.nodePorts.http=31500

