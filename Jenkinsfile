pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = 'docker-key' // Jenkins credential ID (added via UI)
        DOCKER_IMAGE = 'sumairjaved/node-application'
        IMAGE_TAG = "${env.BUILD_NUMBER}"
    }

    triggers {
        githubPush()
    }

    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    dir('Front-End-Application') {
                        docker.build("${DOCKER_IMAGE}:${IMAGE_TAG}")
                    }
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                script {
                    docker.withRegistry('https://index.docker.io/v1/', DOCKERHUB_CREDENTIALS) {
                        docker.image("${DOCKER_IMAGE}:${IMAGE_TAG}").push()
                        docker.image("${DOCKER_IMAGE}:${IMAGE_TAG}").tag('latest')
                        docker.image("${DOCKER_IMAGE}:latest").push()
                    }
                }
            }
        }
    }

    post {
        success {
            echo "✅ Docker image pushed: ${DOCKER_IMAGE}:${IMAGE_TAG} and :latest"
        }
        failure {
            echo "❌ Build or push failed."
        }
    }
}
