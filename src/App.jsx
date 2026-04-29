import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, Send, Mic, Moon, Sun, Camera, BookOpen, Clock, Target, Volume2, 
  CheckCircle2, User, HelpCircle, AlertTriangle, MessageSquare, Menu, 
  ChevronLeft, Bell, Home, List, ShieldCheck, Calendar, Edit2, Check, 
  X, LogOut, ArrowRight, UserPlus, Fingerprint, Activity, Zap, Star, 
  Trophy, Settings, Play, Pause, FastForward, Info, BarChart2, PieChart,
  Scale, FileText, ChevronRight, Sparkles, MapPin, Globe, Shield,
  Award, TrendingUp, ThumbsUp, ThumbsDown, MessageCircle, Heart, Fingerprint as Scan
} from 'lucide-react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';

// ==========================================
// 1. MASSIVE MOCK DATABASE & CONSTANTS
// ==========================================

const APP_VERSION = "v5.0.0-WebUltra-Pro";

const CANDIDATE_DB = [
  { id: 'c1', name: 'Aisha Rahman', party: 'Progressive Future Party', color: 'from-emerald-400 to-teal-500', age: 45, experience: '12 Years (Former Mayor)', education: 'Ph.D. in Public Policy', coreFocus: 'Education & Green Energy', sentiment: 82, promises: ['Build 50 new solar-powered schools.', 'Provide free public Wi-Fi in all parks.', 'Reduce carbon emissions by 30% by 2030.'], strengths: ['Excellent orator', 'Strong youth appeal', 'Clean record'], weaknesses: ['Less experience in national defense', 'Seen as idealistic'], voterDemographic: 'Young adults, Urban professionals' },
  { id: 'c2', name: 'Vikram Singh', party: 'National Heritage Coalition', color: 'from-orange-400 to-red-500', age: 58, experience: '20 Years (Cabinet Minister)', education: 'Masters in Economics', coreFocus: 'Infrastructure & Economy', sentiment: 75, promises: ['Construct a new high-speed rail network.', 'Reduce corporate taxes to boost job creation.', 'Strengthen border security funding.'], strengths: ['Vast administrative experience', 'Strong rural support'], weaknesses: ['Older policies', 'Slower to adopt tech initiatives'], voterDemographic: 'Business owners, Rural populations' },
  { id: 'c3', name: 'Dr. Elena Rostova', party: 'Health & Science Alliance', color: 'from-blue-400 to-indigo-500', age: 50, experience: '15 Years (Chief Medical Officer)', education: 'M.D., Public Health', coreFocus: 'Healthcare & Tech Innovation', sentiment: 88, promises: ['Universal digital health records.', 'Triple funding for medical research.', 'Subsidized mental health care.'], strengths: ['Highly trusted', 'Data-driven policy making'], weaknesses: ['Lacks economic policy depth', 'Niche voter base'], voterDemographic: 'Healthcare workers, Academics' },
  { id: 'c4', name: 'Marcus Chen', party: 'Urban Reform Movement', color: 'from-purple-400 to-pink-500', age: 38, experience: '8 Years (City Council)', education: 'B.S. in Urban Planning', coreFocus: 'Housing & Public Transit', sentiment: 79, promises: ['Rent control in major metropolitan areas.', 'Free public transit for students and seniors.', 'Convert unused commercial space to housing.'], strengths: ['Relatable', 'Very active on social media'], weaknesses: ['Inexperienced with federal budgets', 'Radical views'], voterDemographic: 'Students, Urban renters' }
];

const QUIZ_BANK = [
  { id: 1, q: "What is the minimum voting age in India?", opts: ["16 Years", "18 Years", "21 Years"], ans: 1, exp: "The 61st Amendment Act of 1988 lowered the voting age from 21 to 18." },
  { id: 2, q: "Which document is primarily accepted to vote?", opts: ["Library Card", "EPIC (Voter ID)", "Credit Card"], ans: 1, exp: "EPIC stands for Electors Photo Identity Card." },
  { id: 3, q: "Who conducts general elections?", opts: ["Supreme Court", "Election Commission", "President"], ans: 1, exp: "The Election Commission is an autonomous constitutional authority." },
  { id: 4, q: "What does EVM stand for?", opts: ["Electronic Voting Machine", "Electoral Verification Module", "Electronic Voter Method"], ans: 0, exp: "EVMs have been used in all general and state assembly elections since 2004." },
  { id: 5, q: "What is the purpose of NOTA?", opts: ["Vote multiple times", "None Of The Above", "Skip voting"], ans: 1, exp: "NOTA allows voters to reject all candidates, expressing dissatisfaction." },
  { id: 6, q: "Which is the lower house of Parliament?", opts: ["Rajya Sabha", "Lok Sabha", "Vidhan Sabha"], ans: 1, exp: "Lok Sabha is the House of the People, directly elected by citizens." },
  { id: 7, q: "How often are general elections held?", opts: ["4 years", "5 years", "6 years"], ans: 1, exp: "Unless dissolved earlier, the Lok Sabha operates for 5 years." }
];

const NLP_PATTERNS = [
  { intent: 'greeting', regex: /\b(hi|hello|hey|namaste|vannakam)\b/i },
  { intent: 'how_to_vote', regex: /\b(how.*vote|guide.*vote|steps.*vote)\b/i },
  { intent: 'eligibility', regex: /\b(eligible|can i vote|allowed to vote|age to vote)\b/i },
  { intent: 'compare', regex: /\b(compare|difference between|versus|vs)\b/i },
  { intent: 'timeline', regex: /\b(timeline|when.*election|dates|schedule)\b/i },
  { intent: 'quiz', regex: /\b(quiz|test|exam|knowledge)\b/i },
  { intent: 'help', regex: /\b(help|support|what can you do)\b/i },
  { intent: 'candidates', regex: /\b(who.*candidates|leaders|politicians)\b/i }
];

// ==========================================
// 2. HELPER UTILITIES
// ==========================================

const calculateAge = (dob) => {
    if (!dob) return 0;
    const diff_ms = Date.now() - new Date(dob).getTime();
    const age_dt = new Date(diff_ms); 
    return Math.abs(age_dt.getUTCFullYear() - 1970);
};

const extractCandidatesForComparison = (text) => {
    const found = [];
    const words = text.toLowerCase().split(/\s+/);
    words.forEach(w => {
        if(w.length < 3) return;
        const cInfo = CANDIDATE_DB.find(c => c.name.toLowerCase().includes(w));
        if (cInfo && !found.find(f => f.id === cInfo.id)) found.push(cInfo);
    });
    return found;
};

// ==========================================
// 3. SUB-COMPONENTS
// ==========================================

const TypingIndicator = () => (
  <div className="flex gap-2 items-center p-3">
    <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }} className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
    <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
    <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
  </div>
);

