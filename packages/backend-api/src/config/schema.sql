-- OceanGuard Database Schema
-- This file contains the SQL statements to create the required tables

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

-- Reports table with PostGIS geography column
CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    description TEXT,
    image_url VARCHAR(255),
    location GEOGRAPHY(Point, 4326) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reports_location ON reports USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports (user_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports (created_at);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- Insert some sample data for testing
INSERT INTO users (email, password_hash, role) VALUES 
    ('admin@oceanguard.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'official'),
    ('citizen@oceanguard.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'citizen')
ON CONFLICT (email) DO NOTHING;

-- Insert sample reports (Mumbai, Goa, Chennai locations)
INSERT INTO reports (user_id, event_type, description, location, image_url) VALUES 
    (1, 'High Waves', 'Unusually high waves observed near Gateway of India', ST_GeogFromText('POINT(72.8347 18.9220)'), NULL),
    (2, 'Coastal Flooding', 'Water level rising in low-lying areas', ST_GeogFromText('POINT(73.8278 15.2993)'), NULL),
    (1, 'Unusual Tide', 'Tide levels higher than normal for this time of year', ST_GeogFromText('POINT(80.2707 13.0827)'), NULL)
ON CONFLICT DO NOTHING;

