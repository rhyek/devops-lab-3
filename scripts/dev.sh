rm -rf ./k8s-yamls && \
cd pulumi/k8s-apps && \
pulumi stack rm -fy local && \
export PULUMI_CONFIG_PASSPHRASE="pass" && \
pulumi stack init local && \
pulumi up -y && \
cd ../.. && \
tilt up --no-browser &
# until $(curl --output /dev/null --silent --head --fail http://devopslab3); do
#     printf '.'
#     sleep 1
# done
