// Global variables
let currentWords = [];
let currentWordIndex = 0;
// Date logic removed - using single word list
let hideWordMode = false;
let wordTimeout = 0; // in seconds, 0 means disabled
let timerInterval = null;
let currentTimerSeconds = 0;
let timerPaused = false;
let isAdminAuthenticated = false;
let adminPassword = null; // Will be loaded from localStorage or set by user
let failedAttempts = 0;
const MAX_ATTEMPTS = 5;
let currentLanguage = 'zh'; // 'en' or 'zh' - Default to Chinese
let allWordsCompleted = false;
let visitedWords = new Set();
let allowPrevious = true;
let showPauseButton = true;
let shuffleWords = false;
let showAllWords = true;
let useChineseTTS = false;
let displayWords = []; // Words array for display (may be shuffled)

// Wheel variables
let currentWheelType = 'punishment'; // 'punishment' or 'reward'
let punishmentData = [];
let rewardData = [];
let isSpinning = false;
let wheelCtx = null;
let adminCallback = null;
let spinningAudioContext = null;
let spinningOscillators = [];
let wheelAudio = null;
let highlightedSegment = -1; // Allow previous navigation by default

// DOM elements
const childModeBtn = document.getElementById('childModeBtn');
const adminModeBtn = document.getElementById('adminModeBtn');
const childMode = document.getElementById('childMode');
const adminMode = document.getElementById('adminMode');
const currentWord = document.getElementById('currentWord');
const wordMeaning = document.getElementById('wordMeaning');
const playBtn = document.getElementById('playBtn');
const nextBtn = document.getElementById('nextBtn');
const wordProgress = document.getElementById('wordProgress');
// dateInput removed - no longer using date selection
const newWord = document.getElementById('newWord');
const newMeaning = document.getElementById('newMeaning');
const addWordBtn = document.getElementById('addWordBtn');
const wordsList = document.getElementById('wordsList');
const clearWordsBtn = document.getElementById('clearWordsBtn');
const saveWordsBtn = document.getElementById('saveWordsBtn');
const hideWordToggle = document.getElementById('hideWordToggle');
const timeoutSlider = document.getElementById('timeoutSlider');
const timeoutNumber = document.getElementById('timeoutNumber');
const pauseBtn = document.getElementById('pauseBtn');
const startBtn = document.getElementById('startBtn');
const prevBtn = document.getElementById('prevBtn');
const timerContainer = document.getElementById('timerContainer');
const timerCount = document.getElementById('timerCount');
const progressBar = document.getElementById('progressBar');
const passwordModal = document.getElementById('passwordModal');
const passwordInput = document.getElementById('passwordInput');
const submitPassword = document.getElementById('submitPassword');
const cancelPassword = document.getElementById('cancelPassword');
const closeModal = document.getElementById('closeModal');
const passwordError = document.getElementById('passwordError');

// First-time password setup elements
const setupPasswordModal = document.getElementById('setupPasswordModal');
const newPasswordInput = document.getElementById('newPasswordInput');
const confirmPasswordInput = document.getElementById('confirmPasswordInput');
const setupPassword = document.getElementById('setupPassword');
const cancelSetup = document.getElementById('cancelSetup');
const closeSetupModal = document.getElementById('closeSetupModal');
const setupPasswordError = document.getElementById('setupPasswordError');
const setupErrorText = document.getElementById('setupErrorText');
const langToggle = document.getElementById('langToggle');
const currentLangSpan = document.getElementById('currentLang');
const allowPreviousToggle = document.getElementById('allowPreviousToggle');
const showPauseButtonToggle = document.getElementById('showPauseButtonToggle');
const shuffleWordsToggle = document.getElementById('shuffleWordsToggle');
const showAllWordsToggle = document.getElementById('showAllWordsToggle');
const useChineseTTSToggle = document.getElementById('useChineseTTSToggle');
const wordCount = document.getElementById('wordCount');

// Data management elements
const exportDataBtn = document.getElementById('exportDataBtn');
const importDataBtn = document.getElementById('importDataBtn');
const importFileInput = document.getElementById('importFileInput');

// Password management elements
const changePasswordBtn = document.getElementById('changePasswordBtn');
const changePasswordModal = document.getElementById('changePasswordModal');
const currentPasswordInput = document.getElementById('currentPasswordInput');
const newPasswordChangeInput = document.getElementById('newPasswordChangeInput');
const confirmNewPasswordInput = document.getElementById('confirmNewPasswordInput');
const submitChangePassword = document.getElementById('submitChangePassword');
const cancelChangePassword = document.getElementById('cancelChangePassword');
const closeChangePasswordModalBtn = document.getElementById('closeChangePasswordModal');
const changePasswordError = document.getElementById('changePasswordError');
const changePasswordErrorText = document.getElementById('changePasswordErrorText');

// Wheel elements
const wheelModeBtn = document.getElementById('wheelModeBtn');
const wheelAdminBtn = document.getElementById('wheelAdminBtn');
const wheelMode = document.getElementById('wheelMode');
const wheelAdminMode = document.getElementById('wheelAdminMode');
const punishmentWheelBtn = document.getElementById('punishmentWheelBtn');
const rewardWheelBtn = document.getElementById('rewardWheelBtn');
const wheelCanvas = document.getElementById('wheel');
const spinBtn = document.getElementById('spinBtn');
const wheelResultDisplay = document.getElementById('wheelResultDisplay');
const resultTitle = document.getElementById('resultTitle');
const resultItem = document.getElementById('resultItem');
const spinAgainBtn = document.getElementById('spinAgainBtn');

// Wheel admin elements
const punishmentAdminTab = document.getElementById('punishmentAdminTab');
const rewardAdminTab = document.getElementById('rewardAdminTab');
const punishmentAdmin = document.getElementById('punishmentAdmin');
const rewardAdmin = document.getElementById('rewardAdmin');
const punishmentItems = document.getElementById('punishmentItems');
const rewardItems = document.getElementById('rewardItems');
const addPunishmentBtn = document.getElementById('addPunishmentBtn');
const addRewardBtn = document.getElementById('addRewardBtn');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
});

function initializeApp() {
    // Load settings
    loadSettings();
    
    // Load words
    loadWords();
    
    // Initialize wheel
    initializeWheel();
    
    // Update displays
    updateChildMode();
    updateAdminMode();
}

function setupEventListeners() {
    // Debug: Log that we're setting up listeners
    console.log('Setting up event listeners...');
    console.log('Elements found:', {
        childModeBtn: !!childModeBtn,
        adminModeBtn: !!adminModeBtn,
        playBtn: !!playBtn,
        nextBtn: !!nextBtn,
        prevBtn: !!prevBtn,
        startBtn: !!startBtn,
        pauseBtn: !!pauseBtn,
        langToggle: !!langToggle
    });
    
    // Mode switching
    if (childModeBtn) {
        childModeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Child mode button clicked');
            switchMode('child');
        });
    }
    
    if (adminModeBtn) {
        adminModeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Admin mode button clicked');
            requestAdminAccess();
        });
    }
    
    // Child mode controls
    if (playBtn) {
        playBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Play button clicked');
            playCurrentWord();
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Next button clicked');
            nextWord();
        });
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Previous button clicked');
            previousWord();
        });
    }
    
    if (startBtn) {
        startBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Start button clicked');
            startFromBeginning();
        });
    }
    
    // Admin mode controls (date selection removed)
    if (addWordBtn) addWordBtn.addEventListener('click', addNewWord);
    if (clearWordsBtn) clearWordsBtn.addEventListener('click', clearAllWords);
    if (saveWordsBtn) saveWordsBtn.addEventListener('click', saveWords);
    if (hideWordToggle) hideWordToggle.addEventListener('change', onHideWordToggle);
    if (allowPreviousToggle) allowPreviousToggle.addEventListener('change', onAllowPreviousToggle);
    if (showPauseButtonToggle) showPauseButtonToggle.addEventListener('change', onShowPauseButtonToggle);
    if (shuffleWordsToggle) shuffleWordsToggle.addEventListener('change', onShuffleWordsToggle);
    if (showAllWordsToggle) showAllWordsToggle.addEventListener('change', onShowAllWordsToggle);
    if (useChineseTTSToggle) {
        useChineseTTSToggle.addEventListener('change', onUseChineseTTSToggle);
        console.log('useChineseTTSToggle event listener added successfully');
    } else {
        console.error('useChineseTTSToggle element not found in setupEventListeners!');
    }
    if (timeoutSlider) timeoutSlider.addEventListener('input', onTimeoutSliderChange);
    if (timeoutNumber) timeoutNumber.addEventListener('input', onTimeoutNumberChange);
    
    // Data management controls
    if (exportDataBtn) exportDataBtn.addEventListener('click', exportAllData);
    if (importDataBtn) importDataBtn.addEventListener('click', () => importFileInput.click());
    if (importFileInput) importFileInput.addEventListener('change', importAllData);
    
    // Password management controls
    if (changePasswordBtn) changePasswordBtn.addEventListener('click', showChangePasswordModal);
    if (submitChangePassword) submitChangePassword.addEventListener('click', changeAdminPassword);
    if (cancelChangePassword) cancelChangePassword.addEventListener('click', closeChangePasswordModal);
    if (closeChangePasswordModalBtn) closeChangePasswordModalBtn.addEventListener('click', closeChangePasswordModal);
    if (currentPasswordInput) {
        currentPasswordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                newPasswordChangeInput.focus();
            }
        });
    }
    if (newPasswordChangeInput) {
        newPasswordChangeInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                confirmNewPasswordInput.focus();
            }
        });
    }
    if (confirmNewPasswordInput) {
        confirmNewPasswordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                changeAdminPassword();
            }
        });
    }
    if (pauseBtn) {
        pauseBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Pause button clicked');
            toggleTimer();
        });
    }
    
    // Password modal controls
    if (submitPassword) submitPassword.addEventListener('click', checkPassword);
    if (cancelPassword) cancelPassword.addEventListener('click', closePasswordModal);
    if (closeModal) closeModal.addEventListener('click', closePasswordModal);
    if (passwordInput) {
        passwordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                checkPassword();
            }
        });
    }
    
    // First-time password setup modal controls
    if (setupPassword) setupPassword.addEventListener('click', setupNewPassword);
    if (cancelSetup) cancelSetup.addEventListener('click', closeSetupPasswordModal);
    if (closeSetupModal) closeSetupModal.addEventListener('click', closeSetupPasswordModal);
    if (newPasswordInput) {
        newPasswordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                confirmPasswordInput.focus();
            }
        });
    }
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                setupNewPassword();
            }
        });
    }
    
    // Language switching
    if (langToggle) {
        langToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Language toggle clicked');
            toggleLanguage();
        });
    }
    
    // Enter key support for adding words
    if (newWord) {
        newWord.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addNewWord();
            }
        });
    }
    
    if (newMeaning) {
        newMeaning.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addNewWord();
            }
        });
    }
    
    // Wheel mode buttons
    if (wheelModeBtn) {
        wheelModeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Wheel mode button clicked');
            requestWheelAccess();
        });
    }
    
    if (wheelAdminBtn) {
        wheelAdminBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Wheel admin button clicked');
            requestWheelAdminAccess();
        });
    }
    
    // Wheel type buttons
    if (punishmentWheelBtn) {
        punishmentWheelBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            switchWheelType('punishment');
        });
    }
    
    if (rewardWheelBtn) {
        rewardWheelBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            switchWheelType('reward');
        });
    }
    
    // Spin button
    if (spinBtn) {
        spinBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            spinWheel();
        });
    }
    
    if (spinAgainBtn) {
        spinAgainBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            hideWheelResult();
        });
    }
    
    
    // Wheel admin tabs
    if (punishmentAdminTab) {
        punishmentAdminTab.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            switchWheelAdminTab('punishment');
        });
    }
    
    if (rewardAdminTab) {
        rewardAdminTab.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            switchWheelAdminTab('reward');
        });
    }
    
    // Add item buttons
    if (addPunishmentBtn) {
        addPunishmentBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            addWheelItem('punishment');
        });
    }
    
    if (addRewardBtn) {
        addRewardBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            addWheelItem('reward');
        });
    }
    
    console.log('Event listeners setup complete');
}

