const crypto = require("node:crypto");
const { fetchExternal, readJsonResponse } = require("../utils/http");

function getPayuConfig(config) {
  const production = config.payuEnvironment === "production";
  return {
    key: config.payuKey,
    salt: config.payuSalt,
    paymentUrl: production
      ? "https://secure.payu.in/_payment"
      : "https://test.payu.in/_payment",
    verifyUrl: production
      ? "https://info.payu.in/merchant/postservice.php?form=2"
      : "https://test.payu.in/merchant/postservice?form=2",
  };
}

function isPayuConfigured(config) {
  const callbackUrl = config.payuCallbackUrl || config.webOrigin?.split(",")[0]?.trim();
  const secureCallback = callbackUrl?.startsWith("https://");
  return Boolean(config.payuKey && config.payuSalt && callbackUrl && secureCallback);
}

function sha512(value) {
  return crypto.createHash("sha512").update(value, "utf8").digest("hex");
}

function buildPaymentRequest({ config, order, callbackUrl }) {
  if (!isPayuConfigured(config)) {
    const error = new Error("PayU payments are not configured on the server.");
    error.status = 503;
    throw error;
  }

  const credentials = getPayuConfig(config);
  const fields = {
    key: credentials.key,
    txnid: order.orderNumber,
    amount: Number(order.total).toFixed(2),
    productinfo: `Health With Herbal Order ${order.orderNumber}`,
    firstname: order.customer.firstName,
    email: order.customer.email,
    phone: order.customer.phone || "",
    surl: callbackUrl,
    furl: callbackUrl,
    udf1: "",
    udf2: "",
    udf3: "",
    udf4: "",
    udf5: "",
  };
  fields.hash = sha512(
    `${fields.key}|${fields.txnid}|${fields.amount}|${fields.productinfo}|${fields.firstname}|${fields.email}|||||||||||${credentials.salt}`,
  );

  return { action: credentials.paymentUrl, fields };
}

function verifyResponseHash(payload, config) {
  const credentials = getPayuConfig(config);
  if (!credentials.salt || !payload?.hash || !payload?.status) return false;

  const reverseHash = [
    credentials.salt,
    payload.status,
    "",
    "",
    "",
    "",
    "",
    payload.udf5 || "",
    payload.udf4 || "",
    payload.udf3 || "",
    payload.udf2 || "",
    payload.udf1 || "",
    payload.email || "",
    payload.firstname || "",
    payload.productinfo || "",
    payload.amount || "",
    payload.txnid || "",
    payload.key || "",
  ].join("|");
  const additionalCharges = payload.additional_charges || payload.additionalCharges;
  const input = additionalCharges
    ? `${additionalCharges}|${reverseHash}`
    : reverseHash;
  const expected = Buffer.from(sha512(input), "hex");
  let received;
  try {
    received = Buffer.from(payload.hash, "hex");
  } catch {
    return false;
  }
  return received.length === expected.length && crypto.timingSafeEqual(received, expected);
}

async function verifyTransaction(txnid, config) {
  const credentials = getPayuConfig(config);
  const command = "verify_payment";
  const hash = sha512(`${credentials.key}|${command}|${txnid}|${credentials.salt}`);
  const body = new URLSearchParams({
    key: credentials.key,
    command,
    var1: txnid,
    hash,
  });
  const response = await fetchExternal(
    credentials.verifyUrl,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    },
    { serviceName: "PayU verify_payment", timeoutMs: 10000 },
  );
  const data = await readJsonResponse(response, "PayU verify_payment");
  if (!response.ok || Number(data?.status) !== 1) {
    throw new Error(`PayU transaction verification failed (HTTP ${response.status}).`);
  }
  return data.transaction_details?.[txnid] || null;
}

module.exports = {
  buildPaymentRequest,
  getPayuConfig,
  isPayuConfigured,
  verifyResponseHash,
  verifyTransaction,
};
