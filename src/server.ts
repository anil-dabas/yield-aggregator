import express from 'express';
import cors from 'cors';
import { projectConfig } from './configs/projectConfig';
import apiRoutes from './routes/api';
import { IngestionService } from './services/ingestionService';
import { ServiceError, isCustomError } from './errors';
import {ERROR_MESSAGES} from "./constants";

const app = express();

app.use(cors({
  origin: ['http://localhost:3001', 'http://frontend:3001'],
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());
app.use(apiRoutes);

const ingestionService = new IngestionService();

app.listen(projectConfig.port, async () => {
  try {
    console.log(`[${new Date().toISOString()}] Server running on port ${projectConfig.port}`);
    await ingestionService.start();
  } catch (error: unknown) {
    const errorMsg = isCustomError(error) ? error.message : 'Unknown error';
    console.error(`[${new Date().toISOString()}] Server startup failed: ${errorMsg}`);
    throw new ServiceError(ERROR_MESSAGES.SERVER_STARTUP_FAILED, 'STARTUP_ERROR', { originalError: error });
  }
});

process.on('SIGTERM', async () => {
  try {
    await ingestionService.stop();
    console.log(`[${new Date().toISOString()}] Server stopped gracefully`);
    process.exit(0);
  } catch (error: unknown) {
    const errorMsg = isCustomError(error) ? error.message : 'Unknown error';
    console.error(`[${new Date().toISOString()}] Server shutdown failed: ${errorMsg}`);
    process.exit(1);
  }
});