// Mode switching functions
function switchMode(mode) {
    // Remove active class from all mode buttons
    childModeBtn.classList.remove('active');
    adminModeBtn.classList.remove('active');
    if (wheelModeBtn) wheelModeBtn.classList.remove('active');
    if (wheelAdminBtn) wheelAdminBtn.classList.remove('active');
    
    // Hide all mode containers
    childMode.classList.remove('active');
    adminMode.classList.remove('active');
    if (wheelMode) wheelMode.classList.remove('active');
    if (wheelAdminMode) wheelAdminMode.classList.remove('active');
    
    if (mode === 'child') {
        childModeBtn.classList.add('active');
        childMode.classList.add('active');
        
        // Load words when switching to child mode
        loadWords();
        updateChildMode();
        updatePauseButtonVisibility(); // Ensure pause button visibility is updated
        startTimer(); // Start timer when entering child mode
    } else if (mode === 'admin' && isAdminAuthenticated) {
        adminModeBtn.classList.add('active');
        adminMode.classList.add('active');
        
        stopTimer(); // Stop timer when leaving child mode
        updateAdminMode();
    } else if (mode === 'wheel') {
        if (wheelModeBtn) wheelModeBtn.classList.add('active');
        if (wheelMode) wheelMode.classList.add('active');
        
        stopTimer(); // Stop timer when leaving child mode
        initializeWheel();
    } else if (mode === 'wheelAdmin' && isAdminAuthenticated) {
        if (wheelAdminBtn) wheelAdminBtn.classList.add('active');
        if (wheelAdminMode) wheelAdminMode.classList.add('active');
        
        stopTimer(); // Stop timer when leaving child mode
        stopSpinningMusic(); // Stop wheel music when leaving wheel mode
        updateWheelAdminMode();
    }
    
    // Stop wheel music when leaving wheel mode
    if (mode !== 'wheel') {
        stopSpinningMusic();
    }
}

// Password protection functions
function requestAdminAccess(callback = null) {
    if (isAdminAuthenticated) {
        // Already authenticated, switch directly
        if (callback) {
            callback();
        } else {
            switchMode('admin');
        }
        return;
    }
    
    // Check if password has been set up
    if (!adminPassword) {
        // First time setup - show setup modal
        adminCallback = callback;
        showSetupPasswordModal();
        return;
    }
    
    // Check if too many failed attempts
    if (failedAttempts >= MAX_ATTEMPTS) {
        showNotification('Too many failed attempts. Please refresh the page to try again.', 'error');
        return;
    }
    
    // Store callback and show password modal
    adminCallback = callback;
    showPasswordModal();
}

function showPasswordModal() {
    passwordModal.style.display = 'flex';
    passwordInput.value = '';
    passwordError.style.display = 'none';
    passwordInput.focus();
    
    // Disable submit button initially
    submitPassword.disabled = false;
}

function closePasswordModal() {
    passwordModal.style.display = 'none';
    passwordInput.value = '';
    passwordError.style.display = 'none';
}

function checkPassword() {
    const enteredPassword = passwordInput.value.trim();
    
    if (enteredPassword === adminPassword) {
        // Correct password
        isAdminAuthenticated = true;
        closePasswordModal();
        
        if (adminCallback) {
            adminCallback();
            adminCallback = null;
        } else {
            switchMode('admin');
        }
        
        showNotification(getTranslatedText('Welcome to Admin Mode!', '欢迎进入管理模式！'), 'success');
        failedAttempts = 0; // Reset failed attempts
    } else {
        // Incorrect password
        failedAttempts++;
        passwordError.style.display = 'block';
        passwordInput.value = '';
        passwordInput.focus();
        
        // Add shake animation to modal
        const modalContent = document.querySelector('.modal-content');
        modalContent.style.animation = 'shake 0.5s ease';
        setTimeout(() => {
            modalContent.style.animation = '';
        }, 500);
        
        if (failedAttempts >= MAX_ATTEMPTS) {
            passwordError.textContent = `❌ Too many failed attempts (${failedAttempts}/${MAX_ATTEMPTS}). Please refresh the page.`;
            submitPassword.disabled = true;
            passwordInput.disabled = true;
        } else {
            passwordError.textContent = `❌ Incorrect password. ${MAX_ATTEMPTS - failedAttempts} attempts remaining.`;
        }
    }
}

// First-time password setup functions
function showSetupPasswordModal() {
    setupPasswordModal.style.display = 'flex';
    newPasswordInput.value = '';
    confirmPasswordInput.value = '';
    setupPasswordError.style.display = 'none';
    newPasswordInput.focus();
    
    // Update translations
    updateAllTranslations();
}

function closeSetupPasswordModal() {
    setupPasswordModal.style.display = 'none';
    newPasswordInput.value = '';
    confirmPasswordInput.value = '';
    setupPasswordError.style.display = 'none';
}

function setupNewPassword() {
    const newPassword = newPasswordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();
    
    // Validate password requirements
    if (newPassword !== confirmPassword) {
        showSetupError(getTranslatedText('Passwords do not match. Please try again.', '密码不匹配。请重试。'));
        return;
    }
    
    // Save the new password
    adminPassword = newPassword;
    saveSettings();
    
    // Close modal and proceed with admin access
    closeSetupPasswordModal();
    isAdminAuthenticated = true;
    
    if (adminCallback) {
        adminCallback();
        adminCallback = null;
    } else {
        switchMode('admin');
    }
    
    showNotification(
        getTranslatedText('Admin password set successfully! Welcome to Admin Mode!', '管理员密码设置成功！欢迎进入管理模式！'),
        'success'
    );
}

function showSetupError(message) {
    setupErrorText.textContent = message;
    setupPasswordError.style.display = 'block';
    
    // Add shake animation to modal
    const modalContent = setupPasswordModal.querySelector('.modal-content');
    modalContent.style.animation = 'shake 0.5s ease';
    setTimeout(() => {
        modalContent.style.animation = '';
    }, 500);
    
    // Clear inputs and focus on first input
    newPasswordInput.value = '';
    confirmPasswordInput.value = '';
    newPasswordInput.focus();
}

// Child mode functions
function updateChildMode() {
    const learningCard = document.querySelector('.learning-card');
    const wordDisplay = document.querySelector('.word-display');
    
    // Ensure currentWords is an array
    if (!Array.isArray(currentWords)) {
        currentWords = [];
    }
    
    // Ensure displayWords is updated
    if (!Array.isArray(displayWords)) {
        updateDisplayWords();
    }
    
    if (displayWords.length === 0) {
        currentWord.textContent = getTranslatedText("No words for today!", "今天没有单词！");
        wordMeaning.textContent = getTranslatedText("Ask your teacher to add some words.", "请让老师添加一些单词。");
        wordProgress.textContent = "0/0";
        updateWordCount(0, 0);
        playBtn.disabled = true;
        nextBtn.disabled = true;
        prevBtn.disabled = true;
        startBtn.disabled = true;
        allWordsCompleted = false;
        visitedWords.clear();
        
        // Remove special modes when no words
        learningCard.classList.remove('listening-mode', 'completed-mode');
        wordDisplay.classList.remove('hidden-mode', 'completed-mode');
    } else if (allWordsCompleted) {
        // Show completion state
        showCompletionState(learningCard, wordDisplay);
    } else {
        // Single word mode
        const word = displayWords[currentWordIndex];
        
        if (hideWordMode) {
            // Hide word mode - listening practice
            // Apply hidden mode FIRST to prevent any flash
            wordDisplay.classList.add('hidden-mode');
            learningCard.classList.add('listening-mode');
            
            // Then set content (will be hidden due to CSS)
            currentWord.textContent = word.word; // Still set for screen readers
            wordMeaning.textContent = word.meaning || "";
            
            // Update title for listening mode
            const title = document.querySelector('.learning-card .title');
            title.textContent = getTranslatedText('🎧 Listening Practice', '🎧 听力练习');
        } else {
            // Normal mode - show words
            // Remove hidden mode FIRST
            wordDisplay.classList.remove('hidden-mode');
            learningCard.classList.remove('listening-mode');
            
            // Then set content (will be visible)
            currentWord.textContent = word.word;
            wordMeaning.textContent = word.meaning || "";
            
            // Reset title
            const title = document.querySelector('.learning-card .title');
            title.textContent = getTranslatedText("Today's English Word", "今天的英语单词");
        }
        
        wordProgress.textContent = `${currentWordIndex + 1}/${displayWords.length}`;
        updateWordCount(currentWordIndex + 1, displayWords.length);
        playBtn.disabled = false;
        nextBtn.disabled = false;
        
        // Track visited words
        if (displayWords[currentWordIndex]) {
            visitedWords.add(displayWords[currentWordIndex].id || currentWordIndex);
        }
        
        // Update navigation button states
        updateNavigationButtons();
    }
    
    // Update timer display
    updateTimerDisplay();
    
    // Update pause button visibility
    updatePauseButtonVisibility();
}

async function generateCompletionTable() {
    const tableBody = document.getElementById('completion-table-body');
    if (!tableBody) return;
    
    try {
        const tableRows = await Promise.all(displayWords.map(async (word, index) => {
            let meaning = word.meaning;
            if (!meaning || meaning.trim() === '') {
                try {
                    meaning = await getChineseMeaning(word.word);
                } catch (error) {
                    meaning = '';
                }
            }
            return `
                <tr>
                    <td>${index + 1}</td>
                    <td class="word-col">${escapeHtml(word.word)}</td>
                    <td class="meaning-col">${escapeHtml(meaning || '-')}</td>
                    <td><button class="play-word-btn-small" onclick="playWordInEnglish('${escapeHtml(word.word)}')" title="${getTranslatedText('Play English', '播放英文')}">🔊</button></td>
                </tr>
            `;
        }));
        
        tableBody.innerHTML = tableRows.join('');
    } catch (error) {
        console.error('Error generating completion table:', error);
        tableBody.innerHTML = `
            <tr><td colspan="4" style="text-align: center; padding: 20px; color: #e74c3c;">
                ${getTranslatedText('Error loading translations', '翻译加载失败')}
            </td></tr>
        `;
    }
}

function updateWordCount(current, total) {
    if (wordCount) {
        const currentText = getTranslatedText(
            `${current} of ${total} words`,
            `${current} 个单词，共 ${total} 个`
        );
        
        // Update the data attributes for proper translation
        wordCount.setAttribute('data-en', `${current} of ${total} words`);
        wordCount.setAttribute('data-zh', `${current} 个单词，共 ${total} 个`);
        wordCount.textContent = currentText;
    }
}

