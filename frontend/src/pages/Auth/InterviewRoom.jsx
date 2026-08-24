import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { AuthContext } from '../../context/AuthContext.jsx';
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  PhoneOff,
  MessageSquare,
  Copy,
  Check,
  Sparkles,
  Monitor,
  Send,
  User,
  GraduationCap
} from 'lucide-react';
import { Button } from '../../components/UI.jsx';

const InterviewRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useContext(AuthContext);

  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [mediaReady, setMediaReady] = useState(false);
  const [micActive, setMicActive] = useState(true);
  const [cameraActive, setCameraActive] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [simulationMode, setSimulationMode] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const socketRef = useRef(null);
  const pcRef = useRef(null);
  const chatBottomRef = useRef(null);
  const localStreamRef = useRef(null);

  const userName = profile?.name || user?.email || 'Participant';

  // Config for STUN/TURN servers
  const iceServersConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' }
    ]
  };

  // 1. Initialize local webcam/microphone stream
  useEffect(() => {
    const initLocalMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        localStreamRef.current = stream;
        setLocalStream(stream);
        setMediaReady(true);
      } catch (err) {
        console.error('Failed to get media devices:', err);
        alert('Could not access camera/microphone. Please verify permissions.');
      }
    };

    initLocalMedia();

    return () => {
      // Cleanup stream tracks on unmount
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // 2. Bind streams to video DOM nodes once elements render and streams are set
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, cameraActive]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // 3. Set up WebRTC socket signaling (Only runs once after media is ready)
  useEffect(() => {
    if (!user || !roomId || !mediaReady) return;

    const socketUrl = import.meta.env.VITE_SOCKET_URL || 
      (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : window.location.origin);
    socketRef.current = io(socketUrl, {
      transports: ['polling', 'websocket']
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log("[InterviewRoom WebRTC] Connected to signaling socket. Room ID:", roomId);
      socket.emit('join-room', {
        roomId,
        userId: user._id,
        userName
      });
    });

    socket.on('connect_error', (err) => {
      console.error("[InterviewRoom WebRTC] Socket connection error:", err);
    });

    // Handle new peer joining
    socket.on('user-joined', async ({ socketId, userId, userName: peerName }) => {
      console.log("[InterviewRoom WebRTC] Peer joined:", peerName, "Socket ID:", socketId);
      setIsConnected(true);
      setSimulationMode(false); // Disable simulation if a real user joins
      addSystemMessage(`${peerName} joined the interview room.`);

      // Create WebRTC peer connection (Initiator)
      await createPeerConnection(socketId, true);
    });

    // Handle incoming WebRTC offer
    socket.on('offer', async ({ senderSocketId, offer }) => {
      console.log("[InterviewRoom WebRTC] Received WebRTC offer from:", senderSocketId);
      await createPeerConnection(senderSocketId, false);
      if (pcRef.current) {
        try {
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await pcRef.current.createAnswer();
          await pcRef.current.setLocalDescription(answer);
          console.log("[InterviewRoom WebRTC] Sending WebRTC answer to:", senderSocketId);
          socket.emit('answer', { targetSocketId: senderSocketId, answer });
        } catch (err) {
          console.error('Error handling WebRTC offer:', err);
        }
      }
    });

    // Handle incoming WebRTC answer
    socket.on('answer', async ({ answer }) => {
      console.log("[InterviewRoom WebRTC] Received WebRTC answer");
      if (pcRef.current) {
        try {
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        } catch (err) {
          console.error('Error setting remote description answer:', err);
        }
      }
    });

    // Handle incoming ICE candidates
    socket.on('ice-candidate', async ({ candidate }) => {
      console.log("[InterviewRoom WebRTC] Received remote ICE candidate");
      if (pcRef.current && pcRef.current.signalingState !== 'closed') {
        try {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error('Error adding ICE candidate:', err);
        }
      }
    });

    // Handle peer disconnect
    socket.on('user-left', ({ socketId }) => {
      setIsConnected(false);
      setRemoteStream(null);
      addSystemMessage('The other participant left the room.');
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
    });

    // Custom chat message socket transmission
    socket.on('chat-message', (msg) => {
      setChatMessages(prev => [...prev, msg]);
    });

    return () => {
      socket.emit('leave-room', { roomId });
      socket.disconnect();
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
    };
  }, [user, roomId, mediaReady]);

  // Create WebRTC RTCPeerConnection
  const createPeerConnection = async (targetSocketId, isInitiator) => {
    if (pcRef.current) return;

    const pc = new RTCPeerConnection(iceServersConfig);
    pcRef.current = pc;

    // Push local tracks to peer connection
    const currentStream = localStreamRef.current;
    if (currentStream) {
      currentStream.getTracks().forEach(track => {
        pc.addTrack(track, currentStream);
      });
    }

    // Capture ice candidates and send to peer
    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit('ice-candidate', {
          targetSocketId,
          candidate: event.candidate
        });
      }
    };

    // Capture remote stream and assign to remote stream state
    pc.ontrack = (event) => {
      console.log("[InterviewRoom WebRTC] Remote track received:", event.streams);
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
        setIsConnected(true);
      }
    };

    // If initiator, generate offer
    if (isInitiator) {
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socketRef.current.emit('offer', {
          targetSocketId,
          offer
        });
      } catch (err) {
        console.error('Failed to create offer:', err);
      }
    }
  };

  const addSystemMessage = (text) => {
    setChatMessages(prev => [...prev, {
      sender: 'System',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
  };

  // Toggle Audio Mute
  const toggleMic = () => {
    const currentStream = localStreamRef.current;
    if (currentStream) {
      const audioTrack = currentStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !micActive;
        setMicActive(!micActive);
      }
    }
  };

  // Toggle Camera On/Off
  const toggleCamera = () => {
    const currentStream = localStreamRef.current;
    if (currentStream) {
      const videoTrack = currentStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !cameraActive;
        setCameraActive(!cameraActive);
      }
    }
  };

  // Screen Sharing
  const toggleScreenShare = async () => {
    if (screenSharing) {
      // Revert back to webcam
      try {
        const webcamStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        const videoTrack = webcamStream.getVideoTracks()[0];
        
        if (pcRef.current) {
          const sender = pcRef.current.getSenders().find(s => s.track && s.track.kind === 'video');
          if (sender) {
            sender.replaceTrack(videoTrack);
          }
        }

        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach(t => t.stop());
        }
        localStreamRef.current = webcamStream;
        setLocalStream(webcamStream);
        setScreenSharing(false);
      } catch (err) {
        console.error('Failed to restore webcam stream:', err);
      }
    } else {
      // Capture Screen
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const videoTrack = screenStream.getVideoTracks()[0];

        if (pcRef.current) {
          const sender = pcRef.current.getSenders().find(s => s.track && s.track.kind === 'video');
          if (sender) {
            sender.replaceTrack(videoTrack);
          }
        }
        
        videoTrack.onended = () => {
          toggleScreenShare();
        };

        localStreamRef.current = screenStream;
        setLocalStream(screenStream);
        setScreenSharing(true);
      } catch (err) {
        console.error('Screen share aborted:', err);
      }
    }
  };

  // Copy invitation link to clipboard
  const handleCopyLink = () => {
    const link = window.location.href;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Send message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    const newMessage = {
      sender: userName,
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Send via socket.io to other participants in the room
    if (socketRef.current) {
      socketRef.current.emit('chat-message', { roomId, message: newMessage });
    }

    // append locally
    setChatMessages(prev => [...prev, newMessage]);
    setMessageText('');

    // scroll to bottom
    setTimeout(() => {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Simulate Recruiter Feed for solo testing
  const toggleSimulation = () => {
    if (simulationMode) {
      setSimulationMode(false);
      setRemoteStream(null);
    } else {
      setSimulationMode(true);
      setIsConnected(true);
      addSystemMessage('Recruiter Rajesh Kumar (AI Simulator) joined the call.');
      
      // Auto-simulate chat replies
      setTimeout(() => {
        setChatMessages(prev => [...prev, {
          sender: 'Rajesh Kumar (Recruiter)',
          text: 'Hello! Welcome to your PlaceTrack live interview. Can you hear me clearly?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }, 2500);

      setTimeout(() => {
        setChatMessages(prev => [...prev, {
          sender: 'Rajesh Kumar (Recruiter)',
          text: 'Whenever you are ready, please introduce yourself and mention your core technologies.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }, 10000);
    }
  };

  const handleEndCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    // Redirect back to dashboard based on role
    const dashboardRoute = user?.role === 'STUDENT' ? '/student/applications' : user?.role === 'COMPANY' ? '/company/applications' : '/manager/dashboard';
    navigate(dashboardRoute);
  };

  return (
    <div className="bg-zinc-950 text-zinc-100 min-h-screen flex flex-col justify-between overflow-hidden relative font-sans">
      
      {/* Top Header Panel */}
      <header className="p-4 bg-zinc-900/60 border-b border-zinc-800/80 backdrop-blur-md flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl text-white shadow-md">
            <GraduationCap size={18} />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight">PlaceTrack Live Stream Meeting</h1>
            <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider flex items-center gap-1.5 mt-0.5">
              <span className={`h-1.5 w-1.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`}></span>
              {isConnected ? 'Connection Live' : 'Waiting for Recruiter...'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Invite meeting link copy container */}
          <div className="hidden sm:flex items-center bg-zinc-800 border border-zinc-700/60 rounded-xl p-1 pr-3 gap-2">
            <span className="text-[10px] pl-2 text-zinc-400 font-mono select-all select-none">Room: {roomId.slice(0, 8)}...</span>
            <button
              onClick={handleCopyLink}
              className="p-1.5 hover:bg-zinc-700 rounded-lg text-zinc-300 hover:text-white transition-colors cursor-pointer"
              title="Copy Meeting Link"
            >
              {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            </button>
          </div>

          <Button
            onClick={toggleSimulation}
            variant="secondary"
            size="sm"
            className="border-zinc-700 hover:bg-zinc-800 text-zinc-300 gap-1.5 rounded-xl shadow-none py-2 text-[10px] leading-none"
          >
            <Sparkles size={12} className="text-amber-400" />
            {simulationMode ? 'Stop Simulator' : 'AI Simulation'}
          </Button>
        </div>
      </header>

      {/* Main Video Arena Grid */}
      <main className="flex-1 flex relative p-4 bg-zinc-950 overflow-hidden items-center justify-center min-h-[60vh]">
        <div className="relative w-full h-full flex flex-col md:flex-row gap-4 items-center justify-center">
          
          {/* Remote Recruiter Screen */}
          <div className="flex-1 w-full h-full bg-zinc-900 border border-zinc-800/80 rounded-3xl relative overflow-hidden flex items-center justify-center shadow-lg shadow-black/30 aspect-video md:max-h-[75vh]">
            {remoteStream && !simulationMode ? (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="absolute inset-0 w-full h-full object-cover rounded-3xl"
              />
            ) : simulationMode ? (
              // AI Simulation Feed
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 relative">
                <div className="h-20 w-20 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center text-2xl font-black font-display tracking-tight uppercase animate-pulse">
                  RK
                </div>
                <p className="mt-4 text-sm font-bold text-zinc-100 font-display">Dr. Rajesh Kumar (AI Recruiter)</p>
                <p className="text-[10px] text-zinc-400 mt-1 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active Feed Simulated
                </p>
                {/* Simulated webcam video feed representation (visual design) */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6">
                  <span className="text-[10px] text-zinc-300 font-bold uppercase tracking-wider bg-zinc-950/40 px-3 py-1.5 rounded-lg border border-white/5 backdrop-blur-xs flex items-center gap-1.5">
                    <VideoIcon size={12} className="text-blue-400" /> राजेश कुमार • Corporate Relations
                  </span>
                </div>
              </div>
            ) : (
              // Placeholder when no remote connection
              <div className="flex flex-col items-center justify-center p-6 text-center text-zinc-400 gap-3">
                <div className="p-4 bg-zinc-800/50 rounded-full border border-zinc-800 text-zinc-500">
                  <User size={36} />
                </div>
                <h3 className="font-bold text-zinc-200">Waiting for other participant</h3>
                <p className="text-[10px] text-zinc-500 max-w-xs leading-relaxed">
                  Open another tab on this computer or copy the meeting link to join as another user to test live camera WebRTC sync.
                </p>
                <Button
                  onClick={handleCopyLink}
                  variant="secondary"
                  size="sm"
                  className="mt-2 border-zinc-700 bg-zinc-800 text-zinc-300 hover:text-white"
                >
                  {copied ? 'Copied URL!' : 'Copy Meeting Link'}
                </Button>
              </div>
            )}
            
            {/* Overlay Name Tag */}
            {remoteStream && !simulationMode && (
              <div className="absolute bottom-4 left-4 z-10">
                <span className="text-[10px] font-bold text-white bg-zinc-950/60 border border-zinc-800 backdrop-blur-md px-3 py-1.5 rounded-xl">
                  Recruiter Live Feed
                </span>
              </div>
            )}
          </div>

          {/* Local User Preview (PIP container) */}
          <div className="absolute md:fixed bottom-24 right-8 z-20 h-28 sm:h-36 aspect-video bg-zinc-900 border border-zinc-700/50 rounded-2xl overflow-hidden shadow-2xl shadow-black/80 aspect-video">
            {localStream && cameraActive ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover rounded-2xl transform -scale-x-100"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-800/80 text-zinc-400 p-2 text-center">
                <div className="p-2 bg-zinc-900 rounded-full text-zinc-500">
                  <VideoOff size={16} />
                </div>
                <span className="text-[8px] font-bold uppercase mt-1">Camera Off</span>
              </div>
            )}
            <div className="absolute bottom-2 right-2 bg-zinc-950/60 backdrop-blur-xs px-2 py-0.5 rounded text-[8px] font-bold text-white uppercase border border-white/5">
              {userName.split(' ')[0]} (You)
            </div>
          </div>

        </div>

        {/* Collapsible Chat Panel */}
        {isChatOpen && (
          <aside className="absolute md:relative right-0 top-0 bottom-0 w-80 bg-zinc-900 border-l border-zinc-800/80 backdrop-blur-lg flex flex-col justify-between z-30 shadow-2xl animate-page-enter h-full">
            <div className="p-4 border-b border-zinc-800/80 flex items-center justify-between">
              <span className="font-bold text-xs tracking-tight flex items-center gap-1.5">
                <MessageSquare size={14} className="text-blue-500" /> Meeting Chat Panel
              </span>
              <button
                onClick={() => setIsChatOpen(false)}
                className="text-zinc-500 hover:text-white font-bold text-xs"
              >
                Close
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {chatMessages.length === 0 ? (
                <div className="text-center py-12 text-zinc-500 flex flex-col gap-2">
                  <p className="text-[10px] font-bold">No Messages Yet</p>
                  <p className="text-[9px] text-zinc-600 max-w-xs px-4">Send a text response below. Chat will be visible to all room participants.</p>
                </div>
              ) : (
                chatMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex flex-col gap-1 text-[11px] max-w-[85%] ${
                      msg.sender === userName ? 'ml-auto items-end' : msg.sender === 'System' ? 'mx-auto items-center' : 'items-start'
                    }`}
                  >
                    <span className="text-[9px] text-zinc-500 font-semibold">{msg.sender}</span>
                    <div
                      className={`px-3 py-2 rounded-2xl ${
                        msg.sender === userName
                          ? 'bg-blue-600 text-white rounded-tr-none'
                          : msg.sender === 'System'
                          ? 'bg-zinc-800/40 text-amber-500 border border-zinc-800 rounded-lg text-center'
                          : 'bg-zinc-800 text-zinc-200 rounded-tl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[8px] text-zinc-600 mt-0.5">{msg.timestamp}</span>
                  </div>
                ))
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-zinc-800/80 flex gap-2">
              <input
                type="text"
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-zinc-200 placeholder-zinc-500"
                placeholder="Type your message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
              />
              <button
                type="submit"
                className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors cursor-pointer"
              >
                <Send size={14} />
              </button>
            </form>
          </aside>
        )}
      </main>

      {/* Bottom Meeting Controls Bar */}
      <footer className="p-5 bg-zinc-900 border-t border-zinc-800/85 backdrop-blur-md flex items-center justify-between z-10 shrink-0">
        
        {/* Room Info */}
        <div className="hidden md:flex flex-col text-left">
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">LIVE STAGE MEETING</span>
          <span className="text-xs text-zinc-200 font-bold font-mono mt-0.5">ROOM-{roomId.slice(0, 12)}</span>
        </div>

        {/* Media Buttons Controls */}
        <div className="flex items-center gap-3.5 mx-auto md:mx-0">
          {/* Microphone Mute */}
          <button
            onClick={toggleMic}
            className={`p-3 rounded-full cursor-pointer transition-all active:scale-95 border ${
              micActive
                ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border-zinc-750'
                : 'bg-rose-600 hover:bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-600/20'
            }`}
            title={micActive ? 'Mute Microphone' : 'Unmute Microphone'}
          >
            {micActive ? <Mic size={18} /> : <MicOff size={18} />}
          </button>

          {/* Camera toggle */}
          <button
            onClick={toggleCamera}
            className={`p-3 rounded-full cursor-pointer transition-all active:scale-95 border ${
              cameraActive
                ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border-zinc-750'
                : 'bg-rose-600 hover:bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-600/20'
            }`}
            title={cameraActive ? 'Turn Camera Off' : 'Turn Camera On'}
          >
            {cameraActive ? <VideoIcon size={18} /> : <VideoOff size={18} />}
          </button>

          {/* Screen Share */}
          <button
            onClick={toggleScreenShare}
            className={`p-3 rounded-full cursor-pointer transition-all active:scale-95 border ${
              screenSharing
                ? 'bg-blue-600 hover:bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-600/20'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border-zinc-750'
            }`}
            title={screenSharing ? 'Stop Screen Sharing' : 'Share Screen'}
          >
            <Monitor size={18} />
          </button>

          {/* End Call Button */}
          <button
            onClick={handleEndCall}
            className="p-3 bg-rose-600 hover:bg-rose-700 text-white rounded-full cursor-pointer transition-all active:scale-95 border border-rose-500 shadow-lg shadow-rose-600/20"
            title="End Video Interview"
          >
            <PhoneOff size={18} />
          </button>
        </div>

        {/* Panel controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`p-3 rounded-full cursor-pointer transition-all border ${
              isChatOpen
                ? 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border-blue-500/20'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-750'
            }`}
            title="Toggle Meeting Chat"
          >
            <MessageSquare size={16} />
          </button>
        </div>

      </footer>

    </div>
  );
};

export default InterviewRoom;
