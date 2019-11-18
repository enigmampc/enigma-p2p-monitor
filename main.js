#!/usr/bin/env node
const [boostrapNodeAddress] = process.argv.slice(process.argv.length - 1);

console.log("boostrap:", boostrapNodeAddress);

const TCP = require("libp2p-tcp");
const Mplex = require("libp2p-mplex");
const KadDHT = require("libp2p-kad-dht");
const Bootstrap = require("libp2p-bootstrap");
const SPDY = require("libp2p-spdy");
const WS = require("libp2p-websockets");
const PeerInfo = require("peer-info");
// const Gossipsub = require("libp2p-gossipsub");
// const FloodSub = require("libp2p-floodsub");
const defaultsDeep = require("@nodeutils/defaults-deep");

const libp2p = require("libp2p");

class MyBundle extends libp2p {
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
          kBucketSize: 20
        },
        EXPERIMENTAL: {
          dht: true,
          pubsub: true
        },
        peerDiscovery: {
          bootstrap: {
            interval: 2000,
            enabled: true,
            list: [boostrapNodeAddress]
          }
        }
      }
    };

    super(defaultsDeep(_options, defaults));
  }
}

PeerInfo.create((err, peerInfo) => {
  if (err) {
    throw err;
  }

  peerInfo.multiaddrs.add("/ip4/0.0.0.0/tcp/0");

  const node = new MyBundle({
    peerInfo,
    config: {
      peerDiscovery: {
        bootstrap: {
          enabled: true,
          list: [boostrapNodeAddress]
        }
      }
    }
  });

  node.start(err => {
    if (err) {
      throw err;
    }
    console.log("my id:", node.peerInfo.id.toB58String());

    node.once("peer:discovery", peerInfo => {
      console.log("peer:discovery", peerInfo.id.toB58String());
      node.dial(peerInfo, (err, conn) => {
        if (err) {
          throw err;
        }
      });
    });

    node.on("peer:connect", peerInfo => {
      console.log("peer:connect", peerInfo.id.toB58String());

      node.pubsub.subscribe(
        "/taskresults/0.1",
        msg => {
          console.log("/taskresults/0.1", msg);
        },
        () => {}
      );

      node.pubsub.subscribe(
        "/broadcast/0.1",
        msg => {
          console.log("/broadcast/0.1", msg.from, msg.data.toString());
        },
        () => {}
      );

      node.pubsub.publish("/broadcast/0.1", Buffer.from("some msg"), err => {
        if (err) {
          console.log("erro publish /broadcast/0.1", err);
          return;
        }

        console.log("publish /broadcast/0.1");
      });
    });
  });
});
