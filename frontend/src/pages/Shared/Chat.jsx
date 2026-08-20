import React, { useState, useEffect, useContext, useRef } from 'react';
import { io } from 'socket.io-client';
import api from '../../services/api.js';
import { AuthContext } from '../../context/AuthContext.jsx';
import { LoadingSpinner, Button, Input } from '../../components/UI.jsx';
import { Send, User, MessageSquare, ShieldAlert, GraduationCap, Search, LifeBuoy } from 'lucide-react';

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
  
  const socketRef = useRef(null);
  const messageEndRef = useRef(null);

  // 1. Initialize Socket.io connection
  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin;
    const socket = io(socketUrl, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      if (user) {
        socket.emit('register', user._id);
      }
    });

    socket.on('chat-message-receive', ({ senderId, messageObj }) => {
      // Append message if the sender matches currently opened contact chat log
      setSelectedContact((currentContact) => {
        if (currentContact && currentContact._id === senderId) {
          setMessages((prev) => [...prev, messageObj]);
        }
        return currentContact;
      });
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
              placeholder={`Search ${activeTab === 'STUDENT' ? 'students' : activeTab === 'PLACEMENT_MANAGER' ? 'directors' : 'support Admins'}...`}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Filtered Contacts Listing */}
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1.5">
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
              <div>
                <Badge
                  status={
                    selectedContact.role === 'ADMIN' ? 'danger' :
                    selectedContact.role === 'PLACEMENT_MANAGER' ? 'success' : 'primary'
                  }
                >
                  {selectedContact.role === 'ADMIN' ? 'Support Desk' :
                   selectedContact.role === 'PLACEMENT_MANAGER' ? 'Director' : 'Candidate'}
                </Badge>
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
                  const isOwnMessage = msg.sender === user._id;
                  return (
                    <div
                      key={msg._id}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
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
              Select a peer student, placement director, or the query support cell from the contacts sidebar to begin instant secure communications.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};

export default Chat;
