const aiService = require('../services/aiService');
const RiskAssessment = require('../models/RiskAssessment');

// ─────────────────────────────────────────────
// GET /ai/status — whether the AI layer is configured
// ─────────────────────────────────────────────
exports.getStatus = async (req, res, next) => {
  try {
    res.json({ success: true, data: { configured: aiService.isConfigured() } });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// POST /ai/chat — general health-info assistant
// ─────────────────────────────────────────────
exports.chat = async (req, res, next) => {
  try {
    const { message, history } = req.body;
    const result = await aiService.askHealthAssistant(message, history);
    res.json({ success: true, data: result });
  } catch (err) {
    // Provider errors shouldn't crash the request cycle — surface a
    // friendly message and log the real cause server-side.
    console.error('AI chat error:', err.message);
    res.status(502).json({ success: false, message: 'AI assistant is temporarily unavailable' });
  }
};

// ─────────────────────────────────────────────
// GET /ai/risk-assessments/:id/explain — plain-language risk explainer
// ─────────────────────────────────────────────
exports.explainRiskAssessment = async (req, res, next) => {
  try {
    const assessment = await RiskAssessment.findOne({ _id: req.params.id, citizen: req.user.id }).lean();
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Risk assessment not found' });
    }
    const result = await aiService.explainRiskAssessment(assessment);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('AI explain error:', err.message);
    res.status(502).json({ success: false, message: 'AI assistant is temporarily unavailable' });
  }
};
