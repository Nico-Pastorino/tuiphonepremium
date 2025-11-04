const imageRemotePatterns = []

if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
  try {
    const supabaseHostname = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
    imageRemotePatterns.push({
      protocol: "https",
      hostname: supabaseHostname,
      pathname: "/storage/v1/object/public/**",
    })
  } catch (error) {
    console.warn("No se pudo procesar NEXT_PUBLIC_SUPABASE_URL para configurar remotePatterns:", error)
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: false,
    remotePatterns: imageRemotePatterns,
  },
}

export default nextConfig
