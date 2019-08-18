git pull
export NVM_DIR="$HOME/.config"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
nvm use lts/dubnium
sudo `which node` srv/server.js &
cd webapp && npm run build
serve -s build &
x-www-browser http://localhost:5000