// Demonstrates CloudBees Unify <-> Jenkins integration:
//   - Build (on a Kubernetes agent pod with a Node.js container)
//   - Simulated test run, published to Unify's Test results tab (junit step)
//   - Docker image build + push to Docker Hub via Kaniko (daemonless,
//     no privileged container needed on a Kubernetes agent)
//   - Build artifact registered in Unify (registerBuildArtifactMetadata)
//
// Prerequisites (one-time, done outside this repo):
//   - This Jenkins controller is integrated with CloudBees Unify (CI/Jenkins
//     integration + CloudBees Platform Insights plugin installed), so that
//     `junit` results and `registerBuildArtifactMetadata` calls surface in
//     Unify against this component.
//   - JUnit plugin installed on the controller.
//   - The Kubernetes plugin configured so this controller can provision
//     agent pods (CloudBees CI on Kubernetes has this out of the box).
//   - A Kubernetes Secret of type kubernetes.io/dockerconfigjson in the
//     namespace your Jenkins agents run in, e.g.:
//       kubectl create secret docker-registry dockerhub-regcred \
//         --docker-server=https://index.docker.io/v1/ \
//         --docker-username=cloudbeesdemo \
//         --docker-password='<your-docker-hub-password-or-token>' \
//         --namespace=<agent-namespace>
//     This replaces any Jenkins-credentials-based docker login - Kaniko
//     reads registry auth from a mounted docker config.json, not from
//     Jenkins credentials.

pipeline {
    agent {
        kubernetes {
            yaml '''
apiVersion: v1
kind: Pod
spec:
  containers:
    - name: node
      image: node:20-alpine
      command: ["cat"]
      tty: true
    - name: kaniko
      image: gcr.io/kaniko-project/executor:debug
      command: ["sleep"]
      args: ["99d"]
      volumeMounts:
        - name: docker-config
          mountPath: /kaniko/.docker
  volumes:
    - name: docker-config
      secret:
        secretName: dockerhub-regcred
        items:
          - key: .dockerconfigjson
            path: config.json
'''
        }
    }

    environment {
        IMAGE_NAME          = 'banking-demo-backend-api'
        DOCKERHUB_NAMESPACE = 'cloudbeesdemo'
        IMAGE_TAG           = "${env.BUILD_NUMBER}"
        FULL_IMAGE          = "${DOCKERHUB_NAMESPACE}/${IMAGE_NAME}:${IMAGE_TAG}"
    }

    stages {
        stage('Build') {
            steps {
                container('node') {
                    sh 'npm install'
                }
            }
        }

        stage('Test') {
            steps {
                container('node') {
                    // Simulated for demo purposes - see scripts/generate-test-report.js
                    sh 'npm test'
                }
                junit 'test-reports/*.xml'
            }
        }

        stage('Build and push image with Kaniko') {
            steps {
                container('kaniko') {
                    sh '''
                        /kaniko/executor \
                          --context=dir://${WORKSPACE} \
                          --dockerfile=${WORKSPACE}/Dockerfile \
                          --destination=docker.io/${FULL_IMAGE} \
                          --destination=docker.io/${DOCKERHUB_NAMESPACE}/${IMAGE_NAME}:latest
                    '''
                }
            }
        }

        stage('Register artifact in Unify') {
            steps {
                script {
                    def artifactId = registerBuildArtifactMetadata(
                        name: env.IMAGE_NAME,
                        url: "docker.io/${FULL_IMAGE}",
                        version: env.IMAGE_TAG,
                        type: 'Docker',
                        commit: env.GIT_COMMIT
                    )
                    echo "Registered build artifact in CloudBees Unify: ${artifactId}"
                }
            }
        }
    }
}
