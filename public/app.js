// Hero section
const heroSection = document.getElementById('heroSection');
const getStartedBtn = document.getElementById('getStartedBtn');
const featuresSection = document.getElementById('featuresSection');
const ctaStartBtn = document.getElementById('ctaStartBtn');

// Footers
const landingFooter = document.getElementById('landingFooter');
const workflowFooter = document.getElementById('workflowFooter');

// Main container
const mainContainer = document.querySelector('.container');

// Upload section
const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('fileInput');
const preview = document.getElementById('preview');
const previewImg = document.getElementById('previewImg');
const analyzeBtn = document.getElementById('analyzeBtn');
const resetBtn = document.getElementById('resetBtn');
const changeImageBtn = document.getElementById('changeImageBtn');
const modalitySelect = document.getElementById('modality');
const statusEl = document.getElementById('status');
const loadingAnimation = document.getElementById('loadingAnimation');
const uploadSection = document.getElementById('uploadSection');
const newAnalysisBtn = document.getElementById('newAnalysisBtn');

// Result section
const resultSection = document.getElementById('resultSection');
const severityDot = document.getElementById('severityDot');
const severityLabel = document.getElementById('severityLabel');
const modalityLabel = document.getElementById('modalityLabel');
const summaryText = document.getElementById('summaryText');
const detailsList = document.getElementById('detailsList');
const actionsList = document.getElementById('actionsList');
const disclaimerText = document.getElementById('disclaimerText');
const ocrSection = document.getElementById('ocrSection');
const ocrText = document.getElementById('ocrText');
const copyOcrBtn = document.getElementById('copyOcrBtn');
const notesSection = document.getElementById('notesSection');
const notesContent = document.getElementById('notesContent');

// Audio elements
const listenBtn = document.getElementById('listenBtn');
const listenText = document.getElementById('listenText');
const audioPlayerContainer = document.getElementById('audioPlayerContainer');
const audioPlayer = document.getElementById('audioPlayer');

// Stats elements
const confidenceValue = document.getElementById('confidenceValue');
const analysisTime = document.getElementById('analysisTime');
const itemsCount = document.getElementById('itemsCount');

let currentImage = null; // { base64, mimeType }
let analysisStartTime = null;
let isInWorkflow = false;
let currentAnalysisText = ''; // Store the full analysis text for TTS

