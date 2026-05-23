import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Cloud, Key, User, Database, RefreshCw, LogIn, UserPlus, LogOut, Check, Eye, EyeOff } from 'lucide-react';
import type { DbConfig } from '../services/db';

interface CloudConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CloudConfigModal: React.FC<CloudConfigModalProps> = ({ isOpen, onClose }) => {
  const {
    dbConfig,
    dbConnectionStatus,
    currentUser,
    isLoadingTasks,
    updateDbConfig,
    signUp,
    logIn,
    logOut,
    migrateLocalTasks,
    tasks
  } = useApp();

  // Tab State: 'connection' | 'auth'
  const [activeTab, setActiveTab] = useState<'connection' | 'auth'>('connection');

  // Connection form state
  const [dbType, setDbType] = useState<DbConfig['type']>(dbConfig.type);
  
  // Supabase fields
  const [supabaseUrl, setSupabaseUrl] = useState(dbConfig.supabaseUrl || '');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(dbConfig.supabaseAnonKey || '');

  // Firebase fields
  const [apiKey, setApiKey] = useState(dbConfig.firebaseConfig?.apiKey || '');
  const [authDomain, setAuthDomain] = useState(dbConfig.firebaseConfig?.authDomain || '');
  const [projectId, setProjectId] = useState(dbConfig.firebaseConfig?.projectId || '');
  const [storageBucket, setStorageBucket] = useState(dbConfig.firebaseConfig?.storageBucket || '');
  const [messagingSenderId, setMessagingSenderId] = useState(dbConfig.firebaseConfig?.messagingSenderId || '');
  const [appId, setAppId] = useState(dbConfig.firebaseConfig?.appId || '');

  // Fast paste Firebase Config state
  const [rawFirebaseConfig, setRawFirebaseConfig] = useState('');
  const [isParsingError, setIsParsingError] = useState(false);

  // Auth form state
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  // Check how many offline tasks exist
  const [localTaskCount, setLocalTaskCount] = useState(0);

