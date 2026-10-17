import { GoogleGenAI } from '@google/genai';

export interface AIAnalysisResult {
  isRelevant: boolean;
  confidence: number;
  reason?: string;
  title?: string;
  category?: string;
  subcategory?: string;
  severity?: 'Low' | 'Medium' | 'High' | 'Critical';
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  department?: string;
  description?: string;
  tags?: string[];
}

export async function analyzeCivicImageWithGemini(
  imageBuffer: Buffer,
  mimeType: string,
  userPromptHint?: string
): Promise<AIAnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    throw new Error('Gemini API key is not configured. Please set GEMINI_API_KEY in the server .env file.');
  }

  const client = new GoogleGenAI({ apiKey });

  const prompt = `You are an expert civic infrastructure diagnostic AI inspector for a municipal public grievance reporting system.
Carefully inspect the provided image to determine whether it shows an actual, visible civic or public infrastructure problem.

=== CRITICAL EVALUATION RULES ===
1. PRIMARY EVIDENCE IS THE IMAGE:
   - Your determination MUST be based strictly on visible evidence in the photo.
   - Do NOT assume, invent, or extrapolate a problem that is not visibly present.
   - Even if user-provided text or hints mention an issue (e.g., "${userPromptHint || ''}"), if the image does NOT visibly show that civic defect, you MUST reject the image as not relevant (isRelevant: false).

2. WHAT QUALIFIES AS RELEVANT (isRelevant: true):
   The image must visibly show an actionable municipal/public infrastructure issue, such as:
   - Roads & Potholes: Asphalt potholes, road surface collapse, broken road pavement, asphalt craters.
   - Street Lighting: Broken luminaire, damaged streetlight pole, downed light fixture, hazardous dark fixture.
   - Sanitation & Waste: Overflowing public trash bins, large uncollected garbage mounds, illegal street dumping.
   - Water & Drainage: Burst water main pipelines, massive potable water leakage, sewage overflow, flooded street/waterlogging, broken storm drains, missing manhole covers.
   - Public Safety & Infra: Hazardous dangling/exposed electrical wires, fallen utility cables, destroyed road dividers, broken pedestrian footpaths, destroyed traffic signals.

3. WHAT MUST BE REJECTED AS IRRELEVANT (isRelevant: false):
   You MUST set isRelevant to false for any photo that does NOT show an actual, actionable public problem, including:
   - Selfies, faces, personal portraits, or pictures of people.
   - Food, dishes, drinks, meals, groceries.
   - Household or office interiors: bedrooms, living rooms, furniture, ceilings, indoor floors.
   - Personal electronics: laptops, phones, computer monitors, keyboards.
   - Normal, clean roads, streets, or highways with NO visible potholes or damage.
   - Normal, undamaged buildings, houses, or walls.
   - Trees, parks, lawns, or animals with no public infrastructure hazard.
   - Random household objects, vehicles with no road damage, artwork, screenshots, memes, or documents.
   - Blurry, dark, or unidentifiable photos where no public defect can be clearly seen.

4. BE HIGHLY CONSERVATIVE:
   - When in doubt, or if visual evidence of damage is lacking, set isRelevant: false.
   - Distinguish a normal road from a pothole, a normal streetlight from a broken one, and a normal water container from a pipeline leak.

=== OUTPUT JSON FORMAT ===
You MUST return ONLY a valid JSON object matching one of these two structures, with no markdown wrappers or extra commentary:

If NOT a relevant civic issue:
{
  "isRelevant": false,
  "confidence": 0.95,
  "reason": "Clear explanation of what the image actually depicts and why it does not show a public civic infrastructure problem."
}

If IT IS a relevant civic issue:
{
  "isRelevant": true,
  "confidence": 0.92,
  "title": "Concise factual title (max 8 words, e.g., 'Deep asphalt pothole on roadway')",
  "description": "2-3 sentence technical description of the visible damage, safety hazard, and required municipal dispatch.",
  "category": "One of: 'Roads & Potholes' | 'Street Lighting' | 'Sanitation & Waste' | 'Water & Drainage' | 'Public Safety'",
  "subcategory": "Specific defect name (e.g. 'Pothole', 'Damaged Streetlight Pole', 'Garbage Overflow', 'Pipeline Rupture', 'Clogged Storm Drain', 'Open Manhole', 'Dangling Cable')",
  "severity": "One of: 'Low' | 'Medium' | 'High' | 'Critical'",
  "department": "One of: 'Roads & Infrastructure' | 'Electrical' | 'Sanitation' | 'Water Department' | 'Public Works'",
  "tags": ["relevant", "keywords"]
}`;

  // Model fallback chain — validated working models ordered by speed preference
  // gemini-3.5-flash, gemini-3.5-flash-lite, gemini-flash-latest are confirmed active
  const MODEL_FALLBACKS = [
    'gemini-3.5-flash',
    'gemini-3.5-flash-lite',
    'gemini-flash-latest',
    'gemini-3.8-flash',
    'gemini-3.7-flash',
  ];

  const base64Data = imageBuffer.toString('base64');
  const imagePayload = {
    role: 'user' as const,
    parts: [
      { text: prompt },
      { inlineData: { data: base64Data, mimeType: mimeType || 'image/jpeg' } },
    ],
  };

  let lastError: any = null;

  for (const model of MODEL_FALLBACKS) {
    try {
      console.log(`[GeminiVision] Trying model: ${model}`);
      const response = await client.models.generateContent({
        model,
        contents: [imagePayload],
        config: { responseMimeType: 'application/json' },
      });

      const responseText = response.text || '';
      if (!responseText.trim()) {
        throw new Error('Gemini Vision returned an empty response.');
      }

      console.log(`[GeminiVision] Success with model: ${model}`);

      const cleaned = responseText.replace(/```json/gi, '').replace(/```/gi, '').trim();
      const parsed = JSON.parse(cleaned);

      const isRelevant = Boolean(parsed.isRelevant);
      const confidence = typeof parsed.confidence === 'number'
        ? Math.min(Math.max(parsed.confidence, 0), 1)
        : 0.9;

      if (!isRelevant) {
        return {
          isRelevant: false,
          confidence,
          reason: parsed.reason || 'The uploaded image does not show a clearly identifiable civic or public infrastructure issue.',
        };
      }

      // Normalize category
      let category = parsed.category || 'Roads & Potholes';
      const validCategories = [
        'Roads & Potholes',
        'Street Lighting',
        'Sanitation & Waste',
        'Water & Drainage',
        'Public Safety',
      ];
      if (!validCategories.includes(category)) {
        const lower = category.toLowerCase();
        if (lower.includes('light')) category = 'Street Lighting';
        else if (lower.includes('waste') || lower.includes('sanitation') || lower.includes('garbage')) category = 'Sanitation & Waste';
        else if (lower.includes('water') || lower.includes('drain')) category = 'Water & Drainage';
        else if (lower.includes('safety')) category = 'Public Safety';
        else category = 'Roads & Potholes';
      }

      // Normalize department
      let department = parsed.department || 'Roads & Infrastructure';
      const validDepts = [
        'Roads & Infrastructure',
        'Electrical',
        'Sanitation',
        'Water Department',
        'Public Works',
      ];
      if (!validDepts.includes(department)) {
        if (category === 'Street Lighting') department = 'Electrical';
        else if (category === 'Sanitation & Waste') department = 'Sanitation';
        else if (category === 'Water & Drainage') department = 'Water Department';
        else if (category === 'Public Safety') department = 'Public Works';
        else department = 'Roads & Infrastructure';
      }

      // Normalize severity / priority
      let severity: 'Low' | 'Medium' | 'High' | 'Critical' = parsed.severity || parsed.priority || 'Medium';
      if (!['Low', 'Medium', 'High', 'Critical'].includes(severity)) {
        severity = 'Medium';
      }

      return {
        isRelevant: true,
        confidence,
        title: parsed.title || 'Civic Infrastructure Defect',
        description: parsed.description || 'Visual analysis detected public infrastructure maintenance requirement.',
        category,
        subcategory: parsed.subcategory || category,
        severity,
        priority: severity,
        department,
        tags: Array.isArray(parsed.tags) ? parsed.tags : ['civic-issue'],
      };
    } catch (err: any) {
      console.warn(`[GeminiVision] Model ${model} encountered an issue:`, err.message || err);
      lastError = err;
      // Loop continues to next model in MODEL_FALLBACKS
    }
  }

  // If all fallback models failed
  console.error('[GeminiVision] All fallback models failed. Last error:', lastError);
  let friendlyMsg = 'AI image analysis is temporarily experiencing high traffic. Please try uploading again in a few moments.';
  if (lastError?.message) {
    try {
      const parsedErr = JSON.parse(lastError.message);
      if (parsedErr?.error?.message) {
        friendlyMsg = parsedErr.error.message;
      }
    } catch {
      friendlyMsg = lastError.message;
    }
  }
  throw new Error(friendlyMsg);
}