function showWorkflow() {
  isInWorkflow = true;
  heroSection.classList.add('hidden');
  featuresSection.classList.add('hidden');
  landingFooter.classList.add('hidden');
  mainContainer.classList.add('active');
  workflowFooter.classList.remove('hidden');

  // Scroll to top smoothly
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showHero() {
  isInWorkflow = false;
  heroSection.classList.remove('hidden');
  featuresSection.classList.remove('hidden');
  landingFooter.classList.remove('hidden');
  mainContainer.classList.remove('active');
  workflowFooter.classList.add('hidden');

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function clearUIState() {
  // Clear in-memory state
  currentImage = null;
  analysisStartTime = null;
  currentAnalysisText = '';

  // Expand upload section
  uploadSection.classList.remove('collapsed');

  // Clear results with animation
  resultSection.classList.add('hidden');
  summaryText.textContent = '—';
  detailsList.innerHTML = '';
  actionsList.innerHTML = '';
  disclaimerText.textContent = 'This is an AI-generated analysis and not a medical diagnosis. Always consult a qualified healthcare professional for medical advice.';
  severityDot.classList.remove('sev-green', 'sev-yellow', 'sev-red');
  severityLabel.textContent = '—';
  modalityLabel.textContent = '—';

  // Clear stats
  confidenceValue.textContent = '—';
  analysisTime.textContent = '—';
  itemsCount.textContent = '—';

  // Clear notes
  notesSection.classList.add('hidden');
  notesContent.innerHTML = '';

  // Clear audio
  audioPlayerContainer.classList.add('hidden');
  audioPlayer.pause();
  audioPlayer.src = '';
  listenBtn.classList.remove('playing');
  listenText.textContent = 'Listen';
  listenBtn.disabled = false;

  // Clear preview
  preview.classList.add('hidden');
  previewImg.src = '';

  // Clear status and loading
  statusEl.textContent = '';
  loadingAnimation.classList.add('hidden');

  // Reset modality
  modalitySelect.value = '';
}

function setStatus(msg, isError = false) {
  statusEl.textContent = msg || '';
  if (isError) {
    statusEl.style.color = '#dc2626';
  } else {
    statusEl.style.color = '';
  }
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function setSeverity(sev) {
  severityDot.classList.remove('sev-green', 'sev-yellow', 'sev-red');
  if (sev === 'green') severityDot.classList.add('sev-green');
  else if (sev === 'yellow') severityDot.classList.add('sev-yellow');
  else if (sev === 'red') severityDot.classList.add('sev-red');
  severityLabel.textContent = sev ? sev.toUpperCase() : '—';
}

// COMPLETELY REWRITTEN - Generate speech function
async function generateSpeech(analysisText) {
  if (!analysisText || analysisText.trim() === '') {
    console.error('No analysis text available for speech generation');
    setStatus('No content available for audio', true);
    return;
  }

  try {
    // Extract ONLY Summary and Recommended Actions for TTS
    console.log('🎯 Extracting summary and recommendations for TTS...');
    
    let textForTTS = '';
    
    // Extract Summary section (look for different patterns)
    const summaryMatch = analysisText.match(/(?:Executive Summary|Summary)[:\s]*([^\.]+\.)/i);
    if (summaryMatch) {
      textForTTS += 'Summary: ' + summaryMatch[1].trim() + '. ';
    }
    
    // Extract Recommended Actions section
    const actionsMatch = analysisText.match(/Recommended Actions[:\s]*([^\.]+(?:\.[^\.]*)*\.)/i);
    if (actionsMatch) {
      textForTTS += 'Recommended Actions: ' + actionsMatch[1].trim();
    }
    
    // Fallback if sections not found - use first sentence only
    if (!textForTTS.trim()) {
      const sentences = analysisText.replace(/\*\*/g, '').split(/[.!?]+/);
      textForTTS = sentences[0]?.trim() + '.' || 'Analysis complete.';
    }
    
    // Aggressive limit to 200 characters maximum for quota protection
    if (textForTTS.length > 200) {
      textForTTS = textForTTS.substring(0, 197) + '...';
    }
    
    console.log(`📝 TTS Text (${textForTTS.length} chars):`, textForTTS);

    // Update button state
    listenBtn.disabled = true;
    listenBtn.classList.add('loading');
    listenText.textContent = 'Generating Audio...';
    setStatus('🎤 Converting summary to speech...');

    const response = await fetch('/text-to-speech', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: textForTTS })
    });

    console.log('TTS Response status:', response.status);
    setStatus('📥 Receiving generated audio...');

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const audioBlob = await response.blob();
    console.log('✅ Audio blob received:', audioBlob.size, 'bytes, type:', audioBlob.type);

    if (audioBlob.size === 0) {
      throw new Error('Received empty audio file');
    }

    // PROPER AUDIO SETUP - CLEAR AND DIRECT PLAYBACK
    console.log('🎵 Setting up audio for immediate playback...');
    setStatus('🎵 Preparing audio playback...');
    
    const audioUrl = URL.createObjectURL(audioBlob);
    
    // Completely reset audio element
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
    audioPlayer.src = '';
    audioPlayer.removeAttribute('src');
    audioPlayer.load();
    
    // Set new audio source
    audioPlayer.src = audioUrl;
    audioPlayer.load();
    audioPlayerContainer.classList.remove('hidden');
    
    // Setup ONE-TIME event listener for immediate playback
    const playWhenReady = async () => {
      console.log('✅ Audio completely loaded and ready');
      try {
        setStatus('🔊 Playing audio summary...');
        await audioPlayer.play();
        
        listenBtn.classList.add('playing');
        listenText.textContent = 'Playing...';
        listenBtn.disabled = false;
        
        console.log('✅ Audio playing successfully!');
      } catch (playError) {
        console.log('⚠️ Auto-play blocked - user interaction required');
        listenBtn.disabled = false;
        listenBtn.classList.remove('playing');
        listenText.textContent = 'Click to Play';
        setStatus('Audio ready - click Listen button to play');
      }
      // Remove the event listener after use
      audioPlayer.removeEventListener('canplaythrough', playWhenReady);
    };
    
    audioPlayer.addEventListener('canplaythrough', playWhenReady);
    
    // Enhanced event handlers for audio playback
    audioPlayer.onended = () => {
      console.log('✅ Audio playback ended');
      listenBtn.classList.remove('playing');
      listenText.textContent = 'Listen Again';
      listenBtn.disabled = false;
      setStatus('Audio completed');
    };

    audioPlayer.onplay = () => {
      console.log('▶️ Audio started playing');
      listenBtn.classList.add('playing');
      listenText.textContent = 'Playing...';
    };

    audioPlayer.onpause = () => {
      console.log('⏸️ Audio paused');
      if (!audioPlayer.ended) {
        listenBtn.classList.remove('playing');
        listenText.textContent = 'Continue';
      }
    };
    
    // Error handling
    audioPlayer.onerror = (e) => {
      console.error('Audio loading error:', e);
      setStatus('Audio playback error', true);
      listenBtn.disabled = false;
      listenBtn.classList.remove('loading', 'playing');
      listenText.textContent = 'Try Again';
      audioPlayer.removeEventListener('canplaythrough', playWhenReady);
    };

  } catch (error) {
    console.error('Speech generation error:', error);
    setStatus('❌ Audio generation failed: ' + error.message, true);
    listenBtn.disabled = false;
    listenBtn.classList.remove('loading', 'playing');
    listenText.textContent = 'Try Again';
  }
}

