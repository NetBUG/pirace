const WebSocket = require('ws');
const Gpio = require('pigpio').Gpio;

const readline = require('readline');
readline.emitKeypressEvents(process.stdin);
if (process.stdin.setRawMode) {
  process.stdin.setRawMode(true);
}

console.log('Waiting for clients...');
const wss = new WebSocket.Server({ port: 3030 });

const m1coeff = 255;
const m2coeff = 255;

const machine1 = new Gpio(20, {mode: Gpio.OUTPUT});
const machine2 =  new Gpio(21, {mode: Gpio.OUTPUT});
machine1.pwmWrite(0);
machine2.pwmWrite(0);

const button1 = new Gpio(22, {
  mode: Gpio.INPUT,
  pullUpDown: Gpio.PUD_DOWN,
  edge: Gpio.FALLING_EDGE, // FALLING_EGDE, EITHER_EDGE
});
const button2 = new Gpio(27, {
  mode: Gpio.INPUT,
  pullUpDown: Gpio.PUD_DOWN,
  edge: Gpio.RISING_EDGE,
}); // */
const endstop1 = new Gpio(19, {
  mode: Gpio.INPUT,
  pullUpDown: Gpio.PUD_DOWN,
  edge: Gpio.FALLING_EDGE,
});
const endstop2 = new Gpio(26, {
  mode: Gpio.INPUT,
  pullUpDown: Gpio.PUD_DOWN,
  edge: Gpio.FALLING_EDGE,
}); // */

let m1en = true;
let m2en = true;

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
  };

  const btn2 = (lvl) => {
    console.log('Button 2 pressed');
    notifyClients(wss.clients, { event: 'button', id: '2' });
  };

  const es1 = (lvl) => {
    console.log('Endstop 1 triggered');
    notifyClients(wss.clients, { event: 'button', id: '1' });
    machine1.digitalWrite(0);
    m1en = false;
    setTimeout(() => { m1en = true }, 5000);
  };

  const es2 = (lvl) => {
    console.log('Endstop 2 triggered!');
    notifyClients(wss.clients, { event: 'button', id: '2' });
    machine2.digitalWrite(0);
    m2en = false;
    setTimeout(() => { m2en = true }, 5000);
  };

  button1.on('interrupt', btn1);
  button2.on('interrupt', btn2); // */
  endstop1.on('interrupt', es1);
  endstop2.on('interrupt', es2);

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
    if (msg.event === 'enable') {
      if (msg.id === '1' && m1en) {
		console.log('Running machine 1!');
		machine1.digitalWrite(1);
		//machine1.pwmWrite(m1coeff);
  	  }
      if (msg.id === '2' && m2en) {
		console.log('Running machine 2!');
		//machine2.pwmWrite(m1coeff);
		machine2.pwmWrite(m2coeff);
	  }
    }
    if (msg.event === 'disable') {
      if (msg.id === '1') {
        machine1.digitalWrite(0);
      }
      if (msg.id === '2')  {
        machine2.digitalWrite(0);
      }
    }
    notifyClients(wss.clients, msg);
  });
  
  setInterval(() => {
    notifyClients(wss.clients, { event: 'keepAlive' });
  }, 5000); // */
});
