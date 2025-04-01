async function upload(secretName, secretEncrypted, secretDigest) {
  const response = await fetch(config.get("uploadUrl"), {
                             method: "POST", body: secretEncrypted,
                             headers: {
                               "Authorization": config.get("uploadToken"),
                               "X-Bz-File-Name": secretName,
                               "X-Bz-Content-Sha1": secretDigest,
                               "Content-Type": "application/octet-stream",
                               "Content-Length": 11
                             }})
  return response
}

async function download(secret) {
  const authorization = "?Authorization=" + config.get("downloadToken")
  const endpoint = config.get("downloadUrl") + "/file/bchaber-pw/" + secret + authorization
  const response = await fetch(endpoint)

  const bodyReader = await response.body.getReader()
  const bodyBytes = await bodyReader.read()

  return bodyBytes.value
}
