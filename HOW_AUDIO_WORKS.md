# How Audio Generation Works in Your Webapp

## 🎯 The Complete Workflow

### User Experience After Setup

```
1. User uploads medical image → Clicks "Analyze" 
   ↓
2. AI analyzes image → Shows results on screen
   ↓
3. User clicks "Listen" button
   ↓
4. Frontend sends analysis text to backend
   ↓
5. Backend calls Groq TTS API
   ↓
6. Groq generates audio and sends back MP3
   ↓
7. Frontend receives audio blob
   ↓
8. Audio automatically plays in webapp
   ✅ DONE - All automatic, no redirects!
```

## 🔧 Current Status

### Before Accepting Terms
- Click "Listen" → Yellow banner appears in webapp
- Banner shows: "🔧 Audio Setup Required (One-Time)"
- Provides clickable link to Groq Console
- **No automatic redirect** - just a helpful banner

### After Accepting Terms  
- Click "Listen" → "Generating Audio..." message
- Audio generates in backend
- Audio plays automatically in webapp
- Banner disappears forever
- **100% automatic from now on!**

## 📋 One-Time Setup (Takes < 2 Minutes)

1. **Run your analysis** (analyze any medical image)
2. **Click "Listen" button**
3. **See the yellow banner** with setup instructions
4. **Click the link** in the banner to open Groq Console
5. **Accept PlayAI TTS terms** (one checkbox/button click)
6. **Return to webapp** (leave tab open)
7. **Click "Listen" again**
8. **Audio plays!** ✅

## 🎵 What Happens Behind the Scenes

### Frontend (public/app.js)
```javascript
// User clicks "Listen"
Click "Listen" button
  ↓
Check if audio already loaded?
  YES → Play/pause existing audio
  NO → Generate new audio
    ↓
    Send POST to /text-to-speech
    {
      text: "Summary: ... Recommended Actions: ..."
    }
    ↓
    Receive audio blob
    ↓
    Create audio player
    ↓
    Auto-play audio
```

### Backend (server.js)
```javascript
// Receive request
POST /text-to-speech { text: "..." }
  ↓
Call Groq API
  POST https://api.groq.com/openai/v1/audio/speech
  {
    model: "playai-tts",
    input: "text",
    voice: "alloy",
    response_format: "mp3"
  }
  ↓
Receive audio from Groq
  ↓
Send audio to frontend
```

## ✅ What You Get

### Automatic Features
✅ **Text extraction** from analysis  
✅ **Intelligent summarization** (only summary + actions)  
✅ **Automatic API calls** to Groq  
✅ **Audio generation** in MP3 format  
✅ **Auto-play** in webapp  
✅ **Play/pause controls**  
✅ **Progress indicator**  
✅ **Error handling** with helpful messages  

### User-Friendly Features
✅ **No manual text entry** - AI extracts text  
✅ **No redirects** - everything in webapp  
✅ **No downloads** - plays in browser  
✅ **No configuration** - works out of the box  
✅ **Setup banner** - guides through one-time setup  
✅ **Clear status messages** - always know what's happening  

## 🎤 Voice Customization (Optional)

After setup, you can customize the voice:

1. **Edit `.env` file**:
```bash
GROQ_TTS_VOICE=nova  # Change from alloy to nova
```

2. **Restart server**:
```bash
npm start
```

3. **Try different voices**:
- `alloy` - Neutral (default)
- `echo` - Clear and expressive
- `fable` - Warm storytelling
- `onyx` - Deep and authoritative
- `nova` - Bright and energetic
- `shimmer` - Soft and gentle

## 🐛 Troubleshooting

### Issue: Banner keeps appearing
**Cause**: Terms not accepted yet  
**Solution**: Follow the link in banner, accept terms

### Issue: "Generating Audio..." but nothing happens
**Cause**: Network issue or API error  
**Solution**: Check browser console for errors, check internet connection

### Issue: Audio generates but doesn't play
**Cause**: Browser autoplay restrictions  
**Solution**: Click "Listen" button again (manual interaction required)

### Issue: Different voice not working
**Cause**: Need to restart server  
**Solution**: Stop server, restart with `npm start`

## 📊 Technical Details

### Audio Format
- **Format**: MP3 (audio/mpeg)
- **Bitrate**: Optimized by Groq
- **Playback**: HTML5 audio element
- **Browser Support**: All modern browsers

### Text Processing
- **Source**: AI analysis summary + recommended actions
- **Max Length**: ~1500 characters
- **Optimization**: Removes markdown, focuses on key points
- **Fallback**: Uses first sentence if sections not found

### API Calls
- **Endpoint**: `https://api.groq.com/openai/v1/audio/speech`
- **Method**: POST
- **Auth**: Bearer token (from GROQ_API_KEY)
- **Response**: Binary MP3 data

## 🎯 Summary

**Current State**: Ready to use after one-time setup  
**Setup Time**: < 2 minutes  
**User Experience**: 100% automatic after setup  
**No Manual Steps**: Audio generates and plays automatically  
**No Redirects**: Everything happens in your webapp  

---

## Quick Reference

### For Users
1. Click "Listen" after analysis
2. If banner appears, follow link to accept terms (one-time)
3. Click "Listen" again
4. Audio plays automatically ✅

### For Developers
- TTS endpoint: `/text-to-speech`
- Groq API: `https://api.groq.com/openai/v1/audio/speech`
- Model: `playai-tts`
- Voice: configurable via `.env`
- Error handling: User-friendly banners

---

**The audio generation is fully automatic once setup is complete!** 🎉
