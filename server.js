// server.js (Groq + Supabase version)
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security and middleware
app.use(helmet());
app.use(cors({ origin: true }));
app.use(express.json({ limit: '25mb' }));
app.use(morgan('dev'));

// Disable caching to avoid stale results
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.set('Surrogate-Control', 'no-store');
  next();
});

// Groq configuration
const API_KEY = process.env.GROQ_API_KEY || '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';
const MODEL_NAME = 'meta-llama/llama-4-maverick-17b-128e-instruct';
const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';

if (!API_KEY) {
  console.error('ERROR: GROQ_API_KEY is not set. Please set it in .env');
  process.exit(1);
}

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

let supabase = null;
if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log('✅ Supabase connected successfully');
} else {
  console.warn('⚠️  Supabase credentials not found. Database features disabled.');
}

// Helper function to call Groq API
async function callGroqAPI(messages, options = {}) {
  const response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: MODEL_NAME,
      messages: messages,
      temperature: options.temperature || 0.0,
      max_tokens: options.maxTokens || 2048,
      response_format: options.responseFormat || { type: 'text' }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// Health check endpoint
const APP_VERSION = 'medinsight-ocr-v2';
app.get('/health', (req, res) => {
  res.set('X-App-Version', APP_VERSION);
  res.json({ status: 'ok', version: APP_VERSION, timestamp: new Date().toISOString() });
});

// Version endpoint for quick verification
app.get('/version', (req, res) => {
  res.json({ version: APP_VERSION, model: MODEL_NAME, partsFormat: 'inlineData', port: process.env.PORT || 3000 });
});

// Helper function to validate image data
function validateImageData(imageBase64, mimeType) {
  if (!imageBase64 || !mimeType) {
    return { valid: false, error: 'imageBase64 and mimeType are required' };
  }

  // Basic validation for base64 data
  const base64Regex = /^[A-Za-z0-9+/=]+$/;
  const dataStripped = imageBase64.replace(/^data:[^;]+;base64,/, '');
  const cleanedBase64 = dataStripped.replace(/\s+/g, '');
  
  if (!base64Regex.test(cleanedBase64)) {
    return { valid: false, error: 'Invalid base64 image data' };
  }

  // Validate mime type (allow images or PDF)
  const isImage = /^image\/(jpe?g|png|gif|bmp|webp)$/i.test(mimeType);
  if (!isImage) {
    return {
      valid: false,
      error: 'Unsupported format. Please upload an image (JPEG, PNG, GIF, BMP, WebP) or a PDF.'
    };
  }

  // Validate payload size: PDFs up to 10MB, images up to 4MB
  const sizeInBytes = (dataStripped.length * 3) / 4;
  const maxBytes = 4 * 1024 * 1024;
  if (sizeInBytes > maxBytes) {
    return {
      valid: false,
      error: 'Image size exceeds 4MB limit. Please use a smaller image.'
    };
  }

  return { valid: true };
}

// Helper function to extract JSON from text
function extractJsonBlock(s) {
  if (!s) return null;
  
  // Try to find a code block with json
  const codeBlockMatch = s.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim();
  }
  
  // Try to find a JSON object
  const jsonMatch = s.match(/\{[\s\S]*\}/);
  return jsonMatch ? jsonMatch[0] : null;
}

