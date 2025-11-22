# MedInsight - Medical Image Analyzer

Analyze X-rays, blood test reports, and prescriptions using Groq AI with text-to-speech capabilities powered by Groq's PlayAI TTS.

## Quick start

1. Prereqs: Node.js 18+
2. Install deps:

```bash
npm install
```

3. Set your API key:

- Copy `.env.example` to `.env`
- Set `GROQ_API_KEY` to your Groq API key (get it from https://console.groq.com/)
- Optionally configure TTS settings (voice, model)
- Optionally set Supabase credentials for database features

4. **Important: Enable Text-to-Speech**
   - Go to https://console.groq.com/playground?model=playai-tts
   - Accept the terms for the PlayAI TTS model
   - This is required for the text-to-speech feature to work

5. Run the server:

```bash
npm start
```

Then open http://localhost:3000 in your browser.

## Features

- **Medical Image Analysis**: Analyze X-rays, blood test reports, and prescriptions using Groq's LLama models
- **OCR Integration**: Automatic text extraction from blood tests and prescriptions for detailed analysis
- **Text-to-Speech**: Listen to analysis results using Groq's PlayAI TTS with multiple voice options
- **Database Integration**: Optional Supabase integration for storing analysis history and statistics
- **Severity Classification**: Color-coded results (green/yellow/red) based on medical urgency
- **Modern UI**: Drag-and-drop image upload with real-time analysis

## How it works

- Frontend: drag-and-drop image upload, required modality selection (X-ray, Blood Test, Prescription), and color-coded results (green/yellow/red). Displays an OCR excerpt for Blood Test/Prescription.
- Backend: Express server with `/analyze` endpoint using Groq AI. For X-ray: image analysis only. For Blood Test/Prescription: OCR + image analysis for comprehensive results.
- Text-to-Speech: `/text-to-speech` endpoint using Groq's PlayAI TTS API (requires terms acceptance in Groq console)
- No caching: both client and server disable caching. The Reset button clears client state.

## Configuration

### Environment Variables

```bash
# Required
GROQ_API_KEY=your_groq_api_key_here

# Optional TTS Configuration
GROQ_TTS_VOICE=Jennifer-PlayAI   # See README for full voice list
GROQ_TTS_MODEL=playai-tts        # Options: playai-tts, playai-tts-arabic

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
