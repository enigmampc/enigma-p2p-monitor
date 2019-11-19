const libp2p = require("libp2p");
const TCP = require("libp2p-tcp");
const Mplex = require("libp2p-mplex");
const KadDHT = require("libp2p-kad-dht");
const Bootstrap = require("libp2p-bootstrap");
const SECIO = require("libp2p-secio");
const SPDY = require("libp2p-spdy");
const WS = require("libp2p-websockets");
const defaultsDeep = require("@nodeutils/defaults-deep");

class LibP2pBundle extends libp2p {
  constructor(_options) {
    const defaults = {
      modules: {
        transport: [TCP, WS],
        streamMuxer: [Mplex, SPDY],
        peerDiscovery: [Bootstrap],
        // connEncryption: [SECIO],
        dht: KadDHT
      },
      config: {
        dht: {
          kBucketSize: 20
        },
        EXPERIMENTAL: {
          dht: true,
          pubsub: true
        },
        peerDiscovery: {
          bootstrap: {
            interval: 2000,
            enabled: true
          }
        }
      }
    };

    super(defaultsDeep(_options, defaults));
  }
}

module.exports = LibP2pBundle;