function populateResults(data) {
  // Collapse upload section with smooth animation
  setTimeout(() => {
    uploadSection.classList.add('collapsed');
  }, 200);

  // Show results after a slight delay
  setTimeout(() => {
    resultSection.classList.remove('hidden');
    // Smooth scroll to results - centered view
    setTimeout(() => {
      resultSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }, 500);

  setSeverity(data.severity);

  // Build a concise TTS script using only Executive Summary and Recommended Actions
  let ttsText = '';
  if (data.summary) {
    ttsText += `Executive Summary: ${data.summary}. `;
  }
  const actions = Array.isArray(data.recommended_actions) ? data.recommended_actions : [];
  if (actions.length > 0) {
    ttsText += 'Recommended Actions: ';
    actions.forEach((a, i) => {
      ttsText += `${i + 1}. ${a}. `;
    });
  } else {
    ttsText += 'Recommended Actions: Consult your healthcare provider for personalized next steps.';
  }

  // Cap TTS text to be comfortably within API limits
  if (ttsText.length > 1500) {
    ttsText = ttsText.slice(0, 1500) + '...';
  }

  currentAnalysisText = ttsText.trim();

  // Store analysis but DO NOT generate audio automatically
  console.log('Analysis complete. Audio will generate ONLY when user clicks Listen button.');

  // Format modality nicely
  const modalityMap = {
    'xray': 'X-ray Scan',
    'blood_test': 'Blood Test Report',
    'prescription': 'Prescription',
    'other': 'Other'
  };
  modalityLabel.textContent = modalityMap[data.modality] || data.modality || '—';

  // Calculate stats
  const endTime = Date.now();
  const duration = analysisStartTime ? ((endTime - analysisStartTime) / 1000).toFixed(1) : '—';
  analysisTime.textContent = duration !== '—' ? `${duration}s` : '—';

  // Set confidence (mock for now, can be enhanced)
  confidenceValue.textContent = 'High';

  // Count items
  const totalItems = (data.details || []).length;
  itemsCount.textContent = totalItems;

  // Summary
  summaryText.textContent = data.summary || 'No summary available. Please consult with a healthcare professional for detailed interpretation.';

  // Details
  detailsList.innerHTML = '';
  if (data.details && data.details.length > 0) {
    data.details.forEach((d, idx) => {
      const li = document.createElement('li');
      li.textContent = d;
      li.style.animationDelay = `${idx * 0.1}s`;
      detailsList.appendChild(li);
    });
  } else {
    const li = document.createElement('li');
    li.textContent = 'No specific findings detected. This could indicate normal results or require further review by a medical professional.';
    detailsList.appendChild(li);
  }

  // Actions
  actionsList.innerHTML = '';
  if (data.recommended_actions && data.recommended_actions.length > 0) {
    data.recommended_actions.forEach((a, idx) => {
      const li = document.createElement('li');
      li.textContent = a;
      li.style.animationDelay = `${idx * 0.1}s`;
      actionsList.appendChild(li);
    });
  } else {
    const li = document.createElement('li');
    li.textContent = 'Consult with your healthcare provider to discuss these results and determine appropriate next steps.';
    actionsList.appendChild(li);
  }

  // Add important notes if severity is yellow or red
  if (data.severity === 'yellow' || data.severity === 'red') {
    notesSection.classList.remove('hidden');
    notesContent.innerHTML = `
      <p><strong>⚠️ Attention Required:</strong> This analysis has identified findings that may need medical attention. Please consult with a qualified healthcare professional as soon as possible to discuss these results.</p>
      <p style="margin-top: 12px;"><strong>Important:</strong> Do not delay seeking professional medical advice based on this AI analysis.</p>
    `;
  } else {
    notesSection.classList.add('hidden');
  }

  // Disclaimer
  disclaimerText.textContent = data.disclaimer || disclaimerText.textContent;

  // OCR surface
  if (data.ocr_has_text && data.ocr_excerpt) {
    ocrSection.classList.remove('hidden');
    ocrText.textContent = data.ocr_excerpt;
  } else {
    ocrSection.classList.add('hidden');
    ocrText.textContent = '';
  }
}

function attachDropzone() {
  function openFilePicker() { fileInput.click(); }

  dropzone.addEventListener('click', openFilePicker);

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('dragover');
  });

  dropzone.addEventListener('drop', async (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');

    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (!(file.type.startsWith('image/') || file.type === 'application/pdf')) {
      setStatus('Please upload an image or PDF file.');
      return;
    }
    const dataUrl = await readFileAsDataURL(file);
    currentImage = { base64: dataUrl, mimeType: file.type, name: file.name };
    if (file.type === 'application/pdf') {
      previewImg.src = '';
      previewImg.alt = '';
      setStatus(`PDF selected: ${file.name}. The first page's text will be analyzed.`);
    } else {
      previewImg.src = dataUrl;
      setStatus('Ready to analyze.');
    }
    preview.classList.remove('hidden');
    resultSection.classList.add('hidden');
  });

  fileInput.addEventListener('change', async () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    if (!(file.type.startsWith('image/') || file.type === 'application/pdf')) {
      setStatus('Please upload an image or PDF file.');
      return;
    }
    const dataUrl = await readFileAsDataURL(file);
    currentImage = { base64: dataUrl, mimeType: file.type, name: file.name };
    if (file.type === 'application/pdf') {
      previewImg.src = '';
      previewImg.alt = '';
      setStatus(`PDF selected: ${file.name}. The first page's text will be analyzed.`);
    } else {
      previewImg.src = dataUrl;
      setStatus('Ready to analyze.');
    }
    preview.classList.remove('hidden');
    resultSection.classList.add('hidden');
  });
}

