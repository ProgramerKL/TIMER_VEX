# 60-Second Countdown Timer

A clean, accessible countdown timer with visual progress indicator.

## Features

- **3-2-1 Countdown** - Visual countdown before timer starts with golden pulse animation
- **MM:SS Format Display** - Shows time in minutes:seconds format
- **Visual Progress Ring** - Circular progress indicator that depletes as time runs out
- **Audio Beeps** - 600Hz beeps for countdown (3,2,1), at 35s (1s), 25s (1s), and completion (3s)
- **Keyboard Controls** - Space to start/pause, R to reset
- **Fullscreen Design** - Fills entire browser viewport with gradient background
- **Accessibility** - Full screen reader support with timed announcements
- **Warning State** - Visual warning when 10 seconds or less remain
- **Responsive Design** - Works on all screen sizes
- **Reduced Motion Support** - Respects user preferences for animations

## Usage

### Basic Usage
1. Open `index.html` in a modern browser
2. Click "Start" or press Space to begin countdown
3. Click "Pause" or press Space to pause
4. Click "Reset" or press R to reset timer

### Keyboard Shortcuts
- **Space** - Start/Pause timer
- **R** - Reset timer

### API Events

The timer dispatches custom events you can listen to:

```javascript
// Timer tick event (fires every second)
window.addEventListener('tick', (e) => {
    console.log('Seconds remaining:', e.detail.timeRemaining);
});

// Timer complete event
window.addEventListener('complete', () => {
    console.log('Timer finished!');
});

// State change event
window.addEventListener('stateChange', (e) => {
    console.log('New state:', e.detail.state);
});
```

### Customization

Use CSS variables to customize colors:

```css
:root {
    --timer-color: #333;        /* Default timer color */
    --timer-color-warn: #ff4444; /* Warning color (≤10 seconds) */
}
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- iOS Safari 14+
- Android Chrome 90+

## Accessibility

- WCAG 2.1 AA compliant
- Screen reader announcements at 45, 30, 15 seconds and final 5 seconds
- Keyboard navigation support
- Focus indicators
- Reduced motion support

## Technical Details

- Uses `performance.now()` for high-precision timing
- Maintains ±50ms accuracy over 60 seconds
- Automatically pauses when tab loses focus
- 60fps smooth animations (respects reduced motion preference)