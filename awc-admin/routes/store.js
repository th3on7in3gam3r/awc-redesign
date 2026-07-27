import express from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../db.mjs';
import { PRODUCT_MAP, COLOR_NAMES } from '../data/storeProducts.js';
import { auth } from '../middleware/auth.js';
import requireStaff from '../middleware/requireStaff.js';

const router = express.Router();

const VALID_FULFILLMENT = new Set(['pickup', 'ship']);
const VALID_PAYMENT = new Set(['pickup', 'cashapp', 'zelle']);

function optionalAuth(req, _res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next();
  }
  try {
    const token = authHeader.split(' ')[1];
    req.user = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    // Guest checkout still allowed
  }
  next();
}

function emailsMatch(a, b) {
  return String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase();
}

function paymentInfo() {
  return {
    cashappHandle: process.env.STORE_CASHAPP_HANDLE || '$AnointedWorshipCenter',
    zelleTarget: process.env.STORE_ZELLE_TARGET || 'anointedworshipcenter@gmail.com',
  };
}

// GET /api/store/payment-info
router.get('/payment-info', (_req, res) => {
  res.json(paymentInfo());
});

// POST /api/store/orders
router.post('/orders', optionalAuth, async (req, res) => {
  try {
    const {
      customerName,
      email,
      phone,
      fulfillment,
      paymentMethod,
      shipping,
      items,
    } = req.body || {};

    if (!customerName?.trim() || !email?.trim() || !phone?.trim()) {
      return res.status(400).json({ message: 'Name, email, and phone are required' });
    }
    if (!VALID_FULFILLMENT.has(fulfillment)) {
      return res.status(400).json({ message: 'Invalid fulfillment method' });
    }
    if (!VALID_PAYMENT.has(paymentMethod)) {
      return res.status(400).json({ message: 'Invalid payment method' });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    let addressLine1 = null;
    let addressLine2 = null;
    let city = null;
    let state = null;
    let zip = null;

    if (fulfillment === 'ship') {
      if (!shipping?.addressLine1?.trim() || !shipping?.city?.trim() || !shipping?.state?.trim() || !shipping?.zip?.trim()) {
        return res.status(400).json({ message: 'Shipping address is required' });
      }
      addressLine1 = shipping.addressLine1.trim();
      addressLine2 = shipping.addressLine2?.trim() || null;
      city = shipping.city.trim();
      state = shipping.state.trim();
      zip = shipping.zip.trim();
    }

    const lineItems = [];
    let totalCents = 0;

    for (const item of items) {
      const product = PRODUCT_MAP[item.productId];
      if (!product) {
        return res.status(400).json({ message: `Unknown product: ${item.productId}` });
      }
      const quantity = Number(item.quantity);
      const size = String(item.size || '').trim();
      const colorId = String(item.color || '').trim().toLowerCase();
      if (!size || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
        return res.status(400).json({ message: 'Invalid item quantity or size' });
      }
      if (!colorId || !product.colors?.includes(colorId)) {
        return res.status(400).json({ message: `Invalid color for ${product.name}` });
      }
      const colorName = COLOR_NAMES[colorId] || colorId;
      lineItems.push({
        productId: product.id,
        productName: product.name,
        size,
        color: colorName,
        quantity,
        unitPriceCents: product.priceCents,
      });
      totalCents += product.priceCents * quantity;
    }

    const status = paymentMethod === 'pickup' ? 'awaiting_pickup' : 'pending_payment';
    const memberUserId = req.user?.userId || null;

    const orderResult = await query(
      `
      INSERT INTO store_orders (
        customer_name, email, phone, fulfillment,
        address_line1, address_line2, city, state, zip,
        payment_method, status, total_cents, member_user_id
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      RETURNING id
      `,
      [
        customerName.trim(),
        email.trim().toLowerCase(),
        phone.trim(),
        fulfillment,
        addressLine1,
        addressLine2,
        city,
        state,
        zip,
        paymentMethod,
        status,
        totalCents,
        memberUserId,
      ]
    );

    const orderId = orderResult.rows[0].id;

    for (const line of lineItems) {
      await query(
        `
        INSERT INTO store_order_items (
          order_id, product_id, product_name, size, color, quantity, unit_price_cents
        ) VALUES ($1,$2,$3,$4,$5,$6,$7)
        `,
        [
          orderId,
          line.productId,
          line.productName,
          line.size,
          line.color,
          line.quantity,
          line.unitPriceCents,
        ]
      );
    }

    res.status(201).json({ id: orderId, status, totalCents });
  } catch (err) {
    console.error('Error creating store order:', err);
    if (err.code === '42P01') {
      return res.status(503).json({
        message: 'Store is not set up yet. Please run the store schema migration.',
      });
    }
    res.status(500).json({ message: 'Error creating order' });
  }
});

// PATCH /api/store/orders/:id/paid — staff mark paid (mirror for Vault)
router.patch('/orders/:id/paid', auth, requireStaff, async (req, res) => {
  try {
    const { id } = req.params;
    const paidBy =
      req.user?.email ||
      req.user?.name ||
      req.user?.userId ||
      'staff';

    const result = await query(
      `
      UPDATE store_orders
      SET status = 'paid',
          paid_at = NOW(),
          paid_by = $2,
          updated_at = NOW()
      WHERE id = $1
        AND status IN ('pending_payment', 'awaiting_pickup')
      RETURNING id, status, paid_at, paid_by, total_cents, payment_method
      `,
      [id, String(paidBy)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found or already paid' });
    }

    res.json({ ok: true, order: result.rows[0] });
  } catch (err) {
    console.error('Error marking store order paid:', err);
    if (err.code === '42703') {
      return res.status(503).json({
        message: 'Run add_store_paid_columns migration first.',
      });
    }
    res.status(500).json({ message: 'Error updating order' });
  }
});

// GET /api/store/orders/:id?email=
router.get('/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const email = req.query.email;

    const orderResult = await query(
      `
      SELECT
        id, customer_name, email, phone, fulfillment,
        address_line1, address_line2, city, state, zip,
        payment_method, status, total_cents, created_at,
        paid_at, paid_by
      FROM store_orders
      WHERE id = $1
      `,
      [id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = orderResult.rows[0];

    if (!email || !emailsMatch(email, order.email)) {
      return res.status(401).json({
        requiresEmail: true,
        message: 'Email required to view this order',
      });
    }

    const itemsResult = await query(
      `
      SELECT product_id, product_name, size, color, quantity, unit_price_cents
      FROM store_order_items
      WHERE order_id = $1
      ORDER BY created_at ASC
      `,
      [id]
    );

    const pay = paymentInfo();

    res.json({
      id: order.id,
      customer_name: order.customer_name,
      email: order.email,
      fulfillment: order.fulfillment,
      payment_method: order.payment_method,
      status: order.status,
      total_cents: order.total_cents,
      created_at: order.created_at,
      paid_at: order.paid_at,
      items: itemsResult.rows,
      payment_info: pay,
    });
  } catch (err) {
    console.error('Error fetching store order:', err);
    if (err.code === '42P01') {
      return res.status(503).json({
        message: 'Store is not set up yet. Please run the store schema migration.',
      });
    }
    // paid_at column missing — retry without it
    if (err.code === '42703') {
      return res.status(503).json({
        message: 'Run add_store_paid_columns migration first.',
      });
    }
    res.status(500).json({ message: 'Error fetching order' });
  }
});

export default router;
