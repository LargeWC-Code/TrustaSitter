-- Chat System Tables
-- This script creates the necessary tables for the chat functionality

-- Table for chat rooms/conversations
CREATE TABLE IF NOT EXISTS chat_rooms (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL,
    babysitter_id INTEGER NOT NULL,
    booking_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (babysitter_id) REFERENCES babysitters(id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL
);

-- Table for chat messages
CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    room_id INTEGER NOT NULL,
    sender_id INTEGER NOT NULL,
    sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('client', 'babysitter')),
    message TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file')),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE
);

-- Index for better performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_client_babysitter ON chat_rooms(client_id, babysitter_id);

-- Add comments for documentation
COMMENT ON TABLE chat_rooms IS 'Stores chat conversations between clients and babysitters';
COMMENT ON TABLE chat_messages IS 'Stores individual messages within chat rooms';
COMMENT ON COLUMN chat_messages.sender_type IS 'Type of sender: client or babysitter';
COMMENT ON COLUMN chat_messages.message_type IS 'Type of message: text, image, or file'; 