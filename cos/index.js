const fs = require('fs');
const { PassThrough } = require('stream');

const dotenv = require('dotenv')
const ibm = require('ibm-cos-sdk')

dotenv.config()

const environments = process.env

class COSService {
	constructor() {
		this.bucketName = environments.COS_BUCKET_NAME || '';
		this.initializeCOSClient();
	}

	initializeCOSClient() {
		try {
			this.cos = this.buildCOSClient();
		} catch (error) {
			this.handleError('COS Client Initialization Error', error.message);
		}
	}

	buildCOSClient() {
		const config = {
			endpoint: environments.COS_ENDPOINT || '',
			apiKeyId: environments.COS_API_KEY || '',
			ibmAuthEndpoint: 'https://iam.cloud.ibm.com/identity/token',
			serviceInstanceId: environments.COS_INSTANCE_ID || ''
		};

		return new ibm.S3(config);
	}

	handleError(errorCode, errorMessage) {
		console.error(`${errorCode}: ${errorMessage}`)
		throw new Error(errorMessage)
	}

	async isBucketAccessible() {
		try {
			await this.cos.headBucket({Bucket: this.bucketName}).promise()
			return true
		} catch (error) {
			this.handleError(
				`Error accessing bucket`,
				`${error.code} - ${error.message}`,
			)
			return false
		}
	}

	async backupToS3(stream, db) {
		console.log(`Uploading backup to S3: ${this.bucketName}`)

		if (!(await this.doesBucketExist(this.bucketName))) {
			this.handleError(
				`Bucket ${this.bucketName} does not exist. Cannot check if ${db} exists.`,
				'Bucket does not exist',
			)
		}

		if (!(await this.isBucketAccessible())) {
			this.handleError(
				`Bucket ${this.bucketName} is not accessible. Cannot upload backup.`,
				'Bucket not accessible',
			)
		}

		console.log(`Bucket ${this.bucketName} is accessible`)

		const parameters = {
			Bucket: this.bucketName,
			Key: db,
			Body: new PassThrough(),
		}

		const progress = {
			loaded: 0,
			total: stream.bytesWritten,
			percent: 0,
		}

		console.log(`Uploading backup to S3: ${db}`)

		const upload = this.cos.upload(parameters)
		const progressMessage =  `Uploaded ${progress.loaded} bytes of ${progress.total} bytes`

		let progressInterval = setInterval(() => {
			console.log(progressMessage)
		}, 500)

		fs.createReadStream(stream.path)
			.on('data', (chunk) => {
				progress.loaded += chunk.length
				progress.percent = Math.round((progress.loaded / progress.total) * 100)

				console.log(`Uploading ${progress.percent}%`)
			})
			.pipe(parameters.Body)
			.on('error', (error) => {
				clearInterval(progressInterval)
				this.handleError('Upload Error', error.message)
			})
			.on('end', () => {
				clearInterval(progressInterval)
				console.log(`Backup uploaded to S3: ${db}`)
			})

		try {
			await upload.promise()
		} catch (error) {
			clearInterval(progressInterval)
			this.handleError('Upload Error', error.message)
		}

		clearInterval(progressInterval)
	}

	async doesBucketExist(bucketName) {
		try {
			await this.cos.headBucket({Bucket: bucketName}).promise()
			return true
		} catch (error) {
			if (error.code === 'NotFound') {
				return false
			}

			this.handleError('Bucket Existence Error', error.message)
		}
	}
}

module.exports = COSService
