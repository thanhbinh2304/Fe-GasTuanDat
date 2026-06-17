'use client';

import React, { useState, useRef, useEffect } from 'react';
import styles from './ChatbotUI.module.css';
import { MessageCircle, X, Send } from 'lucide-react';
import { fetchClient } from '@/shares/fetchClient';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
}

export default function ChatbotUI() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'bot', text: 'Xin chào! Tôi là trợ lý ảo Gas Tuấn Đạt. Tôi có thể giúp gì cho bạn hôm nay?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleChat = () => setIsOpen(!isOpen);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue.trim();
    const sessionId = localStorage.getItem('chatbot_session_id') || `session_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('chatbot_session_id', sessionId);

    const newUserMsg: Message = { id: Date.now().toString(), sender: 'user', text: userText };
    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetchClient('/chatbot/chat', {
        method: 'POST',
        body: JSON.stringify({ sessionId, query: userText })
      });

      const botMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        sender: 'bot', 
        text: response.data?.response || 'Xin lỗi, tôi không thể trả lời lúc này.' 
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error: any) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: 'Đã có lỗi xảy ra hoặc phiên đăng nhập của bạn không hợp lệ. Vui lòng đăng nhập lại.'
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className={styles.chatbotContainer}>
      {isOpen && (
        <div className={styles.chatWindow}>
          <div className={styles.chatHeader}>
            <span>Trợ lý ảo AI</span>
            <button className={styles.closeButton} onClick={toggleChat}>
              <X size={20} />
            </button>
          </div>
          
          <div className={styles.chatMessages}>
            {messages.map(msg => (
              <div 
                key={msg.id} 
                className={`${styles.message} ${msg.sender === 'user' ? styles.userMessage : styles.botMessage}`}
              >
                {msg.text}
              </div>
            ))}
            {isLoading && (
              <div className={`${styles.message} ${styles.botMessage}`}>
                Đang suy nghĩ...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className={styles.chatInputContainer}>
            <input 
              type="text" 
              className={styles.chatInput} 
              placeholder="Nhập câu hỏi..." 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={isLoading}
            />
            <button className={styles.sendButton} onClick={sendMessage} disabled={isLoading || !inputValue.trim()}>
              <Send size={18} />
            </button>
          </div>
        </div>
      )}

      {!isOpen && (
        <button className={styles.chatButton} onClick={toggleChat}>
          <MessageCircle size={28} />
        </button>
      )}
    </div>
  );
}