async function callAnalyze() {
  if (!currentImage) {
    setStatus('Please upload an image first.');
    return;
  }

  try {
    // Validate input
    if (!modalitySelect.value) {
      setStatus('Please select the image type (X-ray, Blood Test, or Prescription).');
      return;
    }

    // Start timing
    analysisStartTime = Date.now();

    // Show loading state with animation
    setStatus('');
    loadingAnimation.classList.remove('hidden');
    analyzeBtn.disabled = true;
    resetBtn.disabled = true;

    // Log request details
    console.log('Starting analysis with modality:', modalitySelect.value);
    console.log('Image info:', {
      type: currentImage.mimeType,
      size: (currentImage.base64.length * 3 / 4).toLocaleString() + ' bytes (base64)',
      dimensions: currentImage.width + 'x' + currentImage.height
    });

    // Clear any server-side state
    try {
      await fetch('/reset', {
        method: 'POST',
        headers: { 'Cache-Control': 'no-store' }
      });
    } catch (resetError) {
      console.warn('Could not reset server state:', resetError);
    }

    setStatus('Analyzing…');

    // Prepare request
    const body = {
      imageBase64: currentImage.base64,
      mimeType: currentImage.mimeType,
      modality: modalitySelect.value,
    };

    const startTime = Date.now();
    const url = `/analyze?ts=${startTime}`;

    console.log('Sending request to server...');
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      body: JSON.stringify(body),
    });

    const responseTime = Date.now() - startTime;
    console.log(`Server responded in ${responseTime}ms with status:`, res.status);

    // Handle non-OK responses
    if (!res.ok) {
      let errorMessage = `Server error: ${res.status} ${res.statusText}`;
      let errorDetail = '';

      // Try to get error details from response
      try {
        const errorData = await res.json().catch(() => ({}));
        console.error('Error response from server:', errorData);
        errorMessage = errorData.error || errorMessage;
        errorDetail = errorData.detail || '';
      } catch (e) {
        console.error('Could not parse error response:', e);
      }

      setStatus(`Error: ${errorMessage}${errorDetail ? ' - ' + errorDetail : ''}`);
      analyzeBtn.disabled = false;
      return;
    }

    // Process successful response
    try {
      const data = await res.json();
      console.log('Analysis successful, received data:', data);
      loadingAnimation.classList.add('hidden');
      populateResults(data);
      setStatus('✅ Analysis complete!');
    } catch (parseError) {
      console.error('Failed to parse server response:', parseError);
      loadingAnimation.classList.add('hidden');
      setStatus('Error: Could not understand the server response. The server may be experiencing issues.');
    }

  } catch (e) {
    loadingAnimation.classList.add('hidden');
    console.error('Analysis failed:', e);

    // Enhanced error handling
    let errorMessage = 'An unexpected error occurred';

    if (e.name === 'TypeError' && e.message.includes('Failed to fetch')) {
      errorMessage = 'Could not connect to the server. Please check your internet connection.';
    } else if (e.name === 'SyntaxError' && e.message.includes('JSON')) {
      errorMessage = 'Received invalid data from server. Please try again.';
    } else if (e.message) {
      // Try to extract meaningful error from message
      const match = String(e.message).match(/\{[\s\S]*\}/);
      if (match) {
        try {
          const parsed = JSON.parse(match[0]);
          errorMessage = parsed.error || parsed.message || errorMessage;
          if (parsed.detail) errorMessage += ' - ' + parsed.detail;
        } catch (parseError) {
          console.warn('Could not parse error message:', parseError);
          errorMessage = e.message;
        }
      } else {
        errorMessage = e.message;
      }
    }

    setStatus(`❌ Error: ${errorMessage}`);

  } finally {
    analyzeBtn.disabled = false;
    resetBtn.disabled = false;
    loadingAnimation.classList.add('hidden');
  }
}

