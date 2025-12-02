# MedInsight - Medical Image Analyzer

Analyze X-rays, blood test reports, and prescriptions using Google Gemini 2.5 Pro (Vision). Text-to-speech is currently disabled; you can integrate Google Cloud Text-to-Speech if needed.

## Quick start

1. Prereqs: Node.js 18+
2. Install deps:

```bash
npm install
```

3. Set your API key:

- Copy `.env.example` to `.env`
- Set `GOOGLE_API_KEY` to your Google AI Studio API key (https://aistudio.google.com/)
- Optionally set Supabase credentials for database features

4. Text-to-Speech is disabled by default after migration. To add TTS, integrate Google Cloud Text-to-Speech and expose it via the /text-to-speech endpoint.

5. Run the server:

```bash
npm start
```

Then open http://localhost:3000 in your browser.

## Features

- **Medical Image Analysis**: Analyze X-rays, blood test reports, and prescriptions using Google Gemini 2.5 Pro (Vision)
- **OCR Integration**: Automatic text extraction from blood tests and prescriptions for detailed analysis
- **Text-to-Speech**: Optional; integrate Google Cloud TTS if desired
- **Database Integration**: Optional Supabase integration for storing analysis history and statistics
- **Severity Classification**: Color-coded results (green/yellow/red) based on medical urgency
- **Modern UI**: Drag-and-drop image upload with real-time analysis

## How it works

- Frontend: drag-and-drop image upload, required modality selection (X-ray, Blood Test, Prescription), and color-coded results (green/yellow/red). Displays an OCR excerpt for Blood Test/Prescription.
- Backend: Express server with `/analyze` endpoint using Google Gemini 2.5 Pro via @google/generative-ai SDK. For X-ray: image analysis only. For Blood Test/Prescription: OCR + image analysis for comprehensive results.
- Text-to-Speech: `/text-to-speech` endpoint uses Google Cloud Text-to-Speech (REST v1). Provide GOOGLE_TTS_API_KEY and optional voice parameters.
- No caching: both client and server disable caching. The Reset button clears client state.

## Configuration

### Environment Variables

```bash
# Required
GOOGLE_API_KEY=your_google_ai_studio_key_here         # Gemini 2.5 Pro
GEMINI_MODEL_NAME=gemini-2.5-pro

# Text-to-Speech (Google Cloud)
GOOGLE_TTS_API_KEY=your_google_cloud_tts_api_key_here # Cloud TTS REST v1 key
GOOGLE_TTS_LANGUAGE=en-US
GOOGLE_TTS_VOICE=                                      # optional, e.g., en-US-Standard-C or en-US-Neural2-A
GOOGLE_TTS_GENDER=FEMALE                               # MALE|FEMALE|NEUTRAL
GOOGLE_TTS_RATE=1.0                                    # 0.25–4.0
GOOGLE_TTS_PITCH=0.0                                   # -20.0–20.0

# Optional Database
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key

# Server
PORT=3000
```

### TTS Voice Options

PlayAI voices available (use full name with -PlayAI suffix):
- `Jennifer-PlayAI` - Clear female voice (default)
- `Mason-PlayAI` - Professional male voice
- `Ruby-PlayAI` - Warm female voice
- `Angelo-PlayAI` - Expressive male voice
- `Atlas-PlayAI` - Deep male voice
- `Celeste-PlayAI` - Soft female voice
- `Thunder-PlayAI` - Powerful male voice
- `Indigo-PlayAI` - Calm voice

And many more! See https://console.groq.com/docs/speech-text for full list.

## Security notes

- Never expose your API key in client code. Keep it in `.env` and only on the server.
- CORS is enabled for same-origin by default; adjust for your deployment needs.
- API keys are logged with masking for debugging purposes.

## Customization

- Update the analysis prompt in `server.js` to modify output fields and behavior.
- Tweak severity rules or UI colors in `public/styles.css`.
- Change the AI model in the `MODEL_NAME` constant in `server.js`.

## Disclaimer

This tool is for informational purposes only and does not provide medical diagnosis. Always consult qualified healthcare professionals for medical advice.
