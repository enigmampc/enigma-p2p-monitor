#!/usr/bin/env node
const [boostrapNodeAddress] = process.argv.slice(process.argv.length - 1);

console.log(boostrapNodeAddress);

const TCP = require("libp2p-tcp");
const Mplex = require("libp2p-mplex");
const KadDHT = require("libp2p-kad-dht");
const Bootstrap = require("libp2p-bootstrap");
const SPDY = require("libp2p-spdy");
const WS = require("libp2p-websockets");
const PeerInfo = require("peer-info");

const { createLibp2p } = require("libp2p");

createLibp2p(
  {
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
      // EXPERIMENTAL: {
      //   dht: true,
      //   pubsub: true
      // },
      peerDiscovery: {
        bootstrap: {
          interval: 2000,
          enabled: false,
          list: [boostrapNodeAddress]
        }
      }
    }
  },
  (err, libp2p) => {
    if (err) {
      throw err;
    }
    libp2p.start(err => {
      if (err) {
        throw err;
      }
      console.log("here");
    });
  }
);
