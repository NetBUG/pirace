const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 3030 });

wss.on('connection', ws => {
  ws.on('message', data => {
    console.log(data);
    wss.clients.forEach(client => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  });
  setInterval(() => {
    wss.clients.forEach(client => {
      console.log('sending!');
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        console.log('ura!');
        client.send(JSON.stringify({ event: 'button', id: '1' }));
      }
    });  
  }, 5000);
});