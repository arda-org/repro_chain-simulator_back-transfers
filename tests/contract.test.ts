import { test } from "vitest";
import { FSWorld, assertAccount, assertVs, e } from "xsuite";

test("🔴 call_call_bt", async () => {
  using world = await FSWorld.start({ gasPrice: 0 });
  const wallet = await world.createWallet({
    address: { shard: 1 },
  });
  const contractA = await world.createContract({
    address: { shard: 1 },
    code: wasmCode,
  });
  const contractB = await world.createContract({
    address: { shard: 1 },
    code: wasmCode,
    balance: egldUnit,
  });

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

test("🔴 call_bt_call_bt", async () => {
  using world = await FSWorld.start({ gasPrice: 0 });
  const wallet = await world.createWallet({
    address: { shard: 1 },
  });
  const contractA = await world.createContract({
    address: { shard: 1 },
    code: wasmCode,
  });
  const contractB = await world.createContract({
    address: { shard: 1 },
    code: wasmCode,
    balance: egldUnit,
  });

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

test("SC A calls SC B, different shards, async v1. SC B sends back EGLD", async () => {
	using world = await FSWorld.start();

	const { wallet, contractA, contractB } = await createCrossAccounts(world);

	await wallet.callContract({
		callee: contractA,
		funcName: "call_send_back_async_v1",
		funcArgs: [
			contractB,
			e.List(e.Tuple(e.Str("EGLD"), e.U64(0), e.U(1))),
		],
		gasLimit: 100_000_000,
	});

	assertAccount(await contractB.getAccount(), {
		balance: 0,
	});
	assertAccount(await contractA.getAccount(), {
		balance: 1,
	});
});

test("SC A calls SC B, different shards, async v1. SC B sends back FFT", async () => {
	using world = await FSWorld.start();

	const { wallet, contractA, contractB } = await createCrossAccounts(world);

	await wallet.callContract({
		callee: contractA,
		funcName: "call_send_back_async_v1",
		funcArgs: [
			contractB,
			e.List(e.Tuple(e.Str(tokenId), e.U64(0), e.U(1))),
		],
		gasLimit: 100_000_000,
	});

	assertAccount(await contractB.getAccount(), {
		kvs: {
			esdts: [
				{ id: tokenId, amount: 0 },
				{ id: tokenId, nonce: 1, amount: 1 },
			],
		},
	});
	assertAccount(await contractA.getAccount(), {
		kvs: { esdts: [{ id: tokenId, amount: 1 }] },
	});
});

test("SC A calls SC B, different shards, async v1. SC B sends back SFT", async () => {
	using world = await FSWorld.start();

	const { wallet, contractA, contractB } = await createCrossAccounts(world);

	await wallet.callContract({
		callee: contractA,
		funcName: "call_send_back_async_v1",
		funcArgs: [
			contractB,
			e.List(e.Tuple(e.Str(tokenId), e.U64(1), e.U(1))),
		],
		gasLimit: 100_000_000,
	});

	assertAccount(await contractB.getAccount(), {
		kvs: {
			esdts: [
				{ id: tokenId, amount: 1 },
				{ id: tokenId, nonce: 1, amount: 0 },
			],
		},
	});
	assertAccount(await contractA.getAccount(), {
		kvs: { esdts: [{ id: tokenId, nonce: 1, amount: 1 }] },
	});
});

test("🔴 SC A calls SC B, different shards, async v1. SC B sends back EGLD+FFT", async () => {
	using world = await FSWorld.start();

	const { wallet, contractA, contractB } = await createCrossAccounts(world);

	await wallet
		.callContract({
			callee: contractA,
			funcName: "call_send_back_async_v1",
			funcArgs: [
				contractB,
				e.List(
					e.Tuple(e.Str("EGLD"), e.U64(0), e.U(1)),
					e.Tuple(e.Str(tokenId), e.U64(0), e.U(1)),
				),
			],
			gasLimit: 100_000_000,
		})
		.assertFail({
			code: "returnMessage",
			message: "sending value to non payable contract",
		});

	// assertAccount(await contractB.getAccount(), {
	// 	balance: 1,
	// 	kvs: {
	// 		esdts: [
	// 			{ id: tokenId, amount: 0 },
	// 			{ id: tokenId, nonce: 1, amount: 1 },
	// 		],
	// 	},
	// });
	// assertAccount(await contractA.getAccount(), {
	// 	balance: 0,
	// 	kvs: { esdts: [{ id: tokenId, amount: 1 }] },
	// });
});

test("🔴 SC A calls SC B, different shards, async v1. SC B sends back EGLD+SFT", async () => {
	using world = await FSWorld.start();

	const { wallet, contractA, contractB } = await createCrossAccounts(world);

	await wallet
		.callContract({
			callee: contractA,
			funcName: "call_send_back_async_v1",
			funcArgs: [
				contractB,
				e.List(
					e.Tuple(e.Str("EGLD"), e.U64(0), e.U(1)),
					e.Tuple(e.Str(tokenId), e.U64(1), e.U(1)),
				),
			],
			gasLimit: 100_000_000,
		})
		.assertFail({
			code: "returnMessage",
			message: "sending value to non payable contract",
		});

	// assertAccount(await contractB.getAccount(), {
	// 	balance: 1,
	// 	kvs: {
	// 		esdts: [
	// 			{ id: tokenId, amount: 1 },
	// 			{ id: tokenId, nonce: 1, amount: 0 },
	// 		],
	// 	},
	// });
	// assertAccount(await contractA.getAccount(), {
	// 	balance: 0,
	// 	kvs: { esdts: [{ id: tokenId, nonce: 1, amount: 1 }] },
	// });
});

test("🔴 SC A calls SC B, different shards, async v1. SC B sends back FFT+EGLD", async () => {
	using world = await FSWorld.start();

	const { wallet, contractA, contractB } = await createCrossAccounts(world);

	await wallet
		.callContract({
			callee: contractA,
			funcName: "call_send_back_async_v1",
			funcArgs: [
				contractB,
				e.List(
					e.Tuple(e.Str(tokenId), e.U64(0), e.U(1)),
					e.Tuple(e.Str("EGLD"), e.U64(0), e.U(1)),
				),
			],
			gasLimit: 100_000_000,
		})
		.assertFail({
			code: "returnMessage",
			message: "sending value to non payable contract",
		});

	// assertAccount(await contractB.getAccount(), {
	// 	balance: 0,
	// 	kvs: {
	// 		esdts: [
	// 			{ id: tokenId, amount: 1 },
	// 			{ id: tokenId, nonce: 1, amount: 1 },
	// 		],
	// 	},
	// });
	// assertAccount(await contractA.getAccount(), {
	// 	balance: 1,
	// 	kvs: { esdts: [{ id: tokenId, amount: 0 }] },
	// });
});

test("🔴 SC A calls SC B, different shards, async v1. SC B sends back FFT+SFT", async () => {
	using world = await FSWorld.start();

	const { wallet, contractA, contractB } = await createCrossAccounts(world);

	await wallet
		.callContract({
			callee: contractA,
			funcName: "call_send_back_async_v1",
			funcArgs: [
				contractB,
				e.List(
					e.Tuple(e.Str(tokenId), e.U64(0), e.U(1)),
					e.Tuple(e.Str(tokenId), e.U64(1), e.U(1)),
				),
			],
			gasLimit: 100_000_000,
		})
		.assertFail({
			code: "returnMessage",
			message: "sending value to non payable contract",
		});

	// assertAccount(await contractB.getAccount(), {
	// 	kvs: {
	// 		esdts: [
	// 			{ id: tokenId, amount: 1 },
	// 			{ id: tokenId, nonce: 1, amount: 0 },
	// 		],
	// 	},
	// });
	// assertAccount(await contractA.getAccount(), {
	// 	kvs: { esdts: [{ id: tokenId, nonce: 1, amount: 1 }] },
	// });
});

test("🔴 SC A calls SC B, different shards, async v1. SC B sends back SFT+EGLD", async () => {
	using world = await FSWorld.start();

	const { wallet, contractA, contractB } = await createCrossAccounts(world);

	await wallet
		.callContract({
			callee: contractA,
			funcName: "call_send_back_async_v1",
			funcArgs: [
				contractB,
				e.List(
					e.Tuple(e.Str(tokenId), e.U64(1), e.U(1)),
					e.Tuple(e.Str("EGLD"), e.U64(0), e.U(1)),
				),
			],
			gasLimit: 100_000_000,
		})
		.assertFail({
			code: "returnMessage",
			message: "sending value to non payable contract",
		});

	// assertAccount(await contractB.getAccount(), {
	// 	balance: 0,
	// 	kvs: {
	// 		esdts: [
	// 			{ id: tokenId, amount: 1 },
	// 			{ id: tokenId, nonce: 1, amount: 1 },
	// 		],
	// 	},
	// });
	// assertAccount(await contractA.getAccount(), {
	// 	balance: 1,
	// 	kvs: { esdts: [{ id: tokenId, nonce: 1, amount: 0 }] },
	// });
});

test("🔴 SC A calls SC B, different shards, async v1. SC B sends back SFT+FFT", async () => {
	using world = await FSWorld.start();

	const { wallet, contractA, contractB } = await createCrossAccounts(world);

	await wallet
		.callContract({
			callee: contractA,
			funcName: "call_send_back_async_v1",
			funcArgs: [
				contractB,
				e.List(
					e.Tuple(e.Str(tokenId), e.U64(1), e.U(1)),
					e.Tuple(e.Str(tokenId), e.U64(0), e.U(1)),
				),
			],
			gasLimit: 100_000_000,
		})
		.assertFail({
			code: "returnMessage",
			message: "sending value to non payable contract",
		});

	// assertAccount(await contractB.getAccount(), {
	// 	kvs: {
	// 		esdts: [
	// 			{ id: tokenId, amount: 0 },
	// 			{ id: tokenId, nonce: 1, amount: 1 },
	// 		],
	// 	},
	// });
	// assertAccount(await contractA.getAccount(), {
	// 	kvs: { esdts: [{ id: tokenId, amount: 1 }] },
	// });
});

test("SC A calls SC B, different shards, async v2. SC B sends back EGLD", async () => {
	using world = await FSWorld.start();

	const { wallet, contractA, contractB } = await createCrossAccounts(world);

	await wallet.callContract({
		callee: contractA,
		funcName: "call_send_back_async_v2",
		funcArgs: [
			contractB,
			e.List(e.Tuple(e.Str("EGLD"), e.U64(0), e.U(1))),
			e.U64(10_000_000),
		],
		gasLimit: 100_000_000,
	});

	assertAccount(await contractB.getAccount(), {
		balance: 0,
	});
	assertAccount(await contractA.getAccount(), {
		balance: 1,
	});
});

test("SC A calls SC B, different shards, async v2. SC B sends back FFT", async () => {
	using world = await FSWorld.start();

	const { wallet, contractA, contractB } = await createCrossAccounts(world);

	await wallet.callContract({
		callee: contractA,
		funcName: "call_send_back_async_v2",
		funcArgs: [
			contractB,
			e.List(e.Tuple(e.Str(tokenId), e.U64(0), e.U(1))),
			e.U64(10_000_000),
		],
		gasLimit: 100_000_000,
	});

	assertAccount(await contractB.getAccount(), {
		kvs: {
			esdts: [
				{ id: tokenId, amount: 0 },
				{ id: tokenId, nonce: 1, amount: 1 },
			],
		},
	});
	assertAccount(await contractA.getAccount(), {
		kvs: { esdts: [{ id: tokenId, amount: 1 }] },
	});
});

test("SC A calls SC B, different shards, async v2. SC B sends back SFT", async () => {
	using world = await FSWorld.start();

	const { wallet, contractA, contractB } = await createCrossAccounts(world);

	await wallet.callContract({
		callee: contractA,
		funcName: "call_send_back_async_v2",
		funcArgs: [
			contractB,
			e.List(e.Tuple(e.Str(tokenId), e.U64(1), e.U(1))),
			e.U64(10_000_000),
		],
		gasLimit: 100_000_000,
	});

	assertAccount(await contractB.getAccount(), {
		kvs: {
			esdts: [
				{ id: tokenId, amount: 1 },
				{ id: tokenId, nonce: 1, amount: 0 },
			],
		},
	});
	assertAccount(await contractA.getAccount(), {
		kvs: { esdts: [{ id: tokenId, nonce: 1, amount: 1 }] },
	});
});

test("🔴 SC A calls SC B, different shards, async v2. SC B sends back EGLD+FFT", async () => {
	using world = await FSWorld.start();

	const { wallet, contractA, contractB } = await createCrossAccounts(world);

	await wallet
		.callContract({
			callee: contractA,
			funcName: "call_send_back_async_v2",
			funcArgs: [
				contractB,
				e.List(
					e.Tuple(e.Str("EGLD"), e.U64(0), e.U(1)),
					e.Tuple(e.Str(tokenId), e.U64(0), e.U(1)),
				),
				e.U64(10_000_000),
			],
			gasLimit: 100_000_000,
		})
		.assertFail({
			code: "returnMessage",
			message: "sending value to non payable contract",
		});

	// assertAccount(await contractB.getAccount(), {
	// 	balance: 1,
	// 	kvs: {
	// 		esdts: [
	// 			{ id: tokenId, amount: 0 },
	// 			{ id: tokenId, nonce: 1, amount: 1 },
	// 		],
	// 	},
	// });
	// assertAccount(await contractA.getAccount(), {
	// 	balance: 0,
	// 	kvs: { esdts: [{ id: tokenId, amount: 1 }] },
	// });
});

test("🔴 SC A calls SC B, different shards, async v2. SC B sends back EGLD+SFT", async () => {
	using world = await FSWorld.start();

	const { wallet, contractA, contractB } = await createCrossAccounts(world);

	await wallet
		.callContract({
			callee: contractA,
			funcName: "call_send_back_async_v2",
			funcArgs: [
				contractB,
				e.List(
					e.Tuple(e.Str("EGLD"), e.U64(0), e.U(1)),
					e.Tuple(e.Str(tokenId), e.U64(1), e.U(1)),
				),
				e.U64(10_000_000),
			],
			gasLimit: 100_000_000,
		})
		.assertFail({
			code: "returnMessage",
			message: "sending value to non payable contract",
		});

	// assertAccount(await contractB.getAccount(), {
	// 	balance: 1,
	// 	kvs: {
	// 		esdts: [
	// 			{ id: tokenId, amount: 1 },
	// 			{ id: tokenId, nonce: 1, amount: 0 },
	// 		],
	// 	},
	// });
	// assertAccount(await contractA.getAccount(), {
	// 	balance: 0,
	// 	kvs: { esdts: [{ id: tokenId, nonce: 1, amount: 1 }] },
	// });
});

test("🔴 SC A calls SC B, different shards, async v2. SC B sends back FFT+EGLD", async () => {
	using world = await FSWorld.start();

	const { wallet, contractA, contractB } = await createCrossAccounts(world);

	await wallet
		.callContract({
			callee: contractA,
			funcName: "call_send_back_async_v2",
			funcArgs: [
				contractB,
				e.List(
					e.Tuple(e.Str(tokenId), e.U64(0), e.U(1)),
					e.Tuple(e.Str("EGLD"), e.U64(0), e.U(1)),
				),
				e.U64(10_000_000),
			],
			gasLimit: 100_000_000,
		})
		.assertFail({
			code: "returnMessage",
			message: "sending value to non payable contract",
		});

	// assertAccount(await contractB.getAccount(), {
	// 	balance: 0,
	// 	kvs: {
	// 		esdts: [
	// 			{ id: tokenId, amount: 1 },
	// 			{ id: tokenId, nonce: 1, amount: 1 },
	// 		],
	// 	},
	// });
	// assertAccount(await contractA.getAccount(), {
	// 	balance: 1,
	// 	kvs: { esdts: [{ id: tokenId, amount: 0 }] },
	// });
});
test("🔴 SC A calls SC B, different shards, async v2. SC B sends back FFT+SFT", async () => {
	using world = await FSWorld.start();

	const { wallet, contractA, contractB } = await createCrossAccounts(world);

	await wallet
		.callContract({
			callee: contractA,
			funcName: "call_send_back_async_v2",
			funcArgs: [
				contractB,
				e.List(
					e.Tuple(e.Str(tokenId), e.U64(0), e.U(1)),
					e.Tuple(e.Str(tokenId), e.U64(1), e.U(1)),
				),
				e.U64(10_000_000),
			],
			gasLimit: 100_000_000,
		})
		.assertFail({
			code: "returnMessage",
			message: "sending value to non payable contract",
		});

	// assertAccount(await contractB.getAccount(), {
	// 	kvs: {
	// 		esdts: [
	// 			{ id: tokenId, amount: 1 },
	// 			{ id: tokenId, nonce: 1, amount: 0 },
	// 		],
	// 	},
	// });
	// assertAccount(await contractA.getAccount(), {
	// 	kvs: { esdts: [{ id: tokenId, nonce: 1, amount: 1 }] },
	// });
});

test("🔴 SC A calls SC B, different shards, async v2. SC B sends back SFT+EGLD", async () => {
	using world = await FSWorld.start();

	const { wallet, contractA, contractB } = await createCrossAccounts(world);

	await wallet
		.callContract({
			callee: contractA,
			funcName: "call_send_back_async_v2",
			funcArgs: [
				contractB,
				e.List(
					e.Tuple(e.Str(tokenId), e.U64(1), e.U(1)),
					e.Tuple(e.Str("EGLD"), e.U64(0), e.U(1)),
				),
				e.U64(10_000_000),
			],
			gasLimit: 100_000_000,
		})
		.assertFail({
			code: "returnMessage",
			message: "sending value to non payable contract",
		});

	// assertAccount(await contractB.getAccount(), {
	// 	balance: 0,
	// 	kvs: {
	// 		esdts: [
	// 			{ id: tokenId, amount: 1 },
	// 			{ id: tokenId, nonce: 1, amount: 1 },
	// 		],
	// 	},
	// });
	// assertAccount(await contractA.getAccount(), {
	// 	balance: 1,
	// 	kvs: { esdts: [{ id: tokenId, nonce: 1, amount: 0 }] },
	// });
});

test("🔴 SC A calls SC B, different shards, async v2. SC B sends back SFT+FFT", async () => {
	using world = await FSWorld.start();

	const { wallet, contractA, contractB } = await createCrossAccounts(world);

	await wallet
		.callContract({
			callee: contractA,
			funcName: "call_send_back_async_v2",
			funcArgs: [
				contractB,
				e.List(
					e.Tuple(e.Str(tokenId), e.U64(1), e.U(1)),
					e.Tuple(e.Str(tokenId), e.U64(0), e.U(1)),
				),
				e.U64(10_000_000),
			],
			gasLimit: 100_000_000,
		})
		.assertFail({
			code: "returnMessage",
			message: "sending value to non payable contract",
		});

	// assertAccount(await contractB.getAccount(), {
	// 	kvs: {
	// 		esdts: [
	// 			{ id: tokenId, amount: 0 },
	// 			{ id: tokenId, nonce: 1, amount: 1 },
	// 		],
	// 	},
	// });
	// assertAccount(await contractA.getAccount(), {
	// 	kvs: { esdts: [{ id: tokenId, amount: 1 }] },
	// });
});

const createCrossAccounts = async (
	world: FSWorld,
) => {
	const wallet = await world.createWallet({
		address: { shard: 0 },
		balance: egldUnit,
	});
	const contractA = await world.createContract({
		address: { shard: 0 },
		code: wasmCode,
	});
	const contractB = await world.createContract({
		address: { shard: 1 },
		code: wasmCode,
		balance: 1,
		kvs: {
			esdts: [
				{ id: tokenId, amount: 1 },
				{ id: tokenId, nonce: 1, amount: 1 },
			],
		},
	});
	await world.sysAcc.addEsdts([{ id: tokenId, nonce: 1, amount: 1 }]);
	return { wallet, contractA, contractB };
};

const wasmCode = "file:output/contract.wasm";
const egldUnit = 10n ** 18n;
const tokenId = "TOK-123456";
