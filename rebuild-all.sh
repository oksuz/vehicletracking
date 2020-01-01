#!/bin/bash

set -e

APPS=("common" "tcpserver" "persistance" "protocols/gt100")

for i in "${APPS[@]}"
do
  echo "REBUILDING MODULE ${i}"
  cd "${i}" && \
  rm -rf node_modules && \
  npm install && \
  npm run build && \
  cd -
done


echo "DONE!"