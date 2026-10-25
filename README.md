[README.md](https://github.com/user-attachments/files/33924374/README.md)
# HiperMove AI — Move Smarter. Train Better.

HiperMove AI is a next-generation web application that uses **client-side computer vision** (Google MediaPipe Pose Landmarker) to track squats in real-time through your webcam, accurately count repetitions, display movement phases and knee angles, provide educational form cues, and securely persist workout records with Cloud Firestore and Firebase Authentication.

---

## Key Features

- **100% On-Device Pose Tracking:** Real webcam frames are analyzed locally inside your browser using WebAssembly & GPU acceleration. Video never leaves your computer.
- **Accurate Squat Repetition Counter:** State-machine based kinematics tracking (Standing → Descending → Deep Bottom Depth ≤102° → Ascending → Standing Lockout ≥155°).
- **Live Visual Skeleton HUD:** Real-time joint visualization, live knee angle readout, and movement phase indicators.
- **Personalized Dashboard & History:** View your total workouts, cumulative squats, session duration, and historical log stored in Cloud Firestore.
- **Exercise Library:** Educational movement guides for Squats, Lunges, Standing March, and dynamic warm-up drills with safety reminders.
- **Privacy First & Secure:** Account management via Firebase Authentication and strict Attribute-Based Access Control (ABAC) in `firestore.rules`.

---

## 1. How to Install Node.js on Your PC

1. Visit the official Node.js website: [https://nodejs.org](https://nodejs.org).
2. Download the **LTS (Long Term Support)** version recommended for most users (v20 or v22).
3. Run the installer and follow the setup wizard:
   - On Windows: check the box to automatically install necessary tools (like Python/C++ build tools if prompted).
   - On macOS: use the `.pkg` installer or `brew install node` via Homebrew.
   - On Linux: use your package manager (e.g. `sudo apt install nodejs npm` or via NodeSource).
4. Verify your installation by opening your terminal or Command Prompt:
   ```bash
   node -v
   npm -v
   ```

---

## 2. How to Open the Project in Visual Studio Code

1. Download and install VS Code from [https://code.visualstudio.com](https://code.visualstudio.com) if you haven't already.
2. Extract the downloaded `HiperMove-AI.zip` to a folder of your choice (e.g., `C:\Projects\HiperMove-AI` or `~/Projects/HiperMove-AI`).
3. Open VS Code:
   - Click **File** > **Open Folder...** (or press `Ctrl+K Ctrl+O` on Windows / `Cmd+O` on macOS).
   - Select the `HiperMove-AI` folder.
4. Recommended VS Code extensions:
   - *Tailwind CSS IntelliSense*
   - *ESLint*
   - *Prettier - Code formatter*

---

## 3. How to Install Dependencies

1. In VS Code, open an integrated terminal:
   - Go to menu **Terminal** > **New Terminal** (or press `Ctrl+\`` / `Cmd+\``).
2. Run:
   ```bash
   npm install
   ```
   This will download all required libraries: React 19, Vite, Tailwind CSS, `@mediapipe/tasks-vision`, `firebase`, `lucide-react`, and `motion`.

---

## 4. How to Configure Firebase

The app uses Firebase for user authentication and Cloud Firestore storage.

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Create a new Firebase project (or use your existing project).
3. Add a **Web App** in project settings:
   - Copy the configuration object (`apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`).
4. In your project root, open or create `firebase-applet-config.json` with your project credentials:
   ```json
   {
     "projectId": "your-project-id",
     "appId": "your-app-id",
     "apiKey": "your-api-key",
     "authDomain": "your-project-id.firebaseapp.com",
     "firestoreDatabaseId": "(default)",
     "storageBucket": "your-project-id.firebasestorage.app",
     "messagingSenderId": "your-sender-id"
   }
   ```
5. In the Firebase Console:
   - Enable **Authentication** > **Sign-in method** > Enable **Email/Password** and/or **Google**.
   - Enable **Cloud Firestore** in production mode, and deploy the rules from `firestore.rules`.

---

## 5. How to Set Environment Variables Safely

1. Copy `.env.example` to create a local `.env`:
   ```bash
   cp .env.example .env
   ```
2. HiperMove AI processes all video locally in the browser, so no third-party video API secrets are required.
3. Never commit `.env` containing sensitive tokens to public git repositories (`.env` is already included in `.gitignore`).

---

## 6. How to Run the Development Server

Start the local Vite development server:
```bash
npm run dev
```
Open your browser and navigate to:
```
http://localhost:3000
```
(or the port shown in your terminal output).

---

## 7. How to Test the Camera & Squat Counter

1. When you navigate to **Live Workout**, your browser will request permission to access your webcam. Click **Allow**.
2. **Camera Positioning:**
   - Place your phone, tablet, or laptop on a stable surface at roughly hip-to-chest height.
   - Step back 6 to 9 feet (2 to 3 meters) so your entire body from head to ankles is in frame.
   - Ensure the room is well-lit without blinding backlights directly behind you.
3. Stand at a 45° angle or side-profile to the camera so your knee bend and depth can be observed clearly.
4. **Testing Repetitions:**
   - Stand straight (knee angle $\ge 155^\circ$): HUD shows `Standing`.
   - Lower hips and bend knees until thighs are roughly parallel to the ground (angle $\le 102^\circ$): HUD shows `Bottom` and plays a depth audio cue.
   - Push back up to standing: HUD displays `Rep 1 Counted!` and plays a victory chime.
5. Notice that incomplete/shallow dips or standing at the bottom will **not** trigger double-counts.

---

## 8. How to Build the Production Version

To create an optimized production build:
```bash
npm run build
```
This produces optimized HTML, JS, and CSS files in the `dist/` directory.

To preview the production build locally:
```bash
npm run preview
```

---

## 9. How to Troubleshoot Common Errors

- **Camera Not Found or Permission Denied:**
  - Check browser permissions (click the lock icon in the browser address bar > Site settings > Camera > Allow).
  - Ensure no other application (Zoom, Teams, OBS) is holding exclusive lock on your webcam.
- **WASM / MediaPipe Model Load Error:**
  - Ensure you have an active Internet connection on first load so the model asset can download.
  - Check browser console for WebGL / WebAssembly compatibility. Modern Chrome, Edge, Safari, and Firefox support it natively.
- **Firebase Permission Denied:**
  - Confirm you are logged in.
  - Verify `firestore.rules` has been deployed to your Firebase project.
- **Port 3000 in use:**
  - Vite will automatically attempt the next available port, or you can kill the process on port 3000.

---

## 10. How to Deploy the Application

You can deploy HiperMove AI anywhere modern static/SPA web applications are hosted:

- **Firebase Hosting:**
  ```bash
  npm install -g firebase-tools
  firebase login
  firebase init hosting
  npm run build
  firebase deploy --only hosting
  ```
- **Vercel / Netlify:**
  - Connect your repository.
  - Build command: `npm run build`
  - Output directory: `dist`
- **Google Cloud Run:**
  - Containerize using Docker and deploy via Cloud Run.

---

## Medical & Fitness Disclaimer

HiperMove AI is designed for educational, informational, and general fitness purposes only. It is not a medical device, diagnosis tool, or substitute for professional medical advice or physical therapy. Always consult with a qualified physician before starting any new exercise routine. If you feel pain, dizziness, or shortness of breath, stop exercising immediately.

---

© HiperMove AI. Move Smarter. Train Better.
