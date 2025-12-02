# Text-to-Speech Setup Guide

## Current Issue

The Groq PlayAI TTS API requires accepting terms before it can be used. This is a one-time setup step required by Groq.

## Error Message

```
The model `playai-tts` requires terms acceptance. 
Please have the org admin accept the terms at 
https://console.groq.com/playground?model=playai-tts
```

## How to Enable TTS (One-Time Setup)

### Step 1: Accept PlayAI TTS Terms

1. **Log in to Groq Console**
   - Go to: https://console.groq.com/
   - Sign in with your Groq account

2. **Access PlayAI TTS Playground**
   - Visit: https://console.groq.com/playground?model=playai-tts
   - OR navigate to: Playground → Select "playai-tts" model

3. **Accept Terms**
   - You should see a prompt to accept the PlayAI TTS terms
   - Click "Accept Terms" or similar button
   - This is a one-time action per organization

4. **Verify**
   - Try generating some speech in the playground
   - If it works, your API is now enabled!

### Step 2: Test in Your Application

After accepting terms:

```bash
# Restart is NOT required - test immediately
node tmp_rovodev_test_audio.js
```

Or simply refresh your browser and click the "Listen" button in the application.

## Alternative: Manual Testing

If you want to test the TTS directly:

```bash
# Create a test file
node -e "
const API_KEY = 'YOUR_GROQ_API_KEY';
fetch('https://api.groq.com/openai/v1/audio/speech', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + API_KEY,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'playai-tts',
    input: 'Hello, this is a test.',
    voice: 'alloy',
    response_format: 'mp3'
  })
}).then(r => r.json()).then(console.log);
"
```

## Frequently Asked Questions

### Q: Do I need to restart the server after accepting terms?
**A:** No! The terms are checked on the Groq side. Once accepted, the API will work immediately.

### Q: Who needs to accept the terms?
**A:** The organization admin for your Groq account needs to accept the terms.

### Q: Are there any costs?
**A:** Check Groq's pricing page for PlayAI TTS costs. It's typically very affordable.

### Q: What voices are available?
**A:** Six voices are supported:
- `alloy` - Neutral and balanced (default)
- `echo` - Clear and expressive
- `fable` - Warm and storytelling
- `onyx` - Deep and authoritative
- `nova` - Bright and energetic
- `shimmer` - Soft and gentle

### Q: Can I use a different TTS provider?
**A:** Yes! You can modify `server.js` to use:
- OpenAI's TTS API
- ElevenLabs (previous implementation)
- Google Cloud Text-to-Speech
- Amazon Polly
- Any other TTS service

## Troubleshooting

### Still getting errors after accepting terms?

1. **Clear your browser cache**
2. **Check API key**: Ensure `GROQ_API_KEY` in `.env` is correct
3. **Verify in Groq Console**: Try the playground to confirm TTS works
4. **Check account status**: Ensure your Groq account is active
5. **Review logs**: Check server logs for detailed error messages

### Terms already accepted but still not working?

- Wait a few minutes for propagation
- Try logging out and back in to Groq Console
- Contact Groq support if issue persists

## Need Help?

- Groq Documentation: https://console.groq.com/docs
- Groq Support: https://console.groq.com/support
- Check server logs for detailed error messages

---

**Next Steps After Setup:**
1. Accept terms in Groq Console
2. Test the TTS feature in the application
3. Customize voice if desired (edit `.env`)
4. Enjoy audio summaries of your medical analyses!
