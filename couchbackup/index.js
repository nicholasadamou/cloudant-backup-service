const { backupAllDatabases } = require('../cloudant/backup')

const backupCloudantToS3 = async () => {
	console.log(`Starting backup to file at ${new Date().toISOString()}`)

	try {
		await backupAllDatabases()
	} catch (error) {
		throw new Error(error)
	}

	console.log(`Backup to file complete at ${new Date().toISOString()}`)
}

module.exports = {
	backupCloudantToS3
}
