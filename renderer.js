// renderer.js
document.addEventListener('DOMContentLoaded', () => {
  const generateBtn = document.getElementById('generateBtn');
  const passwordName = document.getElementById('passwordName');
  const generatedPassword = document.getElementById('generatedPassword');
  const copyBtn = document.getElementById('copyBtn');
  const saveBtn = document.getElementById('saveBtn');
  const passwordsList = document.getElementById('passwordsList');
  const importBtn = document.getElementById('importBtn');

  // Generate Password
  generateBtn.addEventListener('click', async () => {
    const password = await window.electronAPI.generatePassword(16);
    generatedPassword.value = password;
  });

  // Copy Password
  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(generatedPassword.value);
    alert('Password copied to clipboard!');
  });

  // Save Password
  saveBtn.addEventListener('click', async () => {
    const name = passwordName.value.trim();
    const password = generatedPassword.value;

    if (!name || !password) {
      alert('Please generate a password and provide a name');
      return;
    }

    const passwordEntry = {
      name,
      password,
      createdAt: new Date().toISOString()
    };

    await window.electronAPI.savePassword(passwordEntry);
    passwordName.value = '';
    generatedPassword.value = '';
    loadPasswords();
  });

  // Import Passwords
  importBtn.addEventListener('click', async () => {
    await window.electronAPI.importPasswords();
    loadPasswords();
  });

  // Load Passwords
  async function loadPasswords() {
    const passwords = await window.electronAPI.getPasswords();
    passwordsList.innerHTML = '';

    passwords.forEach(entry => {
      const li = document.createElement('li');
      li.innerHTML = `
                <span><strong>${entry.name}</strong> 
                <small>(Created: ${new Date(entry.createdAt).toLocaleString()})</small></span>
                <button onclick="navigator.clipboard.writeText('${entry.password}')">Copy</button>
            `;
      passwordsList.appendChild(li);
    });
  }

  // Initial load of passwords
  loadPasswords();
});
