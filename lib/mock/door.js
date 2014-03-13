var net = require('net');
var config = require('../../config');

function onConnection(c) {
    console.log('Client connected');
    c.write("Hello I'm Theodo Door !\n");
    
    c.on('data', function(buffer) {
        var command = buffer.toString().replace(/\n$/, '').replace(/\r$/, '');
        console.log("Received : " + require('util').inspect(command));

        if ("exit" == command) {
            c.end();
        } else if (config.OPEN_MESSAGE == command) {
            c.write("OPEN\n");
            sleep(2000);
            c.write("CLOSE\n");        
        }
    });

    c.on('end', function() {
        console.log('Client disconnected');
    });
}

var server = net.createServer(onConnection).listen(config.DOOR_PORT);

function sleep(milliSeconds) {
    var startTime = new Date().getTime();
    while (new Date().getTime() < startTime + milliSeconds);
}
