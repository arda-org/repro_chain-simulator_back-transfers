import { test } from "vitest";
import { FSWorld, assertVs, e } from "xsuite";

test("call_call_bt", async () => {
  using world = await FSWorld.start({ gasPrice: 0 });
  const { wallet, contractA, contractB } = await createAccounts(world);

  const { returnData } = await wallet.callContract({
    callee: contractA,
    funcName: "call_call_bt",
    funcArgs: [
      contractB,
      e.U(1),
      e.U(1),
    ],
    gasLimit: 10_000_000,
  });

  assertVs(returnData, [e.U(3)]);
});

test("call_bt_call_bt", async () => {
  using world = await FSWorld.start({ gasPrice: 0 });
  const { wallet, contractA, contractB } = await createAccounts(world);

  const { returnData } = await wallet.callContract({
    callee: contractA,
    funcName: "call_bt_call_bt",
    funcArgs: [
      contractB,
      e.U(1),
      e.U(1),
    ],
    gasLimit: 10_000_000,
  });

  assertVs(returnData, [e.U(1), e.U(2)]);
});

const createAccounts = async (world: FSWorld) => {
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
  return { wallet, contractA, contractB };
}
