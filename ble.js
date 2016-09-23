
var myCharacteristic;
var position;

function log(str) {
  console.log(str);
}

function start() {
  var serviceUuid = '0xeb05';
  var characteristicUuid = '0xfff1';

  if (serviceUuid.startsWith('0x')) {
    serviceUuid = parseInt(serviceUuid);
  }

  if (characteristicUuid.startsWith('0x')) {
    characteristicUuid = parseInt(characteristicUuid);
  }

  log('Requesting Bluetooth Device...');
  navigator.bluetooth.requestDevice({filters: [{services: [serviceUuid]}]})
  .then(device => {
    log('Connecting to GATT Server...');
    return device.gatt.connect();
  })
  .then(server => {
    log('Getting Service...');
    return server.getPrimaryService(serviceUuid);
  })
  .then(service => {
    log('Getting Characteristic...');
    return service.getCharacteristic(characteristicUuid);
  })
  .then(characteristic => {
    myCharacteristic = characteristic;
    return myCharacteristic.startNotifications().then(_ => {
      log('> Notifications started');
      myCharacteristic.addEventListener('characteristicvaluechanged',
        handleNotifications);
    });
  })
  .catch(error => {
    log('Argh! ' + error);
  });
};

addEventListener('unload', function() {
  if (myCharacteristic) {
    myCharacteristic.stopNotifications()
    .then(_ => {
      log('> Notifications stopped');
      myCharacteristic.removeEventListener('characteristicvaluechanged',
        handleNotifications);
    })
    .catch(error => {
      log('Argh! ' + error);
    });
  }
});

let decoder = new TextDecoder();
function handleNotifications(event) {
  let value = event.target.value;

  let decoded = decoder.decode(value);
  console.log(decoded);

  let values = decoded.split(',');
  position = {
    x: values[0],
    y: values[1],
    z: values[2]
  };
}
