```
npm install
npm run build
npm run test
```

# Critical issue n°1 - Call, call, back transfers

If the following happens:

- SC A calls SC B and SC B sends back 1 EGLD to SC A
- SC A calls SC B and SC B sends back 1 EGLD to SC A
- SC A retrieves back transfers and stores them in X

then currently X = 3 EGLD instead of X = 2 EGLD.

# Critical issue n°2 - Call, back transfers, call, back transfers

If the following happens:

- SC A calls SC B and SC B sends back 1 EGLD to SC A
- SC A retrieves back transfers and stores them in X
- SC A calls SC B and SC B sends back 1 EGLD to SC A
- SC A retrieves back transfers and stores them in Y

then currently X = 1 EGLD and Y = 2 EGLD instead of X = 1 EGLD and Y = 1 EGLD.

# Critical issue n°3 - Cross-shard

If an SC A calls an SC B in another shard and SC B sends back tokens to SC A, then:
- it succeeds when SC B sends back only 1 token (e.g. EGLD, fungible token, ...),
- it fails when SC B sends back 2 tokens or more. The error: "sending value to non payable contract".

```
✓ SC A calls SC B, different shards, async v1. SC B sends back EGLD
✓ SC A calls SC B, different shards, async v1. SC B sends back FFT
✓ SC A calls SC B, different shards, async v1. SC B sends back SFT
× SC A calls SC B, different shards, async v1. SC B sends back EGLD+FFT
× SC A calls SC B, different shards, async v1. SC B sends back EGLD+SFT
× SC A calls SC B, different shards, async v1. SC B sends back FFT+EGLD
× SC A calls SC B, different shards, async v1. SC B sends back FFT+SFT
× SC A calls SC B, different shards, async v1. SC B sends back SFT+EGLD
× SC A calls SC B, different shards, async v1. SC B sends back SFT+FFT
✓ SC A calls SC B, different shards, async v2. SC B sends back EGLD
✓ SC A calls SC B, different shards, async v2. SC B sends back FFT
✓ SC A calls SC B, different shards, async v2. SC B sends back SFT
× SC A calls SC B, different shards, async v2. SC B sends back EGLD+FFT
× SC A calls SC B, different shards, async v2. SC B sends back EGLD+SFT
× SC A calls SC B, different shards, async v2. SC B sends back FFT+EGLD
× SC A calls SC B, different shards, async v2. SC B sends back FFT+SFT
× SC A calls SC B, different shards, async v2. SC B sends back SFT+EGLD
× SC A calls SC B, different shards, async v2. SC B sends back SFT+FFT
```
