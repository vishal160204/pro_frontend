
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import murfTTS from '../services/murfTTS';
import { videoRecorder } from '../services/videoRecorder';
import apiService from '../services/api';
import './EverydayConversation.css';

const EverydayConversationWithRecording = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [stream, setStream] = useState(null);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTTSPaused, setIsTTSPaused] = useState(false);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [recognition, setRecognition] = useState(null);
  const videoRef = useRef(null);
  const messagesEndRef = useRef(null);
  const streamRef = useRef(null);
  const socketRef = useRef(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Disable browser speech synthesis to prevent conflicts
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      console.log('🔇 Browser speech synthesis disabled');
    }
    
    console.log('🎯 EVERYDAY CONVERSATION COMPONENT MOUNTING...');
    console.log('📍 Current pathname:', window.location.pathname);
    console.log('👤 User object:', user);
    
    const initAll = async () => {
      console.log('🚀 Starting initialization...');
      await initCamera();
      
      // Start hidden video recording
      try {
        await videoRecorder.startRecording();
        console.log('🎥 Hidden video recording started');
      } catch (error) {
        console.error('❌ Failed to start hidden recording:', error);
      }
    };

    initAll();
  }, []);
    
  // WebSocket connection with bulletproof single connection
  const [connectionAttempted, setConnectionAttempted] = useState(false);
  
  useEffect(() => {
    // Bulletproof guard: prevent any new connections
    if (connectionAttempted || socketRef.current) {
      console.log('🛡️ WebSocket connection already attempted/processing');
      return;
    }
    
    setConnectionAttempted(true);

    // Guard: Check for token
    const token = apiService.getToken();
    if (!token) {
      console.log('❌ No JWT token found, cannot connect WebSocket');
      setError('Authentication required');
      setConnectionAttempted(false);
      return;
    }

    console.log('🔄 Creating single WebSocket connection...');
    const wsUrl = `ws://localhost:8000/ws/chat?token=${token}`;
    console.log('🔗 WebSocket URL:', wsUrl);
    
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;
    setSocket(ws);
    
    ws.onopen = () => {
      console.log('✅ WebSocket CONNECTED!');
      setIsConnected(true);
      setError(null);
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📨 Received WebSocket message:', data);

        // Handle all message types with bulletproof TTS control
        if (data.type === 'connection') {
          // Global guard to prevent duplicate TTS
          if (window._welcomeTTSCompleted) {
            console.log('🛡️ Welcome TTS already completed globally');
            return;
          }
          
          const welcomeMessage = {
            id: `ai-${Date.now()}`,
            type: 'ai',
            content: data.message || 'Hello! I\'m here to help you improve your communication skills. How can I assist you today?',
            timestamp: new Date().toLocaleTimeString()
          };
          
          // Check if message already exists
          setMessages(prev => {
            const hasWelcome = prev.some(msg => 
              msg.type === 'ai' && 
              (msg.content.toLowerCase().includes('hello') || msg.content.toLowerCase().includes('welcome'))
            );
            
            if (hasWelcome) {
              console.log('🔄 Welcome message already displayed');
              return prev;
            }
            
            // Global TTS lock
            if (!window._welcomeTTSCompleted) {
              console.log('🔊 Speaking welcome message (global lock)...');
              speakText(welcomeMessage.content);
              window._welcomeTTSCompleted = true;
            }
            return [...prev, welcomeMessage];
          });
          return;
        }
        
        // Handle AI responses (including text_message and any other types)
        if (data.type === 'text_message' || data.type === 'message' || data.type === 'response') {
          const content = data.message || data.content || data.text;
          if (!content) {
            console.log('⚠️ Empty message content received');
            return;
          }
          
          const aiMessage = {
            id: `ai-${Date.now()}`,
            type: 'ai',
            content: content,
            timestamp: new Date().toLocaleTimeString()
          };
          
          setMessages(prev => [...prev, aiMessage]);
          setIsTyping(false);
          
          console.log('🔊 Speaking AI response...');
          speakText(aiMessage.content);
          return;
        }
        
        // Handle typing indicators
        if (data.type === 'typing_start') {
          setIsTyping(true);
          return;
        }
        
        if (data.type === 'typing_stop') {
          setIsTyping(false);
          return;
        }
        
        console.log('📋 Unknown message type:', data.type, data);
        
      } catch (error) {
        console.error('❌ Error processing WebSocket message:', error);
      }
    };
    
    ws.onclose = (event) => {
      console.log('🔌 WebSocket disconnected:', event.code, event.reason);
      setIsConnected(false);
      socketRef.current = null;
    };
    
    ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
      setError('Connection error. Please refresh the page.');
    };

    return () => {
      console.log('🧹 Cleaning up WebSocket connection...');
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.close(1000, 'Component unmounting');
      }
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
      setConnectionAttempted(false);
      // Clean up global TTS flag
      if (window._welcomeTTSCompleted) {
        delete window._welcomeTTSCompleted;
      }
    };
  }, []);

  const initCamera = async () => {
    try {
      const constraints = {
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: true
      };
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      setIsVideoEnabled(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('❌ Camera initialization failed:', error);
      setError('Camera access denied or not available');
    }
  };

  const stopVideo = async () => {
    console.log('🛑 Stopping session and uploading video...');
    
    // Stop and upload video first
    try {
      const videoBlob = await videoRecorder.stopRecording();
      if (videoBlob) {
        console.log('📤 Uploading hidden video for analysis...');
        const result = await videoRecorder.uploadVideo(videoBlob);
        console.log('✅ Video uploaded successfully for analysis:', result);
      }
    } catch (error) {
      console.error('❌ Failed to upload video:', error);
    }
    
    // Then stop other resources
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsVideoEnabled(false);
    }
    
    if (socket) {
      socket.close();
    }
    if (isListening) {
      stopListening();
    }
    
    navigate('/dashboard');
  };

  // Speech recognition setup
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('❌ Speech recognition not supported');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognitionInstance = new SpeechRecognition();
    
    recognitionInstance.continuous = true;
    recognitionInstance.interimResults = true;
    recognitionInstance.lang = 'en-US';

    recognitionInstance.onstart = () => {
      console.log('🎤 Speech recognition started');
    };

    recognitionInstance.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        setInputMessage(finalTranscript);
        setTranscript('');
        setIsListening(false);
        
        // Use setTimeout to ensure we get the latest socket reference
        setTimeout(() => {
          const currentSocket = socketRef.current;
          if (currentSocket && currentSocket.readyState === WebSocket.OPEN) {
            const userMessage = {
              id: `user-${Date.now()}`,
              type: 'user',
              content: finalTranscript,
              timestamp: new Date().toLocaleTimeString()
            };
            
            // Add to messages
            setMessages(prev => [...prev, userMessage]);
            
            // Send to WebSocket
            console.log('📤 Sending to WebSocket:', { type: 'message', content: finalTranscript });
            currentSocket.send(JSON.stringify({
              type: 'message',
              content: finalTranscript
            }));
            
            console.log('✅ Auto-sent transcribed speech:', finalTranscript);
            setInputMessage(''); // Clear input after sending
          } else {
            console.log('❌ WebSocket not ready:', currentSocket?.readyState);
          }
        }, 0);
      } else {
        setTranscript(interimTranscript);
      }
    };

    recognitionInstance.onerror = (event) => {
      console.error('❌ Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognitionInstance.onend = () => {
      setIsListening(false);
    };

    setRecognition(recognitionInstance);
  }, []);

  const startListening = useCallback(() => {
    if (recognition && !isListening) {
      try {
        console.log('🎤 Attempting to start speech recognition...');
        console.log('Current recognition state:', recognition.state);
        console.log('isListening state:', isListening);
        
        // Prevent starting if already in any active state
        if (recognition.state === 'listening' || recognition.state === 'recording' || isListening) {
          console.log('🎤 Speech recognition already active, skipping start');
          return;
        }
        
        recognition.start();
        setIsListening(true);
        console.log('✅ Speech recognition started successfully');
      } catch (error) {
        console.error('❌ Error starting speech recognition:', error);
        setIsListening(false);
        
        // Handle specific error types
        if (error.name === 'InvalidStateError') {
          console.log('🔄 Speech recognition already running, resetting state');
          setIsListening(false);
          // Force stop if needed
          try {
            recognition.stop();
          } catch (stopError) {
            console.log('Could not stop recognition:', stopError);
          }
        }
      }
    } else {
      console.log('🎤 Conditions not met - recognition:', !!recognition, 'isListening:', isListening);
    }
  }, [recognition, isListening]);

  const stopListening = useCallback(() => {
    if (recognition && isListening) {
      try {
        console.log('🛑 Attempting to stop speech recognition...');
        recognition.stop();
        setIsListening(false);
        console.log('✅ Speech recognition stopped successfully');
      } catch (error) {
        console.error('❌ Error stopping speech recognition:', error);
        setIsListening(false);
      }
    }
  }, [recognition, isListening]);

  // Text-to-speech function
  const speakText = async (text) => {
    if (isSpeaking) {
      return;
    }

    setIsSpeaking(true);
    setIsTTSPaused(false);

    try {
      console.log('🎯 Using Murf AI TTS...');
      
      const ttsController = await murfTTS.generateSpeech(text, {
        voiceId: 'en-US-terrell',
        speed: 0.9,
        pitch: 0
      });
      
      console.log('✅ TTS controller created');
      setCurrentAudio(ttsController);

      return new Promise((resolve) => {
        ttsController.onended = () => {
          console.log('TTS playback completed');
          setIsSpeaking(false);
          setCurrentAudio(null);
          resolve();
        };
        
        ttsController.onpause = () => {
          console.log('TTS paused');
          setIsTTSPaused(true);
        };
        
        ttsController.onresume = () => {
          console.log('TTS resumed');
          setIsTTSPaused(false);
        };
        
        ttsController.onerror = (error) => {
          console.error('Audio playback error:', error);
          setIsSpeaking(false);
          setCurrentAudio(null);
        };
        
        ttsController.play();
      });
    } catch (error) {
      console.error('❌ TTS error:', error);
      setIsSpeaking(false);
    }
  };

  const toggleTTSPause = () => {
    if (currentAudio) {
      if (isTTSPaused) {
        currentAudio.resume();
        setIsTTSPaused(false);
      } else {
        currentAudio.pause();
        setIsTTSPaused(true);
      }
    }
  };

  const handleSendMessage = useCallback(() => {
    if (!inputMessage.trim() || !socket || !isConnected) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    
    socket.send(JSON.stringify({
      type: 'message',
      content: inputMessage.trim()
    }));

    setInputMessage('');
    setTranscript('');
  }, [inputMessage, socket, isConnected]);

  // Debounced button click handler
  const handleListenClick = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  const requestAudioPermissions = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('✅ Audio permissions granted');
    } catch (error) {
      console.warn('⚠️ Audio permissions denied:', error);
    }
  };

  return (
    <div className="everyday-conversation">
      <div className="conversation-container">
        <div className="video-section">
          <div className="video-container">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="video-feed"
              style={{ display: isVideoEnabled ? 'block' : 'none' }}
            />
            {!isVideoEnabled && (
              <div className="video-placeholder">
                <div className="placeholder-icon">📹</div>
                <p>Camera initializing...</p>
              </div>
            )}
          </div>

          {isVideoEnabled && (
            <>
              {transcript && (
                <div className="transcript-display">
                  <div className="transcript-label">🎤 Listening:</div>
                  <div className="transcript-text">{transcript}</div>
                </div>
              )}
              <div className="video-controls">
                <button 
                  onClick={handleListenClick}
                  className={`control-btn ${isListening ? 'listening' : ''}`}
                  disabled={!isConnected}
                  title={isListening ? "Stop listening" : "Start listening"}
                >
                  {isListening ? '🛑 Stop' : '🎤 Listen'}
                </button>
                
                <button 
                  onClick={toggleTTSPause} 
                  className={`control-btn ${isSpeaking ? 'active' : ''} ${isTTSPaused ? 'paused' : ''}`}
                  title={isTTSPaused ? "Resume audio" : "Pause audio"}
                  style={{
                    display: isSpeaking || isTTSPaused ? 'flex' : 'none',
                    minWidth: '120px'
                  }}
                >
                  {isTTSPaused ? '▶️ Resume' : '⏸️ Pause'}
                </button>
                
                <button 
                  onClick={() => {
                    stopVideo();
                    navigate('/dashboard');
                  }} 
                  className="control-btn stop-btn"
                  title="End session"
                >
                  ✖️ End Session
                </button>
              </div>
            </>
          )}
        </div>

        <div className="chat-section">
          <div className="messages-container">
            {messages.length === 0 && (
              <div className="welcome-message">
                <div className="welcome-icon">💬</div>
                <h3>Start Chatting</h3>
                <p>Ask me anything about improving your communication!</p>
              </div>
            )}
            
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.type}`}>
                <div className={`avatar ${message.type}-avatar`}>
                  {message.type === 'user' ? '👤' : message.type === 'ai' ? '🤖' : 'ℹ️'}
                </div>
                <div className="message-content">
                  <div className="message-text">{message.content}</div>
                  <div className="message-time">{message.timestamp}</div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="message ai">
                <div className="avatar ai-avatar">🤖</div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="input-container">
            <div className="chat-input">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                className="message-input"
                disabled={!isConnected}
              />
              <button 
                onClick={handleSendMessage} 
                className="send-button enhanced"
                disabled={!isConnected || !inputMessage.trim()}
                title="Send message"
              >
                <span className="send-icon">📤</span>
                <span className="send-text">Send</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EverydayConversationWithRecording;

