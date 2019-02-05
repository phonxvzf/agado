#!/bin/sh

# Try migration until succeed
echo 'Migrating database to latest version...'
while npm run migrate; [ $? -ne 0 ]; do
  echo '[ERROR] Connection to database server could not be established. Retrying in 3 seconds...';
  sleep 3;
done

echo '[INFO] Database migration completed.';

# Start node server
echo 'Starting node server...';
npm start;
