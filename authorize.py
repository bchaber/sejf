import hashlib, requests, base64, dotenv, json, os
dotenv.load_dotenv(".env")

accountName = os.getenv("accountName")
bucketName = os.getenv("bucketName")
bucketId = os.getenv("bucketId")
appKeyId = os.getenv("appKeyId")
appKey = os.getenv("appKey")
apiUrl = os.getenv("apiUrl")

#########################################
# Obtain an account authorization token #
#########################################
credentials = bytes(appKeyId + ":" + appKey, "ascii")
headers = {"Authorization" : "Basic " + base64.b64encode(credentials).decode("ascii")}
response = requests.get(apiUrl + "/b2api/v3/b2_authorize_account", headers = headers)
assert response.status_code == 200
data = response.json()
assert "apiInfo" in data, \
       "[!] No API info in the response"
assert "storageApi" in data.get("apiInfo"), \
       "[!] No storage API info in the response"
assert "authorizationToken" in data, \
       "[!] No account authorization token in the response"
assert "apiUrl" in data.get("apiInfo").get("storageApi"), \
       "[!] No API URL in the response"
assert "downloadUrl" in data.get("apiInfo").get("storageApi"), \
       "[!] No download URL in the response"
assert "capabilities" in data.get("apiInfo").get("storageApi"), \
       "[!] No capabilites list in the response"
assert "listFiles" in data.get("apiInfo").get("storageApi").get("capabilities"), \
       "[!] Not sufficient capabilities in the response"

apiUrl = data.get("apiInfo").get("storageApi").get("apiUrl")
downloadUrl = data.get("apiInfo").get("storageApi").get("downloadUrl")
accountAuthorizationToken = data.get("authorizationToken")
#########################################
# Obtain a download authorization token #
#########################################
credentials = accountAuthorizationToken
headers = {"Authorization" : credentials}
payload = {"bucketId" : bucketId, "fileNamePrefix": accountName + "/", "validDurationInSeconds": 12000}
response = requests.post(apiUrl + "/b2api/v3/b2_get_download_authorization",
                         json = payload, headers = headers)
print(response.json())
assert response.status_code == 200
data = response.json()
assert "authorizationToken" in data, \
       "[!] No download authorization token in the response"
downloadAuthorizationToken = data.get("authorizationToken")
#########################################
# Obtain a upload authorization token   #
#########################################
credentials = accountAuthorizationToken
headers = {"Authorization" : credentials}
payload = {"bucketId" : bucketId}
response = requests.get(apiUrl + "/b2api/v3/b2_get_upload_url",
                        params = payload, headers = headers)
print(response.text)
assert response.status_code == 200
data = response.json()
assert "authorizationToken" in data, \
       "[!] No upload authorization token in the response"
assert "uploadUrl" in data, \
       "[!] No upload URL in the response"
uploadUrl = data.get("uploadUrl")
uploadAuthorizationToken = data.get("authorizationToken")
#########################################
# List all secrets in the bucket        #
#########################################
credentials = accountAuthorizationToken
headers = {"Authorization" : credentials}
payload = {"bucketId" : bucketId, "prefix": accountName + "/"}
response = requests.get(apiUrl + "/b2api/v3/b2_list_file_names",
                        params = payload, headers = headers)
assert response.status_code == 200
data = response.json()
secrets = []
for f in data["files"]:
  secret = f["fileName"]
  if os.path.basename(secret).startswith("."):
      continue
  secrets.append(secret)
  print("[-] " + secret)
#########################################
# Cache secret filenames in the bucket  #
#########################################
secretsEncoded = json.dumps(secrets).encode("utf-8")
headers = {
  "Authorization": uploadAuthorizationToken,
  "X-Bz-File-Name": accountName + "/.index",
  "X-Bz-Content-Sha1": hashlib.sha1(secretsEncoded).hexdigest(),
  "Content-Type": "application/octet-stream",
  "Content-Length": str(len(secretsEncoded))
}
response = requests.post(uploadUrl, headers = headers, data = secretsEncoded)
print(response.text)
assert response.status_code == 200
#########################################
# We are ready to pass the tokens       #
#########################################
print("[*] Go to http://127.0.0.1:8000/#" + \
      "accountName=" + accountName + "&" + \
      "uploadUrl=" + uploadUrl + "&" + \
      "uploadToken=" + uploadAuthorizationToken + "&" + \
      "downloadUrl=" + downloadUrl + "&" + \
      "downloadToken=" + downloadAuthorizationToken)
