async function list() {
  const query = {
    prefix: "",
    offset: 0, limit: 1000,
    sortBy: { column: "name", order: "asc"}
  }

  const token = "Bearer " + config.get("secretKey")
  const endpoint = config.get("projectUrl") + "/list/" + config.get("accountName")
  const response = await fetch(endpoint, {
                       method: "POST", body: JSON.stringify(query),
                             headers: {
                               "apikey": config.get("secretKey"),
                               "Authorization": token,
                               "Content-Type": "application/json"
                             }})
  return response
}

async function upload(secretName, secretEncrypted) {
  const token = "Bearer " + config.get("secretKey")
  const endpoint = config.get("projectUrl") + "/" + config.get("accountName") + "/" + secretName
  const response = await fetch(endpoint, {
	                     method: "PUT", body: secretEncrypted,
                             headers: {
                               "apikey": config.get("secretKey"),
                               "Authorization": token,
                               "Content-Type": "application/octet-stream"
                             }})
  return response
}

async function download(secretName) {
  const token = "Bearer " + config.get("secretKey")
  const endpoint = config.get("projectUrl") + "/" + config.get("accountName") + "/" + secretName
  const response = await fetch(endpoint, {
  			   headers: {
                "apikey": config.get("secretKey"),
                "Authorization": token,
			   }})

  const bodyReader = await response.body.getReader()
  const bodyBytes = await bodyReader.read()

  return bodyBytes.value
}
