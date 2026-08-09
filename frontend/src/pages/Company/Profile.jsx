import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext.jsx';
import { Button, Input, Select, Badge } from '../../components/UI.jsx';
import api from '../../services/api.js';

const CompanyProfile = () => {
  const { profile, setProfile } = useContext(AuthContext);
  
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  // Edit fields mapping profile
  const [name, setName] = useState(profile?.name || '');
  const [website, setWebsite] = useState(profile?.website || '');
  const [industry, setIndustry] = useState(profile?.industry || '');
  const [description, setDescription] = useState(profile?.description || '');
  const [headquarters, setHeadquarters] = useState(profile?.headquarters || '');
  const [size, setSize] = useState(profile?.size || '100-500');
  const [foundedYear, setFoundedYear] = useState(profile?.foundedYear || '');
  const [recruiterName, setRecruiterName] = useState(profile?.recruiterName || '');
  const [recruiterPhone, setRecruiterPhone] = useState(profile?.recruiterPhone || '');

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setWebsite(profile.website || '');
      setIndustry(profile.industry || '');
      setDescription(profile.description || '');
      setHeadquarters(profile.headquarters || '');
      setSize(profile.size || '100-500');
      setFoundedYear(profile.foundedYear || '');
      setRecruiterName(profile.recruiterName || '');
      setRecruiterPhone(profile.recruiterPhone || '');
    }
  }, [profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);

    const payload = {
      name, website, industry, description, headquarters, size,
      foundedYear: parseInt(foundedYear) || 1999,
      recruiterName, recruiterPhone
    };

    try {
      const { data } = await api.put(`/companies/${profile._id}`, payload);
      if (data.success) {
        setProfile(data.company);
        setAlert({ type: 'success', msg: 'Profile details updated successfully.' });
      }
    } catch (err) {
      setAlert({ type: 'danger', msg: err.response?.data?.message || 'Failed to update company profile.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 text-left animate-page-enter">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-slate-800 font-display">Company Recruiter Profile</h2>
        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Configure corporate branding and recruiter contacts</p>
      </div>

      {alert && (
        <div className={`p-4 rounded-xl text-xs font-bold border ${
          alert.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-500'
        }`}>
          {alert.msg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Card: Summary details */}
        <div className="lg:col-span-4 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
          <div className="h-16 w-16 rounded-2xl bg-blue-500 text-white font-extrabold flex items-center justify-center text-2xl font-display uppercase mb-4 shadow-lg shadow-blue-500/10">
            {profile?.name ? profile.name[0] : 'C'}
          </div>
          <h3 className="text-base font-bold text-slate-800 font-display">{profile?.name}</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{profile?.industry || 'IT Services'}</p>
          
          <div className="w-full border-t border-slate-50 my-5 pt-5 flex flex-col gap-3 text-xs text-slate-500 text-left">
            <div className="flex justify-between items-center">
              <span>Recruiter Status</span>
              <Badge
                status={
                  profile?.verificationStatus === 'APPROVED' ? 'success' :
                  profile?.verificationStatus === 'PENDING' ? 'warning' : 'danger'
                }
              >
                {profile?.verificationStatus || 'PENDING'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Headquarters</span>
              <span className="font-semibold text-slate-700">{profile?.headquarters || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span>Company Size</span>
              <span className="font-semibold text-slate-700">{profile?.size || 'N/A'} employees</span>
            </div>
          </div>
        </div>

        {/* Right Card: Profile editing form */}
        <div className="lg:col-span-8 p-8 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider font-display mb-4">Corporate Branding</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Company Name" value={name} onChange={(e) => setName(e.target.value)} required />
                <Input label="Website URL" value={website} onChange={(e) => setWebsite(e.target.value)} />
                <Input label="Corporate Industry" placeholder="e.g. Software Development" value={industry} onChange={(e) => setIndustry(e.target.value)} />
                <Input label="Headquarters Location" placeholder="e.g. Seattle, USA" value={headquarters} onChange={(e) => setHeadquarters(e.target.value)} />
                <Select
                  label="Company Size"
                  options={[
                    { value: '10-50', label: '10 - 50 employees' },
                    { value: '50-100', label: '50 - 100 employees' },
                    { value: '100-500', label: '100 - 500 employees' },
                    { value: '500-1000', label: '500 - 1000 employees' },
                    { value: '1000-5000', label: '1000 - 5000 employees' },
                    { value: '10000+', label: '10,000+ employees' }
                  ]}
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                />
                <Input label="Founded Year" type="number" value={foundedYear} onChange={(e) => setFoundedYear(e.target.value)} />
                <div className="sm:col-span-2">
                  <Input label="Corporate Description" value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
              </div>
            </div>

            <hr className="border-slate-50 my-2" />

            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider font-display mb-4">Primary Contact Recruiter</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Recruiter Name" value={recruiterName} onChange={(e) => setRecruiterName(e.target.value)} required />
                <Input label="Contact Phone Number" value={recruiterPhone} onChange={(e) => setRecruiterPhone(e.target.value)} />
              </div>
            </div>

            <Button variant="primary" type="submit" className="w-fit self-end mt-4 px-6" disabled={loading}>
              {loading ? 'Saving Profile...' : 'Save Corporate Profile'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;
