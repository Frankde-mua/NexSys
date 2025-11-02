import crypto from "crypto";

// Generate a random 32-byte key (256-bit)
const key = crypto.randomBytes(32).toString("hex");
console.log("Your encryption key:", key);
