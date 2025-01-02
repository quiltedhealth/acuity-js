const { subtle } = globalThis.crypto;

function stringify(obj) {
  return Object.keys(obj)
    .map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(obj[key]))
    .join("&");
}

async function generateHmacKey(hash = "SHA-256") {
  return await subtle.generateKey(
    {
      name: "HMAC",
      hash,
    },
    true,
    ["sign", "verify"],
  );
}

async function signHmacKey(data) {
  const key = await generateHmacKey();

  return await subtle.sign(
    {
      name: "HMAC",
    },
    key,
    new TextEncoder().encode(data),
  );
}

export { stringify, signHmacKey };
