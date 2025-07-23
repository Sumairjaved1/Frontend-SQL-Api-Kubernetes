pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = 'docker-key' // DockerHub username/token in Jenkins credentials
        DOCKER_IMAGE = 'sumairjaved/node-application'
        IMAGE_TAG = 'latest' // Changed from "${env.BUILD_NUMBER}" to 'latest'
    }

    triggers {
        githubPush() // Requires GitHub webhook to be configured
    }

    stages {
        stage('Checkout Code') {
            steps {
                checkout scmGit(
                    branches: [[name: '*/main']],
                    extensions: [],
                    userRemoteConfigs: [[
                        url: 'https://github.com/Sumairjaved1/Frontend-SQL-Api-Kubernetes.git'
                    ]]
                )
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    dir('Front-End-Application') {
                        // The build command will now use 'latest' as the tag
                        docker.build("${DOCKER_IMAGE}:${IMAGE_TAG}")
                    }
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                script {
                    docker.withRegistry('https://index.docker.io/v1/', DOCKERHUB_CREDENTIALS) {
                        // Push the 'latest' tagged image
                        docker.image("${DOCKER_IMAGE}:${IMAGE_TAG}").push()
                        // No need to re-tag to 'latest' if it's already 'latest'
                        // docker.image("${DOCKER_IMAGE}:${IMAGE_TAG}").tag('latest')
                        // The push of 'latest' is already handled by the line above
                        // docker.image("${DOCKER_IMAGE}:latest").push()
                    }
                }
            }
        }
    }

    post {
        success {
            echo "✅ Docker image pushed: ${DOCKER_IMAGE}:${IMAGE_TAG}" // Updated message
        }
        failure {
            echo "❌ Build or push failed."
        }
    }
}