
import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Loader2,
  Trash2,
  Filter,
  Layers
} from 'lucide-react';
import { sendMessageToGemini } from '../services/geminiService';

type Severity = 'CRITICAL' | 'WARNING' | 'INFO';
type AlertType = 'RANSOMWARE' | 'PHISHING' | 'NETWORK' | 'SYSTEM' | 'THREAT_INTEL';

interface AlertItem {
  id: string;
  message: string;
  timestamp: Date;
  count: number;
  severity: Severity;
  type: AlertType;
}

const MOCK_ALERTS_MESSAGES: { text: string; severity: Severity; type: AlertType }[] = [
  { text: "RANSOMWARE BLOCKED: หยุดการเข้ารหัสไฟล์ในโฟลเดอร์ /Documents", severity: 'CRITICAL', type: 'RANSOMWARE' },
  { text: "Decoy File Triggered: ตรวจพบความพยายามแก้ไขไฟล์ล่อ (Honeypot)", severity: 'CRITICAL', type: 'SYSTEM' },
  { text: "ตรวจพบการสแกนพอร์ตจาก IP ไม่ทราบฝ่าย (Port Scan Detected)", severity: 'WARNING', type: 'NETWORK' },
  { text: "แจ้งเตือน: พบไฟล์นามสกุล .encrypted ผิดปกติ 50 ไฟล์", severity: 'CRITICAL', type: 'RANSOMWARE' },
  { text: "บล็อกการเชื่อมต่อ Phishing Domain: secure-bank-login-update.com", severity: 'WARNING', type: 'PHISHING' },
  { text: "Threat Intel: พบ Signature ของ Ransomware สายพันธุ์ใหม่ 'LockBit 4.0'", severity: 'INFO', type: 'THREAT_INTEL' },
  { text: "System: ทำการสำรองข้อมูลอัตโนมัติ (Shadow Copy Protection) สำเร็จ", severity: 'INFO', type: 'SYSTEM' }
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
  
  // Advanced Filter State
  const [severityFilter, setSeverityFilter] = useState<Severity | 'ALL'>('ALL');
  const [typeFilter, setTypeFilter] = useState<AlertType | 'ALL'>('ALL');

  const [alerts, setAlerts] = useState<AlertItem[]>(
    MOCK_ALERTS_MESSAGES.slice(0, 4).map((m, i) => ({
      id: `initial-${i}-${Date.now()}`,
      message: m.text,
      timestamp: new Date(Date.now() - i * 120000),
      count: 1,
      severity: m.severity,
      type: m.type
    }))
  );
  
  const [entropy, setEntropy] = useState(15);
  const [writeSpeed, setWriteSpeed] = useState(12);
  const [currentFile, setCurrentFile] = useState(MOCK_FILES[0]);
  const [behaviorStatus, setBehaviorStatus] = useState<'NORMAL' | 'SUSPICIOUS' | 'CRITICAL'>('NORMAL');
  
  const [systemLockdown, setSystemLockdown] = useState(false);
  const consecutiveHighRiskSeconds = useRef(0);

  // Scanner State
  const [scanInput, setScanInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanMode, setScanMode] = useState<'GENERAL' | 'RANSOM_NOTE'>('GENERAL');
  const [scanResult, setScanResult] = useState<{safe: boolean; message: string; family?: string} | null>(null);

  const addAlert = (message: string, severity: Severity = 'INFO', type: AlertType = 'SYSTEM') => {
    setAlerts(prev => {
      const existingIdx = prev.findIndex(a => a.message === message);
      if (existingIdx !== -1) {
        const newAlerts = [...prev];
        const updatedItem = {
          ...newAlerts[existingIdx],
          count: newAlerts[existingIdx].count + 1,
          timestamp: new Date()
        };
        newAlerts.splice(existingIdx, 1);
        return [updatedItem, ...newAlerts];
      }
      
      const newAlert: AlertItem = {
        id: `alert-${Math.random().toString(36).substr(2, 9)}`,
        message,
        timestamp: new Date(),
        count: 1,
        severity,
        type
      };
      return [newAlert, ...prev].slice(0, 30);
    });
  };

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const clearAllAlerts = () => {
    setAlerts([]);
  };

  // Filtered Alerts Logic
  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      const matchSeverity = severityFilter === 'ALL' || alert.severity === severityFilter;
      const matchType = typeFilter === 'ALL' || alert.type === typeFilter;
      return matchSeverity && matchType;
    });
  }, [alerts, severityFilter, typeFilter]);

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
      if (randomChance > 0.96) {
         newEntropy = Math.floor(Math.random() * 20) + 78;
         newWriteSpeed = Math.floor(Math.random() * 150) + 80;
         addAlert("Suspicious high-entropy file write detected.", "WARNING", "SYSTEM");
      }

      const isHighEntropy = newEntropy > 80;
      const isHighSpeed = newWriteSpeed > 100;

      if (isHighEntropy || isHighSpeed) {
        consecutiveHighRiskSeconds.current += 1;
        setBehaviorStatus('CRITICAL');

        if (consecutiveHighRiskSeconds.current > 5) {
          setSystemLockdown(true);
          addAlert("CRITICAL: System Lockdown Initiated. Hostile behavior sustained.", "CRITICAL", "RANSOMWARE");
        }
      } else {
        if (consecutiveHighRiskSeconds.current > 0) {
          consecutiveHighRiskSeconds.current -= 0.5;
        }
        if (consecutiveHighRiskSeconds.current <= 0) {
           setBehaviorStatus(newEntropy > 60 ? 'SUSPICIOUS' : 'NORMAL');
        }
      }

      setEntropy(newEntropy);
      setWriteSpeed(newWriteSpeed);
      setCurrentFile(MOCK_FILES[Math.floor(Math.random() * MOCK_FILES.length)]);

      if (Math.random() > 0.99) {
        const mock = MOCK_ALERTS_MESSAGES[Math.floor(Math.random() * MOCK_ALERTS_MESSAGES.length)];
        addAlert(mock.text, mock.severity, mock.type);
      }

    }, 1000);

    return () => clearInterval(interval);
  }, [systemLockdown]);

  const handleManualReset = () => {
    setSystemLockdown(false);
    consecutiveHighRiskSeconds.current = 0;
    setBehaviorStatus('NORMAL');
    addAlert("System: Lockdown override by user. Sentinel monitoring resumed.", "INFO", "SYSTEM");
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
        prompt = `Detect Ransomware/Phishing indicators in this text: "${scanInput}". Respond in JSON: {"safe": boolean, "message": "Short Thai description"}`;
      }
      const response = await sendMessageToGemini(prompt);
      const cleanJson = response.text.replace(/```json|```/g, '').trim();
      const result = JSON.parse(cleanJson);
      setScanResult(result);
    } catch (error) {
      setScanResult({ safe: false, message: "AI Engine connection failed." });
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
          <p className="text-slate-400">ระบบตรวจจับพฤติกรรมประสงค์ร้ายและตรวจสอบช่องโหว่แบบเรียลไทม์</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-500 ${
          systemLockdown 
            ? 'bg-red-950/30 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]' 
            : 'bg-slate-800 border-slate-700 shadow-lg shadow-black/20'
        }`}>
          {systemLockdown ? (
             <>
               <Lock className="w-4 h-4 text-red-500 animate-bounce" />
               <span className="text-xs font-mono text-red-400 font-bold uppercase tracking-widest">System Lockdown</span>
             </>
          ) : (
             <>
               <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
               <span className="text-xs font-mono text-green-400 uppercase tracking-widest">Sentinel Active</span>
             </>
          )}
        </div>
      </div>

      {/* Main Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Behavioral Shield Card */}
        <div className={`lg:col-span-1 border p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between transition-all duration-500 ${
           systemLockdown 
           ? 'bg-red-950/30 border-red-600 shadow-2xl' 
           : 'bg-slate-900 border-slate-700 shadow-xl'
        }`}>
           <div className="absolute top-0 right-0 p-4 opacity-5">
              <ShieldAlert size={140} />
           </div>
           <div>
             <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
               <ShieldAlert className={systemLockdown ? "text-red-500" : "text-cyan-400"} /> 
               Behavioral Heuristics
             </h3>
             <div className="flex items-center gap-5 mb-8">
                <div className={`p-5 rounded-3xl border-2 transition-all duration-500 ${
                  systemLockdown ? 'border-red-500 bg-red-600/20 text-red-500 scale-110 shadow-lg shadow-red-900/40' :
                  behaviorStatus === 'CRITICAL' ? 'border-red-500 bg-red-500/10 text-red-500 animate-pulse' : 
                  behaviorStatus === 'SUSPICIOUS' ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500' : 
                  'border-green-500 bg-green-500/10 text-green-500'
                }`}>
                  {systemLockdown ? <Lock size={40} /> : <FileKey size={40} />}
                </div>
                <div>
                   <div className="text-[10px] text-slate-500 uppercase font-mono tracking-widest mb-1">State Analysis</div>
                   <div className={`text-2xl font-black font-mono tracking-tighter transition-colors duration-500 ${
                      systemLockdown ? 'text-red-500' :
                      behaviorStatus === 'CRITICAL' ? 'text-red-400' : 
                      behaviorStatus === 'SUSPICIOUS' ? 'text-yellow-500' : 
                      'text-green-500'
                   }`}>
                     {systemLockdown ? 'TERMINATED' :
                      behaviorStatus === 'CRITICAL' ? 'INTRUSION' : 
                      behaviorStatus === 'SUSPICIOUS' ? 'ALERT' : 
                      'SECURE'}
                   </div>
                </div>
             </div>
           </div>
           
           {systemLockdown ? (
             <button 
               onClick={handleManualReset}
               className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-2xl border border-red-400 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-xl"
             >
               <Unlock size={20} /> RESTORE SYSTEM ACCESS
             </button>
           ) : (
             <div className="space-y-4">
                <div className="flex justify-between text-[10px] text-slate-500 font-mono uppercase tracking-widest">
                  <span>Engine Integrity</span>
                  <span className="text-green-400">Validated</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                   <div className="bg-cyan-500 h-full w-full transition-all duration-1000 shadow-[0_0_10px_rgba(6,182,212,0.5)]"></div>
                </div>
             </div>
           )}
        </div>

        {/* Analytics Card */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-700 p-8 rounded-3xl shadow-xl space-y-8">
           <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                 <Cpu className="text-purple-500" /> Live Telemetry
              </h3>
              <div className="flex gap-2">
                 <span className="px-3 py-1 bg-slate-800 rounded-lg text-[10px] text-slate-400 font-mono border border-slate-700 uppercase tracking-widest">
                   Adaptive Sampling
                 </span>
              </div>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className={`p-6 rounded-2xl border transition-all duration-500 ${entropy > 80 ? 'bg-red-950/20 border-red-800/50 scale-[1.02]' : 'bg-slate-950 border-slate-800'}`}>
                 <div className="flex justify-between items-end mb-3">
                    <span className="text-xs text-slate-500 font-mono uppercase tracking-widest">File Entropy</span>
                    <span className={`text-2xl font-bold font-mono ${entropy > 80 ? 'text-red-500' : 'text-cyan-400'}`}>
                      {entropy.toFixed(1)}%
                    </span>
                 </div>
                 <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${entropy > 80 ? 'bg-red-500' : 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.4)]'}`}
                      style={{ width: `${entropy}%` }}
                    ></div>
                 </div>
              </div>

              <div className={`p-6 rounded-2xl border transition-all duration-500 ${writeSpeed > 100 ? 'bg-red-950/20 border-red-800/50 scale-[1.02]' : 'bg-slate-950 border-slate-800'}`}>
                 <div className="flex justify-between items-end mb-3">
                    <span className="text-xs text-slate-500 font-mono uppercase tracking-widest">I/O Throughput</span>
                    <span className={`text-2xl font-bold font-mono ${writeSpeed > 100 ? 'text-red-500' : 'text-blue-400'}`}>
                      {writeSpeed} MB/s
                    </span>
                 </div>
                 <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${writeSpeed > 100 ? 'bg-red-500' : 'bg-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.4)]'}`}
                      style={{ width: `${Math.min(100, (writeSpeed / 200) * 100)}%` }}
                    ></div>
                 </div>
              </div>
           </div>

           <div className={`p-4 rounded-xl border font-mono text-xs flex items-center gap-4 overflow-hidden transition-all ${
             systemLockdown ? 'bg-red-950/50 border-red-900/50 text-red-400' : 'bg-slate-950 border-slate-800 text-slate-400'
           }`}>
              <div className={`shrink-0 flex items-center gap-2 font-bold uppercase tracking-tighter ${systemLockdown ? 'text-red-500' : 'text-green-500'}`}>
                {systemLockdown ? <Lock size={14}/> : <CheckCircle size={14}/>}
                {systemLockdown ? 'BLOCKED' : 'VERIFIED'}
              </div>
              <div className="w-px h-4 bg-slate-800 mx-2" />
              <span className="truncate flex-1 italic opacity-80">
                {currentFile}
              </span>
              <span className="text-slate-600 shrink-0 flex items-center gap-2 border-l border-slate-800 pl-4 ml-2">
                <Clock size={12}/> {new Date().toLocaleTimeString()}
              </span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Refined Alerts Intelligence Feed with Filtering */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-[2rem] shadow-2xl flex flex-col h-[750px] overflow-hidden">
          <div className="px-8 py-5 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
            <h3 className="text-sm font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-3">
              <AlertTriangle size={18} className="text-yellow-500" />
              Incident Intel Feed
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-[10px] bg-slate-800 text-slate-500 px-2.5 py-1 rounded-full font-mono font-bold">
                {filteredAlerts.length} / {alerts.length}
              </span>
              {alerts.length > 0 && (
                <button 
                  onClick={clearAllAlerts}
                  className="p-1.5 text-slate-600 hover:text-red-400 transition-colors"
                  title="Clear all logs"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Filtering UI */}
          <div className="px-6 py-4 bg-slate-900/30 border-b border-slate-800 space-y-3">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              <Filter size={12} className="text-slate-500 shrink-0" />
              <button 
                onClick={() => setSeverityFilter('ALL')}
                className={`text-[9px] px-2.5 py-1 rounded-full font-bold uppercase border transition-all ${severityFilter === 'ALL' ? 'bg-slate-700 text-white border-slate-600' : 'bg-transparent text-slate-500 border-slate-800'}`}
              >
                All
              </button>
              {(['CRITICAL', 'WARNING', 'INFO'] as Severity[]).map(sev => (
                <button 
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={`text-[9px] px-2.5 py-1 rounded-full font-bold uppercase border transition-all ${
                    severityFilter === sev 
                      ? (sev === 'CRITICAL' ? 'bg-red-600 text-white border-red-500' : sev === 'WARNING' ? 'bg-yellow-600 text-white border-yellow-500' : 'bg-blue-600 text-white border-blue-500')
                      : 'bg-transparent text-slate-500 border-slate-800'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <Layers size={12} className="text-slate-500 shrink-0" />
              <button 
                onClick={() => setTypeFilter('ALL')}
                className={`text-[9px] px-2.5 py-1 rounded-full font-bold uppercase border transition-all ${typeFilter === 'ALL' ? 'bg-slate-700 text-white border-slate-600' : 'bg-transparent text-slate-500 border-slate-800'}`}
              >
                All Types
              </button>
              {(['RANSOMWARE', 'PHISHING', 'NETWORK', 'SYSTEM', 'THREAT_INTEL'] as AlertType[]).map(type => (
                <button 
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`text-[9px] px-2.5 py-1 rounded-full font-bold uppercase border transition-all whitespace-nowrap ${
                    typeFilter === type 
                      ? 'bg-cyan-600 text-white border-cyan-500 shadow-lg shadow-cyan-900/20' 
                      : 'bg-transparent text-slate-500 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {type.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            {filteredAlerts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-10 p-12 text-center space-y-6">
                <ShieldAlert size={80} />
                <p className="text-sm font-mono tracking-widest uppercase">No alerts match active filters</p>
                <button 
                  onClick={() => { setSeverityFilter('ALL'); setTypeFilter('ALL'); }}
                  className="text-[10px] text-cyan-400 border-b border-cyan-400 pb-0.5 hover:text-cyan-300 transition-colors"
                >
                  RESET FILTERS
                </button>
              </div>
            ) : (
              filteredAlerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className={`relative p-5 rounded-2xl border-l-4 transition-all animate-fade-in group shadow-lg ${
                    alert.severity === 'CRITICAL' ? 'bg-red-500/5 border-red-500/80 hover:bg-red-500/10' :
                    alert.severity === 'WARNING' ? 'bg-yellow-500/5 border-yellow-500/80 hover:bg-yellow-500/10' :
                    'bg-blue-500/5 border-blue-500/80 hover:bg-blue-500/10'
                  } border-t border-r border-b border-slate-800/50`}
                >
                  <button 
                    onClick={() => dismissAlert(alert.id)}
                    className="absolute -top-2 -right-2 p-1.5 bg-slate-800 text-slate-400 hover:text-white rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-xl hover:bg-red-600 z-10 border border-slate-700"
                  >
                    <X size={12} />
                  </button>
                  
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex flex-wrap gap-2">
                      <span className={`text-[9px] font-mono font-black px-2 py-0.5 rounded uppercase tracking-widest ${
                        alert.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400' :
                        alert.severity === 'WARNING' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {alert.severity}
                      </span>
                      <span className="text-[8px] bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-tighter">
                        {alert.type}
                      </span>
                      {alert.count > 1 && (
                        <span className="text-[9px] bg-cyan-500 text-white font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                          x{alert.count}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600 font-mono text-[9px] uppercase">
                       <Clock size={10} />
                       {alert.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                  </div>
                  
                  <p className="text-[13px] text-slate-200 leading-relaxed pr-2 font-medium">
                    {alert.message}
                  </p>
                </div>
              ))
            )}
          </div>
          
          <div className="p-4 bg-slate-900/80 border-t border-slate-800 text-center">
             <p className="text-[10px] text-slate-600 font-mono uppercase tracking-[0.2em]">Live Sentinel Feed Activity</p>
          </div>
        </div>

        {/* AI Forensic Scanner Card */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-700 rounded-[2rem] p-10 shadow-2xl flex flex-col">
          <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                <ScanLine className="text-cyan-400" /> Forensic Pattern Matcher
              </h3>
              <p className="text-slate-500 text-sm mt-1 font-mono uppercase tracking-widest">AI Engine: Gemini-3-Pro-Forensics</p>
            </div>
            <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
               <button 
                 onClick={() => setScanMode('GENERAL')}
                 className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${scanMode === 'GENERAL' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
               >
                 Triage
               </button>
               <button 
                 onClick={() => setScanMode('RANSOM_NOTE')}
                 className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${scanMode === 'RANSOM_NOTE' ? 'bg-red-600/20 text-red-400 border border-red-500/50' : 'text-slate-500 hover:text-slate-300'}`}
               >
                 <FileWarning size={14} /> Ransom Note
               </button>
            </div>
          </div>

          <div className="space-y-6 flex-1">
            <textarea
              value={scanInput}
              onChange={(e) => setScanInput(e.target.value)}
              placeholder={scanMode === 'RANSOM_NOTE' ? 'Paste the full content of the suspected ransom note for deep behavior analysis...' : 'Paste log snippets, suspicious URLs, or PowerShell script chunks...'}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-[1.5rem] py-5 px-6 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all font-mono placeholder-slate-700 min-h-[180px] resize-none shadow-inner"
            />
            
            <button
              onClick={handleScan}
              disabled={isScanning || !scanInput}
              className={`w-full py-5 rounded-2xl font-black text-sm tracking-widest transition-all flex items-center justify-center gap-4 active:scale-[0.98] shadow-xl ${
                isScanning 
                  ? 'bg-slate-800 cursor-not-allowed text-slate-600 border border-slate-700' 
                  : scanMode === 'RANSOM_NOTE' 
                    ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/40'
                    : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-900/40'
              }`}
            >
              {isScanning ? (
                <>
                  <Loader2 className="animate-spin" size={20} /> DECRYPTING PATTERNS...
                </>
              ) : (
                <>
                  {scanMode === 'RANSOM_NOTE' ? 'ANALYZE THREAT ACTOR' : 'EXECUTE AI SCAN'} 
                  <Zap size={20} />
                </>
              )}
            </button>
          </div>

          {scanResult && (
            <div className={`mt-8 p-8 rounded-3xl border-2 animate-fade-in shadow-2xl ${
              scanResult.safe 
                ? 'bg-green-500/5 border-green-500/30' 
                : 'bg-red-500/5 border-red-500/30'
            }`}>
              <div className="flex items-start gap-6">
                <div className={`p-4 rounded-2xl shadow-lg ${scanResult.safe ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                  {scanResult.safe ? <CheckCircle size={32} /> : <AlertTriangle size={32} />}
                </div>
                <div className="flex-1">
                  <h4 className={`text-xl font-black mb-2 uppercase tracking-tight ${
                    scanResult.safe ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {scanResult.safe ? 'Clear Artifact' : 'Malicious Threat Detected'}
                  </h4>
                  {scanResult.family && (
                    <div className="inline-block px-4 py-1.5 bg-red-900/40 text-red-300 rounded-xl text-xs font-mono font-black mb-4 uppercase tracking-[0.2em] border border-red-500/30">
                      Family: {scanResult.family}
                    </div>
                  )}
                  <p className="text-slate-300 text-sm leading-relaxed bg-black/20 p-4 rounded-xl border border-white/5">
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
