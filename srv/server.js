const WebSocket = require('ws');
const Gpio = require('pigpio').Gpio;
const fs = require('fs');

const readline = require('readline');
readline.emitKeypressEvents(process.stdin);
if (process.stdin.setRawMode) {
  process.stdin.setRawMode(true);
}

writeFile('=== RESTART SERVER === ');
console.log('Waiting for clients...');
const wss = new WebSocket.Server({ port: 3030 });

const m1coeff = 255;
const m2coeff = 255;
let m0 = false;
let m1 = false;

const machine1 = new Gpio(20, {mode: Gpio.OUTPUT});
const machine2 =  new Gpio(21, {mode: Gpio.OUTPUT});
machine1.pwmWrite(0);
machine2.pwmWrite(0);

const button1 = new Gpio(22, {
  mode: Gpio.INPUT,
  pullUpDown: Gpio.PUD_DOWN,
  edge: Gpio.RISING_EDGE, // FALLING_EGDE, EITHER_EDGE
  alert: true,
});
const button2 = new Gpio(27, {
  mode: Gpio.INPUT,
  pullUpDown: Gpio.PUD_DOWN,
  edge: Gpio.FALLING_EDGE,
  alert: true,
}); // */
const endstop1 = new Gpio(19, {
  mode: Gpio.INPUT,
  pullUpDown: Gpio.PUD_DOWN,
  edge: Gpio.FALLING_EDGE,
  alert: true,
});
const endstop2 = new Gpio(26, {
  mode: Gpio.INPUT,
  pullUpDown: Gpio.PUD_DOWN,
  edge: Gpio.FALLING_EDGE,
  alert: true,
}); // */
button1.glitchFilter(60000);
button2.glitchFilter(60000);
endstop1.glitchFilter(20000);
endstop2.glitchFilter(20000);

let m1en = true;
let m2en = true;

function dateFormat (date, fstr, utc = false) {
  utc = utc ? 'getUTC' : 'get';
  return fstr.replace (/%[YmdHMS]/g, function (m) {
    switch (m) {
    case '%Y': return date[utc + 'FullYear'] (); // no leading zeros required
    case '%m': m = 1 + date[utc + 'Month'] (); break;
    case '%d': m = date[utc + 'Date'] (); break;
    case '%H': m = date[utc + 'Hours'] (); break;
    case '%M': m = date[utc + 'Minutes'] (); break;
    case '%S': m = date[utc + 'Seconds'] (); break;
    default: return m.slice (1); // unknown code, remove %
    }
    // add leading zero if required
    return ('0' + m).slice (-2);
  });
}

function writeFile(str) {
  const ts = dateFormat (new Date (), "%d/%m %H:%M:%S")
  fs.appendFileSync('raceHistory.txt', `${ts} \t${str}\n`);
}

function writeLog(msg) {
  writeFile(`Race ended	P1(left): ${msg.left}	P2(right): ${msg.right}`);
}

wss.on('connection', ws => {
  console.log('Set up connection!');
  writeFile('=== CONNECTED CLIENT === ');
  console.log('Press 1 or 2 to emulate buttons, or q to quit');
  const notifyClients = (cli, obj) => {
    cli.forEach(client => {
      if (/* client !== ws && */client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(obj));
      }
    });  
  };

  const btn1 = (lvl) => {
	if (m0) {
	  console.log('BTN1 debounce');
	  return;
	}
    console.log('Button 1 pressed');
    notifyClients(wss.clients, { event: 'button', id: '1' });
  };

  const btn2 = (lvl) => {
	if (m1) {
	  console.log('BTN1 debounce');
	  return;
	}
    console.log('Button 2 pressed');
    notifyClients(wss.clients, { event: 'button', id: '2' });
  };

  const es1 = (lvl) => {
    console.log('Endstop 1 triggered');
    notifyClients(wss.clients, { event: 'endstop', id: '1' });
    machine1.digitalWrite(0);
    m0 = false;
    m1en = false;
    setTimeout(() => { m1en = true }, 5000);
  };

  const es2 = (lvl) => {
    console.log('Endstop 2 triggered!');
    notifyClients(wss.clients, { event: 'endstop', id: '2' });
    machine2.digitalWrite(0);
    m1 = false;
    m2en = false;
    setTimeout(() => { m2en = true }, 5000);
  };

  button1.on('alert', btn1);
  button2.on('alert', btn2); // */
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
		console.log('Running machine 1!', m1en ? 'OK' : 'TIMED OUT');
		machine1.digitalWrite(1);
		m0 = true;
		//machine1.pwmWrite(m1coeff);
  	  }
      if (msg.id === '2' && m2en) {
		console.log('Running machine 2!', m2en ? 'OK' : 'TIMED OUT');
		//machine2.pwmWrite(m1coeff);
		m1 = true;
		machine2.pwmWrite(m2coeff);
	  }
    }
    if (msg.event === 'disable') {
      if (msg.id === '1') {
        machine1.digitalWrite(0);
        m0 = false;
      }
      if (msg.id === '2')  {
        machine2.digitalWrite(0);
        m1 = false;
      }
    }
    if (msg.event === 'log') {
      writeLog(msg);
    }
    // notifyClients(wss.clients, msg);
  });
  
  setInterval(() => {
    notifyClients(wss.clients, { event: 'keepAlive' });
  }, 5000); // */
});
