# CyberAware 2025: Advanced Cyber Defense Platform

CyberAware 2025 is an interactive educational platform designed to showcase modern cybersecurity threats and defense mechanisms using cutting-edge AI technologies. The platform provides a suite of hands-on labs for analyzing malware, simulating defense systems, and exploring secure authentication architectures.

## 🚀 Features

### 1. CyberGuard AI Assistant
*   **Powered by Gemini 3 Pro**: A multimodal chat interface capable of analyzing text, images, and video.
*   **Google Search Grounding**: Real-time information retrieval for the latest 2025 threat intelligence.
*   **Thinking Mode**: Advanced reasoning for complex cybersecurity scenarios.

### 2. Advanced Image & Video Labs
*   **Image Lab**: Generate high-fidelity (1K/2K/4K) cybersecurity visualizations using `gemini-3-pro-image-preview`.
*   **Veo Animation Studio**: Cinematic video generation for training simulations using `veo-3.1-fast-generate-preview`.

### 3. Live AI Voice Consultation
*   **Real-time Interaction**: Low-latency voice calls with an AI cybersecurity expert using `gemini-2.5-flash-native-audio-preview`.
*   **Full Transcription**: Automated logs of both user and model speech.

### 4. Real-time Threat Monitor
*   **Heuristics Engine**: Live simulation of disk activity, entropy analysis, and automated system lockdown protocols.
*   **AI Threat Scanner**: Specialized tool for identifying ransomware families from ransom notes or suspicious artifacts.

### 5. Secure Auth Lab
*   **Embedded Wallets SDK**: A technical guide on integrating MetaMask's programmatic wallet services into backend applications.
*   **Stateless Security**: Highlights for custom JWT and Firebase authentication patterns.

## 🛠️ Technology Stack

*   **Frontend**: React (v19), Tailwind CSS, Lucide Icons.
*   **AI Engine**: Google Gemini API via `@google/genai` SDK.
*   **Models Used**:
    *   `gemini-3-pro-preview` (Reasoning & Analysis)
    *   `gemini-3-pro-image-preview` (High-quality visuals)
    *   `veo-3.1-fast-generate-preview` (Video generation)
    *   `gemini-2.5-flash-native-audio-preview-09-2025` (Voice API)

## ⚙️ Setup & Requirements

1.  **API Key**: You must have a valid API Key from [Google AI Studio](https://aistudio.google.com/).
2.  **Environment Variable**: The application expects the key to be available via `process.env.API_KEY`.
3.  **Permissions**:
    *   **Microphone**: Required for the Live Voice Lab.
    *   **Camera**: Optional for multimodal chat uploads.

## 📁 Project Structure

*   `App.tsx`: Central navigation and layout controller.
*   `components/`: Individual lab modules (CyberChat, SystemMonitor, ImageLab, etc.).
*   `services/geminiService.ts`: Core logic for API initialization and model calls.
*   `constants.tsx`: Educational content regarding cyber attack types (Phishing, Malware, etc.).
*   `types.ts`: TypeScript interfaces for the platform's data structures.

## 🛡️ Security Disclaimer
This application is for **educational purposes only**. The simulations and scanners are intended to demonstrate concepts. Always follow official security guidelines and consult with certified professionals for real-world production environments.
