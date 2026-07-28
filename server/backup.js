const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const backupDir = path.join(__dirname, '..', 'backups');

if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const filename = `primeledger_backup_${timestamp}.sql`;
const filepath = path.join(backupDir, filename);

// Update with your PostgreSQL password
const password = 'Uthman@6155';
const command = `set PGPASSWORD=${password} && pg_dump -U postgres -h localhost primeledger > "${filepath}"`;

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`Backup failed: ${error.message}`);
    return;
  }
  
  console.log(`Backup created: ${filename}`);
  
  fs.readdir(backupDir, (err, files) => {
    if (err) return;
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    files.forEach(file => {
      const filePath = path.join(backupDir, file);
      fs.stat(filePath, (err, stats) => {
        if (err) return;
        if (stats.mtimeMs < sevenDaysAgo) {
          fs.unlink(filePath, () => console.log(`Deleted old backup: ${file}`));
        }
      });
    });
  });
});