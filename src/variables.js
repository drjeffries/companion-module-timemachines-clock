export function getVariables() {
	const variables = []

	variables.push({ variableId: 'connection', name: 'Connection' })

	variables.push({ variableId: 'model', name: 'Model' })
	variables.push({ variableId: 'name', name: 'Unit Name' })
	variables.push({ variableId: 'firmware', name: 'Firmware Version' })
	variables.push({ variableId: 'ip', name: 'IP Address' })
	variables.push({ variableId: 'mac', name: 'MAC Address' })

	variables.push({ variableId: 'display', name: 'Current Display on Clock' })
	variables.push({ variableId: 'display_mode', name: 'Display Mode' })
	variables.push({ variableId: 'timer_state', name: 'Timer State' })
	variables.push({ variableId: 'timer_seconds', name: 'Timer Remaining (Seconds)' })

	// DD:HH:MM:SS:TT broken out individually - "digits-" prefix keeps them adjacent in the
	// variable list, which is sorted alphabetically by variable ID
	variables.push({ variableId: 'digits-days', name: 'Days (DD)' })
	variables.push({ variableId: 'digits-hours', name: 'Hours (HH)' })
	variables.push({ variableId: 'digits-minutes', name: 'Minutes (MM)' })
	variables.push({ variableId: 'digits-seconds', name: 'Seconds (SS)' })
	variables.push({ variableId: 'digits-tenths', name: 'Tenths of a Second (TT)' })

	variables.push({ variableId: 'digit_format', name: 'Digit Format' })
	variables.push({ variableId: 'wifi_signal', name: 'WiFi Signal Strength (dBm, 0 if wired)' })
	variables.push({ variableId: 'ntp_sync_count', name: 'NTP Sync Count' })
	variables.push({ variableId: 'downtimer_alarm_enabled', name: 'Downtimer Alarm Enabled' })
	variables.push({ variableId: 'downtimer_alarm_duration', name: 'Downtimer Alarm Duration (Seconds)' })

	return variables
}

export function updateVariables() {
	try {
		this.setVariableValues({
			connection: this.DEVICEINFO.connection,
			model: this.DEVICEINFO.model,
			name: this.DEVICEINFO.name,
			firmware: this.DEVICEINFO.firmware,
			ip: this.DEVICEINFO.ip,
			mac: this.DEVICEINFO.mac,

			display: this.DEVICEINFO.display,
			display_mode: this.DEVICEINFO.displayModeFriendly,
			timer_state: this.DEVICEINFO.timerStateFriendly,
			timer_seconds: this.DEVICEINFO.timerSeconds,

			'digits-days': this.DEVICEINFO.days,
			'digits-hours': this.DEVICEINFO.hours,
			'digits-minutes': this.DEVICEINFO.minutes,
			'digits-seconds': this.DEVICEINFO.seconds,
			'digits-tenths': this.DEVICEINFO.tenths,

			digit_format: this.DEVICEINFO.digitFormatFriendly,
			wifi_signal: this.DEVICEINFO.wifiSignal,
			ntp_sync_count: this.DEVICEINFO.ntpSyncCount,
			downtimer_alarm_enabled: this.DEVICEINFO.downtimerAlarmEnabled,
			downtimer_alarm_duration: this.DEVICEINFO.downtimerAlarmDuration,
		})
	} catch (error) {}
}
