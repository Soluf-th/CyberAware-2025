
import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Menu, 
  X, 
  Search, 
  Activity, 
  Terminal, 
  BrainCircuit,
  Zap,
  ImageIcon,
  Film,
  Mic,
  Key,
  PackageSearch
} from 'lucide-react';
import { Section, InfoCardData } from './types';
import { HERO_TEXT, GOALS_DATA, ATTACK_TYPES, FUTURE_THREATS } from './constants';
import SystemMonitor from './components/SystemMonitor';
import cyberchat  from './components/cyberchat';
import ImageLab from './components/ImageLab';
import VideoLab from './components/VideoLab';
import LiveConversation from './components/LiveConversation';
import SecureAuthLab from './components/SecureAuthLab';
import SupplyChainLab from './components/SupplyChainLab';

const InfoCard: React.FC<{ data: InfoCardData }> = ({ data }) => (
  <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-xl hover:bg-slate-800 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-900/20 group">
    <div className="flex items-center mb-4">
      <div className={`p-3 rounded-lg bg-slate-900 ${data.color} group-hover:scale-110 transition-transform duration-300`}>
        <data.icon size={24} />
      </div>
      <h3 className="ml-4 text-xl font-bold text-slate-100">{data.title}</h3>
    </div>
    <p className="text-slate-400 leading-relaxed text-sm md:text-base">
      {data.description}
    </p>
  </div>
);

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<Section>(Section.HOME);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleNavChange = (section: Section) => {
    setActiveSection(section);
    setIsMenuOpen(false);
  };

  const NavLink: React.FC<{ section: Section; label: string; icon?: any }> = ({ section, label, icon: Icon }) => (
    <button
      onClick={() => handleNavChange(section)}
      className={`px-4 py-2 rounded-lg font-mono text-sm transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
        activeSection === section 
          ? 'bg-cyan-600 text-white font-bold shadow-lg shadow-cyan-500/50' 
          : 'text-slate-300 hover:text-white hover:bg-slate-800'
      }`}
    >
      {Icon && <Icon size={14} />}
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-cyan-500 selection:text-white">
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl opacity-30 animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl opacity-30"></div>
      </div>

      <nav className="fixed top-0 w-full z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center cursor-pointer shrink-0" onClick={() => handleNavChange(Section.HOME)}>
            <ShieldCheck className="w-8 h-8 text-cyan-400 mr-2" />
            <span className="text-xl font-bold tracking-wider text-white">CYBER<span className="text-cyan-400">GUARD</span></span>
          </div>
          
          <div className="hidden xl:flex items-center space-x-1 overflow-x-auto">
            <NavLink section={Section.HOME} label="HOME" />
            <NavLink section={Section.CHAT} label="AI CHAT" icon={Terminal} />
            <NavLink section={Section.SUPPLY_CHAIN} label="DEPENDABOT" icon={PackageSearch} />
            <NavLink section={Section.SECURE_AUTH} label="SECURE AUTH" icon={Key} />
            <NavLink section={Section.IMAGE_LAB} label="IMAGE LAB" icon={ImageIcon} />
            <NavLink section={Section.VIDEO_LAB} label="VIDEO LAB" icon={Film} />
            <NavLink section={Section.LIVE_VOICE} label="VOICE" icon={Mic} />
            <NavLink section={Section.MONITOR} label="MONITOR" icon={Activity} />
          </div>

          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="xl:hidden text-slate-300 p-2">
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="xl:hidden bg-slate-900 border-b border-slate-800 p-4 space-y-2 flex flex-col">
            <NavLink section={Section.HOME} label="HOME" />
            <NavLink section={Section.CHAT} label="AI CHAT" icon={Terminal} />
            <NavLink section={Section.SUPPLY_CHAIN} label="DEPENDABOT" icon={PackageSearch} />
            <NavLink section={Section.SECURE_AUTH} label="SECURE AUTH" icon={Key} />
            <NavLink section={Section.IMAGE_LAB} label="IMAGE LAB" icon={ImageIcon} />
            <NavLink section={Section.VIDEO_LAB} label="VIDEO LAB" icon={Film} />
            <NavLink section={Section.LIVE_VOICE} label="VOICE" icon={Mic} />
            <NavLink section={Section.MONITOR} label="MONITOR" icon={Activity} />
          </div>
        )}
      </nav>

      <main className="pt-24 pb-12 px-4 max-w-7xl mx-auto relative z-10">
        {activeSection === Section.HOME && (
          <div className="space-y-16 animate-fade-in">
            <div className="text-center space-y-6 py-10">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono mb-4">
                <span className="w-2 h-2 rounded-full bg-cyan-500 mr-2 animate-ping"></span>
                CYBER-DEFENSE SYSTEM 2025 ACTIVE
              </div>
              <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">CyberAware</span>
              </h1>
              <p className="max-w-3xl mx-auto text-lg md:text-xl text-slate-400 leading-relaxed">
                {HERO_TEXT}
              </p>
              <div className="flex justify-center gap-4 pt-4">
                <button 
                  onClick={() => handleNavChange(Section.LIVE_VOICE)}
                  className="px-8 py-4 bg-cyan-600 text-white font-bold rounded-xl hover:bg-cyan-500 transition-all flex items-center shadow-lg shadow-cyan-900/40"
                >
                  <Mic size={20} className="mr-2" /> Start Voice Consult
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {GOALS_DATA.map((goal, index) => (
                <InfoCard key={index} data={goal} />
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {ATTACK_TYPES.slice(0,3).map((attack, index) => (
                <InfoCard key={index} data={attack} />
              ))}
            </div>
          </div>
        )}

        {activeSection === Section.CHAT && <CyberChat />}
        {activeSection === Section.SUPPLY_CHAIN && <SupplyChainLab />}
        {activeSection === Section.SECURE_AUTH && <SecureAuthLab />}
        {activeSection === Section.IMAGE_LAB && <ImageLab />}
        {activeSection === Section.VIDEO_LAB && <VideoLab />}
        {activeSection === Section.LIVE_VOICE && <LiveConversation />}
        {activeSection === Section.MONITOR && <SystemMonitor />}
      </main>

      <footer className="bg-slate-900/50 border-t border-slate-800 py-8 text-center text-slate-500 text-sm">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2025 CyberGuard Advanced Labs. Powered by Gemini 3 Pro & Veo Engine.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
