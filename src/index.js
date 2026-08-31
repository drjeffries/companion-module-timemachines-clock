import { InstanceBase, UDPHelper, Regex, runEntrypoint } from '@companion-module/base'

import { getActions } from './actions.js'
import { getPresets } from './presets.js'
import { getVariables, updateVariables } from './variables.js'
import { getFeedbacks } from './feedbacks.js'
import UpgradeScripts from './upgrades.js'

class TimeMachinesInstance extends InstanceBase {
	constructor(internal) {
		super(internal)

		this.updateVariables = updateVariables
	}

	async init(config) {
		this.config = config
		this.updateStatus('connecting')

		this.INTERVAL = null //used to poll the clock every second
		this.CONNECTED = false //used for friendly notifying of the user that we have not received data yet

		this.BLINK_INTERVAL = null //used to drive the blink (no native blink command exists for the main digits)
		this.BLINK_TIMEOUT = null //used by Quick Blink's auto-stop
		this.BLINK_ON = false
		this.BLINK_MODE = 'brightness' //which resting state to restore ('brightness' or 'color') when the blink stops
		this.LAST_BRIGHTNESS = { digit: 100, dot: 100 } //remembers the last brightness set through this module, since the clock never reports its brightness back

		this.DEVICEINFO = {
			connection: '(Connecting)',
			model: '',
			name: '',
			firmware: '',
			display: '00:00:00',
			displayMode: '',
			displayModeFriendly: '',
			timerState: '',
			timerStateFriendly: '',
			timerSeconds: 0,
			days: '000',
			hours: '00',
			minutes: '00',
			seconds: '00',
			tenths: '0',
			ip: '',
			mac: '',
			ntpSyncCount: 0,
			downtimerAlarmEnabled: false,
			downtimerAlarmDuration: 0,
			digitFormat: 0,
			digitFormatFriendly: '',
			wifiSignal: 0,
		}
		this.COLORTABLE = [
			{ id: 'red', label: 'Red', r: 255, g: 0, b: 0 },
			{ id: 'green', label: 'Green', r: 0, g: 255, b: 0 },
			{ id: 'blue', label: 'Blue', r: 0, g: 0, b: 255 },
			{ id: 'cyan', label: 'Cyan', r: 0, g: 255, b: 255 },
			{ id: 'magenta', label: 'Magenta', r: 255, g: 0, b: 255 },
			{ id: 'yellow', label: 'Yellow', r: 255, g: 255, b: 0 },
			{ id: 'white', label: 'White', r: 255, g: 255, b: 255 },
			{ id: 'custom', label: 'Custom RGB Value', r: 255, g: 255, b: 255 },
		]
		//the clock never reports its display color back to us, so this only reflects what this module
		//itself last commanded - it will be wrong/stale if color is changed elsewhere (the clock's own
		//web page, TM-Manager, another Companion connection, or an Alarm's "CX" color-change event)
		this.LAST_COLOR = { color_mmss: 'white', color_hh: 'white', custom_hh: null, custom_mmss: null }

		this.initConnection()

		this.initActions()
		this.initFeedbacks()
		this.initVariables()
		this.initPresets()

		this.updateVariables()
		this.checkFeedbacks()
	}

	async destroy() {
		if (this.udp !== undefined) {
			this.udp.destroy()
			delete this.udp
		}

		if (this.INTERVAL) {
			clearInterval(this.INTERVAL)
			this.INTERVAL = null
		}

		if (this.BLINK_INTERVAL) {
			clearInterval(this.BLINK_INTERVAL)
			this.BLINK_INTERVAL = null
		}

		if (this.BLINK_TIMEOUT) {
			clearTimeout(this.BLINK_TIMEOUT)
			this.BLINK_TIMEOUT = null
		}
	}

	getConfigFields() {
		return [
			{
				type: 'static-text',
				id: 'info',
				width: 12,
				label: 'Information',
				value: 'This module controls Time Machines Corp Clocks, Displays, and Timers',
			},
			{
				type: 'textinput',
				id: 'host',
				label: 'IP Address',
				width: 4,
				regex: Regex.IP,
			},
			{
				type: 'checkbox',
				id: 'polling',
				label: 'Polling (Required for Variables/Feedback)',
				default: true,
			},
		]
	}