function showCompletionState(learningCard, wordDisplay) {
    // Play completion sound
    playWordCompletionSound();
    
    // Add completion mode classes
    learningCard.classList.add('completed-mode');
    wordDisplay.classList.add('completed-mode');
    learningCard.classList.remove('listening-mode');
    wordDisplay.classList.remove('hidden-mode');
    
    if (showAllWords) {
        // Show all words list after completion
        const title = document.querySelector('.learning-card .title');
        if (title) {
            title.textContent = getTranslatedText("🎉 All Done! Here are all the words:", "🎉 全部完成！以下是所有单词：");
        }
        
        // Create all words display - table format with actual study order
        const tableHeaderHtml = `
            <table class="completion-words-table">
                <thead>
                    <tr>
                        <th data-en="Index" data-zh="序号">序号</th>
                        <th data-en="English" data-zh="英文">英文</th>
                        <th data-en="Chinese" data-zh="中文">中文</th>
                        <th data-en="Play" data-zh="播放">播放</th>
                    </tr>
                </thead>
                <tbody id="completion-table-body">
                    <tr><td colspan="4" style="text-align: center; padding: 20px;">
                        ${getTranslatedText('Loading translations...', '正在加载翻译...')}
                    </td></tr>
                </tbody>
            </table>
        `;
        
        if (currentWord) {
            currentWord.innerHTML = tableHeaderHtml;
        }
        
        // Asynchronously populate the table
        generateCompletionTable();
        
        if (wordMeaning) {
            wordMeaning.textContent = '';
        }
    } else {
        // Original completion message
        // Update the data attributes for proper translation
        if (currentWord) {
            currentWord.setAttribute('data-en', '🎉 All Done!');
            currentWord.setAttribute('data-zh', '🎉 全部完成！');
            currentWord.textContent = getTranslatedText("🎉 All Done!", "🎉 全部完成！");
        }
        
        if (wordMeaning) {
            wordMeaning.setAttribute('data-en', 'Great job! You\'ve completed all words.');
            wordMeaning.setAttribute('data-zh', '做得很好！你已经完成了所有单词。');
            wordMeaning.textContent = getTranslatedText("Great job! You've completed all words.", "做得很好！你已经完成了所有单词。");
        }
    }
    
    // Hide progress bar and word count in completion state
    const progressElement = document.querySelector('.progress');
    if (progressElement) {
        progressElement.style.display = 'none';
    }
    
    // Reset title
    const title = document.querySelector('.learning-card .title');
    if (title) {
        title.setAttribute('data-en', 'Congratulations!');
        title.setAttribute('data-zh', '恭喜！');
        title.textContent = getTranslatedText("Congratulations!", "恭喜！");
    }
    
    // Enable navigation buttons but disable play/next
    playBtn.disabled = true;
    nextBtn.disabled = true;
    prevBtn.disabled = !allowPrevious; // Allow going back only if admin permits
    startBtn.disabled = !allowPrevious; // Allow restarting only if admin permits
    
    // Show restart message based on navigation permissions
    if (allowPrevious) {
        showNotification(getTranslatedText('Congratulations! Use "Previous" to review or "Start Over" to practice again.', '恭喜！使用"上一个"回顾或"重新开始"再次练习。'), 'success');
    } else {
        showNotification(getTranslatedText('Congratulations! You have completed all words!', '恭喜！你已经完成了所有单词！'), 'success');
    }
}

function restoreOriginalAttributes() {
    // Restore original data attributes for currentWord
    if (currentWord) {
        currentWord.setAttribute('data-en', 'Click Next to start!');
        currentWord.setAttribute('data-zh', '点击下一个开始！');
    }
    
    // Clear meaning attributes (it doesn't have default data attributes)
    if (wordMeaning) {
        wordMeaning.removeAttribute('data-en');
        wordMeaning.removeAttribute('data-zh');
    }
    
    // Restore title attributes
    const title = document.querySelector('.learning-card .title');
    if (title) {
        title.setAttribute('data-en', "Today's English Word");
        title.setAttribute('data-zh', '今天的英语单词');
    }
    
    // Restore progress display
    const progressElement = document.querySelector('.progress');
    if (progressElement) {
        progressElement.style.display = 'flex';
    }
}

async function playCurrentWord() {
    if (displayWords.length === 0) return;
    
    const currentWordData = displayWords[currentWordIndex];
    
    // Choose text to speak based on setting
    let textToSpeak, language;
    console.log('useChineseTTS:', useChineseTTS);
    console.log('currentWordData:', currentWordData);
    
    if (useChineseTTS) {
        // Try to get Chinese meaning
        let chineseMeaning = currentWordData.meaning;
        if (!chineseMeaning || chineseMeaning.trim() === '') {
            // If no meaning provided, try to get translation from API
            try {
                chineseMeaning = await getChineseMeaning(currentWordData.word);
            } catch (error) {
                console.error('Failed to get Chinese meaning:', error);
                chineseMeaning = null;
            }
        }
        
        if (chineseMeaning) {
            textToSpeak = chineseMeaning;
            language = 'chinese';
            console.log('Using Chinese TTS:', textToSpeak);
        } else {
            // Fallback to English if no Chinese meaning available
            textToSpeak = currentWordData.word;
            language = 'english';
            console.log('No Chinese meaning found, using English TTS:', textToSpeak);
        }
    } else {
        textToSpeak = currentWordData.word;
        language = 'english';
        console.log('Using English TTS:', textToSpeak);
    }
    
    // Add visual feedback
    playBtn.classList.add('loading');
    const textSpan = playBtn.querySelector('[data-en]');
    if (textSpan) {
        textSpan.textContent = getTranslatedText('Playing...', '播放中...');
    }
    
    try {
        // Use appropriate TTS function based on language setting
        if (language === 'chinese') {
            await playWordWithAPI(textToSpeak, 'chinese');
        } else {
            await playWordWithAPI(textToSpeak, 'english');
        }
    } catch (error) {
        console.log('API failed, using browser speech synthesis:', error);
        if (language === 'chinese') {
            playWordWithBrowserAPI(textToSpeak, 'zh-CN');
        } else {
            playWordWithBrowserAPI(textToSpeak, 'en-US');
        }
    }
    
    // Add bounce animation to the word
    currentWord.classList.add('bounce');
    setTimeout(() => {
        currentWord.classList.remove('bounce');
    }, 600);
}

