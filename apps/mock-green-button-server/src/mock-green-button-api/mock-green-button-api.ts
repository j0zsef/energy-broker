import { Request, Response, Router } from 'express';
import {
  buildGasSummaryXml,
  buildGasUsagePointsXml,
  buildSummaryXml,
  buildUsagePointsXml,
} from './mock-green-button-responses.js';
import { TokenValidator } from '../mock-oauth/mock-oauth.js';

const BASE_PATH = '/espi/1_1/resource/Subscription/:subscriptionId';

export function createGreenButtonRouter(validateToken: TokenValidator): Router {
  const router = Router();

  router.get(
    `${BASE_PATH}/UsagePoint`,
    validateToken,
    (req: Request, res: Response) => {
      const basePath = `/espi/1_1/resource/Subscription/${req.params.subscriptionId}`;
      const isGas = req.params.subscriptionId === '2';
      res.set('Content-Type', 'application/atom+xml');
      res.send(isGas ? buildGasUsagePointsXml(basePath) : buildUsagePointsXml(basePath));
    },
  );

  router.get(
    `${BASE_PATH}/UsagePoint/:meterId/ElectricPowerUsageSummary`,
    validateToken,
    (req: Request, res: Response) => {
      const isGas = req.params.subscriptionId === '2';
      res.set('Content-Type', 'application/atom+xml');
      res.send(isGas ? buildGasSummaryXml(req.params.meterId) : buildSummaryXml(req.params.meterId));
    },
  );

  return router;
}
