import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { mkdirSync } from 'fs';
import { AppModule } from './app.module';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const port = process.env.PORT || 5000;

  // Ensure upload directories exist (multer does not create them).
  mkdirSync(join(process.cwd(), 'uploads', 'users'), { recursive: true });
  mkdirSync(join(process.cwd(), 'uploads', 'documents'), { recursive: true });

  // Allow uploaded images (profile photos) to be embedded by the frontend origin.
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cookieParser());

  // Serve uploaded files statically at /uploads/... (outside the /api prefix).
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads/' });

  //for every request the prefix after domain and then the route
  app.setGlobalPrefix('api');

  //to enable the frontend domain(s)
  // FRONTEND_URL may be a comma-separated list of allowed origins.
  const allowedOrigins = (process.env.FRONTEND_URL || process.env.Frontendurl || 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  app.enableCors({
    origin: (origin, callback) => {
      // Allow: non-browser clients (mobile apps / curl send no Origin), any
      // explicitly configured origin, and any localhost/127.0.0.1 port in dev
      // (Flutter web runs on a random localhost port).
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
      ) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
  });

  //we have to create pipline for incoming api so we set here whitelist true=>remove extra fields in api if hacker or any other person send to manupulate the server
  // for bid whitelisted :true=> if extra fields came it will reject the request,transform : true=> it wiill transform the parameter in url to int from string
   app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.listen(port);
  console.log(`Backend running on http://localhost:${port}`);
}
bootstrap();
