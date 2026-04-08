import 'dotenv/config'
import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { Logger } from 'nestjs-pino'
import { AppModule } from './app.module'
import { HttpExceptionFilter } from './share/filters/http-exception.filter'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true })

  app.useLogger(app.get(Logger))

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  app.useGlobalFilters(new HttpExceptionFilter())

  app.enableCors()

  const config = new DocumentBuilder()
    .setTitle('勤怠管理システム API')
    .setDescription('マルチテナント勤怠管理システムのREST API')
    .setVersion('1.0')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/docs', app, document)

  const port = process.env.PORT ?? 3000
  await app.listen(port)
  console.log(`Server running on http://localhost:${port}`)
  console.log(`Swagger UI: http://localhost:${port}/api/docs`)
}

bootstrap()
