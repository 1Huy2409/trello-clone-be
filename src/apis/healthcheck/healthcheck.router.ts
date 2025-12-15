import express from 'express';
import type { Router } from 'express';
import HealthCheckController from './healthcheck.controller';


export default function healthCheckRouter(controller: HealthCheckController): Router {
    const router: Router = express.Router();

    router.get('/', controller.healthCheck)
    return router;
}