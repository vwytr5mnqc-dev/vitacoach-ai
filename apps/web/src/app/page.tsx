'use client';
import { useState, useEffect } from 'react';

// ============================================================================
// COMPONENTES DE ICONOS (Emojis/Símbolos)
// ============================================================================

const Icons = {
  Activity: () => <span className="text-current">⚡</span>,
  User: () => <span className="text-current">👤</span>,
  TrendingUp: () => <span className="text-current">📈</span>,
  AlertTriangle: () => <span className="text-current">⚠️</span>,
  Download: () => <span className="text-current">⬇️</span>,
  Plus: () => <span className="text-current">➕</span>,
  Search: () => <span className="text-current">🔍</span>,
  X: () => <span className="text-current">✖️</span>,
  Check: () => <span className="text-current">✓</span>,
  Zap: () => <span className="text-current">⚡</span>,
  BarChart3: () => <span className="text-current">📊</span>,
  Calendar: () => <span className="text-current">📅</span>,
  Settings: () => <span className="text-current">⚙️</span>,
  LogOut: () => <span className="text-current">🚪</span>,
  ChevronRight: () => <span className="text-current">›</span>,
  Users: () => <span className="text-current">👥</span>,
  FileText: () => <span className="text-current">📄</span>,
  Target: () => <span className="text-current">🎯</span>,
};

// ============================================================================
// TIPOS MEJORADOS CON DOCUMENTACIÓN
// ============================================================================

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rpe: string;
  tempo: string;
  rest: string;
  notes: string;
  videoUrl?: string;
  category?: 'strength' | 'hypertrophy' | 'endurance' | 'power';
}

interface Day {
  day_name: string;
  exercises: Exercise[];
  totalVolume?: number;
  estimatedDuration?: number;
  focus?: string;
}

interface Week {
  week_number: number;
  theme: string;
  days: Day[];
  weeklyVolume?: number;
  intensityLevel?: 'deload' | 'moderate' | 'high' | 'peak';
}

interface PlanData {
  overview: {
    mesocycle_goal: string;
    scientific_rationale: string;
    expectedOutcomes?: string;
    warningFlags?: string[];
  };
  weeks: Week[];
  nutrition: {
    calories: number;
    macros: { protein: string; carbs: string; fats: string; };
    guidelines: string;
    mealTiming?: string;
    supplements?: string[];
  };
  progressionStrategy?: string;
  deloadProtocol?: string;
}

interface Plan {
  id: string;
  weeks: number;
  focus: string;
  blocks: PlanData;
  createdAt?: string;
  version?: number;
}

interface Client {
  id: string;
  name: string;
  email: string;
  goal: string;
  injuries?: string;
  age: number;
  weight: number;
  height: number;
  riskScore: number;
  readiness: string;
  lastAssessment?: string;
  adherenceRate?: number;
  progressNotes?: string;
}

interface Coach {
  id: string;
  email: string;
  orgName: string;
  clientCount?: number;
  subscriptionTier?: 'basic' | 'pro' | 'enterprise';
}

