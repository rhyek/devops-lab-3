def node_app(app_name):
  docker_build('gcr.io/devops-lab-2/{}'.format(app_name), 'apps/{}'.format(app_name),
    live_update=[
      sync('apps/{}'.format(app_name), '/app'),
      run('cd /app && npm i', trigger='apps/{}/package-lock.json'.format(app_name))
    ],
    entrypoint='npx ts-node-dev src/main.ts'
  )

apps = ['todos', 'users']

[node_app(app_name) for app_name in apps]

k8s_yaml([
  'kubernetes-manifests/ingress.yaml',
  'kubernetes-manifests/todos.yaml',
  'kubernetes-manifests/users.yaml'
])
