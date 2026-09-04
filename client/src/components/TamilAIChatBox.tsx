import React, { useState, useEffect, useRef } from 'react';
import { api } from '../utils/api.js';
import { useLanguage } from '../contexts/LanguageContext.js';
import { soundEngine } from '../utils/audio.js';
import { Send, Mic, MicOff, Volume2, VolumeX, X, Bot, Sparkles } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

export const TamilAIChatBox: React.FC = () => {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeakingEnabled, setIsSpeakingEnabled] = useState(true);
  const [speechActive, setSpeechActive] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      
      rec.onstart = () => {
        setIsRecording(true);
        soundEngine.playVoiceStart();
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText(transcript);
        }
      };

      rec.onerror = (e: any) => {
        console.error('Speech recognition error:', e);
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  // Sync initial welcome message based on language
  useEffect(() => {
    const defaultMsg = language === 'ta' 
      ? 'வணக்கம்! நான் அகிலா, A K சமூக நல அறக்கட்டளையின் AI உதவியாளர். உங்களுக்கு நான் எவ்வாறு உதவ முடியும்?'
      : 'Hello! I am AKila, the AI assistant for A K Social Welfare Trust. How can I help you today?';
    
    setMessages([
      {
        id: 'welcome',
        sender: 'bot',
        text: defaultMsg,
        timestamp: new Date(),
      }
    ]);
  }, [language]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const toggleChat = () => {
    if (!isOpen) {
      soundEngine.playClick();
    } else {
      soundEngine.playHover();
      window.speechSynthesis.cancel();
      setSpeechActive(false);
    }
    setIsOpen(!isOpen);
  };

  const handleSend = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed) return;

    soundEngine.playClick();
    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: 'user',
      text: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const response = await api.post('/chat', { message: trimmed });
      const botReply = response.data.reply;

      const botMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: 'bot',
        text: botReply,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMsg]);
      soundEngine.playIncoming();

      // Trigger Text-to-Speech if enabled
      if (isSpeakingEnabled) {
        speakText(botReply);
      }
    } catch (err) {
      console.error('AI chat failed:', err);
      const errorMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: 'bot',
        text: language === 'ta'
          ? 'மன்னிக்கவும், தற்காலிக தொழில்நுட்பக் கோளாறு ஏற்பட்டுள்ளது. மீண்டும் முயலவும்.'
          : 'Apologies, a temporary connection issue occurred. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    // Clean markdown formatting if present
    const cleanText = text.replace(/[*_#`\[\]]/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Check characters for Tamil script to set speech language
    const hasTamil = /[\u0b80-\u0bff]/g.test(text);
    utterance.lang = hasTamil ? 'ta-IN' : 'en-US';
    
    // Attempt to select correct voice
    const voices = window.speechSynthesis.getVoices();
    const targetVoice = voices.find(v => v.lang.startsWith(hasTamil ? 'ta' : 'en'));
    if (targetVoice) utterance.voice = targetVoice;

    utterance.onstart = () => setSpeechActive(true);
    utterance.onend = () => setSpeechActive(false);
    utterance.onerror = () => setSpeechActive(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert(language === 'ta' 
        ? 'உங்களது உலாவியில் குரல் உள்ளீடு ஆதரிக்கப்படவில்லை.' 
        : 'Voice recognition is not supported in this browser.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.lang = language === 'ta' ? 'ta-IN' : 'en-US';
      recognitionRef.current.start();
    }
  };

  const tamilSuggestions = [
    { text: 'அறக்கட்டளை பற்றி கூறு', label: 'அறக்கட்டளை பற்றி 🏢' },
    { text: 'நன்கொடைகள் விபரம் எவ்வளவு?', label: 'நிதி விபரம் 💰' },
    { text: 'தன்னார்வலராக இணைவது எப்படி?', label: 'தன்னார்வலராக 🤝' },
    { text: 'வரவிருக்கும் நிகழ்வுகள் யாவை?', label: 'நிகழ்வுகள் 📅' },
  ];

  const englishSuggestions = [
    { text: 'Tell me about the trust', label: 'About Trust 🏢' },
    { text: 'How much donation raised?', label: 'Donation Stats 💰' },
    { text: 'How do I volunteer?', label: 'Volunteer Info 🤝' },
    { text: 'What events are upcoming?', label: 'Upcoming Events 📅' },
  ];

  const suggestions = language === 'ta' ? tamilSuggestions : englishSuggestions;

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* 1. CLOSED FLOATING ASSISTANT ORB */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          onMouseEnter={() => soundEngine.playHover()}
          className="relative w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-tr from-brand-600 to-purple-600 text-white shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 group border border-white/20"
          title="AKila AI Assistant"
        >
          {/* Futuristic glowing concentric outer rings */}
          <div className="absolute inset-[-6px] rounded-full border border-brand-500/30 animate-[spin_8s_linear_infinite]" />
          <div className="absolute inset-[-12px] rounded-full border border-purple-500/10 animate-[spin_12s_linear_infinite_reverse]" />
          <div className="absolute inset-0 rounded-full bg-brand-500/20 blur-md group-hover:bg-brand-500/40 transition-all duration-300" />
          
          <Bot className="w-6 h-6 relative z-10 animate-[bounce_3s_infinite] text-white" />
          <Sparkles className="w-3.5 h-3.5 absolute top-2 right-2 text-yellow-300 animate-pulse relative z-10" />
          
          {/* Notification Dot */}
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500"></span>
          </span>
        </button>
      )}

      {/* 2. CHAT CONTAINER PANEL */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[550px] rounded-2xl glass border border-white/20 dark:border-white/10 shadow-2xl flex flex-col overflow-hidden animate-[reveal_0.4s_cubic-bezier(0.16,1,0.3,1)]">
          {/* Header Panel */}
          <div className="p-4 bg-gradient-to-r from-brand-600/80 via-indigo-600/80 to-purple-600/80 backdrop-blur-md text-white flex items-center justify-between border-b border-white/10 relative">
            <div className="flex items-center gap-3">
              {/* Holographic Glowing Avatar */}
              <div className="relative w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20 overflow-hidden shadow-inner">
                <Bot className="w-5 h-5 text-brand-300" />
                {/* Audio visual waves when speaking */}
                {speechActive && (
                  <div className="absolute bottom-1 flex gap-0.5 justify-center w-full">
                    <span className="w-0.5 h-2 bg-brand-300 rounded animate-[pulse_0.4s_infinite_alternate]" />
                    <span className="w-0.5 h-3.5 bg-brand-300 rounded animate-[pulse_0.5s_infinite_alternate_0.1s]" />
                    <span className="w-0.5 h-2 bg-brand-300 rounded animate-[pulse_0.3s_infinite_alternate_0.2s]" />
                  </div>
                )}
              </div>
              <div>
                <h4 className="text-sm font-bold tracking-wide flex items-center gap-1.5">
                  {language === 'ta' ? 'அகிலா (AKila) AI' : 'AKila AI'}
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </h4>
                <p className="text-[10px] text-slate-300 font-medium">
                  {language === 'ta' ? 'அறக்கட்டளையின் AI உதவியாளர்' : 'NGO Virtual Assistant'}
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setIsSpeakingEnabled(!isSpeakingEnabled);
                  if (isSpeakingEnabled) window.speechSynthesis.cancel();
                }}
                className={`p-1.5 rounded-lg transition-colors hover:bg-white/15 ${
                  isSpeakingEnabled ? 'text-white' : 'text-slate-400'
                }`}
                title={isSpeakingEnabled ? 'Mute AI Voice' : 'Enable AI Voice'}
              >
                {isSpeakingEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              <button
                onClick={toggleChat}
                className="p-1.5 rounded-lg transition-colors hover:bg-white/15 text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Matrix glow line */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/20 dark:bg-slate-950/20 scrollbar">
            {messages.map((msg) => {
              const isBot = msg.sender === 'bot';
              return (
                <div key={msg.id} className={`flex ${isBot ? 'justify-start' : 'justify-end'} animate-[reveal_0.2s_ease-out]`}>
                  <div className="flex gap-2 max-w-[85%]">
                    {isBot && (
                      <div className="w-6 h-6 rounded-full bg-brand-500/10 flex items-center justify-center text-brand-600 border border-brand-500/20 mt-1 self-start shrink-0">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <div
                      className={`p-3 rounded-2xl text-xs leading-relaxed ${
                        isBot
                          ? 'bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 text-slate-800 dark:text-slate-100 shadow-sm border-l-3 border-l-brand-500'
                          : 'bg-gradient-to-br from-brand-600 to-indigo-600 text-white shadow-md rounded-tr-none'
                      }`}
                    >
                      <p className="whitespace-pre-line font-medium">{msg.text}</p>
                      <span className={`block text-[9px] mt-1 text-right ${isBot ? 'text-slate-400' : 'text-indigo-200'}`}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            {loading && (
              <div className="flex justify-start">
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-brand-500/10 flex items-center justify-center text-brand-600 border border-brand-500/20 self-start animate-spin">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-600 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Chips */}
          <div className="px-4 py-2 border-t border-slate-200/40 dark:border-slate-800/40 flex gap-1.5 overflow-x-auto whitespace-nowrap scrollbar bg-white/20 dark:bg-slate-950/20">
            {suggestions.map((sug, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(sug.text)}
                className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg border border-brand-500/20 hover:border-brand-500/50 bg-brand-500/5 hover:bg-brand-500/10 text-brand-600 dark:text-brand-400 transition-all active:scale-95 shrink-0"
              >
                {sug.label}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200/50 dark:border-slate-800/80 flex gap-2 items-center">
            {/* Mic Toggle Button */}
            <button
              onClick={handleVoiceInput}
              className={`p-2.5 rounded-xl transition-all active:scale-90 flex items-center justify-center shrink-0 border ${
                isRecording
                  ? 'bg-red-500 border-red-600 text-white animate-pulse'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200/50 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              title="Voice Typing"
            >
              {isRecording ? <MicOff className="w-4.5 h-4.5" /> : <Mic className="w-4.5 h-4.5" />}
            </button>

            {/* Input Field */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend(inputText)}
              placeholder={
                language === 'ta' ? 'அகிலாவிடம் கேளுங்கள்...' : 'Ask AKila...'
              }
              className="flex-1 min-w-0 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-3 py-2 rounded-xl text-xs border border-slate-200/50 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 font-medium"
            />

            {/* Send Button */}
            <button
              onClick={() => handleSend(inputText)}
              disabled={!inputText.trim()}
              className="p-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white transition-all disabled:opacity-50 disabled:pointer-events-none active:scale-90"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