	async configUpdated(config) {
		this.config = config

		this.updateStatus('connecting')

		if (this.INTERVAL) {
			clearInterval(this.INTERVAL)
			this.INTERVAL = null
		}

		this.initConnection()

		this.initActions()
		this.initFeedbacks()
		this.initVariables()
		this.initPresets()

		this.updateVariables()
		this.checkFeedbacks()
	}

	initVariables() {
		const variables = getVariables.bind(this)()
		this.setVariableDefinitions(variables)
	}

	initFeedbacks() {
		const feedbacks = getFeedbacks.bind(this)()
		this.setFeedbackDefinitions(feedbacks)
	}

	initPresets() {
		const presets = getPresets.bind(this)()
		this.setPresetDefinitions(presets)
	}

	initActions() {
		const actions = getActions.bind(this)()
		this.setActionDefinitions(actions)
	}

	initConnection() {
		if (this.config.host !== undefined) {
			if (this.udp !== undefined) {
				this.udp.destroy()
				delete this.udp
			}

			this.udp = new UDPHelper(this.config.host, 7372)
			setTimeout(this.checkConnection.bind(this), 10000)

			this.udp.on('error', (err) => {
				this.updateStatus('connection_failure', err)
			})

			this.udp.on('data', (data) => {
				this.updateStatus('ok')

				this.CONNECTED = true
				this.DEVICEINFO.connection = 'Connected'
				this.setVariableValues({ connection: 'Connected' })
				let hexString = data.toString('hex')
				if (hexString.length == 80) {
					//this is the main settings information
					this.updateData(Uint8Array.from(data))
				}
				if (!this.INTERVAL && this.config.polling) {
					this.setupInterval()
				}
			})

			this.getInformation()
		}
	}

	checkConnection() {
		if (!this.CONNECTED) {
			this.updateStatus('connection_failure')
			this.setVariableValues({ connection: 'Error' })
		}
	}

	setupInterval() {
		this.stopInterval()

		if (this.config.polling) {
			this.INTERVAL = setInterval(this.getInformation.bind(this), 1000)
		}
	}

	stopInterval() {
		if (this.INTERVAL !== null) {
			clearInterval(this.INTERVAL)
			this.INTERVAL = null
		}
	}

	getInformation() {
		//Get all information from Device
		if (this.udp) {
			this.udp.send(Buffer.from('A104B2', 'hex'))
		}
	}

