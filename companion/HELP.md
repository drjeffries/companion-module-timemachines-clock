# TimeMachines Clocks

This module controls clocks from [TimeMachines](https://timemachinescorp.com).

### Actions

- Set CountUp Timer Mode
- Start/Pause/Reset Count Up Timer
- Set CountDown Timer Mode
- Start/Pause/Reset Count Down Timer
- Show Time Of Day
- Set Count Up Timer While Running
- Set Count Down Timer While Running
- Execute Stored Program
- Relay Close
- Set Display Brightness
- Set Display Colors
- Toggle Blink
- Quick Blink
- Stop Blink
- Reset Countdown Timer (Last Used Values)
- Configure Auto-Warn At Time Remaining (automatically blinks or pulses the relay once remaining time crosses a threshold)
- Configure Auto Count-Up After Countdown Expires (automatically switches to Count-Up when a countdown hits zero)
- Configure Time's Up Blink (automatically blinks once when a countdown hits zero)
- Toggle Auto-Warn At Time Remaining
- Toggle Auto Count-Up After Countdown Expires
- Toggle Time's Up Blink

### Variables

- Model
- Unit Name
- Firmware Version
- IP Address
- MAC Address
- Current Display on Clock (Current Time or Remaining Time on Timer)
- Display Mode (Time of Day, Count Up, Count Down)
- Timer State
- Timer Remaining (Seconds)
- Days (DD)
- Hours (HH)
- Minutes (MM)
- Seconds (SS)
- Tenths of a Second (TT)
- Digit Format
- WiFi Signal Strength
- NTP Sync Count
- Downtimer Alarm Enabled
- Downtimer Alarm Duration
- Auto-Warn Enabled
- Auto Count-Up Enabled
- Time's Up Blink Enabled

### Feedbacks

- Dispaly Mode (Time of Day, Count Up, Count Down)
- Timer State (Count Up, Count Down) (Running, Stopped)
- Remaining Seconds on Timer
- Blink Active
- Text Color Matches Display Color (reflects only colors set through this module - see note in feedbacks.js)
- Auto-Warn Enabled (drives the toggle-switch graphic on the Auto-Warn preset)
- Auto Count-Up Enabled (drives the toggle-switch graphic on the Auto Count-Up preset)
- Time's Up Blink Enabled (drives the toggle-switch graphic on the Time's Up Blink preset)

### Presets

- Clock Dispaly
- Clock Mode
- Start/Pause Count Up Timer
- Start/Pause Count Down Timer
- Execute Stored Programs
- Relay Control
- Display Brightness
- Display Colors
- Blink
- Digit Display (full-button DD/HH/MM/SS displays, for building a combined readout across adjacent buttons)
- Presentation Automation (toggle-switch buttons for Auto-Warn, Auto Count-Up, and Time's Up Blink - one press arms it, the next disarms it, and the button graphic flips green/gray to match)