async function callReset() {
  try {
    await fetch('/reset', { method: 'POST', headers: { 'Cache-Control': 'no-store' } });
  } catch (_) { }
  clearUIState();
}

async function showVersion() {
  try {
    const r = await fetch('/version', { cache: 'no-store' });
    const j = await r.json();
    console.log('Server version:', j);
    setStatus(`Ready. Server: ${j.version} (port ${j.port})`);
  } catch { }
}

function main() {
  clearUIState();
  attachDropzone();

  // Get Started button - transition from hero to workflow
  if (getStartedBtn) {
    getStartedBtn.addEventListener('click', () => {
      showWorkflow();
    });
  }

  // CTA Start button in features section
  if (ctaStartBtn) {
    ctaStartBtn.addEventListener('click', () => {
      showWorkflow();
    });
  }

  // Topbar navigation buttons
  const navConsultBtn = document.getElementById('navConsultBtn');
  const navContactBtn = document.getElementById('navContactBtn');
  const navAboutBtn = document.getElementById('navAboutBtn');

  if (navConsultBtn) {
    navConsultBtn.addEventListener('click', () => {
      // For now, open default mail client
      window.location.href = 'mailto:consult@medinsight.ai?subject=Consultation%20Request';
    });
  }
  if (navContactBtn) {
    navContactBtn.addEventListener('click', () => {
      document.getElementById('landingFooter').scrollIntoView({ behavior: 'smooth' });
    });
  }
  if (navAboutBtn) {
    navAboutBtn.addEventListener('click', () => {
      document.getElementById('featuresSection').scrollIntoView({ behavior: 'smooth' });
    });
  }

  // Analyze button
  analyzeBtn.addEventListener('click', callAnalyze);

  // Reset button
  resetBtn.addEventListener('click', () => {
    callReset();
    // Don't return to hero, just reset the workflow
    uploadSection.classList.remove('collapsed');
  });

  // New analysis button - returns to hero
  if (newAnalysisBtn) {
    newAnalysisBtn.addEventListener('click', () => {
      clearUIState();
      showHero();
    });
  }

  // Change image button (opens file picker)
  if (changeImageBtn) {
    changeImageBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      fileInput.click();
    });
  }

  // Listen button - COMPLETELY FIXED VERSION WITH AGGRESSIVE DEBUGGING
  if (listenBtn) {
    listenBtn.addEventListener('click', async () => {
      console.log('🎵 ============ LISTEN BUTTON CLICKED ============');
      console.log('📊 Current state:', {
        hasAudioSrc: !!audioPlayer.src,
        audioSrc: audioPlayer.src,
        isPaused: audioPlayer.paused,
        hasAnalysisText: !!currentAnalysisText,
        analysisTextLength: currentAnalysisText?.length || 0
      });
      
      // If audio is already loaded, just play/pause it
      if (audioPlayer.src && audioPlayer.src.startsWith('blob:')) {
        console.log('🔄 Existing audio found, toggling playback');
        try {
          if (audioPlayer.paused) {
            console.log('▶️ Playing existing audio');
            await audioPlayer.play();
            listenBtn.classList.add('playing');
            listenText.textContent = 'Playing...';
            console.log('✅ Playback started successfully');
          } else {
            console.log('⏸️ Pausing audio');
            audioPlayer.pause();
            listenBtn.classList.remove('playing');
            listenText.textContent = 'Continue';
          }
        } catch (error) {
          console.error('❌ Play/pause error:', error);
          listenText.textContent = 'Error - Try Again';
        }
      } else if (currentAnalysisText) {
        // Generate new audio
        console.log('🎤 No existing audio, generating new speech');
        console.log('📝 Analysis text preview:', currentAnalysisText.substring(0, 100) + '...');
        await generateSpeech(currentAnalysisText);
        console.log('🏁 generateSpeech() completed');
      } else {
        console.warn('⚠️ No analysis text available');
        listenText.textContent = 'No Content';
      }
      console.log('🎵 ============ LISTEN BUTTON HANDLER DONE ============');
    });
  }

  // Copy OCR button
  if (copyOcrBtn) {
    copyOcrBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(ocrText.textContent);
        const originalText = copyOcrBtn.innerHTML;
        copyOcrBtn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Copied!
        `;
        setTimeout(() => {
          copyOcrBtn.innerHTML = originalText;
        }, 2000);
      } catch (err) {
        console.error('Failed to copy text:', err);
      }
    });
  }

  // Add smooth animations on modality select
  modalitySelect.addEventListener('change', () => {
    if (modalitySelect.value) {
      modalitySelect.style.transform = 'scale(1.02)';
      setTimeout(() => {
        modalitySelect.style.transform = 'scale(1)';
      }, 200);
    }
  });

  // Add enter key support for analyze button
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && isInWorkflow && currentImage && modalitySelect.value && !analyzeBtn.disabled) {
      callAnalyze();
    }
  });

  showVersion();
}

window.addEventListener('DOMContentLoaded', main);
