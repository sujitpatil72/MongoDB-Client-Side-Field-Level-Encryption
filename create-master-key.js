const crypto = require('crypto');
const fs = require("fs");

try {
  fs.writeFileSync('master-key.txt', crypto.randomBytes(96));
} catch (err) {
  console.error(err);
}

