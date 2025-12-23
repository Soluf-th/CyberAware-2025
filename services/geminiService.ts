
import { GoogleGenAI, Chat, Modality } from "@google/genai";

const SYSTEM_INSTRUCTION = `
You are "CyberGuard AI", an expert cybersecurity consultant. 
Your goal is to educate users about cyber threats, prevention, and safety in the digital world.
The user is viewing a website about Cyber Attacks (Phishing, Malware, Ransomware, DDoS, etc.) based on 2025 trends.
Answer questions in Thai language.
Format important keywords in bold.
`;

export const getAIInstance = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const ensureApiKey = async () => {
  if (typeof window !== 'undefined' && window.aistudio) {
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await window.aistudio.openSelectKey();
    }
  }
};

export const sendMessageToGemini = async (
  message: string, 
  attachments: { data: string; mimeType: string }[] = [],
  useGrounding: boolean = false
): Promise<{ text: string; groundingMetadata?: any }> => {
  try {
    const ai = getAIInstance();
    const model = 'gemini-3-pro-preview';
    
    const parts: any[] = [{ text: message }];
    attachments.forEach(att => {
      parts.push({
        inlineData: {
          data: att.data.split(',')[1] || att.data,
          mimeType: att.mimeType
        }
      });
    });

    const config: any = {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.7,
    };

    if (useGrounding) {
      config.tools = [{ googleSearch: {} }];
    }

    const response = await ai.models.generateContent({
      model,
      contents: { parts },
      config
    });

    return {
      text: response.text || "ขออภัย ระบบไม่สามารถประมวลผลคำตอบได้ในขณะนี้",
      groundingMetadata: response.candidates?.[0]?.groundingMetadata
    };
  } catch (error) {
    console.error("Gemini Error:", error);
    return { text: "เกิดข้อผิดพลาดในการเชื่อมต่อกับ CyberGuard AI" };
  }
};

export const generateImage = async (prompt: string, config: { aspectRatio: string; imageSize: string }) => {
  const ai = getAIInstance();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: { parts: [{ text: prompt }] },
    config: {
      imageConfig: {
        aspectRatio: config.aspectRatio,
        imageSize: config.imageSize
      }
    }
  });

  const part = response.candidates?.[0].content.parts.find(p => p.inlineData);
  if (part?.inlineData) {
    return `data:image/png;base64,${part.inlineData.data}`;
  }
  throw new Error("No image generated");
};

export const editImage = async (base64Image: string, mimeType: string, prompt: string) => {
  const ai = getAIInstance();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data: base64Image.split(',')[1], mimeType } },
        { text: prompt }
      ]
    }
  });

  const part = response.candidates?.[0].content.parts.find(p => p.inlineData);
  if (part?.inlineData) {
    return `data:image/png;base64,${part.inlineData.data}`;
  }
  return response.text;
};

export const generateVideo = async (prompt: string, imageBase64?: string, aspectRatio: '16:9' | '9:16' = '16:9') => {
  const ai = getAIInstance();
  const payload: any = {
    model: 'veo-3.1-fast-generate-preview',
    prompt,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio
    }
  };

  if (imageBase64) {
    payload.image = {
      imageBytes: imageBase64.split(',')[1],
      mimeType: 'image/png'
    };
  }

  let operation = await ai.models.generateVideos(payload);
  
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  return `${downloadLink}&key=${process.env.API_KEY}`;
};
