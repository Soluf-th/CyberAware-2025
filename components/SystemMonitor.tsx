
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
  FileWarning,
  X,
  Clock,
  Loader2
} from 'lucide-react';
import { sendMessageToGemini } from '../services/geminiService';
import { ATTACK_TYPES } from '../constants';

interface AlertItem {
  id: string;
  message: string;
  timestamp: Date;
  count: number;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
}

const MOCK_ALERTS_MESSAGES = [
  { text: "RANSOMWARE BLOCKED: หยุดการเข้ารหัสไฟล์ในโฟลเดอร์ /Documents", severity: 'CRITICAL' },
  { text: "Decoy File Triggered: ตรวจพบความพยายามแก้ไขไฟล์ล่อ (Honeypot)", severity: 'CRITICAL' },
  { text: "ตรวจพบการสแกนพอร์ตจาก IP ไม่ทราบฝ่าย (Port Scan Detected)", severity: 'WARNING' },
  { text: "แจ้งเตือน: พบไฟล์นามสกุล .encrypted ผิดปกติ 50 ไฟล์", severity: 'CRITICAL' },
  { text: "บล็อกการเชื่อมต่อ Phishing Domain: secure-bank-login-update.com", severity: 'WARNING' },
  { text: "Threat Intel: พบ Signature ของ Ransomware สายพันธุ์ใหม่ 'LockBit 4.0'", severity: 'INFO' },
  { text: "System: ทำการสำรองข้อมูลอัตโนมัติ (Shadow Copy Protection) สำเร็จ", severity: 'INFO' }
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
  
  // Refined Alert State
  const [alerts, setAlerts] = useState<AlertItem[]>(
    MOCK_ALERTS_MESSAGES.slice(0, 4).map((m, i) => ({
      id: `initial-${i}`,
      message: m.text,
      timestamp: new Date(Date.now() - i * 60000),
      count: 1,
      severity: m.severity as any
    }))
  );
  
  // Behavioral Analysis State
  const [entropy, setEntropy] = useState(15);
  const [writeSpeed, setWriteSpeed] = useState(12); // MB/s
  const [currentFile, setCurrentFile] = useState(MOCK_FILES[0]);
  const [behaviorStatus, setBehaviorStatus] = useState<'NORMAL' | 'SUSPICIOUS' | 'CRITICAL'>('NORMAL');
  
  const [systemLockdown, setSystemLockdown] = useState(false);
  const consecutiveHighRiskSeconds = useRef(0);

  // Scanner State
  const [scanInput, setScanInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanMode, setScanMode] = useState<'GENERAL' | 'RANSOM_NOTE'>('GENERAL');
  const [scanResult, setScanResult] = useState<{safe: boolean; message: string; family?: string} | null>(null);

  const addAlert = (message: string, severity: 'CRITICAL' | 'WARNING' | 'INFO' = 'INFO') => {
    setAlerts(prev => {
      const existingIdx = prev.findIndex(a => a.message === message);
      if (existingIdx !== -1) {
        const newAlerts = [...prev];
        newAlerts[existingIdx] = {
          ...newAlerts[existingIdx],
          count: newAlerts[existingIdx].count + 1,
          timestamp: new Date()
        };
        // Move to top
        const item = newAlerts.splice(existingIdx, 1)[0];
        return [item, ...newAlerts];
      }
      const newAlert: AlertItem = {
        id: Math.random().toString(36).substr(2, 9),
        message,
        timestamp: new Date(),
        count: 1,
        severity
      };
      return [newAlert, ...prev].slice(0, 15); // Keep last 15 unique alerts
    });
  };

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  // Simulation Effects
  useEffect(() => {
    const interval = setInterval(() => {
      if (systemLockdown) {
        setWriteSpeed(0);
        return;
      }

      setBlockedCount(prev => prev + (Math.random() > 0.7 ? 1 : 0));
      setFilesMonitored(prev => prev + Math.floor(Math.random() * 25));
      
      let newEntropy = Math.floor(Math.random() * 30) + 5;
      let newWriteSpeed = Math.floor(Math.random() * 50);

      const randomChance = Math.random();
      if (randomChance > 0.95) {
         newEntropy = Math.floor(Math.random() * 20) + 81;
         newWriteSpeed = Math.floor(Math.random() * 200) + 101;
         addAlert("Suspicious high-entropy file write detected.", "WARNING");
      }

      const isHighEntropy = newEntropy > 80;
      const isHighSpeed = newWriteSpeed > 100;

      if (isHighEntropy || isHighSpeed) {
        consecutiveHighRiskSeconds.current += 1;
        setBehaviorStatus('CRITICAL');

        if (consecutiveHighRiskSeconds.current > 5) {
          setSystemLockdown(true);
          addAlert("CRITICAL: System Lockdown Initiated. Sustained hostile behavior.", "CRITICAL");
          setActiveThreats(prev => prev + 1);
        }
      } else {
        if (consecutiveHighRiskSeconds.current > 0) {
          consecutiveHighRiskSeconds.current -= 1;
        }
        if (consecutiveHighRiskSeconds.current === 0) {
           setBehaviorStatus(newEntropy > 60 ? 'SUSPICIOUS' : 'NORMAL');
        }
      }

      setEntropy(newEntropy);
      setWriteSpeed(newWriteSpeed);
      setCurrentFile(MOCK_FILES[Math.floor(Math.random() * MOCK_FILES.length)]);

      // Occasionally add a random mock alert
      if (Math.random() > 0.98) {
        const mock = MOCK_ALERTS_MESSAGES[Math.floor(Math.random() * MOCK_ALERTS_MESSAGES.length)];
        addAlert(mock.text, mock.severity as any);
      }

    }, 1000);

    return () => clearInterval(interval);
  }, [systemLockdown]);

  const handleManualReset = () => {
    setSystemLockdown(false);
    consecutiveHighRiskSeconds.current = 0;
    setBehaviorStatus('NORMAL');
    addAlert("System: Lockdown override by user. Monitoring resumed.", "INFO");
  };

  const handleScan = async () => {
    if (!scanInput.trim()) return;
    setIsScanning(true);
    setScanResult(null);
    try {
      let prompt = "";
      if (scanMode === 'RANSOM_NOTE') {
        prompt = `Analyze the following text as a potential Ransomware Note: "${scanInput}". Respond in JSON: {"safe": boolean, "family": "string", "message": "Thai explanation"}`;
      } else {
        prompt = `Detect Ransomware/Phishing in this text: "${scanInput}". Respond in JSON: {"safe": boolean, "message": "Short Thai description"}`;
      }
      const response = await sendMessageToGemini(prompt);
      const cleanJson = response.text.replace(/```json|```/g, '').trim();
      const result = JSON.parse(cleanJson);
      setScanResult(result);
    } catch (error) {
      setScanResult({ safe: false, message: "AI Connection Error." });
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <Activity className={systemLockdown ? "text-red-500 animate-pulse" : "text-green-500 animate-pulse"} />
            Live Threat Monitor
          </h2>
          <p className="text-slate-400">ศูนย์เฝ้าระวังภัยคุกคามและตรวจสอบความปลอดภัยแบบเรียลไทม์</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-500 ${
          systemLockdown 
            ? 'bg-red-950/30 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' 
            : 'bg-slate-800 border-slate-700 shadow-lg shadow-black/20'
        }`}>
          {systemLockdown ? (
             <>
               <Lock className="w-4 h-4 text-red-500 animate-bounce" />
               <span className="text-sm font-mono text-red-400 font-bold uppercase tracking-widest">System Lockdown</span>
             </>
          ) : (
             <>
               <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
               <span className="text-sm font-mono text-green-400 uppercase tracking-widest">Active Monitoring</span>
             </>
          )}
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-1 border p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between transition-all duration-500 ${
           systemLockdown 
           ? 'bg-red-950/30 border-red-500 shadow-[0_0_50px_rgba(220,38,38,0.2)]' 
           : 'bg-slate-900 border-slate-700 shadow-xl'
        }`}>
           <div className="absolute top-0 right-0 p-4 opacity-5">
              <ShieldAlert size={120} />
           </div>
           <div>
             <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
               <ShieldAlert className={systemLockdown ? "text-red-500" : "text-cyan-400"} /> 
               Behavioral Shield
             </h3>
             <div className="flex items-center gap-4 mb-6">
                <div className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                  systemLockdown ? 'border-red-500 bg-red-500/20 text-red-500 scale-105' :
                  behaviorStatus === 'CRITICAL' ? 'border-red-500 bg-red-500/10 text-red-500 animate-pulse' : 
                  behaviorStatus === 'SUSPICIOUS' ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500' : 
                  'border-green-500 bg-green-500/10 text-green-500'
                }`}>
                  {systemLockdown ? <Lock size={32} /> : <FileKey size={32} />}
                </div>
                <div>
                   <div className="text-[10px] text-slate-500 uppercase font-mono tracking-widest mb-1">State</div>
                   <div className={`text-xl font-bold font-mono transition-colors duration-300 ${
                      systemLockdown ? 'text-red-500' :
                      behaviorStatus === 'CRITICAL' ? 'text-red-400' : 
                      behaviorStatus === 'SUSPICIOUS' ? 'text-yellow-500' : 
                      'text-green-500'
                   }`}>
                     {systemLockdown ? 'BLOCKED' :
                      behaviorStatus === 'CRITICAL' ? 'ATTACK!' : 
                      behaviorStatus === 'SUSPICIOUS' ? 'WARNING' : 
                      'STABLE'}
                   </div>
                </div>
             </div>
           </div>
           
           {systemLockdown ? (
             <button 
               onClick={handleManualReset}
               className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl border border-red-400 transition-all active:scale-95 flex items-center justify-center gap-2"
             >
               <Unlock size={18} /> OVERRIDE LOCKDOWN
             </button>
           ) : (
             <div className="space-y-3">
                <div className="flex justify-between text-[10px] text-slate-500 font-mono uppercase">
                  <span>Heuristics Engine</span>
                  <span className="text-green-400">Normal</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                   <div className="bg-cyan-500 h-full w-[98%] transition-all duration-1000"></div>
                </div>
             </div>
           )}
        </div>

        <div className="lg:col-span-2 bg-slate-900 border border-slate-700 p-6 rounded-2xl shadow-xl space-y-6">
           <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                 <Cpu className="text-purple-500" /> Entropy & Disk Activity
              </h3>
              <div className="flex gap-2">
                 <span className="px-2 py-1 bg-slate-800 rounded text-[10px] text-slate-500 font-mono border border-slate-700">
                   REAL-TIME ANALYTICS
                 </span>
              </div>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`p-4 rounded-xl border transition-all duration-300 ${entropy > 80 ? 'bg-red-950/20 border-red-800/50' : 'bg-slate-950 border-slate-800'}`}>
                 <div className="flex justify-between items-end mb-2">
                    <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">File Entropy</span>
                    <span className={`text-xl font-bold font-mono ${entropy > 80 ? 'text-red-500' : 'text-cyan-400'}`}>
                      {entropy.toFixed(1)}%
                    </span>
                 </div>
                 <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${entropy > 80 ? 'bg-red-500' : 'bg-cyan-500'}`}
                      style={{ width: `${entropy}%` }}
                    ></div>
                 </div>
              </div>

              <div className={`p-4 rounded-xl border transition-all duration-300 ${writeSpeed > 100 ? 'bg-red-950/20 border-red-800/50' : 'bg-slate-950 border-slate-800'}`}>
                 <div className="flex justify-between items-end mb-2">
                    <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Disk I/O Write</span>
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
              </div>
           </div>

           <div className={`p-3 rounded-lg border font-mono text-xs flex items-center gap-3 overflow-hidden transition-colors ${
             systemLockdown ? 'bg-red-950/50 border-red-900/50' : 'bg-slate-950 border-slate-800'
           }`}>
              <div className={`shrink-0 flex items-center gap-1.5 font-bold uppercase tracking-tighter ${systemLockdown ? 'text-red-500' : 'text-green-500'}`}>
                {systemLockdown ? <Lock size={12}/> : <CheckCircle size={12}/>}
                {systemLockdown ? 'BLOCKED' : 'MONITORING'}
              </div>
              <span className={`truncate ${systemLockdown ? 'text-red-300/50 italic' : 'text-slate-400'}`}>
                {currentFile}
              </span>
              <span className="text-slate-600 ml-auto shrink-0 flex items-center gap-1">
                <Clock size={12}/> {new Date().toLocaleTimeString()}
              </span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Refined Alerts Feed */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl flex flex-col h-[600px] overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
            <h3 className="text-sm font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <AlertTriangle size={16} className="text-yellow-500" />
              Intelligence Feed
            </h3>
            <span className="text-[10px] bg-slate-800 text-slate-500 px-2 py-0.5 rounded font-mono">
              {alerts.length} ACTIVE
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {alerts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-20 p-8 text-center space-y-4">
                <ShieldAlert size={48} />
                <p className="text-sm">No active alerts. System is clear.</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className={`relative p-4 rounded-xl border transition-all animate-fade-in group ${
                    alert.severity === 'CRITICAL' ? 'bg-red-500/5 border-red-500/20 hover:border-red-500/50' :
                    alert.severity === 'WARNING' ? 'bg-yellow-500/5 border-yellow-500/20 hover:border-yellow-500/50' :
                    'bg-blue-500/5 border-blue-500/20 hover:border-blue-500/50'
                  }`}
                >
                  <button 
                    onClick={() => dismissAlert(alert.id)}
                    className="absolute top-2 right-2 p-1 text-slate-600 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                  
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-widest ${
                      alert.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400' :
                      alert.severity === 'WARNING' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {alert.severity}
                    </span>
                    <span className="text-[10px] text-slate-600 font-mono">
                      {alert.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                  
                  <p className="text-xs text-slate-300 leading-relaxed pr-4">
                    {alert.message}
                  </p>
                  
                  {alert.count > 1 && (
                    <div className="mt-2 flex items-center gap-1.5">
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                        OCCURRED {alert.count}x
                      </span>
                      <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse" />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
          
          <div className="p-4 bg-slate-900/80 border-t border-slate-800">
             <button 
               onClick={() => setAlerts([])}
               className="w-full py-2 rounded-lg text-xs font-mono text-slate-500 hover:text-white hover:bg-slate-800 transition-all border border-transparent hover:border-slate-700"
             >
               CLEAR ALL LOGS
             </button>
          </div>
        </div>

        {/* AI Scanner */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-700 rounded-2xl p-8 shadow-xl flex flex-col">
          <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <ScanLine className="text-cyan-400" /> AI Forensics Scanner
              </h3>
              <p className="text-slate-500 text-sm mt-1 font-mono">v2.5_multimodal_heuristics</p>
            </div>
            <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-800 shadow-inner">
               <button 
                 onClick={() => setScanMode('GENERAL')}
                 className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${scanMode === 'GENERAL' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
               >
                 General
               </button>
               <button 
                 onClick={() => setScanMode('RANSOM_NOTE')}
                 className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${scanMode === 'RANSOM_NOTE' ? 'bg-red-600/20 text-red-400 border border-red-500/50' : 'text-slate-500 hover:text-slate-300'}`}
               >
                 <FileWarning size={14} /> Ransom Note
               </button>
            </div>
          </div>

          <div className="space-y-4 flex-1">
            <textarea
              value={scanInput}
              onChange={(e) => setScanInput(e.target.value)}
              placeholder={scanMode === 'RANSOM_NOTE' ? 'Paste the suspected ransom note text here...' : 'Paste message snippets, URLs, or suspicious file paths...'}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-4 px-5 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all font-mono placeholder-slate-700 min-h-[150px] resize-none"
            />
            
            <button
              onClick={handleScan}
              disabled={isScanning || !scanInput}
              className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-3 active:scale-[0.98] ${
                isScanning 
                  ? 'bg-slate-800 cursor-not-allowed text-slate-600 border border-slate-700' 
                  : scanMode === 'RANSOM_NOTE' 
                    ? 'bg-red-600 hover:bg-red-500 text-white shadow-xl shadow-red-900/20'
                    : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-xl shadow-cyan-900/20'
              }`}
            >
              {isScanning ? (
                <>
                  <Loader2 className="animate-spin" size={18} /> ANALYZING PATTERNS...
                </>
              ) : (
                <>
                  {scanMode === 'RANSOM_NOTE' ? 'ANALYZE RANSOM NOTE' : 'RUN AI SCAN'} 
                  <Zap size={18} />
                </>
              )}
            </button>
          </div>

          {scanResult && (
            <div className={`mt-6 p-6 rounded-2xl border-2 animate-fade-in ${
              scanResult.safe 
                ? 'bg-green-500/5 border-green-500/20' 
                : 'bg-red-500/5 border-red-500/20'
            }`}>
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${scanResult.safe ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                  {scanResult.safe ? <CheckCircle size={24} /> : <AlertTriangle size={24} />}
                </div>
                <div>
                  <h4 className={`text-lg font-bold mb-1 ${
                    scanResult.safe ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {scanResult.safe ? 'Clean Artifact' : 'High Probability Threat'}
                  </h4>
                  {scanResult.family && (
                    <div className="inline-block px-3 py-1 bg-red-900 text-white rounded-full text-[10px] font-mono font-bold mb-3 uppercase tracking-widest">
                      THREAT ACTOR: {scanResult.family}
                    </div>
                  )}
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {scanResult.message}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemMonitor;
