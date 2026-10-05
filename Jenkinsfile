// Demonstrates CloudBees Unify <-> Jenkins integration:
//   - Build
//   - Simulated test run, published to Unify's Test results tab (junit step)
//   - Docker image build, pushed to Docker Hub
//   - Build artifact registered in Unify (registerBuildArtifactMetadata)
//
// Prerequisites (one-time, done outside this repo):
//   - This Jenkins controller is integrated with CloudBees Unify (CI/Jenkins
//     integration + CloudBees Platform Insights plugin installed), so that
//     `junit` results and `registerBuildArtifactMetadata` calls surface in
//     Unify against this component.
//   - JUnit plugin installed on the controller.
//   - A Jenkins credential named "dockerhub-credentials" (Username with
//     password) pointing at your Docker Hub account.

pipeline {
    agent any

    environment {
        IMAGE_NAME          = 'banking-demo-backend-api'
        DOCKERHUB_NAMESPACE = 'cloudbeesdemo'
        IMAGE_TAG           = "${env.BUILD_NUMBER}"
        FULL_IMAGE          = "${DOCKERHUB_NAMESPACE}/${IMAGE_NAME}:${IMAGE_TAG}"
    }

    stages {
        stage('Build') {
            steps {
                sh 'npm install'
            }
        }

        stage('Test') {
            steps {
                // Simulated for demo purposes - see scripts/generate-test-report.js
                sh 'npm test'
                junit 'test-reports/*.xml'
            }
        }

        stage('Build image') {
            steps {
                sh "docker build -t ${FULL_IMAGE} ."
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-credentials',
                    usernameVariable: 'DOCKERHUB_USER',
                    passwordVariable: 'DOCKERHUB_PASS'
                )]) {
                    sh 'echo "$DOCKERHUB_PASS" | docker login -u "$DOCKERHUB_USER" --password-stdin'
                    sh "docker push ${FULL_IMAGE}"
                    sh 'docker logout'
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
