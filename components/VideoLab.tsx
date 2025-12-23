
import React, { useState } from 'react';
import { Film, Play, Loader2, Upload, Monitor } from 'lucide-react';
import { generateVideo, ensureApiKey } from '../services/geminiService';

const VideoLab: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [status, setStatus] = useState('');

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    setVideoUrl(null);
    setStatus('Initializing Veo Engine...');
    try {
      await ensureApiKey();
      setStatus('Processing Prompt & Generating Video (Takes ~2-3 mins)...');
      const url = await generateVideo(prompt, imageBase64 || undefined, aspectRatio);
      setVideoUrl(url);
    } catch (e) {
      alert("Error generating video. Make sure you have a paid API key selected.");
    } finally {
      setLoading(false);
      setStatus('');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImageBase64(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white flex items-center justify-center gap-2">
          <Film className="text-purple-400" /> Veo Animation Studio
        </h2>
        <p className="text-slate-400 mt-2">Transform static images into cinematic 2025 experiences</p>
      </div>

      <div className="bg-slate-900/50 p-8 rounded-2xl border border-slate-700 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <label className="block text-sm font-bold text-slate-300">Motion Prompt</label>
            <textarea
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500"
              rows={4}
              placeholder="E.g. 'A neon digital ghost flowing through high-tech server racks...'"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-300">Aspect Ratio</label>
              <div className="flex gap-4">
                <button 
                  onClick={() => setAspectRatio('16:9')}
                  className={`flex-1 py-2 rounded-lg border flex items-center justify-center gap-2 ${aspectRatio === '16:9' ? 'bg-purple-600 border-purple-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                >
                  <Monitor size={16} /> 16:9 Landscape
                </button>
                <button 
                  onClick={() => setAspectRatio('9:16')}
                  className={`flex-1 py-2 rounded-lg border flex items-center justify-center gap-2 ${aspectRatio === '9:16' ? 'bg-purple-600 border-purple-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                >
                  <div className="w-3 h-4 border-2 border-current rounded-sm" /> 9:16 Portrait
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
             <label className="block text-sm font-bold text-slate-300">Reference Image (Optional)</label>
             <div className="relative h-[160px] bg-slate-950 rounded-lg border border-dashed border-slate-700 flex items-center justify-center overflow-hidden">
                {imageBase64 ? (
                  <>
                    <img src={imageBase64} className="w-full h-full object-cover opacity-50" />
                    <button onClick={() => setImageBase64(null)} className="absolute top-2 right-2 bg-red-500 p-1 rounded-full text-white">
                      <Film size={14} />
                    </button>
                  </>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center gap-2">
                    <Upload className="text-slate-600" />
                    <span className="text-slate-600 text-sm">Upload Starting Frame</span>
                    <input type="file" className="hidden" onChange={handleFileChange} />
                  </label>
                )}
             </div>
             <p className="text-[10px] text-slate-500">Supported formats: PNG, JPEG. Max 5MB.</p>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !prompt}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Play size={20} />}
          Start Generation
        </button>

        {loading && (
          <div className="text-center space-y-2">
            <p className="text-purple-400 animate-pulse">{status}</p>
            <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
              <div className="bg-purple-500 h-full animate-[loading_30s_linear_infinite]" />
            </div>
          </div>
        )}
      </div>

      {videoUrl && (
        <div className="animate-fade-in space-y-4">
          <div className="aspect-video bg-black rounded-2xl overflow-hidden border border-slate-700 shadow-2xl">
            <video src={videoUrl} controls autoPlay loop className="w-full h-full" />
          </div>
          <div className="flex justify-center">
            <a href={videoUrl} download="cyberguard-veo.mp4" className="bg-slate-800 px-6 py-2 rounded-full hover:bg-slate-700 text-white font-bold border border-slate-600">
              Download MP4
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoLab;
