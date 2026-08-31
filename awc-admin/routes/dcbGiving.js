import crypto from 'crypto';
import { query } from '../db.mjs';

const DCB_BASE = (process.env.DCB_API_BASE_URL || 'https://awc-digital-contribution-book.onrender.com').replace(/\/$/, '');

const PRESET_AMOUNTS_CENTS = [2500, 5000, 10000, 25000];

/** fundId (number) -> giving_options row */
const fundOptionById = new Map();

function signHeaders(body) {
  const secret = process.env.AWC_DCB_SERVICE_SECRET?.trim();
  if (!secret) {
    throw new Error('AWC_DCB_SERVICE_SECRET is not configured');
  }
  const timestamp = String(Date.now());
  const rawBody = typeof body === 'string' ? body : JSON.stringify(body ?? {});
  const signature = crypto.createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest('hex');
  return {
    'Content-Type': 'application/json',
    'X-AWC-Timestamp': timestamp,
    'X-AWC-Signature': signature,
  };
}

function canReachDcb() {
  return Boolean(process.env.AWC_DCB_SERVICE_SECRET?.trim());
}

async function dcbFetch(path, { method = 'GET', body } = {}) {
  const headers = signHeaders(body);
  const res = await fetch(`${DCB_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `DCB request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

function generatePublicReference() {
  return `AWC-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;
}

function providerDisplayName(key) {
  if (key === 'vanco') return 'Vanco';
  if (key === 'cashapp') return 'Cash App';
  if (key === 'stripe') return 'Stripe';
  return key;
}

function providerDescription(key) {
  if (key === 'vanco') {
    return 'Secure online giving through Vanco. Supports one-time and recurring gifts.';
  }
  if (key === 'cashapp') {
    return 'Give quickly using Cash App.';
  }
  return 'Online giving provider';
}

async function loadLocalGivingConfig() {
  fundOptionById.clear();

  let options = [];
  let content = {};

  try {
    const [optionsRes, contentRes] = await Promise.all([
      query(
        `SELECT id, title, category, url, handle, subtitle, provider, is_primary, sort_order
         FROM giving_options WHERE is_active = true ORDER BY sort_order ASC`
      ),
      query('SELECT key, value FROM giving_content'),
    ]);
    options = optionsRes.rows || [];
    (contentRes.rows || []).forEach((row) => {
      content[row.key] = row.value;
    });
  } catch (err) {
    console.warn('Local giving config: could not read giving_options, using defaults.', err.message);
  }

  if (!options.length) {
    options = [
      {
        id: 'default-tithe',
        title: 'Tithes & Offering',
        category: 'Tithes & Offering',
        url: 'https://secure.myvanco.com/YKB0/campaign/C-1218E?access=tile_direct',
        handle: null,
        provider: 'vanco',
        sort_order: 1,
      },
      {
        id: 'default-building',
        title: 'Building Fund',
        category: 'Building Fund',
        url: 'https://secure.myvanco.com/YKB0/campaign/C-1218F?access=tile_direct',
        handle: null,
        provider: 'vanco',
        sort_order: 2,
      },
      {
        id: 'default-cashapp',
        title: 'Cash App',
        category: 'Online Giving',
        url: 'https://cash.app/$AWCGIVEPLUS',
        handle: '$AWCGIVEPLUS',
        provider: 'cashapp',
        sort_order: 3,
      },
    ];
  }

  const funds = [];
  let fundId = 1;

  const vancoOptions = options.filter((o) => o.provider === 'vanco' && o.url);
  if (vancoOptions.length) {
    for (const o of vancoOptions) {
      funds.push({
        id: fundId,
        name: o.category || o.title,
        code: null,
        description: o.subtitle || null,
      });
      fundOptionById.set(fundId, o);
      fundId += 1;
    }
  } else {
    const categories = [...new Set(options.map((o) => o.category || o.title).filter(Boolean))];
    for (const name of categories.length ? categories : ['General Offering']) {
      funds.push({ id: fundId, name, code: null });
      const match = options.find((o) => (o.category || o.title) === name);
      if (match) fundOptionById.set(fundId, match);
      fundId += 1;
    }
  }

  const providerKeys = [...new Set(options.map((o) => o.provider).filter((p) => p && p !== 'stripe'))];
  const providers = providerKeys.map((providerKey, index) => {
    const sample = options.find((o) => o.provider === providerKey);
    return {
      id: index + 1,
      providerKey,
      displayName: providerDisplayName(providerKey),
      description: sample?.subtitle || providerDescription(providerKey),
      paymentMethods: providerKey === 'cashapp' ? ['cashapp'] : ['card', 'ach'],
      capabilities: {
        oneTime: true,
        recurring: providerKey === 'vanco',
      },
      supportedFrequencies: providerKey === 'vanco' ? ['one-time', 'weekly', 'monthly'] : ['one-time'],
    };
  });

  const helpText = content.giving_help || '';
  const emailMatch = helpText.match(/[\w.+-]+@[\w.-]+\.\w+/);
  const phoneMatch = helpText.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);

  return {
    enabled: true,
    source: 'local',
    funds,
    providers,
    presetAmountsCents: PRESET_AMOUNTS_CENTS,
    contactEmail: emailMatch?.[0] || '',
    contactPhone: phoneMatch?.[0] || '',
    returnBaseUrl: process.env.AWC_PUBLIC_SITE_URL || 'http://localhost:3000',
  };
}

async function localCheckout(body, req) {
  const amountCents = parseInt(String(body.amountCents), 10);
  const fundId = parseInt(String(body.fundId), 10);
  const providerKey = String(body.providerKey || '').toLowerCase();
  const frequency = body.frequency || 'one-time';

  if (!amountCents || amountCents < 100) {
    const err = new Error('Please enter a valid gift amount (minimum $1.00).');
    err.status = 400;
    throw err;
  }
  if (!fundId) {
    const err = new Error('Please select a fund.');
    err.status = 400;
    throw err;
  }
  if (!providerKey) {
    const err = new Error('Please select a giving provider.');
    err.status = 400;
    throw err;
  }

  const config = await loadLocalGivingConfig();
  const fund = config.funds.find((f) => f.id === fundId);
  if (!fund) {
    const err = new Error('Selected fund is not available.');
    err.status = 400;
    throw err;
  }

  const provider = config.providers.find((p) => p.providerKey === providerKey);
  if (!provider) {
    const err = new Error('Selected provider is not available.');
    err.status = 400;
    throw err;
  }

  let option = fundOptionById.get(fundId);
  if (!option || option.provider !== providerKey) {
    const optionsRes = await query(
      `SELECT id, title, category, url, handle, provider FROM giving_options
       WHERE is_active = true AND provider = $1 ORDER BY sort_order ASC`,
      [providerKey]
    );
    option =
      optionsRes.rows.find((o) => (o.category || o.title) === fund.name) ||
      optionsRes.rows[0];
  }

  const publicReference = generatePublicReference();
  const siteUrl = process.env.AWC_PUBLIC_SITE_URL || `${req.protocol}://${req.get('host')}`;
  const returnUrl = body.returnUrl || `${siteUrl}/giving/confirmation?ref=${encodeURIComponent(publicReference)}`;

  try {
    if (option?.id) {
      await query(
        `INSERT INTO giving_intents (user_id, giving_option_id, amount, frequency, giver_name)
         VALUES (NULL, $1, $2, $3, NULL)`,
        [option.id, amountCents / 100, frequency]
      );
    }
  } catch (err) {
    console.warn('Could not log giving intent locally:', err.message);
  }

  if (providerKey === 'vanco' && option?.url) {
    const url = new URL(option.url);
    url.searchParams.set('ref', publicReference);
    if (returnUrl) url.searchParams.set('return_url', returnUrl);
    return {
      publicReference,
      providerKey,
      providerName: provider.displayName,
      amountCents,
      fundName: fund.name,
      frequency,
      checkout: { checkoutType: 'redirect', redirectUrl: url.toString() },
    };
  }

  if (providerKey === 'cashapp') {
    const handle = option?.handle || '$AWCGIVEPLUS';
    if (option?.url) {
      return {
        publicReference,
        providerKey,
        providerName: provider.displayName,
        amountCents,
        fundName: fund.name,
        frequency,
        checkout: {
          checkoutType: 'cashapp_url',
          redirectUrl: option.url,
          cashAppHandle: handle,
          message: `Send your gift via Cash App to ${handle}. Include reference ${publicReference} in the note.`,
        },
      };
    }
    return {
      publicReference,
      providerKey,
      providerName: provider.displayName,
      amountCents,
      fundName: fund.name,
      frequency,
      checkout: {
        checkoutType: 'cashapp_copy',
        cashAppHandle: handle,
        message: `Send your gift via Cash App to ${handle}. Include reference ${publicReference} in the note.`,
      },
    };
  }

  const err = new Error(`${provider.displayName} is not configured yet.`);
  err.status = 503;
  throw err;
}

async function localStatus(publicReference) {
  return {
    publicReference,
    status: 'REDIRECTED',
    providerName: null,
    fundName: null,
    amountCents: null,
    amountConfirmed: false,
    message:
      'Thank you! Payment confirmation is being processed. You will receive a receipt from your giving provider when available.',
  };
}

export function registerDcbGivingRoutes(app) {
  const publicGivingEnabled = process.env.PUBLIC_GIVING_V2_ENABLED !== 'false';

  app.get('/api/giving/public/config', async (req, res) => {
    try {
      if (!publicGivingEnabled) {
        return res.json({ enabled: false, funds: [], providers: [], presetAmountsCents: [] });
      }

      if (canReachDcb()) {
        try {
          const data = await dcbFetch('/api/public/giving/config');
          return res.json(data);
        } catch (err) {
          console.warn('DCB config unavailable, using local giving_options fallback:', err.message);
        }
      } else {
        console.info('AWC_DCB_SERVICE_SECRET not set — serving local giving config from giving_options.');
      }

      const local = await loadLocalGivingConfig();
      res.json(local);
    } catch (err) {
      console.error('Giving config error:', err.message);
      try {
        const local = await loadLocalGivingConfig();
        return res.json(local);
      } catch {
        res.status(503).json({
          enabled: false,
          error: 'Online giving is temporarily unavailable. Please try again later.',
        });
      }
    }
  });

  app.post('/api/giving/public/checkout', async (req, res) => {
    try {
      if (!publicGivingEnabled) {
        return res.status(503).json({ error: 'Online giving is temporarily unavailable.' });
      }

      if (canReachDcb()) {
        try {
          const siteUrl = process.env.AWC_PUBLIC_SITE_URL || `${req.protocol}://${req.get('host')}`;
          const payload = {
            ...req.body,
            returnUrl: req.body.returnUrl || `${siteUrl}/giving/confirmation`,
          };
          const data = await dcbFetch('/api/public/giving/checkout', { method: 'POST', body: payload });
          return res.json(data);
        } catch (err) {
          console.warn('DCB checkout unavailable, using local fallback:', err.message);
        }
      }

      const data = await localCheckout(req.body, req);
      res.json(data);
    } catch (err) {
      console.error('Checkout error:', err.message);
      res.status(err.status || 500).json({ error: err.message || 'Unable to start giving session.' });
    }
  });

  app.get('/api/giving/public/status/:publicReference', async (req, res) => {
    try {
      if (canReachDcb()) {
        try {
          const data = await dcbFetch(`/api/public/giving/status/${encodeURIComponent(req.params.publicReference)}`);
          return res.json(data);
        } catch (err) {
          console.warn('DCB status unavailable, using local fallback:', err.message);
        }
      }
      const data = await localStatus(req.params.publicReference);
      res.json(data);
    } catch (err) {
      console.error('Status error:', err.message);
      res.status(err.status || 500).json({ error: err.message || 'Unable to load giving status.' });
    }
  });
}
