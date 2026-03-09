/**
 * Notepad Application Logic
 */
document.addEventListener('DOMContentLoaded', () => {
    // Collect DOM Elements
    const editor = document.getElementById('editor');
    const wordCount = document.getElementById('word-count');
    const charCount = document.getElementById('char-count');
    const btnNew = document.getElementById('btn-new');
    const btnOpen = document.getElementById('btn-open');
    const btnSave = document.getElementById('btn-save');
    const btnClear = document.getElementById('btn-clear');
    const btnTheme = document.getElementById('btn-theme');
    const fileInput = document.getElementById('file-input');
    const statusMsg = document.getElementById('status');

    // --- 1. Dark Mode Initialization ---
    // Check localStorage for saved theme preference, default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    }

    // Toggle Theme event listener
    btnTheme.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        showStatus(`${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} mode enabled`);
    });

    // --- 2. LocalStorage Auto-save ---
    // Load previously saved content to restore after reload
    const savedContent = localStorage.getItem('notepadContent');
    if (savedContent) {
        editor.value = savedContent;
    }
    // Update counters on init and populate words/characters
    updateCounts();

    // Save on input and update word/char counts
    editor.addEventListener('input', () => {
        localStorage.setItem('notepadContent', editor.value);
        updateCounts();
    });

    /**
     * Updates the word and character counts in the footer display
     */
    function updateCounts() {
        const text = editor.value;
        const chars = text.length;
        // Split by regex matches for any whitespace to accurately count words
        const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;

        charCount.textContent = chars;
        wordCount.textContent = words;
    }

    // --- 3. Toolbar Operations ---

    // New File
    btnNew.addEventListener('click', () => {
        if (editor.value !== '') {
            editor.value = '';
            localStorage.removeItem('notepadContent');
            updateCounts();
            showStatus('New file created');
        }
        editor.focus();
    });

    // Open File
    btnOpen.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            editor.value = event.target.result;
            localStorage.setItem('notepadContent', editor.value);
            updateCounts();
            showStatus('File opened successfully');
        };
        reader.onerror = () => {
            showStatus('Error reading file');
        };
        reader.readAsText(file);

        // Reset file input to allow reading the same file again later
        fileInput.value = '';
    });

    // Save File
    btnSave.addEventListener('click', () => {
        const text = editor.value;
        if (!text) {
            showStatus('Nothing to save');
            return;
        }

        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');

        a.href = url;
        a.download = 'note.txt';
        document.body.appendChild(a);
        a.click();

        // Cleanup URL memory to avoid memory leak
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            showStatus('File saved successfully');
        }, 0);
    });

    // Clear Text
    btnClear.addEventListener('click', () => {
        if (editor.value !== '') {
            editor.value = '';
            localStorage.setItem('notepadContent', '');
            updateCounts();
            showStatus('Text cleared');
        }
        editor.focus();
    });

    // --- 4. Feedback Status ---
    let statusTimeout;
    /**
     * Shows a temporary status message in the footer
     * @param {string} msg Text to display
     */
    function showStatus(msg) {
        statusMsg.textContent = msg;
        statusMsg.classList.add('show');

        clearTimeout(statusTimeout);
        statusTimeout = setTimeout(() => {
            statusMsg.classList.remove('show');
        }, 3000);
    }
});
