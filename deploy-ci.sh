#!/bin/bash
set -e

if [ ! -d "$HOME/google-cloud-sdk/bin" ]; then rm -rf $HOME/google-cloud-sdk; export CLOUDSDK_CORE_DISABLE_PROMPTS=1; curl https://sdk.cloud.google.com | bash; fi
source $HOME/google-cloud-sdk/path.bash.inc
gcloud version
yes | gcloud components update
yes | gcloud components update kubectl

docker build -t asia.gcr.io/${PROJECT_NAME}/${DOCKER_IMAGE_NAME}:$TRAVIS_COMMIT .
docker build -t asia.gcr.io/${PROJECT_NAME}/${DOCKER_FRONTEND_IMAGE_NAME}:$TRAVIS_COMMIT frontend

echo $GCLOUD_SERVICE_KEY | base64 --decode -i > ${HOME}/gcloud-service-key.json

gcloud auth activate-service-account --key-file ${HOME}/gcloud-service-key.json
yes | gcloud --quiet auth configure-docker
gcloud --quiet config set project $PROJECT_NAME
gcloud --quiet config set container/cluster $CLUSTER_NAME
gcloud --quiet config set compute/zone ${CLOUDSDK_COMPUTE_ZONE}
gcloud --quiet container clusters get-credentials $CLUSTER_NAME

docker push asia.gcr.io/${PROJECT_NAME}/${DOCKER_IMAGE_NAME}:$TRAVIS_COMMIT
docker push asia.gcr.io/${PROJECT_NAME}/${DOCKER_FRONTEND_IMAGE_NAME}:$TRAVIS_COMMIT

kubectl set image deployment/${KUBE_DEPLOYMENT_NAME} ${KUBE_DEPLOYMENT_CONTAINER_NAME}=asia.gcr.io/${PROJECT_NAME}/${DOCKER_IMAGE_NAME}:$TRAVIS_COMMIT
kubectl set image deployment/${KUBE_FRONTEND_DEPLOYMENT_NAME} ${KUBE_FRONTEND_DEPLOYMENT_CONTAINER_NAME}=asia.gcr.io/${PROJECT_NAME}/${DOCKER_FRONTEND_IMAGE_NAME}:$TRAVIS_COMMIT
