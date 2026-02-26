async function listSecrets() {
  const body = await list()
  const data = await body.json()
  const json = []
  for (const secret of data) {
    const name = secret.name
    const text = await download(name)
    if (text) {
      json.push({
        name: name,
        text: text.toHex()
      })
    }
  }
  return json
}

async function uploadSecret(secretName, secretEncoded, masterPassword) {
  const secretEncrypted = await aes256encrypt(secretEncoded, masterPassword)
  const response = await upload(secretName, secretEncrypted)
  return { ciphertext: secretEncrypted.toHex(), response: response }
}

async function downloadSecret(secretName, masterPassword) {
  const secretEncrypted = await download(secretName)
  const secretDecrypted = await aes256decrypt(secretEncrypted, masterPassword)
  const secretDecoded = new TextDecoder().decode(secretDecrypted)
  return secretDecoded
}