	updateData(bytes) {
		function bytesToAscii(byteArray) {
			const bytesString = String.fromCharCode(...byteArray)
			return bytesString
		}

		let type = bytes[0]

		let model = ''

		switch (type) {
			case 1:
				model = 'POE'
				break
			case 2:
				model = 'Wifi'
				break
			case 3:
				model = 'DotMatrix'
				break
			case 4:
				model = 'TM1000A'
				this.updateStatus('bad_config')
				this.log('error', 'This model type is not implemented in this module at this time.')
				this.stopInterval()
				break
			case 5:
				model = 'TM2000A'
				this.updateStatus('bad_config')
				this.log('error', 'This model type is not implemented in this module at this time.')
				this.stopInterval()
				break
		}

		this.DEVICEINFO.model = model

		if (bytes[0] <= 3) {
			//it's a POE, Wifi, or Dot Matrix model and uses the following bytes structure
			//byte 24 is where the device name starts (byte 23 is WiFi Signal Strength, handled below)
			let name = bytesToAscii(bytes.slice(24)).replace(/\x00/g, '')
			let firmware = bytes[11] + '.' + bytes[12]
			let display =
				bytes[15].toString().padStart(2, '0') +
				':' +
				bytes[16].toString().padStart(2, '0') +
				':' +
				bytes[17].toString().padStart(2, '0')
			let timerHours = parseInt(bytes[15])
			let timerMinutes = parseInt(bytes[16])
			let timerSeconds = parseInt(bytes[17])
			let totalSeconds = timerHours * 120 + timerMinutes * 60 + timerSeconds

			this.DEVICEINFO.name = name
			this.DEVICEINFO.firmware = firmware
			this.DEVICEINFO.display = display
			this.DEVICEINFO.timerSeconds = totalSeconds

			//DD:HH:MM:SS:TT broken out as individual, independently placeable variables
			//per the Locator Protocol API, the day count spans byte 21 (low 8 bits) and the top 3 bits
			//of byte 22 (high bits) - the doc's own wording for byte 21 is ambiguous, so verify against
			//actual hardware if a multi-day countdown value here matters to you
			let dayCount = (((bytes[22] >> 5) & 0x07) << 8) | bytes[21]
			this.DEVICEINFO.days = dayCount.toString().padStart(3, '0')
			this.DEVICEINFO.hours = timerHours.toString().padStart(2, '0')
			this.DEVICEINFO.minutes = timerMinutes.toString().padStart(2, '0')
			this.DEVICEINFO.seconds = timerSeconds.toString().padStart(2, '0')
			this.DEVICEINFO.tenths = bytes[18].toString()

			this.DEVICEINFO.ip = Array.from(bytes.slice(1, 5)).join('.')
			this.DEVICEINFO.mac = Array.from(bytes.slice(5, 11))
				.map((b) => b.toString(16).padStart(2, '0'))
				.join(':')

			this.DEVICEINFO.ntpSyncCount = (bytes[13] << 8) | bytes[14]

			this.DEVICEINFO.downtimerAlarmEnabled = (bytes[20] & 0x80) !== 0
			this.DEVICEINFO.downtimerAlarmDuration = bytes[20] & 0x7f

			let digitFormat = bytes[22] & 0x1f
			this.DEVICEINFO.digitFormat = digitFormat
			this.DEVICEINFO.digitFormatFriendly =
				{ 0: '4/6 Digits', 1: '(D):H:M:S', 2: '(H):M:S.Tenths' }[digitFormat] || 'Unknown'

			this.DEVICEINFO.wifiSignal = bytes[23] === 0 ? 0 : -bytes[23]

			let modeBits = bytes[19].toString(2).padStart(8, '0')

			if (modeBits === '00000000') {
				//time mode
				this.DEVICEINFO.displayMode = 'timeofday'
				this.DEVICEINFO.displayModeFriendly = 'Time Of Day'

				this.DEVICEINFO.timerState = 'none'
				this.DEVICEINFO.timerStateFriendly = 'None'
			} else {
				let displayModeBits = modeBits.substring(5)

				if (displayModeBits == '001') {
					this.DEVICEINFO.displayMode = 'countup'
					this.DEVICEINFO.displayModeFriendly = 'Count Up'
				} else if (displayModeBits == '010') {
					this.DEVICEINFO.displayMode = 'countdown'
					this.DEVICEINFO.displayModeFriendly = 'Count Down'
				} else if (displayModeBits == '011') {
					this.DEVICEINFO.displayMode = 'interval_countup'
					this.DEVICEINFO.displayModeFriendly = 'Interval Count Up'
				} else if (displayModeBits == '100') {
					this.DEVICEINFO.displayMode = 'interval_countdown'
					this.DEVICEINFO.displayModeFriendly = 'Interval Count Down'
				} else {
					this.DEVICEINFO.displayMode = 'unknown'
					this.DEVICEINFO.displayModeFriendly = 'Unknown'
				}

				let stateBits = modeBits.substring(1, 2)
				if (stateBits === '1') {
					this.DEVICEINFO.timerState = 'running'
					this.DEVICEINFO.timerStateFriendly = 'Running'
				} else {
					this.DEVICEINFO.timerState = 'stopped'
					this.DEVICEINFO.timerStateFriendly = 'Stopped'
				}
			}
		}

		this.checkFeedbacks()
		this.updateVariables()
	}
	setCountUpTimerMode(mode) {
		let hexstring = ''

		switch (mode) {
			case 'sec':
				hexstring = 'A20100'
				break
			case 'tsec':
				hexstring = 'A20000'
				break
		}

		if (hexstring !== '') {
			this.udp.send(Buffer.from(hexstring, 'hex'))
		}

		this.DEVICEINFO.timerMode = 'up'
	}

	controlCountUpTimer(command) {
		let hexstring = ''

		switch (command) {
			case 'pause':
				hexstring = 'A30000'
				break
			case 'start':
				hexstring = 'A30100'
				break
		}

		if (hexstring !== '') {
			this.udp.send(Buffer.from(hexstring, 'hex'))
		}

		this.DEVICEINFO.timerState = command
	}

