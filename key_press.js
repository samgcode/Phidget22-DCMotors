const readline = require('readline');

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

var input = '';


process.stdin.on('keypress', (str, key) => {
  if (key.ctrl && key.name === 'c') {
    process.exit();
  } else {
    input = key.name;
    console.log(input);
  }
});

// function logInput() {
//   if(input !== '') {
//     console.log(input);
//     input = '';
//   }
// }
//
// setInterval(logInput, 1);
//
// var input = '';
//
// var term = require( 'terminal-kit' ).terminal ;
//
// term.grabInput() ;
//
// term.on( 'key' , function( name , matches , data ) {
//     console.log( "'key' event:" , name ) ;
//     input = name;
//
//     // Detect CTRL-C and exit 'manually'
//     if ( name === 'CTRL_C' ) { process.exit(); }
// });
//
// setInterval(logInput, 1);
