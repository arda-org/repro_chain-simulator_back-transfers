```
npm install
npm run build
npm run test
```

# Critical issue n°1

If the following happens:

- SC A calls SC B and SC B sends back 1 EGLD to SC A
- SC A calls SC B and SC B sends back 1 EGLD to SC A
- SC A retrieves back transfers and stores them in X

then currently X = 3 EGLD instead of X = 2 EGLD.

# Critical issue n°2

If the following happens:

- SC A calls SC B and SC B sends back 1 EGLD to SC A
- SC A retrieves back transfers and stores them in X
- SC A calls SC B and SC B sends back 1 EGLD to SC A
- SC A retrieves back transfers and stores them in Y

then currently X = 1 EGLD and Y = 2 EGLD instead of X = 1 EGLD and Y = 1 EGLD.
