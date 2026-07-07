/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // unpdf se ejecuta solo en el servidor (importación de PDF)
  experimental: { serverComponentsExternalPackages: ["unpdf"] },
};
export default nextConfig;
