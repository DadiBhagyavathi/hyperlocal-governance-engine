/**
 * HyperGov — ML Service Proxy Routes
 * Forwards: Node.js → FastAPI ML service (port 8000) / Agent (port 8001)
 * Mounted at: /api/v1/ml
 */

const express = require('express');
const router  = express.Router();
const http    = require('http');
const https   = require('https');

const ML_BASE    = process.env.ML_SERVICE_URL || 'http://localhost:8000';
const AGENT_BASE = process.env.AGENT_BASE_URL || 'http://localhost:8001';

// ── Generic proxy helpers ─────────────────────────────────────────────────────
function proxyPost(baseUrl, path, body) {
  const url     = new URL(path, baseUrl);
  const client  = url.protocol === 'https:' ? https : http;
  const payload = JSON.stringify(body);

  return new Promise((resolve, reject) => {
    const req = client.request(
      {
        hostname: url.hostname, port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname, method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
      },
      (res) => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => {
          try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
          catch { resolve({ status: res.statusCode, body: { raw: data } }); }
        });
      }
    );
    req.on('error', reject);
    req.setTimeout(12000, () => { req.destroy(); reject(new Error('ML service timeout')); });
    req.write(payload);
    req.end();
  });
}

function proxyGet(baseUrl, path) {
  const url    = new URL(path, baseUrl);
  const client = url.protocol === 'https:' ? https : http;

  return new Promise((resolve, reject) => {
    const req = client.get(
      { hostname: url.hostname, port: url.port || (url.protocol === 'https:' ? 443 : 80), path: url.pathname },
      (res) => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => {
          try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
          catch { resolve({ status: res.statusCode, body: { raw: data } }); }
        });
      }
    );
    req.on('error', reject);
    req.setTimeout(8000, () => { req.destroy(); reject(new Error('ML service timeout')); });
  });
}

// ── GET /api/v1/ml/health ─────────────────────────────────────────────────────
router.get('/health', async (req, res) => {
  try {
    const r = await proxyGet(ML_BASE, '/health');
    res.status(r.status).json(r.body);
  } catch (e) {
    res.status(503).json({ success: false, message: 'ML service unreachable', error: e.message });
  }
});

// ── GET /api/v1/ml/status ─────────────────────────────────────────────────────
router.get('/status', async (req, res) => {
  try {
    const r = await proxyGet(ML_BASE, '/models/status');
    res.status(r.status).json(r.body);
  } catch (e) {
    res.status(503).json({ success: false, message: 'ML service unreachable', error: e.message });
  }
});

// ── POST /api/v1/ml/classify ──────────────────────────────────────────────────
// Body: { text: "Street lights not working" }
router.post('/classify', async (req, res) => {
  const { text } = req.body;
  if (!text || text.trim().length < 5)
    return res.status(400).json({ success: false, message: 'text must be at least 5 characters' });
  try {
    const r = await proxyPost(ML_BASE, '/classify', { text });
    res.status(r.status).json(r.body);
  } catch (e) {
    res.status(503).json({ success: false, message: 'ML service error', error: e.message });
  }
});

// ── POST /api/v1/ml/delay ─────────────────────────────────────────────────────
// Body: { budget_lakhs, duration_days, progress_pct, complaint_count, region, department }
router.post('/delay', async (req, res) => {
  const required = ['budget_lakhs','duration_days','progress_pct','complaint_count','region','department'];
  const missing  = required.filter(k => req.body[k] === undefined);
  if (missing.length)
    return res.status(400).json({ success: false, message: `Missing fields: ${missing.join(', ')}` });
  try {
    const r = await proxyPost(ML_BASE, '/delay', req.body);
    res.status(r.status).json(r.body);
  } catch (e) {
    res.status(503).json({ success: false, message: 'ML service error', error: e.message });
  }
});

// ── POST /api/v1/ml/sentiment ─────────────────────────────────────────────────
// Body: { text: "The service was excellent" }
router.post('/sentiment', async (req, res) => {
  const { text } = req.body;
  if (!text || text.trim().length < 3)
    return res.status(400).json({ success: false, message: 'text required (min 3 chars)' });
  try {
    const r = await proxyPost(ML_BASE, '/sentiment', { text });
    res.status(r.status).json(r.body);
  } catch (e) {
    res.status(503).json({ success: false, message: 'ML service error', error: e.message });
  }
});

// ── POST /api/v1/ml/budget ──────────────────────────────────────────────────
router.post('/budget', async (req, res) => {
  const required = ['budget_lakhs','duration_days','progress_pct','complaint_count','region','department'];
  const missing  = required.filter(k => req.body[k] === undefined);
  if (missing.length)
    return res.status(400).json({ success: false, message: `Missing fields: ${missing.join(', ')}` });
  try {
    const r = await proxyPost(ML_BASE, '/budget', req.body);
    res.status(r.status).json(r.body);
  } catch (e) {
    res.status(503).json({ success: false, message: 'ML service error', error: e.message });
  }
});

// ── POST /api/v1/ml/cluster ──────────────────────────────────────────────────
router.post('/cluster', async (req, res) => {
  const { text } = req.body;
  if (!text || text.trim().length < 5)
    return res.status(400).json({ success: false, message: 'text required (min 5 chars)' });
  try {
    const r = await proxyPost(ML_BASE, '/cluster', { text });
    res.status(r.status).json(r.body);
  } catch (e) {
    res.status(503).json({ success: false, message: 'ML service error', error: e.message });
  }
});

// ── POST /api/v1/ml/batch ─────────────────────────────────────────────────────
router.post('/batch', async (req, res) => {
  const { texts } = req.body;
  if (!Array.isArray(texts) || texts.length === 0)
    return res.status(400).json({ success: false, message: 'texts array required' });
  try {
    const r = await proxyPost(ML_BASE, '/batch/classify', { texts });
    res.status(r.status).json(r.body);
  } catch (e) {
    res.status(503).json({ success: false, message: 'ML service error', error: e.message });
  }
});

// ── POST /api/v1/ml/agent ─────────────────────────────────────────────────────
// Body: { question: "How many projects are completed?", session_id: "user-123" }
router.post('/agent', async (req, res) => {
  const { question, session_id = 'default' } = req.body;
  if (!question || question.trim().length < 5)
    return res.status(400).json({ success: false, message: 'question required (min 5 chars)' });
  try {
    const r = await proxyPost(AGENT_BASE, '/agent/chat', { question, session_id });
    res.status(r.status).json(r.body);
  } catch (e) {
    res.status(503).json({ success: false, message: 'Agent service unreachable', error: e.message });
  }
});

module.exports = router;
