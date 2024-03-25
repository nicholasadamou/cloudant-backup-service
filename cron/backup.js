const cron = require('node-cron')

const { verifyEnvVariable } = require('../utilities')
const { backupCloudantToS3 } = require('../couchbackup/index.js')

const BACKUP_COMPLETE_AT = 'Backup complete at '

const monthlyBackupSchedule = verifyEnvVariable(
  'MONTHLY_BACKUP_SCHEDULE',
  'No monthly backup schedule found. Exiting.',
)
const dailyBackupSchedule = verifyEnvVariable(
  'DAILY_BACKUP_SCHEDULE',
  'No daily backup schedule found. Exiting.',
)

const backup = async () => {
  console.log('Starting backup task')

	try {
    await backupCloudantToS3()
  } catch (_) {
    return
  }

  console.log(`${BACKUP_COMPLETE_AT}${new Date().toISOString()}`)
}

const createSchedule = (schedule) => cron.schedule(schedule, backup)

// Monthly PiT (Point in time) backups
const monthlyBackup = createSchedule(monthlyBackupSchedule)

// Daily rolling PiT (Point in time) backups
const dailyBackup = createSchedule(dailyBackupSchedule)

module.exports = { monthlyBackup, dailyBackup, backup }