async function playWordWithAPI(text, language = 'english') {
    console.log('playWordWithAPI called with:', { text, language });
    
    // Method 1: ResponsiveVoice (if available)
    if (typeof responsiveVoice !== 'undefined') {
        return new Promise((resolve, reject) => {
            const voice = language === 'chinese' ? "Chinese Female" : "US English Female";
            console.log('Using ResponsiveVoice with voice:', voice);
            responsiveVoice.speak(text, voice, {
                rate: language === 'chinese' ? 0.7 : 0.8,
                pitch: 1,
                volume: 1,
                onend: () => {
                    playBtn.classList.remove('loading');
                    updatePlayButtonText();
                    resolve();
                },
                onerror: (error) => {
                    reject(error);
                }
            });
        });
    }
    
    // Method 2: Using Free TTS API (no API key required)
    try {
        // Using a free text-to-speech service
        const langCode = language === 'chinese' ? 'zh' : 'en';
        const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${langCode}&client=tw-ob&q=${encodeURIComponent(text)}`;
        console.log('Using Google TTS with URL:', audioUrl);
        
        const audio = new Audio();
        audio.crossOrigin = "anonymous";
        
        return new Promise((resolve, reject) => {
            audio.onended = () => {
                playBtn.classList.remove('loading');
                updatePlayButtonText();
                resolve();
            };
            
            audio.onerror = () => {
                reject(new Error('Audio playback failed'));
            };
            
            audio.oncanplaythrough = () => {
                audio.play().catch(reject);
            };
            
            // Set the source
            audio.src = audioUrl;
            audio.load();
        });
    } catch (error) {
        throw new Error('TTS API unavailable');
    }
}

function playWordWithBrowserAPI(text, lang = 'en-US') {
    console.log('playWordWithBrowserAPI called with:', { text, lang });
    
    // Fallback to browser's built-in speech synthesis
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = lang === 'zh-CN' ? 0.7 : 0.8;
        utterance.pitch = 1.2;
        utterance.volume = 1;
        
        utterance.onend = function() {
            playBtn.classList.remove('loading');
            updatePlayButtonText();
        };
        
        utterance.onerror = function() {
            playBtn.classList.remove('loading');
            updatePlayButtonText();
            showNotification(getTranslatedText('Sorry, speech synthesis failed. Please try again.', '抱歉，语音合成失败。请重试。'), 'error');
        };
        
        speechSynthesis.speak(utterance);
    } else {
        playBtn.classList.remove('loading');
        updatePlayButtonText();
        showNotification(getTranslatedText('Speech synthesis is not supported in your browser.', '您的浏览器不支持语音合成。'), 'error');
    }
}

function nextWord() {
    if (displayWords.length === 0) return;
    
    // Check if we're at the last word and all words have been visited
    if (currentWordIndex === displayWords.length - 1 && visitedWords.size >= displayWords.length) {
        // Show completion state instead of wrapping around
        allWordsCompleted = true;
        stopTimer();
        updateChildMode();
        return;
    }
    
    // Stop current timer
    stopTimer();
    
    // Pre-apply hidden mode styling to prevent flash
    const wordDisplay = document.querySelector('.word-display');
    const learningCard = document.querySelector('.learning-card');
    if (hideWordMode) {
        wordDisplay.classList.add('hidden-mode');
        learningCard.classList.add('listening-mode');
    }
    
    currentWordIndex = (currentWordIndex + 1) % displayWords.length;
    updateChildMode();
    
    // Auto-play the new word
    setTimeout(() => {
        playCurrentWord();
    }, 300); // Small delay to ensure UI is updated
    
    // Add fade-in animation only if not in hidden mode
    if (!hideWordMode) {
        currentWord.classList.add('fade-in');
        setTimeout(() => {
            currentWord.classList.remove('fade-in');
        }, 500);
    }
    
    // Start timer for new word
    startTimer();
}

function previousWord() {
    if (displayWords.length === 0) return;
    
    // Stop current timer
    stopTimer();
    
    // If we're in completion state, exit it when going back
    if (allWordsCompleted) {
        allWordsCompleted = false;
        const learningCard = document.querySelector('.learning-card');
        const wordDisplay = document.querySelector('.word-display');
        learningCard.classList.remove('completed-mode');
        wordDisplay.classList.remove('completed-mode');
        
        // Restore original data attributes
        restoreOriginalAttributes();
    }
    
    // Pre-apply hidden mode styling to prevent flash
    const wordDisplay = document.querySelector('.word-display');
    const learningCard = document.querySelector('.learning-card');
    if (hideWordMode) {
        wordDisplay.classList.add('hidden-mode');
        learningCard.classList.add('listening-mode');
    }
    
    // Move to previous word (with wrap-around)
    currentWordIndex = currentWordIndex === 0 ? displayWords.length - 1 : currentWordIndex - 1;
    updateChildMode();
    
    // Auto-play the new word
    setTimeout(() => {
        playCurrentWord();
    }, 300); // Small delay to ensure UI is updated
    
    // Add fade-in animation only if not in hidden mode
    if (!hideWordMode) {
        currentWord.classList.add('fade-in');
        setTimeout(() => {
            currentWord.classList.remove('fade-in');
        }, 500);
    }
    
    // Start timer for new word
    startTimer();
}

function startFromBeginning() {
    if (currentWords.length === 0) return;
    
    // Stop current timer
    stopTimer();
    
    // Reset completion state
    allWordsCompleted = false;
    visitedWords.clear();
    
    // Pre-apply hidden mode styling to prevent flash
    const wordDisplay = document.querySelector('.word-display');
    const learningCard = document.querySelector('.learning-card');
    if (hideWordMode) {
        wordDisplay.classList.add('hidden-mode');
        learningCard.classList.add('listening-mode');
    }
    
    // Remove completion mode
    learningCard.classList.remove('completed-mode');
    wordDisplay.classList.remove('completed-mode');
    
    // Restore original data attributes
    restoreOriginalAttributes();
    
    // Reset to first word
    currentWordIndex = 0;
    updateChildMode();
    
    // Auto-play the first word
    setTimeout(() => {
        playCurrentWord();
    }, 300); // Small delay to ensure UI is updated
    
    // Add fade-in animation only if not in hidden mode
    if (!hideWordMode && !allWordsCompleted) {
        currentWord.classList.add('fade-in');
        setTimeout(() => {
            currentWord.classList.remove('fade-in');
        }, 500);
    }
    
    // Start timer for new word
    startTimer();
    
    // Show notification with total count
    const message = getTranslatedText(
        `Started from the beginning! Total words: ${currentWords.length}`,
        `从头开始！总单词数：${currentWords.length}`
    );
    showNotification(message, 'info');
}

function updateNavigationButtons() {
    if (currentWords.length === 0) {
        prevBtn.disabled = true;
        startBtn.disabled = true;
        nextBtn.disabled = true;
        return;
    }
    
    // Enable buttons based on settings and state
    prevBtn.disabled = !allowPrevious; // Disable if not allowed by admin
    startBtn.disabled = !allowPrevious; // Start over also requires previous navigation permission
    nextBtn.disabled = false;
    
    // Add visual feedback for current position
    if (currentWordIndex === 0) {
        startBtn.style.opacity = '0.6';
    } else {
        startBtn.style.opacity = '1';
    }
    
    // Hide buttons if not allowed
    if (!allowPrevious) {
        prevBtn.style.display = 'none';
        startBtn.style.display = 'none';
    } else {
        prevBtn.style.display = 'inline-flex';
        startBtn.style.display = 'inline-flex';
    }
}

// Admin mode functions
function addNewWord() {
    const word = newWord.value.trim();
    const meaning = newMeaning.value.trim();
    
    if (!word) {
        alert('Please enter a word!');
        newWord.focus();
        return;
    }
    
    // Check if word already exists
    const existingWord = currentWords.find(w => w.word.toLowerCase() === word.toLowerCase());
    if (existingWord) {
        alert('This word already exists!');
        newWord.focus();
        return;
    }
    
    // Add word to current list
    currentWords.push({
        word: word,
        meaning: meaning,
        id: Date.now() // Simple ID generation
    });
    
    // Clear input fields
    newWord.value = '';
    newMeaning.value = '';
    newWord.focus();
    
    // Update display
    updateAdminMode();
    
    // Auto-save
    saveWordsToStorage();
    
    // Show success feedback
    addWordBtn.textContent = 'Added!';
    addWordBtn.style.background = 'linear-gradient(135deg, #00b894 0%, #00cec9 100%)';
    setTimeout(() => {
        addWordBtn.textContent = 'Add Word';
        addWordBtn.style.background = '';
    }, 1000);
}

function updateAdminMode() {
    // Ensure currentWords is an array
    if (!Array.isArray(currentWords)) {
        currentWords = [];
    }
    
    if (currentWords.length === 0) {
        const noWordsText = getTranslatedText('No words added for this date. Add some words above!', '此日期尚未添加单词。请在上面添加一些单词！');
        wordsList.innerHTML = `<p class="no-words" data-en="No words added for this date. Add some words above!" data-zh="此日期尚未添加单词。请在上面添加一些单词！">${noWordsText}</p>`;
    } else {
        const deleteText = getTranslatedText('Delete', '删除');
        const playEnText = getTranslatedText('🔊 EN', '🔊 英');
        const playZhText = getTranslatedText('🔊 ZH', '🔊 中');
        wordsList.innerHTML = currentWords.map((word, index) => `
            <div class="word-item">
                <div class="word-info">
                    <div class="word-text">${escapeHtml(word.word)}</div>
                    ${word.meaning ? `<div class="word-meaning-text">${escapeHtml(word.meaning)}</div>` : ''}
                </div>
                <div class="word-actions">
                    <button class="play-en-btn" onclick="playWordInEnglish('${escapeHtml(word.word)}')" data-en="🔊 EN" data-zh="🔊 英" title="${getTranslatedText('Play in English', '英文发音')}">${playEnText}</button>
                    ${word.meaning ? `<button class="play-zh-btn" onclick="playWordInChinese('${escapeHtml(word.meaning)}')" data-en="🔊 ZH" data-zh="🔊 中" title="${getTranslatedText('Play in Chinese', '中文发音')}">${playZhText}</button>` : ''}
                    <button class="delete-btn" onclick="deleteWord(${word.id})" data-en="Delete" data-zh="删除">${deleteText}</button>
                </div>
            </div>
        `).join('');
    }
}

function deleteWord(wordId) {
    currentWords = currentWords.filter(word => word.id !== wordId);
    updateAdminMode();
    saveWordsToStorage();
}

function clearAllWords() {
    if (currentWords.length === 0) {
        alert('No words to clear!');
        return;
    }
    
    if (confirm(`Are you sure you want to delete all ${currentWords.length} words for ${selectedDate}?`)) {
        currentWords = [];
        updateAdminMode();
        saveWordsToStorage();
    }
}

function saveWords() {
    saveWordsToStorage();
    
    // Show success feedback
    saveWordsBtn.textContent = 'Saved!';
    saveWordsBtn.style.background = 'linear-gradient(135deg, #00b894 0%, #00cec9 100%)';
    setTimeout(() => {
        saveWordsBtn.textContent = 'Save Changes';
        saveWordsBtn.style.background = '';
    }, 1000);
}

// Utility functions
// Cache for translated meanings to avoid repeated API calls
const translationCache = new Map();

async function getChineseMeaning(word) {
    // Check cache first
    const cacheKey = word.toLowerCase();
    if (translationCache.has(cacheKey)) {
        console.log('Using cached translation for:', word);
        return translationCache.get(cacheKey);
    }

    // Default meanings for common words (fallback)
    const defaultMeanings = {
        'snake': '蛇', 'bird': '鸟', 'fish': '鱼', 'lion': '狮子', 'tiger': '老虎',
        'elephant': '大象', 'monkey': '猴子', 'rabbit': '兔子', 'mouse': '老鼠', 'horse': '马',
        'cow': '牛', 'pig': '猪', 'sheep': '羊', 'chicken': '鸡', 'duck': '鸭子',
        'sun': '太阳', 'moon': '月亮', 'star': '星星', 'cloud': '云', 'rain': '雨',
        'snow': '雪', 'wind': '风', 'fire': '火', 'earth': '地球', 'mountain': '山',
        'hello': '你好', 'world': '世界', 'apple': '苹果', 'book': '书', 'water': '水',
        'cat': '猫', 'dog': '狗', 'car': '车', 'house': '房子', 'school': '学校',
        'good': '好', 'bad': '坏', 'big': '大', 'small': '小', 'new': '新',
        'old': '老', 'hot': '热', 'cold': '冷', 'yes': '是', 'no': '不'
    };

    try {
        console.log('Translating word via API:', word);
        
        // Try multiple translation APIs
        let translation = await translateWithGoogleAPI(word);
        
        if (!translation) {
            // Fallback to LibreTranslate API
            translation = await translateWithLibreTranslateAPI(word);
        }
        
        if (!translation) {
            // Final fallback to default meanings
            translation = defaultMeanings[cacheKey];
        }

        if (translation) {
            // Cache the result
            translationCache.set(cacheKey, translation);
            console.log('Translation result:', word, '->', translation);
            return translation;
        }
        
        return null;
    } catch (error) {
        console.error('Translation error:', error);
        // Return default meaning if API fails
        const defaultTranslation = defaultMeanings[cacheKey];
        if (defaultTranslation) {
            translationCache.set(cacheKey, defaultTranslation);
        }
        return defaultTranslation || null;
    }
}

async function translateWithGoogleAPI(word) {
    try {
        // Use Google Translate API (free, no key required)
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=zh&dt=t&q=${encodeURIComponent(word)}`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Google API failed');
        
        const data = await response.json();
        if (data && data[0] && data[0][0] && data[0][0][0]) {
            return data[0][0][0];
        }
        return null;
    } catch (error) {
        console.log('Google API failed:', error);
        return null;
    }
}

async function translateWithLibreTranslateAPI(word) {
    try {
        // Use LibreTranslate API (free, no key required)
        const url = 'https://libretranslate.de/translate';
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                q: word,
                source: 'en',
                target: 'zh',
                format: 'text'
            })
        });
        
        if (!response.ok) throw new Error('LibreTranslate API failed');
        
        const data = await response.json();
        if (data && data.translatedText) {
            return data.translatedText;
        }
        return null;
    } catch (error) {
        console.log('LibreTranslate API failed:', error);
        return null;
    }
}

function updateDisplayWords() {
    if (shuffleWords && currentWords.length > 0) {
        displayWords = shuffleArray([...currentWords]);
    } else {
        displayWords = [...currentWords];
    }
}

function playWordByIndex(index) {
    if (currentWords[index]) {
        const word = currentWords[index].word;
        playWordInEnglish(word);
    }
}

function playWordInEnglish(word) {
    // Try ResponsiveVoice first (best quality)
    if (typeof responsiveVoice !== 'undefined') {
        responsiveVoice.speak(word, "US English Female", {
            rate: 0.8,
            pitch: 1,
            volume: 1
        });
        return;
    }
    
    // Try Google Translate API (fallback)
    const audio = new Audio(`https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(word)}&tl=en&client=tw-ob`);
    audio.play().catch(() => {
        // Fallback to browser's built-in speech synthesis
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(word);
            utterance.lang = 'en-US';
            utterance.rate = 0.8;
            utterance.pitch = 1;
            utterance.volume = 1;
            speechSynthesis.speak(utterance);
        }
    });
}

function playWordInChinese(meaning) {
    // Try ResponsiveVoice first (best quality for Chinese)
    if (typeof responsiveVoice !== 'undefined') {
        responsiveVoice.speak(meaning, "Chinese Female", {
            rate: 0.7,
            pitch: 1,
            volume: 1
        });
        return;
    }
    
    // Try Google Translate API for Chinese
    const audio = new Audio(`https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(meaning)}&tl=zh&client=tw-ob`);
    audio.play().catch(() => {
        // Fallback to browser's built-in speech synthesis
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(meaning);
            utterance.lang = 'zh-CN';
            utterance.rate = 0.7;
            utterance.pitch = 1;
            utterance.volume = 1;
            speechSynthesis.speak(utterance);
        }
    });
}

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Local storage functions
function saveWordsToStorage() {
    localStorage.setItem('englishWords', JSON.stringify(currentWords));
}

function loadWords() {
    const stored = JSON.parse(localStorage.getItem('englishWords') || '[]');
    
    // Ensure currentWords is always an array (handle legacy data format)
    if (Array.isArray(stored)) {
        currentWords = stored;
    } else {
        // Convert legacy object format to array (take first available date's words)
        const firstDate = Object.keys(stored)[0];
        currentWords = firstDate ? stored[firstDate] : [];
        // Save in new format
        saveWordsToStorage();
    }
    
    // Add default words if no words exist
    if (currentWords.length === 0) {
        currentWords = [
            { word: 'hello', meaning: '你好' },
            { word: 'world', meaning: '世界' },
            { word: 'apple', meaning: '苹果' },
            { word: 'book', meaning: '书' },
            { word: 'water', meaning: '水' }
        ];
        // Save default words
        saveWordsToStorage();
    }
    
    // Update display words (apply shuffle if needed)
    updateDisplayWords();
    
    currentWordIndex = 0;
    // Reset completion state when loading words
    allWordsCompleted = false;
    visitedWords.clear();
}

// Settings management
function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('englishLearningSettings') || '{}');
    hideWordMode = settings.hideWordMode || false;
    allowPrevious = settings.allowPrevious !== undefined ? settings.allowPrevious : true;
    showPauseButton = settings.showPauseButton !== undefined ? settings.showPauseButton : true;
    shuffleWords = settings.shuffleWords || false;
    showAllWords = settings.showAllWords !== undefined ? settings.showAllWords : true;
    useChineseTTS = settings.useChineseTTS || false;
    console.log('Loading useChineseTTS setting:', useChineseTTS);
    wordTimeout = settings.wordTimeout || 0;
    currentLanguage = settings.language || 'zh';
    adminPassword = settings.adminPassword || null; // Load custom admin password
    
    hideWordToggle.checked = hideWordMode;
    if (allowPreviousToggle) allowPreviousToggle.checked = allowPrevious;
    if (showPauseButtonToggle) showPauseButtonToggle.checked = showPauseButton;
    if (shuffleWordsToggle) shuffleWordsToggle.checked = shuffleWords;
    if (showAllWordsToggle) showAllWordsToggle.checked = showAllWords;
    if (useChineseTTSToggle) {
        useChineseTTSToggle.checked = useChineseTTS;
        console.log('Setting useChineseTTSToggle.checked to:', useChineseTTS);
    } else {
        console.log('useChineseTTSToggle element not found!');
    }
    timeoutSlider.value = wordTimeout;
    timeoutNumber.value = wordTimeout;
    
    // Update language display and apply translations
    updateLanguageDisplay();
    updateAllTranslations();
    
    // Update pause button visibility
    updatePauseButtonVisibility();
}

