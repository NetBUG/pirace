const WebSocket = require('ws');
const Gpio = require('pigpio').Gpio;

const readline = require('readline');
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

const wss = new WebSocket.Server({ port: 3030 });

const m1coeff = 255;
const m2coeff = 255;

const machine1 = new Gpio(20, {mode: Gpio.OUTPUT});
const machine2 =  new Gpio(26, {mode: Gpio.OUTPUT});

const m1en = true; //false;
const m2en = true; //false;

const button1 = new Gpio(4, {
  mode: Gpio.INPUT,
  pullUpDown: Gpio.PUD_DOWN,
  edge: Gpio.RISING_EDGE, // FALLING_EGDE, EITHER_EDGE
});
const button2 = new Gpio(5, {
  mode: Gpio.INPUT,
  pullUpDown: Gpio.PUD_DOWN,
  edge: Gpio.RISING_EDGE,
}); // */

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

  const btn1 = (clients) => {
    notifyClients(clients, { event: 'button', id: '1' });
    if (m1en) machine1.pwmWrite(m1coeff);
  };

  const btn2 = (clients) => {
    notifyClients(clients, { event: 'button', id: '2' });
    if (m2en) machine2.pwmWrite(m2coeff);
  };

  button1.on('interrupt', (level) => {
    if (level === 0) log.error('WTF? Interrupt on falling edge?');
    btn1();
  });

  button2.on('interrupt', btn2); // */

  process.stdin.on('keypress', function (chunk, key) {
    //console.log('Get Chunk: ' + chunk + '\n');
    if (key && key.name == '1') btn1(wss.clients);
    if (key && key.name == '2') btn2(wss.clients);
    if (key && key.name == 'q') process.exit(0);
  });

  ws.on('message', data => {
    wss.clients.forEach(client => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  });


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