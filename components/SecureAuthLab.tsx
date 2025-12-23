
import React, { useState } from 'react';
import { 
  Key, 
  Terminal as TerminalIcon, 
  ShieldCheck, 
  Cpu, 
  Layers, 
  Globe, 
  Code, 
  Info,
  ChevronRight,
  Copy,
  Check
} from 'lucide-react';

const CodeBlock: React.FC<{ code: string }> = ({ code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group bg-slate-950 rounded-xl border border-slate-800 overflow-hidden font-mono text-sm my-4">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800">
        <span className="text-slate-500 text-xs">Node.js (Backend)</span>
        <button 
          onClick={handleCopy}
          className="text-slate-500 hover:text-cyan-400 transition-colors"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
      <pre className="p-4 text-slate-300 overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  );
};

const SecureAuthLab: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'SETUP' | 'INIT' | 'AUTH' | 'FIREBASE'>('SETUP');

  const tabs = [
    { id: 'SETUP', label: '1. Setup SDK' },
    { id: 'INIT', label: '2. Initialization' },
    { id: 'AUTH', label: '3. Custom JWT' },
    { id: 'FIREBASE', label: '4. Firebase' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="flex-1 space-y-4">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono">
            DEV LAB: EMBEDDED WALLETS
          </div>
          <h2 className="text-4xl font-bold text-white flex items-center gap-3">
            <Key className="text-cyan-400" /> Secure Auth Architecture
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            MetaMask Embedded Wallets SDK for Node.js enables seamless integration of 
            <span className="text-cyan-400"> Web3 authentication</span> into backend applications and AI agents 
            without the need for complex key management.
          </p>
        </div>
        <div className="w-full md:w-auto grid grid-cols-2 gap-4 shrink-0">
          <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-center">
            <div className="text-2xl font-bold text-white">18+</div>
            <div className="text-xs text-slate-500 uppercase tracking-tighter">Node.js version</div>
          </div>
          <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-center">
            <ShieldCheck className="mx-auto text-green-500 mb-1" size={20} />
            <div className="text-xs text-slate-500 uppercase tracking-tighter">Stateless</div>
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 hover:border-cyan-500/30 transition-all group">
          <div className="p-3 bg-slate-950 rounded-lg text-cyan-400 w-fit mb-4 group-hover:scale-110 transition-transform">
            <Layers size={24} />
          </div>
          <h4 className="text-white font-bold mb-2">Stateless Design</h4>
          <p className="text-sm text-slate-400">No session management required. Ideal for stateless backend AI agents and programmatic blockchain interactions.</p>
        </div>
        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 hover:border-cyan-500/30 transition-all group">
          <div className="p-3 bg-slate-950 rounded-lg text-purple-400 w-fit mb-4 group-hover:scale-110 transition-transform">
            <Globe size={24} />
          </div>
          <h4 className="text-white font-bold mb-2">Multi-Chain</h4>
          <p className="text-sm text-slate-400">Support for EVM chains, Solana, and more. Direct access to private keys for any integrated blockchain.</p>
        </div>
        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 hover:border-cyan-500/30 transition-all group">
          <div className="p-3 bg-slate-950 rounded-lg text-yellow-400 w-fit mb-4 group-hover:scale-110 transition-transform">
            <Cpu size={24} />
          </div>
          <h4 className="text-white font-bold mb-2">Programmatic Auth</h4>
          <p className="text-sm text-slate-400">Custodial wallet services without recovery worries, using custom JWT or Firebase for secure identity.</p>
        </div>
      </div>

      {/* Main Documentation Section */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="flex border-b border-slate-800 bg-slate-900/60 p-2 overflow-x-auto no-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 rounded-xl text-sm font-mono transition-all whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-cyan-600 text-white shadow-lg' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-8">
          {activeTab === 'SETUP' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-lg">
                <TerminalIcon size={20} /> Installation
              </div>
              <p className="text-slate-300">Start by installing the core Web3Auth Node SDK in your backend project environment:</p>
              <div className="bg-black p-4 rounded-xl border border-slate-800 font-mono text-cyan-400 flex items-center justify-between group">
                <span>npm install --save @web3auth/node-sdk</span>
                <button className="text-slate-500 group-hover:text-cyan-400"><Copy size={16}/></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700">
                  <h5 className="text-white font-bold flex items-center gap-2 mb-2">
                    <Info size={16} className="text-cyan-400" /> Pre-requisites
                  </h5>
                  <ul className="text-sm text-slate-400 space-y-2 list-disc pl-5">
                    <li>Node.js 18+ installed</li>
                    <li>Web3Auth Dashboard project</li>
                    <li>Custom Auth Connection setup</li>
                  </ul>
                </div>
                <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700">
                  <h5 className="text-white font-bold flex items-center gap-2 mb-2">
                    <ShieldCheck size={16} className="text-green-400" /> Security Tip
                  </h5>
                  <p className="text-sm text-slate-400">Never expose your Client ID or Private Keys in the frontend. This SDK is exclusively for <span className="text-slate-200">server-side</span> execution.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'INIT' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-lg">
                <Code size={20} /> SDK Initialization
              </div>
              <p className="text-slate-300">Create a Web3Auth instance and initialize it during your application startup phase:</p>
              <CodeBlock code={`const { Web3Auth } = require('@web3auth/node-sdk');

const web3auth = new Web3Auth({
  clientId: 'YOUR_WEB3AUTH_CLIENT_ID', 
  web3AuthNetwork: 'sapphire_mainnet', // or 'sapphire_devnet'
});

// Initialize the instance
await web3auth.init();`} />
              <div className="p-4 bg-blue-900/20 border border-blue-800 rounded-xl text-blue-200 text-sm">
                <strong>Note:</strong> Chain information is optional. If not provided, the first chain in the Web3Auth Dashboard list will be used as default.
              </div>
            </div>
          )}

          {activeTab === 'AUTH' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center gap-2 text-green-400 font-bold text-lg">
                <ShieldCheck size={20} /> Custom JWT Authentication
              </div>
              <p className="text-slate-300">Generate a JWT token in your system and use it to connect and retrieve the user's secure wallet result:</p>
              <CodeBlock code={`// Dashboard Registration & Auth Connection
const authConnectionId = 'w3a-node-demo';

// Sign your JWT token (Example using jsonwebtoken)
var idToken = jwt.sign({
  sub: 'user-id-uuid',
  name: 'CyberGuard User',
  aud: 'urn:api-web3auth-io',
  iss: 'https://yourdomain.com',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 3600,
}, privateKey, { algorithm: 'RS256' });

// Authenticate
const result = await web3auth.connect({
  authConnectionId,
  idToken,
});

// Use the provider/signer
console.log('User Public Key:', result.provider.address);`} />
            </div>
          )}

          {activeTab === 'FIREBASE' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center gap-2 text-orange-400 font-bold text-lg">
                <Layers size={20} /> Firebase Integration
              </div>
              <p className="text-slate-300">For apps using Firebase Auth, you can bridge the session to a Web3 wallet effortlessly:</p>
              <CodeBlock code={`const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

// 1. Sign in with Firebase
const auth = getAuth(app);
const res = await signInWithEmailAndPassword(auth, email, password);
const idToken = await res.user.getIdToken(true);

// 2. Connect to Web3Auth
const result = await web3auth.connect({
  authConnectionId: 'w3a-firebase-demo',
  idToken,
});

console.log('Secure Wallet Provider Initialized');`} />
            </div>
          )}
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-slate-900 to-cyan-900/30 p-8 rounded-3xl border border-slate-700 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h4 className="text-white text-xl font-bold mb-2">Ready to secure your backend?</h4>
          <p className="text-slate-400">Explore the full documentation on MetaMask's official embedded wallets guide.</p>
        </div>
        <a 
          href="https://docs.metamask.io/embedded-wallets/authentication/custom-connections/custom-jwt/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-all shadow-lg flex items-center gap-2"
        >
          View Full Docs <ChevronRight size={18} />
        </a>
      </div>
    </div>
  );
};

export default SecureAuthLab;
