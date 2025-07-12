export default class InitTemplate {
    static tsConfig = `
{
  "compilerOptions": {
    "target": "ES2024",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
`;

    static dbConnection = `
import { connect } from 'mongoose';

export default async function connectDB(mongoUri: string) {
  try {
    await connect(mongoUri);
    console.log('Connection with database established');
  } catch (error) {
    console.error(\`Connection with database failed with \${error}\`);
    process.exit(1);
  }
}
`

    static envConfig = `
import { config } from "dotenv";

config();

interface Config {
    port: number;
    nodeEnv: string;
    dbURI: string;
}

const envConfig: Config = {
    port: Number(process.env.PORT) || 9696,
    nodeEnv: process.env.NODE_ENV || "development",
    dbURI: process.env.DB_URI || "mongodb://localhost:27017/db_name"
}

export default envConfig;
`;

    static serverFile(includeSocket: boolean) {
return `
import { Server } from 'http';
import app from './infrastructure/web/http.js';
import connectDB from './shared/infrastructure/database/connection.js';
import envConfig from './config/env.config.js';
${ includeSocket ? "import socketApp from './infrastructure/web/socket.js';" : "" }

function bootstrap() {
  const server = new Server(app);

  const port = envConfig.port;
  connectDB(envConfig.dbURI ?? 'mongodb://localhost:27017/db_name');

  ${includeSocket ? "socketApp(server)" : ""};

  server.listen(port, () => {
    console.log(\`Server is running on port http://localhost:\${port}\`);
  });
}

bootstrap();
`
};

    static appFile = `
import express from "express";
import apiResponse from '../../shared/infrastructure/middleware/api_response.js';

const app = express();

app.use(express.json());
app.use(apiResponse);

app.get("/", (req, res) => {
    return res.success("Welcome to the server", null);
});

export default app;
`;

    static socketFile = `
import { Socket, Server as SocketServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import ChatSocket from '../../features/chat/application/socket/chat.socket.js';

export default function socketApp(server: HTTPServer) {
  const io = new SocketServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['websocket'],
  });

  io.on('connection', (socket: Socket) => {
    new ChatSocket(socket, io);
  });

  return io;
}
    `

    static apiResponse = `import { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Response {
      success: (message: string, data: any) => void;
      error: (message: string, data: any) => void;
    }
  }
}

export default function apiResponse(req: Request, res: Response, next: NextFunction) {
  res.success = function (message: string, data: any) {
    res.json({ status: true, message, data });
  };

  res.error = function (message: string, data: any) {
    res.json({ status: false, message, data });
  };

  next();
}
`;

    static defaultEnv = `
PORT=6969
NODE_ENV=development
DB_URI=mongodb://localhost:27017/db_name
JWT_SECRET=raunak_cli_is_the_best
`;
}
