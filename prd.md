# PRD — 1-Minute Timer

**Owner:** <your name>  
**Stakeholders:** PM, Eng, Design, QA  
**Status:** Draft  
**Target Ship:** <date>

---

## Overview

This document outlines the specifications for a 60-second countdown timer. The timer must be accurate, accessible, and embeddable, providing a clear numeric countdown without visual size changes.

## Goals

- Deliver a 60-second timer with clear numeric display.
- Ensure timing accuracy within ±50 ms over the full 60 seconds.
- Maintain accessibility for keyboard users, screen readers, and reduced motion preferences.
- Provide an easy-to-embed solution with minimal HTML/CSS/JS.
- Compatible with latest versions of Chrome, Firefox, Safari, Edge, iOS Safari, and Android Chrome.

## User Stories

- Users can start, pause/resume, and reset the timer.
- Users can see numeric countdown in `MM:SS` format.
- Reduced motion mode is respected.
- Screen reader announces remaining time every 15 seconds and every second in the last 5 seconds.

## Requirements

**Functional:**

- Timer states and transitions:
  - `idle` → `running` (on start)
  - `running` ↔ `paused` (toggle via Space)
  - `running` → `complete` (when 0 seconds reached)
  - `complete` → `idle` (on reset)
- Controls: Start/Pause (`Space`), Reset (`R`/button).
- Timer must maintain ±50 ms accuracy regardless of tab focus.

**Visual:**

- Static numeric display in `MM:SS` format.
- Color changes to warning color at 00:10.
- Updates at 60fps, respecting reduced motion preferences.
- Progress indicator required: a circular stroke representing remaining time.

**Accessibility:**

- Fully keyboard and touch accessible.
- Screen reader live announcements:
  - Every 15 seconds while above 10 seconds remaining
  - Every second during last 5 seconds
- Meets WCAG AA contrast requirements.

**Performance:**

- Uses monotonic clock (performance.now) to compute elapsed time for accuracy.
- Works consistently across major browsers.

**Embedding:**

- CSS variables: `--timer-color`, `--timer-color-warn`.
- JS API: `start()`, `pause()`, `reset()`, events: `tick`, `complete`.

**Complete State Behavior:**

- Numeric display shows `00:00`.
- Timer is visually distinct (e.g., warning color persists).
- Events: `complete` fired for integration handling.
- Start/Pause controls disabled until reset.

## QA

- Verify start, pause, and reset functionality.
- Confirm numeric countdown displays correctly in `MM:SS`.
- Validate timing accuracy ±50 ms.
- Screen reader announces per specified intervals.
- Color changes at 10 seconds and complete state are visible.
- Works on Chrome, Firefox, Safari, Edge, iOS Safari, Android Chrome.

## Out of Scope

- Custom durations, server synchronization, multiple timers.

---

## Definition of Done

- All QA criteria are met.
- Timer is accessible, responsive, and embeddable.
- Complete state behavior functions as specified.
