var phidget22 = require('phidget22');

var SERVER_PORT = 5661;

var swGreen = new phidget22.DigitalInput();
var swRed = new phidget22.DigitalInput();
var ledRed = new phidget22.DigitalOutput();
var ledGreen = new phidget22.DigitalOutput();

var motor1 = new phidget22.DCMotor();
var motor2 = new phidget22.DCMotor();

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

	//updateMotorVelocity(0, motor1);
	updateMotorVelocity(0, motor2);
}

function motorDetachHandler(ch) {
	console.log(ch + ' detached');
	clearInterval(exTimer);
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
	setupPhidgets();
}

function motorOpenError(err) {
	console.log('error');
	console.log('failed to open the channel:' + err);
}

//</DCMotor functions>


function runExample() {

	console.log('connected to server');

	//motor1.setChannel(0);
	motor2.setChannel(0);

	var exTimer;

	//motor1.onAttach = motorAttachHandler;
	//motor1.onDetach = motorDetachHandler;

	//motor1.onVelocityUpdate = onVelocityUpdate;
	//motor1.onBackEMFChange = onBackEMFChange;
	//motor1.onBrakingStrengthUpdate = onBrakingStrengthUpdate;

	//motor1.open().then(motorOpen).catch(motorOpenError);
	//motor1.onError = onError;

	motor2.onAttach = motorAttachHandler;
  motor2.onDetach = motorDetachHandler;

	motor2.onVelocityUpdate = onVelocityUpdate;
	motor2.onBackEMFChange = onBackEMFChange;
	motor2.onBrakingStrengthUpdate = onBrakingStrengthUpdate;

	motor2.open().then(motorOpen).catch(motorOpenError);
	motor2.onError = onError;
}

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

	var buttonPressedTargetVelocity = 0.5;

	if(this === swGreen) {
		buttonPressedTargetVelocity = -buttonPressedTargetVelocity;
	}

	if(state === true) {
			updateMotorVelocity(buttonPressedTargetVelocity, motor2);
	} else {
			updateMotorVelocity(0, motor2);
	}
}

function setupPhidgets() {
  console.log('Server connected');

  swGreen.setHubPort(2);
  swRed.setHubPort(3);
  ledRed.setHubPort(0);
  ledGreen.setHubPort(5);

  swGreen.setIsHubPortDevice(true);
  swRed.setIsHubPortDevice(true);
  ledRed.setIsHubPortDevice(true);
  ledGreen.setIsHubPortDevice(true);

  swGreen.onAttach = attachHandler;
  swRed.onAttach = attachHandler;
  ledRed.onAttach = attachHandler;
  ledGreen.onAttach = attachHandler;

  swGreen.onStateChange = stateChangeHandler;
  swRed.onStateChange = stateChangeHandler;

  swGreen.LED = ledGreen;
  swRed.LED = ledRed;

  swGreen.open();
  swRed.open();
  ledRed.open();
  ledGreen.open();

  console.log('finshed open');
}

console.log('connecting...');

if (require.main === module) {
	main();
}