const AnimatedTextStream = ({ content }) => {
    const [displayedText, setDisplayedText] = useState('');
    useEffect(() => {
        let i = 0;
        const intervalId = setInterval(() => {
            setDisplayedText(content.slice(0, i));
            i++;
            if (i > content.length) clearInterval(intervalId);
        }, 15);
        return () => clearInterval(intervalId);
    }, [content]);
    return <span>{displayedText}</span>;
};

const CompareWidget = ({ candidates, darkMode }) => {
    if (candidates.length !== 2) return <div className="text-red-500 font-bold p-4">AI Notice: Please specify exactly TWO candidates to compare.</div>;
    const [c1, c2] = candidates;

    return (
        <div className={`mt-4 rounded-3xl overflow-hidden border ${darkMode ? 'border-slate-700 bg-slate-800/80' : 'border-slate-200 bg-white/90'} shadow-2xl w-full`}>
            <div className="p-5 border-b border-inherit flex items-center justify-between bg-gradient-to-r from-blue-500/10 to-purple-500/10">
                <h4 className="font-black flex items-center gap-2 text-lg"><Scale size={20} className="text-blue-500"/> AI Comparison Protocol</h4>
                <span className="text-xs font-black tracking-widest bg-blue-500 text-white px-3 py-1 rounded-full animate-pulse">LIVE ANALYSIS</span>
            </div>
            
            <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-inherit">
                {[c1, c2].map((c, i) => (
                    <div key={c.id} className="flex-1 p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${c.color} flex items-center justify-center text-white font-black text-2xl shadow-lg`}>
                                {c.name.charAt(0)}
                            </div>
                            <div>
                                <h5 className="font-black text-2xl leading-tight mb-1">{c.name}</h5>
                                <p className="text-sm font-bold text-slate-500">{c.party}</p>
                            </div>
                        </div>
                        
                        <div className="space-y-5">
                            <div>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Core Focus</p>
                                <p className="font-bold text-[15px]">{c.coreFocus}</p>
                            </div>
                            <div>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">AI Sentiment</p>
                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                                    <div className="bg-emerald-500 h-3 rounded-full" style={{width: `${c.sentiment}%`}}></div>
                                </div>
                                <p className="text-right text-sm font-black mt-1 text-emerald-500">{c.sentiment}% Positive</p>
                            </div>
                            <div>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Key Promises</p>
                                <ul className="list-disc pl-5 text-[14px] font-semibold space-y-1">
                                    {c.promises.map((p, idx) => <li key={idx}>{p}</li>)}
                                </ul>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className={`p-6 border-t border-inherit ${darkMode ? 'bg-slate-900/50' : 'bg-slate-50'}`}>
                <p className="text-[15px] font-medium leading-relaxed">
                    <strong className="text-blue-500 text-lg">AI Summary:</strong> If your priorities align with <span className="text-blue-500 font-bold">{c1.coreFocus.toLowerCase()}</span>, {c1.name.split(' ')[0]} provides a strong historical alignment. However, if your primary concern is <span className="text-purple-500 font-bold">{c2.coreFocus.toLowerCase()}</span>, {c2.name.split(' ')[0]} offers more comprehensive policies in that sector.
                </p>
            </div>
        </div>
    );
};

// ==========================================
// 4. MAIN APPLICATION COMPONENT
// ==========================================

const ElectionGuideWeb = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); 
  
  const [user, setUser] = useState(null); 
  const [authView, setAuthView] = useState('login'); 
  const [authForm, setAuthForm] = useState({ username: '', password: '', dob: '' });
  
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [missions, setMissions] = useState([
    { id: 1, text: "Set up your secure profile.", done: false },
    { id: 2, text: "Explore the Candidate Database.", done: false },
    { id: 3, text: "Pass the Knowledge Quiz.", done: false },
    { id: 4, text: "Review the Voting Timeline.", done: false },
    { id: 5, text: "Cast a Mock Vote in Analytics.", done: false },
  ]);

  const [ttsSpeed, setTtsSpeed] = useState(1.0);
  const [quizState, setQuizState] = useState({ active: false, currentQ: 0, score: 0, showExp: false, selectedOpt: null });

  // Live Poll State
  const [mockVotes, setMockVotes] = useState({ c1: 4500, c2: 3200, c3: 2800, c4: 1500 });
  const [hasVoted, setHasVoted] = useState(false);

  const messagesEndRef = useRef(null);

  const gainXp = (amount) => {
      setXp(prev => {
          const newXp = prev + amount;
          const newLevel = Math.floor(newXp / 100) + 1;
          if (newLevel > level) {
              setLevel(newLevel);
              addMessage('system', `🎉 LEVEL UP! You are now Level ${newLevel}!`);
          }
          return newXp;
      });
  };

  const completeMission = (id) => {
      setMissions(prev => {
          const updated = prev.map(m => m.id === id ? { ...m, done: true } : m);
          if (updated.find(m => m.id === id)?.done && !prev.find(m => m.id === id)?.done) gainXp(50);
          return updated;
      });
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); 
      const cleanText = text.replace(/[\u{1F600}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = ttsSpeed; 
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if (!user && authView === 'none') {
        setTimeout(() => addMessage('bot', "Welcome to Election Guide Ultra! I am your AI Assistant. How can I help you today?"), 500);
    }
  }, [user, authView]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, activeTab]);

  const addMessage = (sender, content, type = 'text', stream = false) => {
    setMessages(prev => [...prev, { id: Date.now().toString() + Math.random().toString(), sender, content, type, stream }]);
  };

  const processInput = (text) => {
    const input = text.toLowerCase();
    let handled = false;

    if (NLP_PATTERNS.find(p => p.intent === 'compare').regex.test(input)) {
        const candidates = extractCandidatesForComparison(input);
        if (candidates.length === 2) {
            addMessage('bot', candidates, 'compare');
        } else {
            addMessage('bot', "I can compare candidates for you! Try asking 'Compare Aisha and Vikram'.", 'text', true);
        }
        handled = true;
    }
    else if (NLP_PATTERNS.find(p => p.intent === 'candidates').regex.test(input)) {
        addMessage('bot', "Here are some of the key leaders running in the upcoming elections:", 'text', true);
        CANDIDATE_DB.forEach((c, idx) => {
            setTimeout(() => {
                addMessage('bot', { title: c.name, subtitle: c.party, msg: `Focus: ${c.coreFocus} | Sentiment: ${c.sentiment}%` }, 'card');
            }, (idx + 1) * 300);
        });
        completeMission(2);
        handled = true;
    }
    else if (NLP_PATTERNS.find(p => p.intent === 'eligibility').regex.test(input)) {
        addMessage('bot', {
            title: "Eligibility Check",
            steps: [
                { id: 1, text: "Citizen Check", done: true },
                { id: 2, text: `Age Check (Age: ${user?.age || '?'})`, done: user?.isEligible },
                { id: 3, text: "ID Check", done: false }
            ],
            msg: user?.isEligible ? "You are fully ready to vote! Excellent." : "You need to be 18 to vote, but you can still learn!"
        }, 'checker');
        handled = true;
    }
    else if (NLP_PATTERNS.find(p => p.intent === 'how_to_vote').regex.test(input)) {
        addMessage('bot', {
            title: '4 Simple Steps to Vote',
            steps: [
                { id: 1, text: 'Register on the National Voter Portal online.', done: true },
                { id: 2, text: 'Receive your physical Voter ID card.', done: true },
                { id: 3, text: 'Find your assigned local polling station.', done: false },
                { id: 4, text: 'Press the button on the EVM machine to cast your vote!', done: false },
            ]
        }, 'steps');
        handled = true;
    }
    else if (NLP_PATTERNS.find(p => p.intent === 'timeline').regex.test(input)) {
        setActiveTab('timeline');
        addMessage('bot', "Navigated to Timeline tab.", 'text', true);
        completeMission(4);
        handled = true;
    }
    else if (NLP_PATTERNS.find(p => p.intent === 'quiz').regex.test(input)) {
        setActiveTab('learn');
        addMessage('bot', "Navigated to Learning Academy.", 'text', true);
        handled = true;
    }

    if (!handled) {
        addMessage('bot', "That's an interesting question! You can ask me to 'Compare candidates', check your eligibility, or explain how to vote.", 'text', true);
    }
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;
    addMessage('user', inputValue);
    const userText = inputValue;
    setInputValue('');
    setIsTyping(true);
    gainXp(5); 
    
    setTimeout(() => {
      processInput(userText);
      setIsTyping(false);
    }, 1200);
  };

  const handleVoiceInput = () => {
      setIsRecording(true);
      setTimeout(() => {
          setIsRecording(false);
          setInputValue("Compare Aisha and Vikram");
      }, 2000);
  };

  const castMockVote = (cId) => {
      if (hasVoted) return;
      setMockVotes(prev => ({ ...prev, [cId]: prev[cId] + 1 }));
      setHasVoted(true);
      completeMission(5);
      gainXp(100);
  };

  const mirrorBtnClass = `relative overflow-hidden backdrop-blur-2xl border ${darkMode ? 'bg-white/10 border-white/20 shadow-[0_8px_32px_rgba(255,255,255,0.05)] text-white' : 'bg-white/50 border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.08)] text-slate-800'} transition-all font-bold`;
  const glassPanelClass = `${darkMode ? 'bg-slate-900/80 border-slate-700/50 text-white' : 'bg-white/80 border-white text-slate-900'} backdrop-blur-3xl shadow-2xl`;

  // --- Auth Flow ---
  if (!user || authView !== 'none') {
      return (
          <div className={`flex justify-center items-center min-h-screen ${darkMode ? 'bg-slate-950' : 'bg-slate-100'} font-sans p-4 sm:p-8`}>
             <div className="fixed inset-0 overflow-hidden pointer-events-none">
                 <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-blue-500/20 rounded-full blur-[100px] mix-blend-screen animate-[pulse_8s_ease-in-out_infinite]"></div>
                 <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-purple-500/20 rounded-full blur-[100px] mix-blend-screen animate-[pulse_10s_ease-in-out_infinite_reverse]"></div>
             </div>

            <div className={`w-full max-w-5xl h-[800px] rounded-[40px] relative overflow-hidden flex flex-col md:flex-row ${glassPanelClass} border-[8px] z-10 shadow-[0_30px_60px_rgba(0,0,0,0.2)]`}>
                <div className="hidden md:flex flex-1 bg-gradient-to-br from-blue-600 to-indigo-700 items-center justify-center p-12 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30"></div>
                    <div className="relative z-10 text-white space-y-6 max-w-md">
                        <ShieldCheck size={80} className="mb-8" />
                        <h1 className="text-6xl font-black tracking-tight leading-tight">Election<br/>Guide Ultra</h1>
                        <p className="text-xl font-medium opacity-80">Your completely comprehensive, AI-powered assistant for understanding the electoral process, comparing candidates, and verifying your eligibility.</p>
                    </div>
                </div>

                <div className="flex-1 flex flex-col justify-center p-8 md:p-16 z-10 relative">
                    {authView === 'face_scan_setup' || authView === 'face_scan_login' ? (
                        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="flex flex-col items-center py-8">
                            <h1 className="text-3xl font-black text-center mb-10 tracking-tight">Face ID Verification</h1>
                            <div className="w-56 h-56 rounded-[50px] border-[4px] border-blue-500/30 flex items-center justify-center relative overflow-hidden bg-blue-500/5">
                                <div className="absolute inset-0 border-[4px] border-blue-500 border-t-transparent rounded-[50px] animate-[spin_3s_linear_infinite]"></div>
                                <motion.div animate={{scale:[1,1.1,1], opacity:[0.5,1,0.5]}} transition={{repeat:Infinity, duration:2}} className="z-10">
                                    <Scan className="text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.8)]" size={80} />
                                </motion.div>
                            </div>
                            <p className="font-black text-[14px] uppercase tracking-[0.2em] text-blue-500 mt-12 animate-pulse">Analyzing Biometrics...</p>
                            
                            {authView === 'face_scan_setup' && <button onClick={() => {setUser(prev => ({ ...prev, faceVerified: true })); setAuthView('none');}} className={`mt-10 w-full p-4 rounded-2xl ${mirrorBtnClass} hover:scale-[1.02]`}>Complete Setup</button>}
                            {authView === 'face_scan_login' && <button onClick={() => {setUser({ username: 'Verified Citizen', dob: '1998-10-20', age: 25, isEligible: true, faceVerified: true, idNumber: 'IND-99X-2241' }); setAuthView('none'); completeMission(1);}} className={`mt-10 w-full p-4 rounded-2xl ${mirrorBtnClass} hover:scale-[1.02]`}>Simulate Match</button>}
                        </motion.div>
                    ) : authView === 'signup' ? (
                        <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} className="space-y-6 w-full max-w-md mx-auto">
                            <h2 className="text-4xl font-black mb-2 tracking-tight">Sign Up</h2>
                            <p className="text-slate-500 dark:text-slate-400 mb-8 font-bold">Create your secure digital voter profile.</p>
                            
                            <div className="space-y-5">
                                <input type="text" placeholder="Full Legal Name" required value={authForm.username} onChange={e => setAuthForm({...authForm, username: e.target.value})} className={`w-full p-5 rounded-[20px] outline-none font-bold transition-all ${mirrorBtnClass} focus:ring-4 focus:ring-blue-500/30 text-lg`} />
                                <input type="date" required value={authForm.dob} onChange={e => setAuthForm({...authForm, dob: e.target.value})} className={`w-full p-5 rounded-[20px] outline-none font-bold transition-all ${mirrorBtnClass} focus:ring-4 focus:ring-blue-500/30 text-lg`} />
                                <input type="password" placeholder="Secure Passcode" required value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} className={`w-full p-5 rounded-[20px] outline-none font-bold transition-all ${mirrorBtnClass} focus:ring-4 focus:ring-blue-500/30 text-lg`} />
                            </div>
                            
                            <button type="submit" onClick={(e) => { e.preventDefault(); if(authForm.username && authForm.dob) { setUser({ username: authForm.username, dob: authForm.dob, age: calculateAge(authForm.dob), isEligible: calculateAge(authForm.dob) >= 18, faceVerified: false, idNumber: `IND-${Math.floor(Math.random()*1000)}X-${Math.floor(Math.random()*9000)}` }); setAuthView('face_scan_setup'); } }} className="w-full mt-8 p-5 rounded-[20px] text-xl font-black text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-xl shadow-blue-500/30 hover:scale-[1.02] transition-transform">Continue Registration</button>
                            <p className="text-center font-bold mt-6 text-[16px] text-slate-500">Already registered? <span className="text-blue-500 cursor-pointer hover:underline" onClick={() => setAuthView('login')}>Log In</span></p>
                        </motion.div>
                    ) : (
                        <motion.div initial={{opacity:0, x:-20}} animate={{opacity:1, x:0}} className="space-y-6 w-full max-w-md mx-auto">
                            <h2 className="text-4xl font-black mb-2 tracking-tight">Welcome Back</h2>
                            <p className="text-slate-500 dark:text-slate-400 mb-8 font-bold">Secure login required.</p>

                            <div className="space-y-5">
                                <input type="text" placeholder="Citizen ID" required value={authForm.username} onChange={e => setAuthForm({...authForm, username: e.target.value})} className={`w-full p-5 rounded-[20px] outline-none font-bold transition-all ${mirrorBtnClass} focus:ring-4 focus:ring-blue-500/30 text-lg`} />
                                <input type="password" placeholder="Passcode" required value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} className={`w-full p-5 rounded-[20px] outline-none font-bold transition-all ${mirrorBtnClass} focus:ring-4 focus:ring-blue-500/30 text-lg`} />
                            </div>
                            
                            <button type="submit" onClick={(e) => { e.preventDefault(); if(authForm.username) { setUser({ username: authForm.username, dob: '1995-05-15', age: 29, isEligible: true, faceVerified: true, idNumber: 'IND-492X-8102' }); setAuthView('none'); completeMission(1); } }} className="w-full mt-6 p-5 rounded-[20px] text-xl font-black text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-xl shadow-blue-500/30 hover:scale-[1.02] transition-transform">Secure Login</button>
                            
                            <div className="relative py-8">
                                <div className="absolute inset-0 flex items-center"><div className={`w-full border-t ${darkMode?'border-white/10':'border-slate-300'}`}></div></div>
                                <div className="relative flex justify-center"><span className={`px-4 text-sm font-black tracking-widest ${darkMode ? 'bg-slate-900 text-slate-500' : 'bg-slate-50 text-slate-400'}`}>OR</span></div>
                            </div>

                            <button type="button" onClick={() => setAuthView('face_scan_login')} className={`w-full flex items-center justify-center gap-3 p-5 rounded-[20px] text-xl hover:scale-[1.02] ${mirrorBtnClass}`}>
                                <Camera size={24} className="text-blue-500"/> Face ID Fast Login
                            </button>
                            <p className="text-center font-bold mt-8 text-[16px] text-slate-500">New Citizen? <span className="text-blue-500 cursor-pointer hover:underline" onClick={() => setAuthView('signup')}>Sign Up</span></p>
                        </motion.div>
                    )}
                </div>
            </div>
          </div>
      );
  }

  // --- Main Website Dashboard Layout ---
  const NAV_ITEMS = [ 
      { id: 'chat', icon: MessageCircle, label: 'AI Chat' },
      { id: 'timeline', icon: Calendar, label: 'Timeline' },
      { id: 'analytics', icon: BarChart2, label: 'Analytics' },
      { id: 'tasks', icon: Target, label: 'Missions' },
      { id: 'learn', icon: BookOpen, label: 'Academy' },
      { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className={`flex justify-center items-center h-screen ${darkMode ? 'bg-slate-950' : 'bg-slate-100'} font-sans p-0 sm:p-6 lg:p-10 transition-colors duration-500`}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          {[...Array(20)].map((_, i) => (
              <div key={i} className={`absolute rounded-full mix-blend-screen animate-pulse ${darkMode ? 'bg-blue-400/10' : 'bg-blue-600/5'}`} style={{ width: Math.random() * 400 + 100 + 'px', height: Math.random() * 400 + 100 + 'px', left: Math.random() * 100 + 'vw', top: Math.random() * 100 + 'vh', animationDuration: (Math.random() * 10 + 5) + 's', animationDelay: (Math.random() * 5) + 's' }}></div>
          ))}
      </div>

      <div className={`w-full h-full max-w-[1600px] rounded-none sm:rounded-[40px] relative overflow-hidden flex flex-col md:flex-row transition-colors duration-500 ${glassPanelClass} border-0 sm:border-[8px] z-10 shadow-[0_30px_60px_rgba(0,0,0,0.2)]`}>
        
        {/* DESKTOP SIDEBAR */}
        <aside className={`hidden md:flex flex-col w-[280px] h-full border-r ${darkMode ? 'border-white/10 bg-slate-900/50' : 'border-slate-200 bg-white/50'} backdrop-blur-xl p-6`}>
            <div className="flex items-center gap-4 mb-12">
                <div className={`w-14 h-14 rounded-[20px] flex items-center justify-center text-white bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl border border-white/20`}>
                    <ShieldCheck size={28} />
                </div>
                <div>
                    <h1 className="font-black text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">Ultra Guide</h1>
                    <p className="text-xs font-black uppercase tracking-widest text-emerald-500 mt-1">Status: Active</p>
                </div>
            </div>

            <nav className="flex-1 space-y-3">
                {NAV_ITEMS.map(item => {
                    const isActive = activeTab === item.id;
                    return (
                        <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-4 p-4 rounded-[20px] font-black text-[16px] transition-all duration-300 ${isActive ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30' : 'text-slate-500 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-white'}`}>
                            <item.icon size={24} className={isActive ? 'stroke-[2.5px]' : 'stroke-[2px]'}/> {item.label}
                        </button>
                    );
                })}
            </nav>

            <div className={`mt-auto p-5 rounded-[24px] ${mirrorBtnClass} text-center space-y-3`}>
                <div className="flex justify-between items-center px-2">
                    <span className="font-bold text-sm text-slate-500 uppercase tracking-widest">Lvl {level}</span>
                    <span className="font-black text-blue-500">{xp} XP</span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{width: `${(xp%100)}%`}}></div>
                </div>
                <button onClick={() => setDarkMode(!darkMode)} className={`w-full mt-4 flex items-center justify-center gap-2 p-3 rounded-[16px] font-bold ${darkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-white hover:bg-slate-50'} transition-colors`}>
                    {darkMode ? <Sun size={18} className="text-yellow-400"/> : <Moon size={18}/>} Toggle Theme
                </button>
            </div>
        </aside>

        {/* MOBILE HEADER */}
        <header className={`md:hidden pt-12 pb-4 px-6 flex justify-between items-center z-20 border-b ${darkMode ? 'border-white/10 bg-slate-900/50' : 'border-slate-200 bg-white/50'} backdrop-blur-md sticky top-0`}>
            <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-[18px] flex items-center justify-center text-white bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg border border-white/20`}><ShieldCheck size={24} /></div>
                <div>
                    <h1 className="font-black text-[18px] leading-tight tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">Ultra Guide</h1>
                    <p className="text-[11px] font-black uppercase tracking-widest flex items-center gap-1"><span className="text-yellow-500 flex items-center"><Star size={12} className="mr-1 inline fill-yellow-500"/> Lvl {level}</span></p>
                </div>
            </div>
            <button onClick={() => setDarkMode(!darkMode)} className={`p-3 rounded-[16px] transition-transform hover:scale-105 ${mirrorBtnClass}`}>{darkMode ? <Sun size={20} className="text-yellow-400"/> : <Moon size={20}/>}</button>
        </header>

        {/* CONTENT AREA */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative flex flex-col md:pb-0 pb-[100px] no-scrollbar">
            
            {/* CHAT TAB */}
            {activeTab === 'chat' && (
                <div className="flex flex-col flex-1 relative max-w-4xl mx-auto w-full">
                    <div className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto pb-[200px]">
                        <AnimatePresence>
                            {messages.map((msg) => {
                                const isBot = msg.sender === 'bot';
                                const isSystem = msg.sender === 'system';

                                if (isSystem) {
                                    return (
                                        <motion.div key={msg.id} initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} className="flex justify-center my-6">
                                            <div className="px-6 py-3 rounded-full font-black text-[12px] uppercase tracking-[0.2em] bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg flex items-center gap-3">
                                                <Trophy size={16}/> {msg.content}
                                            </div>
                                        </motion.div>
                                    );
                                }

                                return (
                                    <motion.div key={msg.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-4`}>
                                        <div className={`max-w-[85%] md:max-w-[75%] rounded-[30px] p-6 md:p-8 shadow-xl ${isBot ? mirrorBtnClass : 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white border-none'} ${isBot ? 'rounded-tl-sm' : 'rounded-tr-sm'}`}>
                                            
                                            {isBot && (
                                                <div className={`flex justify-between items-center mb-4 pb-4 border-b ${darkMode ? 'border-white/10' : 'border-black/5'}`}>
                                                    <div className="flex items-center gap-3 text-blue-500 font-black text-[14px] uppercase tracking-widest"><Bot size={20} /> Ultra AI</div>
                                                    <button onClick={() => speakText(typeof msg.content === 'string' ? msg.content : "Displaying interactive content")} className="text-slate-400 hover:text-blue-500 transition-colors p-2 bg-white/10 rounded-full"><Volume2 size={18} /></button>
                                                </div>
                                            )}
                                            
                                            {msg.type === 'text' && (
                                                <div className="text-[16px] md:text-[18px] font-semibold leading-relaxed whitespace-pre-line">{msg.stream ? <AnimatedTextStream content={msg.content} /> : msg.content}</div>
                                            )}

                                            {msg.type === 'compare' && <CompareWidget candidates={msg.content} darkMode={darkMode} />}

                                            {msg.type === 'card' && (
                                                <div className="space-y-3">
                                                    <h3 className="font-black text-2xl text-blue-500">{msg.content.title}</h3>
                                                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{msg.content.subtitle}</p>
                                                    <div className={`mt-4 p-4 rounded-2xl border ${darkMode?'bg-slate-800/50 border-slate-700':'bg-slate-50 border-slate-200'}`}><p className="text-[16px] font-semibold">{msg.content.msg}</p></div>
                                                </div>
                                            )}

                                            {msg.type === 'checker' && (
                                                <div className="space-y-5">
                                                    <h3 className="font-black text-xl flex items-center gap-3"><Activity size={24} className="text-blue-500"/> {msg.content.title}</h3>
                                                    <div className="space-y-3">
                                                        {msg.content.steps.map(step => (
                                                            <div key={step.id} className={`p-4 rounded-[20px] border flex items-center gap-4 ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white/50 border-slate-200'}`}>
                                                                {step.done ? <CheckCircle2 className="text-emerald-500" size={24}/> : <AlertTriangle className="text-amber-500" size={24}/>}
                                                                <span className={`font-bold text-[16px] ${!step.done && 'text-slate-500'}`}>{step.text}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <p className={`font-bold text-[16px] mt-4 p-5 rounded-[20px] border ${msg.content.msg.includes('ready') ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400'}`}>{msg.content.msg}</p>
                                                </div>
                                            )}

                                            {msg.type === 'steps' && (
                                                <div className="space-y-4">
                                                    <h3 className="font-black text-xl mb-4 text-blue-500">{msg.content.title}</h3>
                                                    {msg.content.steps.map(step => (
                                                        <div key={step.id} className={`flex items-center gap-4 p-4 rounded-[20px] border ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white/50 border-slate-200'}`}>
                                                            <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-black text-[16px] shrink-0 shadow-lg">{step.id}</div>
                                                            <div className="flex-1 font-bold text-[16px]">{step.text}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                        
                        {isTyping && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start mb-4">
                                <div className={`p-6 rounded-[30px] rounded-tl-sm ${mirrorBtnClass}`}><TypingIndicator /></div>
                            </motion.div>
                        )}
                        <div ref={messagesEndRef} className="h-10"/>
                    </div>

                    <div className={`absolute bottom-0 w-full p-6 md:p-10 z-20 ${darkMode ? 'bg-gradient-to-t from-slate-900 via-slate-900/90 to-transparent' : 'bg-gradient-to-t from-slate-50 via-slate-50/90 to-transparent'}`}>
                        <div className="flex gap-3 overflow-x-auto pb-6 pt-2 no-scrollbar px-2 snap-x">
                            {['Compare Aisha and Vikram', 'How to vote?', 'Am I eligible?', 'Show Candidates'].map((txt, i) => (
                                <button key={i} onClick={() => { setInputValue(txt); setTimeout(handleSend, 100); }} className={`snap-start whitespace-nowrap px-6 py-4 rounded-full text-[15px] font-black ${mirrorBtnClass} hover:scale-105 active:scale-95 shadow-lg`}>{txt}</button>
                            ))}
                        </div>
                        <div className="flex gap-3 items-center relative drop-shadow-2xl">
                            <button onClick={handleVoiceInput} className={`absolute left-3 p-4 rounded-full transition-all z-10 ${isRecording ? 'text-white bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.6)] animate-pulse' : 'text-slate-400 hover:text-blue-500 bg-transparent'}`}><Mic size={28} /></button>
                            <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} placeholder="Ask me anything (e.g. 'Compare Aisha and Vikram')..." className={`w-full rounded-[35px] pl-20 pr-20 py-6 focus:outline-none focus:ring-[4px] focus:ring-blue-500/40 font-bold text-[18px] shadow-2xl ${darkMode ? 'bg-slate-800/90 border-2 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-2 border-slate-200 text-slate-800 placeholder-slate-400'} backdrop-blur-2xl transition-all`} />
                            <button onClick={handleSend} disabled={!inputValue.trim() || isTyping} className={`absolute right-3 p-4 rounded-full ${inputValue.trim() ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-xl hover:scale-110' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'} transition-all`}><Send size={24} className={inputValue.trim() ? "translate-x-0.5" : ""} /></button>
                        </div>
                    </div>
                </div>
            )}

            {/* NEW FEATURE: ANALYTICS / LIVE POLLS TAB */}
            {activeTab === 'analytics' && (
                <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="p-8 md:p-16 max-w-5xl mx-auto w-full">
                    <h2 className="text-5xl font-black mb-12 flex items-center gap-4 tracking-tight"><BarChart2 className="text-indigo-500" size={48}/> Live Pulse Analytics</h2>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Vote Tracker */}
                        <div className={`col-span-2 p-10 rounded-[40px] ${mirrorBtnClass} shadow-2xl`}>
                            <div className="flex justify-between items-end mb-8">
                                <div>
                                    <h3 className="font-black text-3xl mb-2 tracking-tight">National Mock Poll</h3>
                                    <p className="text-slate-500 font-bold text-lg">Real-time simulation of voter preferences.</p>
                                </div>
                                <span className="bg-red-500/10 text-red-500 font-black px-4 py-2 rounded-full uppercase tracking-widest text-sm flex items-center gap-2 animate-pulse"><div className="w-2 h-2 bg-red-500 rounded-full"></div> LIVE</span>
                            </div>

                            <div className="space-y-6 mb-10">
                                {CANDIDATE_DB.slice(0,4).map(c => {
                                    const totalVotes = Object.values(mockVotes).reduce((a,b)=>a+b, 0);
                                    const percent = ((mockVotes[c.id] / totalVotes) * 100).toFixed(1);
                                    
                                    return (
                                        <div key={c.id}>
                                            <div className="flex justify-between font-black mb-2 text-lg">
                                                <span>{c.name} <span className="text-slate-500 font-bold text-sm ml-2">{c.party}</span></span>
                                                <span>{percent}%</span>
                                            </div>
                                            <div className="w-full h-6 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
                                                <motion.div initial={{width: 0}} animate={{width: `${percent}%`}} transition={{duration: 1}} className={`h-full bg-gradient-to-r ${c.color} rounded-full`}></motion.div>
                                            </div>
                                            <p className="text-xs font-bold text-slate-400 mt-2 text-right">{mockVotes[c.id].toLocaleString()} simulated votes</p>
                                        </div>
                                    )
                                })}
                            </div>

                            {!hasVoted ? (
                                <div className={`p-8 rounded-[30px] border-2 border-indigo-500 border-dashed ${darkMode ? 'bg-indigo-500/10' : 'bg-indigo-50'}`}>
                                    <h4 className="font-black text-2xl mb-4 text-center">Cast Your Mock Vote</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {CANDIDATE_DB.slice(0,4).map(c => (
                                            <button key={c.id} onClick={() => castMockVote(c.id)} className={`p-4 rounded-2xl font-black text-white bg-gradient-to-br ${c.color} hover:scale-105 transition-transform shadow-lg flex flex-col items-center justify-center text-center h-24`}>
                                                {c.name.split(' ')[0]}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="p-8 rounded-[30px] bg-emerald-500/10 border-2 border-emerald-500/20 text-center">
                                    <CheckCircle2 size={48} className="text-emerald-500 mx-auto mb-4"/>
                                    <h4 className="font-black text-2xl text-emerald-600 dark:text-emerald-400 mb-2">Vote Recorded</h4>
                                    <p className="font-bold opacity-80 text-emerald-700 dark:text-emerald-300">Thank you for participating in the mock election. You earned 100 XP!</p>
                                </div>
                            )}
                        </div>

                        {/* Demographic Stats */}
                        <div className="space-y-8">
                            <div className={`p-8 rounded-[40px] ${mirrorBtnClass} shadow-2xl`}>
                                <h3 className="font-black text-2xl mb-6">Demographic Split</h3>
                                <div className="flex items-center justify-center mb-6">
                                    <div className="w-48 h-48 rounded-full border-[16px] border-indigo-500 border-r-emerald-500 border-b-orange-500 border-l-purple-500 relative flex items-center justify-center">
                                        <div className="text-center">
                                            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Total</p>
                                            <p className="text-2xl font-black">{Object.values(mockVotes).reduce((a,b)=>a+b, 0).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                                <ul className="space-y-3 font-bold text-sm">
                                    <li className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-indigo-500"></div> Urban Professionals (35%)</li>
                                    <li className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div> Youth & Students (25%)</li>
                                    <li className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-500"></div> Rural Voters (25%)</li>
                                    <li className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-purple-500"></div> Senior Citizens (15%)</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* TIMELINE TAB */}
            {activeTab === 'timeline' && (
                <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="p-8 md:p-16 max-w-5xl mx-auto w-full">
                    <h2 className="text-5xl font-black mb-12 flex items-center gap-4 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500"><Clock className="text-blue-500" size={48}/> Timeline</h2>
                    <div className="relative ml-8 space-y-16 py-6">
                        <div className="absolute top-0 bottom-0 left-[2px] w-2 bg-gradient-to-b from-blue-500 via-purple-500 to-transparent rounded-full opacity-30"></div>
                        {[
                            { title: 'Election Notification', desc: 'The official announcement declaring election dates. All parties prepare their manifestos.', date: 'Oct 15' },
                            { title: 'Nomination Filing', desc: 'Candidates submit their official papers to run for their respective constituencies.', date: 'Oct 22' },
                            { title: 'Scrutiny & Withdrawal', desc: 'Checking papers and allowing drop-outs before finalizing the candidate list.', date: 'Oct 25' },
                            { title: 'Campaigning Period', desc: 'Rallies, speeches, and debates take place across the nation.', date: 'Nov 1 - Nov 18' },
                            { title: 'Polling Day', desc: 'Citizens cast their votes at assigned booths using Electronic Voting Machines.', date: 'Nov 20' },
                            { title: 'Counting & Results', desc: 'Votes are officially counted and winners declared by the Election Commission.', date: 'Nov 23' },
                        ].map((event, i) => (
                            <motion.div initial={{opacity:0, x:50}} animate={{opacity:1, x:0}} transition={{delay: i*0.1}} key={i} className={`relative pl-16 ${mirrorBtnClass} p-8 rounded-[30px] shadow-xl`}>
                                <div className="absolute -left-[38px] top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 border-[6px] border-white dark:border-slate-900 shadow-[0_0_20px_rgba(59,130,246,0.6)] flex items-center justify-center"><div className="w-3 h-3 bg-white rounded-full animate-pulse"></div></div>
                                <div className="text-[14px] font-black text-blue-500 bg-blue-500/10 inline-block px-4 py-1.5 rounded-full mb-4 uppercase tracking-widest">{event.date}</div>
                                <div className="font-black text-3xl leading-tight mb-3">{event.title}</div>
                                <div className="text-[18px] font-semibold opacity-70 leading-relaxed max-w-2xl">{event.desc}</div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* PROFILE TAB W/ DIGITAL ID CARD */}
            {activeTab === 'profile' && (
                <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className="p-8 md:p-16 max-w-5xl mx-auto w-full">
                    <h2 className="text-5xl font-black mb-12 flex items-center gap-4 tracking-tight"><User className="text-purple-500" size={48}/> Digital Profile</h2>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {/* THE NEW DIGITAL ID CARD */}
                        <div className={`relative overflow-hidden rounded-[40px] p-10 text-white shadow-[0_30px_60px_rgba(0,0,0,0.3)] bg-gradient-to-br from-indigo-800 via-blue-700 to-purple-900 border-4 border-white/20`}>
                            {/* Hologram Overlay */}
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/hexellence.png')] opacity-20 mix-blend-overlay"></div>
                            <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                            <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"></div>
                            
                            <div className="relative z-10 flex justify-between items-start mb-10 border-b border-white/20 pb-6">
                                <div>
                                    <h3 className="font-black text-2xl tracking-widest uppercase text-white/90">Elector Photo ID Card</h3>
                                    <p className="text-blue-300 font-bold text-sm tracking-widest uppercase mt-1">Election Commission Validated</p>
                                </div>
                                <ShieldCheck size={48} className="text-emerald-400 opacity-90"/>
                            </div>

                            <div className="relative z-10 flex gap-8 items-center mb-10">
                                <div className="w-32 h-32 rounded-2xl bg-slate-900/50 border-2 border-white/30 p-2 relative">
                                    <div className="w-full h-full bg-slate-800 rounded-xl flex items-center justify-center overflow-hidden">
                                        <span className="text-6xl font-black">{user.username.charAt(0).toUpperCase()}</span>
                                    </div>
                                    <div className="absolute -bottom-3 -right-3 bg-emerald-500 p-1.5 rounded-full border-2 border-indigo-900"><Check size={16} strokeWidth={4}/></div>
                                </div>
                                
                                <div className="flex-1 space-y-4">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-widest text-blue-300 font-bold">Elector Name</p>
                                        <p className="font-black text-3xl tracking-tight leading-none">{user.username}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[10px] uppercase tracking-widest text-blue-300 font-bold">Date of Birth</p>
                                            <p className="font-black text-lg">{user.dob}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-widest text-blue-300 font-bold">Voter Status</p>
                                            <p className={`font-black text-lg ${user.isEligible ? 'text-emerald-400' : 'text-red-400'}`}>{user.isEligible ? 'ELIGIBLE' : 'UNDERAGE'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="relative z-10 flex justify-between items-end pt-6 border-t border-white/20">
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-blue-300 font-bold mb-1">Secure Digital ID Number</p>
                                    <p className="font-mono text-xl font-bold tracking-[0.3em]">{user.idNumber}</p>
                                </div>
                                <div className="w-16 h-16 bg-white rounded-lg p-1">
                                    <div className="w-full h-full border-4 border-slate-900 border-dashed rounded opacity-80"></div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className={`p-10 rounded-[40px] ${mirrorBtnClass} shadow-2xl`}>
                                <h4 className="font-black text-2xl mb-6 flex items-center gap-3"><Award className="text-yellow-500" size={32}/> Progress</h4>
                                <div className="flex items-center gap-6 mb-6">
                                    <div className="w-24 h-24 rounded-[24px] bg-gradient-to-br from-yellow-400 to-orange-500 flex flex-col items-center justify-center text-white shadow-lg">
                                        <span className="text-sm font-black uppercase tracking-widest opacity-80">Level</span>
                                        <span className="text-4xl font-black">{level}</span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between font-black text-lg mb-2">
                                            <span>Experience</span>
                                            <span className="text-blue-500">{xp} / {(level)*100}</span>
                                        </div>
                                        <div className="w-full h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500 transition-all duration-1000" style={{width: `${(xp%100)}%`}}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className={`p-10 rounded-[40px] ${mirrorBtnClass} shadow-2xl`}>
                                <h4 className="font-black text-2xl mb-6 flex items-center gap-3"><Target className="text-emerald-500" size={32}/> Tasks</h4>
                                <div className="space-y-4">
                                    {missions.map(mission => (
                                        <div key={mission.id} className={`p-5 rounded-[20px] flex items-center gap-4 ${darkMode?'bg-slate-800/50':'bg-slate-50'}`}>
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${mission.done ? 'bg-emerald-500 text-white' : 'bg-slate-300 dark:bg-slate-700'}`}>
                                                {mission.done && <Check strokeWidth={4} size={16}/>}
                                            </div>
                                            <span className={`font-bold text-[16px] ${mission.done ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>{mission.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <button onClick={() => setUser(null)} className={`w-full p-6 rounded-[24px] font-black text-xl text-red-500 flex items-center justify-center gap-3 ${mirrorBtnClass} border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/20`}>
                        <LogOut size={24}/> Secure Logout
                    </button>
                </motion.div>
            )}

            {/* LEARN/QUIZ TAB */}
            {activeTab === 'learn' && (
                <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="p-8 md:p-16 max-w-4xl mx-auto w-full">
                    <h2 className="text-5xl font-black mb-12 flex items-center gap-4 tracking-tight"><BookOpen className="text-orange-500" size={48}/> Academy</h2>
                    {!quizState.active && quizState.score === 0 ? (
                        <div className={`p-16 rounded-[50px] text-center ${mirrorBtnClass} shadow-2xl`}>
                            <div className="w-40 h-40 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-10 text-white shadow-[0_20px_50px_rgba(249,115,22,0.4)] relative">
                                <List size={64} strokeWidth={2.5}/>
                                <div className="absolute -bottom-2 -right-2 bg-yellow-400 w-14 h-14 rounded-full border-[6px] border-white dark:border-slate-800 flex items-center justify-center text-yellow-900 font-black text-lg">7Q</div>
                            </div>
                            <h3 className="font-black text-5xl mb-6 tracking-tight">Final Exam</h3>
                            <p className="text-[20px] font-bold text-slate-500 mb-12 leading-relaxed max-w-xl mx-auto">Prove your civic knowledge in this comprehensive master assessment. Earn massive XP!</p>
                            <button onClick={() => setQuizState({active: true, currentQ: 0, score: 0, showExp: false, selectedOpt: null})} className="w-full max-w-md mx-auto block py-6 text-white font-black text-2xl rounded-[30px] bg-gradient-to-r from-orange-500 to-red-500 shadow-2xl shadow-orange-500/40 hover:scale-[1.05] transition-transform">Start Assessment</button>
                        </div>
                    ) : quizState.currentQ < QUIZ_BANK.length ? (
                        <div className={`p-10 md:p-16 rounded-[50px] ${mirrorBtnClass} shadow-2xl`}>
                            <div className="flex justify-between items-center mb-10">
                                <div className="text-[16px] font-black text-orange-500 uppercase tracking-[0.2em] bg-orange-500/10 px-6 py-3 rounded-full">Question {quizState.currentQ + 1} of {QUIZ_BANK.length}</div>
                                <div className="text-xl font-black opacity-50">{Math.round((quizState.currentQ / QUIZ_BANK.length)*100)}%</div>
                            </div>
                            <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full mb-12 overflow-hidden"><div className="h-full bg-orange-500 transition-all duration-500" style={{width: `${(quizState.currentQ / QUIZ_BANK.length)*100}%`}}></div></div>
                            <h3 className="font-black text-3xl md:text-4xl mb-12 leading-snug">{QUIZ_BANK[quizState.currentQ].q}</h3>
                            <div className="space-y-6">
                                {QUIZ_BANK[quizState.currentQ].opts.map((opt, i) => {
                                    const isSelected = quizState.selectedOpt === i;
                                    const isCorrect = i === QUIZ_BANK[quizState.currentQ].ans;
                                    const showColors = quizState.showExp;
                                    let btnClass = `w-full text-left p-8 rounded-[30px] font-black text-[20px] transition-all border-4 `;
                                    if (!showColors) btnClass += isSelected ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'border-transparent hover:border-orange-400 bg-white/50 dark:bg-slate-800/50 shadow-md';
                                    else if (isCorrect) btnClass += 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 shadow-lg';
                                    else if (isSelected && !isCorrect) btnClass += 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 opacity-70';
                                    else btnClass += 'border-transparent bg-white/50 dark:bg-slate-800/50 opacity-50';
                                    return (
                                        <button key={i} disabled={quizState.showExp} onClick={() => setQuizState(prev => ({...prev, selectedOpt: i, showExp: true}))} className={btnClass}>
                                            <div className="flex items-center justify-between">
                                                <span><span className="text-orange-500 mr-6 opacity-70 text-2xl">{String.fromCharCode(65+i)}.</span> {opt}</span>
                                                {showColors && isCorrect && <CheckCircle2 size={32} className="text-emerald-500"/>}
                                                {showColors && isSelected && !isCorrect && <X size={32} className="text-red-500"/>}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                            <AnimatePresence>
                                {quizState.showExp && (
                                    <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="mt-10 overflow-hidden">
                                        <div className="p-8 rounded-[30px] bg-blue-500/10 border-2 border-blue-500/20"><h4 className="font-black text-blue-500 text-lg uppercase tracking-widest mb-3 flex items-center gap-2"><Info size={24}/> AI Explanation</h4><p className="text-[18px] font-semibold leading-relaxed">{QUIZ_BANK[quizState.currentQ].exp}</p></div>
                                        <button onClick={() => {
                                            const isCorrect = quizState.selectedOpt === QUIZ_BANK[quizState.currentQ].ans;
                                            if (isCorrect) gainXp(20);
                                            if (quizState.currentQ + 1 === QUIZ_BANK.length) completeMission(3);
                                            setQuizState(prev => ({ ...prev, score: prev.score + (isCorrect ? 1 : 0), currentQ: prev.currentQ + 1, showExp: false, selectedOpt: null }));
                                        }} className="w-full mt-8 py-6 bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-black text-2xl rounded-[30px] flex justify-center items-center gap-3 hover:scale-[1.02] transition-transform shadow-xl">Next Question <ArrowRight size={28}/></button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <motion.div initial={{scale:0.9, opacity:0}} animate={{scale:1, opacity:1}} className={`text-center p-16 rounded-[50px] ${mirrorBtnClass} shadow-2xl`}>
                            <div className="text-9xl mb-10 animate-[bounce_2s_infinite]">🏆</div><h3 className="text-6xl font-black mb-6 tracking-tight">Exam Passed!</h3><p className="font-black text-orange-600 dark:text-orange-400 text-4xl mb-6">Score: {quizState.score} / {QUIZ_BANK.length}</p><p className="font-bold text-slate-500 text-xl mb-12">You earned massive XP for completing this!</p><button onClick={() => setQuizState({active: false, currentQ: 0, score: 0, showExp:false, selectedOpt:null})} className="w-full max-w-md mx-auto block py-6 text-white font-black text-2xl rounded-[30px] bg-slate-900 dark:bg-white dark:text-slate-900 shadow-2xl hover:scale-[1.05] transition-transform">Return to Academy</button>
                        </motion.div>
                    )}
                </motion.div>
            )}
        </main>

        {/* MOBILE BOTTOM NAVIGATION */}
        <nav className={`md:hidden absolute bottom-6 left-6 right-6 z-30 w-[calc(100%-48px)] h-[80px] rounded-[30px] flex justify-around items-center px-2 shadow-[0_20px_40px_rgba(0,0,0,0.2)] border ${darkMode ? 'bg-slate-900/90 border-slate-700/50 backdrop-blur-2xl' : 'bg-white/90 border-white/50 backdrop-blur-2xl'}`}>
            {NAV_ITEMS.map(item => {
                const isActive = activeTab === item.id;
                return (
                    <button key={item.id} onClick={() => setActiveTab(item.id)} className={`relative flex flex-col items-center justify-center w-[60px] h-full gap-1.5 transition-all duration-300 ${isActive ? 'text-blue-600 dark:text-blue-400 -translate-y-2' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}>
                        {isActive && <motion.div layoutId="mobNavInd" className="absolute -top-3 w-1.5 h-1.5 rounded-full bg-blue-500"></motion.div>}
                        <item.icon size={isActive ? 28 : 24} className={`transition-all duration-300 ${isActive ? 'stroke-[2.5px] drop-shadow-md' : 'stroke-[2px]'}`}/>
                        <span className={`text-[10px] font-black transition-all ${isActive ? 'opacity-100' : 'opacity-0 translate-y-2 absolute bottom-0'}`}>{item.label}</span>
                    </button>
                );
            })}
        </nav>
      </div>
    </div>
  );
};

export default ElectionGuideWeb;
