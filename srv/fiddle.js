const WebSocket = require('ws');

const readline = require('readline');
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

console.log('Waiting for clients...');
const wss = new WebSocket.Server({ port: 3030 });

let m1en = false;
let m2en = false;

wss.on('connection', ws => {
  console.log('Set up connection!');
  console.log('Press 1 or 2 to emulate buttons, or q to quit');
  const notifyClients = (cli, obj) => {
    cli.forEach(client => {
      if (/* client !== ws && */client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(obj));
      }
    });
  };

  const btn1 = (lvl) => {
    console.log('Button 1 pressed');
    notifyClients(wss.clients, { event: 'button', id: '1' });
    //if (m1en) machine1.pwmWrite(m1coeff);
  };

  const btn2 = (lvl) => {
    console.log('Button 2 pressed');
    notifyClients(wss.clients, { event: 'button', id: '2' });
    //if (m2en) machine2.pwmWrite(m2coeff);
  };

  const es1 = (lvl) => {
    console.log('Endstop 1 triggered');
    notifyClients(wss.clients, { event: 'button', id: '1' });
    //if (m1en) machine1.pwmWrite(m1coeff);
  };

  const es2 = (lvl) => {
    console.log('Endstop 2 triggered!');
    console.log(lvl);
    notifyClients(wss.clients, { event: 'button', id: '2' });
    //if (m2en) machine2.pwmWrite(m2coeff);
  };

  process.stdin.on('keypress', function (chunk, key) {
    //console.log('Get Chunk: ' + chunk + '\n');
    if (key && key.name == '1') btn1(wss.clients);
    if (key && key.name == '2') btn2(wss.clients);
    if (key && key.name == 'q') process.exit(0);
  });

  /* ws.on('message', data => {
    wss.clients.forEach(client => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }); */


  ws.on('message', data => {  // Sends data from single client to all others
    const msg = JSON.parse(data);
    console.log(msg);
    if (msg.event === 'enable') {
      if (msg.id === 1) m1en = true;
      if (msg.id === 2) m2en = true;
    }
    if (msg.event === 'disable') {
      if (msg.id === 1) m1en = false;
      if (msg.id === 2) m2en = false;
    }
    notifyClients(wss.clients, msg);
  });
  
  setInterval(() => {
    notifyClients(wss.clients, { event: 'keepAlive' });
  }, 5000); // */
});