interface ToastMessage {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

const Toast = ({ message, type, onClose }: { message: string; type: string; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500'
  }[type] || 'bg-slate-500';

  return (
    <div className={`${bgColor} text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 animate-slideIn`}>
      <Icons.Check />
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="ml-4 hover:opacity-70">
        <Icons.X />
      </button>
    </div>
  );
};

const LoadingSpinner = ({ text = 'Cargando...' }: { text?: string }) => (
  <div className="flex flex-col items-center justify-center gap-3">
    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
    <p className="text-sm text-slate-500 font-medium">{text}</p>
  </div>
);

const StatCard = ({ icon, label, value, trend, color = 'blue' }: any) => {
  const colorClasses = {
    blue: 'from-blue-50 to-white border-blue-100 text-blue-600',
    red: 'from-red-50 to-white border-red-100 text-red-600',
    green: 'from-green-50 to-white border-green-100 text-green-600',
    purple: 'from-purple-50 to-white border-purple-100 text-purple-600',
  }[color] || 'from-blue-50 to-white border-blue-100 text-blue-600';

  return (
    <div className={`bg-gradient-to-br ${colorClasses} p-6 rounded-xl border shadow-sm hover:shadow-md transition-all`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-3xl">{icon}</span>
        {trend && (
          <span className={`text-xs font-bold ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-3xl font-black text-slate-900 mb-1">{value}</p>
      <p className="text-xs text-slate-500 uppercase font-semibold">{label}</p>
    </div>
  );
};

const ClientRiskBadge = ({ score, readiness }: { score: number; readiness: string }) => {
  const getRiskLevel = (score: number) => {
    if (score > 70) return { level: 'ALTO', color: 'red', bg: 'bg-red-500' };
    if (score > 40) return { level: 'MEDIO', color: 'yellow', bg: 'bg-yellow-500' };
    return { level: 'BAJO', color: 'green', bg: 'bg-green-500' };
  };

  const risk = getRiskLevel(score);
  const textColor = {
    red: 'text-red-600',
    yellow: 'text-yellow-600',
    green: 'text-green-600'
  }[risk.color];

  return (
    <div className="flex items-center gap-3">
      <div className={`relative w-16 h-16 rounded-full ${risk.bg} flex items-center justify-center shadow-lg`}>
        <span className="text-white font-black text-lg">{score}</span>
        <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full ${readiness === 'Low' ? 'bg-red-600' : 'bg-green-600'} border-2 border-white flex items-center justify-center`}>
          <span className="text-white text-[10px]">{readiness === 'Low' ? '⚠' : '✓'}</span>
        </div>
      </div>
      <div>
        <p className={`text-xs font-black uppercase ${textColor}`}>Riesgo {risk.level}</p>
        <p className="text-[10px] text-slate-500">Readiness: {readiness}</p>
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function VitaProDashboard() {
  // Estados principales
  const [coach, setCoach] = useState<Coach | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [view, setView] = useState<'register' | 'dashboard'>('register');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [generatedPlan, setGeneratedPlan] = useState<Plan | null>(null);
  const [activeWeek, setActiveWeek] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  
  // Estados de carga
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [simulating, setSimulating] = useState(false);
  
  // Estados de formularios
  const [orgName, setOrgName] = useState('');
  const [coachEmail, setCoachEmail] = useState('');
  const [formData, setFormData] = useState({
    name: '', email: '', goal: 'Hipertrofia', age: 0, weight: 0, height: 0,
    gender: 'male', activityLevel: 'active', injuries: '', equipment: 'full_gym'
  });

  // ============================================================================
  // UTILIDADES
  // ============================================================================

  const addToast = (message: string, type: ToastMessage['type'] = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const getRiskColor = (score: number) => {
    if (score > 70) return 'bg-red-500';
    if (score > 40) return 'bg-yellow-400';
    return 'bg-green-500';
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.goal.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ============================================================================
  // API CALLS MEJORADAS
  // ============================================================================

  const handleRegisterCoach = async () => {
    if (!orgName.trim() || !coachEmail.trim()) {
      addToast('Por favor completa todos los campos', 'error');
      return;
    }

    if (!coachEmail.includes('@')) {
      addToast('Email inválido', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/coaches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: coachEmail, orgName }),
      });

      if (res.ok) {
        const coachData = await res.json();
        setCoach(coachData);
        setView('dashboard');
        addToast(`Bienvenido, ${orgName}! 🎉`, 'success');
        
        await refreshClients(coachData.id);
      } else {
        const error = await res.json();
        addToast(error.message || 'Error al registrar', 'error');
      }
    } catch (err) {
      addToast('Error de conexión con el servidor', 'error');
      console.error(err);
    }
    setLoading(false);
  };

  const refreshClients = async (coachId: string) => {
    try {
      const res = await fetch(`http://localhost:3000/clients/${coachId}`);
      if (res.ok) {
        const data = await res.json();
        const sorted = data.sort((a: Client, b: Client) => b.riskScore - a.riskScore);
        setClients(sorted);
      }
    } catch (err) {
      console.error('Error refreshing clients:', err);
    }
  };

  const handleCreateClient = async () => {
    if (!coach) return;

    if (!formData.name.trim() || !formData.email.trim()) {
      addToast('Nombre y email son obligatorios', 'error');
      return;
    }

    if (formData.age < 1 || formData.age > 120) {
      addToast('Edad inválida', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...formData, 
          coachId: coach.id,
          age: Number(formData.age),
          weight: Number(formData.weight),
          height: Number(formData.height)
        }),
      });

      if (res.ok) {
        await refreshClients(coach.id);
        setFormData({ 
          name: '', email: '', goal: 'Hipertrofia', age: 0, weight: 0, 
          height: 0, gender: 'male', activityLevel: 'active', injuries: '', equipment: 'full_gym' 
        });
        addToast(`Cliente ${formData.name} creado exitosamente! ✨`, 'success');
      } else {
        addToast('Error al crear cliente', 'error');
      }
    } catch (err) {
      addToast('Error de conexión', 'error');
    }
    setLoading(false);
  };

  const handleSimulate = async () => {
    if (!coach) return;
    setSimulating(true);
    
    try {
      await fetch(`http://localhost:3000/simulate/${coach.id}`, { method: 'POST' });
      await refreshClients(coach.id);
      addToast('📡 Escaneo completo. Riesgos actualizados', 'info');
    } catch (err) {
      addToast('Error en simulación', 'error');
    }
    
    setSimulating(false);
  };

  const handleGeneratePlan = async () => {
    if (!selectedClient) return;
    setGenerating(true);
    
    try {
      const res = await fetch('http://localhost:3000/plans/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          clientId: selectedClient.id, 
          weeks: 4, 
          focus: selectedClient.goal 
        }),
      });

      if (res.ok) {
        const plan = await res.json();
        setGeneratedPlan(plan);
        setActiveWeek(0);
        addToast('Plan generado con éxito! 🎯', 'success');
      } else {
        addToast('Error generando plan', 'error');
      }
    } catch (error) {
      addToast('Error de conexión al generar plan', 'error');
    }
    
