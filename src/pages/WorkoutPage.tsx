import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Camera, 
  CameraOff, 
  Play, 
  Pause, 
  Square, 
  RefreshCw, 
  AlertTriangle, 
  ShieldCheck, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Info,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { poseDetector } from '../services/poseDetection';
import { SquatCounter } from '../services/squatCounter';
import { soundService } from '../services/audio';
import { MovementPhase, TrackingQuality, WorkoutSession } from '../types';
import confetti from 'canvas-confetti';

interface WorkoutPageProps {
  navigate: (route: string) => void;
  onFinishWorkout: (session: WorkoutSession) => void;
}

export const WorkoutPage: React.FC<WorkoutPageProps> = ({ navigate, onFinishWorkout }) => {
  // Video and Canvas refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Animation and stream refs
  const animFrameIdRef = useRef<number | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const squatCounterRef = useRef<SquatCounter | null>(null);

  // Camera & Model State
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [modelLoading, setModelLoading] = useState<boolean>(false);
  const [modelStatusMsg, setModelStatusMsg] = useState<string>('Initializing pose detection engine...');
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Workout Session State
  const [workoutState, setWorkoutState] = useState<'idle' | 'countdown' | 'active' | 'paused'>('idle');
  const [countdown, setCountdown] = useState<number>(3);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const timerIntervalRef = useRef<number | null>(null);

  // Live Kinematic State
  const [repsCount, setRepsCount] = useState<number>(0);
  const [currentPhase, setCurrentPhase] = useState<MovementPhase>('idle');
  const [kneeAngle, setKneeAngle] = useState<number | null>(null);
  const [minSessionAngle, setMinSessionAngle] = useState<number>(180);
  const [trackingQuality, setTrackingQuality] = useState<TrackingQuality>('lost');
  const [feedbackMessage, setFeedbackMessage] = useState<string>('Position your camera and click Start Camera to begin.');
  const [feedbackType, setFeedbackType] = useState<'info' | 'success' | 'warning' | 'alert'>('info');
  const [isLowerBodyVisible, setIsLowerBodyVisible] = useState<boolean>(false);

  // UI preferences
  const [soundOn, setSoundOn] = useState<boolean>(true);
  const [mirrored, setMirrored] = useState<boolean>(true);
  const [showGuideLines, setShowGuideLines] = useState<boolean>(true);

  // Setup Squat Counter instance
  useEffect(() => {
    squatCounterRef.current = new SquatCounter({
      onRepCompleted: (count, minAngle) => {
        // Trigger celebration confetti on rep milestones
        if (count % 5 === 0) {
          try {
            confetti({
              particleCount: 40,
              spread: 60,
              origin: { y: 0.8 },
              colors: ['#06b6d4', '#84cc16', '#ffffff']
            });
          } catch {
            // ignore
          }
        }
      }
    });

    return () => {
      stopCameraAndTracking();
    };
  }, []);

  // Timer runner
  useEffect(() => {
    if (workoutState === 'active') {
      timerIntervalRef.current = window.setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [workoutState]);

  // Audio mute/unmute sync
  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    soundService.setEnabled(next);
  };

  // Stop camera tracks and cancel animation frame
  const stopCameraAndTracking = useCallback(() => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      mediaStreamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraActive(false);
    setTrackingQuality('lost');
    setKneeAngle(null);
  }, []);

  // Frame processing loop
  const processVideoFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || video.readyState < 2) {
      animFrameIdRef.current = requestAnimationFrame(processVideoFrame);
      return;
    }

    // Adjust canvas resolution to match video aspect
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      animFrameIdRef.current = requestAnimationFrame(processVideoFrame);
      return;
    }

    // 1. Run real MediaPipe detection on current video frame
    const now = performance.now();
    const landmarks = poseDetector.detectFrame(video, now);

    // 2. Draw detected skeleton overlay
    if (landmarks && landmarks.length > 0) {
      poseDetector.drawSkeleton(ctx, landmarks, canvas.width, canvas.height, mirrored, true);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    // 3. Process pose in Squat Counter state machine
    if (squatCounterRef.current) {
      const state = squatCounterRef.current.processPose(landmarks);

      setRepsCount(state.count);
      setCurrentPhase(state.phase);
      setKneeAngle(state.currentKneeAngle);
      setMinSessionAngle(state.minKneeAngleSession);
      setTrackingQuality(state.trackingQuality);
      setIsLowerBodyVisible(state.isLowerBodyVisible);
      setFeedbackMessage(state.feedback.message);
      setFeedbackType(state.feedback.type);
    }

    // Next frame
    animFrameIdRef.current = requestAnimationFrame(processVideoFrame);
  }, [mirrored]);

  // Start Camera
  const startCamera = async () => {
    setCameraError(null);
    setModelLoading(true);
    setModelStatusMsg('Loading MediaPipe Pose Landmarker...');

    try {
      // 1. Initialize Pose Detector model if not yet ready
      await poseDetector.initialize((msg) => setModelStatusMsg(msg));

      // 2. Request webcam stream
      setModelStatusMsg('Requesting webcam access...');
      const constraints: MediaStreamConstraints = {
        audio: false,
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      mediaStreamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().then(() => {
            setCameraActive(true);
            setModelLoading(false);
            setFeedbackMessage('Camera connected. Stand back so your full body is in frame.');
            // Start detection loop
            animFrameIdRef.current = requestAnimationFrame(processVideoFrame);
          }).catch(err => {
            console.error('Video play error:', err);
            setCameraError('Failed to start video playback stream.');
            setModelLoading(false);
          });
        };
      }
    } catch (err: unknown) {
      console.error('Camera initialization error:', err);
      setModelLoading(false);
      setCameraActive(false);

      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setCameraError('Camera permission denied. Please allow camera access in your browser site permissions to use pose tracking.');
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setCameraError('No webcam was found on your device. Please connect a camera and try again.');
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          setCameraError('Camera is already in use by another program (e.g. Zoom, Teams). Please close other apps and try again.');
        } else {
          setCameraError(`Camera error: ${err.message}`);
        }
      } else {
        setCameraError(err instanceof Error ? err.message : 'Failed to initialize camera or AI pose detector.');
      }
    }
  };

  // Start Workout with 3-2-1 Countdown
  const startWorkout = () => {
    if (!cameraActive) {
      setFeedbackMessage('Please start the camera first before launching a workout session.');
      return;
    }

    setWorkoutState('countdown');
    setCountdown(3);
    soundService.playCountdown(false);

    let count = 3;
    const cdInterval = window.setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
        soundService.playCountdown(false);
      } else {
        clearInterval(cdInterval);
        soundService.playCountdown(true);
        setWorkoutState('active');
        if (squatCounterRef.current) {
          squatCounterRef.current.reset();
        }
        setRepsCount(0);
        setElapsedSeconds(0);
        setFeedbackMessage('Workout active! Begin squats with controlled depth.');
      }
    }, 1000);
  };

  // Pause / Resume
  const pauseWorkout = () => {
    setWorkoutState('paused');
    setFeedbackMessage('Workout paused. Take a breather.');
  };

  const resumeWorkout = () => {
    setWorkoutState('active');
    setFeedbackMessage('Workout resumed. Keep moving!');
  };

  // Finish Workout
  const finishWorkout = () => {
    stopCameraAndTracking();
    setWorkoutState('idle');

    const session: WorkoutSession = {
      userId: '', // populated in summary / auth
      exerciseType: 'squat',
      exerciseName: 'Bodyweight Squats',
      repsCount: repsCount,
      durationSeconds: elapsedSeconds,
      minKneeAngle: minSessionAngle === 180 ? 0 : minSessionAngle,
      trackingQuality: trackingQuality === 'lost' ? 'good' : trackingQuality,
      completedAt: new Date().toISOString()
    };

    onFinishWorkout(session);
    navigate('summary');
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Helper for phase color badge
  const getPhaseColor = (phase: MovementPhase) => {
    switch (phase) {
      case 'standing':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'descending':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'bottom':
        return 'bg-lime-500/20 text-lime-400 border-lime-500/50 animate-pulse';
      case 'ascending':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      case 'rep_completed':
        return 'bg-emerald-500 text-slate-950 font-black';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Bar: Back & Status */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            stopCameraAndTracking();
            navigate('dashboard');
          }}
          className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Workout</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Audio toggle */}
          <button
            onClick={toggleSound}
            className={`p-2 rounded-lg border text-xs flex items-center gap-1.5 transition-colors ${
              soundOn 
                ? 'bg-slate-800 border-slate-700 text-cyan-400' 
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
            title={soundOn ? 'Sound cues enabled' : 'Sound muted'}
          >
            {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Mirror toggle */}
          <button
            onClick={() => setMirrored(!mirrored)}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
              mirrored 
                ? 'bg-slate-800 border-slate-700 text-slate-200' 
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            {mirrored ? 'Mirror: On' : 'Mirror: Off'}
          </button>

          {/* Guide Overlay toggle */}
          <button
            onClick={() => setShowGuideLines(!showGuideLines)}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
              showGuideLines 
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300' 
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            Guides
          </button>
        </div>
      </div>

      {/* Main Viewport Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Column: Live Webcam Canvas Viewport (3 cols on desktop) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="relative aspect-[4/3] sm:aspect-[16/9] w-full bg-[#050811] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center">
            {/* Raw Hidden Video Element (used as MediaPipe source) */}
            <video
              ref={videoRef}
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover hidden"
            />

            {/* Video Canvas Layer */}
            {cameraActive && (
              <video
                playsInline
                muted
                autoPlay
                ref={(el) => {
                  if (el && mediaStreamRef.current && el.srcObject !== mediaStreamRef.current) {
                    el.srcObject = mediaStreamRef.current;
                  }
                }}
                className={`absolute inset-0 w-full h-full object-cover ${
                  mirrored ? '-scale-x-100' : ''
                }`}
              />
            )}

            {/* Skeleton Canvas Overlay */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none z-10"
            />

            {/* Guide Stance Silhouette Overlay (optional for alignment) */}
            {cameraActive && showGuideLines && (
              <div className="absolute inset-0 pointer-events-none z-10 border-2 border-dashed border-cyan-500/20 rounded-2xl m-4 flex flex-col justify-between p-4">
                <div className="flex justify-between text-[11px] font-mono text-cyan-400/60 uppercase">
                  <span>Head Zone</span>
                  <span>Face Side-Profile / 45°</span>
                </div>
                <div className="border-b border-dashed border-lime-500/30 w-full pb-1 text-center">
                  <span className="text-[10px] font-mono text-lime-400/60 uppercase tracking-widest">
                    Squat Parallel Depth Line (~90°-102°)
                  </span>
                </div>
                <div className="flex justify-between text-[11px] font-mono text-cyan-400/60 uppercase">
                  <span>Feet Stance: Shoulder-Width</span>
                  <span>Full Body in Frame</span>
                </div>
              </div>
            )}

            {/* Inactive Camera State Overlay */}
            {!cameraActive && !modelLoading && !cameraError && (
              <div className="relative z-20 text-center p-8 max-w-md">
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-8 h-8 text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Webcam Not Active</h3>
                <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                  Start your camera to load the on-device MediaPipe pose model. Stand 6-8 feet away with your hips, knees, and ankles clearly visible.
                </p>
                <button
                  onClick={startCamera}
                  className="px-6 py-3.5 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-lime-400 hover:brightness-105 active:scale-95 transition-all shadow-lg shadow-cyan-500/20 inline-flex items-center gap-2"
                >
                  <Camera className="w-4 h-4 text-slate-950" />
                  <span>Start Camera</span>
                </button>
              </div>
            )}

            {/* Model Loading State Overlay */}
            {modelLoading && (
              <div className="relative z-20 text-center p-8 max-w-sm">
                <RefreshCw className="w-10 h-10 animate-spin text-cyan-400 mx-auto mb-4" />
                <h4 className="text-base font-bold text-white mb-1">Loading AI Vision Engine</h4>
                <p className="text-xs text-slate-400">{modelStatusMsg}</p>
                <div className="mt-4 text-[11px] text-lime-400/80 font-medium">
                  Initializing WebAssembly & GPU delegate...
                </div>
              </div>
            )}

            {/* Camera Error Message Overlay */}
            {cameraError && (
              <div className="relative z-20 text-center p-6 max-w-md bg-rose-950/80 border border-rose-800 rounded-2xl m-4">
                <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-white mb-1">Camera Access Issue</h4>
                <p className="text-xs text-rose-200 mb-4 leading-relaxed">{cameraError}</p>
                <button
                  onClick={startCamera}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  Retry Connection
                </button>
              </div>
            )}

            {/* Countdown Overlay (3, 2, 1, GO!) */}
            {workoutState === 'countdown' && (
              <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm z-30 flex items-center justify-center">
                <div className="text-center">
                  <div className="font-mono text-8xl font-black text-lime-400 animate-ping">
                    {countdown}
                  </div>
                  <p className="text-sm font-bold text-white uppercase tracking-widest mt-6">
                    Get Ready to Squat!
                  </p>
                </div>
              </div>
            )}

            {/* Live HUD Floating Badges (Top) */}
            {cameraActive && (
              <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
                {/* Movement Phase Tag */}
                <div className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border backdrop-blur-md transition-all ${getPhaseColor(currentPhase)}`}>
                  {currentPhase === 'rep_completed' ? 'Rep Completed!' : currentPhase.replace('_', ' ')}
                </div>

                {/* Tracking Quality & Visibility Tag */}
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border ${
                    trackingQuality === 'optimal'
                      ? 'bg-lime-500/20 text-lime-400 border-lime-500/40'
                      : trackingQuality === 'good'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  }`}>
                    Tracking: {trackingQuality}
                  </span>

                  {!isLowerBodyVisible && (
                    <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40 backdrop-blur-md">
                      Step Back
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Live HUD Floating Telemetry (Bottom) */}
            {cameraActive && (
              <div className="absolute bottom-4 left-4 right-4 z-20 flex items-end justify-between pointer-events-none">
                {/* Real-time Knee Angle Pill */}
                <div className="bg-slate-950/85 backdrop-blur-md border border-slate-700/80 p-3 rounded-xl">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">
                    Knee Flexion Angle
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-mono text-2xl font-black text-cyan-400">
                      {kneeAngle !== null ? `${kneeAngle}°` : '--'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      (Target: ≤102°)
                    </span>
                  </div>
                </div>

                {/* Session Elapsed Timer */}
                <div className="bg-slate-950/85 backdrop-blur-md border border-slate-700/80 px-3.5 py-2 rounded-xl text-right">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                    Duration
                  </span>
                  <span className="font-mono text-xl font-bold text-white">
                    {formatTimer(elapsedSeconds)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Feedback Observation Banner */}
          <div className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs ${
            feedbackType === 'success'
              ? 'bg-lime-500/10 border-lime-500/30 text-lime-300'
              : feedbackType === 'warning'
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              : 'bg-slate-900 border-slate-800 text-slate-300'
          }`}>
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0 text-cyan-400" />
              <span className="font-medium leading-relaxed">{feedbackMessage}</span>
            </div>
            <div className="text-[10px] text-slate-500 shrink-0 font-medium hidden sm:block">
              100% on-device vision
            </div>
          </div>
        </div>

        {/* Right Column: Workout Controls & Metrics Panel (1 col) */}
        <div className="space-y-4">
          {/* Main Rep Counter Card */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 text-center relative overflow-hidden">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Squats Completed
            </span>
            <div className="my-4 font-mono text-7xl font-black tracking-tight text-lime-400 transition-transform">
              {repsCount}
            </div>
            
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>Deepest Depth:</span>
              <span className="font-mono font-bold text-cyan-400">
                {minSessionAngle < 180 ? `${minSessionAngle}°` : '--'}
              </span>
            </div>
          </div>

          {/* Controls Card */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Workout Controls
            </h4>

            {workoutState === 'idle' ? (
              <button
                onClick={startWorkout}
                disabled={!cameraActive}
                className="w-full py-3.5 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-lime-400 hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-md shadow-cyan-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>Start Workout</span>
              </button>
            ) : workoutState === 'active' ? (
              <button
                onClick={pauseWorkout}
                className="w-full py-3.5 rounded-xl font-bold text-white bg-amber-500 hover:bg-amber-600 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-md shadow-amber-500/20"
              >
                <Pause className="w-4 h-4" />
                <span>Pause Session</span>
              </button>
            ) : workoutState === 'paused' ? (
              <button
                onClick={resumeWorkout}
                className="w-full py-3.5 rounded-xl font-bold text-slate-950 bg-lime-400 hover:bg-lime-300 active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>Resume Session</span>
              </button>
            ) : null}

            {/* Finish Workout Button */}
            {(workoutState === 'active' || workoutState === 'paused' || repsCount > 0) && (
              <button
                onClick={finishWorkout}
                className="w-full py-3 rounded-xl font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-colors flex items-center justify-center gap-2 text-xs"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Finish & Save Session</span>
              </button>
            )}

            {/* Toggle Camera button */}
            <button
              onClick={cameraActive ? stopCameraAndTracking : startCamera}
              className="w-full py-2.5 rounded-xl font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 transition-colors flex items-center justify-center gap-2 text-xs"
            >
              {cameraActive ? (
                <>
                  <CameraOff className="w-3.5 h-3.5 text-rose-400" />
                  <span>Turn Camera Off</span>
                </>
              ) : (
                <>
                  <Camera className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Connect Camera</span>
                </>
              )}
            </button>
          </div>

          {/* Form Coaching Cues Card */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs space-y-2.5">
            <h5 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Squat Biomechanics Cues</span>
            </h5>
            <ul className="space-y-1.5 text-slate-400">
              <li className="flex items-start gap-1.5">
                <span className="text-lime-400 font-bold">•</span>
                <span>Stand tall to register upright lockout (≥155°).</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-cyan-400 font-bold">•</span>
                <span>Lower thighs parallel or slightly below (≤102°).</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-lime-400 font-bold">•</span>
                <span>Drive through feet without bouncing at the bottom.</span>
              </li>
            </ul>
            <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500 italic">
              Stop exercising if you feel sharp pain or dizziness.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
