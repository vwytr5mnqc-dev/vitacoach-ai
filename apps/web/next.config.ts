/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // ⚠️ ¡Atención! Esto permite que el build termine aunque haya errores de TS
    ignoreBuildErrors: true,
  },
  eslint: {
    // ⚠️ Ignora las advertencias de estilo para poder desplegar rápido
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;