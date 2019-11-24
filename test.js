let { spawn, ChildProcess } = require("child_process");
const exec = require("util").promisify(require("child_process").exec);
const fs = require("fs");

let truffleDevelopProcess;
let account;

beforeAll(async () => {
  if (!fs.existsSync("/tmp/enigma-p2p/test/ethereum/scripts/build/contracts/Enigma.json")) {
    await exec(`rm -rf /tmp/enigma-p2p`);
    await exec(`git clone -b develop --single-branch https://github.com/enigmampc/enigma-p2p.git /tmp/enigma-p2p`);
    await exec(`npm install`, { cwd: "/tmp/enigma-p2p" });
    await exec(`npm install truffle`, { cwd: "/tmp/enigma-p2p" });
    await exec(`rm -rf build && npx truffle compile`, { cwd: "/tmp/enigma-p2p/test/ethereum/scripts" });
  }

  truffleDevelopProcess = spawn("npx", ["truffle", "develop"], { cwd: "/tmp/enigma-p2p/test/ethereum/scripts" });
  return new Promise(async resolve => {
    truffleDevelopProcess.stdout.on("data", async data => {
      data = data.toString().match(/\(0\) 0x[a-f0-9]+/);
      if (Array.isArray(data) && data.length === 1) {
        account = data[0].split(" ")[1];
        resolve();
      }
    });
  });
}, 120000);

let enigmaContractAddress;
beforeEach(async () => {
  enigmaContractAddress = (await exec(`npx truffle migrate`, { cwd: "/tmp/enigma-p2p/test/ethereum/scripts" })).stdout
    .trim()
    .match(/contract address:\s+0x[a-fA-f0-9]+/g)
    .slice(-1)[0]
    .split(/\s/)
    .slice(-1)[0];
  console.log(enigmaContractAddress);
}, 60000);

afterAll(async () => {
  await exec(`kill -KILL ${truffleDevelopProcess.pid}`);
});

test("connect to bootstrap", () => {
  return new Promise(resolve => {
    const bootstrap = spawn(
      "node",
      [
        "src/cli/cli_app.js",
        "-i",
        "B1",
        "-p",
        "B1",
        "--auto-init",
        "--mock-core",
        "--core",
        "127.0.0.1:3456",
        "--ethereum-address ",
        account,
        "--ethereum-contract-address",
        enigmaContractAddress
      ],
      { cwd: "/tmp/enigma-p2p" }
    );

    const monitor = spawn("node", [
      "main.js",
      "--bootstrap",
      "/ip4/127.0.0.1/tcp/10300/ipfs/QmcrQZ6RJdpYuGvZqD5QEHAv6qX4BrQLJLQPQUrTrzdcgm",
      "--enigma-contract-json-path",
      "/tmp/enigma-p2p/test/ethereum/scripts/build/contracts/Enigma.json",
      "--enigma-contract-address",
      enigmaContractAddress
    ]);

    monitor.stderr.on("data", async data => {
      data = data.toString();
      if (data.includes("peer:connect")) {
        expect(true).toBeTruthy();
        resolve();
      }
    });
  });
}, 60000);
