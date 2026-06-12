/**
 * HyperGov ML Utilities — shared across all pages
 * Provides lightweight wrappers around /api/v1/ml/* endpoints
 */

const ML_API = '/api/v1/ml';

const MLUtils = {

  /** Classify a single complaint text */
  async classify(text) {
    const r = await fetch(`${ML_API}/classify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    return r.json();
  },

  /** Analyze sentiment of feedback text */
  async sentiment(text) {
    const r = await fetch(`${ML_API}/sentiment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    return r.json();
  },

  /** Predict project delay risk */
  async delay(params) {
    const r = await fetch(`${ML_API}/delay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return r.json();
  },

  /** Predict budget overrun */
  async budget(params) {
    const r = await fetch(`${ML_API}/budget`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return r.json();
  },

  /** Classify multiple texts in one request */
  async batchClassify(texts) {
    const r = await fetch(`${ML_API}/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texts }),
    });
    return r.json();
  },

  /** Check ML service health and model status */
  async status() {
    try {
      const r = await fetch(`${ML_API}/status`);
      return r.json();
    } catch {
      return null;
    }
  },

  /** Render a status pill element */
  statusPill(label, ok) {
    const color = ok ? '#27ae60' : '#e74c3c';
    const text  = ok ? 'Ready' : 'Offline';
    return `<span style="display:inline-flex;align-items:center;gap:5px;padding:3px 10px;
      border-radius:20px;background:white;box-shadow:0 1px 4px rgba(0,0,0,.1);
      font-size:.78rem;font-weight:600;">
      <span style="width:8px;height:8px;border-radius:50%;background:${color};display:inline-block"></span>
      ${label}: ${text}
    </span>`;
  },

  /** Priority badge HTML */
  priorityBadge(priority) {
    const map = {
      Low:      { bg:'#d1fae5', color:'#065f46' },
      Medium:   { bg:'#fef3c7', color:'#92400e' },
      High:     { bg:'#fee2e2', color:'#991b1b' },
      Critical: { bg:'#7f1d1d', color:'white'   },
    };
    const s = map[priority] || map.Medium;
    return `<span style="display:inline-block;padding:2px 8px;border-radius:20px;
      font-size:.72rem;font-weight:700;background:${s.bg};color:${s.color}">${priority}</span>`;
  },

  /** Sentiment colored label */
  sentimentLabel(sentiment, confidence) {
    const map = { Positive:'#27ae60', Negative:'#e74c3c', Neutral:'#f39c12' };
    const emoji = { Positive:'😊', Negative:'😠', Neutral:'😐' };
    const c = map[sentiment] || '#555';
    return `<span style="color:${c};font-weight:700">${emoji[sentiment]||''} ${sentiment}</span>
      <span style="color:#7f8c8d;font-size:.82rem"> (${confidence}%)</span>`;
  },
};

// Make available globally
window.MLUtils = MLUtils;
