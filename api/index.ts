import express from 'express';
import { blogApiRouter } from '../src/server/blogApiRouter';
import { GoogleGenAI, Type } from '@google/genai';

const app = express();

app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

app.use(express.json({ limit: '25mb' }));

// Form submission endpoint
app.post('/api/forms/submit', (req, res) => {
  try {
    const { fullName, email, honeypot, formTimeMs, type } = req.body || {};
    if (honeypot || (typeof formTimeMs === 'number' && formTimeMs < 800)) {
      res.status(400).json({ error: 'Automated submission rejected.' });
      return;
    }
    if (!fullName || !email) {
      res.status(400).json({ error: 'Full name and email are required.' });
      return;
    }
    const reference = `SG-${type === 'consultation' ? 'CONS' : 'INQ'}-${Date.now().toString(36).toUpperCase()}`;
    res.json({
      success: true,
      reference,
      message: 'Your dossier has been securely logged with the advisory desk.',
    });
  } catch {
    res.status(500).json({ error: 'Internal form error' });
  }
});

// Blog & Media routes
app.use('/api', blogApiRouter);

// Export for Vercel Serverless Functions
export default app;
