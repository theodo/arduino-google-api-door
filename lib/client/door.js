var net = require('net');
var config = require('../../config');

function open() {
    var client = new net.Socket();
    client.connect(config.DOOR_PORT, config.DOOR_IP, function() {
        console.log('Opening the Door');
        client.write(config.OPEN_MESSAGE + "\r");
    });

    client.on('data', function(data) {
        console.log('Receiving response : ' + data);

        if ("CLOSE\n" == data) {
            client.end();
        }
    });
}

exports.open = open;
