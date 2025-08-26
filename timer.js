class CountdownTimer {
    constructor() {
        this.duration = 60000;
        this.timeRemaining = this.duration;
        this.state = 'idle';
        this.startTime = null;
        this.pausedTime = 0;
        this.animationFrame = null;
        this.lastAnnouncement = null;
        this.lastBeepSecond = null;
        this.audioContext = null;
        this.currentOscillator = null;
        this.countdownValue = 3;
        this.countdownTimeout = null;
        
        this.display = document.getElementById('timerDisplay');
        this.startPauseBtn = document.getElementById('startPauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.btnText = document.getElementById('btnText');
        this.progressCircle = document.querySelector('.progress-ring__circle');
        this.announcements = document.getElementById('screenReaderAnnouncements');
        
        // Settings elements
        this.settingsToggle = document.getElementById('settingsToggle');
        this.settingsContent = document.getElementById('settingsContent');
        this.timerContainer = document.querySelector('.timer-container');
        
        this.circumference = 2 * Math.PI * 90;
        this.progressCircle.style.strokeDasharray = this.circumference;
        
        this.setupEventListeners();
        this.setupSettings();
        this.updateDisplay();
        this.initAudioContext();
    }
    
    initAudioContext() {
        // Initialize audio context on first user interaction
        const initAudio = () => {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
        };
        
        this.startPauseBtn.addEventListener('click', initAudio, { once: true });
        document.addEventListener('keydown', initAudio, { once: true });
    }
    
    playBeep(duration = 1000, frequency = 800) {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        // Stop any existing beep
        if (this.currentOscillator) {
            try {
                this.currentOscillator.stop();
            } catch (e) {}
        }
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        // Fade in and out to avoid clicking
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.01);
        gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + duration / 1000 - 0.01);
        gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + duration / 1000);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration / 1000);
        
        this.currentOscillator = oscillator;
        
        oscillator.onended = () => {
            this.currentOscillator = null;
        };
    }
    
    setupEventListeners() {
        this.startPauseBtn.addEventListener('click', () => this.toggleStartPause());
        this.resetBtn.addEventListener('click', () => this.reset());
        
        document.addEventListener('keydown', (e) => {
            if (e.key === ' ' && e.target.tagName !== 'BUTTON') {
                e.preventDefault();
                this.toggleStartPause();
            } else if (e.key.toLowerCase() === 'r' && e.target.tagName !== 'BUTTON') {
                e.preventDefault();
                this.reset();
            }
        });
        
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.state === 'running') {
                this.pause();
            }
        });
    }
    
    setupSettings() {
        // Toggle settings panel
        this.settingsToggle.addEventListener('click', () => {
            this.settingsContent.classList.toggle('show');
        });
        
        // Close settings when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.settings-panel')) {
                this.settingsContent.classList.remove('show');
            }
        });
        
        // Background selection
        const bgOptions = document.querySelectorAll('.bg-option');
        bgOptions.forEach(option => {
            option.addEventListener('click', () => {
                const bgType = option.dataset.bg;
                this.changeBackground(bgType);
                
                // Update active state
                bgOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                
                // Save preference
                localStorage.setItem('timerBackground', bgType);
            });
        });
        
        // Load saved background
        const savedBg = localStorage.getItem('timerBackground');
        if (savedBg) {
            this.changeBackground(savedBg);
            const savedOption = document.querySelector(`[data-bg="${savedBg}"]`);
            if (savedOption) {
                bgOptions.forEach(opt => opt.classList.remove('active'));
                savedOption.classList.add('active');
            }
        }
    }
    
    changeBackground(bgType) {
        // Remove all background classes
        this.timerContainer.classList.remove('bg-dark', 'bg-blue', 'bg-green', 'bg-red', 'bg-space', 
            'bg-orange', 'bg-pink', 'bg-teal', 'bg-gold', 'bg-sunset', 'bg-ocean', 'bg-forest', 'bg-lavender',
            'bg-mint', 'bg-coral');
        
        // Add new background class (except for default gradient)
        if (bgType !== 'gradient') {
            this.timerContainer.classList.add(`bg-${bgType}`);
        }
    }
    
    toggleStartPause() {
        if (this.state === 'idle') {
            this.startCountdown();
        } else if (this.state === 'paused') {
            this.start();
        } else if (this.state === 'running') {
            this.pause();
        } else if (this.state === 'countdown') {
            this.cancelCountdown();
        }
    }
    
    startCountdown() {
        this.state = 'countdown';
        this.countdownValue = 3;
        this.btnText.textContent = 'Cancel';
        
        this.display.classList.add('countdown');
        this.runCountdown();
        
        this.dispatchEvent('stateChange', { state: this.state });
    }
    
    runCountdown() {
        // Show current countdown number with specific color
        this.display.textContent = this.countdownValue.toString();
        
        // Remove previous count classes and add current one
        this.display.classList.remove('count-3', 'count-2', 'count-1');
        this.display.classList.add(`count-${this.countdownValue}`);
        
        this.playBeep(300, 650);  // Beep for each number including 1
        this.announce(`${this.countdownValue}`);
        
        if (this.countdownValue > 1) {
            // Decrement and schedule next count
            this.countdownValue--;
            this.countdownTimeout = setTimeout(() => this.runCountdown(), 1000);
        } else {
            // After showing "1", wait 1s then play large beep, then start timer
            this.countdownTimeout = setTimeout(() => {
                this.playBeep(1000, 1000);  // Large beep (1000ms at 1000Hz)
                // Wait for the large beep to finish, then start timer
                setTimeout(() => {
                    this.display.classList.remove('countdown', 'count-1');
                    this.countdownValue = 3; // Reset for next time
                    this.start();
                }, 800);
            }, 1000);
        }
    }
    
    cancelCountdown() {
        if (this.countdownTimeout) {
            clearTimeout(this.countdownTimeout);
            this.countdownTimeout = null;
        }
        
        this.state = 'idle';
        this.countdownValue = 3;
        this.btnText.textContent = 'Start';
        this.display.classList.remove('countdown', 'count-3', 'count-2', 'count-1');
        this.updateDisplay();
        
        this.dispatchEvent('stateChange', { state: this.state });
    }

    start() {
        if (this.state === 'complete') return;
        
        this.state = 'running';
        this.startTime = performance.now() - (this.duration - this.timeRemaining);
        this.btnText.textContent = 'Pause';
        
        this.dispatchEvent('stateChange', { state: this.state });
        this.tick();
    }
    
    pause() {
        if (this.state !== 'running') return;
        
        this.state = 'paused';
        this.pausedTime = this.duration - this.timeRemaining;
        this.btnText.textContent = 'Resume';
        
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        
        this.dispatchEvent('stateChange', { state: this.state });
    }
    
    reset() {
        // Cancel countdown if in progress
        if (this.countdownTimeout) {
            clearTimeout(this.countdownTimeout);
            this.countdownTimeout = null;
        }
        
        this.state = 'idle';
        this.timeRemaining = this.duration;
        this.startTime = null;
        this.pausedTime = 0;
        this.lastAnnouncement = null;
        this.lastBeepSecond = null;
        this.countdownValue = 3;
        
        // Stop any ongoing beep
        if (this.currentOscillator) {
            try {
                this.currentOscillator.stop();
                this.currentOscillator = null;
            } catch (e) {}
        }
        
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        
        this.btnText.textContent = 'Start';
        this.startPauseBtn.disabled = false;
        
        this.display.classList.remove('warning', 'countdown');
        this.progressCircle.classList.remove('warning');
        
        this.updateDisplay();
        this.updateProgress();
        
        this.dispatchEvent('stateChange', { state: this.state });
    }
    
    tick() {
        if (this.state !== 'running') return;
        
        const elapsed = performance.now() - this.startTime;
        this.timeRemaining = Math.max(0, this.duration - elapsed);
        
        this.updateDisplay();
        this.updateProgress();
        this.checkAnnouncements();
        
        if (this.timeRemaining <= 0) {
            this.complete();
        } else {
            this.animationFrame = requestAnimationFrame(() => this.tick());
            
            if (Math.floor(this.timeRemaining / 1000) !== Math.floor((this.timeRemaining + 16) / 1000)) {
                this.dispatchEvent('tick', { timeRemaining: Math.ceil(this.timeRemaining / 1000) });
            }
        }
    }
    
    complete() {
        this.state = 'complete';
        this.timeRemaining = 0;
        this.btnText.textContent = 'Start';
        this.startPauseBtn.disabled = true;
        
        this.updateDisplay();
        this.updateProgress();
        
        this.announce('Timer complete');
        this.dispatchEvent('complete', {});
        this.dispatchEvent('stateChange', { state: this.state });
    }
    
    updateDisplay() {
        const totalSeconds = Math.ceil(this.timeRemaining / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        
        this.display.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        if (totalSeconds <= 10) {
            this.display.classList.add('warning');
            this.progressCircle.classList.add('warning');
        } else {
            this.display.classList.remove('warning');
            this.progressCircle.classList.remove('warning');
        }
    }
    
    updateProgress() {
        const progress = this.timeRemaining / this.duration;
        const offset = -this.circumference * (1 - progress);
        this.progressCircle.style.strokeDashoffset = offset;
    }
    
    checkAnnouncements() {
        const seconds = Math.ceil(this.timeRemaining / 1000);
        
        // Audio beeps at specific intervals
        if (this.lastBeepSecond !== seconds) {
            if (seconds === 35) {
                this.playBeep(1000, 650);  // 1 second beep at 650Hz
                this.lastBeepSecond = seconds;
            } else if (seconds === 25) {
                this.playBeep(1000, 650);  // 1 second beep at 650Hz
                this.lastBeepSecond = seconds;
            } else if (seconds === 0 && this.state === 'running') {
                this.playBeep(3000, 650);  // 3 second beep at 650Hz
                this.lastBeepSecond = seconds;
            }
        }
        
        const shouldAnnounce = 
            (seconds === 45 || seconds === 30 || seconds === 15) ||
            (seconds <= 5 && seconds > 0);
        
        if (shouldAnnounce && this.lastAnnouncement !== seconds) {
            this.lastAnnouncement = seconds;
            const message = seconds === 1 ? '1 second remaining' : `${seconds} seconds remaining`;
            this.announce(message);
        }
    }
    
    announce(message) {
        this.announcements.textContent = message;
        setTimeout(() => {
            this.announcements.textContent = '';
        }, 100);
    }
    
    dispatchEvent(eventName, detail) {
        window.dispatchEvent(new CustomEvent(eventName, { detail }));
    }
    
    destroy() {
        // Cancel countdown if in progress
        if (this.countdownTimeout) {
            clearTimeout(this.countdownTimeout);
            this.countdownTimeout = null;
        }
        
        // Stop any ongoing beep
        if (this.currentOscillator) {
            try {
                this.currentOscillator.stop();
                this.currentOscillator = null;
            } catch (e) {}
        }
        
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        // Close audio context
        if (this.audioContext) {
            this.audioContext.close();
        }
        
        this.startPauseBtn.removeEventListener('click', this.toggleStartPause);
        this.resetBtn.removeEventListener('click', this.reset);
    }
    
    get isPaused() {
        return this.state === 'paused';
    }
}

const timer = new CountdownTimer();

window.addEventListener('tick', (e) => {
    console.log('Tick:', e.detail.timeRemaining);
});

window.addEventListener('complete', () => {
    console.log('Timer completed!');
});

window.addEventListener('stateChange', (e) => {
    console.log('State changed to:', e.detail.state);
});