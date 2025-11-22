# MedInsight - Medical Image Analyzer

Analyze X-rays, blood test reports, and prescriptions using Google Gemini with a simple, attractive web UI.

Important: Never expose your API key in the browser. This project calls Gemini from a secure Node.js server. Put your key in `.env`.

## Quick start

1. Prereqs: Node.js 18+
2. Install deps:

```bash
npm install
```

3. Set your API key:

- Copy `.env.example` to `.env`
- Set `GOOGLE_API_KEY` to your Google AI Studio (Gemini) key
- Optionally set `GEMINI_MODEL` (default `gemini-1.5-pro`) and `PORT`

4. Run the server:

```bash
npm start
```

Then open http://localhost:3000 in your browser.

## How it works

- Frontend: drag-and-drop image upload, required modality selection (X-ray, Blood Test, Prescription), and color-coded results (green/yellow/red). Displays an OCR excerpt for Blood Test/Prescription.
- Backend: Express server with `/analyze` endpoint. For X-ray: image analysis only. For Blood Test/Prescription: OCR + image analysis; OCR is required for readable results.
- No caching: both client and server disable caching. The Reset button also clears client state and calls `/reset` (no-op for now) to allow future server-side clearing.

## Security notes

- Do not place your API key in client code. Keep it in `.env` and only on the server.
- CORS is enabled for same-origin by default; adjust for your deployment needs.

## Customization

- Update the prompt in `server.js` if you want different output fields.
- Tweak severity rules or UI colors in `public/styles.css`.
- Change model via `GEMINI_MODEL` environment variable. Example values: `gemini-1.5-pro`, `gemini-1.5-pro-latest`. If you have access to newer models (e.g., `gemini-2.0-pro` or `gemini-2.5-pro`), set that name in `.env`.

## Disclaimer

This tool is for informational purposes only and does not provide medical diagnosis. Always consult qualified healthcare professionals for medical advice.
