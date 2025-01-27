import { test } from "vitest";
import { FSWorld, assertVs, e } from "xsuite";

test("Test", async () => {
  using world = await FSWorld.start({ gasPrice: 0 });

  const wallet = await world.createWallet({
    address: { shard: 1 },
  });
  const contractA = await world.createContract({
    address: { shard: 1 },
    code: "file:output/contract.wasm",
  });
  const contractB = await world.createContract({
    address: { shard: 1 },
    code: "file:output/contract.wasm",
    balance: 10,
  });

  const { returnData } = await wallet.callContract({
    callee: contractA,
    funcName: "calls_then_back_transfers",
    funcArgs: [
      contractB,
      e.U(1),
      e.U(1),
    ],
    gasLimit: 10_000_000,
  });

  assertVs(returnData, [e.U(3)]);
});
