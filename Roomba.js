var phidget22 = require('phidget22');

var SERVER_PORT = 5661;

var swGreen = new phidget22.DigitalInput();
var swRed = new phidget22.DigitalInput();
var ledRed = new phidget22.DigitalOutput();
var ledGreen = new phidget22.DigitalOutput();

var motor1 = new phidget22.DCMotor();
var motor2 = new phidget22.DCMotor();

var sonar = new phidget22.DistanceSensor();

var wallMinDistance = 200;

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
		setTimeout(setupBasicPhidgets, 5000);
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



//<sonar functions>

function onSonarAttach (ch) {
	console.log(ch + ' attached');
	console.log('Min Distance:' + ch.getMinDistance());
	console.log('Max Distance:' + ch.getMaxDistance());
}

function onSonarDetach (ch) {
	console.log(ch + ' detached');
}

function onDistanceChange (distance) {
	if(distance <= 50) {
		motor1On = false;
		motor2On = false;
	} else if (distance <= wallMinDistance) {
		wallInMinDistance();
	}
	console.log('distance:' + distance + ' (' + this.getDistance() + ')');
}

function wallInMinDistance() {
	reverse();
	setTimeout(turn, 500);
	setTimeout(forward, 3000);
}

function onSonarReflectionsUpdate (distances, amplitudes, count) {
	// console.log('Distance | Amplitude');
	// for (var i = 0; i < count; i++)
	// 	console.log(distances[i] + '\t | ' + amplitudes[i]);
}

function sonarOpen (ch) {
	console.log('channel open');
}

function sonarOpenError (err) {
	console.log('failed to open the channel:' + err);
}

//</sonar funnctions>




function runExample() {

	console.log('connected to server');

	motor1.setChannel(0);
	motor2.setChannel(1);

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

	sonar.onAttach = onSonarAttach;
	sonar.onDetach = onSonarDetach;
	sonar.onDistanceChange = onDistanceChange;
	sonar.onSonarReflectionsUpdate = onSonarReflectionsUpdate;

	sonar.open().then(sonarOpen).catch(sonarOpenError);

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

var setup = false;

function detectButton(input_) {
  switch (input_) {
		case 'return':
			//setupBasicPhidgets();
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
	updateMotor(motor1, motor1Direction, motor1On);
	updateMotor(motor2, -motor2Direction, motor2On);
}

function updateMotor(motor, direction, isOn) {
		if(isOn == true) {
			updateMotorVelocity(-motorSpeed * direction, motor);
		} else {
			updateMotorVelocity(0, motor);
		}
}

function forward() {
	motorSpeed = 1;
	motor1Direction = 1;
	motor2Direction = 1;
	updateMotor(motor1, motor1Direction, motor1On);
	updateMotor(motor2, -motor2Direction, motor2On);
}

function reverse() {
	motor1Direction = -1;
	motor2Direction = -1;
	updateMotor(motor1, motor1Direction, motor1On);
	updateMotor(motor2, -motor2Direction, motor2On);
}

function turn() {
	motor1Direction = -1;
	motor2Direction = 1;
	updateMotor(motor1, motor1Direction, motor1On);
	updateMotor(motor2, -motor2Direction, motor2On);
}

//</key inputs>

function startRoomba(led) {
	led.setState(false);
	motor1On = !motor1On;
	motor2On = !motor2On;
	forward();
}

//setup regular phidgets

function attachHandler(ch2) {
  console.log('ch connected', ch2 + " " + ch2.getHubPort());
	if(ch2 === ledRed) {
		ch2.setState(true);
		setup = true;
	}
}

function stateChangeHandler(state) {
  console.log('Port ' + this.getHubPort() + ': ' + state);
	if(setup == true) {
		//console.log(this.LED.isattached);
		if(this.LED.isattached === true) {
			if(state == true) {
				startRoomba(this.LED);
			}
		}
	}
}

function setupBasicPhidgets() {
  console.log('Server connected');

  ledRed.setHubPort(2);
	swRed.setHubPort(0);

  ledRed.setIsHubPortDevice(true);
	swRed.setIsHubPortDevice(true);

  ledRed.onAttach = attachHandler;
	swRed.onAttach = attachHandler;

  swRed.onStateChange = stateChangeHandler;

  swRed.LED = ledRed;

  ledRed.open();
	swRed.open();

	//ledRed.setState(true);

  console.log('finshed open');
}

console.log('connecting...');

if (require.main === module) {
	main();
}
