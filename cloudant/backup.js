const {backup} = require('@cloudant/couchbackup')
const dotenv = require('dotenv')

const {getAllDatabases, extractCloudantCredentialsFromURL} = require('./index.js')

const COSService = require('../cos')
const path = require("path");
const fs = require("fs");

dotenv.config()

const environments = process.env

const {username, password} = extractCloudantCredentialsFromURL(environments.CLOUDANT_URL);

const backupOptions = {
	url: environments.CLOUDANT_URL || '',
	username: username || '',
	password: password || '',
	db: '', // Set dynamically in backupDatabase()
	parallelism: 1,
	maxAttempts: 5,
	interval: 3000,
	fullCommit: true,
}

const deleteFile = (filename) => {
	fs.unlink(filename, (err) => {
		if (err) {
			console.error(`Error deleting file: ${err}`)
		}
	})
}

const logDateMsg = (message) =>
	console.log(`${message} ${backupOptions.db} at ${new Date().toISOString()}`)

const backupAllDatabases = async () => {
	const databases = await getAllDatabases()

	console.log(`Found ${databases.length} databases to backup at ${new Date().toISOString()}`)
	console.log('Will backup the following databases:', databases.join(', '))

	for (const db of databases) {
		const tmpDir = path.join('/tmp')
		const filename = path.join(tmpDir, db + '_backup.txt');
		const writeStream = fs.createWriteStream(filename);

		try {
			await backupDatabase(db, writeStream)

			const cosService = await new COSService();
			await cosService.backupToS3(writeStream, db);
		} catch (error) {
			throw error
		} finally {
			deleteFile(filename)

			writeStream.end();
		}
	}
}

const prepareBackup = (db) => {
	backupOptions.db = db;
	return `${backupOptions.url}/${backupOptions.db}`;
};

const getDatabaseOptions = () => ({
	url: backupOptions.url,
	username: backupOptions.username,
	password: backupOptions.password,
	parallelism: backupOptions.parallelism,
});

const backupDatabase = async (db, streamToUpload) => {
	const srcUrl = prepareBackup(db);
	const databaseOptions = {
		...getDatabaseOptions(),
		db: db // Adding the 'db' property
	};

	logDateMsg(`Starting backup for`);
	return new Promise((resolve, reject) => {
		backup(srcUrl, streamToUpload, databaseOptions, (error, data) => {
			logBackupResults(error, db);

			if (error !== null) {
				reject(error);
			} else {
				resolve(data);
			}
		});
	});
};

const logBackupResults = (error, db) => {
	if (error !== null) {
		console.error(`${error}`);

		return;
	}

	console.log(`Backup complete for ${db}`);
};

module.exports = {backupAllDatabases}