// Analyze endpoint
// Save analysis to database
async function saveAnalysis(analysisData) {
  if (!supabase) {
    console.log('Supabase not configured, skipping save');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('analyses')
      .insert([{
        modality: analysisData.modality,
        severity: analysisData.severity,
        summary: analysisData.summary,
        details: analysisData.details,
        recommended_actions: analysisData.recommended_actions,
        ocr_has_text: analysisData.ocr_has_text,
        ocr_excerpt: analysisData.ocr_excerpt,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Error saving to database:', error);
      return null;
    }

    console.log('✅ Analysis saved to database with ID:', data.id);
    return data;
  } catch (err) {
    console.error('Database save error:', err);
    return null;
  }
}

// Get analysis history
app.get('/history', async (req, res) => {
  if (!supabase) {
    return res.status(503).json({ error: 'Database not configured' });
  }

  try {
    const limit = parseInt(req.query.limit) || 10;
    const { data, error } = await supabase
      .from('analyses')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching history:', error);
      return res.status(500).json({ error: 'Failed to fetch history' });
    }

    res.json({ analyses: data, count: data.length });
  } catch (err) {
    console.error('History fetch error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get statistics
app.get('/stats', async (req, res) => {
  if (!supabase) {
    return res.status(503).json({ error: 'Database not configured' });
  }

  try {
    const { data, error } = await supabase
      .from('analyses')
      .select('modality, severity');

    if (error) {
      console.error('Error fetching stats:', error);
      return res.status(500).json({ error: 'Failed to fetch stats' });
    }

    // Calculate statistics
    const stats = {
      total_analyses: data.length,
      by_modality: {
        xray: data.filter(a => a.modality === 'xray').length,
        blood_test: data.filter(a => a.modality === 'blood_test').length,
        prescription: data.filter(a => a.modality === 'prescription').length,
        other: data.filter(a => a.modality === 'other').length
      },
      by_severity: {
        green: data.filter(a => a.severity === 'green').length,
        yellow: data.filter(a => a.severity === 'yellow').length,
        red: data.filter(a => a.severity === 'red').length
      }
    };

    res.json(stats);
  } catch (err) {
    console.error('Stats fetch error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/analyze', async (req, res) => {
  try {
    const { imageBase64, mimeType, modality } = req.body || {};

    // Validate input data
    const validation = validateImageData(imageBase64, mimeType);
    if (!validation.valid) {
      return res.status(400).json({ 
        error: 'Invalid image data',
        detail: validation.error
      });
    }

    const allowedModalities = ['xray', 'blood_test', 'prescription'];
    if (!modality || !allowedModalities.includes(modality)) {
      return res.status(400).json({ 
        error: 'Invalid modality', 
        detail: 'Select one of: xray, blood_test, prescription' 
      });
    }

    // Prepare image bytes for the model (strip any data URL prefix)
    const dataStripped = imageBase64.replace(/^data:[^;]+;base64,/, '');
    // Create image part for the model using inlineData for @google/generative-ai
    const imageInlinePart = { inlineData: { data: dataStripped, mimeType } };

    // Handle PDF input by extracting text (first pages) and skipping image part
    let isPdf = mimeType === 'application/pdf';
    let pdfText = '';
    if (isPdf) {
      if (modality === 'xray') {
        return res.status(400).json({ error: 'Unsupported input', detail: 'For X-ray, please upload an image (PNG/JPG), not a PDF.' });
      }
      try {
        const buf = Buffer.from(dataStripped, 'base64');
        const parsed = await pdfParse(buf);
        pdfText = (parsed.text || '').trim();
        if (!pdfText || pdfText.length < 10) {
          return res.status(400).json({ error: 'PDF has no readable text', detail: 'Please upload a PDF with selectable text or use a clear image instead.' });
        }
      } catch (e) {
        return res.status(400).json({ error: 'Failed to parse PDF', detail: String(e.message || e) });
      }
    }

    // OCR pass: extract text if present
    async function runOCR() {
      const ocrPrompt = `Extract all legible text from the supplied image as plain text (preserve important numbers/units like mg/dL, mmHg). Output strict JSON only:\n{\n  "has_text": boolean,\n  "ocr_text": string\n}`;
      
      try {
        const messages = [
          {
            role: 'user',
            content: [
              { type: 'text', text: ocrPrompt },
              { 
                type: 'image_url', 
                image_url: { 
                  url: `data:${mimeType};base64,${dataStripped}` 
                } 
              }
            ]
          }
        ];
        
        const text = await callGroqAPI(messages, {
          temperature: 0.0,
          maxTokens: 2048,
          responseFormat: { type: 'json_object' }
        });
        
        try {
          const parsed = JSON.parse(text);
          return {
            has_text: Boolean(parsed.has_text),
            ocr_text: String(parsed.ocr_text || '')
          };
        } catch (e) {
          console.error('Failed to parse OCR response as JSON:', e);
          // fallback: return raw text as ocr_text if not strict JSON
          return { has_text: Boolean(text && text.trim().length > 0), ocr_text: String(text || '') };
        }
      } catch (error) {
        console.error('OCR failed:', error);
        return { has_text: false, ocr_text: '', error: error?.message || String(error) };
      }
    }

    // Main analysis prompt - Enhanced for detailed medical analysis
    const analysisInstruction = `You are an advanced medical AI assistant providing comprehensive analysis of medical images. Your goal is to provide detailed, actionable insights that help users understand their medical data.

ANALYSIS GUIDELINES:

For X-RAY scans:
- Identify the body part/region (chest, spine, bone, joint, etc.)
- Describe bone structure, alignment, and any visible abnormalities
- Note any fractures, dislocations, or degenerative changes
- Identify soft tissue abnormalities, fluid, or air where it shouldn't be
- Assess bone density and age-related changes if visible
- Provide at least 5-7 specific findings
- Be thorough but avoid over-alarming language

For BLOOD TEST reports:
- Extract ALL visible test names and their values with units
- Compare each value against standard reference ranges
- Identify which values are within normal range vs. abnormal
- Group related tests (e.g., lipid panel, liver function, kidney function)
- Explain what each abnormal value might indicate
- Note any critical or urgent findings
- Provide at least 8-12 specific test results with interpretations
- Include trends if multiple values are shown

For PRESCRIPTION documents:
- List ALL medications with exact dosages and frequency
- Identify the medication class (antibiotic, pain reliever, etc.)
- Explain the likely purpose of each medication
- Note any potential interactions or important considerations
- Identify duration of treatment if specified
- List any special instructions (take with food, avoid alcohol, etc.)
- Provide at least 4-6 detailed medication analyses
- Include pharmacy or prescriber information if visible

SEVERITY CLASSIFICATION:
- GREEN: Normal/healthy findings, routine results, standard prescriptions
- YELLOW: Mild abnormalities, monitoring needed, follow-up recommended
- RED: Significant abnormalities, urgent attention needed, critical values

OUTPUT FORMAT (strict JSON):
{
  "modality": "xray|blood_test|prescription|other",
  "severity": "green|yellow|red",
  "summary": "Comprehensive 3-4 sentence overview of the most important findings and their clinical significance",
  "details": [
    "Detailed finding 1 with specific measurements/values",
    "Detailed finding 2 with clinical context",
    "Detailed finding 3 with comparisons to normal ranges",
    "Continue with 5-12 detailed, specific findings based on the image type"
  ],
  "recommended_actions": [
    "Specific action 1 with timeline (e.g., 'Schedule follow-up with cardiologist within 2 weeks')",
    "Specific action 2 with clear next steps",
    "Specific action 3 with monitoring instructions",
    "Include 4-6 actionable recommendations"
  ],
  "disclaimer": "This is an AI-generated analysis and not a substitute for professional medical diagnosis. Always consult with a qualified healthcare professional for medical advice, diagnosis, or treatment."
}

IMPORTANT: Be thorough and specific. Include actual numbers, measurements, and values from the image. Provide clinical context for each finding. Help users understand their medical data clearly.`;

    async function analyzeWithModel(ocr = { has_text: false, ocr_text: '' }) {
      let textContent = analysisInstruction;

      if (ocr?.ocr_text) {
        textContent += `\n\nOCR extracted text (may include lab values and notes):\n${ocr.ocr_text.slice(0, 12000)}`;
      }
      if (modality) {
        textContent += `\n\nUser-stated modality hint: ${modality}`;
      }

      const messages = [
        {
          role: 'user',
          content: [
            { type: 'text', text: textContent },
            { 
              type: 'image_url', 
              image_url: { 
                url: `data:${mimeType};base64,${dataStripped}` 
              } 
            }
          ]
        }
      ];
      
      return await callGroqAPI(messages, {
        temperature: 0.0,
        maxTokens: 2048,
        responseFormat: { type: 'json_object' }
      });
    }

    // Decide model and whether to run OCR based on user-selected modality
    const wantsOCR = modality === 'blood_test' || modality === 'prescription';
    const modelForThis = MODEL_NAME;
    let ocr = { has_text: false, ocr_text: '' };

    if (wantsOCR) {
      try {
        console.log(`[OCR] Using model=${modelForThis}, modality=${modality}`);
        ocr = await runOCR();
        console.log('OCR completed. Text found:', ocr.has_text);
      } catch (error) {
        console.error('OCR failed, continuing without it:', error);
      }
    }

    // Run main analysis (no model fallback, always gemini-2.5-pro)
    let text;
    try {
      console.log(`[ANALYZE] Using model=${modelForThis}, modality=${modality}`);
      text = await analyzeWithModel(modelForThis, ocr);
    } catch (error) {
      console.error('Analysis failed:', error);
      return res.status(502).json({ error: 'Analysis failed', detail: error.message || String(error) });
    }

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      console.log('Initial JSON parse failed, trying to extract JSON block');
      const block = extractJsonBlock(text || '');
      if (block) {
        try {
          parsed = JSON.parse(block);
          console.log('Successfully parsed JSON from extracted block');
        } catch (innerError) {
          console.error('Failed to parse extracted JSON block:', {
            error: innerError.message,
            blockPreview: block.substring(0, 200) + (block.length > 200 ? '...' : '')
          });
        }
      } else {
        console.error('No valid JSON block found in response');
      }
    }

    // If still not parsed, log the raw response and try to convert to strict JSON
    if (!parsed) {
      console.error('Failed to parse response as JSON. Raw response:', text);
      
      // Try to clean up the response text
      let cleanedText = (text || '').trim();
      
      // Remove markdown code blocks if present
      cleanedText = cleanedText.replace(/^```(?:json)?\s*|```$/g, '').trim();
      
      // Try to parse again with cleaned text
      try {
        parsed = JSON.parse(cleanedText);
        console.log('Successfully parsed after cleaning markdown');
      } catch (e) {
        console.log('Still could not parse, trying structured conversion...');

        const schemaHint = '{\n  \"modality\": \"xray|blood_test|prescription|other\",\n  \"severity\": \"green|yellow|red\",\n  \"summary\": string,\n  \"details\": string[],\n  \"recommended_actions\": string[],\n  \"disclaimer\": string\n}';

        try {
          const messages = [
            {
              role: 'user',
              content: `Convert the following assistant output into strict JSON matching this schema. Return ONLY JSON.\nSchema:\n${schemaHint}\n\nAssistant output:\n${(text || '').slice(0, 12000)}`
            }
          ];
          
          const convText = await callGroqAPI(messages, {
            temperature: 0,
            maxTokens: 512,
            responseFormat: { type: 'json_object' }
          });

          const jsonToParse = extractJsonBlock(convText) || convText;
          if (!jsonToParse) {
            throw new Error('No valid JSON found in conversion response');
          }
          parsed = JSON.parse(jsonToParse);
        } catch (e) {
          console.error('Failed to parse converted JSON:', e.message || e);
          // Final fallback: construct a safe, conservative response (never error to client)
          const fallback = {
            modality: ['xray', 'blood_test', 'prescription', 'other'].includes(modality || '') ? modality : 'other',
            severity: 'yellow',
            summary: 'Preliminary analysis could not be fully structured. Please review the details and consider re-uploading a clearer image.',
            details: [
              'The AI returned an unstructured response. This fallback summary is provided to avoid blocking you.',
              'If this is a blood report or prescription, ensure text is readable and well lit.',
            ],
            recommended_actions: [
              'Re-upload a clearer image (PNG/JPG, avoid heavy compression).',
              'Verify you selected the correct type (X-ray, Blood Test, or Prescription).',
              'Consult a qualified healthcare professional for medical advice.',
            ],
            disclaimer:
              'This is an AI-generated analysis and not a medical diagnosis. Please consult a qualified healthcare professional.',
            ocr_excerpt: (typeof ocr?.ocr_text === 'string' ? ocr.ocr_text : '').slice(0, 500),
            ocr_has_text: Boolean(ocr?.ocr_text && ocr.ocr_text.trim().length > 0),
          };
          return res.json(fallback);
        }
      }

    }

    try {
      // Validate fields and normalize
      if (!parsed) {
        throw new Error('Failed to parse AI response');
      }

      const severity = ['green', 'yellow', 'red'].includes(parsed.severity) 
        ? parsed.severity 
        : 'yellow';
      const modalityOut = ['xray', 'blood_test', 'prescription', 'other'].includes(parsed.modality)
        ? parsed.modality
        : (modality || 'other');

      const response = {
        modality: modalityOut,
        severity,
        summary: parsed.summary || 'No summary available.',
        details: Array.isArray(parsed.details) ? parsed.details : (parsed.details ? [String(parsed.details)] : []),
        recommended_actions: Array.isArray(parsed.recommended_actions)
          ? parsed.recommended_actions
          : (parsed.recommended_actions ? [String(parsed.recommended_actions)] : []),
        disclaimer:
          parsed.disclaimer ||
          'This is an AI-generated analysis and not a medical diagnosis. Please consult a qualified healthcare professional.',
        ocr_excerpt: ocr?.ocr_text ? ocr.ocr_text.slice(0, 500) : '',
        ocr_has_text: Boolean(ocr?.has_text),
      };

      // Save to database (async, don't wait for it)
      saveAnalysis(response).catch(err => {
        console.error('Failed to save analysis to database:', err);
      });

      return res.json(response);
    } catch (err) {
      // Log the full error for debugging
      console.error('Error in request processing:', {
        message: err.message,
        stack: err.stack,
        timestamp: new Date().toISOString()
      });
      console.error('Error in /analyze endpoint:', {
        message: err.message,
        stack: err.stack,
        requestBody: req.body ? {
          hasImage: !!req.body.imageBase64,
          mimeType: req.body.mimeType,
          modality: req.body.modality,
          imageSize: req.body.imageBase64 ? req.body.imageBase64.length : 0
        } : 'No request body',
        timestamp: new Date().toISOString()
      });
      
      // Provide more detailed error information in development
      const errorDetail = process.env.NODE_ENV === 'development' 
        ? `Error: ${err.message}\n${err.stack}`
        : 'An error occurred while processing your request. Please try again with a different image.';
        
      res.status(500).json({ 
        error: 'Failed to analyze image', 
        detail: errorDetail,
        timestamp: new Date().toISOString()
      });
    }
  } catch (outerErr) {
    console.error('Unexpected error in /analyze handler:', outerErr);
    res.status(500).json({ error: 'Unexpected server error', detail: outerErr?.message || String(outerErr) });
  }
});

// Reset endpoint to help client clear any server-side state (stateless here but allows future extensibility)
app.post('/reset', (req, res) => {
  res.json({ ok: true });
});

// Serve static frontend
app.use(express.static(path.join(__dirname, 'public')));

// Fallback to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Consider whether to exit the process here
  // process.exit(1);
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

// Handle server errors
server.on('error', (error) => {
  try {
    if (error.syscall !== 'listen') {
      throw error;
    }

    const bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT;

    // Handle specific listen errors with friendly messages
    switch (error.code) {
      case 'EACCES':
        console.error(bind + ' requires elevated privileges');
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(bind + ' is already in use');
        process.exit(1);
        break;
      default:
        console.error('Server error:', error);
        process.exit(1);
    }
  } catch (serverError) {
    console.error('Error in server error handler:', serverError);
    process.exit(1);
  }
});
