#!/usr/bin/env node

const path = require("path");
const LibP2pBundle = require(path.join(__dirname, "libp2p-bundle.js"));
const PeerInfo = require("peer-info");
const { promisify } = require("util");
const flags = require("flags");

flags.defineStringList("bootstrap", []);
flags.defineString("enigma-contract-address", null);

flags.parse();

const enigmaContractAddress = flags.get("enigma-contract-address");
const web3 = !enigmaContractAddress
  ? null
  : (() => {
      const Web3 = require("web3");
      const web3Provider = new Web3.providers.WebsocketProvider("ws://127.0.0.1:9545");
      return new Web3(web3Provider);
    })();

const boostrapNodes = flags.get("bootstrap");
for (const node of boostrapNodes) {
  console.error("boostrap_node\t" + node);
}

(async () => {
  const PeerInfoCreate = promisify(PeerInfo.create).bind(PeerInfo);
  const peerInfo = await PeerInfoCreate(); // No need to try/catch. Let it throw.
  peerInfo.multiaddrs.add("/ip4/0.0.0.0/tcp/0");

  const node = new LibP2pBundle({
    peerInfo,
    config: {
      peerDiscovery: {
        bootstrap: {
          list: boostrapNodes
        }
      }
    }
  });

  const nodeStart = promisify(node.start).bind(node);
  await nodeStart(); // No need to try/catch. Let it throw.

  console.error(`my_libp2p_id\t${node.peerInfo.id.toB58String()}`);

  for (const multiaddr of node.peerInfo.multiaddrs.toArray()) {
    console.error(`my_multiaddr\t${multiaddr.toString()}`);
  }

  const nodeDial = promisify(node.dial).bind(node);
  node.on("peer:discovery", async peerInfo => {
    try {
      await nodeDial(peerInfo);
    } catch (e) {
      // Discovered a peer but couldn't connect.
      // Will try again in ${peerDiscovery.bootstrap.interval}ms time
    }
  });

  node.on("peer:connect", peerInfo => {
    console.error("peer:connect\t" + peerInfo.id.toB58String());
  });

  node.on("peer:disconnect", peerInfo => {
    console.error("peer:disconnect\t" + peerInfo.id.toB58String());
  });

  const topics = ["/taskresults/0.1", "/broadcast/0.1"];

  for (const topic of topics) {
    node.pubsub.subscribe(
      topic,
      msg => {
        console.log(
          JSON.stringify({
            date: new Date().toJSON(),
            libp2p_sender: msg.from,
            msg: JSON.parse(msg.data.toString())
          })
        );
      },
      () => {}
    );
  }

  // setInterval(async () => {
  //   const x = await promisify(node.pubsub.peers)("/broadcast/0.1");
  //   // This only gets from neighbors
  //   // Need to find a way to get from evry node

  //   console.log(new Date().toJSON(), x.length);
  // }, 1000);
})();
