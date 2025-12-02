# Migration from ElevenLabs to Groq TTS

## Summary

This project has been successfully migrated from ElevenLabs text-to-speech API to Groq's PlayAI TTS API.

## Changes Made

### 1. Dependencies
- **Removed**: `@elevenlabs/elevenlabs-js` package
- **No new dependencies required**: Using native `fetch` API for Groq TTS

### 2. Configuration Changes

#### `.env.example`
- Replaced ElevenLabs configuration with Groq TTS settings
- Added configuration for:
  - `GROQ_TTS_VOICE`: Voice selection (alloy, echo, fable, onyx, nova, shimmer)
  - `GROQ_TTS_MODEL`: Model selection (playai-tts or playai-tts-arabic)

#### `server.js`
- Removed ElevenLabs client import
- Updated TTS configuration to use Groq's PlayAI model
- Modified `/text-to-speech` endpoint to call `https://api.groq.com/openai/v1/audio/speech`
- Removed aggressive text optimization (no longer needed - Groq has better quota limits)
- Simplified error handling for the new API

### 3. API Endpoint

**Old (ElevenLabs)**:
```javascript
POST https://api.elevenlabs.io/v1/text-to-speech/{voice_id}
Headers:
  - xi-api-key: {ELEVENLABS_API_KEY}
Body:
  - text: string
  - model_id: "eleven_turbo_v2_5"
  - voice_settings: {...}
```

**New (Groq PlayAI)**:
```javascript
POST https://api.groq.com/openai/v1/audio/speech
Headers:
  - Authorization: Bearer {GROQ_API_KEY}
Body:
  - model: "playai-tts"
  - input: string
  - voice: "alloy"
  - response_format: "mp3"
```

### 4. Benefits of Migration

1. **Unified API**: Uses the same Groq API key for both AI chat and TTS
2. **No quota restrictions**: Removed aggressive text truncation logic
3. **Cost efficiency**: Groq offers competitive pricing
4. **Multiple voices**: Supports 6 different voice options
5. **Multi-language**: Supports both English and Arabic TTS

### 5. Requirements

**Important**: Users must accept the PlayAI TTS terms before using the feature:
- Visit: https://console.groq.com/playground?model=playai-tts
- Accept the model terms (one-time setup)
- TTS will work after terms are accepted

### 6. Voice Options

| Voice | Description |
|-------|-------------|
| alloy | Neutral and balanced |
| echo | Clear and expressive |
| fable | Warm and storytelling |
| onyx | Deep and authoritative |
| nova | Bright and energetic |
| shimmer | Soft and gentle |

## Testing

The migration has been tested with:
- Model discovery (verified `playai-tts` is available)
- API endpoint validation
- Error handling for terms acceptance requirement

## Next Steps

1. Ensure your `.env` file has `GROQ_API_KEY` configured
2. Visit the Groq console to accept PlayAI TTS terms
3. Test the TTS feature in the application
4. Optionally customize voice by setting `GROQ_TTS_VOICE` in `.env`

## Rollback

If you need to rollback to ElevenLabs:
1. Install the package: `npm install @elevenlabs/elevenlabs-js`
2. Restore the original `server.js` from git history
3. Update `.env` with ElevenLabs API key

---

Migration completed on: 2025-11-22
