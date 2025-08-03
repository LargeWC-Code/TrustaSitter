#!/bin/bash
echo "Uninstalling TrustaSitter backend..."

# stop PM2
pm2 delete trustasitter-backend || true

# delete
sudo rm -rf /opt/TrustaSitter

# sudo apt-get remove -y nodejs npm
# sudo apt-get autoremove -y

echo "Uninstall complete!"
exit 0
