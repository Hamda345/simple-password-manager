const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

class SteganographyManager {
  constructor() {
    this.tempDir = path.join(os.tmpdir(), 'password-manager-temp');

    // Create temp directory if it doesn't exist
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  /**
   * Check if steghide is installed on the system
   * @returns {Promise<boolean>} True if steghide is installed
   */
  async checkSteghideInstalled() {
    return new Promise((resolve) => {
      exec('steghide --version', (error) => {
        if (error) {
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }

  /**
   * Hide passwords file inside an image
   * @param {string} passwordsFilePath - Path to the passwords.json file
   * @param {string} imagePath - Path to the cover image
   * @param {string} outputPath - Path to save the output steganographic image
   * @param {string} password - Password to encrypt the hidden data
   * @returns {Promise<boolean>} True if successful
   */
  async hidePasswordsInImage(passwordsFilePath, imagePath, outputPath, password) {
    return new Promise((resolve, reject) => {
      // Check if files exist
      if (!fs.existsSync(passwordsFilePath)) {
        reject(new Error('Passwords file not found'));
        return;
      }

      if (!fs.existsSync(imagePath)) {
        reject(new Error('Image file not found'));
        return;
      }

      // Create a copy of the image to embed data
      fs.copyFileSync(imagePath, outputPath);

      // Build the steghide command
      const command = `steghide embed -cf "${outputPath}" -ef "${passwordsFilePath}" -p "${password}" -sf "${outputPath}" -z 9 -f`;

      // Execute steghide
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error('Steghide error:', stderr);
          reject(new Error(`Steghide error: ${stderr}`));
        } else {
          resolve(true);
        }
      });
    });
  }

  /**
   * Extract passwords file from an image
   * @param {string} imagePath - Path to the steganographic image
   * @param {string} outputPath - Path to save the extracted passwords.json
   * @param {string} password - Password to decrypt the hidden data
   * @returns {Promise<boolean>} True if successful
   */
  async extractPasswordsFromImage(imagePath, outputPath, password) {
    return new Promise((resolve, reject) => {
      // Check if image exists
      if (!fs.existsSync(imagePath)) {
        reject(new Error('Image file not found'));
        return;
      }

      // Build the steghide command
      const command = `steghide extract -sf "${imagePath}" -p "${password}" -xf "${outputPath}" -f`;

      // Execute steghide
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error('Steghide error:', stderr);
          reject(new Error(`Steghide error: ${stderr}`));
        } else {
          resolve(true);
        }
      });
    });
  }

  /**
   * Get installation instructions for steghide
   * @returns {string} Installation instructions
   */
  getInstallationInstructions() {
    const platform = os.platform();

    if (platform === 'linux') {
      return 'Install steghide using your package manager:\n' +
        'Ubuntu/Debian: sudo apt-get install steghide\n' +
        'Fedora: sudo dnf install steghide\n' +
        'Arch Linux: sudo pacman -S steghide';
    } else if (platform === 'win32') {
      return 'On Windows, you can download steghide from:\n' +
        'https://sourceforge.net/projects/steghide/files/\n' +
        'Or install it through WSL (Windows Subsystem for Linux)';
    } else if (platform === 'darwin') {
      return 'On macOS, you can install steghide using Homebrew:\n' +
        'brew install steghide';
    } else {
      return 'Please install steghide for your platform from:\n' +
        'https://steghide.sourceforge.net/';
    }
  }
}

module.exports = SteganographyManager;