function saveSettings() {
    const settings = {
        hideWordMode: hideWordMode,
        allowPrevious: allowPrevious,
        showPauseButton: showPauseButton,
        shuffleWords: shuffleWords,
        showAllWords: showAllWords,
        useChineseTTS: useChineseTTS,
        wordTimeout: wordTimeout,
        language: currentLanguage,
        adminPassword: adminPassword // Save custom admin password
    };
    localStorage.setItem('englishLearningSettings', JSON.stringify(settings));
}

function onHideWordToggle() {
    hideWordMode = hideWordToggle.checked;
    saveSettings();
    updateChildMode();
    
    // Show notification
    if (hideWordMode) {
        showNotification(getTranslatedText('Listening practice mode enabled! Words are now hidden.', '听力练习模式已启用！单词现在被隐藏。'), 'success');
    } else {
        showNotification(getTranslatedText('Normal mode enabled! Words are now visible.', '普通模式已启用！单词现在可见。'), 'info');
    }
}

function onAllowPreviousToggle() {
    allowPrevious = allowPreviousToggle.checked;
    saveSettings();
    updateNavigationButtons();
    
    // Show notification
    if (allowPrevious) {
        showNotification(getTranslatedText('Previous navigation enabled! Children can go back to earlier words.', '上一个导航已启用！儿童可以返回到之前的单词。'), 'success');
    } else {
        showNotification(getTranslatedText('Previous navigation disabled! Children can only move forward.', '上一个导航已禁用！儿童只能向前移动。'), 'info');
    }
}

function onShowPauseButtonToggle() {
    showPauseButton = showPauseButtonToggle.checked;
    saveSettings();
    updatePauseButtonVisibility();
    
    // Show notification
    if (showPauseButton) {
        showNotification(getTranslatedText('Pause button enabled! Children can pause the timer.', '暂停按钮已启用！儿童可以暂停计时器。'), 'success');
    } else {
        showNotification(getTranslatedText('Pause button disabled! Timer will run continuously.', '暂停按钮已禁用！计时器将连续运行。'), 'info');
    }
}

function onShuffleWordsToggle() {
    shuffleWords = shuffleWordsToggle.checked;
    saveSettings();
    updateDisplayWords(); // Update display words to apply/remove shuffle
    currentWordIndex = 0; // Reset to first word
    allWordsCompleted = false;
    visitedWords.clear();
    updateChildMode();
    updateAdminMode();
    
    // Show notification
    if (shuffleWords) {
        showNotification(getTranslatedText('Word shuffling enabled! Words will be in random order.', '单词打乱已启用！单词将以随机顺序显示。'), 'success');
    } else {
        showNotification(getTranslatedText('Word shuffling disabled! Words will be in original order.', '单词打乱已禁用！单词将以原始顺序显示。'), 'info');
    }
}

function onShowAllWordsToggle() {
    showAllWords = showAllWordsToggle.checked;
    saveSettings();
    updateChildMode();
    
    // Show notification
    if (showAllWords) {
        showNotification(getTranslatedText('Show all words enabled! After completion, all words will be displayed for review.', '显示所有单词已启用！完成后将显示所有单词供复习。'), 'success');
    } else {
        showNotification(getTranslatedText('Show all words disabled! Only completion message will be shown.', '显示所有单词已禁用！仅显示完成消息。'), 'info');
    }
}

function onUseChineseTTSToggle() {
    useChineseTTS = useChineseTTSToggle.checked;
    console.log('useChineseTTS toggle changed to:', useChineseTTS);
    saveSettings();
    
    // Show notification
    if (useChineseTTS) {
        showNotification(getTranslatedText('Chinese pronunciation enabled! Play button will speak Chinese meanings.', '中文发音已启用！播放按钮将朗读中文意思。'), 'success');
    } else {
        showNotification(getTranslatedText('English pronunciation enabled! Play button will speak English words.', '英文发音已启用！播放按钮将朗读英文单词。'), 'info');
    }
}

function onTimeoutSliderChange() {
    wordTimeout = parseInt(timeoutSlider.value);
    timeoutNumber.value = wordTimeout;
    saveSettings();
    updateTimerDisplay();
    updatePauseButtonVisibility(); // Update pause button visibility
    
    // Restart timer with new timeout
    if (currentWords.length > 0) {
        stopTimer();
        startTimer();
    }
}

function onTimeoutNumberChange() {
    let value = parseInt(timeoutNumber.value) || 0;
    if (value < 0) value = 0;
    if (value > 60) value = 60;
    
    wordTimeout = value;
    timeoutSlider.value = wordTimeout;
    timeoutNumber.value = wordTimeout;
    saveSettings();
    updateTimerDisplay();
    updatePauseButtonVisibility(); // Update pause button visibility
    
    // Restart timer with new timeout
    if (currentWords.length > 0) {
        stopTimer();
        startTimer();
    }
}

// Timer functions
function startTimer() {
    if (wordTimeout === 0 || currentWords.length === 0) {
        updateTimerDisplay();
        return;
    }
    
    stopTimer(); // Clear any existing timer
    currentTimerSeconds = wordTimeout;
    timerPaused = false;
    
    updateTimerDisplay();
    
    timerInterval = setInterval(() => {
        if (!timerPaused) {
            currentTimerSeconds--;
            updateTimerDisplay();
            
            if (currentTimerSeconds <= 0) {
                stopTimer();
                nextWord();
            }
        }
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    currentTimerSeconds = 0;
    timerPaused = false;
    updateTimerDisplay();
}

function toggleTimer() {
    if (timerInterval && wordTimeout > 0) {
        timerPaused = !timerPaused;
        updatePauseButton();
        
        if (timerPaused) {
            showNotification(getTranslatedText('Timer paused', '计时器已暂停'), 'info');
        } else {
            showNotification(getTranslatedText('Timer resumed', '计时器已恢复'), 'info');
        }
    }
}

function updateTimerDisplay() {
    if (wordTimeout === 0 || currentWords.length === 0) {
        // Hide timer when disabled or no words
        if (timerContainer) {
            timerContainer.style.display = 'none';
        }
        if (pauseBtn) {
            pauseBtn.style.display = 'none';
        }
        return;
    }
    
    // Show timer elements
    if (timerContainer) {
        timerContainer.style.display = 'block';
    }
    // Update pause button visibility based on admin settings
    updatePauseButtonVisibility();
    
    // Update countdown text
    if (timerCount) {
        timerCount.textContent = currentTimerSeconds;
    }
    
    // Update progress bar
    if (progressBar) {
        const progress = ((wordTimeout - currentTimerSeconds) / wordTimeout) * 100;
        progressBar.style.width = progress + '%';
    }
    
    // Add warning colors
    if (progressBar) {
        progressBar.classList.remove('warning', 'danger');
        if (currentTimerSeconds <= 3 && currentTimerSeconds > 0) {
            progressBar.classList.add('danger');
        } else if (currentTimerSeconds <= 6 && currentTimerSeconds > 3) {
            progressBar.classList.add('warning');
        }
    }
    
    if (timerCount) {
        if (currentTimerSeconds <= 3 && currentTimerSeconds > 0) {
            timerCount.classList.add('timer-pulse');
        } else {
            timerCount.classList.remove('timer-pulse');
        }
    }
    
    updatePauseButton();
}

function updatePlayButtonText() {
    const textSpan = playBtn.querySelector('[data-en]');
    if (textSpan) {
        textSpan.textContent = getTranslatedText('Play Sound', '播放声音');
    }
    playBtn.textContent = ''; // Clear any "Playing..." text
    // Recreate the proper structure
    playBtn.innerHTML = '<span class="icon">🔊</span><span data-en="Play Sound" data-zh="播放声音">' + getTranslatedText('Play Sound', '播放声音') + '</span>';
}

function updatePauseButton() {
    const iconSpan = pauseBtn.querySelector('.icon');
    const textSpan = pauseBtn.querySelector('[data-en]');
    
    if (timerPaused) {
        if (iconSpan) iconSpan.textContent = '▶️';
        if (textSpan) {
            textSpan.setAttribute('data-en', 'Resume Timer');
            textSpan.setAttribute('data-zh', '恢复计时');
            textSpan.textContent = getTranslatedText('Resume Timer', '恢复计时');
        }
    } else {
        if (iconSpan) iconSpan.textContent = '⏸️';
        if (textSpan) {
            textSpan.setAttribute('data-en', 'Pause Timer');
            textSpan.setAttribute('data-zh', '暂停计时');
            textSpan.textContent = getTranslatedText('Pause Timer', '暂停计时');
        }
    }
}

// Language switching functions
function toggleLanguage() {
    currentLanguage = currentLanguage === 'en' ? 'zh' : 'en';
    saveSettings();
    updateLanguageDisplay();
    updateAllTranslations();
    
    // Show notification in current language
    const message = currentLanguage === 'en' 
        ? 'Language switched to English' 
        : '语言已切换为中文';
    showNotification(message, 'info');
}

function updateLanguageDisplay() {
    if (currentLangSpan) {
        currentLangSpan.textContent = currentLanguage === 'en' ? 'English' : '中文';
    }
}

function updateAllTranslations() {
    // Update all elements with data-en and data-zh attributes
    const elements = document.querySelectorAll('[data-en][data-zh]');
    elements.forEach(element => {
        const text = element.getAttribute(`data-${currentLanguage}`);
        if (text) {
            element.textContent = text;
        }
    });
    
    // Update placeholders
    const inputElements = document.querySelectorAll('[data-placeholder-en][data-placeholder-zh]');
    inputElements.forEach(element => {
        const placeholder = element.getAttribute(`data-placeholder-${currentLanguage}`);
        if (placeholder) {
            element.placeholder = placeholder;
        }
    });
    
    // Update special text elements that might change dynamically
    updateDynamicTranslations();
}

function updateDynamicTranslations() {
    // Update timer text
    const timerText = document.getElementById('timerText');
    const timerCountElement = document.getElementById('timerCount');
    if (timerText && timerCountElement) {
        const baseText = currentLanguage === 'en' ? 'Next word in:' : '下一个单词：';
        const seconds = timerCountElement.textContent || '10';
        const unit = currentLanguage === 'en' ? 's' : '秒';
        timerText.innerHTML = `${baseText} <span id="timerCount">${seconds}</span>${unit}`;
    }
    
    // Update listening practice mode text
    if (hideWordMode) {
        const title = document.querySelector('.learning-card .title');
        if (title) {
            title.textContent = currentLanguage === 'en' ? '🎧 Listening Practice' : '🎧 听力练习';
        }
    }
    
    // Update "no words" message if it's currently showing
    if (currentWords.length === 0) {
        updateChildMode();
    }
    
    // Update word list if empty
    updateAdminMode();
}

function getTranslatedText(enText, zhText) {
    return currentLanguage === 'en' ? enText : zhText;
}

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(n => n.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Only work in child mode
    if (!childMode.classList.contains('active')) return;
    
    // Don't capture keyboard events when modals are open
    if (passwordModal && passwordModal.style.display === 'flex') return;
    if (setupPasswordModal && setupPasswordModal.style.display === 'flex') return;
    if (changePasswordModal && changePasswordModal.style.display === 'flex') return;
    
    // Don't capture events when user is typing in input fields
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    
    switch(e.key) {
        case ' ':
        case 'Enter':
            e.preventDefault();
            playCurrentWord();
            break;
        case 'ArrowRight':
        case 'n':
        case 'N':
            e.preventDefault();
            nextWord();
            break;
        case 'ArrowLeft':
        case 'p':
        case 'P':
            e.preventDefault();
            previousWord();
            break;
        case 'Home':
        case 's':
        case 'S':
            e.preventDefault();
            startFromBeginning();
            break;
        case 'Escape':
            e.preventDefault();
            toggleTimer();
            break;
    }
});

// Initialize speech synthesis voices (helps with some browsers)
window.addEventListener('load', function() {
    if ('speechSynthesis' in window) {
        speechSynthesis.getVoices();
    }
});

// Stop wheel music when page is hidden or user leaves
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        stopSpinningMusic();
    }
});

