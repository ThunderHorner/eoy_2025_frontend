pipeline {
    agent any

    environment {
        // Repository and server configuration
        GIT_REPO_URL = 'git@github.com:ThunderHorner/eoy_2025_frontend.git'
        DOCKER_SERVER = 'thunderhorn@192.168.0.103'
        REMOTE_DIR = '/home/thunderhorn/crypto_tip_frontend'
        BUILD_DIR = '/home/thunderhorn/crypto_tip_frontend/dist'
        HTML_OUTPUT_DIR = '/home/thunderhorn/crypto_tip_frontend_deploy'
    }

    stages {
        stage('Clone Repository') {
            steps {
                // Clone the specified branch from the GitHub repository
                git branch: 'master', credentialsId: '10', url: "${env.GIT_REPO_URL}"
            }
        }

        stage('Deploy and Build Frontend') {
            steps {
                script {
                    sshagent(['15']) {
                        sh """
                        # Prepare remote directory
                        ssh -o StrictHostKeyChecking=no ${DOCKER_SERVER} '
                            rm -rf ${REMOTE_DIR} &&
                            mkdir -p ${REMOTE_DIR}'

                        # Copy project files to the remote server
                        scp -r ./* ${DOCKER_SERVER}:${REMOTE_DIR}/

                        # Execute build.sh script to build and serve the frontend
                        ssh -o StrictHostKeyChecking=no ${DOCKER_SERVER} '
                            cd ${REMOTE_DIR} &&
                            sh build.sh &&
                            sleep 5 &&
                            ps aux | grep "serve" | grep -v "grep" || echo "Frontend server failed to start!"'
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
