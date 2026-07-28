import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '../../data/builds.json');

// Helper to read data file
function readData() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading builds.json:', err);
    return { categories: [], components: {}, buildTemplates: [], orders: [] };
  }
}

// Helper to save data file
function saveData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing builds.json:', err);
    return false;
  }
}

/**
 * GET /api/inventory
 * Public & Admin: Fetch hardware inventory and component stock status
 */
router.get('/inventory', (req, res) => {
  const data = readData();
  res.json({
    categories: data.categories,
    components: data.components,
    buildTemplates: data.buildTemplates
  });
});

/**
 * PATCH /api/inventory/:catId/:compId
 * Admin Owner: Update component stock status, stock count, or price
 */
router.patch('/inventory/:catId/:compId', (req, res) => {
  const { catId, compId } = req.params;
  const { stockStatus, stockQuantity, price } = req.body;

  const data = readData();
  if (!data.components[catId]) {
    return res.status(404).json({ error: 'Category not found' });
  }

  const comp = data.components[catId].find((c) => c.id === compId);
  if (!comp) {
    return res.status(404).json({ error: 'Component not found' });
  }

  if (stockStatus !== undefined) comp.stockStatus = stockStatus;
  if (stockQuantity !== undefined) comp.stockQuantity = Number(stockQuantity);
  if (price !== undefined) comp.price = Number(price);

  saveData(data);
  res.json({ message: 'Inventory updated successfully', component: comp });
});

/**
 * GET /api/orders
 * Admin Owner: Fetch list of customer order reservations
 */
router.get('/orders', (req, res) => {
  const data = readData();
  res.json({ orders: data.orders || [] });
});

/**
 * POST /api/orders
 * Public Customer: Submit custom build order reservation
 */
router.post('/orders', (req, res) => {
  const { customerName, customerEmail, buildTitle, tier, totalPrice, components } = req.body;

  if (!customerEmail || !customerName) {
    return res.status(400).json({ error: 'Name and Email are required' });
  }

  const data = readData();
  if (!data.orders) data.orders = [];

  const newOrder = {
    id: 'ord-' + Date.now().toString().slice(-6),
    customerName,
    customerEmail,
    buildTitle: buildTitle || 'Custom Build',
    tier: tier || 'gaming',
    totalPrice: Number(totalPrice) || 0,
    orderDate: new Date().toISOString().split('T')[0],
    status: 'Pending',
    components: components || {}
  };

  data.orders.unshift(newOrder);
  saveData(data);

  res.status(201).json({ message: 'Order reservation placed successfully', order: newOrder });
});

/**
 * PATCH /api/orders/:id
 * Admin Owner: Update customer order status (Pending, In Assembly, Shipped, Completed)
 */
router.patch('/orders/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const data = readData();
  if (!data.orders) data.orders = [];

  const order = data.orders.find((o) => o.id === id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  if (status) order.status = status;

  saveData(data);
  res.json({ message: 'Order status updated', order });
});

export default router;