	resetCountUpTimer(mode) {
		let hexstring = ''

		switch (mode) {
			case 'sec':
				hexstring = 'A40100'
				break
			case 'tsec':
				hexstring = 'A40000'
				break
		}

		if (hexstring !== '') {
			this.udp.send(Buffer.from(hexstring, 'hex'))
		}
	}

	setCountDownTimerMode(mode, hours, minutes, seconds, tseconds, alarmEnable, alarmDuration) {
		let hexstring = ''

		switch (mode) {
			case 'sec':
				hexstring = 'A501'
				break
			case 'tsec':
				hexstring = 'A500'
				break
		}

		hexstring += parseInt(hours).toString(16).padStart(2, '0')
		hexstring += parseInt(minutes).toString(16).padStart(2, '0')
		hexstring += parseInt(seconds).toString(16).padStart(2, '0')
		hexstring += parseInt(tseconds).toString(16).padStart(2, '0')

		if (alarmEnable) {
			hexstring += parseInt(1).toString(16).padStart(2, '0')
			hexstring += parseInt(alarmDuration).toString(16).padStart(2, '0')
		} else {
			hexstring += parseInt(0).toString(16).padStart(2, '0')
			hexstring += parseInt(0).toString(16).padStart(2, '0')
		}

		if (hexstring !== '') {
			this.udp.send(Buffer.from(hexstring, 'hex'))
		}

		this.DEVICEINFO.timerMode = 'down'
	}

	controlCountDownTimer(command) {
		let hexstring = ''

		switch (command) {
			case 'pause':
				hexstring = 'A60000'
				break
			case 'start':
				hexstring = 'A60100'
				break
		}

		if (hexstring !== '') {
			this.udp.send(Buffer.from(hexstring, 'hex'))
		}

		this.DEVICEINFO.timerState = command
	}

	resetCountDownTimer(mode, hours, minutes, seconds, tseconds, alarmEnable, alarmDuration) {
		let hexstring = ''

		switch (mode) {
			case 'sec':
				hexstring = 'A701'
				hexstring += parseInt(hours).toString(16).padStart(2, '0')
				hexstring += parseInt(minutes).toString(16).padStart(2, '0')
				hexstring += parseInt(seconds).toString(16).padStart(2, '0')
				break
			case 'tsec':
				hexstring = 'A700'
				hexstring += parseInt(minutes).toString(16).padStart(2, '0')
				hexstring += parseInt(seconds).toString(16).padStart(2, '0')
				hexstring += parseInt(tseconds).toString(16).padStart(2, '0')
				break
		}

		if (alarmEnable) {
			hexstring += parseInt(1).toString(16).padStart(2, '0')
			hexstring += parseInt(alarmDuration).toString(16).padStart(2, '0')
		} else {
			hexstring += parseInt(0).toString(16).padStart(2, '0')
			hexstring += parseInt(0).toString(16).padStart(2, '0')
		}

		if (hexstring !== '') {
			this.udp.send(Buffer.from(hexstring, 'hex'))
		}
	}

	showTimeOfDay() {
		this.udp.send(Buffer.from('A80100', 'hex'))

		this.DEVICEINFO.timerMode = 'tod'
	}

	setUpTimerWhileRunning(hours, minutes, seconds, tseconds, hseconds) {
		let hexstring = 'AA'

		hexstring += parseInt(hours).toString(16).padStart(2, '0')
		hexstring += parseInt(minutes).toString(16).padStart(2, '0')
		hexstring += parseInt(seconds).toString(16).padStart(2, '0')
		hexstring += parseInt(tseconds).toString(16).padStart(2, '0')
		hexstring += parseInt(hseconds).toString(16).padStart(2, '0')

		if (hexstring !== '') {
			this.udp.send(Buffer.from(hexstring, 'hex'))
		}
	}

