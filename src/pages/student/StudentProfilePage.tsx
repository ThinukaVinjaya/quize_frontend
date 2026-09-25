import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { StudentProfile } from '../../types/index.js';
import {
  User,
  School,
  MapPin,
  Lock,
  Save,
  CheckCircle,
  AlertCircle,
  Phone,
  Mail,
  GraduationCap,
  ShieldCheck,
  KeyRound
} from 'lucide-react';

export const StudentProfilePage: React.FC = () => {
  const { updateUser } = useAuth();
  const [profile, setProfile] = useState<StudentProfile | null>(null);

  // Profile details state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [school, setSchool] = useState('');
  const [grade, setGrade] = useState<number | undefined>(undefined);
  const [provinceId, setProvinceId] = useState('');
  const [districtId, setDistrictId] = useState('');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMessage, setPwdMessage] = useState('');
  const [pwdError, setPwdError] = useState('');

  // Provinces & Districts
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [filteredDistricts, setFilteredDistricts] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/student/profile'),
      api.get('/meta/provinces'),
      api.get('/meta/districts'),
    ])
      .then(([profRes, provRes, distRes]) => {
        const p = profRes.data.data;
        setProfile(p);
        setFullName(p.fullName || '');
        setEmail(p.email || '');
        setPhoneNumber(p.phoneNumber || '');
        setSchool(p.school || '');
        setGrade(p.grade);
        setProvinceId(p.provinceId || '');
        setDistrictId(p.districtId || '');

        setProvinces(provRes.data.data || []);
        const allDistricts = distRes.data.data || [];
        setDistricts(allDistricts);
        if (p.provinceId) {
          setFilteredDistricts(allDistricts.filter((d: any) => d.provinceId === p.provinceId));
        }
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to load student profile.');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (provinceId) {
      setFilteredDistricts(districts.filter((d) => d.provinceId === provinceId));
    } else {
      setFilteredDistricts([]);
    }
  }, [provinceId, districts]);

  const isValidSriLankanPhone = (num: string): boolean => {
    const cleaned = num.replace(/[\s\-]/g, '');
    const slRegex = /^(?:0|94|\+94)?7[0-9]{8}$/;
    return slRegex.test(cleaned);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (phoneNumber && !isValidSriLankanPhone(phoneNumber)) {
      setError('Please enter a valid Sri Lankan mobile number (e.g. 0771234567 or +94771234567).');
      return;
    }

    setSaving(true);
    try {
      const res = await api.put('/student/profile', {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phoneNumber: phoneNumber.trim(),
        school: school.trim(),
        grade: grade ? Number(grade) : undefined,
        provinceId,
        districtId,
      });

      const updated = res.data.data;
      setProfile((prev) => (prev ? { ...prev, ...updated } : updated));
      updateUser({ fullName: updated.fullName, email: updated.email });
      setMessage('Profile details updated successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError('');
    setPwdMessage('');

    if (!currentPassword || !newPassword) {
      setPwdError('Current password and new password are required.');
      return;
    }

    if (newPassword.length < 6) {
      setPwdError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwdError('New passwords do not match.');
      return;
    }

    setPwdLoading(true);
    try {
      const res = await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      setPwdMessage(res.data?.message || 'Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPwdError(err.response?.data?.message || 'Failed to change password. Please check your current password.');
    } finally {
      setPwdLoading(false);
    }
  };

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400 gap-3 font-sans">
        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-semibold">Loading student profile...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto font-sans space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-slate-800 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-18 h-18 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-3xl shadow-xl shadow-blue-500/25 flex-shrink-0">
            {profile.fullName ? profile.fullName.charAt(0).toUpperCase() : 'S'}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-extrabold text-white font-display">{profile.fullName}</h1>
              {profile.grade ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                  Grade {profile.grade} Student
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                  Student
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 font-mono">@{profile.username}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2.5 bg-slate-950/60 rounded-2xl border border-slate-800 text-right">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Registered Email
            </span>
            <span className="text-xs font-semibold text-slate-200 block truncate max-w-[200px]">
              {profile.email || 'Not verified'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Edit Details Form */}
        <div className="lg:col-span-2 bg-slate-900/70 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-slate-800 shadow-2xl space-y-6">
          <div className="flex items-center gap-2.5 border-b border-slate-800 pb-4">
            <User className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-bold text-white">Student Details & Academic Info</h2>
          </div>

          {message && (
            <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-2xl text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div className="p-4 bg-rose-500/15 border border-rose-500/30 text-rose-300 rounded-2xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Mobile Number (Sri Lanka) *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="077 123 4567"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  School / Institute *
                </label>
                <div className="relative">
                  <School className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Grade
                </label>
                <select
                  value={grade ?? ''}
                  onChange={(e) => setGrade(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="" className="bg-slate-900 text-slate-400">
                    Not Specified
                  </option>
                  {[6, 7, 8, 9, 10, 11, 12, 13].map((g) => (
                    <option key={g} value={g} className="bg-slate-900 text-white">
                      Grade {g}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Province *
                </label>
                <select
                  required
                  value={provinceId}
                  onChange={(e) => {
                    setProvinceId(e.target.value);
                    setDistrictId('');
                  }}
                  className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="" className="bg-slate-900 text-slate-400">
                    Select Province
                  </option>
                  {provinces.map((p) => (
                    <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                      {p.nameEn} ({p.nameSi})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  District *
                </label>
                <select
                  required
                  value={districtId}
                  disabled={!provinceId}
                  onChange={(e) => setDistrictId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <option value="" className="bg-slate-900 text-slate-400">
                    Select District
                  </option>
                  {filteredDistricts.map((d) => (
                    <option key={d.id} value={d.id} className="bg-slate-900 text-white">
                      {d.nameEn} ({d.nameSi})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving changes...' : 'Save Profile Details'}
              </button>
            </div>
          </form>
        </div>

        {/* Right 1 Col: Security & Password Change */}
        <div className="bg-slate-900/70 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-slate-800 shadow-2xl space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-800 pb-4">
              <Lock className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold text-white">Security & Password</h2>
            </div>

            {pwdMessage && (
              <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{pwdMessage}</span>
              </div>
            )}

            {pwdError && (
              <div className="p-3 bg-rose-500/15 border border-rose-500/30 text-rose-300 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{pwdError}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Current Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full pl-10 pr-4 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full pl-10 pr-4 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={pwdLoading}
                className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider disabled:opacity-50 mt-2"
              >
                <ShieldCheck className="w-4 h-4" />
                {pwdLoading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>

          <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-400 leading-relaxed">
            Ensure your password is at least 6 characters and unique to protect your examination history and rankings.
          </div>
        </div>
      </div>
    </div>
  );
};
