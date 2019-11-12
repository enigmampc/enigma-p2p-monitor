#!/usr/bin/env node
const [boostrapNodeAddress] = process.argv.slice(process.argv.length - 1);

console.log(boostrapNodeAddress);

const libp2p = require("libp2p");
const TCP = require("libp2p-tcp");
const Mplex = require("libp2p-mplex");
const KadDHT = require("libp2p-kad-dht");
const defaultsDeep = require("@nodeutils/defaults-deep");
const Bootstrap = require("libp2p-bootstrap");
const SPDY = require("libp2p-spdy");
const WS = require("libp2p-websockets");

class EnigmaP2pNode extends libp2p {
  constructor(_options) {
    const defaults = {
      modules: {
        transport: [TCP, WS],
        streamMuxer: [Mplex, SPDY],
        peerDiscovery: [Bootstrap],
        dht: KadDHT
      },
      config: {
        dht: {
          kBucketSize: 5
        },
        EXPERIMENTAL: {
          dht: true,
          pubsub: true
        },
        peerDiscovery: {
          bootstrap: {
            interval: 2000,
            enabled: false,
            list: []
          }
        }
      }
    };
    const finalConfigurations = defaultsDeep(_options, defaults);
    super(finalConfigurations);
  }
}

const monitorNode = new EnigmaP2pNode({
  peerInfo,
  config: {
    peerDiscovery: {
      bootstrap: {
        enabled: this.isDiscover,
        list: [boostrapNodeAddress]
      }
    }
  }
});
