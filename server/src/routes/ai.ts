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
      mimeType = req.file.mimetype;
    } else if (req.body?.base64) {
      const rawBase64 = req.body.base64;
      const matches = rawBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        mimeType = matches[1];
        imageBuffer = Buffer.from(matches[2], 'base64');
      } else {
        imageBuffer = Buffer.from(rawBase64, 'base64');
      }
    }

    if (!imageBuffer) {
      return res.status(400).json({
        error: 'No image file or base64 payload provided for AI analysis.',
      });
    }

    const analysis = await analyzeCivicImageWithGemini(imageBuffer, mimeType, hint);

    return res.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error('AI analysis error:', error);
    return res.status(500).json({
      error: 'AI image analysis failed. Please try again.',
    });
  }
});

export default router;
