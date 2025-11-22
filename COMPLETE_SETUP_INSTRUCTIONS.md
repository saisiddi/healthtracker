# Complete Setup Instructions - Auto Audio Generation

## Current Issue

The app redirects to Groq Console because **PlayAI TTS terms need to be accepted** (one-time requirement).

## What Will Happen After Setup

✅ Click "Listen" button → Audio generates automatically → Plays in webapp  
❌ No redirects  
❌ No manual text entry  
❌ No popups  

**Everything happens automatically in your webapp!**

---

## Step-by-Step Setup (Do This Once)

### Step 1: Accept Terms in Groq Console

1. **Open this link**: https://console.groq.com/playground?model=playai-tts

2. **You'll see the Groq Playground**:
   - On the left: Model selector (should show "playai-tts")
   - In the center: A text input area
   - At the bottom: A prompt to accept terms

3. **Look for one of these:**
   - A banner saying "Accept terms to use this model"
   - A button/checkbox to "Accept PlayAI TTS Terms"
   - A "Terms of Service" agreement popup

4. **Accept the terms**:
   - Click "Accept" or "Agree" or similar button
   - This is a one-time action

5. **Test it works** (optional):
   - Type any text in the playground (e.g., "Hello")
   - Click "Generate" or "Submit"
   - If audio plays, terms are accepted! ✅

### Step 2: Return to Your App

1. **Go back to**: http://localhost:3000
2. **Analyze any medical image** (X-ray, blood test, etc.)
3. **Click the "Listen" button**
4. **Audio will now generate and play automatically!** ✅

---

## What You Should See (After Setup)

### Before Terms Accepted ❌
```
Click "Listen" → Popup appears → Redirects to Groq → Manual text entry required
```

### After Terms Accepted ✅
```
Click "Listen" → "Generating Audio..." → Audio plays in webapp → Done!
```

---

## Troubleshooting

### "I don't see a terms acceptance prompt in Groq Console"

**Possible reasons:**
1. **Already accepted**: If you've used PlayAI TTS before, terms may already be accepted
2. **Different account**: Make sure you're logged into the same Groq account that owns your API key
3. **Different model**: Make sure you're on the `playai-tts` model (check dropdown)

**Solution**: Try generating audio in the Groq Playground. If it works there, it should work in your app!

### "I accepted terms but still getting redirect"

1. **Wait 1-2 minutes**: Sometimes there's a slight delay
2. **Clear browser cache**: Ctrl+Shift+Delete → Clear cache
3. **Refresh the page**: F5 or Ctrl+R
4. **Try again**: Click "Listen" button

### "How do I know if terms are accepted?"

**Test in Groq Playground:**
1. Go to: https://console.groq.com/playground?model=playai-tts
2. Type: "This is a test"
3. Click generate
4. If audio plays → Terms accepted ✅
5. If error → Terms not accepted ❌

---

## Visual Workflow

### Current (Terms NOT Accepted)
```
┌──────────────────────┐
│  Your Webapp         │
│  [Listen Button]     │
└──────────┬───────────┘
           │ Click
           ↓
┌──────────────────────┐
│  Popup Message       │
│  "Setup Required"    │
│  [OK] = Redirect     │
└──────────┬───────────┘
           │ Click OK
           ↓
┌──────────────────────┐
│  Groq Console        │
│  Manual text entry   │
│  (Not what we want!) │
└──────────────────────┘
```

### After Setup (Terms ACCEPTED)
```
┌──────────────────────┐
│  Your Webapp         │
│  [Listen Button]     │
└──────────┬───────────┘
           │ Click
           ↓
┌──────────────────────┐
│  "Generating Audio"  │
│  ⏳ Please wait...   │
└──────────┬───────────┘
           │ (Backend calls Groq API)
           ↓
┌──────────────────────┐
│  🔊 Audio Player     │
│  ▶️ Playing...       │
│  ████████░░░ 80%     │
└──────────────────────┘
           ↓
     ✅ DONE!
```

---

## Quick Test After Setup

Run this test to verify TTS is working:

```bash
# Create a test file
echo "Testing Groq TTS after setup"

# Run test (replace with your actual test)
curl -X POST http://localhost:3000/text-to-speech \
  -H "Content-Type: application/json" \
  -d '{"text":"Medical analysis complete. Please consult your doctor."}' \
  --output test_audio.mp3

# If file created successfully:
# - test_audio.mp3 will be created
# - File size should be > 0 bytes
# - You can play it to verify
```

If the curl command creates a valid MP3 file, your TTS is working! 🎉

---

## Summary

**What you need to do:**
1. ✅ Go to Groq Console: https://console.groq.com/playground?model=playai-tts
2. ✅ Accept PlayAI TTS terms (one-time)
3. ✅ Return to your webapp
4. ✅ Click "Listen" and audio plays automatically!

**What you DON'T need to do:**
- ❌ Enter text manually in Groq Console
- ❌ Restart the server
- ❌ Modify any code
- ❌ Change any settings

**Time required**: Less than 2 minutes

---

**After accepting terms, the webapp will handle everything automatically - no more redirects!** 🎉
