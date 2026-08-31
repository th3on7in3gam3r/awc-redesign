export interface GivingFund {
  id: number;
  name: string;
  code?: string;
  description?: string;
}

export interface GivingProvider {
  id: number;
  providerKey: string;
  displayName: string;
  description?: string;
  paymentMethods?: string[];
  capabilities?: {
    oneTime?: boolean;
    recurring?: boolean;
  };
  supportedFrequencies?: string[];
}

export interface GivingConfig {
  enabled: boolean;
  funds: GivingFund[];
  providers: GivingProvider[];
  presetAmountsCents: number[];
  contactEmail?: string;
  contactPhone?: string;
}

export interface CheckoutResponse {
  publicReference: string;
  providerKey: string;
  providerName: string;
  amountCents: number;
  fundName: string;
  frequency: string;
  checkout: {
    checkoutType: string;
    redirectUrl?: string;
    cashAppHandle?: string;
    message?: string;
  };
}

export async function fetchGivingConfig(): Promise<GivingConfig> {
  const res = await fetch('/api/giving/public/config');
  const data = await res.json();
  if (!res.ok && !data.enabled) {
    throw new Error(data.error || 'Unable to load giving options');
  }
  return data;
}

export async function createGivingCheckout(body: {
  amountCents: number;
  fundId: number;
  providerKey: string;
  frequency: string;
  note?: string;
  anonymous?: boolean;
}): Promise<CheckoutResponse> {
  const res = await fetch('/api/giving/public/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Checkout failed');
  return data;
}

export async function fetchGivingStatus(publicReference: string) {
  const res = await fetch(`/api/giving/public/status/${encodeURIComponent(publicReference)}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Status unavailable');
  return data;
}