// Stop wheel music when page is about to unload
window.addEventListener('beforeunload', function() {
    stopSpinningMusic();
});

// Stop wheel music when page loses focus
window.addEventListener('blur', function() {
    stopSpinningMusic();
});

// ==================== WHEEL FUNCTIONS ====================

// Wheel access functions
function requestWheelAccess() {
    switchMode('wheel');
}

function requestWheelAdminAccess() {
    if (isAdminAuthenticated) {
        switchMode('wheelAdmin');
    } else {
        requestAdminAccess(() => {
            switchMode('wheelAdmin');
        });
    }
}

// Initialize wheel
function initializeWheel() {
    loadWheelData();
    setupWheelCanvas();
    updateWheelDisplay();
    updateAllTranslations();
}

// Setup wheel canvas
function setupWheelCanvas() {
    if (wheelCanvas) {
        wheelCtx = wheelCanvas.getContext('2d');
        
        // Set up high DPI canvas for crisp rendering
        const rect = wheelCanvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        // Set actual size in memory (scaled up for high DPI)
        wheelCanvas.width = 500 * dpr;
        wheelCanvas.height = 500 * dpr;
        
        // Scale the canvas back down using CSS
        wheelCanvas.style.width = '500px';
        wheelCanvas.style.height = '500px';
        
        // Scale the drawing context so everything draws at the correct size
        wheelCtx.scale(dpr, dpr);
        
        // Enable anti-aliasing for smoother edges
        wheelCtx.imageSmoothingEnabled = true;
        wheelCtx.imageSmoothingQuality = 'high';
        
        drawWheel();
    }
}

// Load wheel data from localStorage
function loadWheelData() {
    const savedPunishments = localStorage.getItem('punishmentWheelData');
    const savedRewards = localStorage.getItem('rewardWheelData');
    
    console.log('Loading wheel data:', { savedPunishments, savedRewards });
    
    if (savedPunishments) {
        punishmentData = JSON.parse(savedPunishments);
    } else {
        // Default punishment data
        punishmentData = [
            { text: '做10个俯卧撑', probability: 20 },
            { text: '唱一首歌', probability: 15 },
            { text: '跳舞30秒', probability: 15 },
            { text: '背诵一首诗', probability: 10 },
            { text: '做鬼脸', probability: 20 },
            { text: '模仿动物叫声', probability: 20 }
        ];
        // Save default data
        localStorage.setItem('punishmentWheelData', JSON.stringify(punishmentData));
    }
    
    if (savedRewards) {
        rewardData = JSON.parse(savedRewards);
    } else {
        // Default reward data
        rewardData = [
            { text: '获得一颗糖果', probability: 25 },
            { text: '额外休息5分钟', probability: 20 },
            { text: '选择下一个游戏', probability: 15 },
            { text: '获得小贴纸', probability: 20 },
            { text: '得到表扬', probability: 20 }
        ];
        // Save default data
        localStorage.setItem('rewardWheelData', JSON.stringify(rewardData));
    }
    
    console.log('Wheel data loaded:', { 
        punishmentCount: punishmentData.length, 
        rewardCount: rewardData.length,
        punishmentData,
        rewardData 
    });
}

// Save wheel data to localStorage
function saveWheelData() {
    localStorage.setItem('punishmentWheelData', JSON.stringify(punishmentData));
    localStorage.setItem('rewardWheelData', JSON.stringify(rewardData));
}

// Switch wheel type
function switchWheelType(type) {
    currentWheelType = type;
    
    // Update button states
    if (punishmentWheelBtn && rewardWheelBtn) {
        punishmentWheelBtn.classList.toggle('active', type === 'punishment');
        rewardWheelBtn.classList.toggle('active', type === 'reward');
    }
    
    // Clear highlight when switching wheel type
    highlightedSegment = -1;
    drawWheel();
}

// Draw wheel on canvas
function drawWheel() {
    if (!wheelCtx) return;
    
    const canvas = wheelCanvas;
    const ctx = wheelCtx;
    // Use logical size (500x500) instead of actual canvas size for calculations
    const centerX = 250; // 500 / 2
    const centerY = 250; // 500 / 2
    const radius = 230; // 250 - 20
    
    // Clear canvas using logical size
    ctx.clearRect(0, 0, 500, 500);
    
    const data = currentWheelType === 'punishment' ? punishmentData : rewardData;
    
    if (data.length === 0) {
        // Draw empty wheel
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fillStyle = '#f8f9fa';
        ctx.fill();
        ctx.strokeStyle = '#dee2e6';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw text
        ctx.fillStyle = '#6c757d';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(getTranslatedText('No items', '没有项目'), centerX, centerY);
        return;
    }
    
    // Calculate total probability
    const totalProbability = data.reduce((sum, item) => sum + item.probability, 0);
    
    // Colors for wheel segments
    const colors = currentWheelType === 'punishment' 
        ? ['#ff7675', '#fd79a8', '#fdcb6e', '#e17055', '#a29bfe', '#6c5ce7']
        : ['#00b894', '#00cec9', '#74b9ff', '#0984e3', '#55a3ff', '#26de81'];
    
    let currentAngle = -Math.PI / 2; // Start from top
    
    data.forEach((item, index) => {
        const sliceAngle = (item.probability / totalProbability) * 2 * Math.PI;
        
        // Draw slice
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
        ctx.closePath();
        
        // Use highlighted color if this segment is selected
        if (index === highlightedSegment) {
            // Create a brighter, more vibrant version of the color
            const baseColor = colors[index % colors.length];
            ctx.fillStyle = brightenColor(baseColor);
            
            // Add a glowing effect
            ctx.shadowColor = baseColor;
            ctx.shadowBlur = 20;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
        } else {
            ctx.fillStyle = colors[index % colors.length];
            ctx.shadowBlur = 0;
        }
        
        ctx.fill();
        ctx.strokeStyle = index === highlightedSegment ? '#FFD700' : '#fff'; // Gold border for highlighted
        ctx.lineWidth = index === highlightedSegment ? 4 : 2; // Thicker border for highlighted
        ctx.stroke();
        
        // Draw text
        const textAngle = currentAngle + sliceAngle / 2;
        const textX = centerX + Math.cos(textAngle) * (radius * 0.7);
        const textY = centerY + Math.sin(textAngle) * (radius * 0.7);
        
        ctx.save();
        ctx.translate(textX, textY);
        ctx.rotate(textAngle + (textAngle > Math.PI / 2 && textAngle < 3 * Math.PI / 2 ? Math.PI : 0));
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        // Wrap text if too long
        const words = item.text.split('');
        if (words.length > 6) {
            const line1 = words.slice(0, 3).join('');
            const line2 = words.slice(3, 6).join('');
            const line3 = words.slice(6).join('');
            if (line3) {
                ctx.fillText(line1, 0, -12);
                ctx.fillText(line2, 0, 0);
                ctx.fillText(line3, 0, 12);
            } else {
                ctx.fillText(line1, 0, -10);
                ctx.fillText(line2, 0, 10);
            }
        } else {
            ctx.fillText(item.text, 0, 0);
        }
        
        ctx.restore();
        
        currentAngle += sliceAngle;
    });
}

// Spin wheel animation
function spinWheel() {
    if (isSpinning) {
        // If already spinning, stop the wheel
        stopWheel();
        return;
    }
    
    const data = currentWheelType === 'punishment' ? punishmentData : rewardData;
    if (data.length === 0) {
        showNotification(getTranslatedText('Please add some items first!', '请先添加一些项目！'), 'warning');
        return;
    }
    
    isSpinning = true;
    
    // Hide previous result and clear highlight
    hideWheelResult();
    highlightedSegment = -1;
    drawWheel();
    
    // Update button text to "Stop"
    updateSpinButtonText(getTranslatedText('STOP!', '停止！'));
    
    // Start continuous spinning animation
    startContinuousSpinning();
}

function startContinuousSpinning() {
    // Apply continuous rotation animation
    wheelCanvas.style.animation = 'spin 1s linear infinite';
    
    // Start spinning music
    playSpinningMusic();
}

function stopWheel() {
    if (!isSpinning) return;
    
    const data = currentWheelType === 'punishment' ? punishmentData : rewardData;
    
    // Calculate result based on probabilities
    const totalProbability = data.reduce((sum, item) => sum + item.probability, 0);
    const random = Math.random() * totalProbability;
    let currentSum = 0;
    let selectedIndex = 0;
    
    for (let i = 0; i < data.length; i++) {
        currentSum += data[i].probability;
        if (random <= currentSum) {
            selectedIndex = i;
            break;
        }
    }
    
    // Stop continuous animation
    wheelCanvas.style.animation = '';
    
    // Stop spinning music
    stopSpinningMusic();
    
    // Get current rotation and calculate final position
    const currentRotation = getCurrentRotation();
    
    // Calculate the angle for the selected segment
    // We need to match the drawing logic which starts from -90 degrees (top)
    const totalProbabilityForAngle = data.reduce((sum, item) => sum + item.probability, 0);
    let angleSum = 0;
    let targetAngleRadians = 0;
    
    for (let i = 0; i < selectedIndex; i++) {
        angleSum += data[i].probability;
    }
    
    // Add half of the selected segment to point to the center
    angleSum += data[selectedIndex].probability / 2;
    
    // Convert to angle (starting from top, -90 degrees)
    targetAngleRadians = -Math.PI / 2 + (angleSum / totalProbabilityForAngle) * 2 * Math.PI;
    
    // Convert to degrees and adjust for pointer position (pointer is at top)
    let targetAngle = (targetAngleRadians * 180 / Math.PI);
    
    // The pointer is at the top (0 degrees), so we need to rotate the wheel
    // so that the selected segment is under the pointer
    targetAngle = -targetAngle; // Negative because we rotate the wheel, not the pointer
    
    // Normalize angle to 0-360 range
    while (targetAngle < 0) targetAngle += 360;
    while (targetAngle >= 360) targetAngle -= 360;
    
    const additionalSpins = 3; // Additional spins before stopping
    const finalAngle = currentRotation + additionalSpins * 360 + targetAngle;
    
    // Apply final rotation with easing
    wheelCanvas.style.transform = `rotate(${finalAngle}deg)`;
    wheelCanvas.style.transition = 'transform 2s cubic-bezier(0.23, 1, 0.32, 1)';
    
    // Update button to disabled state
    spinBtn.disabled = true;
    updateSpinButtonText(getTranslatedText('Stopping...', '停止中...'));
    
    // Reset after animation
    setTimeout(() => {
        // Play completion sound
        playWheelCompletionSound();
        
        // Calculate which segment the pointer is actually pointing to
        const finalRotation = getCurrentRotation();
        const pointedSegment = getSegmentAtPointer(finalRotation);
        
        // Set highlighted segment and redraw wheel
        highlightedSegment = pointedSegment;
        drawWheel();
        
        // Show the result
        showWheelResult(pointedSegment);
        
        isSpinning = false;
        spinBtn.disabled = false;
        updateSpinButtonText(getTranslatedText('SPIN!', '转起来！'));
        wheelCanvas.style.transition = '';
    }, 2000);
}

