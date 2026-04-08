import 'dotenv/config'
import { writeFileSync } from 'fs'
import { resolve } from 'path'
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

  // Swagger JSONをファイルに書き出し（サーバー起動のたびに最新化）
  const swaggerOutputPath = resolve(process.cwd(), 'swagger.json')
  writeFileSync(swaggerOutputPath, JSON.stringify(document, null, 2), 'utf-8')
  console.log(`Swagger JSON written to ${swaggerOutputPath}`)

  const port = process.env.PORT ?? 3000
  await app.listen(port)
  console.log(`Server running on http://localhost:${port}`)
  console.log(`Swagger UI: http://localhost:${port}/api/docs`)
}

bootstrap()
