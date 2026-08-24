import React, { useState, useEffect, useContext, useRef } from 'react';
import { io } from 'socket.io-client';
import api, { getUploadUrl } from '../../services/api.js';
import { AuthContext } from '../../context/AuthContext.jsx';
import { LoadingSpinner, Button, Badge } from '../../components/UI.jsx';
import { Send, User, MessageSquare, ShieldAlert, GraduationCap, Search, LifeBuoy, Users, Eye, Mail, Phone, BookOpen, FileCheck, CheckCircle } from 'lucide-react';

const Chat = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [activeTab, setActiveTab] = useState('STUDENT'); // STUDENT, PLACEMENT_MANAGER, ADMIN
  const [searchQuery, setSearchQuery] = useState('');
  
  // Student profile lookup states
  const [studentProfile, setStudentProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  const socketRef = useRef(null);
  const messageEndRef = useRef(null);

  // Predefined Group Chat object
  const groupChatContact = {
    _id: 'group-chat',
    name: 'Placement Cell Group Channel',
    email: 'all-members@placetrack.org',
    role: 'GROUP'
  };

  const selectedContactRef = useRef(null);

  // Keep the ref in sync with state
  useEffect(() => {
    selectedContactRef.current = selectedContact;
  }, [selectedContact]);

  // 1. Initialize Socket.io connection
  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 
      (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : window.location.origin);
    const socket = io(socketUrl, { transports: ['polling', 'websocket'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      if (user) {
        socket.emit('register', user._id);
      }
    });

    socket.on('chat-message-receive', ({ senderId, messageObj }) => {
      const currentContact = selectedContactRef.current;
      if (currentContact && currentContact._id === senderId) {
        setMessages((prev) => [...prev, messageObj]);
      }
    });

    socket.on('group-message-receive', ({ senderId, messageObj }) => {
      const currentContact = selectedContactRef.current;
      if (currentContact && currentContact._id === 'group-chat') {
        setMessages((prev) => [...prev, messageObj]);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  // 2. Fetch Contacts List
  const fetchContacts = async () => {
    try {
      const { data } = await api.get('/chat/contacts');
      if (data.success) {
        setContacts(data.contacts);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  // 3. Fetch Message Logs for Selected Contact
  const fetchMessages = async (contactId) => {
    try {
      const { data } = await api.get(`/chat/messages/${contactId}`);
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (selectedContact) {
      fetchMessages(selectedContact._id);
      // Close profile modal if active contact changes
      setShowProfileModal(false);
      setStudentProfile(null);
    }
  }, [selectedContact]);

  // 4. Filter contacts based on Active Tab and Search Query
  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = contacts.filter((c) => {
      const matchesTab = c.role === activeTab;
      const matchesSearch = c.name?.toLowerCase().includes(query) || c.email?.toLowerCase().includes(query);
      return matchesTab && matchesSearch;
    });
    setFilteredContacts(filtered);
  }, [contacts, activeTab, searchQuery]);

  // 5. Scroll chat to bottom when message log changes
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 6. Handle Send Message submit
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedContact) return;

    const payload = {
      receiverId: selectedContact._id,
      message: messageText.trim()
    };

    try {
      const { data } = await api.post('/chat/messages', payload);
      if (data.success) {
        setMessages((prev) => [...prev, data.message]);
        setMessageText('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 7. Load peer student profile
  const handleViewProfile = async () => {
    if (!selectedContact || selectedContact.role !== 'STUDENT') return;
    setLoadingProfile(true);
    setShowProfileModal(true);
    try {
      const { data } = await api.get(`/students/user/${selectedContact._id}`);
      if (data.success) {
        setStudentProfile(data.student);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to retrieve candidate profile details.');
      setShowProfileModal(false);
    } finally {
      setLoadingProfile(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="flex h-[calc(100vh-12rem)] min-h-[500px] border border-slate-200 bg-white rounded-3xl overflow-hidden shadow-2xl animate-page-enter">
      
      {/* Sidebar Contacts List Panel */}
      <div className="w-80 border-r border-slate-200 flex flex-col bg-slate-50/50 shrink-0">
        
        {/* Contact Category Tabs */}
        <div className="p-4 border-b border-slate-100 flex gap-2">
          <button
            onClick={() => setActiveTab('STUDENT')}
            className={`flex-1 py-2 text-[10px] font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer ${
              activeTab === 'STUDENT'
                ? 'bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-500/10'
                : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <GraduationCap size={13} /> Students
          </button>
          
          <button
            onClick={() => setActiveTab('PLACEMENT_MANAGER')}
            className={`flex-1 py-2 text-[10px] font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer ${
              activeTab === 'PLACEMENT_MANAGER'
                ? 'bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-500/10'
                : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <User size={13} /> Directors
          </button>
          
          <button
            onClick={() => setActiveTab('ADMIN')}
            className={`flex-1 py-2 text-[10px] font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer ${
              activeTab === 'ADMIN'
                ? 'bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-500/10'
                : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <LifeBuoy size={13} /> Support
          </button>
        </div>

        {/* Contact Search Input */}
        <div className="p-4 border-b border-slate-100">
          <div className="relative text-xs">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
              <Search size={14} />
            </span>
            <input
              type="text"
              placeholder={`Search name or email...`}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Group Chat & Filtered Contacts Listing */}
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1.5">
          {/* Static Group Chat Channel at top of sidebar */}
          <button
            onClick={() => setSelectedContact(groupChatContact)}
            className={`w-full p-3 text-left rounded-xl transition-all duration-200 cursor-pointer border flex items-center gap-3 ${
              selectedContact && selectedContact._id === 'group-chat'
                ? 'bg-gradient-to-r from-primary-600 to-indigo-600 text-white border-primary-600 shadow-lg shadow-primary-500/15'
                : 'bg-indigo-50/50 hover:bg-indigo-50 border-indigo-100/50'
            }`}
          >
            <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
              selectedContact && selectedContact._id === 'group-chat' ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-700'
            }`}>
              <Users size={14} />
            </div>
            <div className="min-w-0 flex-1">
              <p className={`font-bold text-[11.5px] truncate leading-tight ${selectedContact && selectedContact._id === 'group-chat' ? 'text-white' : 'text-indigo-950'}`}>
                Placement Cell Group Channel
              </p>
              <p className={`text-[9px] truncate mt-0.5 ${selectedContact && selectedContact._id === 'group-chat' ? 'text-indigo-100' : 'text-slate-400'}`}>
                Students, Directors & Admin desk
              </p>
            </div>
          </button>

          <div className="h-px bg-slate-200/50 my-1"></div>

          {filteredContacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center text-slate-400">
              <MessageSquare size={24} className="text-slate-300 mb-2" />
              <p className="text-[10px] font-semibold">No contacts found</p>
            </div>
          ) : (
            filteredContacts.map((contact) => (
              <button
                key={contact._id}
                onClick={() => setSelectedContact(contact)}
                className={`w-full p-3 text-left rounded-xl transition-all duration-200 cursor-pointer border flex items-center gap-3 ${
                  selectedContact && selectedContact._id === contact._id
                    ? 'bg-white border-slate-200 shadow-md'
                    : 'bg-transparent border-transparent hover:bg-slate-100/50'
                }`}
              >
                <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                  contact.role === 'ADMIN' ? 'bg-amber-100 text-amber-700' :
                  contact.role === 'PLACEMENT_MANAGER' ? 'bg-emerald-100 text-emerald-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {contact.name ? contact.name[0].toUpperCase() : 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-slate-800 text-[11px] truncate leading-tight">{contact.name}</p>
                  <p className="text-[9px] text-slate-400 truncate mt-0.5">{contact.email}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right Chat Message Area */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedContact ? (
          <>
            {/* Header chat recipient bar */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between text-left shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-xs">
                  {selectedContact.name ? selectedContact.name[0].toUpperCase() : 'U'}
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-xs leading-none font-display">{selectedContact.name}</h3>
                  <span className="text-[9px] text-slate-400 font-semibold mt-1 block">{selectedContact.email}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {selectedContact.role === 'STUDENT' && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleViewProfile}
                    className="gap-1.5 text-[10px] font-bold px-3 py-1.5"
                  >
                    <Eye size={12} /> View Profile
                  </Button>
                )}

                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                  selectedContact.role === 'GROUP' ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' :
                  selectedContact.role === 'ADMIN' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                  selectedContact.role === 'PLACEMENT_MANAGER' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                  'bg-blue-100 text-blue-700 border border-blue-200'
                }`}>
                  {selectedContact.role === 'GROUP' ? 'Group Room' :
                   selectedContact.role === 'ADMIN' ? 'Support Desk' :
                   selectedContact.role === 'PLACEMENT_MANAGER' ? 'Director' : 'Candidate'}
                </span>
              </div>
            </div>

            {/* Chat Transcript Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/20 flex flex-col gap-4">
              {messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                  <MessageSquare size={30} className="text-slate-200 mb-2" />
                  <p className="text-xs font-semibold">Start the conversation. Say Hello!</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isOwnMessage = msg.sender && (msg.sender._id || msg.sender) === user._id;
                  const senderName = msg.sender && typeof msg.sender === 'object' ? msg.sender.name : 'User';
                  const senderRole = msg.sender && typeof msg.sender === 'object' ? msg.sender.role : '';

                  return (
                    <div
                      key={msg._id}
                      className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}
                    >
                      {/* Show sender name for group chat messages */}
                      {selectedContact._id === 'group-chat' && !isOwnMessage && (
                        <span className="text-[9px] font-extrabold text-slate-400 mb-1 ml-1 uppercase">
                          {senderName} • {senderRole === 'ADMIN' ? 'Support' : senderRole === 'PLACEMENT_MANAGER' ? 'Director' : 'Candidate'}
                        </span>
                      )}
                      
                      <div className={`max-w-[70%] p-3.5 rounded-2xl text-left flex flex-col gap-1 text-[11px] leading-relaxed relative ${
                        isOwnMessage
                          ? 'bg-primary-600 text-white rounded-br-none shadow-md shadow-primary-500/10'
                          : 'bg-slate-100 text-slate-700 rounded-bl-none border border-slate-200/50'
                      }`}>
                        <p>{msg.message}</p>
                        <span className={`text-[8px] font-bold text-right mt-1.5 block leading-none ${
                          isOwnMessage ? 'text-primary-100' : 'text-slate-400'
                        }`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messageEndRef} />
            </div>

            {/* Send Message Input Segment */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 flex gap-3 shrink-0">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 text-xs focus:bg-white transition-colors"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                />
              </div>
              <Button type="submit" variant="primary" className="px-5 gap-1.5">
                <Send size={13} /> Send
              </Button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
            <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 text-slate-300 border border-slate-100 shadow-sm">
              <MessageSquare size={28} />
            </div>
            <h3 className="font-bold text-slate-800 text-sm font-display mb-1">Interactive Operations Messaging</h3>
            <p className="text-[10px] text-slate-400 max-w-xs leading-normal">
              Select a peer student, placement director, the query support cell, or open the Placement Cell Group Channel from the contacts sidebar to begin messaging.
            </p>
          </div>
        )}
      </div>

      {/* Peer Student Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="relative max-w-lg w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col p-6 animate-page-enter">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5 text-left">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary-600 text-white">
                  <GraduationCap size={16} />
                </div>
                <span className="font-bold font-display text-sm text-slate-800">Candidate Directory Credentials</span>
              </div>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer font-display"
              >
                ×
              </button>
            </div>

            {loadingProfile ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <LoadingSpinner />
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Decrypting Profile Records...</span>
              </div>
            ) : studentProfile ? (
              <div className="flex flex-col gap-5 text-left overflow-y-auto max-h-[70vh]">
                
                {/* Profile Header Card */}
                <div className="flex items-center gap-4 bg-slate-50 p-4 border border-slate-100 rounded-2xl relative overflow-hidden">
                  <div className="absolute top-[-20%] right-[-20%] w-[40%] h-[40%] rounded-full bg-primary-500/5 blur-[25px] pointer-events-none"></div>
                  {studentProfile.photo ? (
                    <img
                      src={getUploadUrl(studentProfile.photo)}
                      alt={studentProfile.name}
                      className="h-16 w-16 rounded-2xl object-cover border border-slate-200 shrink-0 shadow-sm"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center text-xl font-black shrink-0 shadow-sm">
                      {studentProfile.name ? studentProfile.name[0].toUpperCase() : 'C'}
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 leading-tight font-display">{studentProfile.name}</h3>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">ID: {studentProfile.studentId}</p>
                    <p className="text-[10.5px] text-slate-500 mt-1 font-semibold uppercase">{studentProfile.degree} • {studentProfile.department}</p>
                  </div>
                </div>

                {/* Coordinates Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-slate-100 shadow-xs flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                      <Mail size={14} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[8.5px] text-slate-400 uppercase font-black tracking-wider block">Institutional Email</span>
                      <span className="font-bold text-slate-700 text-[10.5px] truncate block mt-0.5">{studentProfile.user?.email || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-100 shadow-xs flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                      <Phone size={14} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[8.5px] text-slate-400 uppercase font-black tracking-wider block">Contact Number</span>
                      <span className="font-bold text-slate-700 text-[10.5px] block mt-0.5">{studentProfile.phone || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Academics Metrics Cards */}
                <div className="p-5 border border-slate-100 rounded-2xl flex flex-col gap-4">
                  <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-50 pb-2">Academic Standing</span>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100/50">
                      <span className="text-[8.5px] text-slate-400 uppercase font-bold block">Current CGPA</span>
                      <span className="text-sm font-black text-slate-800 mt-1 block">{studentProfile.cgpa || '0.00'}</span>
                    </div>
                    <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100/50">
                      <span className="text-[8.5px] text-slate-400 uppercase font-bold block">Active Backlogs</span>
                      <span className="text-sm font-black text-rose-500 mt-1 block">{studentProfile.backlogs ?? 0}</span>
                    </div>
                    <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100/50">
                      <span className="text-[8.5px] text-slate-400 uppercase font-bold block">Pass-out Batch</span>
                      <span className="text-sm font-black text-slate-800 mt-1 block">{studentProfile.batch || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Skills Section */}
                {studentProfile.skills && studentProfile.skills.length > 0 && (
                  <div className="p-5 border border-slate-100 rounded-2xl flex flex-col gap-3">
                    <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-50 pb-2">Professional Skillsets</span>
                    <div className="flex flex-wrap gap-1.5">
                      {studentProfile.skills.map((skill, sIdx) => (
                        <span key={sIdx} className="px-2.5 py-1 bg-primary-50 text-primary-600 rounded-lg text-[9px] font-bold border border-primary-100">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Verification Check */}
                <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex items-center gap-3">
                  <div className="p-1 rounded-full bg-emerald-100 text-emerald-600">
                    <CheckCircle size={15} />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold text-emerald-800 font-display">Academic Authenticity Checked</span>
                    <p className="text-[9px] text-emerald-600 mt-0.5">Records are cross-verified and certified by the placement cell desk.</p>
                  </div>
                </div>

              </div>
            ) : (
              <div className="py-12 text-center text-slate-400">
                <ShieldAlert size={26} className="mx-auto mb-2 text-rose-500" />
                <p className="text-xs font-semibold">No profile coordinates registered for this user.</p>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6 border-t border-slate-100 pt-4">
              <Button
                variant="secondary"
                onClick={() => setShowProfileModal(false)}
                className="px-6"
              >
                Close Profile
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Chat;
