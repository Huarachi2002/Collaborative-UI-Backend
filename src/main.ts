import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT ?? 3000;
  
  // Aumentar el límite del tamaño de la solicitud a 50MB
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
  
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix("api");
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://webcolaborativaux-cgfaamc3gggwegg6.eastus-01.azurewebsites.net/',
      'http://18.204.21.109:3000',
      'http://100.24.58.238:3001'
    ], // URL de tu frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // Añadir OPTIONS para preflight
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'], // Especificar los headers permitidos
    preflightContinue: false,
    optionsSuccessStatus: 204
  });
  await app.listen(port, '0.0.0.0', ()=> {
    Logger.log(`Server in port ${port}`)
  });
}
bootstrap();