    setGenerating(false);
  };

  const handleDownloadPDF = async () => {
    addToast('Generando PDF... (Función simulada)', 'info');
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!confirm('¿Estás seguro de eliminar este cliente?')) return;
    
    try {
      const res = await fetch(`http://localhost:3000/clients/${clientId}`, {
        method: 'DELETE'
      });
      
      if (res.ok) {
        if (coach) await refreshClients(coach.id);
        if (selectedClient?.id === clientId) setSelectedClient(null);
        addToast('Cliente eliminado', 'warning');
      }
    } catch (err) {
      addToast('Error al eliminar', 'error');
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 font-sans text-slate-900">
      
      {/* TOAST NOTIFICATIONS */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>

      {/* ===== VISTA DE REGISTRO ===== */}
      {view === 'register' && (
        <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>
          
          <div className="relative bg-white p-10 rounded-2xl shadow-2xl w-[480px] space-y-6 border border-slate-200">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl mb-4 shadow-xl text-4xl">
                ⚡
              </div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                VITAPRO<span className="text-blue-600">.AI</span>
              </h1>
              <p className="text-sm text-slate-500 mt-2">Sistema Inteligente de Periodización</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase mb-2 block">Nombre del Gimnasio</label>
                <input 
                  className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition" 
                  placeholder="Ej: FitZone Training Center"
                  value={orgName}
                  onChange={e => setOrgName(e.target.value)}
                  required 
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 uppercase mb-2 block">Email del Entrenador</label>
                <input 
                  type="email"
                  className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition" 
                  placeholder="entrenador@ejemplo.com"
                  value={coachEmail}
                  onChange={e => setCoachEmail(e.target.value)}
                  required 
                />
              </div>
            </div>

            <button 
              onClick={handleRegisterCoach}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <LoadingSpinner text="" /> : (
                <>
                  <span className="text-xl">⚡</span>
                  ACCEDER AL SISTEMA
                </>
              )}
            </button>

            <p className="text-xs text-center text-slate-400 mt-4">
              Al continuar, aceptas los términos de uso y privacidad
            </p>
          </div>
        </div>
      )}

      {/* ===== DASHBOARD PRINCIPAL ===== */}
      {view === 'dashboard' && coach && (
        <div className="flex h-screen overflow-hidden">
          
          {/* ===== SIDEBAR IZQUIERDO ===== */}
          <div className="w-96 bg-slate-900 text-white flex flex-col shadow-2xl">
            
            {/* HEADER DEL COACH */}
            <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-slate-800 to-slate-900">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg text-2xl">
                  👥
                </div>
                <div className="flex-1">
                  <h2 className="font-black text-lg">{coach.orgName}</h2>
                  <p className="text-xs text-slate-400">{coach.email}</p>
                </div>
                <button 
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 hover:bg-slate-800 rounded-lg transition text-xl"
                >
                  ⚙️
                </button>
              </div>

              {/* STATS RÁPIDOS */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-slate-800 p-3 rounded-lg">
                  <p className="text-2xl font-black">{clients.length}</p>
                  <p className="text-[10px] text-slate-400 uppercase">Atletas</p>
                </div>
                <div className="bg-slate-800 p-3 rounded-lg">
                  <p className="text-2xl font-black text-yellow-400">
                    {clients.filter(c => c.riskScore > 40).length}
                  </p>
                  <p className="text-[10px] text-slate-400 uppercase">En Riesgo</p>
                </div>
              </div>

              {/* BOTÓN RADAR */}
              <button 
                onClick={handleSimulate}
                disabled={simulating}
                className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
              >
                {simulating ? (
                  <LoadingSpinner text="" />
                ) : (
                  <>
                    <span className="text-xl animate-pulse">⚡</span>
                    📡 ESCANEAR RIESGOS
                  </>
                )}
              </button>
            </div>

            {/* FORMULARIO NUEVO ATLETA */}
            <div className="p-4 bg-slate-800/30 border-b border-slate-800">
              <button 
                onClick={() => {
                  const form = document.getElementById('newClientForm');
                  form?.classList.toggle('hidden');
                }}
                className="w-full flex items-center justify-between text-sm font-bold text-blue-400 hover:text-blue-300 transition mb-3"
              >
                <span className="flex items-center gap-2">
                  <span className="text-lg">➕</span>
                  NUEVO ATLETA
                </span>
                <span className="text-xl">›</span>
              </button>

              <div id="newClientForm" className="space-y-2 hidden">
                <input 
                  className="w-full text-xs p-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 outline-none transition" 
                  placeholder="Nombre completo"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
                
                <input 
                  type="email"
                  className="w-full text-xs p-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 outline-none transition" 
                  placeholder="Email"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />

                <div className="grid grid-cols-3 gap-2">
                  <input 
                    type="number"
                    className="w-full text-xs p-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 outline-none transition" 
                    placeholder="Edad"
                    value={formData.age || ''}
                    onChange={e => setFormData({...formData, age: Number(e.target.value)})}
                  />
                  <input 
                    type="number"
                    className="w-full text-xs p-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 outline-none transition" 
                    placeholder="Kg"
                    value={formData.weight || ''}
                    onChange={e => setFormData({...formData, weight: Number(e.target.value)})}
                  />
                  <input 
                    type="number"
                    className="w-full text-xs p-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 outline-none transition" 
                    placeholder="Cm"
                    value={formData.height || ''}
                    onChange={e => setFormData({...formData, height: Number(e.target.value)})}
                  />
                </div>

                <select 
                  className="w-full text-xs p-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-blue-500 outline-none transition"
                  value={formData.goal}
                  onChange={e => setFormData({...formData, goal: e.target.value})}
                >
                  <option value="Hipertrofia">🔥 Hipertrofia</option>
                  <option value="Fuerza">💪 Fuerza</option>
                  <option value="Resistencia">🏃 Resistencia</option>
                  <option value="Pérdida de Grasa">⚡️ Pérdida de Grasa</option>
                </select>

                <textarea 
                  className="w-full text-xs p-3 bg-slate-900 border border-red-900/30 rounded-lg text-white placeholder-red-400/70 focus:border-red-500 outline-none transition resize-none" 
                  placeholder="⚠️ Lesiones o limitaciones..."
                  value={formData.injuries}
                  onChange={e => setFormData({...formData, injuries: e.target.value})}
                  rows={2}
                />

                <button 
                  onClick={handleCreateClient}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs py-3 rounded-lg font-bold transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <LoadingSpinner text="" /> : (
                    <>
                      <span className="text-lg">➕</span>
                      CREAR PERFIL
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* BUSCADOR */}
            <div className="p-4 bg-slate-800/20">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
                <input 
                  className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:border-blue-500 outline-none transition"
                  placeholder="Buscar atleta..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* LISTA DE CLIENTES */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {filteredClients.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <div className="text-5xl mb-3 opacity-30">👥</div>
                  <p className="text-sm">No hay clientes aún</p>
                </div>
              ) : (
                filteredClients.map(c => (
                  <div 
                    key={c.id}
                    onClick={() => { setSelectedClient(c); setGeneratedPlan(null); }}
                    className={`group relative p-4 rounded-xl cursor-pointer transition-all border-l-4 ${
                      selectedClient?.id === c.id 
                        ? 'bg-slate-800 border-blue-500 shadow-lg' 
                        : 'hover:bg-slate-800/50 border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-bold text-sm text-slate-100">{c.name}</p>
                        <p className="text-[10px] text-slate-400 flex items-center gap-1">
                          <span>🎯</span>
                          {c.goal}
                        </p>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${getRiskColor(c.riskScore)} shadow-lg`} />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>Riesgo: {c.riskScore}%</span>
                      <span className={c.readiness === 'Low' ? 'text-red-400' : 'text-green-400'}>
                        {c.readiness === 'Low' ? '⚠️ Bajo' : '✓ Óptimo'}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClient(c.id);
                      }}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 bg-red-500 hover:bg-red-600 rounded transition-all"
                    >
                      <span className="text-white text-xs">✖️</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ===== ÁREA PRINCIPAL ===== */}
          <div className="flex-1 bg-slate-50 overflow-y-auto">
            {selectedClient ? (
              <div className="max-w-7xl mx-auto p-8 space-y-6">
                
                {/* HEADER DEL CLIENTE */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <ClientRiskBadge score={selectedClient.riskScore} readiness={selectedClient.readiness} />
                        <div>
                          <h1 className="text-3xl font-black text-white mb-1">{selectedClient.name}</h1>
                          <div className="flex items-center gap-4 text-sm text-slate-300">
                            <span>✉️ {selectedClient.email}</span>
                            <span>•</span>
                            <span>🎯 {selectedClient.goal}</span>
                            <span>•</span>
                            <span>📏 {selectedClient.height}cm / {selectedClient.weight}kg</span>
                          </div>
                        </div>
                      </div>

                      <button 
                        onClick={handleGeneratePlan}
                        disabled={generating}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl font-bold shadow-xl hover:shadow-2xl hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 flex items-center gap-3"
                      >
                        {generating ? (
                          <LoadingSpinner text="" />
                        ) : (
                          <>
                            <span className="text-xl">⚡</span>
                            GENERAR MESOCICLO
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* STATS CARDS */}
                  <div className="grid grid-cols-4 gap-4 p-6 bg-slate-50">
                    <StatCard icon="⚡" label="Riesgo Lesión" value={`${selectedClient.riskScore}%`} color="red" />
                    <StatCard icon="📈" label="Readiness" value={selectedClient.readiness} color="green" />
                    <StatCard icon="📊" label="Edad" value={selectedClient.age} color="blue" />
                    <StatCard icon="🎯" label="IMC" value={(selectedClient.weight / Math.pow(selectedClient.height/100, 2)).toFixed(1)} color="purple" />
                  </div>

                  {selectedClient.injuries && (
                    <div className="p-6 bg-red-50 border-t border-red-100">
                      <div className="flex items-start gap-3">
                        <span className="text-red-600 text-xl">⚠️</span>
                        <div>
                          <p className="font-bold text-sm text-red-900 mb-1">⚠️ PRECAUCIONES MÉDICAS</p>
                          <p className="text-sm text-red-700">{selectedClient.injuries}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* PLAN GENERADO */}
                {generatedPlan ? (
                  <div className="space-y-6">
                    
                    {/* OVERVIEW */}
                    <div className="grid grid-cols-3 gap-6">
                      <div className="col-span-2 bg-white p-6 rounded-2xl border border-blue-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-xl">
                            📄
                          </div>
                          <h3 className="text-xs font-black text-blue-600 uppercase">Justificación Científica</h3>
                        </div>
                        <p className="text-slate-700 text-sm leading-relaxed">{generatedPlan.blocks.overview.scientific_rationale}</p>
                        {generatedPlan.blocks.overview.expectedOutcomes && (
                          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                            <p className="text-xs font-bold text-blue-900 mb-2">Resultados Esperados:</p>
                            <p className="text-xs text-blue-800">{generatedPlan.blocks.overview.expectedOutcomes}</p>
                          </div>
                        )}
                      </div>

                      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-lg">
                        <div className="flex items-center gap-2 mb-6">
                          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-xl">
                            ⚡
                          </div>
                          <h3 className="text-xs font-black text-green-400 uppercase">Plan Nutricional</h3>
                        </div>
                        
                        <div className="text-center mb-6">
                          <span className="text-5xl font-black text-white">{generatedPlan.blocks.nutrition.calories}</span>
                          <span className="text-sm text-slate-400 block mt-1">KCAL DIARIAS</span>
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-3 bg-slate-800 rounded-lg">
                            <span className="text-xs text-slate-400">Proteína</span>
                            <span className="font-bold text-green-400">{generatedPlan.blocks.nutrition.macros.protein}</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-slate-800 rounded-lg">
                            <span className="text-xs text-slate-400">Carbohidratos</span>
                            <span className="font-bold text-blue-400">{generatedPlan.blocks.nutrition.macros.carbs}</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-slate-800 rounded-lg">
                            <span className="text-xs text-slate-400">Grasas</span>
                            <span className="font-bold text-yellow-400">{generatedPlan.blocks.nutrition.macros.fats}</span>
                          </div>
                        </div>

                        <button 
                          onClick={handleDownloadPDF}
                          className="w-full mt-6 bg-white text-slate-900 py-3 rounded-lg font-bold hover:bg-slate-100 transition flex items-center justify-center gap-2"
                        >
                          <span className="text-lg">⬇️</span>
                          DESCARGAR PDF
                        </button>
                      </div>
                    </div>

                    {/* TABS DE SEMANAS */}
                    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                      <div className="flex border-b border-slate-200 overflow-x-auto bg-slate-50">
                        {generatedPlan.blocks.weeks?.map((week, idx) => (
                          <button 
                            key={idx}
                            onClick={() => setActiveWeek(idx)}
                            className={`flex-1 py-5 px-6 text-sm font-bold min-w-[140px] transition-all relative ${
                              activeWeek === idx 
                                ? 'bg-white text-blue-600' 
                                : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                            }`}
                          >
                            <div className="flex items-center justify-center gap-2">
                              <span>📅</span>
                              <span>SEMANA {week.week_number}</span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1">{week.theme}</p>
                            {activeWeek === idx && (
                              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600" />
                            )}
                          </button>
                        ))}
                      </div>

                      {/* DÍAS Y EJERCICIOS */}
                      <div className="p-8">
                        {generatedPlan.blocks.weeks?.[activeWeek]?.days?.map((day, dIdx) => (
                          <div key={dIdx} className="mb-10 last:mb-0">
                            <div className="flex items-center gap-4 mb-6">
                              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                                <span className="text-white font-black text-lg">{dIdx + 1}</span>
                              </div>
                              <div>
                                <h4 className="text-xl font-black text-slate-900">{day.day_name}</h4>
                                {day.focus && <p className="text-xs text-slate-500">{day.focus}</p>}
                              </div>
                            </div>

                            <div className="bg-slate-50 rounded-xl overflow-hidden border border-slate-200">
                              <table className="w-full">
                                <thead>
                                  <tr className="bg-slate-100 border-b border-slate-200">
                                    <th className="px-6 py-4 text-left text-xs font-black text-slate-600 uppercase">Ejercicio</th>
                                    <th className="px-6 py-4 text-center text-xs font-black text-slate-600 uppercase">Sets</th>
                                    <th className="px-6 py-4 text-center text-xs font-black text-slate-600 uppercase">Reps</th>
                                    <th className="px-6 py-4 text-center text-xs font-black text-slate-600 uppercase">RPE</th>
                                    <th className="px-6 py-4 text-center text-xs font-black text-slate-600 uppercase">Tempo</th>
                                    <th className="px-6 py-4 text-center text-xs font-black text-slate-600 uppercase">Rest</th>
                                    <th className="px-6 py-4 text-left text-xs font-black text-slate-600 uppercase">Notas</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-100">
                                  {day.exercises?.map((ex, eIdx) => (
                                    <tr key={eIdx} className="hover:bg-blue-50 transition group">
                                      <td className="px-6 py-4">
                                        <p className="font-bold text-slate-900 group-hover:text-blue-600 transition">{ex.name}</p>
                                        {ex.category && (
                                          <span className="text-[10px] text-slate-500 uppercase">{ex.category}</span>
                                        )}
                                      </td>
                                      <td className="px-6 py-4 text-center">
                                        <span className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-700 font-black rounded-lg">
                                          {ex.sets}
                                        </span>
                                      </td>
                                      <td className="px-6 py-4 text-center font-bold text-slate-700">{ex.reps}</td>
                                      <td className="px-6 py-4 text-center">
                                        <span className="inline-block bg-slate-100 px-3 py-1 rounded-full text-xs font-black text-slate-700">
                                          {ex.rpe}
                                        </span>
                                      </td>
                                      <td className="px-6 py-4 text-center font-mono text-xs text-slate-600">{ex.tempo}</td>
                                      <td className="px-6 py-4 text-center text-sm text-slate-500">{ex.rest}</td>
                                      <td className="px-6 py-4 text-xs text-slate-500 italic">{ex.notes || '-'}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-[500px] flex flex-col items-center justify-center bg-white rounded-2xl border-4 border-dashed border-slate-200 shadow-sm">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-4xl">
                        ⚡
                      </div>
                      <h3 className="text-2xl font-black text-slate-800 mb-2">Sistema de IA Listo</h3>
                      <p className="text-slate-500 mb-6">Genera un mesociclo personalizado para {selectedClient.name}</p>
                      <button 
                        onClick={handleGeneratePlan}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all flex items-center gap-3 mx-auto"
                      >
                        <span className="text-xl">⚡</span>
                        GENERAR AHORA
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-6 text-5xl">
                    👤
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 mb-2">Selecciona un Atleta</h3>
                  <p className="text-slate-500">Elige un cliente de la lista para comenzar</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
// Actualizar conexión