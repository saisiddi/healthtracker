-- MedInsight AI Database Schema
-- Run this in Supabase SQL Editor to create the analyses table

-- Create analyses table
CREATE TABLE IF NOT EXISTS analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  modality TEXT NOT NULL CHECK (modality IN ('xray', 'blood_test', 'prescription', 'other')),
  severity TEXT NOT NULL CHECK (severity IN ('green', 'yellow', 'red')),
  summary TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '[]',
  recommended_actions JSONB NOT NULL DEFAULT '[]',
  ocr_has_text BOOLEAN DEFAULT false,
  ocr_excerpt TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analyses_modality ON analyses(modality);
CREATE INDEX IF NOT EXISTS idx_analyses_severity ON analyses(severity);

-- Enable Row Level Security (RLS)
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (you can customize this based on your auth needs)
CREATE POLICY "Allow all operations on analyses" ON analyses
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Optional: Create a view for statistics
CREATE OR REPLACE VIEW analysis_stats AS
SELECT
  COUNT(*) as total_analyses,
  COUNT(CASE WHEN modality = 'xray' THEN 1 END) as xray_count,
  COUNT(CASE WHEN modality = 'blood_test' THEN 1 END) as blood_test_count,
  COUNT(CASE WHEN modality = 'prescription' THEN 1 END) as prescription_count,
  COUNT(CASE WHEN severity = 'green' THEN 1 END) as green_severity_count,
  COUNT(CASE WHEN severity = 'yellow' THEN 1 END) as yellow_severity_count,
  COUNT(CASE WHEN severity = 'red' THEN 1 END) as red_severity_count,
  DATE_TRUNC('day', created_at) as analysis_date
FROM analyses
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY analysis_date DESC;

-- Grant permissions on the view
GRANT SELECT ON analysis_stats TO anon, authenticated;

COMMENT ON TABLE analyses IS 'Stores medical image analysis results';
COMMENT ON COLUMN analyses.modality IS 'Type of medical image: xray, blood_test, prescription, or other';
COMMENT ON COLUMN analyses.severity IS 'Severity level: green (normal), yellow (monitor), red (urgent)';
COMMENT ON COLUMN analyses.details IS 'Array of detailed findings from the analysis';
COMMENT ON COLUMN analyses.recommended_actions IS 'Array of recommended next steps';
