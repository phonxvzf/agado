#!/bin/sh
while curl --silent http://agado-api-svc:3000 > /dev/null; [ $? -ne 0 ]; do
  echo '[ERROR] Connection to API server could not be established. Retrying in 3 seconds...';
  sleep 3;
done

echo '[INFO] API server is now reachable.';
echo '[INFO] Starting nginx...';
nginx -g 'daemon off;'
