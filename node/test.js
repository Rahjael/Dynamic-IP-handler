const IpHermes = require('./IpHermes').IpHermes;

const hermes = new IpHermes();


// hermes.startTrasmitting();


hermes.addService('BAD_SERVICE');

hermes.startMonitoring();