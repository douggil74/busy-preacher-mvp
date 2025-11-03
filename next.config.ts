import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // DO NOT use output: 'export' for Vercel
  reactStrictMode: true,
  
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
};

export default nextConfig;
```

### **2. Make Sure `.vercelignore` Exists**

Create or update `~/busy-preacher-mvp/.vercelignore`:
```
functions/
firebase-backend/
.firebase/
firebase.json
.firebaserc
.env.local
.env*.local
node_modules/
.git/
*.log
.DS_Store