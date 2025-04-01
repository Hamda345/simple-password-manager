# Electron Password Manager

## Features
- Generate secure random passwords
- Save passwords with custom names
- Copy passwords to clipboard
- Import/Export passwords via JSON
- Simple and intuitive interface

## Prerequisites
- Node.js (v14 or later)
- npm
- steghide
## Installation
1.Install steghide
```bash
#Debian based distros
sudo apt install steghide
#Arch based distros
sudo pacman -Sy steghide
#Fedora
sudo dnf install steghide
```
2. Clone the repository
3. Install dependencies:
```bash
npm install
```

## Running the Application
```bash
npm start
```

## Building for Distribution
```bash
npm run dist  # Creates distributable for your platform
```

## Security Notes
- Store the `passwords.json` file securely
- Consider adding encryption for stored passwords in future versions
