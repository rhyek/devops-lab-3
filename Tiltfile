def node_app(app_name):
  docker_build('registry:5000/devops-lab-3/{}'.format(app_name), 'apps/', dockerfile='apps/{}/Dockerfile'.format(app_name),
    only=['./{}'.format(app_name), './@shared'],
    live_update=[
      sync('apps/{}'.format(app_name), '/src/{}'.format(app_name)),
      sync('apps/@shared', '/src/@shared'),
      run('cd /src/{} && npm i'.format(app_name), trigger='apps/{}/package-lock.json'.format(app_name))
    ]
  )

apps = ['todos', 'webapp', 'users', 'auth']

[node_app(app_name) for app_name in apps]

k8s_yaml(listdir('./dev/k8s-yamls', recursive=True))