	setDownTimerWhileRunning(hours, minutes, seconds, tseconds, hseconds) {
		let hexstring = 'AB'

		hexstring += parseInt(hours).toString(16).padStart(2, '0')
		hexstring += parseInt(minutes).toString(16).padStart(2, '0')
		hexstring += parseInt(seconds).toString(16).padStart(2, '0')
		hexstring += parseInt(tseconds).toString(16).padStart(2, '0')
		hexstring += parseInt(hseconds).toString(16).padStart(2, '0')

		if (hexstring !== '') {
			this.udp.send(Buffer.from(hexstring, 'hex'))
		}
	}

	modifyTimerWhileRunning(mode, hours, minutes, seconds) {
		//used to increase/decrease a timer while it is still running

		if (this.DEVICEINFO.display?.indexOf(':')) {
			let currentTimerArray = this.DEVICEINFO.display.split(':')

			let currentHours = parseInt(currentTimerArray[0])
			let currentMinutes = parseInt(currentTimerArray[1])
			let currentSeconds = parseInt(currentTimerArray[2])

			let newHours = currentHours
			let newMinutes = currentMinutes
			let newSeconds = currentSeconds

			if (mode == 'increase') {
				newHours = currentHours + parseInt(hours)
				newMinutes = currentMinutes + parseInt(minutes)
				newSeconds = currentSeconds + parseInt(seconds)

				if (newSeconds > 59) {
					newMinutes++
					newSeconds = 0
				}

				if (newMinutes > 59) {
					newHours++
					newMinutes = 0
				}
			} else if (mode == 'decrease') {
				newHours = currentHours - parseInt(hours)
				newMinutes = currentMinutes - parseInt(minutes)
				newSeconds = currentSeconds - parseInt(seconds)

				if (newSeconds < 0) {
					newMinutes--
					newSeconds = 59
				}

				if (newMinutes < 0) {
					newHours--
					newMinutes = 59
				}
			}

			if (this.DEVICEINFO.timerMode == 'up' || this.DEVICEINFO.displayMode == 'countup') {
				this.setUpTimerWhileRunning(newHours, newMinutes, newSeconds, 0, 0)
			} else if (this.DEVICEINFO.timerMode == 'down' || this.DEVICEINFO.displayMode == 'countdown') {
				this.setDownTimerWhileRunning(newHours, newMinutes, newSeconds, 0, 0)
			} else {
				this.log('warn', 'Unable to modify Timer: Clock not in Up/Down Timer mode.')
			}
		} else {
			this.log('warn', 'Unable to modify Timer: No Current Time Data Available. Is there a Timer running?')
		}
	}

	executeStoredProgram(program) {
		let hexstring = 'B8'

		hexstring += parseInt(program).toString(16).padStart(2, '0')

		if (hexstring !== '') {
			this.udp.send(Buffer.from(hexstring, 'hex'))
		}
	}
	controlRelay(seconds) {
		let hexstring = 'B4'

		hexstring += parseInt(seconds).toString(16).padStart(2, '0')

		this.udp.send(Buffer.from(hexstring, 'hex'))
	}

	setDisplayBrightness(digit, dot) {
		let hexstring = ''

		let dig_bright_hex = parseInt(digit).toString(16).padStart(2, '0')
		let dot_bright_hex = parseInt(dot).toString(16).padStart(2, '0')

		hexstring = 'B5' + dig_bright_hex + dot_bright_hex

		this.udp.send(Buffer.from(hexstring, 'hex'))
	}

	setRestingBrightness(digit, dot) {
		//the clock never reports its brightness back to us, so this is the only record of "normal" brightness
		//available to restore to once something (like the blink) is done overriding it
		this.LAST_BRIGHTNESS = { digit, dot }
		this.setDisplayBrightness(digit, dot)
	}
	setDisplayColor(color_mmss, color_hh, custom_hh, custom_mmss) {
		let hexstring = ''

		let mmss_r_hex = '00'
		let mmss_g_hex = '00'
		let mmss_b_hex = '00'

		let hh_r_hex = '00'
		let hh_g_hex = '00'
		let hh_b_hex = '00'

		let color_mmss_obj = null
		if (color_mmss === 'custom') {
			color_mmss_obj = custom_mmss
		} else {
			color_mmss_obj = this.COLORTABLE.find((CLR) => CLR.id == color_mmss)
		}

		if (color_mmss_obj) {
			mmss_r_hex = parseInt(color_mmss_obj.r).toString(16).padStart(2, '0')
			mmss_g_hex = parseInt(color_mmss_obj.g).toString(16).padStart(2, '0')
			mmss_b_hex = parseInt(color_mmss_obj.b).toString(16).padStart(2, '0')
		}

		let color_hh_obj = null
		if (color_hh === 'custom') {
			color_hh_obj = custom_hh
		} else {
			color_hh_obj = this.COLORTABLE.find((CLR) => CLR.id == color_hh)
		}

		if (color_hh_obj) {
			hh_r_hex = parseInt(color_hh_obj.r).toString(16).padStart(2, '0')
			hh_g_hex = parseInt(color_hh_obj.g).toString(16).padStart(2, '0')
			hh_b_hex = parseInt(color_hh_obj.b).toString(16).padStart(2, '0')
		}

		hexstring = 'B6' + mmss_r_hex + mmss_g_hex + mmss_b_hex + hh_r_hex + hh_g_hex + hh_b_hex

		this.udp.send(Buffer.from(hexstring, 'hex'))
	}