function getCurrentRotation() {
    const transform = window.getComputedStyle(wheelCanvas).transform;
    if (transform === 'none') return 0;
    
    const matrix = transform.match(/matrix\(([^)]+)\)/);
    if (!matrix) return 0;
    
    const values = matrix[1].split(',').map(parseFloat);
    const angle = Math.atan2(values[1], values[0]) * (180 / Math.PI);
    return angle < 0 ? angle + 360 : angle;
}

// Calculate which segment the pointer is pointing to based on wheel rotation
function getSegmentAtPointer(wheelRotation) {
    const data = currentWheelType === 'punishment' ? punishmentData : rewardData;
    if (data.length === 0) return -1;
    
    // The pointer is at the top (12 o'clock position)
    // The wheel drawing starts from -90 degrees (top) and goes clockwise
    // Normalize the wheel rotation to 0-360 range
    let normalizedRotation = wheelRotation % 360;
    if (normalizedRotation < 0) normalizedRotation += 360;
    
    // Since the pointer is at the top and the wheel rotates, we need to find
    // which segment is currently at the top position (under the pointer)
    // The wheel rotates clockwise, so we need to reverse the rotation to find the original position
    let pointerAngle = (360 - normalizedRotation) % 360;
    
    // Convert to the wheel's coordinate system (starting from top = 0 degrees)
    // In the wheel's coordinate system, 0 degrees is at the top
    let wheelAngle = pointerAngle;
    
    // Calculate total probability
    const totalProbability = data.reduce((sum, item) => sum + item.probability, 0);
    
    // Convert angle to probability position
    const pointerProbabilityPosition = (wheelAngle / 360) * totalProbability;
    
    // Find which segment this probability position falls into
    let currentSum = 0;
    for (let i = 0; i < data.length; i++) {
        currentSum += data[i].probability;
        if (pointerProbabilityPosition <= currentSum) {
            return i;
        }
    }
    
    // Fallback to last segment
    return data.length - 1;
}

function updateSpinButtonText(text) {
    if (spinBtn && spinBtn.querySelector('span')) {
        spinBtn.querySelector('span').textContent = text;
    }
}

// Function to brighten a hex color for highlighting
function brightenColor(hexColor) {
    // Convert hex to RGB
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Brighten by increasing each component (but not beyond 255)
    const brightenFactor = 1.3;
    const newR = Math.min(255, Math.floor(r * brightenFactor));
    const newG = Math.min(255, Math.floor(g * brightenFactor));
    const newB = Math.min(255, Math.floor(b * brightenFactor));
    
    // Convert back to hex
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

// Show wheel result
function showWheelResult(segmentIndex) {
    const data = currentWheelType === 'punishment' ? punishmentData : rewardData;
    if (segmentIndex < 0 || segmentIndex >= data.length) return;
    
    const resultText = data[segmentIndex].text;
    const wheelType = currentWheelType;
    
    // Update result title based on wheel type
    if (resultTitle) {
        const titleText = wheelType === 'punishment' 
            ? getTranslatedText('Punishment:', '惩罚：')
            : getTranslatedText('Reward:', '奖励：');
        resultTitle.textContent = titleText;
    }
    
    // Update result item
    if (resultItem) {
        resultItem.textContent = resultText;
        resultItem.className = `result-item ${wheelType}`;
    }
    
    // Show result display
    if (wheelResultDisplay) {
        wheelResultDisplay.classList.remove('hidden');
    }
}

// Hide wheel result
function hideWheelResult() {
    if (wheelResultDisplay) {
        wheelResultDisplay.classList.add('hidden');
    }
}

// Play wheel completion sound
function playWheelCompletionSound() {
    try {
        // Create audio context for better browser compatibility
        if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
            const audioContext = new (AudioContext || webkitAudioContext)();
            
            // Create a celebratory sound sequence
            playTone(audioContext, 523.25, 0.1, 0); // C5
            playTone(audioContext, 659.25, 0.1, 0.1); // E5
            playTone(audioContext, 783.99, 0.1, 0.2); // G5
            playTone(audioContext, 1046.50, 0.3, 0.3); // C6 (longer)
        } else {
            // Fallback: Use Web Audio API to create a simple beep
            createSimpleBeep();
        }
    } catch (error) {
        console.log('Audio not supported or blocked by browser');
        // Silent fallback - no sound but no error
    }
}

function playTone(audioContext, frequency, duration, delay) {
    setTimeout(() => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.type = 'sine';
        
        // Create envelope for smoother sound
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    }, delay * 1000);
}

function createSimpleBeep() {
    // Create a simple beep using oscillator
    const audioContext = new (AudioContext || webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
}

// Play word completion sound (different from wheel sound)
function playWordCompletionSound() {
    try {
        // Create and play done.mp3
        const doneAudio = new Audio('done.mp3');
        doneAudio.volume = 0.8; // Set volume to 80%
        
        // Play the audio
        const playPromise = doneAudio.play();
        
        // Handle play promise for better browser compatibility
        if (playPromise !== undefined) {
            playPromise.then(() => {
                console.log('Word completion sound (done.mp3) started');
            }).catch(error => {
                console.log('Could not play done.mp3:', error);
                // Fallback to generated sounds if MP3 fails
                playGeneratedWordCompletionSound();
            });
        }
    } catch (error) {
        console.log('Done.mp3 not supported or blocked by browser, using generated sounds');
        // Fallback to generated sounds
        playGeneratedWordCompletionSound();
    }
}

// Fallback function with generated word completion sounds
function playGeneratedWordCompletionSound() {
    try {
        // Create audio context for better browser compatibility
        if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
            const audioContext = new (AudioContext || webkitAudioContext)();
            
            // Create a triumphant fanfare sound sequence
            playTone(audioContext, 392.00, 0.15, 0); // G4
            playTone(audioContext, 523.25, 0.15, 0.1); // C5
            playTone(audioContext, 659.25, 0.15, 0.2); // E5
            playTone(audioContext, 783.99, 0.15, 0.3); // G5
            playTone(audioContext, 1046.50, 0.4, 0.4); // C6 (longer and higher)
            playTone(audioContext, 1318.51, 0.5, 0.6); // E6 (final triumphant note)
        } else {
            // Fallback: Use Web Audio API to create a simple celebration beep
            createWordCompletionBeep();
        }
    } catch (error) {
        console.log('Audio not supported or blocked by browser');
        // Silent fallback - no sound but no error
    }
}

function createWordCompletionBeep() {
    // Create a celebratory beep sequence
    const audioContext = new (AudioContext || webkitAudioContext)();
    
    // First beep
    setTimeout(() => {
        const oscillator1 = audioContext.createOscillator();
        const gainNode1 = audioContext.createGain();
        
        oscillator1.connect(gainNode1);
        gainNode1.connect(audioContext.destination);
        
        oscillator1.frequency.setValueAtTime(600, audioContext.currentTime);
        oscillator1.type = 'sine';
        
        gainNode1.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode1.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.01);
        gainNode1.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);
        
        oscillator1.start(audioContext.currentTime);
        oscillator1.stop(audioContext.currentTime + 0.2);
    }, 0);
    
    // Second beep (higher)
    setTimeout(() => {
        const oscillator2 = audioContext.createOscillator();
        const gainNode2 = audioContext.createGain();
        
        oscillator2.connect(gainNode2);
        gainNode2.connect(audioContext.destination);
        
        oscillator2.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator2.type = 'sine';
        
        gainNode2.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode2.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.01);
        gainNode2.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
        
        oscillator2.start(audioContext.currentTime);
        oscillator2.stop(audioContext.currentTime + 0.3);
    }, 200);
    
    // Third beep (highest and longest)
    setTimeout(() => {
        const oscillator3 = audioContext.createOscillator();
        const gainNode3 = audioContext.createGain();
        
        oscillator3.connect(gainNode3);
        gainNode3.connect(audioContext.destination);
        
        oscillator3.frequency.setValueAtTime(1000, audioContext.currentTime);
        oscillator3.type = 'sine';
        
        gainNode3.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode3.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
        gainNode3.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.6);
        
        oscillator3.start(audioContext.currentTime);
        oscillator3.stop(audioContext.currentTime + 0.6);
    }, 400);
}

// Play spinning music
function playSpinningMusic() {
    try {
        // Stop any existing wheel audio
        stopSpinningMusic();
        
        // Choose audio file based on wheel type
        const audioFile = currentWheelType === 'reward' ? 'reward.mp3' : 'wheel.mp3';
        
        // Create and play the appropriate audio file
        wheelAudio = new Audio(audioFile);
        wheelAudio.loop = true; // Loop the audio
        wheelAudio.volume = 0.7; // Set volume to 70%
        
        // Play the audio
        const playPromise = wheelAudio.play();
        
        // Handle play promise for better browser compatibility
        if (playPromise !== undefined) {
            playPromise.then(() => {
                console.log(`${currentWheelType} wheel spinning sound (${audioFile}) started`);
            }).catch(error => {
                console.log(`Could not play ${audioFile}:`, error);
                // Fallback to generated sounds if MP3 fails
                playGeneratedSpinningSound();
            });
        }
    } catch (error) {
        console.log(`${currentWheelType} wheel audio not supported or blocked by browser, using generated sounds`);
        // Fallback to generated sounds
        playGeneratedSpinningSound();
    }
}

// Fallback function with generated spinning sounds
function playGeneratedSpinningSound() {
    try {
        if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
            spinningAudioContext = new (AudioContext || webkitAudioContext)();
            
            // Create a rhythmic spinning sound with multiple oscillators
            createSpinningLoop();
        }
    } catch (error) {
        console.log('Generated spinning music not supported or blocked by browser');
    }
}

