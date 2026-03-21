CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS appointments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  date DATE NOT NULL,
  time VARCHAR(10) NOT NULL,
  psychologist_name VARCHAR(255) DEFAULT 'Dra. María González',
  specialty VARCHAR(255) DEFAULT 'Psicóloga Clínica',
  status VARCHAR(50) DEFAULT 'confirmed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  text TEXT NOT NULL,
  sender VARCHAR(50) NOT NULL, -- 'me', 'other' (to match frontend simplification)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Data (Password is '123456' hashed with bcrypt)
INSERT INTO users (name, email, password, role) 
VALUES 
('Admin User', 'admin@example.com', '$2a$10$wW5V.Xl/5.8.1.1.1.1.1.1.1.1.1.1', 'admin'),
('Test User', 'user@example.com', '$2a$10$wW5V.Xl/5.8.1.1.1.1.1.1.1.1.1.1', 'user')
ON CONFLICT (email) DO NOTHING;

INSERT INTO appointments (user_id, date, time) 
VALUES 
(2, CURRENT_DATE, '10:00');

INSERT INTO messages (user_id, text, sender)
VALUES
(2, '¡Hola!', 'other'),
(2, '¿Cómo estás?', 'me'),
(2, 'Muy bien', 'other');
