#cd webapp && npm start
cd /home/pi/pirace/webapp
/home/pi/.config/versions/node/v10.16.1/bin/serve -s build &
chromium-browser --kiosk http://localhost:5000
