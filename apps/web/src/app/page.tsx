'use client';
import { useEffect, useState } from 'react';

interface User {
  id: number;
  email: string;
  name: string;
  diet?: string;
}

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('http://localhost:3000')
      .then((res) => res.json())
      .then((data) => setUsers(data));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const response = await fetch('http://localhost:3000', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email }),
    });

    const newUser = await response.json();
    setUsers([newUser, ...users]);
    setName('');
    setEmail('');
    setLoading(false);
  };

  // Función Nueva: BORRAR 🗑️
  const handleDelete = async (id: number) => {
    if(!confirm("¿Seguro que quieres borrar este usuario?")) return;

    await fetch(`http://localhost:3000/${id}`, {
      method: 'DELETE',
    });

    // Actualizamos la lista quitando al borrado
    setUsers(users.filter(user => user.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-blue-600 tracking-tight">
            VitaCoach AI
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Tu nutriólogo personal con Inteligencia Artificial
          </p>
        </div>

        {/* --- FORMULARIO --- */}
        <div className="bg-white py-8 px-4 shadow-xl rounded-2xl sm:px-10 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre</label>
              <input id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)}
                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Ej. Dwayne Johnson" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="therock@email.com" />
            </div>
            <button type="submit" disabled={loading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition duration-150 ease-in-out
                ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>
              {loading ? '🤖 Generando dieta con IA...' : 'Registrar y Generar Dieta'}
            </button>
          </form>
        </div>

        {/* --- LISTA CON DIETAS Y BOTÓN BORRAR --- */}
        <div className="bg-white shadow overflow-hidden rounded-xl border border-gray-100">
           <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-100">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Usuarios & Dietas</h3>
          </div>
          <ul className="divide-y divide-gray-200">
            {users.map((user) => (
              <li key={user.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition group">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-blue-600">{user.name}</p>
                  
                  {/* Botón Borrar (Solo aparece al pasar el mouse o siempre en móvil) */}
                  <button 
                    onClick={() => handleDelete(user.id)}
                    className="text-red-400 hover:text-red-600 p-1 hover:bg-red-50 rounded transition"
                    title="Borrar usuario"
                  >
                    🗑️
                  </button>
                </div>
                <p className="text-xs text-gray-400 mb-2">{user.email}</p>
                
                <div className="mt-2 p-3 bg-blue-50 rounded-lg text-sm text-gray-700 border border-blue-100">
                  <span className="font-semibold text-blue-800">🍎 Dieta Sugerida:</span>
                  <p className="mt-1 italic">{user.diet || "Generando..."}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}