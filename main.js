#!/usr/bin/env node
const boostrapNodes = process.argv.slice(2);

boostrapNodes.forEach(n => {
  console.log("boostrap\t" + n);
});

const TCP = require("libp2p-tcp");
const Mplex = require("libp2p-mplex");
const KadDHT = require("libp2p-kad-dht");
const Bootstrap = require("libp2p-bootstrap");
const SECIO = require("libp2p-secio");
const SPDY = require("libp2p-spdy");
const WS = require("libp2p-websockets");
const PeerInfo = require("peer-info");
// const Gossipsub = require("libp2p-gossipsub");
// const FloodSub = require("libp2p-floodsub");
const defaultsDeep = require("@nodeutils/defaults-deep");

const { promisify } = require("util");

const libp2p = require("libp2p");

class MyBundle extends libp2p {
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
          // autoDial: true, // TODO check
          bootstrap: {
            interval: 2000,
            enabled: true,
            list: boostrapNodes
          }
        }
      }
    };

    super(defaultsDeep(_options, defaults));
  }
}

(async () => {
  const PeerInfoCreate = promisify(PeerInfo.create).bind(PeerInfo);
  const peerInfo = await PeerInfoCreate();
  // TODO catch PeerInfoCreate

  peerInfo.multiaddrs.add("/ip4/0.0.0.0/tcp/0");

  const node = new MyBundle({ peerInfo });

  const nodeStart = promisify(node.start).bind(node);
  await nodeStart();
  // No need to try/catch. Let it throw.

  console.log(`my_libp2p_id\t${node.peerInfo.id.toB58String()}`);

  node.on("peer:discovery", async peerInfo => {
    const nodeDial = promisify(node.dial).bind(node);
    await nodeDial(peerInfo);
    // No need to try/catch. Let it throw.
  });

  node.on("peer:connect", peerInfo => {
    console.log("peer:connect\t" + peerInfo.id.toB58String());

    node.pubsub.subscribe(
      "/taskresults/0.1",
      msg => {
        console.log("/taskresults/0.1", msg.from, msg.data.toString());
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
  });
})();
