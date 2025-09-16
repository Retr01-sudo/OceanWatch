-- OceanGuard Database Schema - Updated Version
-- This file contains the SQL statements to create the required tables with enhanced fields

-- Enable PostGIS extension for geospatial data
CREATE EXTENSION IF NOT EXISTS postgis;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'citizen',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Reports table with enhanced fields
CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    severity_level VARCHAR(50) NOT NULL DEFAULT 'Medium',
    report_language VARCHAR(10) NOT NULL DEFAULT 'English',
    brief_title VARCHAR(255),
    description TEXT,
    image_url VARCHAR(255),
    video_url VARCHAR(255),
    phone_number VARCHAR(20),
    address TEXT,
    location GEOGRAPHY(Point, 4326) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by INTEGER REFERENCES users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reports_location ON reports USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports (user_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports (created_at);
CREATE INDEX IF NOT EXISTS idx_reports_event_type ON reports (event_type);
CREATE INDEX IF NOT EXISTS idx_reports_severity ON reports (severity_level);
CREATE INDEX IF NOT EXISTS idx_reports_verified ON reports (is_verified);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- Insert some sample data for testing
INSERT INTO users (email, password_hash, role) VALUES 
    ('admin@oceanguard.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'official'),
    ('citizen@oceanguard.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'citizen')
ON CONFLICT (email) DO NOTHING;

-- DUMMY REPORTS REMOVED FOR PRODUCTION
-- Sample reports have been disabled to prevent fake data insertion
-- Only real user submissions should create reports in production
-- 
-- To re-enable for development/testing, uncomment the INSERT statement below:
-- INSERT INTO reports (user_id, event_type, severity_level, report_language, brief_title, description, location, image_url, is_verified) VALUES 
--     (1, 'High Waves', 'High', 'English', 'High waves at Gateway of India', 'Unusually high waves observed near Gateway of India. Water levels rising significantly.', ST_GeogFromText('POINT(72.8347 18.9220)'), NULL, true),
--     (2, 'Coastal Flooding', 'Medium', 'English', 'Coastal flooding in Goa', 'Water level rising in low-lying areas of Baga Beach. Several shops affected.', ST_GeogFromText('POINT(73.8278 15.2993)'), NULL, false),
--     (1, 'Unusual Tide', 'Low', 'English', 'Unusual tide patterns in Chennai', 'Tide levels higher than normal for this time of year. Marina Beach affected.', ST_GeogFromText('POINT(80.2707 13.0827)'), NULL, true),
--     (2, 'Storm Surge', 'Critical', 'English', 'Storm surge warning - Visakhapatnam', 'Strong storm surge observed along the coast. Evacuation recommended.', ST_GeogFromText('POINT(83.2185 17.6868)'), NULL, true),
--     (1, 'Coastal Current', 'Medium', 'English', 'Strong coastal currents - Goa', 'Very strong rip currents observed at Baga Beach. Multiple swimmers had to be rescued.', ST_GeogFromText('POINT(73.8278 15.2993)'), NULL, true)
-- ON CONFLICT DO NOTHING;


