async function listSecrets() {
  const body = await list()
  const json = await body.json()
  return json
}

async function uploadSecret(secretName, secretEncoded, masterPassword) {
  const secretEncrypted = await aes256encrypt(secretEncoded, masterPassword)
  const secretDigest = await sha1digest(secretEncrypted)
  const response = await upload(config.get("accountName") + "/" + secretName,
	  secretEncrypted, secretDigest)
  return response
}

async function downloadSecret(secretName, masterPassword) {
  const secretEncrypted = await download(config.get("accountName") + "/" + secretName)
  const secretDecrypted = await aes256decrypt(secretEncrypted, masterPassword)
  const secretDecoded = new TextDecoder().decode(secretDecrypted)
  return secretDecoded
}
