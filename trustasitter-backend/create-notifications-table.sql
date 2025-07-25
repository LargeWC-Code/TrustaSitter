-- Create notifications_read table to track read status
CREATE TABLE IF NOT EXISTS notifications_read (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    notification_id VARCHAR(100) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, notification_type, notification_id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_read_user_id ON notifications_read(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read_type_id ON notifications_read(notification_type, notification_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read_status ON notifications_read(is_read);

-- Add foreign key constraints if tables exist
-- ALTER TABLE notifications_read ADD CONSTRAINT fk_notifications_read_user_id 
--     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
-- ALTER TABLE notifications_read ADD CONSTRAINT fk_notifications_read_babysitter_id 
--     FOREIGN KEY (user_id) REFERENCES babysitters(id) ON DELETE CASCADE; 