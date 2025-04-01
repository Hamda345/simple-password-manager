document.addEventListener('DOMContentLoaded', () => {
  // Password tab elements
  const generateBtn = document.getElementById('generateBtn');
  const passwordName = document.getElementById('passwordName');
  const generatedPassword = document.getElementById('generatedPassword');
  const copyBtn = document.getElementById('copyBtn');
  const saveBtn = document.getElementById('saveBtn');
  const passwordsList = document.getElementById('passwordsList');
  const importBtn = document.getElementById('importBtn');

  // Tab elements
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  // Steganography tab elements
  const steghideStatusElem = document.getElementById('steghide-status');
  const steghideInstructionsElem = document.getElementById('steghide-instructions');
  const hidePasswordsSection = document.getElementById('hide-passwords-section');
  const extractPasswordsSection = document.getElementById('extract-passwords-section');
  const selectImageBtn = document.getElementById('selectImageBtn');
  const selectedImagePath = document.getElementById('selectedImagePath');
  const stegoPassword = document.getElementById('stegoPassword');
  const hidePasswordsBtn = document.getElementById('hidePasswordsBtn');
  const hideStatus = document.getElementById('hideStatus');
  const selectStegoImageBtn = document.getElementById('selectStegoImageBtn');
  const selectedStegoImagePath = document.getElementById('selectedStegoImagePath');
  const extractPassword = document.getElementById('extractPassword');
  const extractPasswordsBtn = document.getElementById('extractPasswordsBtn');
  const extractStatus = document.getElementById('extractStatus');

  // Tab switching
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active class from all tabs
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));

      // Add active class to clicked tab
      button.classList.add('active');
      const tabId = button.getAttribute('data-tab');
      document.getElementById(`${tabId}-tab`).classList.add('active');

      // Check steghide installation when switching to steganography tab
      if (tabId === 'steganography') {
        checkSteghideInstallation();
      }
    });
  });

  // Password functions

  // Generate Password
  generateBtn.addEventListener('click', async () => {
    const password = await window.electronAPI.generatePassword(16);
    generatedPassword.value = password;
  });

  // Copy Password
  copyBtn.addEventListener('click', () => {
    if (generatedPassword.value) {
      navigator.clipboard.writeText(generatedPassword.value);
      alert('Password copied to clipboard!');
    }
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

    if (passwords.length === 0) {
      passwordsList.innerHTML = '<li>No passwords saved yet</li>';
      return;
    }

    passwords.forEach(entry => {
      const li = document.createElement('li');
      li.innerHTML = `
                <span><strong>${entry.name}</strong> 
                <small>(Created: ${new Date(entry.createdAt).toLocaleString()})</small></span>
                <div>
                    <input type="password" value="${entry.password}" readonly>
                    <button onclick="this.previousElementSibling.type = this.previousElementSibling.type === 'password' ? 'text' : 'password'">
                        ${entry.password ? 'Show/Hide' : ''}
                    </button>
                    <button onclick="navigator.clipboard.writeText('${entry.password}'); this.textContent = 'Copied!'; setTimeout(() => this.textContent = 'Copy', 1000)">
                        Copy
                    </button>
                </div>
            `;
      passwordsList.appendChild(li);
    });
  }

  // Steganography functions

  // Check if steghide is installed
  async function checkSteghideInstallation() {
    steghideStatusElem.textContent = 'Checking if steghide is installed...';

    const isInstalled = await window.electronAPI.checkSteghideInstalled();

    if (isInstalled) {
      steghideStatusElem.textContent = '✅ Steghide is installed. You can use steganography features.';
      steghideStatusElem.className = 'success';
      steghideInstructionsElem.classList.add('hidden');
      hidePasswordsSection.classList.remove('hidden');
      extractPasswordsSection.classList.remove('hidden');
    } else {
      steghideStatusElem.textContent = '❌ Steghide is not installed. Please install it to use steganography features.';
      steghideStatusElem.className = 'error';
      const instructions = await window.electronAPI.getSteghideInstructions();
      steghideInstructionsElem.textContent = instructions;
      steghideInstructionsElem.classList.remove('hidden');
      hidePasswordsSection.classList.add('hidden');
      extractPasswordsSection.classList.add('hidden');
    }
  }

  // Store selected image path
  let coverImagePath = '';
  let stegoImagePath = '';

  // Select cover image for hiding passwords
  selectImageBtn.addEventListener('click', async () => {
    const imagePath = await window.electronAPI.selectCoverImage();
    if (imagePath) {
      coverImagePath = imagePath;
      selectedImagePath.textContent = imagePath;
      updateHideButtonState();
    }
  });

  // Update hide button state
  function updateHideButtonState() {
    hidePasswordsBtn.disabled = !(coverImagePath && stegoPassword.value);
  }

  // Update steganography password field
  stegoPassword.addEventListener('input', updateHideButtonState);

  // Hide passwords in image
  hidePasswordsBtn.addEventListener('click', async () => {
    hideStatus.textContent = 'Processing...';
    hideStatus.className = 'status-message';

    // Get filename from path
    const pathParts = coverImagePath.split(/[\\/]/);
    const filename = pathParts[pathParts.length - 1];
    const basename = filename.split('.')[0];

    // Select output location
    const outputPath = await window.electronAPI.selectStegoOutput(`${basename}-secure.jpg`);

    if (!outputPath) {
      hideStatus.textContent = 'Operation cancelled';
      return;
    }

    // Hide passwords
    const result = await window.electronAPI.hidePasswords(
      coverImagePath,
      outputPath,
      stegoPassword.value
    );

    if (result.success) {
      hideStatus.textContent = `Success! Passwords hidden in image at: ${outputPath}`;
      hideStatus.className = 'status-message success';
    } else {
      hideStatus.textContent = `Error: ${result.message}`;
      hideStatus.className = 'status-message error';
    }
  });

  // Select stego image for extracting passwords
  selectStegoImageBtn.addEventListener('click', async () => {
    const imagePath = await window.electronAPI.selectStegoImage();
    if (imagePath) {
      stegoImagePath = imagePath;
      selectedStegoImagePath.textContent = imagePath;
      updateExtractButtonState();
    }
  });

  // Update extract button state
  function updateExtractButtonState() {
    extractPasswordsBtn.disabled = !(stegoImagePath && extractPassword.value);
  }

  // Update extract password field
  extractPassword.addEventListener('input', updateExtractButtonState);

  // Extract passwords from image
  extractPasswordsBtn.addEventListener('click', async () => {
    extractStatus.textContent = 'Processing...';
    extractStatus.className = 'status-message';

    // Extract passwords
    const result = await window.electronAPI.extractPasswords(
      stegoImagePath,
      extractPassword.value
    );

    if (result.success) {
      extractStatus.textContent = `Success! Passwords extracted from image.`;
      extractStatus.className = 'status-message success';
      loadPasswords();
    } else {
      extractStatus.textContent = `Error: ${result.message}`;
      extractStatus.className = 'status-message error';
    }
  });

  // Initial load of passwords
  loadPasswords();
});
