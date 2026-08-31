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

	//NOTE: the clock never reports its display color back to us, so this reflects only what this module
	//itself last set via "Set Display Colors" (or restored after a color blink). It will be wrong/stale
	//if the color was changed elsewhere - the clock's own web page, TM-Manager, another Companion
	//connection, or an Alarm's "CX" color-change event.
	feedbacks.displayColor = {
		type: 'advanced',
		name: 'Text Color Matches Display Color',
		description:
			'Sets the button text color to the color this module last set on the clock display. ' +
			'Cannot detect color changes made outside this module (web page, TM-Manager, alarms, etc).',
		options: [
			{
				type: 'dropdown',
				label: 'Which Digits',
				id: 'section',
				default: 'mmss',
				choices: [
					{ id: 'hh', label: 'Hour Digits' },
					{ id: 'mmss', label: 'Minute/Second Digits' },
				],
			},
		],
		callback: (feedback) => {
			let opt = feedback.options
			let color =
				opt.section === 'hh'
					? this.resolveColorRGB(this.LAST_COLOR.color_hh, this.LAST_COLOR.custom_hh)
					: this.resolveColorRGB(this.LAST_COLOR.color_mmss, this.LAST_COLOR.custom_mmss)

			return {
				color: combineRgb(color.r, color.g, color.b),
			}
		},
	}

	return feedbacks
}
