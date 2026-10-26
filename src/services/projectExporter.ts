import JSZip from 'jszip';

export async function generateAndDownloadProjectZip(onProgress?: (pct: number, status: string) => void): Promise<void> {
  const zip = new JSZip();
  const root = zip.folder('HiperMove-AI');

  if (!root) throw new Error('Could not initialize zip root directory');

  if (onProgress) onProgress(10, 'Gathering configuration files...');

  // Configuration files
  root.file('package.json', JSON.stringify({
    name: 'hipermove-ai',
    private: true,
    version: '1.0.0',
    type: 'module',
    scripts: {
      dev: 'vite --port=3000 --host=0.0.0.0',
      build: 'vite build',
      preview: 'vite preview',
      lint: 'tsc --noEmit'
    },
    dependencies: {
      '@mediapipe/tasks-vision': '^0.10.22',
      'firebase': '^11.3.1',
      'lucide-react': '^0.546.0',
      'motion': '^12.23.24',
      'react': '^19.0.1',
      'react-dom': '^19.0.1',
      'jszip': '^3.10.1',
      'canvas-confetti': '^1.9.4'
    },
    devDependencies: {
      '@tailwindcss/vite': '^4.3.3',
      '@types/canvas-confetti': '^1.9.0',
      '@types/node': '^22.14.0',
      '@types/react': '^19.3.0',
      '@types/react-dom': '^19.3.0',
      '@vitejs/plugin-react': '^6.1.1',
      'tailwindcss': '^4.3.3',
      'typescript': '^7.0.2',
      'vite': '^8.3.0'
    }
  }, null, 2));

  root.file('tsconfig.json', JSON.stringify({
    compilerOptions: {
      target: 'ES2022',
      module: 'ESNext',
      lib: ['ES2022', 'DOM', 'DOM.Iterable'],
      skipLibCheck: true,
      moduleResolution: 'bundler',
      isolatedModules: true,
      jsx: 'react-jsx',
      paths: { '@/*': ['./*'] },
      allowImportingTsExtensions: true,
      noEmit: true
    },
    exclude: ['dist']
  }, null, 2));

  root.file('vite.config.ts', `import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  server: {
    port: 3000,
  },
});
`);

  root.file('.gitignore', `node_modules
dist
.env
.env.local
.DS_Store
`);

  root.file('.env.example', `# Firebase and Gemini API keys (optional)
GEMINI_API_KEY=your_key_here
`);

  root.file('firebase-applet-config.json', JSON.stringify({
    projectId: "your-firebase-project-id",
    appId: "your-web-app-id",
    apiKey: "your-firebase-api-key",
    authDomain: "your-firebase-project-id.firebaseapp.com",
    firestoreDatabaseId: "(default)",
    storageBucket: "your-firebase-project-id.firebasestorage.app",
    messagingSenderId: "your-sender-id"
  }, null, 2));

  root.file('firestore.rules', `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} { allow read, write: if false; }
    function isSignedIn() { return request.auth != null; }
    function isOwner(userId) { return isSignedIn() && request.auth.uid == userId; }
    function isValidId(id) { return id is string && id.size() <= 128 && id.matches('^[a-zA-Z0-9_\\\\-]+$'); }

    match /users/{userId} {
      allow get: if isOwner(userId) && isValidId(userId);
      allow create: if isOwner(userId) && isValidId(userId) && request.resource.data.userId == request.auth.uid;
      allow update: if isOwner(userId) && isValidId(userId) && request.resource.data.userId == request.auth.uid;
      allow delete: if isOwner(userId) && isValidId(userId);
    }

    match /workouts/{workoutId} {
      allow get, list: if isSignedIn() && resource.data.userId == request.auth.uid;
      allow create: if isSignedIn() && request.resource.data.userId == request.auth.uid;
      allow update, delete: if isSignedIn() && resource.data.userId == request.auth.uid;
    }
  }
}
`);

  root.file('index.html', `<!doctype html>
<html lang="en" class="dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>HiperMove AI — Move Smarter. Train Better.</title>
    <meta name="description" content="AI-powered real-time squat tracking and form analysis using local computer vision pose detection." />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  </head>
  <body class="bg-[#090d16] text-slate-100 font-sans antialiased min-h-screen">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`);

  root.file('README.md', `# HiperMove AI — Move Smarter. Train Better.

HiperMove AI is a next-generation web application that uses **client-side computer vision** (Google MediaPipe Pose Landmarker) to track squats in real-time through your webcam, accurately count repetitions, display movement phases and knee angles, provide educational form cues, and securely persist workout records with Cloud Firestore and Firebase Authentication.

### Quick Start
1. Install Node.js v20+ from https://nodejs.org
2. Open this folder in VS Code
3. Run: npm install
4. Run: npm run dev
5. Open http://localhost:3000 in Chrome, Edge, or Safari!
`);

  if (onProgress) onProgress(45, 'Compiling project source files...');

  // Try to fetch source files or include code bundle
  const srcFolder = root.folder('src');
  if (srcFolder) {
    srcFolder.file('main.tsx', `import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);
`);
  }

  if (onProgress) onProgress(75, 'Generating zip package archive...');

  const content = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  }, (metadata) => {
    if (onProgress) {
      onProgress(75 + Math.round(metadata.percent * 0.2), `Compressing archive (${Math.round(metadata.percent)}%)...`);
    }
  });

  if (onProgress) onProgress(98, 'Triggering browser file download...');

  // Trigger browser download
  const downloadUrl = URL.createObjectURL(content);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = 'HiperMove-AI.zip';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(downloadUrl);

  if (onProgress) onProgress(100, 'Download complete!');
}
