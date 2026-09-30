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

  // Model fallback chain — tries fast, active models in order if one is experiencing high demand (503)
  const MODEL_FALLBACKS = [
    'gemini-3.5-flash-lite',
    'gemini-3.8-flash',
    'gemini-3.7-flash',
    'gemini-3.1-flash-lite',
    'gemini-flash-lite-latest',
    'gemini-3.5-flash',
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
