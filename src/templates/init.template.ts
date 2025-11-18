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
import {MongoAdapter} from "raw_lib";
import envConfig from "../../../config/env.config";

const mongoAdapter = new MongoAdapter(envConfig.dbURI);

export default mongoAdapter;

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
    // Call Socket Instances here e.g. new ChatSocket(socket, io);
  });

  return io;
}
    `

    static apiResponse = `import { Request, Response, NextFunction } from "express";
import {RawQlResponse} from "raw_lib";
import MediaEntity from "../../media/domain/entities/media.entity";

declare global {
  namespace Express {
    interface Response {
      success: <T>(response: RawQlResponse<number | T>) => void;
      error: <T>(response: RawQlResponse<number | T>) => void;
    }
  }

  interface Request {
        token: string,
        // Create your UserEntity and call here user: UserEntity,
        uploadedMedia: MediaEntity,
        uploadedMedias: MediaEntity[],
    }
}

export default function apiResponse(req: Request, res: Response, next: NextFunction) {
   res.success = function <T>(response: RawQlResponse<number | T>) {
    res.json(response);
  };

  res.error = function <T>(response: RawQlResponse<number | T>) {
    res.json(response);
  };

  next();
}
`;

static mediaEntity = `
export default interface MediaEntity {
    _id?: string,
    path: string,
    isLocal: boolean,
    mimeType: string,
    createdAt: string,
    updatedAt: string,
}
`

static mediaRepository= `
import {RawQlRequest, RawQlResponse} from "raw_lib";
import MediaEntity from "../entities/media.entity";

export default abstract class MediaRepository {
    abstract operation(req: RawQlRequest): Promise<RawQlResponse<number | MediaEntity>>
}
`

static mediaOperationUsecases=`
import MediaRepository from "../repositories/media.repository";
import {RawQlRequest} from "raw_lib";

export default class MediaOperationUsecases {
    private mediaRepository: MediaRepository;

    constructor(mediaRepo: MediaRepository) {
        this.mediaRepository = mediaRepo;
    }

    execute = async (req: RawQlRequest) => await this.mediaRepository.operation(req);
}
`

static mediaModel=`
import {Schema} from "mongoose";
import MediaEntity from "../../domain/entities/media.entity";

const mediaSchema = new Schema<MediaEntity>({
    path: {type: String, required: true},
    isLocal: {type: Boolean, default: true},
    mimeType: {type: String, required: true},
}, {
    timestamps: true,
})

mediaSchema.pre('save', function (next) {
    if(this?.path.startsWith("https://") || this?.path.startsWith("http://")) {
        this.isLocal = false;
    }

    next();
});

export default mediaSchema;
`

static mediaServices=`
// Media Repositories

import MediaRepository from "../../domain/repositories/media.repository";
import {RawQlEngine, RawQlRequest, RawQlResponse} from "raw_lib";
import MediaEntity from "../../domain/entities/media.entity";

export default class MediaServices implements MediaRepository {
    private engine: RawQlEngine;

    constructor(engine: RawQlEngine) {
        this.engine = engine;
    }

    async operation(req: RawQlRequest): Promise<RawQlResponse<number | MediaEntity>> {
        try {
            return await this.engine.execute<MediaEntity>(req);
        } catch (e: any) {
            return {
                status: false,
                message: e.message,
                data: null,
            }
        }
    }
}
`

static mediaControllers=`
// Media Controllers

import MediaOperationUsecases from "../../domain/usecases/mediaOperation.usecases";
import mongoAdapter from "../../../infrastructure/database/connection";
import mediaSchema from "../../data/models/media.model";
import {RawQlEngine} from "raw_lib";
import MediaServices from "../../data/services/media.services";
import {NextFunction, Request, Response} from "express"
import MediaEntity from "../../domain/entities/media.entity";

class MediaControllers {
    private mediaOperationUsecase: MediaOperationUsecases;

    constructor() {
        mongoAdapter.registerModel("Media", mediaSchema);
        const engine = new RawQlEngine(mongoAdapter);
        const services = new MediaServices(engine);

        this.mediaOperationUsecase = new MediaOperationUsecases(services);
    }

