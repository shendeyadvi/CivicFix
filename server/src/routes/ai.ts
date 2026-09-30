import { Router, Request, Response } from 'express';
import multer from 'multer';
import { analyzeCivicImageWithGemini } from '../services/geminiVision';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Analyze uploaded image using Gemini Multimodal Vision API
router.post('/analyze-image', upload.single('image'), async (req: Request, res: Response) => {
  try {
    let imageBuffer: Buffer | null = null;
    let mimeType = 'image/jpeg';
    const hint = req.body?.hint || req.body?.category || '';

    if (req.file) {
      imageBuffer = req.file.buffer;
      mimeType = req.file.mimetype || 'image/jpeg';
    } else if (req.body?.base64) {
      const rawBase64 = req.body.base64;
      const matches = rawBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        mimeType = matches[1];
        imageBuffer = Buffer.from(matches[2], 'base64');
      } else {
        imageBuffer = Buffer.from(rawBase64, 'base64');
      }
    } else if (req.body?.imageUrl && typeof req.body.imageUrl === 'string') {
      try {
        const fetchRes = await fetch(req.body.imageUrl);
        if (fetchRes.ok) {
          const arrayBuf = await fetchRes.arrayBuffer();
          imageBuffer = Buffer.from(arrayBuf);
          mimeType = fetchRes.headers.get('content-type') || 'image/jpeg';
        }
      } catch (fetchErr) {
        console.error('Failed to fetch image from imageUrl:', fetchErr);
      }
    }

    if (!imageBuffer) {
      return res.status(400).json({
        error: 'No valid image file, base64 payload, or image URL provided for AI analysis.',
      });
    }

    const analysis = await analyzeCivicImageWithGemini(imageBuffer, mimeType, hint);

    return res.json({
      success: true,
      data: analysis,
    });
  } catch (error: any) {
    console.error('AI analysis error in route:', error);
    let errorMessage = error?.message || 'AI image analysis failed. Please try again.';
    try {
      const parsed = JSON.parse(errorMessage);
      if (parsed?.error?.message) {
        errorMessage = parsed.error.message;
      }
    } catch {
      // not JSON string
    }

    const isApiKeyError =
      errorMessage.includes('GEMINI_API_KEY') ||
      errorMessage.includes('API key') ||
      errorMessage.includes('API_KEY');
    const statusCode = isApiKeyError ? 503 : 500;

    return res.status(statusCode).json({
      error: errorMessage,
    });
  }
});

export default router;
