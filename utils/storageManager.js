const fs = require('fs');
const path = require('path');

class StorageManager {
  constructor(storagePath = path.join(__dirname, '..', 'passwords.json')) {
    this.storagePath = storagePath;
  }

  // Read passwords from JSON file
  readPasswords() {
    try {
      if (!fs.existsSync(this.storagePath)) {
        return [];
      }
      const data = fs.readFileSync(this.storagePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading passwords:', error);
      return [];
    }
  }

  // Save passwords to JSON file
  savePasswords(passwords) {
    try {
      const data = JSON.stringify(passwords, null, 2);
      fs.writeFileSync(this.storagePath, data);
      return true;
    } catch (error) {
      console.error('Error saving passwords:', error);
      return false;
    }
  }

  // Import passwords from a selected JSON file
  importPasswords(filePath) {
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      const importedPasswords = JSON.parse(data);
      this.savePasswords(importedPasswords);
      return importedPasswords;
    } catch (error) {
      console.error('Error importing passwords:', error);
      return [];
    }
  }
}

module.exports = StorageManager;
