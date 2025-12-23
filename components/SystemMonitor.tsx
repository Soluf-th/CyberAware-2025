
import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  ShieldAlert, 
  Globe, 
  ScanLine, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Search,
  Wifi,
  FileKey,
  HardDrive,
  Siren,
  Eye,
  Info,
  Cpu,
  BarChart3,
  FileText,
  Zap,
  Lock,
  Unlock,
  FileWarning
} from 'lucide-react';
import { sendMessageToGemini } from '../services/geminiService';
import { ATTACK_TYPES } from '../constants';

const MOCK_ALERTS = [
  "RANSOMWARE BLOCKED: หยุดการเข้ารหัสไฟล์ในโฟลเดอร์ /Documents",
  "Decoy File Triggered: ตรวจพบความพยายามแก้ไขไฟล์ล่อ (Honeypot)",
  "ตรวจพบการสแกนพอร์ตจาก IP ไม่ทราบฝ่าย (Port Scan Detected)",
  "แจ้งเตือน: พบไฟล์นามสกุล .encrypted ผิดปกติ 50 ไฟล์",
  "บล็อกการเชื่อมต่อ Phishing Domain: secure-bank-login-update.com",
  "Threat Intel: พบ Signature ของ Ransomware สายพันธุ์ใหม่ 'LockBit 4.0'",
  "System: ทำการสำรองข้อมูลอัตโนมัติ (Shadow Copy Protection) สำเร็จ"
];

const MOCK_FILES = [
  "C:/Users/Admin/Documents/Financial_Report_2025.xlsx",
  "C:/Windows/System32/drivers/etc/hosts",
  "/var/www/html/index.php",
  "D:/Backups/database_dump.sql",
  "C:/Users/Admin/AppData/Local/Temp/suspicious_script.ps1",
  "E:/Projects/SourceCode/main.tsx",
  "C:/Windows/System32/kernel32.dll",
  "user_profile_data.json",
  "auth_tokens.db",
  "system_config.ini"
];

