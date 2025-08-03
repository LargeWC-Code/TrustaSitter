#!/bin/bash
echo "Installing TrustaSitter backend..."

# copy local.js
sudo cp -f local.js /home/developer/local.js
sudo cp -f fullchain.pem /home/developer/fullchain.pem
sudo cp -f privkey.pem /home/developer/privkey.pem

# install Node.js and Git
sudo apt-get update -y
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs git

# download project to /opt
cd /opt
sudo git clone https://github.com/Bruno8006/TrustaSitter.git

cd TrustaSitter/trustasitter-backend

sudo chown -R developer:developer /opt/TrustaSitter

mkdir -p ssl
sudo cp -f /home/developer/local.js config/local.js
sudo cp -f /home/developer/fullchain.pem ssl/fullchain.pem
sudo cp -f /home/developer/privkey.pem ssl/privkey.pem

# install
sudo -u developer npm install
sudo -u developer npm update

# install and start PM2
sudo npm install -g pm2
sudo -u developer pm2 start ssl-server.js --name trustasitter-backend
sudo -u developer pm2 save
sudo -u developer pm2 startup

echo "Installation complete!"
exit 0