    async handleMediaSave(req: Request, res: Response, next: NextFunction) {
        const file = req.file;
        const files = req.files;

        if (!file && !files) {
            return;
        }

        try {

            if (file) {
                const response = await this.mediaOperationUsecase.execute({
                    entity: "Media",
                    type: "create",
                    data: {
                        path: this.getRelativePath(file.path),
                        mimeType: file.mimetype,
                    } as MediaEntity
                });

                req.uploadedMedia = response.data?.type === "single" ? response.data?.item as MediaEntity : response.data?.items[0] as MediaEntity
            }

            if (files && Array.isArray(files) && files.length > 0) {
                const response = await Promise.all(files.map(async (f) => await this.mediaOperationUsecase.execute({
                                entity: "Media",
                                type: "create",
                                data: {
                                    path: this.getRelativePath(f.path),
                                    mimeType: f.mimetype,
                                } as MediaEntity
                            }
                        )
                    )
                );

                req.uploadedMedias = response.map<MediaEntity>((r) => r.data?.type === "single" ? r.data?.item as MediaEntity : r.data?.items[0] as MediaEntity) as MediaEntity[];
            }

            next();
        } catch (e: any) {
            next(e);
        }
    }

    private getRelativePath(fullPath: string): string {
        const uploadsIndex = fullPath.indexOf('uploads');
        if (uploadsIndex !== -1) {
            return fullPath.substring(uploadsIndex);
        }
        return fullPath;
    }
}

export default new MediaControllers();
`
 
  static mediaConfig=`
  import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
import {existsSync} from "node:fs";
import {mkdirSync} from "fs";

// Configure storage
const storage = (folder: string) =>  multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb) => {
        const uploadPath = path.join(process.cwd(), 'uploads', 'media', folder);

        if(!existsSync(uploadPath)) {
            mkdirSync(uploadPath, {recursive: true});
        }

        cb(null, uploadPath);
    },
    filename: (req: Request, file: Express.Multer.File, cb) => {
        // Generate unique filename with original extension
        const uniqueName = \`\${uuidv4()}\${path.extname(file.originalname)}\`;
        cb(null, uniqueName);
    }
});

// File filter for images only
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'));
    }
};

// Configure multer
const upload = (folder: string) => multer({
    storage: storage(folder),
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
    }
});

export default upload;
`

static mediaSaveMiddleware=`
import { Request, Response, NextFunction } from 'express';
import upload from "../../../config/multer.config";
import mediaControllers from "../../media/application/controllers/media.controllers";

export function mediaUploadMiddleware(fieldName: string, folder: string, maxCount?: number) {
    const uploadMiddleware = maxCount
        ? upload(folder).array(fieldName, maxCount)
        : upload(folder).single(fieldName);

    return async (req: Request, res: Response, next: NextFunction) => {
        uploadMiddleware(req, res, async (err) => {
            if (err) {
                return res.error({
                    status: false,
                    message: err.message,
                    data: null,
                });
            }

            try {

                if (!req.file && (!req.files || (Array.isArray(req.files) && req.files.length === 0))) {
                    return next();
                }

                await mediaControllers.handleMediaSave(req, res, next);
            } catch (error) {
                console.error('Media upload error:', error);
                return res.error({
                    status: false,
                    message: 'Failed to process uploaded media',
                    data: null,
                });
            }
        });
    };
}

// Specific middleware helpers 11for common use cases
export const singleMediaMiddleware = (fieldName: string = 'media', folder: string) => {
    return mediaUploadMiddleware(fieldName, folder);
};

export const multipleMediaMiddleware = (fieldName: string = 'media', folder: string, maxCount: number = 10) => {
    return mediaUploadMiddleware(fieldName, folder, maxCount);
};
`;

    static defaultEnv = `
PORT=6969
NODE_ENV=development
DB_URI=mongodb://localhost:27017/db_name
JWT_SECRET=raunak_cli_is_the_best
`;
}
