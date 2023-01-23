#!/usr/bin/env bash

VERSION=$1

if [[ -z "$1" ]] ; then
    echo "Usage: ./scripts/docker-hub-publish.sh VERSION"
    exit 1
fi

docker build . -t zeitgeistpm/zeitgeist-token-api:$1 -t zeitgeistpm/zeitgeist-token-api:latest
docker push zeitgeistpm/zeitgeist-token-api:$1
docker push zeitgeistpm/zeitgeist-token-api:latest