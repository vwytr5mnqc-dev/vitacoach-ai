'use client';
import { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- TIPOS DE DATOS ---
interface Plan {
  id: string;
  status: string;
  weeks: number;
  focus: string;
  blocks: {
    training: { day: string; focus: string; exercises: string[] }[];
    nutrition: { calories: number; macros: string; example_meal: string };
    reasoning: string;
  };
}

interface Client {
  id: string;
  name: string;
  email: string;
  goal: string;
  plans?: Plan[];
}

interface Coach {
  id: string;
  email: string;
  orgName: string;
}

export default function Home() {
  // --- ESTADOS ---
  const [coach, setCoach] = useState<Coach | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [view, setView] = useState<'register' | 'dashboard'>('register');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [generatedPlan, setGeneratedPlan] = useState<Plan | null>(null);

  // Formularios
  const [orgName, setOrgName] = useState('');
  const [coachEmail, setCoachEmail] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientGoal, setClientGoal] = useState('Hipertrofia');
  
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  // --- API CALLS ---
  const handleRegisterCoach = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/coaches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: coachEmail, orgName }),
      });
      if (res.ok) {
        const newCoach = await res.json();
        setCoach(newCoach);
        setView('dashboard');
      }
    } catch (err) { alert("Error API"); }
    setLoading(false);
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coach) return;
    setLoading(true);
    const res = await fetch('http://localhost:3000/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ coachId: coach.id, name: clientName, email: clientEmail, goal: clientGoal }),
    });
    const newClient = await res.json();
    setClients([newClient, ...clients]);
    setClientName(''); setClientEmail('');
    setLoading(false);
  };

  const handleGeneratePlan = async () => {
    if (!selectedClient) return;
    setGenerating(true);
    try {
      const res = await fetch('http://localhost:3000/plans/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: selectedClient.id, weeks: 4, focus: selectedClient.goal }),
      });
      const newPlan = await res.json();
      setGeneratedPlan(newPlan);
    } catch (error) { alert("Error generando plan"); }
    setGenerating(false);
  };

  // --- NUEVO: FUNCIÓN DE EXPORTAR PDF 📄 ---
  const handleDownloadPDF = () => {
    if (!generatedPlan || !selectedClient || !coach) return;

    const doc = new jsPDF();

    // 1. Encabezado "White Label" (Marca del Gimnasio, NO de VitaCoach)
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(22);
    doc.text(coach.orgName.toUpperCase(), 14, 20); // <--- AQUÍ ESTÁ LA MARCA DEL COACH

    doc.setFontSize(10);
    doc.text(`Entrenador: ${coach.email}`, 14, 26);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 30);

    // 2. Datos del Cliente
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 35, 196, 35); // Línea separadora
    
    doc.setFontSize(14);
    doc.text(`Plan Personalizado para: ${selectedClient.name}`, 14, 45);
    doc.setFontSize(10);
    doc.text(`Objetivo: ${selectedClient.goal} | Duración: ${generatedPlan.weeks} Semanas`, 14, 51);

    // 3. Tabla de Entrenamiento
    doc.setFontSize(12);
    doc.setTextColor(0, 102, 204);
    doc.text("Rutina de Entrenamiento", 14, 65);

    const tableData = generatedPlan.blocks.training.map(day => [
      day.day,
      day.focus,
      day.exercises.join("\n") // Ponemos cada ejercicio en una línea nueva
    ]);

    autoTable(doc, {
      startY: 70,
      head: [['Día', 'Enfoque', 'Ejercicios']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] }, // Azul profesional
    });

    // 4. Sección de Nutrición (Debajo de la tabla)
    // @ts-ignore
    const finalY = doc.lastAutoTable.finalY + 15; // Calculamos donde terminó la tabla

    doc.setFontSize(12);
    doc.setTextColor(39, 174, 96); // Verde
    doc.text("Plan Nutricional", 14, finalY);

    doc.setTextColor(60, 60, 60);
    doc.setFontSize(10);
    doc.text(`• Calorías Diarias: ${generatedPlan.blocks.nutrition.calories} kcal`, 14, finalY + 7);
    doc.text(`• Macros: ${generatedPlan.blocks.nutrition.macros}`, 14, finalY + 12);
    doc.text(`• Ejemplo de Comida: ${generatedPlan.blocks.nutrition.example_meal}`, 14, finalY + 17);

    // 5. Guardar
    doc.save(`Plan_${selectedClient.name.replace(/\s+/g, '_')}.pdf`);
  };

  // --- RENDERIZADO ---
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {view === 'register' && (
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 border border-slate-200">
            <h1 className="text-3xl font-bold text-blue-600 text-center mb-2">VitaCoach AI</h1>
            <p className="text-center text-slate-500 mb-8">Software para Entrenadores</p>
            <form onSubmit={handleRegisterCoach} className="space-y-4">
              <input className="w-full p-3 border rounded-lg" placeholder="Nombre Organización (Ej. Cobra Kai)" value={orgName} onChange={e => setOrgName(e.target.value)} required />
              <input className="w-full p-3 border rounded-lg" placeholder="Tu Email" value={coachEmail} onChange={e => setCoachEmail(e.target.value)} required />
              <button disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition">
                {loading ? 'Entrando...' : 'Iniciar como Coach'}
              </button>
            </form>
          </div>
        </div>
      )}

      {view === 'dashboard' && coach && (
        <div className="flex h-screen overflow-hidden">
          <div className="w-80 bg-white border-r border-slate-200 flex flex-col">
            <div className="p-4 border-b border-slate-100">
              <h2 className="font-bold text-lg text-slate-800">{coach.orgName}</h2>
              <p className="text-xs text-slate-500">Coach: {coach.email}</p>
            </div>
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Nuevo Atleta</h3>
              <form onSubmit={handleCreateClient} className="space-y-2">
                <input className="w-full text-sm p-2 border rounded" placeholder="Nombre" value={clientName} onChange={e => setClientName(e.target.value)} />
                <input className="w-full text-sm p-2 border rounded" placeholder="Email" value={clientEmail} onChange={e => setClientEmail(e.target.value)} />
                <select className="w-full text-sm p-2 border rounded bg-white" value={clientGoal} onChange={e => setClientGoal(e.target.value)}>
                  <option>Hipertrofia</option>
                  <option>Fuerza</option>
                  <option>Pérdida de Peso</option>
                </select>
                <button disabled={loading} className="w-full bg-slate-800 text-white text-xs py-2 rounded hover:bg-slate-900">
                  {loading ? '...' : '+ Agregar'}
                </button>
              </form>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {clients.map(c => (
                <div key={c.id} onClick={() => { setSelectedClient(c); setGeneratedPlan(null); }}
                  className={`p-3 rounded-lg cursor-pointer transition ${selectedClient?.id === c.id ? 'bg-blue-50 border-blue-200 border' : 'hover:bg-slate-50'}`}>
                  <p className="font-medium text-sm text-slate-800">{c.name}</p>
                  <p className="text-xs text-slate-500">{c.goal}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-slate-50 p-8">
            {!selectedClient ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <p className="text-6xl mb-4">👈</p>
                <p>Selecciona un atleta del menú para gestionar su plan.</p>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900">{selectedClient.name}</h1>
                    <p className="text-slate-500">Objetivo: <span className="font-medium text-blue-600">{selectedClient.goal}</span></p>
                  </div>
                  <div className="flex gap-2">
                    {/* BOTÓN GENERAR */}
                    <button onClick={handleGeneratePlan} disabled={generating}
                      className={`px-6 py-3 rounded-lg font-bold text-white shadow-lg transition transform hover:scale-105 ${generating ? 'bg-blue-400' : 'bg-gradient-to-r from-blue-600 to-indigo-600'}`}>
                      {generating ? '✨ Pensando...' : '⚡️ Generar Plan IA'}
                    </button>
                    
                    {/* BOTÓN DESCARGAR PDF (Solo si hay plan) */}
                    {generatedPlan && (
                      <button onClick={handleDownloadPDF}
                        className="px-6 py-3 rounded-lg font-bold text-slate-700 bg-white border border-slate-300 shadow-sm hover:bg-slate-50 transition">
                        📄 PDF
                      </button>
                    )}
                  </div>
                </div>

                {generatedPlan ? (
                  <div className="space-y-6 animate-fade-in">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                      <h3 className="text-sm font-bold text-slate-400 uppercase mb-2">Análisis de la IA</h3>
                      <p className="text-slate-700 italic">"{generatedPlan.blocks.reasoning}"</p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="bg-slate-800 p-4 text-white">
                          <h3 className="font-bold">🏋️‍♂️ Rutina</h3>
                          <p className="text-xs text-slate-300">Semana 1-4</p>
                        </div>
                        <div className="p-4 space-y-4">
                          {generatedPlan.blocks.training.map((day, idx) => (
                            <div key={idx} className="border-b border-slate-100 last:border-0 pb-3 last:pb-0">
                              <p className="font-bold text-blue-600 text-sm">{day.day}: {day.focus}</p>
                              <ul className="mt-1 space-y-1">
                                {day.exercises.map((ex, i) => (
                                  <li key={i} className="text-sm text-slate-600">• {ex}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="bg-green-600 p-4 text-white">
                          <h3 className="font-bold">🥦 Nutrición</h3>
                          <p className="text-xs text-green-100">Diario</p>
                        </div>
                        <div className="p-6 text-center space-y-6">
                          <div>
                            <p className="text-sm text-slate-400 uppercase">Calorías</p>
                            <p className="text-4xl font-extrabold text-slate-800">{generatedPlan.blocks.nutrition.calories}</p>
                          </div>
                          <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                            <p className="text-sm font-bold text-green-800">Macros</p>
                            <p className="text-sm text-green-700">{generatedPlan.blocks.nutrition.macros}</p>
                          </div>
                          <div className="text-left">
                            <p className="text-xs text-slate-400 uppercase mb-1">Ejemplo</p>
                            <p className="text-sm text-slate-700 font-medium">🍽 {generatedPlan.blocks.nutrition.example_meal}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white border-2 border-dashed border-slate-200 rounded-xl p-12 text-center">
                    <p className="text-slate-400 text-lg">Sin plan activo.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}