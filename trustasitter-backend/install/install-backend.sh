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

mkdir -p ssl
sudo cp -f /home/developer/local.js config/local.js
sudo cp -f /home/developer/fullchain.pem ssl/fullchain.pem
sudo cp -f /home/developer/privkey.pem ssl/privkey.pem

# install
sudo npm install
sudo npm update

# install and start PM2
sudo npm install -g pm2
pm2 start index.js --name trustasitter-backend
pm2 save
pm2 startup

echo "Installation complete!"
exit 0
