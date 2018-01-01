"use strict";

const EventEmitter = require('events').EventEmitter;
const mdns = require('mdns');

class DacpBrowser extends EventEmitter {

  constructor(log) {
    super();

    this.log = log;
  }

  start() {
    this.log('Starting DACP browser...');

    this._browser = mdns.createBrowser(
      mdns.tcp(this._serviceName),
      { resolverSequence: this._resolverSequence });

    this._browser.on('serviceUp', service => {
      this.emit('serviceUp', service);
    });

    this._browser.on('serviceDown', service => {
      this.emit('serviceDown', service);
    });

    this._browser.on('error', error => {
      this.emit('error', error);

      this.stop();
    });

    this._browser.start();
  }

  stop() {
    if (this._browser) {
      this._browser.stop();
      this._browser = undefined;
    }
  }
};

DacpBrowser.prototype._serviceName = 'touch-able';

DacpBrowser.prototype._resolverSequence = [
  mdns.rst.DNSServiceResolve(),
  'DNSServiceGetAddrInfo' in mdns.dns_sd ? mdns.rst.DNSServiceGetAddrInfo() : mdns.rst.getaddrinfo({ families: [0] }),
  mdns.rst.makeAddressesUnique()
];

module.exports = DacpBrowser;
