
import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, Bot, AlertCircle, Loader2 } from 'lucide-react';
import { getAIInstance } from '../services/geminiService';
import { Modality } from '@google/genai';

const LiveConversation: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcription, setTranscription] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const outAudioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number) => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const createBlob = (data: Float32Array) => {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  };

  const stopConversation = () => {
    setIsActive(false);
    sessionRef.current?.close();
    streamRef.current?.getTracks().forEach(t => t.stop());
    sourcesRef.current.forEach(s => s.stop());
    sourcesRef.current.clear();
  };

  const startConversation = async () => {
    try {
      setIsConnecting(true);
      setError(null);
      const ai = getAIInstance();
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setIsConnecting(false);
            setIsActive(true);
            const source = audioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (msg: any) => {
            if (msg.serverContent?.outputTranscription) {
              setTranscription(prev => [...prev.slice(-10), `Bot: ${msg.serverContent.outputTranscription.text}`]);
            }
            if (msg.serverContent?.inputTranscription) {
              setTranscription(prev => [...prev.slice(-10), `You: ${msg.serverContent.inputTranscription.text}`]);
            }

            const audioData = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData) {
              const ctx = outAudioContextRef.current!;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const buffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(ctx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }

            if (msg.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error(e);
            setError("Connection Error. Check API key and internet.");
            stopConversation();
          },
          onclose: () => setIsActive(false),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction: 'You are a friendly cybersecurity expert advisor. Speak naturally and clearly.',
          outputAudioTranscription: {},
          inputAudioTranscription: {},
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (e) {
      console.error(e);
      setError("Microphone permission denied or session failed.");
      setIsConnecting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-10 text-center shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-cyan-500/5 pointer-events-none" />
        
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center justify-center gap-2">
          <Volume2 className="text-cyan-400" /> Live AI Consultation
        </h2>

        <div className="relative inline-block mb-8">
          <div className={`absolute inset-0 rounded-full blur-2xl transition-opacity duration-1000 ${isActive ? 'bg-cyan-500/30 opacity-100' : 'bg-transparent opacity-0'}`} />
          <button
            onClick={isActive ? stopConversation : startConversation}
            disabled={isConnecting}
            className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 shadow-xl ${
              isActive 
                ? 'bg-red-500 hover:bg-red-600 scale-110' 
                : 'bg-cyan-600 hover:bg-cyan-500 hover:scale-105'
            } disabled:opacity-50`}
          >
            {isConnecting ? (
              <Loader2 className="animate-spin text-white w-10 h-10" />
            ) : isActive ? (
              <MicOff className="text-white w-10 h-10" />
            ) : (
              <Mic className="text-white w-10 h-10" />
            )}
          </button>
        </div>

        <div className="space-y-2">
          <p className={`text-lg font-mono tracking-widest ${isActive ? 'text-cyan-400 animate-pulse' : 'text-slate-500'}`}>
            {isActive ? 'LISTENING / SPEAKING' : isConnecting ? 'CONNECTING...' : 'READY FOR VOICE CONVERSATION'}
          </p>
          {error && <p className="text-red-400 flex items-center justify-center gap-1 text-sm"><AlertCircle size={14}/> {error}</p>}
        </div>

        <div className="mt-8 bg-black/40 rounded-xl p-4 h-48 overflow-y-auto text-left space-y-2 scrollbar-thin">
          {transcription.length === 0 ? (
            <p className="text-slate-600 italic text-sm">Transcription will appear here...</p>
          ) : (
            transcription.map((line, i) => (
              <div key={i} className={`text-sm ${line.startsWith('Bot') ? 'text-cyan-400' : 'text-slate-400'}`}>
                <span className="font-bold">{line.split(':')[0]}:</span> {line.split(':')[1]}
              </div>
            ))
          )}
        </div>
      </div>
      
      <div className="flex items-start gap-3 bg-slate-800/40 p-4 rounded-xl border border-slate-700">
        <Bot size={20} className="text-cyan-400 mt-1" />
        <p className="text-xs text-slate-400 leading-relaxed">
          Powered by Gemini 2.5 Native Audio. Real-time sub-second latency voice interaction for expert cybersecurity advice.
        </p>
      </div>
    </div>
  );
};

export default LiveConversation;
