// This is a minimal test Jenkinsfile
pipeline {
    agent any
    stages {
        stage('Verify Checkout and Workspace') {
            steps {
                echo 'Pipeline reached the "Verify Checkout and Workspace" stage!'
                // This step will fail if no code is checked out, providing a clear error
                sh 'ls -la'
            }
        }
    }
}