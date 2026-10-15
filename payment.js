
const crypto = require("crypto");
let Razorpay = null;
try { Razorpay = require("razorpay"); } catch {}

function configured() {
  return !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET && Razorpay);
}
function client() {
  if(!configured()) return null;
  return new Razorpay({key_id:process.env.RAZORPAY_KEY_ID,key_secret:process.env.RAZORPAY_KEY_SECRET});
}
function verifySignature(orderId,paymentId,signature) {
  const expected = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
    .update(orderId + "|" + paymentId).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature || ""));
}
function verifyWebhook(rawBody,signature) {
  const expected = crypto.createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET || "")
    .update(rawBody).digest("hex");
  return expected === signature;
}
module.exports = { configured, client, verifySignature, verifyWebhook };
