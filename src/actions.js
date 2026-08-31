export function getActions() {
	let actions = {
		showTimeOfDay: {
			name: 'Show Time Of Day',
			options: [],
			callback: (action) => {
				this.showTimeOfDay()
			},
		},

		countUpTimerMode: {
			name: 'Show Count-Up Timer',
			options: [
				{
					type: 'dropdown',
					label: 'Display Mode',
					id: 'mode',
					default: 'sec',
					choices: [
						{ id: 'sec', label: 'Hours, Minutes, & Seconds' },
						{ id: 'tsec', label: 'Minutes, Seconds, & Tenths of Seconds' },
					],
				},
			],
			callback: (action) => {
				this.setCountUpTimerMode(action.options.mode)
			},
		},

		startCountUpTimer: {
			name: 'Start Count-Up Timer',
			options: [],
			callback: (action) => {
				this.controlCountUpTimer('start')
			},
		},

		pauseCountUpTimer: {
			name: 'Pause Count-Up Timer',
			options: [],
			callback: (action) => {
				this.controlCountUpTimer('pause')
			},
		},

		resetCountUpTimer: {
			name: 'Reset Count-Up Timer',
			options: [
				{
					type: 'dropdown',
					label: 'Display Mode',
					id: 'mode',
					default: 'sec',
					choices: [
						{ id: 'sec', label: 'Hours, Minutes, & Seconds' },
						{ id: 'tsec', label: 'Minutes, Seconds, & Tenths of Seconds' },
					],
				},
			],
			callback: (action) => {
				this.resetCountUpTimer(action.options.mode)
			},
		},

		setUpTimerWhileRunning: {
			name: 'Set Count-Up Timer While Running',
			options: [
				{
					type: 'number',
					label: 'Hours',
					id: 'hours',
					default: 0,
					min: 0,
				},
				{
					type: 'number',
					label: 'Minutes',
					id: 'minutes',
					default: 30,
					min: 0,
					max: 59,
				},
				{
					type: 'number',
					label: 'Seconds',
					id: 'seconds',
					default: 0,
					min: 0,
					max: 59,
				},
				{
					type: 'number',
					label: 'Tenths Of Seconds',
					id: 'tseconds',
					default: 0,
					min: 0,
				},
				{
					type: 'number',
					label: 'Hundredths Of Seconds',
					id: 'hseconds',
					default: 0,
					min: 0,
				},
			],
			callback: (action) => {
				let opt = action.options
				this.setUpTimerWhileRunning(opt.hours, opt.minutes, opt.seconds, opt.tseconds, opt.hseconds)
			},
		},

		countDownTimerMode: {
			name: 'Show Countdown Timer',
			options: [
				{
					type: 'dropdown',
					label: 'Display Mode',
					id: 'mode',
					default: 'sec',
					choices: [
						{ id: 'sec', label: 'Hours, Minutes, & Seconds' },
						{ id: 'tsec', label: 'Minutes, Seconds, & Tenths of Seconds' },
					],
				},
				{
					type: 'number',
					label: 'Hours',
					id: 'hours',
					default: 0,
					min: 0,
					isVisible: (options) => options.mode == 'sec',
				},
				{
					type: 'number',
					label: 'Minutes',
					id: 'minutes',
					default: 30,
					min: 0,
					max: 59,
				},
				{
					type: 'number',
					label: 'Seconds',
					id: 'seconds',
					default: 0,
					min: 0,
					max: 59,
				},
				{
					type: 'number',
					label: 'Tenths Of Seconds',
					id: 'tseconds',
					default: 0,
					min: 0,
					isVisible: (options) => options.mode == 'tsec',
				},
				{
					type: 'checkbox',
					label: 'Enable Alarm',
					id: 'alarmEnable',
					default: false,
				},
				{
					type: 'number',
					label: 'Alarm Duration (in seconds)',
					id: 'alarmDuration',
					default: 3,
					min: 1,
					isVisible: (options) => options.alarmEnable == true,
				},
			],
			callback: (action) => {
				let opt = action.options
				this.setCountDownTimerMode(
					opt.mode,
					opt.hours,
					opt.minutes,
					opt.seconds,
					opt.tseconds,
					opt.alarmEnable,
					opt.alarmDuration
				)
			},
		},

		startCountDownTimer: {
			name: 'Start Countdown Timer',
			options: [],
			callback: (action) => {
				this.controlCountDownTimer('start')
			},
		},

		pauseCountDownTimer: {
			name: 'Pause Countdown Timer',
			options: [],
			callback: (action) => {
				this.controlCountDownTimer('pause')
			},
		},

		resetCountDownTimer: {
			name: 'Reset Countdown Timer',
			options: [
				{
					type: 'dropdown',
					label: 'Display Mode',
					id: 'mode',
					default: 'sec',
					choices: [
						{ id: 'sec', label: 'Hours, Minutes, & Seconds' },
						{ id: 'tsec', label: 'Minutes, Seconds, & Tenths of Seconds' },
					],
				},
				{
					type: 'number',
					label: 'Hours',
					id: 'hours',
					default: 0,
					min: 0,
					isVisible: (options) => options.mode == 'sec',
				},
				{
					type: 'number',
					label: 'Minutes',
					id: 'minutes',
					default: 30,
					min: 0,
					max: 59,
				},
				{
					type: 'number',
					label: 'Seconds',
					id: 'seconds',
					default: 0,
					min: 0,
					max: 59,
				},
				{
					type: 'number',
					label: 'Tenths Of Seconds',
					id: 'tseconds',
					default: 0,
					min: 0,
					isVisible: (options) => options.mode == 'tsec',
				},
				{
					type: 'checkbox',
					label: 'Enable Alarm',
					id: 'alarmEnable',
					default: false,
				},
				{
					type: 'number',
					label: 'Alarm Duration (in seconds)',
					id: 'alarmDuration',
					default: 3,
					min: 1,
					isVisible: (options) => options.alarmEnable == true,
				},
			],
			callback: (action) => {
				let opt = action.options
				this.resetCountDownTimer(
					opt.mode,
					opt.hours,
					opt.minutes,
					opt.seconds,
					opt.tseconds,
					opt.alarmEnable,
					opt.alarmDuration
				)
			},
		},

		setDownTimerWhileRunning: {
			name: 'Set Countdown Timer While Running',
			options: [
				{
					type: 'number',
					label: 'Hours',
					id: 'hours',
					default: 0,
					min: 0,
				},
				{
					type: 'number',
					label: 'Minutes',
					id: 'minutes',
					default: 30,
					min: 0,
					max: 59,
				},
				{
					type: 'number',
					label: 'Seconds',
					id: 'seconds',
					default: 0,
					min: 0,
					max: 59,
				},
				{
					type: 'number',
					label: 'Tenths Of Seconds',
					id: 'tseconds',
					default: 0,
					min: 0,
				},
				{
					type: 'number',
					label: 'Hundredths Of Seconds',
					id: 'hseconds',
					default: 0,
					min: 0,
				},
			],
			callback: (action) => {
				let opt = action.options
				this.setDownTimerWhileRunning(opt.hours, opt.minutes, opt.seconds, opt.tseconds, opt.hseconds)
			},
		},

		increaseTimerWhileRunning: {
			name: 'Increase Timer While Running',
			options: [
				{
					type: 'number',
					label: 'Hours',
					id: 'hours',
					default: 0,
					min: 0,
				},
				{
					type: 'number',
					label: 'Minutes',
					id: 'minutes',
					default: 30,
					min: 0,
					max: 59,
				},
				{
					type: 'number',
					label: 'Seconds',
					id: 'seconds',
					default: 0,
					min: 0,
					max: 59,
				},
			],
			callback: (action) => {
				let opt = action.options
				this.modifyTimerWhileRunning('increase', opt.hours, opt.minutes, opt.seconds)
			},
		},

		decreaseTimerWhileRunning: {
			name: 'Decrease Timer While Running',
			options: [
				{
					type: 'number',
					label: 'Hours',
					id: 'hours',
					default: 0,
					min: 0,
				},
				{
					type: 'number',
					label: 'Minutes',
					id: 'minutes',
					default: 30,
					min: 0,
					max: 59,
				},
				{
					type: 'number',
					label: 'Seconds',
					id: 'seconds',
					default: 0,
					min: 0,
					max: 59,
				},
			],
			callback: (action) => {
				let opt = action.options
				this.modifyTimerWhileRunning('decrease', opt.hours, opt.minutes, opt.seconds)
			},
		},

		executeStoredProgram: {
			name: 'Execute Stored Program',
			options: [
				{
					type: 'number',
					label: 'Program Number (0 to 9)',
					id: 'program',
					default: 0,
					min: 0,
					max: 9,
				},
			],
			callback: (action) => {
				this.executeStoredProgram(action.options.program)
			},
		},

		relayControl: {
			name: 'Close Relay',
			options: [
				{
					type: 'number',
					label: 'Seconds to stay Closed',
					id: 'seconds',
					default: 1,
					min: 1,
				},
			],
			callback: (action) => {
				let opt = action.options
				this.controlRelay(opt.seconds)
			},
		},

		displayBrightness: {
			name: 'Set Display Brightness',
			options: [
				{
					type: 'number',
					label: 'Digit Brightness (0 - 100)',
					id: 'digit',
					range: true,
					min: 0,
					max: 100,
					default: 100,
				},
				{
					type: 'number',
					label: 'Dot/Colon Brightness (0 - 100)',
					id: 'dot',
					range: true,
					min: 0,
					max: 100,
					default: 100,
				},
			],
			callback: (action) => {
				let opt = action.options
				this.setRestingBrightness(opt.digit, opt.dot)
			},
		},

		displayColors: {
			name: 'Set Display Colors',
			options: [
				{
					type: 'dropdown',
					label: 'HH Digit Color',
					id: 'color_hh',
					default: this.COLORTABLE[0].id,
					choices: this.COLORTABLE,
				},
				{
					type: 'number',
					label: 'HH Digit - Red',
					id: 'custom_hh_r',
					default: 255,
					min: 0,
					max: 255,
					isVisible: (options) => options.color_hh === 'custom',
				},
				{
					type: 'number',
					label: 'HH Digit - Green',
					id: 'custom_hh_g',
					default: 255,
					min: 0,
					max: 255,
					isVisible: (options) => options.color_hh === 'custom',
				},
				{
					type: 'number',
					label: 'HH Digit - Blue',
					id: 'custom_hh_b',
					default: 255,
					min: 0,
					max: 255,
					isVisible: (options) => options.color_hh === 'custom',
				},
				{
					type: 'dropdown',
					label: 'MM:SS Digit Color',
					id: 'color_mmss',
					default: this.COLORTABLE[0].id,
					choices: this.COLORTABLE,
				},
				{
					type: 'number',
					label: 'MM:SS Digit - Red',
					id: 'custom_mmss_r',
					default: 255,
					min: 0,
					max: 255,
					isVisible: (options) => options.color_mmss === 'custom',
				},
				{
					type: 'number',
					label: 'MM:SS Digit - Green',
					id: 'custom_mmss_g',
					default: 255,
					min: 0,
					max: 255,
					isVisible: (options) => options.color_mmss === 'custom',
				},
				{
					type: 'number',
					label: 'MM:SS Digit - Blue',
					id: 'custom_mmss_b',
					default: 255,
					min: 0,
					max: 255,
					isVisible: (options) => options.color_mmss === 'custom',
				},
			],
			callback: (action) => {
				let opt = action.options
				let custom_hh = null
				let custom_mmss = null
				if (opt.color_hh === 'custom') {
					custom_hh = {
						r: opt.custom_hh_r,
						g: opt.custom_hh_g,
						b: opt.custom_hh_b,
					}
				}
				if (opt.color_mmss === 'custom') {
					custom_mmss = {
						r: opt.custom_mmss_r,
						g: opt.custom_mmss_g,
						b: opt.custom_mmss_b,
					}
				}
				this.setDisplayColor(opt.color_mmss, opt.color_hh, custom_hh, custom_mmss)
			},
		},

		toggleBlink: {
			name: 'Toggle Blink',
			options: [
				{
					type: 'number',
					label: 'Blink Rate (ms)',
					id: 'rate',
					default: 500,
					min: 100,
				},
				{
					type: 'number',
					label: 'Digit Brightness When On (0-100)',
					id: 'digit',
					range: true,
					min: 0,
					max: 100,
					default: 100,
				},
				{
					type: 'number',
					label: 'Dot/Colon Brightness When On (0-100)',
					id: 'dot',
					range: true,
					min: 0,
					max: 100,
					default: 100,
				},
			],
			callback: (action) => {
				let opt = action.options
				this.toggleBlink(opt.rate, opt.digit, opt.dot)
			},
		},

		stopBlink: {
			name: 'Stop Blink',
			options: [],
			callback: () => {
				this.stopBlink()
			},
		},
	}
	return actions
}
