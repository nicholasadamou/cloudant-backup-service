const dotenv = require('dotenv')

dotenv.config()

const environments = process.env

const verifyEnvVariable = (variableName, errorMessage) => {
	const value = environments[variableName]

	if (!value) {
		throw new Error(errorMessage)
	}

	return value
}

module.exports = {
	verifyEnvVariable
}
