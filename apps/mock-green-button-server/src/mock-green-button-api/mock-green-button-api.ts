import { Request, Response, Router } from 'express';
import { buildSummaryXml, usagePointsXml } from './mock-green-button-responses.js';
import { TokenValidator } from '../mock-oauth/mock-oauth.js';

const BASE_PATH = '/espi/1_1/resource/Subscription/1';

export function createGreenButtonRouter(validateToken: TokenValidator): Router {
  const router = Router();

  router.get(
    `${BASE_PATH}/UsagePoint`,
    validateToken,
    (_req: Request, res: Response) => {
      res.set('Content-Type', 'application/atom+xml');
      res.send(usagePointsXml);
    },
  );

  router.get(
    `${BASE_PATH}/UsagePoint/:meterId/ElectricPowerUsageSummary`,
    validateToken,
    (req: Request, res: Response) => {
      res.set('Content-Type', 'application/atom+xml');
      res.send(buildSummaryXml(req.params.meterId));
    },
  );

  return router;
}
