#!/bin/bash
echo "Updating TrustaSitter backend..."

cd /opt/TrustaSitter/trustasitter-backend || exit 1

# update to new version
sudo git reset --hard
sudo git pull origin main

# install
sudo npm install
sudo npm update

# restart PM2
pm2 restart trustasitter-backend || pm2 start index.js --name trustasitter-backend

echo "Update complete!"
exit 0
