import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ConvertModule } from './convert/convert.module'

@Module({
	imports: [ConfigModule.forRoot(), ConvertModule],
	controllers: [AppController],
	providers: [AppService]
})
export class AppModule {}
