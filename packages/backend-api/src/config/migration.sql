-- Migration script to add new columns to existing reports table

-- Add new columns to reports table
ALTER TABLE reports 
ADD COLUMN IF NOT EXISTS severity_level VARCHAR(50) DEFAULT 'Medium',
ADD COLUMN IF NOT EXISTS report_language VARCHAR(10) DEFAULT 'English',
ADD COLUMN IF NOT EXISTS brief_title VARCHAR(255),
ADD COLUMN IF NOT EXISTS video_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS verified_by INTEGER REFERENCES users(id),
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Create new indexes
CREATE INDEX IF NOT EXISTS idx_reports_event_type ON reports (event_type);
CREATE INDEX IF NOT EXISTS idx_reports_severity ON reports (severity_level);
CREATE INDEX IF NOT EXISTS idx_reports_verified ON reports (is_verified);

-- Update existing records with default values
UPDATE reports SET 
    severity_level = CASE 
        WHEN event_type = 'High Waves' THEN 'High'
        WHEN event_type = 'Coastal Flooding' THEN 'Medium'
        ELSE 'Low'
    END,
    brief_title = CASE 
        WHEN event_type = 'High Waves' THEN 'High waves observed'
        WHEN event_type = 'Coastal Flooding' THEN 'Coastal flooding reported'
        WHEN event_type = 'Unusual Tide' THEN 'Unusual tide patterns'
        ELSE event_type
    END,
    is_verified = CASE 
        WHEN user_id = 1 THEN true  -- Admin reports are verified
        ELSE false
    END
WHERE severity_level IS NULL OR brief_title IS NULL;


