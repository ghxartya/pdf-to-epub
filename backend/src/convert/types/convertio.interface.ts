export interface IStartConversionResponse {
	code: number
	status: 'ok'
	data: {
		id: string
		minutes: string
	}
}

export interface IGetConversionStatusResponse {
	code: number
	status: 'ok'
	data: {
		id: string
		step: string
		step_percent: number
		minutes: string
		output: {
			url: string
			size: string
		}
	}
}
