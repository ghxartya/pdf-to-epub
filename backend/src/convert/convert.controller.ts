import { Controller, HttpCode, Post, Request } from '@nestjs/common'
import { IncomingMessage } from 'http'
import { ConvertService } from './convert.service'

@Controller('convert')
export class ConvertController {
	constructor(private readonly convertService: ConvertService) {}

	@HttpCode(200)
	@Post()
	async main(@Request() request: IncomingMessage) {
		return this.convertService.main(request)
	}
}
