
import React, { useState, useEffect, useCallback } from 'react';
import { GeminiModel, ExplanationResponse, AppMode } from './types';
import { MODELS, DEFAULT_CODE_SNIPPET, DEFAULT_LOGIC_INPUT, SUPPORTED_LANGUAGES } from './constants';
import { getCodeAnalysis, getFollowUpResponse } from './services/geminiService';
import VisualFlow from './components/VisualFlow';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>('explain');
  const [input, setInput] = useState(DEFAULT_CODE_SNIPPET);
  const [selectedModel, setSelectedModel] = useState<GeminiModel>(GeminiModel.PRO);
  const [selectedLanguage, setSelectedLanguage] = useState(SUPPORTED_LANGUAGES[0]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExplanationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [followUpQuery, setFollowUpQuery] = useState('');
  const [followUpResult, setFollowUpResult] = useState<string | null>(null);
  const [followUpLoading, setFollowUpLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    if (mode === 'explain' && input === DEFAULT_LOGIC_INPUT) {
      setInput(DEFAULT_CODE_SNIPPET);
    } else if (mode === 'generate' && input === DEFAULT_CODE_SNIPPET) {
      setInput(DEFAULT_LOGIC_INPUT);
    }
  }, [mode]);

  const handleProcess = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setFollowUpResult(null);
    setFollowUpQuery('');
    
    try {
      const data = await getCodeAnalysis(input, selectedModel, mode, selectedLanguage);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleFollowUp = async () => {
    if (!followUpQuery.trim() || !result) return;
    setFollowUpLoading(true);
    try {
      const history = [
        { role: 'user', parts: [{ text: input }] },
        { role: 'model', parts: [{ text: JSON.stringify(result) }] }
      ] as any;
      
      const response = await getFollowUpResponse(history, followUpQuery, selectedModel);
      setFollowUpResult(response);
    } catch (err: any) {
      setFollowUpResult("Error fetching response: " + err.message);
    } finally {
      setFollowUpLoading(false);
    }
  };

  const handleApplyFollowUpSuggest = () => {
    if (result?.followUp) {
      setFollowUpQuery(result.followUp);
    }
  };

  const themeClasses = {
    bg: darkMode ? 'bg-slate-950' : 'bg-slate-50',
    card: darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200',
    nav: darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200',
    text: darkMode ? 'text-slate-100' : 'text-slate-900',
    textMuted: darkMode ? 'text-slate-400' : 'text-slate-600',
    subHeader: darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200',
    input: darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900',
    analogyBox: darkMode ? 'bg-indigo-950 border-indigo-900 text-indigo-100' : 'bg-indigo-50 border-indigo-100 text-indigo-900',
    stepCircle: darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-400',
    followUpCard: darkMode ? 'bg-slate-900 border-slate-700 shadow-none' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/50',
    tabActive: 'bg-blue-600 text-white',
    tabInactive: darkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${themeClasses.bg} ${themeClasses.text} pb-20`}>
      {/* Navbar */}
      <nav className={`${themeClasses.nav} border-b sticky top-0 z-50`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">C</div>
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hidden sm:block">CodeLens</h1>
            </div>
            
            <div className={`flex p-1 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
              <button 
                onClick={() => setMode('explain')}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${mode === 'explain' ? themeClasses.tabActive : themeClasses.tabInactive}`}
              >
                Explainer
              </button>
              <button 
                onClick={() => setMode('generate')}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${mode === 'generate' ? themeClasses.tabActive : themeClasses.tabInactive}`}
              >
                Architect
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-slate-800 text-yellow-400' : 'hover:bg-slate-100 text-slate-600'}`}
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
              )}
            </button>
            <div className="w-48">
              <select 
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value as GeminiModel)}
                className={`${themeClasses.input} text-xs rounded-lg block w-full p-2 outline-none transition-colors border shadow-sm`}
              >
                {MODELS.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Input Area */}
          <div className="space-y-6 lg:sticky lg:top-24">
            <div className={`${themeClasses.card} rounded-2xl shadow-sm border overflow-hidden transition-all duration-300`}>
              <div className={`${themeClasses.subHeader} px-6 py-3 border-b flex items-center justify-between`}>
                <div className="flex items-center gap-4">
                  <span className={`text-xs font-bold uppercase tracking-widest ${themeClasses.textMuted}`}>
                    {mode === 'explain' ? 'Paste Code' : 'Describe Logic'}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                      {mode === 'explain' ? 'Source' : 'Target'}
                    </span>
                    <select 
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded border transition-colors ${darkMode ? 'bg-slate-900 border-slate-700 text-blue-400' : 'bg-white border-slate-200 text-blue-600'} outline-none`}
                    >
                      {SUPPORTED_LANGUAGES.map(lang => (
                        <option key={lang} value={lang}>{lang}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button onClick={() => setInput('')} className="text-[10px] text-slate-400 hover:text-red-500 uppercase font-bold tracking-tighter transition-colors">Clear</button>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={mode === 'explain' ? 'Paste your code here...' : 'Explain the logic you want to build...'}
                className={`w-full h-[350px] p-6 text-sm code-font focus:outline-none resize-none border-none transition-colors ${darkMode ? 'bg-slate-900 text-slate-300' : 'bg-slate-50 text-slate-900'}`}
              />
              <div className={`p-4 ${themeClasses.card} border-t`}>
                <button
                  onClick={handleProcess}
                  disabled={loading || !input.trim()}
                  className={`w-full py-4 px-6 rounded-xl font-bold text-white transition-all transform active:scale-95 shadow-xl ${
                    loading ? 'bg-slate-400' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                  }`}
                >
                  {loading ? 'Analyzing...' : mode === 'explain' ? `Explain ${selectedLanguage} Code` : `Generate ${selectedLanguage} Code`}
                </button>
              </div>
            </div>
            {error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs">{error}</div>}
          </div>

          {/* Results Area */}
          <div className="space-y-8">
            {!result && !loading && (
              <div className={`p-12 border-2 border-dashed rounded-2xl text-center ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                <div className="text-4xl mb-4 opacity-50">⚡</div>
                <p className={`text-lg font-bold ${themeClasses.textMuted}`}>Ready for your {mode === 'explain' ? 'code' : 'logic'}</p>
                <p className="text-sm opacity-50 mt-1">AI will break it down into simple terms and visuals.</p>
              </div>
            )}

            {loading && (
              <div className="space-y-6 animate-pulse">
                <div className={`h-40 rounded-2xl ${darkMode ? 'bg-slate-900' : 'bg-slate-200'}`} />
                <div className={`h-60 rounded-2xl ${darkMode ? 'bg-slate-900' : 'bg-slate-200'}`} />
                <div className={`h-40 rounded-2xl ${darkMode ? 'bg-slate-900' : 'bg-slate-200'}`} />
              </div>
            )}

            {result && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {mode === 'generate' && result.code && (
                  <section>
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">{selectedLanguage} Output</h3>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-blue-500/5 blur-xl group-hover:bg-blue-500/10 transition-colors rounded-3xl" />
                      <pre className="relative bg-slate-900 p-6 rounded-2xl border border-slate-800 text-blue-400 text-sm overflow-x-auto code-font">
                        <code>{result.code}</code>
                      </pre>
                    </div>
                  </section>
                )}

                <section>
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">The Breakdown</h3>
                  <div className={`${themeClasses.card} p-6 rounded-2xl shadow-sm border`}>
                    <p className="leading-relaxed text-sm">{result.explanation}</p>
                  </div>
                </section>

                {result.sources && result.sources.length > 0 && (
                  <section>
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Verified Sources (Search)</h3>
                    <div className="flex flex-wrap gap-2">
                      {result.sources.map((s, i) => (
                        <a 
                          key={i} 
                          href={s.uri} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={`text-[10px] px-3 py-1 rounded-full border transition-all ${darkMode ? 'bg-slate-800 border-slate-700 text-blue-400 hover:bg-slate-700' : 'bg-white border-slate-200 text-blue-600 hover:bg-slate-50'}`}
                        >
                          {s.title}
                        </a>
                      ))}
                    </div>
                  </section>
                )}

                <section>
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Simple Analogies</h3>
                  <div className="grid gap-3">
                    {result.analogies.map((analogy, i) => (
                      <div key={i} className={`flex gap-4 p-4 ${themeClasses.analogyBox} border rounded-xl`}>
                        <span className="text-xl">💡</span>
                        <p className="text-xs font-medium leading-relaxed self-center">{analogy}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Visual Flow</h3>
                  <VisualFlow data={result.diagram} isDarkMode={darkMode} />
                </section>

                <section>
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Logical Pipeline</h3>
                  <div className="space-y-2">
                    {result.workflow.map((step, i) => (
                      <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-500/5 transition-colors group">
                        <div className={`w-8 h-8 rounded-lg ${themeClasses.stepCircle} flex-shrink-0 flex items-center justify-center text-xs font-black group-hover:bg-blue-600 group-hover:text-white transition-all`}>
                          {i + 1}
                        </div>
                        <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{step}</p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Interactive Follow-up Section */}
                <section className={`${themeClasses.followUpCard} p-6 rounded-2xl border`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                      <span className="text-blue-500">💬</span> Curiosity Corner
                    </h3>
                  </div>
                  
                  {result.followUp && !followUpResult && (
                    <button 
                      onClick={handleApplyFollowUpSuggest}
                      className={`text-[10px] text-left w-full mb-4 p-3 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'} rounded-lg hover:bg-opacity-80 border transition-colors italic font-medium`}
                    >
                      "{result.followUp}"
                    </button>
                  )}

                  <div className="flex gap-2">
                    <input 
                      type="text"
                      value={followUpQuery}
                      onChange={(e) => setFollowUpQuery(e.target.value)}
                      placeholder="Ask a deep-dive question..."
                      className={`flex-grow p-3 ${themeClasses.input} rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all`}
                    />
                    <button 
                      onClick={handleFollowUp}
                      disabled={followUpLoading || !followUpQuery.trim()}
                      className={`px-6 py-3 ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-900 hover:bg-slate-800'} text-white rounded-xl text-xs font-black disabled:opacity-50 transition-all shadow-lg`}
                    >
                      {followUpLoading ? '...' : 'Send'}
                    </button>
                  </div>

                  {followUpResult && (
                    <div className={`mt-6 p-4 ${darkMode ? 'bg-blue-900/20 border-blue-900/30 text-blue-300' : 'bg-blue-50 border-blue-100 text-blue-900'} border rounded-xl text-xs leading-loose animate-in fade-in duration-300`}>
                      <p className="whitespace-pre-wrap">{followUpResult}</p>
                    </div>
                  )}
                </section>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
