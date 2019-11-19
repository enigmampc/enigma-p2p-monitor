# enigma-p2p-monitor

Monitor chatter on the Enigma network

# Usage

1. Run an `enigma-p2p` bootstrap node:

   ```bash
   git clone https://github.com/enigmampc/enigma-p2p.git
   cd enigma-p2p
   node src/cli/cli_app.js -n dns -i B1 -b B1 -p B1
   ```

   `B1` is [hard coded](https://github.com/enigmampc/enigma-p2p/blob/ada81f91111ec9f4a83c2abae21210776db54a4e/test/singleConfig/id-l.json) for debugging and testing purposes.

   It's libp2p ID is `QmcrQZ6RJdpYuGvZqD5QEHAv6qX4BrQLJLQPQUrTrzdcgm` and it [listens to port `tcp/10300`](https://github.com/enigmampc/enigma-p2p/blob/c30ed1e82853a793c9453a79efeb654ee77dec38/configs/debug.json#L2).

2. Run an `enigma-p2p-monitor` node:

   ```bash
   git clone https://github.com/enigmampc/enigma-p2p-monitor.git
   cd enigma-p2p-monitor
   node main.js "/ip4/127.0.0.1/tcp/10300/ipfs/QmcrQZ6RJdpYuGvZqD5QEHAv6qX4BrQLJLQPQUrTrzdcgm"
   ```

   It'll now connect to the `enigma-p2p` bootstrap node.

3. Inside the `enigma-p2p` bootstrap node terminal, execute:

   ```bash
   publish /broadcast/0.1 banana
   ```

4. Inside the `enigma-p2p-monitor` node you'll see:
   ![demo](/demo.gif)
