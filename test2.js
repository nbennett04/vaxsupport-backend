const bcrypt = require('bcrypt');

async function test() {
  const password = "123";
  const hash = await bcrypt.hash(password, 10);
  console.log("Hash:", hash);

  const isMatch = await bcrypt.compare(password, hash);
  console.log("Do they match?", isMatch);
}

test();
