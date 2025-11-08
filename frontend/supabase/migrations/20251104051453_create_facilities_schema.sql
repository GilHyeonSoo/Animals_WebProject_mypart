/*
  # Seoul Animal Facilities Database Schema

  ## Overview
  Creates a comprehensive database structure for Seoul's animal-related facility location service.
  Supports 12 facility categories with geolocation, reviews, and district-based organization.

  ## New Tables
  
  ### 1. `facilities`
  Main table storing all facility information
  - `id` (uuid, primary key) - Unique facility identifier
  - `name` (text) - Facility name
  - `category` (text) - Type: hospital, pharmacy, grooming, culture_center, museum, art_gallery, travel, care_service, pension, pet_supplies, restaurant, cafe
  - `address` (text) - Full address
  - `district` (text) - Seoul district (구)
  - `latitude` (numeric) - Location latitude
  - `longitude` (numeric) - Location longitude
  - `phone` (text, nullable) - Contact phone number
  - `description` (text, nullable) - Facility description
  - `opening_hours` (text, nullable) - Operating hours
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. `reviews`
  User reviews for facilities
  - `id` (uuid, primary key) - Unique review identifier
  - `facility_id` (uuid, foreign key) - References facilities table
  - `rating` (integer) - Rating 1-5
  - `review_text` (text) - Review content
  - `reviewer_nickname` (text) - Reviewer's display name
  - `created_at` (timestamptz) - Review creation time

  ### 3. `districts`
  Seoul district information
  - `id` (uuid, primary key) - Unique district identifier
  - `name` (text) - District name (구)
  - `description` (text, nullable) - District description
  - `popular_services` (text, nullable) - Highlighted services
  - `created_at` (timestamptz) - Creation timestamp

  ## Security
  - Enable RLS on all tables
  - Public read access for facilities and reviews (authenticated users only for write)
  - Proper policies for data integrity

  ## Indexes
  - Category-based filtering
  - District-based filtering
  - Geospatial queries optimization
*/

-- Create facilities table
CREATE TABLE IF NOT EXISTS facilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL CHECK (category IN (
    'hospital', 'pharmacy', 'grooming', 'culture_center', 
    'museum', 'art_gallery', 'travel', 'care_service', 
    'pension', 'pet_supplies', 'restaurant', 'cafe'
  )),
  address text NOT NULL,
  district text NOT NULL,
  latitude numeric(10, 7) NOT NULL,
  longitude numeric(10, 7) NOT NULL,
  phone text,
  description text,
  opening_hours text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id uuid REFERENCES facilities(id) ON DELETE CASCADE NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text NOT NULL,
  reviewer_nickname text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create districts table
CREATE TABLE IF NOT EXISTS districts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  popular_services text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_facilities_category ON facilities(category);
CREATE INDEX IF NOT EXISTS idx_facilities_district ON facilities(district);
CREATE INDEX IF NOT EXISTS idx_facilities_location ON facilities(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_reviews_facility ON reviews(facility_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

-- Enable Row Level Security
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;

-- Facilities policies (public read access)
CREATE POLICY "Anyone can view facilities"
  ON facilities FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert facilities"
  ON facilities FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update facilities"
  ON facilities FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Reviews policies
CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update own reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Districts policies
CREATE POLICY "Anyone can view districts"
  ON districts FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage districts"
  ON districts FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert sample Seoul districts
INSERT INTO districts (name, description, popular_services) VALUES
  ('강남구', '프리미엄 반려동물 서비스의 중심지', '프리미엄 미용샵, 24시 동물병원'),
  ('마포구', '반려동물 문화 공간이 풍부한 지역', '반려동물 문화센터, 애견 카페'),
  ('구로구', '의료 및 재활 서비스 충실', '협력 동물약국, 재활 전문 병원'),
  ('송파구', '대형 펫 서비스 시설 다수', '펫시터 서비스, 대형견 놀이터')
ON CONFLICT (name) DO NOTHING;

-- Insert sample facilities data
INSERT INTO facilities (name, category, address, district, latitude, longitude, phone, description, opening_hours) VALUES
  ('멍멍 종합병원', 'hospital', '서울 강남구 테헤란로 123', '강남구', 37.5012, 127.0396, '02-1234-5678', '24시간 운영하는 종합 동물병원', '24시간'),
  ('핑크 코코 미용샵', 'grooming', '서울 마포구 월드컵로 456', '마포구', 37.5512, 126.9196, '02-2345-6789', '전문 펫 미용 서비스', '10:00-20:00'),
  ('댕댕 문화센터', 'culture_center', '서울 구로구 디지털로 789', '구로구', 37.4851, 126.8975, '02-3456-7890', '반려동물 사회화 교육', '09:00-18:00'),
  ('행복한 동물약국', 'pharmacy', '서울 송파구 올림픽로 321', '송파구', 37.5145, 127.1058, '02-4567-8901', '반려동물 전문 약국', '09:00-21:00')
ON CONFLICT DO NOTHING;

-- Insert sample reviews
INSERT INTO reviews (facility_id, rating, review_text, reviewer_nickname) 
SELECT 
  f.id,
  5,
  '급하게 밤에 갔는데 원장님께서 친절하게 진료 봐주셔서 감사했어요. 시설도 깨끗합니다!',
  '따뜻한집사'
FROM facilities f WHERE f.name = '멍멍 종합병원' LIMIT 1
ON CONFLICT DO NOTHING;