
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Image, Paperclip, Search, MapPin, Brain, Loader2, X, Play } from 'lucide-react';
import { ChatMessage } from '../types';
import { sendMessageToGemini } from '../services/geminiService';

const CyberChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: 'สวัสดีครับ ผมคือ CyberGuard AI Assistant (Advanced Edition) ผมสามารถวิเคราะห์ภาพ วิดีโอ ค้นหาข้อมูลล่าสุดผ่าน Google Search และใช้โหมดใช้ความคิด (Thinking) ได้ด้วย มีอะไรให้ช่วยไหมครับ?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState<{data: string, mimeType: string}[]>([]);
  const [useGrounding, setUseGrounding] = useState(false);
  const [useThinking, setUseThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Improved smooth scroll with a slight delay to account for image/multimodal rendering
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // Explicitly cast to File[] to ensure the 'file' variable is correctly typed and not 'unknown'
      (Array.from(files) as File[]).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setAttachments(prev => [...prev, { data: reader.result as string, mimeType: file.type }]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleSend = async () => {
    if (!input.trim() && attachments.length === 0) return;
    if (isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      text: input,
      timestamp: new Date(),
      attachments: attachments.map(a => a.data)
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setAttachments([]);
    setIsLoading(true);

    try {
      const result = await sendMessageToGemini(userMessage.text, attachments, useGrounding);
      const botMessage: ChatMessage = {
        role: 'model',
        text: result.text,
        timestamp: new Date(),
        groundingMetadata: result.groundingMetadata
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[700px] w-full max-w-5xl mx-auto bg-slate-900/50 backdrop-blur-md border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
      <div className="bg-slate-800 p-4 border-b border-slate-700 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="bg-cyan-500/20 p-2 rounded-full">
            <Bot className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">CyberGuard Advanced AI</h3>
            <p className="text-xs text-slate-400">Gemini 3 Pro Multimodal</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => setUseGrounding(!useGrounding)}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all ${useGrounding ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-slate-400'}`}
          >
            <Search size={14} /> Grounding
          </button>
          <button 
            onClick={() => setUseThinking(!useThinking)}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all ${useThinking ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-400'}`}
          >
            <Brain size={14} /> Thinking
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scroll-smooth">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            <div className={`max-w-[85%] space-y-2 ${msg.role === 'user' ? 'order-2' : ''}`}>
               <div className={`p-4 rounded-2xl transition-all duration-300 transform cursor-default group ${
                 msg.role === 'user' 
                  ? 'bg-cyan-600 text-white rounded-tr-none hover:bg-cyan-500 hover:scale-[1.01] hover:shadow-lg hover:shadow-cyan-500/20' 
                  : 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700 shadow-xl hover:bg-slate-750 hover:scale-[1.01] hover:border-slate-600 hover:shadow-cyan-900/10'
               }`}>
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {msg.attachments.map((att, i) => (
                        <div key={i} className="relative rounded-lg overflow-hidden w-24 h-24 border border-white/20 shadow-md">
                          {att.startsWith('data:video') ? <div className="w-full h-full bg-black flex items-center justify-center"><Play size={20} /></div> : <img src={att} className="w-full h-full object-cover" />}
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                  
                  {msg.groundingMetadata?.groundingChunks && (
                    <div className="mt-4 pt-4 border-t border-white/10 text-xs">
                      <p className="font-bold text-cyan-300 mb-2">Sources:</p>
                      <ul className="space-y-1">
                        {msg.groundingMetadata.groundingChunks.map((chunk: any, i: number) => (
                          chunk.web && <li key={i}><a href={chunk.web.uri} target="_blank" className="hover:underline flex items-center gap-1 text-slate-400"><Search size={10} /> {chunk.web.title}</a></li>
                        ))}
                      </ul>
                    </div>
                  )}
               </div>
               <div className={`text-[10px] px-2 text-slate-500 font-mono ${msg.role === 'user' ? 'text-right' : ''}`}>
                 {msg.timestamp.toLocaleTimeString()}
               </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start animate-fade-in">
             <div className="bg-slate-800/80 p-4 rounded-2xl rounded-tl-none border border-slate-700 flex items-center gap-4 shadow-lg">
               <Loader2 className="animate-spin text-cyan-400" />
               <span className="text-xs font-mono text-slate-400 tracking-wider">
                 {useThinking ? 'AI IS THINKING DEEPLY...' : 'AI IS ANALYZING...'}
               </span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      <div className="p-4 bg-slate-800 border-t border-slate-700 space-y-4 shadow-inner">
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 animate-fade-in">
            {attachments.map((att, i) => (
              <div key={i} className="relative group w-16 h-16 rounded-lg overflow-hidden border border-slate-600 shadow-md hover:border-cyan-500 transition-colors">
                {att.mimeType.startsWith('video') ? <div className="w-full h-full bg-black flex items-center justify-center"><Play size={16} /></div> : <img src={att.data} className="w-full h-full object-cover" />}
                <button 
                  onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))}
                  className="absolute top-0 right-0 bg-red-500 text-white p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-slate-400 hover:text-cyan-400 hover:bg-slate-700 rounded-xl transition-all"
            title="Attach images or video"
          >
            <Paperclip size={20} />
            <input type="file" multiple className="hidden" ref={fileInputRef} onChange={handleFileChange} accept="image/*,video/*" />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask anything, analyze media, or search the web..."
            className="flex-1 bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-cyan-500 outline-none transition-all placeholder-slate-500"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || (!input.trim() && attachments.length === 0)}
            className="bg-cyan-600 hover:bg-cyan-500 text-white p-3 rounded-xl shadow-lg transition-all disabled:opacity-50 active:scale-95"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CyberChat;
