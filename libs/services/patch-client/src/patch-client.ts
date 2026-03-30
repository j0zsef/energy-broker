// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./patch-technology-patch.d.ts" />
import { CarbonProject } from '@energy-broker/shared';
import Patch from '@patch-technology/patch';

const CHECKOUT_BASE_URL = 'https://checkout.patch.io/orders';

export interface PatchOrderResult {
  amount: number
  checkoutUrl: string
  currency: string
  id: string
  priceCents: number
  state: string
}

export interface RetrieveProjectsOptions {
  country?: string
  type?: string
}

export function createPatchClient(apiKey: string) {
  const patch = Patch(apiKey);

  return {
    async createOrder(
      projectId: string,
      massGrams: number,
      returnUrl: string,
    ): Promise<PatchOrderResult> {
      const response = await patch.orders.createOrder({
        amount: massGrams,
        project_id: projectId,
        state: 'draft',
        unit: 'g',
      });

      const order = response.data;
      const checkoutUrl = `${CHECKOUT_BASE_URL}/${order.id}?return_url=${encodeURIComponent(returnUrl)}`;

      return {
        amount: order.amount,
        checkoutUrl,
        currency: order.currency ?? 'USD',
        id: order.id,
        priceCents: order.price ?? 0,
        state: order.state,
      };
    },

    async placeOrder(orderId: string): Promise<PatchOrderResult> {
      const response = await patch.orders.placeOrder(orderId);
      const order = response.data;

      return {
        amount: order.amount,
        checkoutUrl: '',
        currency: order.currency ?? 'USD',
        id: order.id,
        priceCents: order.price ?? 0,
        state: order.state,
      };
    },

    async retrieveProjects(opts?: RetrieveProjectsOptions): Promise<CarbonProject[]> {
      const response = await patch.projects.retrieveProjects({
        country: opts?.country,
        type: opts?.type,
      });

      return (response.data ?? []).map(p => ({
        country: p.country ?? '',
        description: p.description ?? '',
        id: p.id,
        name: p.name ?? '',
        pricePerMtCo2Cents: 0,
        type: p.technology_type?.name ?? p.mechanism ?? 'unknown',
      }));
    },
  };
}

export type PatchClient = ReturnType<typeof createPatchClient>;