  useEffect(() => {
    // When modal opens, sync count of offline tasks if using cloud but logged out or in local mode
    const saved = localStorage.getItem('todo_app_tasks');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setLocalTaskCount(parsed.length || 0);
      } catch (e) {
        setLocalTaskCount(0);
      }
    } else {
      setLocalTaskCount(0);
    }
  }, [isOpen, tasks]);

  // Sync internal form states with dbConfig context state when changed
  useEffect(() => {
    setDbType(dbConfig.type);
    setSupabaseUrl(dbConfig.supabaseUrl || '');
    setSupabaseAnonKey(dbConfig.supabaseAnonKey || '');
    setApiKey(dbConfig.firebaseConfig?.apiKey || '');
    setAuthDomain(dbConfig.firebaseConfig?.authDomain || '');
    setProjectId(dbConfig.firebaseConfig?.projectId || '');
    setStorageBucket(dbConfig.firebaseConfig?.storageBucket || '');
    setMessagingSenderId(dbConfig.firebaseConfig?.messagingSenderId || '');
    setAppId(dbConfig.firebaseConfig?.appId || '');
  }, [dbConfig, isOpen]);

  // Parse and autofill Firebase JSON config
  const handleFirebaseJsonChange = (val: string) => {
    setRawFirebaseConfig(val);
    if (!val.trim()) {
      setIsParsingError(false);
      return;
    }
    try {
      // Find the JSON object inside if they pasted a code block
      const startIdx = val.indexOf('{');
      const endIdx = val.lastIndexOf('}');
      if (startIdx === -1 || endIdx === -1) {
        setIsParsingError(true);
        return;
      }
      const jsonStr = val.substring(startIdx, endIdx + 1);
      
      // Cleans common JS objects that are not strict JSON (e.g. without quotes around keys)
      // We will perform a simple eval-like parsing safely or clean it
      const cleaned = jsonStr
        .replace(/([a-zA-Z0-9]+)\s*:/g, '"$1":') // add quotes to keys
        .replace(/'/g, '"') // replace single quotes with double quotes
        .replace(/,\s*([}\]])/g, '$1'); // remove trailing commas
      
      const config = JSON.parse(cleaned);
      
      if (config.apiKey) setApiKey(config.apiKey);
      if (config.authDomain) setAuthDomain(config.authDomain);
      if (config.projectId) setProjectId(config.projectId);
      if (config.storageBucket) setStorageBucket(config.storageBucket);
      if (config.messagingSenderId) setMessagingSenderId(config.messagingSenderId);
      if (config.appId) setAppId(config.appId);

      setIsParsingError(false);
      setRawFirebaseConfig(''); // clear input on success
    } catch (e) {
      setIsParsingError(true);
    }
  };

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();

    let newConfig: DbConfig = { type: 'local' };

    if (dbType === 'supabase') {
      if (!supabaseUrl.trim() || !supabaseAnonKey.trim()) return;
      newConfig = {
        type: 'supabase',
        supabaseUrl: supabaseUrl.trim(),
        supabaseAnonKey: supabaseAnonKey.trim()
      };
    } else if (dbType === 'firebase') {
      if (!apiKey.trim() || !projectId.trim()) return;
      newConfig = {
        type: 'firebase',
        firebaseConfig: {
          apiKey: apiKey.trim(),
          authDomain: authDomain.trim(),
          projectId: projectId.trim(),
          storageBucket: storageBucket.trim(),
          messagingSenderId: messagingSenderId.trim(),
          appId: appId.trim()
        }
      };
    }

    updateDbConfig(newConfig);
    // Switch to auth tab if connecting to cloud to encourage login
    if (newConfig.type !== 'local') {
      setTimeout(() => {
        setActiveTab('auth');
      }, 600);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail.trim() || !authPassword.trim()) return;

    setAuthLoading(true);
    try {
      if (isSignUpMode) {
        await signUp(authEmail.trim(), authPassword.trim());
      } else {
        await logIn(authEmail.trim(), authPassword.trim());
      }
      setAuthEmail('');
      setAuthPassword('');
    } catch (err) {
      // toast is already handled in AppContext
    } finally {
      setAuthLoading(false);
    }
  };

  // Get current connection badge representation
  const renderStatusBadge = () => {
    switch (dbConnectionStatus) {
      case 'connected':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold uppercase tracking-wider animate-fadeIn">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Link Established: {dbConfig.type.toUpperCase()}
          </div>
        );
      case 'connecting':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-bold uppercase tracking-wider">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            Connecting Server...
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] font-bold uppercase tracking-wider animate-pulse">
            <span className="w-2 h-2 rounded-full bg-rose-500 shadow-glow-rose" />
            Link Failed
          </div>
        );
      case 'local':
      default:
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800/50 text-neutral-500 dark:text-neutral-400 text-[10px] font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-neutral-400" />
            Offline Mode (Local Storage)
          </div>
        );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Background Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-[990] backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 m-auto h-fit w-full max-w-xl glass-panel z-[991] shadow-2xl p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col justify-between overflow-y-auto max-h-[92vh] focus:outline-none"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200/50 dark:border-neutral-800/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-400 to-indigo-500 flex items-center justify-center text-white shadow-glow-primary">
                  <Cloud className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-neutral-800 dark:text-neutral-50 font-sans tracking-tight">
                    Cloud Sync Lab
                  </h3>
                  <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium">
                    Bridge workspaces and lock sync states
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors focus:outline-none"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Live Status and Tabs panel */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-4 border-b border-neutral-200/30 dark:border-neutral-800/30">
              {/* Tab Selector */}
              <div className="flex bg-neutral-100 dark:bg-neutral-900/60 p-1 rounded-xl border border-neutral-200/50 dark:border-neutral-800/40 w-fit shrink-0">
                <button
                  onClick={() => setActiveTab('connection')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all focus:outline-none ${
                    activeTab === 'connection'
                      ? 'bg-primary-500 text-white border-primary-600 border shadow-sm'
                      : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                  }`}
                >
                  <Database className="w-3.5 h-3.5" />
                  Database Link
                </button>
                <button
                  onClick={() => setActiveTab('auth')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all focus:outline-none ${
                    activeTab === 'auth'
                      ? 'bg-primary-500 text-white border-primary-600 border shadow-sm'
                      : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  Sync Account
                </button>
              </div>

              {/* Status Badge */}
              <div className="self-start sm:self-center shrink-0">
                {renderStatusBadge()}
              </div>
            </div>

            {/* TAB CONTENT: 1. CONNECTION CONFIGURATION */}
            {activeTab === 'connection' && (
              <form onSubmit={handleConnect} className="space-y-4 pt-4 animate-fadeIn">
                {/* Database Selector Buttons */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">
                    Choose Backend Service Provider
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {([
                      { type: 'local', label: 'Local Offline', desc: 'Secure browser memory' },
                      { type: 'supabase', label: 'Supabase Cloud', desc: 'Realtime PostgreSQL' },
                      { type: 'firebase', label: 'Firebase Cloud', desc: 'Firestore NoSQL' }
                    ] as const).map((prov) => {
                      const active = dbType === prov.type;
                      return (
                        <button
                          key={prov.type}
                          type="button"
                          onClick={() => setDbType(prov.type)}
                          className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all focus:outline-none ${
                            active
                              ? 'bg-primary-500/10 dark:bg-primary-500/5 border-primary-500 text-primary-500 shadow-glow-primary/10'
                              : 'bg-white/20 dark:bg-neutral-900/30 border-neutral-200/50 dark:border-neutral-800/50 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
                          }`}
                        >
                          <span className="text-xs font-bold leading-tight">{prov.label}</span>
                          <span className="text-[9px] font-medium opacity-60 mt-0.5">{prov.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 1A. LOCAL STORAGE INFORMATION */}
                {dbType === 'local' && (
                  <div className="p-4 rounded-xl border border-neutral-200/40 dark:border-neutral-800/40 bg-neutral-50/50 dark:bg-neutral-900/10 space-y-2 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400 animate-fadeIn">
                    <p className="font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                      <Check className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                      Zero Setup Required
                    </p>
                    <p>
                      Your tasks are stored strictly inside your browser's private localStorage. It is secure, fast, and operates completely offline!
                    </p>
                    <p className="text-[10px] opacity-85">
                      💡 Tip: You can upgrade to a cloud database at any time without losing tasks. When you establish a connection, you will be prompted to automatically migrate all your local offline tasks directly to your new cloud database!
                    </p>
                  </div>
                )}

                {/* 1B. SUPABASE CREDENTIALS FORM */}
                {dbType === 'supabase' && (
                  <div className="space-y-4 animate-fadeIn">
                    {/* Setup Instruction */}
                    <div className="p-3.5 rounded-xl border border-primary-500/15 bg-primary-500/5 dark:bg-primary-500/[0.02] text-[11px] leading-relaxed text-neutral-500 dark:text-neutral-400">
                      🔗 <strong className="text-neutral-700 dark:text-neutral-300">How to get keys:</strong> Sign up for a free project at <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-primary-500 hover:underline font-bold">supabase.com</a>. Navigate to Project Settings &gt; API, and paste your credentials below.
                    </div>

                    {/* URL */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">Supabase Project URL</label>
                      <input
                        type="url"
                        required
                        value={supabaseUrl}
                        onChange={(e) => setSupabaseUrl(e.target.value)}
                        placeholder="e.g., https://jlkjhgfdsaqwertyuio.supabase.co"
                        className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 text-xs text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-primary-500 transition-colors"
                      />
                    </div>

                    {/* Anon Key */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">Supabase Anon Public API Key</label>
                      <input
                        type="text"
                        required
                        value={supabaseAnonKey}
                        onChange={(e) => setSupabaseAnonKey(e.target.value)}
                        placeholder="e.g., eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                        className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 text-xs text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-primary-500 transition-colors font-mono"
                      />
                    </div>
                  </div>
                )}

                {/* 1C. FIREBASE CREDENTIALS FORM */}
                {dbType === 'firebase' && (
                  <div className="space-y-4 animate-fadeIn">
                    {/* Setup Instruction */}
                    <div className="p-3.5 rounded-xl border border-primary-500/15 bg-primary-500/5 dark:bg-primary-500/[0.02] text-[11px] leading-relaxed text-neutral-500 dark:text-neutral-400">
                      🔗 <strong className="text-neutral-700 dark:text-neutral-300">How to get keys:</strong> Register a web application at <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-primary-500 hover:underline font-bold">firebase.google.com</a>. Paste the config object JSON block below to instantly autofill!
                    </div>

                    {/* Fast-Paste config json box */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block flex items-center justify-between">
                        <span>Autofill: Paste Firebase Web Config Code JSON</span>
                        {isParsingError && <span className="text-rose-500 text-[9px] font-bold uppercase">Invalid JSON Object</span>}
                      </label>
                      <textarea
                        value={rawFirebaseConfig}
                        onChange={(e) => handleFirebaseJsonChange(e.target.value)}
                        placeholder="Paste const firebaseConfig = { apiKey: ... } object here..."
                        rows={2}
                        className="w-full px-3 py-1.5 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50/20 dark:bg-neutral-900/20 text-[10px] text-neutral-600 dark:text-neutral-400 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-primary-500 transition-colors font-mono resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* API Key */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">API Key *</label>
                        <input
                          type="text"
                          required
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          placeholder="AIzaSy..."
                          className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 text-xs text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-primary-500 transition-colors"
                        />
                      </div>

                      {/* Project ID */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">Project ID *</label>
                        <input
                          type="text"
                          required
                          value={projectId}
                          onChange={(e) => setProjectId(e.target.value)}
                          placeholder="my-todo-app-123"
                          className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 text-xs text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-primary-500 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Auth Domain */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">Auth Domain</label>
                        <input
                          type="text"
                          value={authDomain}
                          onChange={(e) => setAuthDomain(e.target.value)}
                          placeholder="my-todo-app.firebaseapp.com"
                          className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 text-xs text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-primary-500 transition-colors"
                        />
                      </div>

                      {/* Storage Bucket */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">Storage Bucket</label>
                        <input
                          type="text"
                          value={storageBucket}
                          onChange={(e) => setStorageBucket(e.target.value)}
                          placeholder="my-todo-app.appspot.com"
                          className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 text-xs text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-primary-500 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Messaging Sender ID */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">Sender ID</label>
                        <input
                          type="text"
                          value={messagingSenderId}
                          onChange={(e) => setMessagingSenderId(e.target.value)}
                          placeholder="87654321098"
                          className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 text-xs text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-primary-500 transition-colors"
                        />
                      </div>

                      {/* App ID */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">App ID</label>
                        <input
                          type="text"
                          value={appId}
                          onChange={(e) => setAppId(e.target.value)}
                          placeholder="1:87654:web:abcd8765"
                          className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 text-xs text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-primary-500 transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer Link Button */}
                <div className="flex gap-3 pt-4 border-t border-neutral-200/50 dark:border-neutral-800/50">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 font-semibold text-xs transition-colors focus:outline-none"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700 text-white font-bold text-xs transition-all shadow-glow-primary border border-primary-600 focus:outline-none"
                  >
                    Save & Establish Link
                  </button>
                </div>
              </form>
            )}

            {/* TAB CONTENT: 2. AUTHENTICATION & SYNC MANAGEMENT */}
            {activeTab === 'auth' && (
              <div className="pt-4 space-y-5 animate-fadeIn">
                {/* 2A. DATABASE DISCONNECTED OR IN LOCAL MODE */}
                {dbConfig.type === 'local' ? (
                  <div className="p-6 text-center rounded-2xl border border-dashed border-neutral-200/60 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/10 space-y-4">
                    <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400 mx-auto">
                      <Key className="w-6 h-6" />
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                        Cloud Authentication Locked
                      </h4>
                      <p className="text-[10px] text-neutral-400 dark:text-neutral-500 max-w-sm mx-auto leading-relaxed">
                        To lock sync states and log in, please link a database backend first. Switch to the <strong className="text-primary-500 cursor-pointer" onClick={() => setActiveTab('connection')}>Database Link</strong> tab and configure Supabase or Firebase!
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* 2B. CLOUD BACKEND CONNECTED - USER IS LOGGED IN */}
                    {currentUser ? (
                      <div className="space-y-5">
                        {/* Profile Info Card */}
                        <div className="p-4 rounded-xl border border-neutral-200/40 dark:border-neutral-800/60 bg-white/40 dark:bg-neutral-900/20 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary-500/10 text-primary-500 flex items-center justify-center font-black text-sm">
                              {currentUser.email.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="text-[9px] font-bold uppercase tracking-widest text-primary-500">
                                ACTIVE CLOUD DEPLOYMENT
                              </span>
                              <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-100 leading-tight">
                                {currentUser.email}
                              </h4>
                              <p className="text-[9px] text-neutral-400 dark:text-neutral-500 leading-relaxed font-mono">
                                UID: {currentUser.uid.slice(0, 16)}...
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={logOut}
                            className="p-2 rounded-xl border border-rose-500/20 hover:border-rose-500/50 bg-rose-500/5 hover:bg-rose-500/10 text-rose-500 transition-colors focus:outline-none"
                            title="Sign out of account"
                          >
                            <LogOut className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Migration / Sync Local Data Panel */}
                        {localTaskCount > 0 && (
                          <div className="p-4 rounded-xl border border-primary-500/20 bg-primary-500/[0.03] dark:bg-primary-500/[0.01] space-y-3 animate-fadeIn">
                            <div className="flex items-start gap-2.5">
                              <RefreshCw className="w-4.5 h-4.5 text-primary-500 shrink-0 mt-0.5 animate-spin-slow" />
                              <div>
                                <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                                  Offline Data Detected ({localTaskCount} Tasks)
                                </h4>
                                <p className="text-[10px] text-neutral-400 dark:text-neutral-500 leading-relaxed mt-0.5">
                                  You have tasks stored offline inside your local storage. Click the button below to migrate them to your cloud database automatically!
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={migrateLocalTasks}
                              disabled={isLoadingTasks}
                              className="w-full py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 disabled:bg-neutral-300 dark:disabled:bg-neutral-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-glow-primary focus:outline-none"
                            >
                              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingTasks ? 'animate-spin' : ''}`} />
                              Migrate Local Data to Cloud
                            </button>
                          </div>
                        )}

                        {/* Connection Instructions */}
                        <div className="p-4 rounded-xl border border-neutral-200/40 dark:border-neutral-800/40 bg-neutral-50/50 dark:bg-neutral-900/10 text-xs text-neutral-500 dark:text-neutral-400 space-y-2">
                          <h5 className="font-bold text-neutral-700 dark:text-neutral-300">Workspace Connected</h5>
                          <p>
                            Your Todo App is in full synchrony! Any objective tasks, pomodoro counters, checklist subtasks, and edits you make are now saved in real-time to your private cloud database.
                          </p>
                          <p className="text-[10px] italic">
                            Tip: Open this app in another browser window or mobile device, sign in with the exact same credentials, and watch tasks sync seamlessly in real-time!
                          </p>
                        </div>

                        {/* Footer Action */}
                        <div className="pt-2 flex justify-end">
                          <button
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 font-semibold text-xs transition-colors focus:outline-none"
                          >
                            Close Controls
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* 2C. CLOUD BACKEND CONNECTED - USER IS LOGGED OUT (SHOW FORM) */
                      <form onSubmit={handleAuthSubmit} className="space-y-4">
                        <div className="text-center space-y-1">
                          <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                            {isSignUpMode ? 'Establish Sync Account' : 'Authenticate to Sync'}
                          </h4>
                          <p className="text-[10px] text-neutral-400 dark:text-neutral-500 max-w-sm mx-auto">
                            {isSignUpMode 
                              ? 'Establish secure cloud credentials to backup and synchronize tasks.' 
                              : 'Log in to synchronize your objectives and timer profiles across all platforms.'
                            }
                          </p>
                        </div>

                        {/* Email Input */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">Email Address</label>
                          <input
                            type="email"
                            required
                            value={authEmail}
                            onChange={(e) => setAuthEmail(e.target.value)}
                            placeholder="e.g., pilot@aether.co"
                            className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 text-xs text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-primary-500 transition-colors"
                          />
                        </div>

                        {/* Password Input */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">Security Password</label>
                          <div className="relative">
                            <input
                              type={showPassword ? 'text' : 'password'}
                              required
                              value={authPassword}
                              onChange={(e) => setAuthPassword(e.target.value)}
                              placeholder="Min 6 characters..."
                              minLength={6}
                              className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 text-xs text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-primary-500 transition-colors"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 focus:outline-none"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Submit Actions */}
                        <div className="space-y-2 pt-2">
                          <button
                            type="submit"
                            disabled={authLoading}
                            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700 disabled:from-neutral-300 disabled:to-neutral-400 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-glow-primary border border-primary-600 focus:outline-none"
                          >
                            {authLoading ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : isSignUpMode ? (
                              <UserPlus className="w-3.5 h-3.5" />
                            ) : (
                              <LogIn className="w-3.5 h-3.5" />
                            )}
                            {isSignUpMode ? 'Register Sync Account' : 'Authenticate & Sync'}
                          </button>

                          {/* Switch Mode Toggle */}
                          <div className="text-center">
                            <button
                              type="button"
                              onClick={() => setIsSignUpMode(!isSignUpMode)}
                              className="text-[10px] text-neutral-400 dark:text-neutral-500 hover:text-primary-500 focus:outline-none"
                            >
                              {isSignUpMode 
                                ? 'Already have an account? Log in' 
                                : "Don't have an account? Sign up now"
                              }
                            </button>
                          </div>
                        </div>
                      </form>
                    )}
                  </>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
