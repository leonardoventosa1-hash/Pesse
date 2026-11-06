// Encabezados defensivos que no cambian la experiencia editorial.
// Evitamos una CSP global restrictiva hasta auditar imágenes y servicios externos.
const globalHeaders = [
  {key:"X-Content-Type-Options",value:"nosniff"},
  {key:"Referrer-Policy",value:"strict-origin-when-cross-origin"},
  {key:"X-Frame-Options",value:"SAMEORIGIN"},
  {key:"Permissions-Policy",value:"camera=(), microphone=(), geolocation=(), payment=(), usb=()"},
  {key:"Strict-Transport-Security",value:"max-age=31536000"}
];
const adminHeaders = [
  {key:"Cache-Control",value:"private, no-store, max-age=0"},
  {key:"X-Frame-Options",value:"DENY"},
  {key:"Content-Security-Policy",value:"frame-ancestors 'none'"},
  {key:"X-Robots-Tag",value:"noindex, nofollow, noarchive"}
];
const nextConfig = {
  async headers() {
    return [
      {source:"/:path*",headers:globalHeaders},
      {source:"/admin",headers:adminHeaders},
      {source:"/admin/:path*",headers:adminHeaders}
    ];
  }
};
export default nextConfig;
