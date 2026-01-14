-- Seed data for Classer database

-- Insert default users (password is hashed version of '123')
-- Using bcrypt hash for '123': $2a$10$Pkk8sjjuAWolQen9brtnRO2jRumTJPuqGWT/.hwQrPRQTz5YxlIf2
INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@classer.com', '$2a$10$Pkk8sjjuAWolQen9brtnRO2jRumTJPuqGWT/.hwQrPRQTz5YxlIf2', 'admin'),
('Alice Johnson', 'alice@classer.com', '$2a$10$Pkk8sjjuAWolQen9brtnRO2jRumTJPuqGWT/.hwQrPRQTz5YxlIf2', 'instructor'),
('Bob Smith', 'bob@classer.com', '$2a$10$Pkk8sjjuAWolQen9brtnRO2jRumTJPuqGWT/.hwQrPRQTz5YxlIf2', 'instructor'),
('Charlie Brown', 'charlie@classer.com', '$2a$10$Pkk8sjjuAWolQen9brtnRO2jRumTJPuqGWT/.hwQrPRQTz5YxlIf2', 'instructor'),
('Diana Prince', 'diana@classer.com', '$2a$10$Pkk8sjjuAWolQen9brtnRO2jRumTJPuqGWT/.hwQrPRQTz5YxlIf2', 'instructor');

-- Insert rooms
INSERT INTO rooms (name, capacity, status, equipment, location) VALUES
('Room A', 20, 'available', '["projector", "whiteboard"]', 'Building A, 1st Floor'),
('Room B', 30, 'available', '["projector", "computers"]', 'Building B, 2nd Floor'),
('Room C', 25, 'available', '["whiteboard"]', 'Building A, 1st Floor'),
('Computer Lab 1', 40, 'available', '["projector", "whiteboard", "computers"]', 'Building C, 3rd Floor'),
('Conference Hall', 100, 'available', '["projector"]', 'Building B, 1st Floor');

-- Insert sample bookings
INSERT INTO bookings (user_id, room_id, date, start_time, end_time, duration, class_name, subject, student_count, status, notes) VALUES
(2, 1, '2026-02-20', '09:00:00', '10:30:00', 1.5, 'Introduction to Python', 'Programming', 25, 'confirmed', 'Please ensure the projector is working.'),
(2, 3, '2026-02-22', '13:00:00', '16:00:00', 3.0, 'Advanced Algorithms', 'Computer Science', 18, 'confirmed', ''),
(3, 2, '2026-02-21', '10:00:00', '11:30:00', 1.5, 'Web Development Basics', 'Web Development', 30, 'pending', 'Need access to the latest version of Chrome.'),
(2, 2, '2026-02-25', '10:00:00', '11:00:00', 1.0, 'Web Technologies', 'Web Development', 20, 'modified', 'Time changed from 10:30 to 10:00.'),
(2, 1, '2026-02-28', '14:00:00', '15:30:00', 1.5, 'Machine Learning Basics', 'AI', 35, 'cancelled', 'Instructor fell ill.');
