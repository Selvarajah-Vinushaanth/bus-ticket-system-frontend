import React, { useState, useRef, useEffect } from 'react';
import { chatConversation } from '../services/api';
import { useTranslation } from '../hooks/useTranslation';
import './ChatAssistant.css';

const ChatAssistant = ({ user, onClose }) => {
  const { t } = useTranslation();
  
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: t('chatWelcome')
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history on mount
  useEffect(() => {
    let isMounted = true;
    
    const loadChatHistory = async () => {
      if (!user?.id || historyLoaded) return;
      
      setHistoryLoaded(true); // Set this immediately to prevent duplicate calls
      
      try {
        const response = await fetch(`https://bus-ticket-system-backend.onrender.com/api/chat/history/${user.id}`);
        const data = await response.json();
        
        if (isMounted && data.success && data.history && data.history.length > 0) {
          const historicMessages = data.history.map(msg => ({
            role: msg.role,
            content: msg.content
          }));
          
          setMessages(prev => [...prev, ...historicMessages]);
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    };

    loadChatHistory();
    
    return () => {
      isMounted = false;
    };
  }, [user?.id]); // Only depend on user.id, not historyLoaded

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const data = await chatConversation([...messages, userMessage], user?.id, user?.routeNumber);

      if (data.success) {
        const assistantMessage = {
          role: 'assistant',
          content: data.answer
        };

        // If ticket was generated, add special styling
        if (data.ticketGenerated) {
          assistantMessage.isTicket = true;
          assistantMessage.ticket = data.ticket;
        }

        setMessages(prev => [...prev, assistantMessage]);
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.answer || '❌ Sorry, I encountered an error. Please try again.'
        }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '❌ Failed to connect to the server. Please check your connection.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickQuestions = [
    t('qShowRoutes'),
    t('qTodayStats'),
    t('qGenerateTicket'),
    t('qRecentTickets'),
  ];

  const handleQuickQuestion = (question) => {
    setInput(question);
  };

  const handleClearHistory = async () => {
    if (!user?.id) return;
    
    setShowClearModal(false);

    try {
      const response = await fetch(`https://bus-ticket-system-backend.onrender.com/api/chat/history/${user.id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      
      if (data.success) {
        setMessages([{
          role: 'assistant',
          content: '✅ Chat history cleared! How can I help you today?'
        }]);
      }
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };

  // Format message content with beautiful styling
  const formatMessage = (content) => {
    // Split by lines
    const lines = content.split('\n');
    const formatted = [];
    let currentList = [];
    let inCodeBlock = false;

    lines.forEach((line, idx) => {
      const trimmed = line.trim();

      // Code block detection
      if (trimmed.startsWith('---')) {
        if (currentList.length > 0) {
          formatted.push(<ul key={`list-${idx}`} className="chat-list">{currentList}</ul>);
          currentList = [];
        }
        inCodeBlock = !inCodeBlock;
        if (!inCodeBlock) formatted.push(<div key={`divider-${idx}`} className="chat-divider"></div>);
        return;
      }

      if (inCodeBlock) {
        formatted.push(<div key={`code-${idx}`} className="chat-code-line">{line}</div>);
        return;
      }

      // Headers (lines ending with :)
      if (trimmed.endsWith(':') && trimmed.length < 50) {
        if (currentList.length > 0) {
          formatted.push(<ul key={`list-${idx}`} className="chat-list">{currentList}</ul>);
          currentList = [];
        }
        formatted.push(<div key={`header-${idx}`} className="chat-header-text">{trimmed}</div>);
        return;
      }

      // Bullet points with * or numbered lists
      if (trimmed.match(/^[\*\-•]\s+/) || trimmed.match(/^\d+\.\s+/)) {
        const content = trimmed.replace(/^[\*\-•]\s+/, '').replace(/^\d+\.\s+/, '');
        
        // Check for bold text with **
        const parts = content.split(/\*\*(.*?)\*\*/g);
        const formatted_content = parts.map((part, i) => 
          i % 2 === 1 ? <strong key={i}>{part}</strong> : part
        );
        
        currentList.push(<li key={`li-${idx}`}>{formatted_content}</li>);
        return;
      }

      // Regular text
      if (trimmed) {
        if (currentList.length > 0) {
          formatted.push(<ul key={`list-${idx}`} className="chat-list">{currentList}</ul>);
          currentList = [];
        }

        // Format bold text
        const parts = trimmed.split(/\*\*(.*?)\*\*/g);
        const formatted_text = parts.map((part, i) => 
          i % 2 === 1 ? <strong key={i}>{part}</strong> : part
        );

        formatted.push(<div key={`text-${idx}`} className="chat-text-line">{formatted_text}</div>);
      } else if (formatted.length > 0) {
        formatted.push(<br key={`br-${idx}`} />);
      }
    });

    if (currentList.length > 0) {
      formatted.push(<ul key="list-final" className="chat-list">{currentList}</ul>);
    }

    return formatted.length > 0 ? formatted : content;
  };

  return (
    <div className="chat-assistant-overlay">
      <div className="chat-assistant-container">
        <div className="chat-header">
          <div className="chat-header-content">
            <div className="chat-avatar">🤖</div>
            <div>
              <h3>{t('chatAssistant')}</h3>
              <span className="chat-status">Online</span>
            </div>
          </div>
          <div className="chat-header-actions">
            <button className="chat-clear-btn" onClick={() => setShowClearModal(true)} title={t('clearHistory')}>
              🗑️
            </button>
            <button className="chat-close-btn" onClick={onClose}>✕</button>
          </div>
        </div>

        {/* Clear History Modal */}
        {showClearModal && (
          <div className="modal-overlay" onClick={() => setShowClearModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-icon">🗑️</div>
              <h3 className="modal-title">{t('clearHistory')}?</h3>
              <p className="modal-message">
                {t('confirmClearHistory')}
              </p>
              <div className="modal-actions">
                <button 
                  className="modal-btn modal-btn-cancel" 
                  onClick={() => setShowClearModal(false)}
                >
                  {t('clearHistoryNo')}
                </button>
                <button 
                  className="modal-btn modal-btn-confirm" 
                  onClick={handleClearHistory}
                >
                  {t('clearHistoryYes')}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="chat-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`chat-message ${msg.role}`}>
              <div className="message-avatar">
                {msg.role === 'user' ? '👤' : '🤖'}
              </div>
              <div className="message-content">
                {msg.role === 'assistant' ? formatMessage(msg.content) : msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="chat-message assistant">
              <div className="message-avatar">🤖</div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {messages.length === 1 && (
          <div className="quick-questions">
            <p className="quick-questions-title">{t('quickQuestionsTitle')}</p>
            <div className="quick-questions-grid">
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  className="quick-question-btn"
                  onClick={() => handleQuickQuestion(q)}
                  disabled={isLoading}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        <form className="chat-input-form" onSubmit={handleSubmit}>
          <input
            type="text"
            className="chat-input"
            placeholder={t('askAnything')}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            className="chat-send-btn"
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? '⏳' : '➤'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatAssistant;
