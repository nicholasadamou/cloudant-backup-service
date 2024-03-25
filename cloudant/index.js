const {CloudantV1, IamAuthenticator} = require('@ibm-cloud/cloudant')
const dotenv = require('dotenv')

dotenv.config()

const extractCloudantCredentialsFromURL = (url) => {
	if (!doesURLContainCredentials(url)) {
		return {
			serviceUrl: url,
			username: process.env.CLOUDANT_USERNAME,
			password: process.env.CLOUDANT_PASSWORD
		}
	}

	const protocol = url.split('://')[0]
	const urlParts = url.split('@')
	const host = urlParts[1]
	const auth = urlParts[0].split('://')[1]
	const [username, password] = auth.split(':')

	const serviceUrl = `${protocol}://${host}`

	return {
		serviceUrl,
		username,
		password
	}
}

const doesURLContainCredentials = (url) => {
	return url.includes('@')
}

const cloudantClient = new CloudantV1({
	serviceUrl: process.env.CLOUDANT_URL,
	authenticator: new IamAuthenticator({
		apikey: process.env.CLOUDANT_APIKEY,
	})
})

const getAllDatabases = async () => {
	try {
		const response = await cloudantClient.getAllDbs()
		return response.result
	} catch (error) {
		console.error(`${error}`)
		throw error
	}
}

module.exports = {
	cloudantClient,
	getAllDatabases,
	extractCloudantCredentialsFromURL
}
