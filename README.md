# Enigma P2P Network Monitor

Monitor chatter on the Enigma network.

[![Build Status](https://travis-ci.org/enigmampc/enigma-p2p-monitor.svg?branch=master)](https://travis-ci.org/enigmampc/enigma-p2p-monitor)

# CLI Options

```bash
$ node main.js --help
Usage: node main.js [options]

Options:
  --bootstrap: Comma separated list of bootstrap nodes libp2p multiaddr.
    (default: [])
  --enigma-contract-address: Ethereum address of the Enigma smart contract.
    (default: null)
  --enigma-contract-json-path: Path to the compiled JSON file of the Enigma smart contract.
    (default: null)
  --web3-provider: URL of the web3 provider.
    (default: "ws://localhost:9545")
```

# Usage Example

## 1. Clone the `enigma-p2p` repo & install dependencies:

```bash
git clone -b develop --single-branch https://github.com/enigmampc/enigma-p2p.git /tmp/enigma-p2p
cd /tmp/enigma-p2p
npm install

cd test/ethereum/scripts
rm -rf build
npx truffle compile
npx truffle develop
```

This will print to the screen an accounts list. We'll chose one and call it `$ETHEREUM_ACCOUNT`.
This is so that our workers will have gas to make transactions on the Ethereum blockchain (E.g. registering as a worker, deploying secret contracts, etc.)

## 2. In a new terminal, deploy the Enigma contract and get it's address:

```bash
cd /tmp/enigma-p2p/test/ethereum/scripts
npx truffle migrate 2>/dev/null | grep -A 4 "Replacing 'Enigma'" | grep 'contract address' | awk '{print $NF}'
```

This will deploy and print to the screen the Enigma contract address on the Ethereum blockchain.
Lets call it `$ENIGMA_CONTRACT_ADDRESS`.

## 3. Run an `enigma-p2p` worker which is also a bootstrap node:

```bash
cd /tmp/enigma-p2p
node src/cli/cli_app.js -i B1 -p B1 --auto-init --mock-core --core 127.0.0.1:3456 --ethereum-address "$ETHEREUM_ACCOUNT" --ethereum-contract-address "$ENIGMA_CONTRACT_ADDRESS"
```

Note:

> `B1` is [hard coded](https://github.com/enigmampc/enigma-p2p/blob/ada81f91111ec9f4a83c2abae21210776db54a4e/test/singleConfig/id-l.json) for debugging and testing purposes.
> It's libp2p ID is `QmcrQZ6RJdpYuGvZqD5QEHAv6qX4BrQLJLQPQUrTrzdcgm` and it [listens to port `tcp/10300`](https://github.com/enigmampc/enigma-p2p/blob/c30ed1e82853a793c9453a79efeb654ee77dec38/configs/debug.json#L2).

Note:

> To skip the next step we could also run the bootstrap node with `--lonely-node`, which'll make it register without waiting for another node in the network.

## 4. In a new terminal, Run another `enigma-p2p` worker and connect it with the bootstrap node:

```bash
cd /tmp/enigma-p2p
node src/cli/cli_app.js -b "/ip4/127.0.0.1/tcp/10300/ipfs/QmcrQZ6RJdpYuGvZqD5QEHAv6qX4BrQLJLQPQUrTrzdcgm" --auto-init --mock-core --core 127.0.0.1:3456 --ethereum-address "$ETHEREUM_ACCOUNT" --ethereum-contract-address "$ENIGMA_CONTRACT_ADDRESS"
```

Note:

> It's also possible to use `-b B1` instead of `-b "/ip4/127.0.0.1/tcp/10300/ipfs/QmcrQZ6RJdpYuGvZqD5QEHAv6qX4BrQLJLQPQUrTrzdcgm"`.

Note:

> To skip this step we could also run the bootstrap node with `--lonely-node`, which'll make it register without waiting for another node in the network.

## 5. In a new terminal, Run an `enigma-p2p-monitor` node:

```bash
git clone https://github.com/enigmampc/enigma-p2p-monitor.git /tmp/enigma-p2p-monitor
cd /tmp/enigma-p2p-monitor
yarn install
node main.js --bootstrap "/ip4/127.0.0.1/tcp/10300/ipfs/QmcrQZ6RJdpYuGvZqD5QEHAv6qX4BrQLJLQPQUrTrzdcgm"  --enigma-contract-json-path "/tmp/enigma-p2p/test/ethereum/scripts/build/contracts/Enigma.json" --enigma-contract-address "$ENIGMA_CONTRACT_ADDRESS"
```

It'll now connect to the `enigma-p2p` bootstrap node.

## 6. Inside one of the `enigma-p2p` workers terminal, run:

```bash
broadcast banana
```

```bash
broadcast papaya
```

## 7. Inside the `enigma-p2p-monitor` node you'll see:

![demo](/demo.gif)
