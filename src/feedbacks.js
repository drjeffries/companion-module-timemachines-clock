import { combineRgb } from '@companion-module/base'

export function getFeedbacks() {
	const feedbacks = {}

	const foregroundColor = combineRgb(255, 255, 255) // White
	const backgroundColorRed = combineRgb(255, 0, 0) // Red

	feedbacks.displayMode = {
		type: 'boolean',
		name: 'Display Mode',
		description: 'Indicate current display mode',
		defaultStyle: {
			color: foregroundColor,
			bgcolor: backgroundColorRed,
		},
		options: [
			{
				type: 'dropdown',
				label: 'Display Mode',
				id: 'mode',
				default: 'countup',
				choices: [
					{ id: 'timeofday', label: 'Time of Day' },
					{ id: 'countup', label: 'Count Up' },
					{ id: 'countdown', label: 'Count Down' },
				],
			},
		],
		callback: (feedback) => {
			let opt = feedback.options

			if (this.DEVICEINFO?.displayMode == opt.mode) {
				return true
			}
		},
	}

	feedbacks.timerState = {
		type: 'boolean',
		name: 'Timer State',
		description: 'Indicate if Timer is Running or Stopped',
		defaultStyle: {
			color: foregroundColor,
			bgcolor: backgroundColorRed,
		},
		options: [
			{
				type: 'dropdown',
				label: 'Timer Mode',
				id: 'mode',
				default: 'countup',
				choices: [
					{ id: 'countup', label: 'Count Up' },
					{ id: 'countdown', label: 'Count Down' },
				],
			},
			{
				type: 'dropdown',
				label: 'Indicate in X State',
				id: 'state',
				default: 'running',
				choices: [
					{ id: 'running', label: 'Running' },
					{ id: 'stopped', label: 'Stopped' },
				],
			},
		],
		callback: (feedback) => {
			let opt = feedback.options

			if (this.DEVICEINFO?.displayMode == opt.mode && this.DEVICEINFO?.timerState == opt.state) {
				return true
			}
		},
	}

	feedbacks.timerLeft = {
		type: 'boolean',
		name: 'Remaining Seconds on Timer ',
		description: 'Indicate if Timer has less than the specified number of seconds left',
		defaultStyle: {
			color: foregroundColor,
			bgcolor: backgroundColorRed,
		},
		options: [
			{
				type: 'number',
				label: 'Number of Seconds Remaining',
				id: 'seconds',
				default: 10,
				min: 0,
			},
		],
		callback: (feedback) => {
			let opt = feedback.options

			if (this.DEVICEINFO?.displayMode === 'countdown') {
				if (parseInt(this.DEVICEINFO.timerSeconds) <= parseInt(opt.seconds)) {
					return true
				}
			}

			return false
		},
	}

	feedbacks.fauxBlinkActive = {
		type: 'boolean',
		name: 'Faux Blink Active',
		description: 'Indicate if the Faux Blink toggle is currently running',
		defaultStyle: {
			color: foregroundColor,
			bgcolor: backgroundColorRed,
		},
		options: [],
		callback: () => {
			return !!this.BLINK_INTERVAL
		},
	}

	return feedbacks
}
