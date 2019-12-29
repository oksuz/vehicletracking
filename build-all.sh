#!/bin/sh

set -e

APPS=("common" "tcpserver" "persistance" "protocols/gt100")

for i in "${APPS[@]}"
do
  echo "building ${i}"
  cd "${i}" && npm run build && cd -
done


echo "DONE!"