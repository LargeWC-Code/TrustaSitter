#!/bin/bash
echo "Updating TrustaSitter backend..."

cd /opt/TrustaSitter/trustasitter-backend || exit 1

# update to new version
sudo git reset --hard
sudo git pull origin main

# install
sudo -u developer npm install
sudo -u developer npm update

# restart PM2
sudo -u developer pm2 restart trustasitter-backend || pm2 start ssl-server.js --name trustasitter-backend

echo "Update complete!"
exit 0
