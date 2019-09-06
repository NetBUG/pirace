#cd webapp && npm start
export NVM_DIR="$HOME/.config"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
cd /home/pi/pirace/webapp
/home/pi/.config/versions/node/v10.16.1/bin/serve -s build > ../client.log 2>&1 &
sleep 3
chromium-browser --kiosk --app=http://localhost:5000
#chromium-browser http://localhost:5000 --disable-features=InfiniteSessionRestore
