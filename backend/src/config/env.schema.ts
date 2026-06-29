export interface AppEnvironment {
  port: number;
  mongoUri: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  frontendOrigin: string;
  microserviceHost: string;
  microservicePort: number;
}

export const loadEnvironment = (): AppEnvironment => ({
  port: Number(process.env.PORT ?? 3000),
  mongoUri: process.env.MONGODB_URI ?? 'mongodb://localhost:27017/teamboard',
  jwtSecret: process.env.JWT_SECRET ?? 'development-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173',
  microserviceHost: process.env.MICROSERVICE_HOST ?? '127.0.0.1',
  microservicePort: Number(process.env.MICROSERVICE_PORT ?? 3001)
});
