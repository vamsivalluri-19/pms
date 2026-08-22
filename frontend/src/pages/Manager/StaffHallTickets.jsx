import React, { useEffect, useState } from 'react';
import api from '../../services/api.js';
import { Button, Input, Select, Badge, LoadingSpinner, EmptyState } from '../../components/UI.jsx';
import { Search, ShieldCheck, Printer, User, Award, CheckCircle2, UserPlus, Phone, Mail, MapPin } from 'lucide-react';

const StaffHallTickets = () => {
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [drives, setDrives] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Form states for creating staff tickets
  const [name, setName] = useState('');
  const [staffId, setStaffId] = useState('');
  const [role, setRole] = useState('Placement Coordinator');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [driveName, setDriveName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const ticketsRes = await api.get('/staff-tickets');
      if (ticketsRes.data.success) {
        setTickets(ticketsRes.data.staffTickets);
      }
      
      const drivesRes = await api.get('/drives');
      if (drivesRes.data.success) {
        setDrives(drivesRes.data.drives || []);
        if (drivesRes.data.drives && drivesRes.data.drives.length > 0) {
          setDriveName(drivesRes.data.drives[0].name);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGenerateTicket = async (e) => {
    e.preventDefault();
    if (!name || !staffId || !role || !phone || !email || !driveName) {
      alert('Please fill out all fields before generating the ticket.');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post('/staff-tickets', {
        name,
        staffId,
        role,
        phone,
        email,
        driveName
      });

      if (data.success) {
        alert('Staff Hall Ticket successfully generated!');
        setName('');
        setStaffId('');
        setPhone('');
        setEmail('');
        fetchData();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to generate staff ticket.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch = 
      t.name?.toLowerCase().includes(search.toLowerCase()) || 
      t.staffId?.toLowerCase().includes(search.toLowerCase()) || 
      t.role?.toLowerCase().includes(search.toLowerCase()) || 
      t.driveName?.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="flex flex-col gap-8 text-left animate-page-enter">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-slate-800 font-display">Staff Hall Tickets Coordinator Control</h2>
        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Generate, assign, and print entry admission passes for staff and student volunteers</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Generator Form */}
        <div className="lg:col-span-1 p-6 bg-white border border-slate-100 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col gap-6">
          <div className="absolute top-[-30%] right-[-30%] w-[60%] h-[60%] rounded-full bg-primary-500/5 blur-[50px] pointer-events-none"></div>
          
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <UserPlus size={18} className="text-primary-600" />
            <h3 className="text-sm font-bold text-slate-800 font-display">Generate Staff Pass</h3>
          </div>

          <form onSubmit={handleGenerateTicket} className="flex flex-col gap-4 text-xs font-semibold text-slate-600">
            <Input
              label="Staff Full Name"
              placeholder="e.g. Dr. Rajesh Kumar"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Staff ID (Employee / Volunteer)"
              placeholder="e.g. STF-2026-89"
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              required
            />
            <Select
              label="Assigned Operations Role"
              options={[
                { value: 'Placement Coordinator', label: 'Placement Coordinator' },
                { value: 'Student Volunteer', label: 'Student Volunteer' },
                { value: 'Invigilator Coordinator', label: 'Invigilator' },
                { value: 'Admin Technical Support', label: 'Admin Technical Support' }
              ]}
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
            <Input
              label="Contact Number"
              placeholder="e.g. +91 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <Input
              label="Official Email"
              type="email"
              placeholder="e.g. rajesh.k@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Select
              label="Designated Placement Drive"
              options={
                drives.length > 0 
                  ? drives.map(d => ({ value: d.name, label: d.name })) 
                  : [{ value: 'General Drive Coordination', label: 'General Drive Coordination' }]
              }
              value={driveName}
              onChange={(e) => setDriveName(e.target.value)}
            />

            <Button type="submit" variant="primary" className="mt-2" disabled={submitting}>
              {submitting ? 'Generating...' : 'Generate Official Pass'}
            </Button>
          </form>
        </div>

        {/* Existing staff tickets list */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Search bar */}
          <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-xs text-xs">
            <div className="relative flex-1 w-full">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                <Search size={14} />
              </span>
              <input
                type="text"
                placeholder="Search staff name, ID, role, or drive event..."
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* List display */}
          <div className="bg-white border border-slate-100 rounded-2xl overflow-x-auto shadow-xs">
            <div className="w-full">
              <table className="w-full text-xs text-left align-middle">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider whitespace-nowrap">
                  <tr>
                    <th className="px-6 py-4 whitespace-nowrap">Staff ID / Name</th>
                    <th className="px-6 py-4 whitespace-nowrap">Role Designation</th>
                    <th className="px-6 py-4 whitespace-nowrap">Drive Assignment</th>
                    <th className="px-6 py-4 text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredTickets.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-slate-400">
                        <EmptyState title="No staff tickets found" message="Fill out the generation panel to issue new staff admission keys." />
                      </td>
                    </tr>
                  ) : (
                    filteredTickets.map((ticket) => (
                      <tr key={ticket._id} className="hover:bg-slate-50/40 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-800">
                          <div>
                            <p>{ticket.name}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{ticket.staffId}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge status={ticket.role.includes('Volunteer') ? 'primary' : 'success'}>
                            {ticket.role}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-600">
                          {ticket.driveName}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setSelectedTicket(ticket)}
                            className="gap-1 text-[10px] font-bold text-primary-600 hover:text-white border-slate-200 hover:bg-primary-600"
                          >
                            <Printer size={12} /> Print Pass
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      {/* Staff ticket modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="relative max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col p-6 animate-page-enter">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5 text-left">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-600 text-white animate-pulse">
                  <ShieldCheck size={16} />
                </div>
                <span className="font-bold font-display text-sm text-slate-800">Staff admission pass</span>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer font-display"
              >
                ×
              </button>
            </div>

            {/* Printable Area */}
            <div id="printable-staff-hallticket" className="p-6 border border-slate-200 rounded-2xl bg-slate-50/50 flex flex-col gap-6 text-left relative overflow-hidden">
              <div className="absolute top-[-20%] right-[-20%] w-[50%] h-[50%] rounded-full bg-emerald-500/5 blur-[40px] pointer-events-none"></div>

              {/* Institution Header */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <h3 className="text-[11px] font-black tracking-tight font-display text-slate-800 uppercase">OFFICE OF PLACEMENTS</h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Staff Event Coordination Pass</p>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                    AUTHORIZED
                  </span>
                </div>
              </div>

              {/* Coordinator photo & Name row */}
              <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <div className="h-16 w-16 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <User size={26} />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-800 truncate font-display">{selectedTicket.name}</h4>
                  <p className="text-[11px] font-semibold text-slate-500 mt-0.5">ID: {selectedTicket.staffId}</p>
                  <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mt-1 flex items-center gap-1">
                    <ShieldCheck size={12} /> {selectedTicket.role}
                  </p>
                </div>
              </div>

              {/* Credentials Grid */}
              <div className="grid grid-cols-2 gap-4 text-[11px]">
                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-semibold block">Official Email</span>
                  <span className="font-bold text-slate-700 break-all">{selectedTicket.email}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-semibold block">Contact Number</span>
                  <span className="font-bold text-slate-700">{selectedTicket.phone}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[9px] text-slate-400 uppercase font-semibold block">Designated Assignment Venue / Drive</span>
                  <span className="font-bold text-slate-700 block mt-0.5 leading-snug">{selectedTicket.driveName}</span>
                </div>
              </div>

              {/* QR Verification Segment */}
              <div className="mt-2 border-t border-slate-200 pt-4 flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-slate-700 font-display">Staff Check-in QR Verification</p>
                  <p className="text-[9px] text-slate-400 mt-1 leading-normal">
                    Gate security or audit coordinators scan this pass to verify employee authority and duty logs.
                  </p>
                </div>
                <div className="p-2 bg-white rounded-xl border border-slate-100 shadow-sm shrink-0">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(
                      window.location.origin + '/verify-staff/' + selectedTicket._id
                    )}`}
                    alt="Staff QR"
                    className="h-20 w-20"
                  />
                </div>
              </div>
            </div>

            {/* Print & Action Controls */}
            <div className="flex gap-3 mt-6">
              <Button
                variant="primary"
                onClick={() => {
                  const printContents = document.getElementById('printable-staff-hallticket').innerHTML;
                  const originalContents = document.body.innerHTML;
                  
                  document.body.innerHTML = `
                    <div style="padding: 40px; font-family: sans-serif; color: #065f46; max-width: 450px; margin: 0 auto;">
                      ${printContents}
                    </div>
                  `;
                  window.print();
                  
                  document.body.innerHTML = originalContents;
                  window.location.reload();
                }}
                className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700 border-none"
              >
                <Printer size={14} /> Print Pass
              </Button>
              <Button
                variant="secondary"
                onClick={() => setSelectedTicket(null)}
                className="px-6"
              >
                Close
              </Button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default StaffHallTickets;
