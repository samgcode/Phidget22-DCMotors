var phidget22 = require('phidget22');

var SERVER_PORT = 5661;

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

function runExample() {

	console.log('connected to server');
	var ch = new phidget22.DCMotor();
	ch.setChannel(1);
	ch.setHubPort(1);

	var exTimer;

	function updateVelocity() {
		// var newVelocity = ch.getTargetVelocity() + 0.5;
		var newVelocity = 0.10;
		// if (newVelocity > 1)
		// 	newVelocity = -1;
		console.log('Setting velocity to ' + newVelocity + ' for 5 seconds...');
		ch.setTargetVelocity(newVelocity);
	}

	ch.onAttach = function (ch) {
		console.log(ch + ' attached');
		exTimer = setInterval(function () { updateVelocity() }, 5000);
	};

	ch.onDetach = function (ch) {
		console.log(ch + ' detached');
		clearInterval(exTimer);
	};

	ch.onVelocityUpdate = function (velocity) {
		console.log('velocity:' + velocity + ' (' + this.getVelocity() + ')');
	};

	ch.onBackEMFChange = function (backEMF) {
		console.log('backEMF:' + backEMF + ' (' + this.getBackEMF() + ')');
	};

	ch.onBrakingStrengthUpdate = function (brakingStrength) {
		console.log('brakingStrength:' + brakingStrength + ' (' + this.getBrakingStrength() + ')');
	};

	ch.open().then(function (ch) {
		console.log('channel open');
	}).catch(function (err) {
		console.log('failed to open the channel:' + err);
	});

	ch.onError = function (code, description) {
    console.log('Code: ' + code)
    console.log('Description: ' + description)
	};

}

if (require.main === module) {
	main();
}