function createSpinningLoop() {
    if (!spinningAudioContext) return;
    
    // Clear any existing oscillators
    stopSpinningMusic();
    
    // Create spinning whoosh sound (like a wheel spinning through air)
    const whooshOsc = spinningAudioContext.createOscillator();
    const whooshGain = spinningAudioContext.createGain();
    const whooshFilter = spinningAudioContext.createBiquadFilter();
    
    whooshOsc.connect(whooshFilter);
    whooshFilter.connect(whooshGain);
    whooshGain.connect(spinningAudioContext.destination);
    
    whooshOsc.frequency.setValueAtTime(80, spinningAudioContext.currentTime); // Low rumble
    whooshOsc.type = 'sawtooth'; // More mechanical sound
    whooshFilter.type = 'lowpass';
    whooshFilter.frequency.setValueAtTime(200, spinningAudioContext.currentTime);
    
    whooshGain.gain.setValueAtTime(0.15, spinningAudioContext.currentTime); // Constant whoosh
    
    whooshOsc.start(spinningAudioContext.currentTime);
    spinningOscillators.push({ osc: whooshOsc, gain: whooshGain });
    
    // Create clicking/ticking sound (like wheel segments passing a pointer)
    const clickOsc = spinningAudioContext.createOscillator();
    const clickGain = spinningAudioContext.createGain();
    
    clickOsc.connect(clickGain);
    clickGain.connect(spinningAudioContext.destination);
    
    clickOsc.frequency.setValueAtTime(800, spinningAudioContext.currentTime);
    clickOsc.type = 'square'; // Sharp clicking sound
    
    clickGain.gain.setValueAtTime(0, spinningAudioContext.currentTime);
    
    // Fast clicking pattern that sounds like spinning
    const clickInterval = setInterval(() => {
        if (!isSpinning || !spinningAudioContext) {
            clearInterval(clickInterval);
            return;
        }
        
        const now = spinningAudioContext.currentTime;
        clickGain.gain.cancelScheduledValues(now);
        clickGain.gain.setValueAtTime(0, now);
        clickGain.gain.linearRampToValueAtTime(0.08, now + 0.005); // Very short click
        clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
    }, 80); // Fast clicking - 12.5 clicks per second
    
    clickOsc.start(spinningAudioContext.currentTime);
    spinningOscillators.push({ osc: clickOsc, gain: clickGain, interval: clickInterval });
    
    // Create wind/air sound (higher frequency whoosh)
    const windOsc = spinningAudioContext.createOscillator();
    const windGain = spinningAudioContext.createGain();
    const windFilter = spinningAudioContext.createBiquadFilter();
    
    windOsc.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(spinningAudioContext.destination);
    
    windOsc.frequency.setValueAtTime(150, spinningAudioContext.currentTime);
    windOsc.type = 'sawtooth';
    windFilter.type = 'bandpass';
    windFilter.frequency.setValueAtTime(300, spinningAudioContext.currentTime);
    windFilter.Q.setValueAtTime(2, spinningAudioContext.currentTime);
    
    // Varying wind intensity
    windGain.gain.setValueAtTime(0, spinningAudioContext.currentTime);
    
    const windInterval = setInterval(() => {
        if (!isSpinning || !spinningAudioContext) {
            clearInterval(windInterval);
            return;
        }
        
        const now = spinningAudioContext.currentTime;
        const intensity = 0.03 + Math.random() * 0.02; // Random wind intensity
        windGain.gain.cancelScheduledValues(now);
        windGain.gain.setValueAtTime(windGain.gain.value, now);
        windGain.gain.linearRampToValueAtTime(intensity, now + 0.1);
    }, 100);
    
    windOsc.start(spinningAudioContext.currentTime);
    spinningOscillators.push({ osc: windOsc, gain: windGain, interval: windInterval });
    
    // Create mechanical friction sound
    const frictionOsc = spinningAudioContext.createOscillator();
    const frictionGain = spinningAudioContext.createGain();
    const frictionFilter = spinningAudioContext.createBiquadFilter();
    
    frictionOsc.connect(frictionFilter);
    frictionFilter.connect(frictionGain);
    frictionGain.connect(spinningAudioContext.destination);
    
    frictionOsc.frequency.setValueAtTime(120, spinningAudioContext.currentTime);
    frictionOsc.type = 'sawtooth';
    frictionFilter.type = 'highpass';
    frictionFilter.frequency.setValueAtTime(100, spinningAudioContext.currentTime);
    
    frictionGain.gain.setValueAtTime(0.08, spinningAudioContext.currentTime);
    
    frictionOsc.start(spinningAudioContext.currentTime);
    spinningOscillators.push({ osc: frictionOsc, gain: frictionGain });
}

function stopSpinningMusic() {
    // Stop MP3 audio if playing
    if (wheelAudio) {
        wheelAudio.pause();
        wheelAudio.currentTime = 0;
        wheelAudio = null;
    }
    
    // Stop all oscillators and clear intervals
    spinningOscillators.forEach(({ osc, gain, interval }) => {
        if (interval) clearInterval(interval);
        try {
            if (gain && spinningAudioContext) {
                gain.gain.exponentialRampToValueAtTime(0.001, spinningAudioContext.currentTime + 0.1);
            }
            if (osc) {
                osc.stop(spinningAudioContext ? spinningAudioContext.currentTime + 0.1 : 0);
            }
        } catch (error) {
            // Ignore errors when stopping already stopped oscillators
        }
    });
    
    spinningOscillators = [];
    
    // Close audio context after a delay to allow fade out
    if (spinningAudioContext) {
        setTimeout(() => {
            if (spinningAudioContext && spinningAudioContext.state !== 'closed') {
                spinningAudioContext.close();
            }
            spinningAudioContext = null;
        }, 200);
    }
}

function updatePauseButtonVisibility() {
    if (pauseBtn) {
        if (showPauseButton && wordTimeout > 0) {
            pauseBtn.style.display = 'inline-flex';
        } else {
            pauseBtn.style.display = 'none';
        }
    }
}


// Update wheel display
function updateWheelDisplay() {
    drawWheel();
}

// Wheel admin functions
function updateWheelAdminMode() {
    // Ensure wheel data is loaded
    loadWheelData();
    updateWheelAdminItems();
    updateAllTranslations();
}

function switchWheelAdminTab(type) {
    // Update tab states
    if (punishmentAdminTab && rewardAdminTab) {
        punishmentAdminTab.classList.toggle('active', type === 'punishment');
        rewardAdminTab.classList.toggle('active', type === 'reward');
    }
    
    // Update panel visibility
    if (punishmentAdmin && rewardAdmin) {
        punishmentAdmin.classList.toggle('hidden', type !== 'punishment');
        rewardAdmin.classList.toggle('hidden', type !== 'reward');
    }
    
    updateWheelAdminItems();
}

function updateWheelAdminItems() {
    updateWheelItemsList('punishment');
    updateWheelItemsList('reward');
}

function updateWheelItemsList(type) {
    const container = type === 'punishment' ? punishmentItems : rewardItems;
    const data = type === 'punishment' ? punishmentData : rewardData;
    
    if (!container) return;
    
    container.innerHTML = '';
    
    data.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'wheel-item';
        itemDiv.innerHTML = `
            <input type="text" value="${item.text}" placeholder="${getTranslatedText('Enter item text', '输入项目内容')}" 
                   onchange="updateWheelItem('${type}', ${index}, 'text', this.value)">
            <span class="probability-label" data-en="Probability:" data-zh="概率：">${getTranslatedText('Probability:', '概率：')}</span>
            <input type="number" value="${item.probability}" min="1" max="100" 
                   onchange="updateWheelItem('${type}', ${index}, 'probability', parseInt(this.value))">
            <span class="probability-label">%</span>
            <button class="remove-btn" onclick="removeWheelItem('${type}', ${index})" 
                    data-en="Remove" data-zh="删除">${getTranslatedText('Remove', '删除')}</button>
        `;
        container.appendChild(itemDiv);
    });
}

function addWheelItem(type) {
    const data = type === 'punishment' ? punishmentData : rewardData;
    const newItem = {
        text: getTranslatedText('New item', '新项目'),
        probability: 10
    };
    
    data.push(newItem);
    saveWheelData();
    updateWheelItemsList(type);
    
    // Update wheel if currently viewing this type
    if (currentWheelType === type) {
        drawWheel();
    }
}

function removeWheelItem(type, index) {
    const data = type === 'punishment' ? punishmentData : rewardData;
    data.splice(index, 1);
    saveWheelData();
    updateWheelItemsList(type);
    
    // Update wheel if currently viewing this type
    if (currentWheelType === type) {
        drawWheel();
    }
}

function updateWheelItem(type, index, field, value) {
    const data = type === 'punishment' ? punishmentData : rewardData;
    if (data[index]) {
        data[index][field] = value;
        saveWheelData();
        
        // Update wheel if currently viewing this type
        if (currentWheelType === type) {
            drawWheel();
        }
    }
}

// Data Export/Import Functions
function exportAllData() {
    try {
        // Collect all data from localStorage
        const settings = JSON.parse(localStorage.getItem('englishLearningSettings') || '{}');
        
        // Remove admin password from exported settings for security
        const exportSettings = { ...settings };
        delete exportSettings.adminPassword;
        
        const exportData = {
            version: "1.0",
            exportDate: new Date().toISOString(),
            settings: exportSettings,
            words: {},
            wheelData: {
                punishment: JSON.parse(localStorage.getItem('punishmentWheelData') || '[]'),
                reward: JSON.parse(localStorage.getItem('rewardWheelData') || '[]')
            }
        };
        
        // Collect word data
        exportData.words = JSON.parse(localStorage.getItem('englishWords') || '[]');
        
        // Create and download file
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `english-learning-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        showNotification(
            getTranslatedText('Data exported successfully!', '数据导出成功！'),
            'success'
        );
    } catch (error) {
        console.error('Export error:', error);
        showNotification(
            getTranslatedText('Failed to export data. Please try again.', '导出数据失败。请重试。'),
            'error'
        );
    }
}

function importAllData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importData = JSON.parse(e.target.result);
            
            // Validate data structure
            if (!importData.version || !importData.exportDate) {
                throw new Error('Invalid backup file format');
            }
            
            // Confirm import with user
            const confirmMessage = getTranslatedText(
                `Import data from ${new Date(importData.exportDate).toLocaleDateString()}? This will overwrite all current data.`,
                `导入来自 ${new Date(importData.exportDate).toLocaleDateString()} 的数据？这将覆盖所有当前数据。`
            );
            
            if (!confirm(confirmMessage)) {
                return;
            }
            
            // Import settings
            if (importData.settings) {
                localStorage.setItem('englishLearningSettings', JSON.stringify(importData.settings));
            }
            
            // Import word data
            if (importData.words) {
                localStorage.setItem('englishWords', JSON.stringify(importData.words));
            }
            
            // Import wheel data
            if (importData.wheelData) {
                if (importData.wheelData.punishment) {
                    localStorage.setItem('punishmentWheelData', JSON.stringify(importData.wheelData.punishment));
                }
                if (importData.wheelData.reward) {
                    localStorage.setItem('rewardWheelData', JSON.stringify(importData.wheelData.reward));
                }
            }
            
            // Reload application with new data
            location.reload();
            
        } catch (error) {
            console.error('Import error:', error);
            showNotification(
                getTranslatedText('Failed to import data. Please check the file format.', '导入数据失败。请检查文件格式。'),
                'error'
            );
        }
    };
    
    reader.readAsText(file);
    
    // Clear the input for next use
    event.target.value = '';
}

// Password Management Functions
function showChangePasswordModal() {
    changePasswordModal.style.display = 'flex';
    currentPasswordInput.value = '';
    newPasswordChangeInput.value = '';
    confirmNewPasswordInput.value = '';
    changePasswordError.style.display = 'none';
    currentPasswordInput.focus();
    
    // Update translations
    updateAllTranslations();
}

function closeChangePasswordModal() {
    changePasswordModal.style.display = 'none';
    currentPasswordInput.value = '';
    newPasswordChangeInput.value = '';
    confirmNewPasswordInput.value = '';
    changePasswordError.style.display = 'none';
}

function changeAdminPassword() {
    const currentPassword = currentPasswordInput.value.trim();
    const newPassword = newPasswordChangeInput.value.trim();
    const confirmPassword = confirmNewPasswordInput.value.trim();
    
    // Validate current password
    if (currentPassword !== adminPassword) {
        showChangePasswordError(getTranslatedText('Current password is incorrect.', '当前密码不正确。'));
        return;
    }
    
    // Validate new password
    if (newPassword !== confirmPassword) {
        showChangePasswordError(getTranslatedText('New passwords do not match.', '新密码不匹配。'));
        return;
    }
    
    if (newPassword === '') {
        showChangePasswordError(getTranslatedText('New password cannot be empty.', '新密码不能为空。'));
        return;
    }
    
    // Save the new password
    adminPassword = newPassword;
    saveSettings();
    
    // Close modal and show success
    closeChangePasswordModal();
    
    showNotification(
        getTranslatedText('Password changed successfully!', '密码修改成功！'),
        'success'
    );
}

function showChangePasswordError(message) {
    changePasswordErrorText.textContent = message;
    changePasswordError.style.display = 'block';
    
    // Add shake animation to modal
    const modalContent = changePasswordModal.querySelector('.modal-content');
    modalContent.style.animation = 'shake 0.5s ease';
    setTimeout(() => {
        modalContent.style.animation = '';
    }, 500);
    
    // Clear inputs and focus on current password
    currentPasswordInput.value = '';
    newPasswordChangeInput.value = '';
    confirmNewPasswordInput.value = '';
    currentPasswordInput.focus();
}
