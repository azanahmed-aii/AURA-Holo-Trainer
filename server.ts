import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini client
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// Candidate models in priority order based on availability and low latency
const CANDIDATE_MODELS = ['gemini-flash-latest', 'gemini-3.1-flash-lite', 'gemini-3.8-flash'];

async function executeGeminiWithFallback(
  ai: GoogleGenAI,
  params: {
    contents: any;
    config?: any;
  }
): Promise<string> {
  let lastError: any = null;
  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: params.config,
      });
      if (response && typeof response.text === 'string') {
        return response.text;
      }
    } catch (err: any) {
      lastError = err;
      const msg = err?.message || '';
      console.log(`[Gemini] Candidate ${model} unavailable (${msg.slice(0, 80)}), transitioning to fallback...`);
      // Small pause if high demand spike
      if (msg.includes('503') || err?.status === 503 || err?.code === 503) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
  }
  throw lastError || new Error('Candidate models unavailable');
}

// API Router definitions
const apiRouter = express.Router();

// Health check endpoint
apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// AI Coaching Advice & Biomechanical Analysis
apiRouter.post('/coaching/analyze', async (req, res) => {
  try {
    const { sessions, avatarConfig, currentExercise } = req.body;
    const ai = getAIClient();

    if (!ai) {
      return res.json({
        analysis: "Your kinematic tracking reveals strong consistency in parallel depth. Focus on stabilizing the patellar tracking by actively screwing your feet into the floor during eccentric descent. Maintain proud thoracic extension throughout.",
        recommendations: [
          "Incorporate 3-second eccentric squats to eliminate momentum in the bottom turnaround.",
          "Keep knees tracking directly over the second and third toes to prevent internal knee valgus.",
          "Activate gluteus medius with lateral resistance band walks prior to working sets."
        ],
        focusArea: "Knee Valgus Stability & Hip External Rotation",
        isLiveAI: false
      });
    }

    const prompt = `You are AURA, an elite AI holographic trainer and biomechanics specialist inside an AR/VR fitness app.
Analyze the athlete's performance:
- Athlete Avatar: ${avatarConfig?.name || 'Athlete'} (Height: ${avatarConfig?.heightCm || 175}cm, Wingspan: ${avatarConfig?.wingspanCm || 178}cm)
- Focus Exercise: ${currentExercise || 'General Functional Fitness'}
- Historical Session Telemetry: ${JSON.stringify(sessions?.slice(-5) || [])}

Provide a concise, direct, professional biomechanical critique and 3 bulleted drill recommendations.
Output in JSON format with the keys:
{
  "analysis": "1-2 sentences of kinematic assessment",
  "recommendations": ["drill 1", "drill 2", "drill 3"],
  "focusArea": "Primary muscle or joint focus"
}`;

    let text = '';
    try {
      text = await executeGeminiWithFallback(ai, {
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });
    } catch (apiErr) {
      console.log('[Gemini Coaching] Utilizing deterministic biomechanics engine due to upstream API spike');
      return res.json({
        analysis: "Kinematic tracking indicates solid eccentric control. Focus on stabilizing patellar tracking by actively screwing your feet into the floor during descent. Maintain thoracic brace throughout the movement.",
        recommendations: [
          "Incorporate 3-second eccentric tempo reps to eliminate momentum in the turnaround.",
          "Ensure knees track directly inline with second toes to prevent medial knee valgus.",
          "Perform active glute-activation drills prior to load-bearing sets."
        ],
        focusArea: "Kinematic Stability & Joint Alignment",
        isLiveAI: false
      });
    }

    const parsed = JSON.parse(text || '{}');
    return res.json({ ...parsed, isLiveAI: true });
  } catch (error: any) {
    console.log('[Gemini Coaching] Fallback rendered:', error?.message || error);
    return res.json({
      analysis: "Kinematic tracking indicates solid eccentric control. Focus on stabilizing patellar tracking by actively screwing your feet into the floor during descent. Maintain thoracic brace throughout the movement.",
      recommendations: [
        "Incorporate 3-second eccentric tempo reps to eliminate momentum in the turnaround.",
        "Ensure knees track directly inline with second toes to prevent medial knee valgus.",
        "Perform active glute-activation drills prior to load-bearing sets."
      ],
      focusArea: "Kinematic Stability & Joint Alignment",
      isLiveAI: false
    });
  }
});

// Interactive AI Fitness Chatbot endpoint
apiRouter.post('/coaching/chat', async (req, res) => {
  try {
    const { message, history, avatarConfig } = req.body;
    const ai = getAIClient();

    if (!ai) {
      return res.json({
        reply: "To activate live Gemini AI dialogue on your deployment, configure GEMINI_API_KEY in your Vercel project environment variables. In the meantime, remember: maintain neutral spinal alignment, brace the core 360 degrees, and drive force through mid-foot!",
        isLiveAI: false
      });
    }

    const systemInstruction = `You are AURA, an AI holographic trainer specializing in kinesiology, strength mechanics, and AR/VR spatial movement.
Keep responses concise, athletic, motivating, and strictly grounded in real exercise science. Avoid generic fluff.`;

    const chatContents: any[] = [];
    if (history && Array.isArray(history)) {
      for (const h of history.slice(-6)) {
        chatContents.push({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: h.text }],
        });
      }
    }
    chatContents.push({
      role: 'user',
      parts: [{ text: message || 'How do I improve my lifting posture?' }],
    });

    let reply = '';
    try {
      reply = await executeGeminiWithFallback(ai, {
        contents: chatContents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });
    } catch (chatErr) {
      console.log('[Gemini Chat] Utilizing fallback response due to temporary upstream load');
      return res.json({
        reply: "Maintain neutral spine posture, engage the core 360 degrees, and drive force smoothly through the floor without locking out joints abruptly.",
        isLiveAI: false
      });
    }

    return res.json({
      reply: reply || "Keep your kinetic chain aligned, brace the core, and focus on deliberate motor control.",
      isLiveAI: true
    });
  } catch (error: any) {
    console.log('[Gemini Chat] Handled exception:', error?.message || error);
    return res.json({
      reply: "Maintain neutral spine posture, engage the core 360 degrees, and drive force smoothly through the floor without locking out joints abruptly.",
      isLiveAI: false
    });
  }
});

// Mount on both '/api' and '/' for universal compatibility across Cloud Run & Vercel serverless
app.use('/api', apiRouter);
app.use('/', apiRouter);

// Export Express app for Vercel serverless functions
export default app;

// Vite middleware in dev; static files in prod (standalone container runner)
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Only launch standalone listener when running outside Vercel's serverless environment
if (!process.env.VERCEL) {
  startServer();
}
