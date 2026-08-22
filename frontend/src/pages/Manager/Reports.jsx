import React, { useState, useEffect } from 'react';
import api from '../../services/api.js';
import { Button, LoadingSpinner, Badge } from '../../components/UI.jsx';
import { FileDown, Calendar, BarChart2, Award, DollarSign, TrendingUp } from 'lucide-react';

const ManagerReports = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [deptDistribution, setDeptDistribution] = useState([]);
  const [placementsList, setPlacementsList] = useState([]);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const statsRes = await api.get('/stats/manager');
        if (statsRes.data.success) {
          setStats(statsRes.data.stats);
          setDeptDistribution(statsRes.data.departmentWiseData);
        }

        const placementsRes = await api.get('/placements');
        if (placementsRes.data.success) {
          setPlacementsList(placementsRes.data.placements);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReportData();
  }, []);

  const handleExportCSV = () => {
    if (placementsList.length === 0) return;

    // Headers
    const headers = ['Student ID', 'Student Name', 'Department', 'CGPA', 'Company', 'Package (LPA)', 'Offer Date', 'Status'];
    
    // Rows
    const rows = placementsList.map(p => [
      p.student?.studentId || 'N/A',
      p.student?.name || 'N/A',
      p.student?.department || 'N/A',
      p.student?.cgpa || 'N/A',
      p.company?.name || 'N/A',
      p.package || 'N/A',
      p.offerDate ? new Date(p.offerDate).toLocaleDateString() : 'N/A',
      p.offerStatus || 'N/A'
    ]);

    // Construct CSV String
    const csvContent = 'data:text/csv;charset=utf-8,' 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PlaceTrack_Placement_Report_${new Date().getFullYear()}.csv`);
    document.body.appendChild(link); // Required for FF
    
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="flex flex-col gap-8 text-left animate-page-enter">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 font-display">Placement Analytics Reports</h2>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Generate and export official campus placement records</p>
        </div>
        <Button variant="primary" onClick={handleExportCSV} className="gap-2 shrink-0 py-2.5 shadow-none" disabled={placementsList.length === 0}>
          <FileDown size={16} /> Export Placement CSV
        </Button>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-slate-800">
        {[
          { label: 'Highest Package', val: `${stats?.highestPackage || 0} LPA`, icon: <TrendingUp size={20} className="text-blue-500" />, bg: 'bg-blue-50/50' },
          { label: 'Average Package', val: `${stats?.averagePackage || 0} LPA`, icon: <DollarSign size={20} className="text-violet-500" />, bg: 'bg-violet-50/50' },
          { label: 'Total Placed', val: `${stats?.placedStudents || 0} Students`, icon: <Award size={20} className="text-emerald-500" />, bg: 'bg-emerald-50/50' },
          { label: 'Placement Percentage', val: `${stats?.placementRate}%`, icon: <Calendar size={20} className="text-rose-500" />, bg: 'bg-rose-50/50' }
        ].map((item, idx) => (
          <div key={idx} className={`p-5 rounded-2xl border border-slate-100 flex items-center justify-between bg-white shadow-xs`}>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-display">{item.label}</span>
              <span className="text-lg font-black text-slate-800 mt-2 block font-display">{item.val}</span>
            </div>
            <div className={`p-3.5 rounded-xl ${item.bg}`}>
              {item.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Department wise summaries table */}
        <div className="lg:col-span-6 p-6 bg-white border border-slate-100 rounded-2xl shadow-xs">
          <h3 className="text-sm font-bold text-slate-800 font-display mb-4">Department-wise Breakdown</h3>
          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full text-xs text-left align-middle">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider whitespace-nowrap">
                <tr>
                  <th className="px-4 py-3 whitespace-nowrap">Branch</th>
                  <th className="px-4 py-3 text-center whitespace-nowrap">Enrolled</th>
                  <th className="px-4 py-3 text-center whitespace-nowrap">Placed</th>
                  <th className="px-4 py-3 text-right whitespace-nowrap">Placement Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {deptDistribution.map((d, i) => (
                  <tr key={i} className="hover:bg-slate-50/40">
                    <td className="px-4 py-3 font-semibold text-slate-700">{d.name}</td>
                    <td className="px-4 py-3 text-center text-slate-500">{d.total}</td>
                    <td className="px-4 py-3 text-center text-slate-500">{d.placed}</td>
                    <td className="px-4 py-3 text-right text-emerald-600 font-bold">{d.rate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Master Placed Students list */}
        <div className="lg:col-span-6 p-6 bg-white border border-slate-100 rounded-2xl shadow-xs">
          <h3 className="text-sm font-bold text-slate-800 font-display mb-4">Recent Placements Offer Logs</h3>
          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full text-xs text-left align-middle">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider whitespace-nowrap">
                <tr>
                  <th className="px-4 py-3 whitespace-nowrap">Student Name</th>
                  <th className="px-4 py-3 whitespace-nowrap">Company Recruiter</th>
                  <th className="px-4 py-3 text-right whitespace-nowrap">Salary Package</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {placementsList.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-4 py-4 text-center text-slate-400">No placements recorded yet.</td>
                  </tr>
                ) : (
                  placementsList.slice(0, 5).map((p, i) => (
                    <tr key={i} className="hover:bg-slate-50/40">
                      <td className="px-4 py-3 font-semibold text-slate-700">{p.student?.name}</td>
                      <td className="px-4 py-3 text-slate-500">{p.company?.name}</td>
                      <td className="px-4 py-3 text-right text-primary-500 font-bold">{p.package} LPA</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerReports;
//