	setRestingColor(color_mmss, color_hh, custom_hh, custom_mmss) {
		//the clock never reports its color back to us, so this is the only record available of what
		//color it should currently be
		this.LAST_COLOR = { color_mmss, color_hh, custom_hh, custom_mmss }
		this.setDisplayColor(color_mmss, color_hh, custom_hh, custom_mmss)

		//without this, the "Text Color Matches Display Color" feedback would only pick up the change
		//on the next poll tick instead of the instant Companion pushes the new color
		this.checkFeedbacks('displayColor')
	}

	resolveColorRGB(colorId, custom) {
		let colorObj = colorId === 'custom' ? custom : this.COLORTABLE.find((CLR) => CLR.id == colorId)
		return colorObj ? { r: colorObj.r, g: colorObj.g, b: colorObj.b } : { r: 255, g: 255, b: 255 }
	}

	applyBlinkPhase(options, on) {
		if (options.mode === 'color') {
			let color = on ? options.colorA : options.colorB
			this.setDisplayColor(color.id, color.id, color.custom, color.custom)
		} else {
			this.setDisplayBrightness(on ? options.digit : 0, on ? options.dot : 0)
		}
	}

	toggleBlink(options) {
		if (this.BLINK_INTERVAL) {
			this.stopBlink()
		} else {
			this.startBlink(options)
		}
	}

	startBlink(options) {
		if (this.BLINK_INTERVAL) {
			clearInterval(this.BLINK_INTERVAL)
		}

		if (this.BLINK_TIMEOUT) {
			clearTimeout(this.BLINK_TIMEOUT)
			this.BLINK_TIMEOUT = null
		}

		this.BLINK_MODE = options.mode
		this.BLINK_ON = true
		this.applyBlinkPhase(options, true)

		this.BLINK_INTERVAL = setInterval(() => {
			this.BLINK_ON = !this.BLINK_ON
			this.applyBlinkPhase(options, this.BLINK_ON)
		}, options.rate)

		this.checkFeedbacks('blinkActive')
	}

	stopBlink() {
		if (this.BLINK_INTERVAL) {
			clearInterval(this.BLINK_INTERVAL)
			this.BLINK_INTERVAL = null
		}

		this.BLINK_ON = false

		if (this.BLINK_MODE === 'color') {
			this.setDisplayColor(
				this.LAST_COLOR.color_mmss,
				this.LAST_COLOR.color_hh,
				this.LAST_COLOR.custom_hh,
				this.LAST_COLOR.custom_mmss
			)
			this.checkFeedbacks('displayColor')
		} else {
			this.setDisplayBrightness(this.LAST_BRIGHTNESS.digit, this.LAST_BRIGHTNESS.dot)
		}

		this.checkFeedbacks('blinkActive')
	}

	quickBlink(options) {
		this.startBlink(options)

		let ownInterval = this.BLINK_INTERVAL
		this.BLINK_TIMEOUT = setTimeout(() => {
			this.BLINK_TIMEOUT = null
			//only stop if nothing else has taken over the blink in the meantime
			if (this.BLINK_INTERVAL === ownInterval) {
				this.stopBlink()
			}
		}, options.duration)
	}
}
runEntrypoint(TimeMachinesInstance, UpgradeScripts)