const SystemMonitor: React.FC = () => {
  const [blockedCount, setBlockedCount] = useState(14582);
  const [filesMonitored, setFilesMonitored] = useState(124050);
  const [activeThreats, setActiveThreats] = useState(1);
  const [alerts, setAlerts] = useState<string[]>(MOCK_ALERTS.slice(0, 4));
  
  // Behavioral Analysis State
  const [entropy, setEntropy] = useState(15);
  const [writeSpeed, setWriteSpeed] = useState(12); // MB/s
  const [currentFile, setCurrentFile] = useState(MOCK_FILES[0]);
  const [behaviorStatus, setBehaviorStatus] = useState<'NORMAL' | 'SUSPICIOUS' | 'CRITICAL'>('NORMAL');
  
  // Logic: > 80% entropy or > 100MB/s for > 5 seconds
  const [systemLockdown, setSystemLockdown] = useState(false);
  const consecutiveHighRiskSeconds = useRef(0);

  // Scanner State
  const [scanInput, setScanInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanMode, setScanMode] = useState<'GENERAL' | 'RANSOM_NOTE'>('GENERAL');
  const [scanResult, setScanResult] = useState<{safe: boolean; message: string; family?: string} | null>(null);

  // Simulation Effects
  useEffect(() => {
    const interval = setInterval(() => {
      // If system is locked down, stop simulating file activity (simulating blocked writes)
      if (systemLockdown) {
        setWriteSpeed(0);
        return;
      }

      // Increment basic stats
      setBlockedCount(prev => prev + (Math.random() > 0.7 ? 1 : 0));
      setFilesMonitored(prev => prev + Math.floor(Math.random() * 25));
      
      // Update Behavioral Metrics
      let newEntropy = Math.floor(Math.random() * 30) + 5; // Normal: 5-35%
      let newWriteSpeed = Math.floor(Math.random() * 50); // Normal: 0-50 MB/s

      // Randomly simulate a spike (Suspicious/Critical Activity) to test logic
      const randomChance = Math.random();
      if (randomChance > 0.90) {
         // Critical Spike
         newEntropy = Math.floor(Math.random() * 20) + 81; // 81-100% (High Entropy)
         newWriteSpeed = Math.floor(Math.random() * 200) + 101; // 101-300 MB/s (High Speed)
      } else if (randomChance > 0.8) {
         // Suspicious
         newEntropy = Math.floor(Math.random() * 20) + 60;
         newWriteSpeed = Math.floor(Math.random() * 50) + 50;
      }

      // --- ENHANCED DETECTION LOGIC ---
      const isHighEntropy = newEntropy > 80;
      const isHighSpeed = newWriteSpeed > 100;

      if (isHighEntropy || isHighSpeed) {
        consecutiveHighRiskSeconds.current += 1;
        
        // Visual Status update immediately
        setBehaviorStatus('CRITICAL');

        // Check if condition persists for > 5 seconds
        if (consecutiveHighRiskSeconds.current > 5) {
          setSystemLockdown(true);
          setAlerts(prev => [
            "CRITICAL ALERT: System Lockdown Initiated. Write operations blocked due to sustained high-entropy activity.",
            ...prev
          ].slice(0, 6));
          setActiveThreats(prev => prev + 1);
        }
      } else {
        // Reset counter if metrics return to normal
        if (consecutiveHighRiskSeconds.current > 0) {
          consecutiveHighRiskSeconds.current -= 1;
        }
        
        if (consecutiveHighRiskSeconds.current === 0) {
           // Only reset visual status if not locked down
           setBehaviorStatus(newEntropy > 60 ? 'SUSPICIOUS' : 'NORMAL');
        }
      }

      setEntropy(newEntropy);
      setWriteSpeed(newWriteSpeed);
      setCurrentFile(MOCK_FILES[Math.floor(Math.random() * MOCK_FILES.length)]);

    }, 1000);

    return () => clearInterval(interval);
  }, [systemLockdown]);

  const handleManualReset = () => {
    setSystemLockdown(false);
    consecutiveHighRiskSeconds.current = 0;
    setBehaviorStatus('NORMAL');
    setAlerts(prev => ["System: Lockdown override by user. Monitoring resumed.", ...prev]);
  };

  const handleScan = async () => {
    if (!scanInput.trim()) return;
    
    setIsScanning(true);
    setScanResult(null);

    try {
      let prompt = "";
      if (scanMode === 'RANSOM_NOTE') {
        prompt = `
          Analyze the following text specifically as a potential Ransomware Note.
          Text: "${scanInput}"
          
          Respond in JSON format:
          {
            "safe": boolean,
            "family": "String (Name of ransomware family if identifiable e.g., LockBit, WannaCry, Ryuk, or 'Unknown')",
            "message": "Thai analysis explaining why this is a ransom note and the urgency."
          }
        `;
      } else {
        prompt = `
          Act as a security scanner detecting Ransomware and Phishing.
          Analyze this text/URL: "${scanInput}"
          
          Respond in JSON format:
          {
            "safe": boolean,
            "message": "Short Thai description of the threat."
          }
        `;
      }
      
      const response = await sendMessageToGemini(prompt);
      // Fixed: sendMessageToGemini returns an object { text: string; groundingMetadata?: any }, 
      // so we must access the 'text' property before performing string operations.
      const cleanJson = response.text.replace(/```json|```/g, '').trim();
      
      try {
        const result = JSON.parse(cleanJson);
        setScanResult(result);
      } catch (e) {
        setScanResult({
          safe: false,
          message: "Parse Error: Unable to analyze structure, treat as hostile."
        });
      }
    } catch (error) {
      setScanResult({
        safe: false,
        message: "AI Connection Error."
      });
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <Activity className={systemLockdown ? "text-red-500 animate-pulse" : "text-green-500 animate-pulse"} />
            Live Threat Monitor
          </h2>
          <p className="text-slate-400">ศูนย์เฝ้าระวังภัยคุกคามและตรวจสอบความปลอดภัยแบบเรียลไทม์</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-colors duration-500 ${
          systemLockdown 
            ? 'bg-red-950/30 border-red-500 animate-pulse' 
            : 'bg-slate-800 border-slate-700'
        }`}>
          {systemLockdown ? (
             <>
               <Lock className="w-4 h-4 text-red-500" />
               <span className="text-sm font-mono text-red-400 font-bold">SYSTEM LOCKED DOWN</span>
             </>
          ) : (
             <>
               <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
               <span className="text-sm font-mono text-green-400">SYSTEM ONLINE</span>
             </>
          )}
        </div>
      </div>

      {/* Enhanced Behavioral Analysis Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Module 1: Shield Status */}
        <div className={`lg:col-span-1 border p-6 rounded-xl relative overflow-hidden flex flex-col justify-between transition-all duration-500 ${
           systemLockdown 
           ? 'bg-red-950/30 border-red-500 shadow-[0_0_50px_rgba(220,38,38,0.2)]' 
           : 'bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700'
        }`}>
           <div className="absolute top-0 right-0 p-4 opacity-5">
              <ShieldAlert size={120} />
           </div>
           <div>
             <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
               <ShieldAlert className={systemLockdown ? "text-red-500" : "text-cyber-accent"} /> 
               Ransomware Shield
             </h3>
             <div className="flex items-center gap-4 mb-6">
                <div className={`p-4 rounded-full border-4 transition-all duration-300 ${
                  systemLockdown ? 'border-red-500 bg-red-500 text-white scale-110' :
                  behaviorStatus === 'CRITICAL' ? 'border-red-500 bg-red-500/10 text-red-500 animate-pulse' : 
                  behaviorStatus === 'SUSPICIOUS' ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500' : 
                  'border-green-500 bg-green-500/10 text-green-500'
                }`}>
                  {systemLockdown ? <Lock size={32} /> : <FileKey size={32} />}
                </div>
                <div>
                   <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Protection Status</div>
                   <div className={`text-xl font-bold font-mono transition-colors duration-300 ${
                      systemLockdown ? 'text-red-500' :
                      behaviorStatus === 'CRITICAL' ? 'text-red-400' : 
                      behaviorStatus === 'SUSPICIOUS' ? 'text-yellow-500' : 
                      'text-green-500'
                   }`}>
                     {systemLockdown ? 'WRITE OPS BLOCKED' :
                      behaviorStatus === 'CRITICAL' ? 'THREAT DETECTED' : 
                      behaviorStatus === 'SUSPICIOUS' ? 'ANALYZING...' : 
                      'ACTIVE PROTECTION'}
                   </div>
                </div>
             </div>
           </div>
           
           {systemLockdown ? (
             <button 
               onClick={handleManualReset}
               className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2 rounded border border-red-400 animate-pulse flex items-center justify-center gap-2"
             >
               <Unlock size={16} /> OVERRIDE LOCKDOWN
             </button>
           ) : (
             <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Heuristics Engine</span>
                  <span className="text-green-400">Running</span>
                </div>
                <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                   <div className="bg-cyber-accent h-full w-[98%]"></div>
                </div>
             </div>
           )}
        </div>

        {/* Module 2: Real-time Behavioral Metrics */}
        <div className="lg:col-span-2 bg-slate-900/50 border border-slate-700 p-6 rounded-xl flex flex-col gap-6">
           <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                 <Cpu className="text-purple-500" /> Behavioral Analysis Engine
              </h3>
              <div className="flex gap-2">
                 {behaviorStatus === 'CRITICAL' && !systemLockdown && (
                   <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-[10px] font-mono border border-red-500/50 animate-pulse">
                     ANOMALY DETECTED
                   </span>
                 )}
                 <span className="px-2 py-1 bg-slate-800 rounded text-[10px] text-slate-400 font-mono border border-slate-700">
                   HEURISTIC_MODE: AGGRESSIVE
                 </span>
              </div>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* File Entropy Metric */}
              <div className={`p-4 rounded-lg border transition-colors duration-300 ${entropy > 80 ? 'bg-red-900/20 border-red-800' : 'bg-slate-950/50 border-slate-800'}`}>
                 <div className="flex justify-between items-end mb-2">
                    <span className="text-xs text-slate-400 font-mono">FILE ENTROPY</span>
                    <span className={`text-xl font-bold font-mono ${entropy > 80 ? 'text-red-500' : 'text-cyber-accent'}`}>
                      {entropy.toFixed(1)}%
                    </span>
                 </div>
                 <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${entropy > 80 ? 'bg-red-500' : 'bg-cyber-accent'}`}
                      style={{ width: `${entropy}%` }}
                    ></div>
                 </div>
                 <p className="text-[10px] text-slate-500 mt-2">
                   Threshold: {'>'}80%. High entropy indicates packed/encrypted data.
                 </p>
              </div>

              {/* Disk Write Speed Metric */}
              <div className={`p-4 rounded-lg border transition-colors duration-300 ${writeSpeed > 100 ? 'bg-red-900/20 border-red-800' : 'bg-slate-950/50 border-slate-800'}`}>
                 <div className="flex justify-between items-end mb-2">
                    <span className="text-xs text-slate-400 font-mono">DISK WRITE SPEED</span>
                    <span className={`text-xl font-bold font-mono ${writeSpeed > 100 ? 'text-red-500' : 'text-blue-400'}`}>
                      {writeSpeed} MB/s
                    </span>
                 </div>
                 <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${writeSpeed > 100 ? 'bg-red-500' : 'bg-blue-400'}`}
                      style={{ width: `${Math.min(100, (writeSpeed / 200) * 100)}%` }}
                    ></div>
                 </div>
                 <p className="text-[10px] text-slate-500 mt-2">
                    Threshold: {'>'}100MB/s. Rapid modification trigger.
                 </p>
              </div>
           </div>

           {/* Live File Watcher */}
           <div className={`p-3 rounded border font-mono text-xs flex items-center gap-3 overflow-hidden ${
             systemLockdown ? 'bg-red-950 border-red-900' : 'bg-slate-950 border-slate-800'
           }`}>
              <span className={`shrink-0 font-bold ${systemLockdown ? 'text-red-500' : 'text-green-500'}`}>
                {systemLockdown ? 'BLOCKED:' : 'SCANNING:'}
              </span>
              <span className={`truncate ${systemLockdown ? 'text-red-300 line-through' : 'text-slate-300'}`}>
                {currentFile}
              </span>
              <span className="text-slate-500 ml-auto shrink-0">{new Date().toLocaleTimeString()}</span>
           </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="bg-slate-900/50 border border-slate-700 p-6 rounded-xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Globe size={64} className="text-blue-500" />
          </div>
          <h3 className="text-slate-400 text-sm font-mono mb-2">GLOBAL THREAT LEVEL</h3>
          <div className="text-4xl font-bold text-yellow-500 font-mono tracking-wider">
            ELEVATED
          </div>
          <div className="w-full bg-slate-700 h-1 mt-4 rounded-full overflow-hidden">
            <div className="bg-yellow-500 h-full w-[65%] animate-pulse-slow"></div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-slate-900/50 border border-slate-700 p-6 rounded-xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Wifi size={64} className="text-purple-500" />
          </div>
          <h3 className="text-slate-400 text-sm font-mono mb-2">NETWORK TRAFFIC</h3>
          <div className="text-4xl font-bold text-cyan-400 font-mono tracking-wider">
            SECURE
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Firewall Active • IPS Enabled
          </p>
        </div>

         {/* Card 3 */}
         <div className="bg-slate-900/50 border border-slate-700 p-6 rounded-xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Siren size={64} className="text-red-500" />
          </div>
          <h3 className="text-slate-400 text-sm font-mono mb-2">ACTIVE INCIDENTS</h3>
          <div className="text-4xl font-bold text-red-400 font-mono tracking-wider">
            {activeThreats}
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Investigation in progress...
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Alerts Feed */}
        <div className="lg:col-span-1 bg-slate-900/80 border border-slate-800 rounded-xl p-6 h-full flex flex-col">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <AlertTriangle size={20} className="text-yellow-500" />
            Security Alerts Feed
          </h3>
          <div className="flex-1 space-y-3 overflow-hidden">
            {alerts.map((alert, index) => (
              <div key={index} className="p-3 bg-slate-800/50 border-l-2 border-red-500 rounded text-sm text-slate-300 animate-fade-in hover:bg-slate-800 transition-colors">
                <span className="text-xs text-slate-500 block mb-1 font-mono flex justify-between">
                  {new Date().toLocaleTimeString()}
                  <span className="text-red-400 font-bold">CRITICAL</span>
                </span>
                {alert}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: AI Scanner */}
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 border border-cyan-900/30 rounded-xl p-8 shadow-2xl shadow-cyan-900/10">
          <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <ScanLine className="text-cyber-accent" /> AI Threat Scanner
              </h3>
              <p className="text-slate-400 mt-1">
                Advanced text analysis for Ransomware notes and Phishing indicators.
              </p>
            </div>
            {/* Scanner Mode Toggle */}
            <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-700">
               <button 
                 onClick={() => setScanMode('GENERAL')}
                 className={`px-4 py-2 rounded text-sm font-bold transition-all ${scanMode === 'GENERAL' ? 'bg-slate-700 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
               >
                 General Scan
               </button>
               <button 
                 onClick={() => setScanMode('RANSOM_NOTE')}
                 className={`px-4 py-2 rounded text-sm font-bold transition-all flex items-center gap-2 ${scanMode === 'RANSOM_NOTE' ? 'bg-red-500/20 text-red-400 border border-red-500/50 shadow' : 'text-slate-500 hover:text-slate-300'}`}
               >
                 <FileWarning size={14} />
                 Ransom Note Analyzer
               </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="text-slate-500" />
              </div>
              <textarea
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                placeholder={scanMode === 'RANSOM_NOTE' ? 'วางข้อความจากไฟล์เรียกค่าไถ่ที่นี่ (e.g., "YOUR FILES ARE ENCRYPTED...")' : 'วางข้อความเรียกค่าไถ่, ชื่อไฟล์แปลกๆ หรือ URL ที่นี่...'}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg py-4 pl-12 pr-4 focus:ring-2 focus:ring-cyber-accent focus:border-transparent transition-all font-mono placeholder-slate-600 min-h-[100px]"
              />
            </div>
            
            <button
              onClick={handleScan}
              disabled={isScanning || !scanInput}
              className={`w-full py-3 rounded-lg font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                isScanning 
                  ? 'bg-slate-700 cursor-not-allowed text-slate-400' 
                  : scanMode === 'RANSOM_NOTE' 
                    ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/20'
                    : 'bg-cyber-accent hover:bg-cyan-400 text-slate-900 hover:shadow-lg hover:shadow-cyan-500/20'
              }`}
            >
              {isScanning ? (
                <>Processing...</>
              ) : (
                <>
                  {scanMode === 'RANSOM_NOTE' ? 'IDENTIFY RANSOMWARE FAMILY' : 'SCAN ARTIFACTS'} 
                  <ScanLine size={20} />
                </>
              )}
            </button>
          </div>

          {/* Results Area */}
          {scanResult && (
            <div className={`mt-6 p-6 rounded-xl border animate-fade-in ${
              scanResult.safe 
                ? 'bg-green-500/10 border-green-500/30' 
                : 'bg-red-500/10 border-red-500/30'
            }`}>
              <div className="flex items-start gap-4">
                {scanResult.safe ? (
                  <CheckCircle className="w-8 h-8 text-green-500 flex-shrink-0" />
                ) : (
                  <XCircle className="w-8 h-8 text-red-500 flex-shrink-0" />
                )}
                <div>
                  <h4 className={`text-lg font-bold mb-1 ${
                    scanResult.safe ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {scanResult.safe ? 'Analysis: Low Risk' : 'Analysis: High Threat Detected'}
                  </h4>
                  {scanResult.family && (
                    <div className="inline-block px-2 py-1 bg-red-900/50 border border-red-700 rounded text-xs text-red-200 mb-2 font-mono">
                      VARIANT IDENTIFIED: {scanResult.family}
                    </div>
                  )}
                  <p className="text-slate-200">
                    {scanResult.message}
                  </p>
                  <div className="mt-3 text-xs text-slate-500 font-mono">
                    Analysis provided by CyberGuard AI. Always isolate infected systems immediately.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

       {/* Active Monitoring Definitions */}
       <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Eye size={24} className="text-cyan-400" /> Active Monitoring Rules
        </h3>
        <p className="text-slate-400 text-sm mb-6">
           ระบบกำลังตรวจสอบพฤติกรรมที่เข้าข่ายภัยคุกคามดังต่อไปนี้ (Signature-based Detection):
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ATTACK_TYPES.map((type, index) => (
             <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-800/80 transition-colors border border-transparent hover:border-slate-700">
                <div className="mt-1">
                   <type.icon size={20} className={type.color} />
                </div>
                <div>
                   <h4 className="font-bold text-slate-200 text-sm">{type.title}</h4>
                   <p className="text-xs text-slate-500 mt-1 line-clamp-2">{type.description}</p>
                </div>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SystemMonitor;
