
import React, { useState } from 'react';
import { 
  PackageSearch, 
  AlertCircle, 
  ShieldCheck, 
  Terminal, 
  Loader2, 
  ExternalLink, 
  ChevronRight,
  RefreshCw,
  Info,
  Github,
  Zap,
  Code2,
  FileCode,
  Shield,
  Settings,
  ListFilter,
  Search,
  CheckCircle2,
  Lock,
  Globe,
  Database,
  Box,
  Cpu,
  Smartphone,
  Server,
  Cloud
} from 'lucide-react';
import { sendMessageToGemini } from '../services/geminiService';

interface DependencyAlert {
  id: string;
  package: string;
  version: string;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  vulnerability: string;
  cve: string;
  description: string;
  remediation: string;
}

const MOCK_ALERTS: DependencyAlert[] = [
  {
    id: 'GHSA-v88g-96pw-6g3v',
    package: 'axios',
    version: '0.21.1',
    severity: 'high',
    vulnerability: 'Server-Side Request Forgery',
    cve: 'CVE-2021-3749',
    description: 'Axios is vulnerable to Server-Side Request Forgery (SSRF) when handling certain redirects.',
    remediation: 'Update to version 0.21.4 or later.'
  },
  {
    id: 'GHSA-29mw-wpgm-5u9p',
    package: 'lodash',
    version: '4.17.15',
    severity: 'critical',
    vulnerability: 'Prototype Pollution',
    cve: 'CVE-2020-8203',
    description: 'Lodash before 4.17.20 is vulnerable to prototype pollution via the merge function.',
    remediation: 'Update to version 4.17.20 or later.'
  },
  {
    id: 'GHSA-pw2r-q39p-534p',
    package: 'express',
    version: '4.16.0',
    severity: 'moderate',
    vulnerability: 'Open Redirect',
    cve: 'CVE-2019-1000001',
    description: 'Express can be exploited for open redirects if user input is not properly sanitized before being passed to res.redirect().',
    remediation: 'Update to version 4.17.1 or later.'
  }
];

const SCANNING_TOOLS = [
  { name: 'CodeQL Analysis', type: 'SAST', vendor: 'GitHub', description: 'Semantic code analysis for C, C++, C#, Go, Java, JS/TS, Python, Ruby, Kotlin, Swift.', icon: Github },
  { name: 'Snyk Security', type: 'SAST/SCA', vendor: 'Snyk', description: 'Detect vulnerabilities across applications and infrastructure.', icon: Shield },
  { name: 'SonarCloud', type: 'SAST', vendor: 'Sonar', description: 'Static analysis for vulnerability detection, covering 26+ languages.', icon: Cloud },
  { name: 'Semgrep', type: 'SAST', vendor: 'Returntocorp', description: 'Lightweight static analysis for enforcing secure code standards.', icon: Code2 },
  { name: 'Fortify Scan', type: 'SAST', vendor: 'OpenText', description: 'Comprehensive SAST for 33+ languages in DevSecOps workflows.', icon: Lock },
  { name: 'APIsec Scan', type: 'API', vendor: 'APIsec', description: 'Automated API testing uncovering security and logic flaws.', icon: Globe },
  { name: 'Appknox', type: 'Mobile', vendor: 'Appknox', description: 'Security assessments for iOS and Android apps.', icon: Smartphone },
  { name: 'Microsoft Defender', type: 'DevOps', vendor: 'Microsoft', description: 'Integrate tools with GitHub Advanced Security and Defender for Cloud.', icon: Server },
  { name: 'OSV Scanner', type: 'SCA', vendor: 'Google', description: 'Vulnerability scanner for dependencies using osv.dev data.', icon: Search },
  { name: 'Trivy', type: 'Container', vendor: 'Aqua Security', description: 'Scan container images for OS package and dependency vulnerabilities.', icon: Box },
  { name: 'Mayhem for API', type: 'DAST', vendor: 'ForAllSecure', description: 'Automatically test REST APIs with OpenAPI specs.', icon: Zap },
  { name: 'njsscan', type: 'SAST', vendor: 'NodeJSScan', description: 'Find insecure code patterns in Node.js applications.', icon: FileCode }
];

