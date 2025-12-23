
import React, { useState } from 'react';
import { ImageIcon, Wand2, Maximize, Crop, Download, Loader2, Upload } from 'lucide-react';
import { generateImage, editImage, ensureApiKey } from '../services/geminiService';

const ImageLab: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [imageSize, setImageSize] = useState('1K');
  const [loading, setLoading] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [baseImage, setBaseImage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    try {
      await ensureApiKey();
      const img = await generateImage(prompt, { aspectRatio, imageSize });
      setResultImage(img);
    } catch (e) {
      alert("Error generating image. Ensure you have a valid API key selected.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!prompt || !baseImage) return;
    setLoading(true);
    try {
      const img = await editImage(baseImage, 'image/png', prompt);
      if (typeof img === 'string' && img.startsWith('data:')) {
        setResultImage(img);
      }
    } catch (e) {
      alert("Error editing image.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setBaseImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white flex items-center justify-center gap-2">
          <ImageIcon className="text-cyan-400" /> Advanced Image Lab
        </h2>
        <p className="text-slate-400 mt-2">Generate ultra-high quality visuals with Gemini 3 Pro & Nano Banana</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6 bg-slate-900/50 p-6 rounded-xl border border-slate-700">
          <div className="space-y-4">
            <label className="block text-sm font-bold text-slate-300">Prompt</label>
            <textarea
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500"
              rows={4}
              placeholder="Describe the image you want to create or edit..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2 flex items-center gap-1">
                <Crop size={14} /> Aspect Ratio
              </label>
              <select 
                value={aspectRatio} 
                onChange={(e) => setAspectRatio(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
              >
                <option>1:1</option><option>2:3</option><option>3:2</option>
                <option>3:4</option><option>4:3</option><option>9:16</option>
                <option>16:9</option><option>21:9</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2 flex items-center gap-1">
                <Maximize size={14} /> Resolution
              </label>
              <select 
                value={imageSize} 
                onChange={(e) => setImageSize(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
              >
                <option>1K</option><option>2K</option><option>4K</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Wand2 size={20} />}
              Generate (3 Pro)
            </button>
            <div className="relative flex-1">
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="edit-upload" />
              <label 
                htmlFor="edit-upload"
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 cursor-pointer border border-slate-600"
              >
                <Upload size={20} />
                {baseImage ? "Change Base" : "Upload to Edit"}
              </label>
            </div>
          </div>

          {baseImage && (
             <button
              onClick={handleEdit}
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
             >
               {loading ? <Loader2 className="animate-spin" /> : <Wand2 size={20} />}
               Apply Edit (Nano Banana)
             </button>
          )}
        </div>

        <div className="bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center overflow-hidden min-h-[400px] relative">
          {resultImage ? (
            <>
              <img src={resultImage} alt="Generated" className="w-full h-full object-contain" />
              <a 
                href={resultImage} 
                download="cyberguard-gen.png"
                className="absolute bottom-4 right-4 bg-slate-900/80 p-2 rounded-full hover:bg-cyan-500 text-white transition-colors"
              >
                <Download size={20} />
              </a>
            </>
          ) : (
            <div className="text-center p-8">
              <ImageIcon size={64} className="text-slate-800 mx-auto mb-4" />
              <p className="text-slate-600">Generated images will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageLab;
