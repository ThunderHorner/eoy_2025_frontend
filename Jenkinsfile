pipeline {
    agent any

    environment {
        // Repository and server configuration
        GIT_REPO_URL = 'git@github.com:ThunderHorner/eoy_2025_frontend.git'
        DOCKER_SERVER = 'thunderhorn@192.168.0.103'
        REMOTE_DIR = '/home/thunderhorn/crypto_tip_frontend'
        BUILD_DIR = '/home/thunderhorn/crypto_tip_frontend/dist'
        HTML_OUTPUT_DIR = '/var/www/crypto_tip_frontend'
    }

    stages {
        stage('Clone Repository') {
            steps {
                // Clone the specified branch from the GitHub repository
                git branch: 'master', credentialsId: '10', url: "${env.GIT_REPO_URL}"
            }
        }

        stage('SSH to Server and Deploy') {
            steps {
                script {
                    sshagent(['15']) {
                        sh """
                        # Connect to the server and prepare the deployment directory
                        ssh -o StrictHostKeyChecking=no ${DOCKER_SERVER} '
                            rm -rf ${REMOTE_DIR} &&
                            mkdir -p ${REMOTE_DIR}'

                        # Copy project files to the remote server
                        scp -r ./* ${DOCKER_SERVER}:${REMOTE_DIR}/

                        # Build the frontend on the server
                        ssh -o StrictHostKeyChecking=no ${DOCKER_SERVER} '
                            cd ${REMOTE_DIR} &&
                            npm install &&
                            npm run build &&
                            rm -rf ${HTML_OUTPUT_DIR} &&
                            sudo mkdir -p ${HTML_OUTPUT_DIR} &&
                            sudo cp -r ${BUILD_DIR}/* ${HTML_OUTPUT_DIR}/'
                        """
                    }
                }
            }
        }
    }

    post {
        always {
            // Clean up workspace after the build
            cleanWs()
        }
    }
}