export interface ImageComparisonResult {
  isSameDefect: boolean;
  confidence: number;
  reason: string;
}

export async function compareCivicImagesWithGemini(
  image1Buffer: Buffer,
  mimeType1: string,
  image2Buffer: Buffer,
  mimeType2: string
): Promise<ImageComparisonResult | null> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    return null;
  }

  const client = new GoogleGenAI({ apiKey });

  const prompt = `You are an expert civic infrastructure diagnostic AI inspector.
Compare the two provided images (Image 1 and Image 2) taken in the same geographic vicinity.
Determine whether Image 1 and Image 2 depict the EXACT SAME physical civic infrastructure defect (e.g. the same physical pothole on the road surface, the same broken streetlight pole, the same garbage mound, the same leaking pipe rupture) or TWO DIFFERENT distinct defects at nearby locations.

Carefully examine:
1. Defect morphology (shape, crater depth, surrounding pavement cracks, curb features, road markings, size).
2. Background context, lighting, and surrounding environment.
3. Distinguish whether differences are simply due to camera perspective/angles of the same defect vs. two separate defects.

Return ONLY a valid JSON object matching this structure with no markdown code blocks:
{
  "isSameDefect": true or false,
  "confidence": 0.0 to 1.0,
  "reason": "Detailed concise explanation of the visual comparison and defect matching rationale."
}`;

  const MODEL_FALLBACKS = [
    'gemini-3.5-flash',
    'gemini-3.5-flash-lite',
    'gemini-flash-latest',
    'gemini-3.8-flash',
    'gemini-3.7-flash',
  ];

  const base64_1 = image1Buffer.toString('base64');
  const base64_2 = image2Buffer.toString('base64');

  const contentPayload = {
    role: 'user' as const,
    parts: [
      { text: prompt },
      { inlineData: { data: base64_1, mimeType: mimeType1 || 'image/jpeg' } },
      { inlineData: { data: base64_2, mimeType: mimeType2 || 'image/jpeg' } },
    ],
  };

  for (const model of MODEL_FALLBACKS) {
    try {
      const response = await client.models.generateContent({
        model,
        contents: [contentPayload],
        config: { responseMimeType: 'application/json' },
      });

      const responseText = response.text || '';
      if (!responseText.trim()) {
        continue;
      }

      const cleaned = responseText.replace(/```json/gi, '').replace(/```/gi, '').trim();
      const parsed = JSON.parse(cleaned);

      const isSameDefect = Boolean(parsed.isSameDefect);
      const confidence = typeof parsed.confidence === 'number'
        ? Math.min(Math.max(parsed.confidence, 0), 1)
        : 0.8;

      return {
        isSameDefect,
        confidence,
        reason: parsed.reason || 'Visual comparison completed.',
      };
    } catch (err: any) {
      console.warn(`[GeminiVision] Compare model ${model} issue:`, err?.message || err);
      // Try next model
    }
  }

  return null;
}

