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

// Stats elements
const confidenceValue = document.getElementById('confidenceValue');
const analysisTime = document.getElementById('analysisTime');
const itemsCount = document.getElementById('itemsCount');

let currentImage = null; // { base64, mimeType }
let analysisStartTime = null;
let isInWorkflow = false;

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
  
  // Clear preview
  preview.classList.add('hidden');
  previewImg.src = '';
  
  // Clear status and loading
  statusEl.textContent = '';
  loadingAnimation.classList.add('hidden');
  
  // Reset modality
  modalitySelect.value = '';
}

function setStatus(msg) {
  statusEl.textContent = msg || '';
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
      size: (currentImage.base64.length * 3/4).toLocaleString() + ' bytes (base64)',
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
  } catch (_) {}
  clearUIState();
}

async function showVersion() {
  try {
    const r = await fetch('/version', { cache: 'no-store' });
    const j = await r.json();
    console.log('Server version:', j);
    setStatus(`Ready. Server: ${j.version} (port ${j.port})`);
  } catch {}
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