const SupplyChainLab: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'DEPENDABOT' | 'CODE_SCANNING'>('DEPENDABOT');
  const [isScanning, setIsScanning] = useState(false);
  const [alerts, setAlerts] = useState<DependencyAlert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<DependencyAlert | null>(null);
  const [remediationAdvice, setRemediationAdvice] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const startScan = () => {
    setIsScanning(true);
    setAlerts([]);
    setSelectedAlert(null);
    setRemediationAdvice(null);
    
    setTimeout(() => {
      setAlerts(MOCK_ALERTS);
      setIsScanning(false);
    }, 2000);
  };

  const getAIAdvice = async (alert: DependencyAlert) => {
    setIsAnalyzing(true);
    setRemediationAdvice(null);
    try {
      const prompt = `
        Act as a security expert. Provide a detailed remediation plan in Thai for the following Dependabot alert:
        Package: ${alert.package}
        Version: ${alert.version}
        Vulnerability: ${alert.vulnerability}
        CVE: ${alert.cve}
        
        Include:
        1. Why this is dangerous.
        2. Steps to fix (code examples if applicable).
        3. How to prevent supply chain attacks in the future.
      `;
      const response = await sendMessageToGemini(prompt);
      setRemediationAdvice(response.text);
    } catch (error) {
      setRemediationAdvice("ไม่สามารถขอคำแนะนำจาก AI ได้ในขณะนี้");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white border-red-400';
      case 'high': return 'bg-orange-600 text-white border-orange-500';
      case 'moderate': return 'bg-yellow-600 text-white border-yellow-500';
      default: return 'bg-blue-600 text-white border-blue-500';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-20">
      {/* Tab Navigation */}
      <div className="flex justify-center mb-8">
        <div className="bg-slate-900/80 p-1.5 rounded-2xl border border-slate-700 flex gap-2">
          <button 
            onClick={() => setActiveTab('DEPENDABOT')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'DEPENDABOT' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <PackageSearch size={18} /> Dependabot
          </button>
          <button 
            onClick={() => setActiveTab('CODE_SCANNING')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'CODE_SCANNING' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Code2 size={18} /> Code Scanning
          </button>
        </div>
      </div>

      {activeTab === 'DEPENDABOT' ? (
        <div className="animate-fade-in space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                <PackageSearch className="text-cyan-400" /> Dependabot Security Lab
              </h2>
              <p className="text-slate-400 max-w-2xl">
                การตรวจสอบความปลอดภัยของ Dependency (SCA) เพื่อค้นหาไลบรารีที่มีช่องโหว่และทำการอัปเดตอัตโนมัติ
              </p>
            </div>
            <button 
              onClick={startScan}
              disabled={isScanning}
              className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-cyan-900/40"
            >
              {isScanning ? <Loader2 className="animate-spin" size={20} /> : <RefreshCw size={20} />}
              Scan Dependencies
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Alert List */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
                  <h3 className="text-sm font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <AlertCircle size={14} className="text-yellow-500" />
                    Vulnerability Alerts
                  </h3>
                </div>
                
                <div className="divide-y divide-slate-800/50 max-h-[500px] overflow-y-auto custom-scrollbar">
                  {isScanning ? (
                    <div className="p-12 text-center space-y-4">
                      <Loader2 className="mx-auto animate-spin text-cyan-400" size={32} />
                      <p className="text-slate-500 text-sm font-mono animate-pulse uppercase">Auditing package.json...</p>
                    </div>
                  ) : alerts.length === 0 ? (
                    <div className="p-12 text-center space-y-4">
                      <ShieldCheck className="mx-auto text-green-500/20" size={48} />
                      <p className="text-slate-500 text-sm">กดปุ่ม Scan เพื่อเริ่มตรวจสอบไลบรารี</p>
                    </div>
                  ) : (
                    alerts.map((alert) => (
                      <button
                        key={alert.id}
                        onClick={() => {
                          setSelectedAlert(alert);
                          setRemediationAdvice(null);
                        }}
                        className={`w-full p-4 text-left transition-all hover:bg-slate-800 flex items-start gap-3 group ${
                          selectedAlert?.id === alert.id ? 'bg-slate-800/80 border-r-4 border-cyan-500' : ''
                        }`}
                      >
                        <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                          alert.severity === 'critical' ? 'bg-red-500 animate-ping' : 
                          alert.severity === 'high' ? 'bg-orange-500' : 'bg-yellow-500'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-white font-bold font-mono truncate">{alert.package}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-tighter ${getSeverityColor(alert.severity)}`}>
                              {alert.severity}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 truncate">{alert.vulnerability}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Alert Details */}
            <div className="lg:col-span-2 space-y-6">
              {selectedAlert ? (
                <div className="space-y-6">
                  <div className="bg-slate-900/80 border border-slate-700 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                      <div className="space-y-4 flex-1">
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${getSeverityColor(selectedAlert.severity)}`}>
                            {selectedAlert.severity} SEVERITY
                          </span>
                        </div>
                        <h3 className="text-3xl font-bold text-white">{selectedAlert.package} <span className="text-slate-500 text-lg">v{selectedAlert.version}</span></h3>
                        <p className="text-slate-300 leading-relaxed text-sm bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                          {selectedAlert.description}
                        </p>
                      </div>
                      <button 
                        onClick={() => getAIAdvice(selectedAlert)}
                        disabled={isAnalyzing}
                        className="w-full md:w-auto px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg"
                      >
                        {isAnalyzing ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
                        AI Fix Advice
                      </button>
                    </div>
                  </div>
                  {remediationAdvice && (
                    <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 shadow-2xl">
                      <h4 className="text-white font-bold mb-4 flex items-center gap-2"><Terminal size={18} className="text-purple-400" /> AI Insights</h4>
                      <div className="text-slate-300 whitespace-pre-wrap text-sm leading-relaxed">{remediationAdvice}</div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-64 border-2 border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center text-slate-600">
                  <AlertCircle size={48} className="mb-2 opacity-20" />
                  <p>เลือกรายการเพื่อดูรายละเอียดการแก้ไข</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="animate-fade-in space-y-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="space-y-3">
              <h2 className="text-4xl font-bold text-white flex items-center gap-4">
                <Code2 className="text-purple-400 w-10 h-10" /> Code Scanning at Scale
              </h2>
              <p className="text-slate-400 max-w-3xl leading-relaxed">
                การตั้งค่า Code Scanning ในระดับองค์กรช่วยให้นักพัฒนาสามารถตรวจหาช่องโหว่ (Vulnerability) และข้อผิดพลาดทางตรรกะ (Logic Flaws) 
                ได้อัตโนมัติในทุกๆ Repository ของทีม
              </p>
            </div>
            <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 flex gap-6 shadow-xl">
              <div className="text-center px-4">
                <div className="text-3xl font-bold text-purple-400">SAST</div>
                <div className="text-[10px] text-slate-500 uppercase font-mono tracking-widest mt-1">Static Security</div>
              </div>
              <div className="w-px bg-slate-800 self-stretch" />
              <div className="text-center px-4">
                <div className="text-3xl font-bold text-cyan-400">DAST</div>
                <div className="text-[10px] text-slate-500 uppercase font-mono tracking-widest mt-1">Dynamic Security</div>
              </div>
            </div>
          </div>

          {/* Detailed Documentation Content */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
            {/* Default Setup Section */}
            <div className="bg-slate-900/40 p-10 rounded-[2rem] border border-slate-800 space-y-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                 <Settings size={120} />
              </div>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/20 text-purple-400 rounded-2xl">
                  <Shield size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Default Setup at Scale</h3>
                  <span className="text-[10px] text-purple-400 font-mono font-bold uppercase">Quick Configuration</span>
                </div>
              </div>
              
              <div className="space-y-6">
                <p className="text-slate-300 leading-relaxed">
                  คุณสามารถเปิดใช้งาน Code Scanning สำหรับ Repository ทั้งหมดในองค์กรได้ด้วย **Default Setup** 
                  ระบบจะทำการสแกนโดยอัตโนมัติในเหตุการณ์ต่อไปนี้:
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Push to Default Branch', icon: CheckCircle2 },
                    { label: 'Pull Requests (Protected Branches)', icon: CheckCircle2 },
                    { label: 'Weekly Schedule', icon: CheckCircle2 },
                    { label: 'CodeQL Supported Languages', icon: CheckCircle2 }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                      <item.icon size={18} className="text-green-500 shrink-0" />
                      <span className="text-xs text-slate-300 font-medium">{item.label}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-blue-900/10 border border-blue-800/30 p-6 rounded-2xl space-y-3">
                  <h4 className="text-blue-300 font-bold flex items-center gap-2 text-sm uppercase tracking-wider">
                    <Info size={16} /> Eligible Repositories
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Repository ต้องเป็น Public หรือเปิดใช้งาน **GitHub Code Security** และเปิดใช้งาน **GitHub Actions** 
                    ถึงจะสามารถใช้ Default Setup ได้ หากไม่ตรงเงื่อนไขต้องใช้ Advanced Setup (Workflow .yml)
                  </p>
                </div>
              </div>
            </div>

            {/* Advanced & Automation Section */}
            <div className="bg-slate-900/40 p-10 rounded-[2rem] border border-slate-800 space-y-8 shadow-2xl">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-cyan-500/20 text-cyan-400 rounded-2xl">
                  <Settings size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Advanced Configuration</h3>
                  <span className="text-[10px] text-cyan-400 font-mono font-bold uppercase">Custom Workflows</span>
                </div>
              </div>

              <div className="space-y-6">
                <p className="text-slate-300 leading-relaxed">
                  หากโค้ดมีการเปลี่ยนแปลงภาษาใหม่ GitHub จะอัปเดตการตั้งค่าสแกนให้อัตโนมัติ 
                  แต่สำหรับความต้องการเฉพาะทาง เช่น การเข้าถึง **Private Registries** คุณต้องกำหนดค่าเพิ่มเติม:
                </p>

                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 font-mono text-xs leading-relaxed group">
                  <div className="flex justify-between items-center mb-4 text-slate-500">
                    <span>codeql-analysis.yml</span>
                    <button className="text-slate-600 hover:text-cyan-400"><Code2 size={14}/></button>
                  </div>
                  <div className="space-y-1">
                    <div className="flex gap-4"><span className="text-purple-400">name:</span> <span className="text-yellow-200">"CodeQL Analysis"</span></div>
                    <div className="flex gap-4"><span className="text-purple-400">on:</span> <span className="text-slate-400">[push, pull_request]</span></div>
                    <div className="flex gap-4"><span className="text-purple-400">jobs:</span></div>
                    <div className="flex gap-4">&nbsp;&nbsp;<span className="text-purple-400">analyze:</span></div>
                    <div className="flex gap-4">&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">steps:</span></div>
                    <div className="flex gap-4">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- <span className="text-cyan-400">uses:</span> <span className="text-slate-400">actions/checkout@v4</span></div>
                    <div className="flex gap-4">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- <span className="text-cyan-400">uses:</span> <span className="text-slate-400">github/codeql-action/init@v3</span></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                    <h5 className="text-white text-xs font-bold mb-1">Model Packs</h5>
                    <p className="text-[10px] text-slate-500">ขยายการครอบคลุมของ CodeQL ด้วย Model Packs สำหรับภาษาเฉพาะทาง</p>
                  </div>
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                    <h5 className="text-white text-xs font-bold mb-1">Security Filters</h5>
                    <p className="text-[10px] text-slate-500">กำหนดตัวกรองสำหรับกลุ่ม Repository ย่อยในองค์กรเพื่อความแม่นยำ</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security Tools Marketplace Directory */}
          <div className="space-y-8">
             <div className="flex items-center justify-between">
               <h3 className="text-3xl font-bold text-white flex items-center gap-3">
                  <ListFilter className="text-purple-400" /> Security Tools Directory
               </h3>
               <div className="relative hidden md:block">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                 <input 
                   type="text" 
                   placeholder="Search tools..." 
                   className="bg-slate-950 border border-slate-800 rounded-full pl-10 pr-6 py-2 text-sm outline-none focus:border-purple-500 transition-all"
                 />
               </div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {SCANNING_TOOLS.map((tool, idx) => (
                  <div key={idx} className="bg-slate-900/60 p-6 rounded-[1.5rem] border border-slate-800 hover:border-purple-500/50 transition-all group hover:shadow-2xl hover:shadow-purple-900/10 flex flex-col justify-between h-full">
                    <div>
                      <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-slate-950 rounded-2xl group-hover:bg-purple-600/10 group-hover:text-purple-400 transition-all text-slate-600">
                          <tool.icon size={24} />
                        </div>
                        <span className={`text-[9px] px-2.5 py-1 rounded-full font-mono font-bold tracking-tighter uppercase ${
                          tool.type === 'DAST' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 
                          tool.type === 'SAST' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                          'bg-slate-800 text-slate-400'
                        }`}>
                          {tool.type}
                        </span>
                      </div>
                      <h4 className="text-white font-bold mb-2 group-hover:text-purple-300 transition-colors text-lg">{tool.name}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed mb-6 line-clamp-3">
                        {tool.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                       <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{tool.vendor}</span>
                       <button className="text-slate-600 hover:text-white transition-colors">
                          <ExternalLink size={14} />
                       </button>
                    </div>
                  </div>
                ))}
             </div>
          </div>

          {/* Educational Footer with Grounding Context */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-900/30 p-10 rounded-[2.5rem] border border-slate-700/50 flex flex-col md:flex-row gap-10 items-center shadow-3xl">
             <div className="p-6 bg-slate-950 rounded-[2rem] shrink-0 shadow-2xl">
                <ShieldCheck size={56} className="text-green-500" />
             </div>
             <div className="flex-1 space-y-4">
                <h4 className="text-white text-2xl font-bold">Why Security Automation?</h4>
                <p className="text-slate-400 leading-relaxed">
                  ช่องโหว่ส่วนใหญ่ในแอปพลิเคชันยุคใหม่เกิดจากความซับซ้อนของ Source Code และการใช้งาน Third-party Libraries มหาศาล 
                  การตรวจสอบ (Inspection) ด้วยแรงงานคนเพียงอย่างเดียวไม่เพียงพอ การใช้เครื่องมืออย่าง SAST, DAST, และ SCA 
                  จึงเป็นหัวใจสำคัญของ **DevSecOps** เพื่อหยุดยั้งภัยคุกคามตั้งแต่เนิ่นๆ
                </p>
                <div className="flex flex-wrap gap-4 pt-2">
                   <div className="flex items-center gap-2 text-xs font-mono text-slate-500 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                      <Database size={12} /> Data Privacy
                   </div>
                   <div className="flex items-center gap-2 text-xs font-mono text-slate-500 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                      <Lock size={12} /> Secure by Design
                   </div>
                   <div className="flex items-center gap-2 text-xs font-mono text-slate-500 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                      <Zap size={12} /> Shift Left
                   </div>
                </div>
             </div>
             <div className="shrink-0">
               <a 
                 href="https://docs.github.com/en/code-security/code-scanning" 
                 target="_blank" 
                 className="px-8 py-4 bg-white text-slate-900 font-bold rounded-2xl transition-all hover:bg-slate-200 flex items-center gap-3 shadow-xl"
               >
                 Explore GitHub Docs <ExternalLink size={18} />
               </a>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplyChainLab;
