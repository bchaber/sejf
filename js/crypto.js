function hex(bytes) {
	return Array.from(bytes)
		    .map((b) => b.toString(16).padStart(2, "0"))
		    .join("")
}

function unhex(string) {
	return Uint8Array.fromHex(string)
}


function base64encode(bytes) {
	return bytes.toBase64()
}

function base64decode(text) {
	return Uint8Array.fromBase64(text)
}

async function sha1digest(dataEncoded) {
	const digestBuffer = await window.crypto.subtle.digest("SHA-1", dataEncoded)
	const digestBytes = new Uint8Array(digestBuffer)
	return hex(digestBytes)
}

async function sha512digest(dataEncoded) {
	const digestBuffer = await window.crypto.subtle.digest("SHA-512", dataEncoded)
	const digestBytes = new Uint8Array(digestBuffer)
	return hex(digestBytes)
}

async function pbkdf2(masterPassword, masterKeySalt) {
	const masterKeyMaterial = await window.crypto.subtle.importKey("raw",
		masterPassword, "PBKDF2", false, ["deriveBits", "deriveKey"])
	const masterKey = await window.crypto.subtle.deriveKey({
		name: "PBKDF2", salt: masterKeySalt,
		iterations: 10000, hash: "SHA-256"
	}, masterKeyMaterial, {
		name: "AES-GCM", length: 256
	}, true, ["encrypt", "decrypt"])
	return masterKey
}
async function aes256encrypt(dataEncoded, masterPassword) {
	const initializationVector = await window.crypto.getRandomValues(new Uint8Array(12))
	const masterKeySalt = await window.crypto.getRandomValues(new Uint8Array(16))
	const masterKey = await pbkdf2(masterPassword, masterKeySalt)
	const cipherTextBuffer = await window.crypto.subtle.encrypt({
		name: "AES-GCM", iv: initializationVector
	}, masterKey, dataEncoded);
	const dataEncrypted = new Uint8Array(cipherTextBuffer)

	const blob = new Blob([masterKeySalt, initializationVector, dataEncrypted])
	const buffer = await blob.arrayBuffer()
	
	return new Uint8Array(buffer)
}

async function aes256decrypt(blobEncrypted, masterPassword) {
        const masterKeySalt = blobEncrypted.slice(0, 16)
	const initializationVector = blobEncrypted.slice(16, 28)
	const masterKey = await pbkdf2(masterPassword, masterKeySalt)
	const dataEncrypted = blobEncrypted.slice(28)
	const plaintextTextBuffer = await window.crypto.subtle.decrypt({
		name: "AES-GCM", iv: initializationVector
	}, masterKey, dataEncrypted);
	const dataEncoded = new Uint8Array(plaintextTextBuffer)
	return dataEncoded
}
