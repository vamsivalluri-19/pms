import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext.jsx';
import { Button, Input, Select, Badge } from '../../components/UI.jsx';
import api from '../../services/api.js';
import {
  Lock,
  Moon,
  Sun,
  Bell,
  Sliders,
  User,
  GraduationCap,
  Building,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Settings as SettingsIcon,
  ShieldCheck
} from 'lucide-react';

const Settings = () => {
  const { user, profile, theme, toggleTheme } = useContext(AuthContext);

  const [activeSubTab, setActiveSubTab] = useState('account'); // account, preferences, system
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  // Change Password States
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  // Notification Preferences States (Persisted in LocalStorage)
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(true);
  const [reminders, setReminders] = useState(true);
  const [marketing, setMarketing] = useState(false);

  // System Settings State (For Admin)
  const [sysSettings, setSysSettings] = useState({
    institutionName: '',
    adminEmail: '',
    allowStudentRegistration: true,
    allowRecruiterRegistration: true,
    requireRecruiterApproval: true,
    sessionTimeoutMinutes: 60,
    maxLoginAttempts: 5,
    enable2FA: false,
    strictPasswordPolicy: true,
    emailNotificationsEnabled: true,
    minCgpaDefault: 6.5,
    maxBacklogsDefault: 0,
    maintenanceMode: false
  });
  const [savingSysSettings, setSavingSysSettings] = useState(false);

  // Mock Manager Config (Persisted in LocalStorage)
  const [pmConfig, setPmConfig] = useState({
    academicYear: 'AY 2026-2027',
    minCgpa: 6.0,
    verificationMode: 'Dual-Auth Officer Verification',
    auditTrailMode: 'System-Wide Auditing Active'
  });

  useEffect(() => {
    // Load local storage preferences
    const savedEmailAlerts = localStorage.getItem('emailAlerts');
    const savedPushAlerts = localStorage.getItem('pushAlerts');
    const savedReminders = localStorage.getItem('reminders');
    const savedMarketing = localStorage.getItem('marketing');
    
    if (savedEmailAlerts !== null) setEmailAlerts(savedEmailAlerts === 'true');
    if (savedPushAlerts !== null) setPushAlerts(savedPushAlerts === 'true');
    if (savedReminders !== null) setReminders(savedReminders === 'true');
    if (savedMarketing !== null) setMarketing(savedMarketing === 'true');

    const savedPmConfig = localStorage.getItem('pmConfig');
    if (savedPmConfig !== null) {
      setPmConfig(JSON.parse(savedPmConfig));
    }

    // Load System Settings if Admin
    if (user?.role === 'ADMIN') {
      const fetchSystemSettings = async () => {
        try {
          const { data } = await api.get('/system-settings');
          if (data.success && data.settings) {
            setSysSettings(data.settings);
          }
        } catch (err) {
          console.error('Failed to load system settings:', err);
        }
      };
      fetchSystemSettings();
    }
  }, [user]);

  const handleSaveNotifications = (e) => {
    e.preventDefault();
    localStorage.setItem('emailAlerts', emailAlerts);
    localStorage.setItem('pushAlerts', pushAlerts);
    localStorage.setItem('reminders', reminders);
    localStorage.setItem('marketing', marketing);
    setAlert({ type: 'success', msg: 'Interface notification preferences saved successfully!' });
    setTimeout(() => setAlert(null), 3000);
  };

  const handleSavePmConfig = (e) => {
    e.preventDefault();
    localStorage.setItem('pmConfig', JSON.stringify(pmConfig));
    setAlert({ type: 'success', msg: 'Institutional rules config saved locally for Placement Officer!' });
    setTimeout(() => setAlert(null), 3000);
  };

  const handleSaveSystemSettings = async (e) => {
    e.preventDefault();
    setSavingSysSettings(true);
    try {
      const { data } = await api.put('/system-settings', sysSettings);
      if (data.success) {
        setAlert({ type: 'success', msg: 'Global Administrative Settings updated successfully across all modules!' });
        setTimeout(() => setAlert(null), 4000);
      }
    } catch (err) {
      setAlert({ type: 'danger', msg: err.response?.data?.message || 'Failed to update system settings.' });
    } finally {
      setSavingSysSettings(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setAlert({ type: 'danger', msg: 'Passwords do not match.' });
      return;
    }
    setLoading(true);
    setAlert(null);
    try {
      const { data } = await api.put('/auth/change-password', { oldPassword, newPassword });
      if (data.success) {
        setAlert({ type: 'success', msg: 'Your account password has been updated successfully.' });
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setAlert({ type: 'danger', msg: err.response?.data?.message || 'Failed to update password.' });
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = () => {
    switch (user?.role) {
      case 'STUDENT': return <GraduationCap size={18} />;
      case 'COMPANY': return <Building size={18} />;
      case 'PLACEMENT_MANAGER': return <Sliders size={18} />;
      case 'ADMIN': return <ShieldCheck size={18} />;
      default: return <User size={18} />;
    }
  };

  return (
    <div className="flex flex-col gap-8 text-left animate-page-enter">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-slate-800 font-display">Account Settings</h2>
        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Configure your profile credentials, theme preferences, and system controls</p>
      </div>

      {alert && (
        <div className={`p-4 rounded-xl text-xs font-bold border flex items-center gap-2 ${
          alert.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-500'
        }`}>
          {alert.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {alert.msg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Navigation Tabs */}
        <div className="lg:col-span-3 flex flex-col gap-1 p-2 bg-white rounded-2xl border border-slate-100 shadow-xs shrink-0">
          <button
            onClick={() => { setActiveSubTab('account'); setAlert(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'account' ? 'bg-primary-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <Lock size={16} />
            Password & Security
          </button>
          
          <button
            onClick={() => { setActiveSubTab('preferences'); setAlert(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'preferences' ? 'bg-primary-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <Bell size={16} />
            Interface Preferences
          </button>

          {(user?.role === 'PLACEMENT_MANAGER' || user?.role === 'ADMIN') && (
            <button
              onClick={() => { setActiveSubTab('system'); setAlert(null); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'system' ? 'bg-primary-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <SettingsIcon size={16} />
              System Config
            </button>
          )}
        </div>

        {/* Right Side: Tab panel contents */}
        <div className="lg:col-span-9 bg-white border border-slate-100 rounded-2xl p-8 shadow-xs">
          
          {/* TAB 1: Password & Security */}
          {activeSubTab === 'account' && (
            <div className="flex flex-col gap-6 animate-page-enter">
              <h3 className="text-sm font-bold text-slate-800 font-display">Password & Security</h3>

              {/* Profile Details summary card */}
              <div className="p-5 border border-slate-100 rounded-2xl bg-slate-50 flex flex-col gap-4 text-xs">
                <div className="flex items-center justify-between border-b border-slate-200/50 pb-3">
                  <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] font-display">Account Information</span>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Platform Coordinates</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <span className="text-slate-400 font-semibold block">Email ID</span>
                    <span className="font-bold text-slate-800 break-all">{user?.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block">Role Profile</span>
                    <Badge status={user?.role === 'ADMIN' ? 'danger' : user?.role === 'PLACEMENT_MANAGER' ? 'warning' : 'primary'} className="flex items-center gap-1 w-fit mt-0.5">
                      {getRoleIcon()}
                      {user?.role}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block">Profile Name</span>
                    <span className="font-bold text-slate-800">{profile?.name || 'Vamsi Valluri'}</span>
                  </div>
                </div>
              </div>

              {/* Change Password Form */}
              <form onSubmit={handlePasswordChange} className="flex flex-col gap-5 mt-3 border-t border-slate-100 pt-6">
                <div>
                  <h4 className="font-bold text-slate-700 font-display">Update Password Credentials</h4>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Ensure your password uses combinations of letters, numbers, and special characters</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="relative">
                    <Input
                      label="Current Password"
                      type={showOldPass ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPass(!showOldPass)}
                      className="absolute right-3.5 top-9.5 text-slate-400 hover:text-slate-600"
                    >
                      {showOldPass ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>

                  <div className="relative">
                    <Input
                      label="New Password"
                      type={showNewPass ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3.5 top-9.5 text-slate-400 hover:text-slate-600"
                    >
                      {showNewPass ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>

                  <Input
                    label="Confirm Password"
                    type={showNewPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" variant="primary" className="w-fit self-end py-2 px-6 shadow-none mt-2" disabled={loading}>
                  Update Account Password
                </Button>
              </form>
            </div>
          )}

          {/* TAB 2: Interface Preferences */}
          {activeSubTab === 'preferences' && (
            <div className="flex flex-col gap-6 animate-page-enter">
              <h3 className="text-sm font-bold text-slate-800 font-display">Interface Preferences</h3>

              {/* Theme Settings */}
              <div className="p-5 border border-slate-100 rounded-2xl bg-slate-50 flex items-center justify-between text-xs text-left">
                <div>
                  <p className="font-bold text-slate-700 font-display">Theme Preference</p>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Toggle default theme template across system panels</p>
                </div>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="px-4 py-2.5 border border-slate-200 bg-white rounded-xl font-bold hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors text-slate-600 shadow-sm"
                >
                  {theme === 'light' ? (
                    <><Moon size={14} className="text-violet-500" /> Dark Mode</>
                  ) : (
                    <><Sun size={14} className="text-amber-500" /> Light Mode</>
                  )}
                </button>
              </div>

              {/* Notification Toggles Form */}
              <form onSubmit={handleSaveNotifications} className="flex flex-col gap-5 mt-2 border-t border-slate-100 pt-6">
                <div>
                  <h4 className="font-bold text-slate-700 font-display">Notification Settings</h4>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Choose how you want to be notified about placement events</p>
                </div>

                <div className="flex flex-col gap-4 text-xs">
                  <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
                    <div>
                      <span className="font-bold text-slate-800 block">Email Notifications</span>
                      <span className="text-[10px] text-slate-400">Receive summaries, application results, and recruiter feedback.</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={emailAlerts}
                        onChange={(e) => setEmailAlerts(e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
                    <div>
                      <span className="font-bold text-slate-800 block">Real-time Push Alerts</span>
                      <span className="text-[10px] text-slate-400">Receive live alerts of drive schedule updates, meeting invites, and chat pings.</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={pushAlerts}
                        onChange={(e) => setPushAlerts(e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
                    <div>
                      <span className="font-bold text-slate-800 block">Deadline Event Reminders</span>
                      <span className="text-[10px] text-slate-400">Remind me of upcoming drive deadlines 24 hours in advance.</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={reminders}
                        onChange={(e) => setReminders(e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
                    <div>
                      <span className="font-bold text-slate-800 block">Recruiter Newsletters & Bulletins</span>
                      <span className="text-[10px] text-slate-400">Periodic emails highlighting recruiter companies profiles and preparation courses.</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={marketing}
                        onChange={(e) => setMarketing(e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                    </label>
                  </div>
                </div>

                <Button type="submit" variant="primary" className="w-fit self-end py-2 px-6 shadow-none mt-2">
                  Save Preferences
                </Button>
              </form>
            </div>
          )}

          {/* TAB 3: System Config (For Manager and Admin roles) */}
          {activeSubTab === 'system' && (
            <div className="flex flex-col gap-6 animate-page-enter">
              {user?.role === 'PLACEMENT_MANAGER' && (
                <form onSubmit={handleSavePmConfig} className="flex flex-col gap-6 text-xs text-left">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 font-display">Institutional System Config</h3>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Placement Officer configurations console. Specify default drive criteria and audit details.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Placement Academic Year"
                      value={pmConfig.academicYear}
                      onChange={(e) => setPmConfig({ ...pmConfig, academicYear: e.target.value })}
                      required
                    />
                    <Input
                      label="Minimum Permitted Cumulative CGPA"
                      type="number"
                      step="0.1"
                      value={pmConfig.minCgpa}
                      onChange={(e) => setPmConfig({ ...pmConfig, minCgpa: parseFloat(e.target.value) || 0 })}
                      required
                    />
                    <Select
                      label="Document Verification Mode"
                      options={[
                        { value: 'Dual-Auth Officer Verification', label: 'Dual-Auth Officer Verification' },
                        { value: 'Single Sign-Off Admin Check', label: 'Single Sign-Off Admin Check' },
                        { value: 'Instant Academic Auto-Verify', label: 'Instant Academic Auto-Verify' }
                      ]}
                      value={pmConfig.verificationMode}
                      onChange={(e) => setPmConfig({ ...pmConfig, verificationMode: e.target.value })}
                    />
                    <Select
                      label="Audit Logs Trail Mode"
                      options={[
                        { value: 'System-Wide Auditing Active', label: 'System-Wide Auditing Active' },
                        { value: 'Limited Debug Logging Mode', label: 'Limited Debug Logging Mode' },
                        { value: 'Audit Logging Suspended', label: 'Audit Logging Suspended' }
                      ]}
                      value={pmConfig.auditTrailMode}
                      onChange={(e) => setPmConfig({ ...pmConfig, auditTrailMode: e.target.value })}
                    />
                  </div>

                  <Button type="submit" variant="primary" className="w-fit self-end py-2 px-6 shadow-none mt-2 flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700">
                    <Save size={13} /> Save Institutional Rules
                  </Button>
                </form>
              )}

              {user?.role === 'ADMIN' && (
                <form onSubmit={handleSaveSystemSettings} className="flex flex-col gap-6 text-xs text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 font-display">Administrative Global Controls</h3>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Manage systemic preferences, credentials complexity, security and backups</p>
                    </div>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={savingSysSettings}
                      className="bg-amber-600 hover:bg-amber-700 text-white py-2 px-5 flex items-center gap-2 shadow-none cursor-pointer text-xs shrink-0 font-bold"
                    >
                      <Save size={14} />
                      {savingSysSettings ? 'Saving...' : 'Apply Admin Settings'}
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Institution / Organization Title"
                      value={sysSettings.institutionName || ''}
                      onChange={(e) => setSysSettings({ ...sysSettings, institutionName: e.target.value })}
                      required
                    />

                    <Input
                      label="Primary System Admin Email"
                      type="email"
                      value={sysSettings.adminEmail || ''}
                      onChange={(e) => setSysSettings({ ...sysSettings, adminEmail: e.target.value })}
                      required
                    />

                    <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
                      <div>
                        <span className="font-bold text-slate-800 block">Student Self-Registration</span>
                        <span className="text-[10px] text-slate-400">Allow prospective students to register</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={sysSettings.allowStudentRegistration || false}
                          onChange={(e) => setSysSettings({ ...sysSettings, allowStudentRegistration: e.target.checked })}
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
                      <div>
                        <span className="font-bold text-slate-800 block">Recruiter Self-Registration</span>
                        <span className="text-[10px] text-slate-400">Allow recruiters to build business profiles</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={sysSettings.allowRecruiterRegistration || false}
                          onChange={(e) => setSysSettings({ ...sysSettings, allowRecruiterRegistration: e.target.checked })}
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
                      <div>
                        <span className="font-bold text-slate-800 block">Require Recruiter Audit</span>
                        <span className="text-[10px] text-slate-400">Must verify recruiters before job listings</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={sysSettings.requireRecruiterApproval || false}
                          onChange={(e) => setSysSettings({ ...sysSettings, requireRecruiterApproval: e.target.checked })}
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
                      <div>
                        <span className="font-bold text-slate-800 block">Strict Passwords Enforcement</span>
                        <span className="text-[10px] text-slate-400">Required complex keys for account registers</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={sysSettings.strictPasswordPolicy || false}
                          onChange={(e) => setSysSettings({ ...sysSettings, strictPasswordPolicy: e.target.checked })}
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                      </label>
                    </div>

                    <Select
                      label="Session Inactivity Timeout"
                      options={[
                        { value: 15, label: '15 Minutes' },
                        { value: 30, label: '30 Minutes' },
                        { value: 60, label: '1 Hour' },
                        { value: 720, label: '12 Hours' }
                      ]}
                      value={sysSettings.sessionTimeoutMinutes || 60}
                      onChange={(e) => setSysSettings({ ...sysSettings, sessionTimeoutMinutes: parseInt(e.target.value) })}
                    />

                    <Select
                      label="Max Password Login Retries"
                      options={[
                        { value: 3, label: '3 attempts' },
                        { value: 5, label: '5 attempts' },
                        { value: 10, label: '10 attempts' }
                      ]}
                      value={sysSettings.maxLoginAttempts || 5}
                      onChange={(e) => setSysSettings({ ...sysSettings, maxLoginAttempts: parseInt(e.target.value) })}
                    />
                  </div>
                </form>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Settings;
