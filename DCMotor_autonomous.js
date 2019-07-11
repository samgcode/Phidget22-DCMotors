var phidget22 = require('phidget22');

var SERVER_PORT = 5661;

var swGreen = new phidget22.DigitalInput();
var swRed = new phidget22.DigitalInput();
var ledRed = new phidget22.DigitalOutput();
var ledGreen = new phidget22.DigitalOutput();

var motor1 = new phidget22.DCMotor();
var motor2 = new phidget22.DCMotor();

var playerInput = '';

function main() {

	if (process.argv.length != 3) {
		console.log('usage: node DCMotor.js <server address>');
		process.exit(1);
	}
	var hostname = process.argv[2];

	console.log('connecting to:' + hostname);
	var conn = new phidget22.Connection(SERVER_PORT, hostname, { name: 'Server Connection', passwd: '' });
	conn.connect()
		.then(runExample)
		.catch(function (err) {
			console.error('Error running example:', err.message);
			process.exit(1);
	});
}



//<DCMotor functions>

function updateMotorVelocity(targetVelocity, motor) {
	motor.setTargetVelocity(targetVelocity);
}

function motorAttachHandler(ch) {
	console.log(ch + ' attached');

	updateMotorVelocity(0, ch);

	if(ch === motor2) {
		console.log('Press enter to setup');
	}
}

function motorDetachHandler(ch) {
	console.log(ch + ' detached');
}

function onVelocityUpdate(velocity) {
	//console.log('velocity:' + velocity + ' (' + this.getVelocity() + ')');
}

function onBackEMFChange(backEMF) {
	console.log('backEMF:' + backEMF + ' (' + this.getBackEMF() + ')');
}

function onBrakingStrengthUpdate(brakingStrength) {
	console.log('brakingStrength:' + brakingStrength + ' (' + this.getBrakingStrength() + ')');
}

function onError(code, description) {
	console.log('Code: ' + code)
	console.log('Description: ' + description)
}

function motorOpen(ch) {
	console.log('channel open');
}

function motorOpenError(err) {
	console.log('error');
	console.log('failed to open the channel:' + err);
}

//</DCMotor functions>


function runExample() {

	console.log('connected to server');

	motor1.setChannel(0);
	motor2.setChannel(1);

	var exTimer;

	motor1.onAttach = motorAttachHandler;
	motor1.onDetach = motorDetachHandler;

	motor1.onVelocityUpdate = onVelocityUpdate;
	motor1.onBackEMFChange = onBackEMFChange;
	motor1.onBrakingStrengthUpdate = onBrakingStrengthUpdate;

	motor1.open().then(motorOpen).catch(motorOpenError);
	motor1.onError = onError;

	motor2.onAttach = motorAttachHandler;
  motor2.onDetach = motorDetachHandler;

	motor2.onVelocityUpdate = onVelocityUpdate;
	motor2.onBackEMFChange = onBackEMFChange;
	motor2.onBrakingStrengthUpdate = onBrakingStrengthUpdate;

	motor2.open().then(motorOpen).catch(motorOpenError);
	motor2.onError = onError;

}

//<key inputs>

const readline = require('readline');

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

var input = '';


process.stdin.on('keypress', (str, key) => {
  if (key.ctrl && key.name === 'c') {
    process.exit();
  } else {
    input = key.name;
		detectButton(input);
  }
});

var motor1On = false;//right side
var motor2On = false;//left side
var motor1Direction = 1; //1=forward, -1=backwords
var motor2Direction = 1; //1=forward, -1=backwords

var motorSpeed = 0.5;

var isSetup = false;

function detectButton(input_) {
  switch (input_) {
		case 'return':
			if(isSetup == false) {
				setupPhidgets();
				isSetup = true;
			}
			break;
		case 'r':
			if(isSetup == true) {
				ledRed.setState(!ledRed.getState());
			}
			break;
		case 'up':
			motor1On = !motor1On;
			motor2On = !motor2On;
			motor1Direction = 1;
			motor2Direction = 1;
      break;
		case 'left':
			motor1On = !motor1On;
			motor2On = !motor2On;
			motor1Direction = 1;
			motor2Direction = -1;
      break;
		case 'down':
			motor1On = !motor1On;
			motor2On = !motor2On;
			motor1Direction = -1;
			motor2Direction = -1;
      break;
		case 'right':
			motor1On = !motor1On;
			motor2On = !motor2On;
			motor1Direction = -1;
			motor2Direction = 1;
			break;
		case 'w':
			motorSpeed += 0.1;
			break;
		case 's':
			motorSpeed -= 0.1;
			break;
		default:
			motor1On = false;
			motor2On = false;
  }
	if(motorSpeed >= 1) {
		motorSpeed = 1;
	} else if(motorSpeed <= 0) {
		motorSpeed = 0;
	}
	//input = '';
	updateMotors();
}

function updateMotors() {
		if(motor1On == true) {
			updateMotorVelocity(-motorSpeed * motor1Direction, motor1);
		} else {
			updateMotorVelocity(0, motor1);
		}
		if(motor2On == true) {
			updateMotorVelocity(motorSpeed * motor2Direction, motor2);0
		} else {
			updateMotorVelocity(0, motor2);
		}
}

//</key inputs>

//setup regular phidgets

function attachHandler(ch2) {
  console.log('ch connected', ch2 + " " + ch2.getHubPort());
}

function stateChangeHandler(state) {
  console.log('Port ' + this.getHubPort() + ': ' + state);
	//console.log(this.LED.isattached);
	if(this.LED.isattached === true) {
		this.LED.setState(state);
	}

}

function setupPhidgets() {
  console.log('Server connected');

  ledRed.setHubPort(0);

  ledRed.setIsHubPortDevice(true);

  ledRed.onAttach = attachHandler;

  // swGreen.onStateChange = stateChangeHandler;
  // swRed.onStateChange = stateChangeHandler;

  // swGreen.LED = ledGreen;
  // swRed.LED = ledRed;

  ledRed.open();

  console.log('finshed open');
}

console.log('connecting...');

if (require.main === module) {
	main();
}
