pipeline {
    agent any

    environment {
        DOCKER_HUB_CREDENTIALS_ID = 'docker-hub-credentials'
        DOCKER_REGISTRY = 'docker.io'
        DOCKER_USER = 'preethamvs6' // Change to actual Docker Hub username
        
        BACKEND_IMAGE_NAME = 'ecommerce-backend'
        FRONTEND_IMAGE_NAME = 'ecommerce-frontend'
        
        KUBECONFIG_CREDENTIALS_ID = 'kubernetes-kubeconfig'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build & Test Backend') {
            steps {
                dir('backend') {
                    sh 'mvn clean package -DskipTests=false'
                }
            }
        }

        stage('Build & Lint Frontend') {
            steps {
                dir('frontend') {
                    sh 'npm install'
                    sh 'npm run build'
                }
            }
        }

        stage('Docker Build & Package') {
            steps {
                script {
                    // Build Backend Image
                    sh "docker build -t ${DOCKER_USER}/${BACKEND_IMAGE_NAME}:${BUILD_NUMBER} ./backend"
                    sh "docker build -t ${DOCKER_USER}/${BACKEND_IMAGE_NAME}:latest ./backend"

                    // Build Frontend Image
                    sh "docker build -t ${DOCKER_USER}/${FRONTEND_IMAGE_NAME}:${BUILD_NUMBER} ./frontend"
                    sh "docker build -t ${DOCKER_USER}/${FRONTEND_IMAGE_NAME}:latest ./frontend"
                }
            }
        }

        stage('Docker Push to Hub') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: DOCKER_HUB_CREDENTIALS_ID, usernameVariable: 'DOCKER_USER_VAR', passwordVariable: 'DOCKER_PASS_VAR')]) {
                        sh "echo ${DOCKER_PASS_VAR} | docker login -u ${DOCKER_USER_VAR} --password-stdin ${DOCKER_REGISTRY}"
                        
                        // Push Backend Images
                        sh "docker push ${DOCKER_USER}/${BACKEND_IMAGE_NAME}:${BUILD_NUMBER}"
                        sh "docker push ${DOCKER_USER}/${BACKEND_IMAGE_NAME}:latest"

                        // Push Frontend Images
                        sh "docker push ${DOCKER_USER}/${FRONTEND_IMAGE_NAME}:${BUILD_NUMBER}"
                        sh "docker push ${DOCKER_USER}/${FRONTEND_IMAGE_NAME}:latest"
                    }
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                script {
                    withKubeConfig([credentialsId: KUBECONFIG_CREDENTIALS_ID]) {
                        // Apply Core Workloads (Configs, DB, Services, and Ingress)
                        sh "kubectl apply -f kubernetes/configmap.yaml"
                        sh "kubectl apply -f kubernetes/secrets.yaml"
                        sh "kubectl apply -f kubernetes/db-init-configmap.yaml"
                        sh "kubectl apply -f kubernetes/db-deployment.yaml"
                        sh "kubectl apply -f kubernetes/backend-service.yaml"
                        sh "kubectl apply -f kubernetes/frontend-service.yaml"
                        sh "kubectl apply -f kubernetes/ingress.yaml"
                        
                        // Make deploy script executable
                        sh "chmod +x scripts/blue-green-deploy.sh"
                        
                        // Perform Blue-Green Deployment
                        sh "./scripts/blue-green-deploy.sh backend deploy ${DOCKER_USER}/${BACKEND_IMAGE_NAME}:${BUILD_NUMBER}"
                        sh "./scripts/blue-green-deploy.sh frontend deploy ${DOCKER_USER}/${FRONTEND_IMAGE_NAME}:${BUILD_NUMBER}"
                    }
                }
            }
        }
    }

    post {
        always {
            sh "docker logout"
            cleanWs()
        }
        success {
            echo "CI/CD Pipeline succeeded! Deployment complete."
        }
        failure {
            echo "CI/CD Pipeline failed. Check builds or deployment environments."
        }
    }
}
