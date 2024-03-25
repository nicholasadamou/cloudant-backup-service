const { monthlyBackup, dailyBackup } = require('./cron/backup')

// Monthly PiT (Point in time) backups
monthlyBackup.start()

// Daily rolling PiT (Point in time) backups
dailyBackup.start()

console.log('Backup scheduled tasks started')

// FOR TESTING PURPOSES ONLY
// const {backup} = require('./cron/backup.js');
//
// backup();
