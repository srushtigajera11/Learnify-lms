import { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { useAuth } from "../../Context/authContext";

/* ─── tiny helpers ─── */
const initials = (name = "") =>
  name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

const Avatar = ({ name, size = 96 }) => (
  <div
    style={{ width: size, height: size, fontSize: size * 0.36 }}
    className="rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center font-black text-white shadow-xl ring-4 ring-white/30 select-none"
  >
    {initials(name)}
  </div>
);

/* ─── Icon set ─── */
const Icon = ({ d, size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={d} />
  </svg>
);
const icons = {
  user:     "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  lock:     "M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM17 11V7a5 5 0 0 0-10 0v4",
  book:     "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z",
  target:   "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  grad:     "M22 10v6M2 10l10-5 10 5-10 5-10-5zM6 12v5c3 3 9 3 12 0v-5",
  star:     "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  check:    "M20 6L9 17l-5-5",
  x:        "M18 6 6 18M6 6l12 12",
  plus:     "M12 5v14M5 12h14",
  save:     "M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2zM17 21v-8H7v8M7 3v5h8",
  eye:      "M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  eyeOff:   "M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22",
  alert:    "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 8v4M12 16h.01",
  calendar: "M8 2v3M16 2v3M3 8h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z",
  trophy:   "M8.21 13.89L7 23l5-3 5 3-1.21-9.11M15 7a3 3 0 1 1-6 0M18 3H6l1 7h10l1-7z",
  zap:      "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  flame:    "M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z",
};

const inputCls = "w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-sky-500/60 focus:bg-white/8 focus:ring-1 focus:ring-sky-500/30 transition-all duration-200";
const selectCls = `${inputCls} cursor-pointer`;

/* ─── Stat Card ─── */
const StatCard = ({ label, value, accent, icon }) => (
  <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 group">
    {icon && <Icon d={icon} size={16} className={`${accent} mb-1 opacity-60 group-hover:opacity-100 transition-opacity`} />}
    <span className={`text-2xl font-black ${accent} group-hover:scale-110 transition-transform duration-200`}>{value}</span>
    <span className="text-xs text-slate-400 mt-1 font-medium tracking-wide uppercase">{label}</span>
  </div>
);

/* ─── Interest Badge ─── */
const InterestBadge = ({ item, onRemove }) => (
  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-300 text-xs font-semibold tracking-wide hover:bg-sky-500/25 transition-colors">
    {item}
    {onRemove && (
      <button onClick={() => onRemove(item)} className="opacity-50 hover:opacity-100 hover:text-red-400 transition-all ml-0.5">
        <Icon d={icons.x} size={12} />
      </button>
    )}
  </span>
);

/* ─── Field Wrapper ─── */
const Field = ({ label, icon, error, children }) => (
  <div className="space-y-1.5">
    <label className="flex items-center gap-2 text-xs font-semibold tracking-widest text-slate-400 uppercase">
      {icon && <Icon d={icon} size={13} className="text-sky-400" />}
      {label}
    </label>
    {children}
    {error && (
      <p className="text-xs text-red-400 flex items-center gap-1">
        <Icon d={icons.alert} size={12} />{error}
      </p>
    )}
  </div>
);

/* ─── PwInput — defined at TOP LEVEL so it never remounts on keystroke ─── */
const PwInput = ({ value, onChange, show, onToggle, placeholder, hasError }) => (
  <div className="relative">
    <input
      type={show ? "text" : "password"}
      className={`${inputCls} pr-11 ${hasError ? "border-red-500/60" : ""}`}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
    >
      <Icon d={show ? icons.eyeOff : icons.eye} size={16} />
    </button>
  </div>
);

/* ─── Edit Profile Form ─── */
const EditProfileForm = ({ user, onUpdated }) => {
  const buildForm = (u) => ({
    name:           u?.name || "",
    email:          u?.email || "",
    educationLevel: u?.studentProfile?.educationLevel || "",
    learningGoals:  u?.studentProfile?.learningGoals || "",
    interests:      u?.studentProfile?.interests || [],
  });

  const [form, setForm]             = useState(() => buildForm(user));
  const [newInterest, setNewInterest] = useState("");
  const [loading, setLoading]       = useState(false);
  const [success, setSuccess]       = useState(false);
  const [error, setError]           = useState("");

  // Re-sync form if parent user prop changes (e.g. after fetch)
  useEffect(() => {
    setForm(buildForm(user));
  }, [user]);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const addInterest = () => {
    const s = newInterest.trim();
    if (s && !form.interests.includes(s)) {
      setForm((p) => ({ ...p, interests: [...p.interests, s] }));
      setNewInterest("");
    }
  };
  const removeInterest = (s) =>
    setForm((p) => ({ ...p, interests: p.interests.filter((x) => x !== s) }));

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      setError("Name and email are required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { data } = await axiosInstance.put("/users/profile", {
        name:  form.name,
        email: form.email,
        studentProfile: {
          educationLevel: form.educationLevel,
          learningGoals:  form.learningGoals,
          interests:      form.interests,
        },
      });

      if (data?.user) {
        setForm(buildForm(data.user));
        onUpdated?.(data.user);
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const interestSuggestions = ["Web Dev", "Data Science", "UI/UX", "Machine Learning", "DevOps", "Mobile Dev", "Cybersecurity", "Cloud"];
  const educationOptions    = ["High School", "Diploma", "Bachelor's", "Master's", "PhD", "Self-taught", "Other"];

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <section>
        <h4 className="text-xs font-bold tracking-widest text-slate-500 uppercase mb-4 pb-2 border-b border-white/5">
          Basic Information
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Full Name" icon={icons.user}>
            <input className={inputCls} value={form.name} onChange={set("name")} placeholder="Your full name" />
          </Field>
          <Field label="Email Address">
            <input className={inputCls} type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" />
          </Field>
          <Field label="Education Level" icon={icons.grad}>
            <select className={selectCls} value={form.educationLevel} onChange={set("educationLevel")}>
              <option value="">Select level…</option>
              {educationOptions.map((o) => (
                <option key={o} value={o} className="bg-[#0c0e14]">{o}</option>
              ))}
            </select>
          </Field>
        </div>
      </section>

      {/* Learning Goals */}
      <Field label="Learning Goals" icon={icons.target}>
        <textarea
          className={`${inputCls} resize-none`}
          rows={4}
          value={form.learningGoals}
          onChange={set("learningGoals")}
          placeholder="What do you want to achieve? e.g. Build a full-stack app, land a developer role..."
        />
      </Field>

      {/* Interests */}
      <section>
        <h4 className="text-xs font-bold tracking-widest text-slate-500 uppercase mb-4 pb-2 border-b border-white/5">
          Learning Interests
        </h4>
        <div className="flex gap-2 mb-3">
          <input
            className={`${inputCls} flex-1`}
            value={newInterest}
            onChange={(e) => setNewInterest(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addInterest())}
            placeholder="Type an interest & press Enter"
          />
          <button
            onClick={addInterest}
            disabled={!newInterest.trim()}
            className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-900 font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
          >
            <Icon d={icons.plus} size={15} /> Add
          </button>
        </div>

        {/* Quick suggestions */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {interestSuggestions.map((s) => (
            <button
              key={s}
              onClick={() => !form.interests.includes(s) && setForm((p) => ({ ...p, interests: [...p.interests, s] }))}
              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                form.interests.includes(s)
                  ? "bg-sky-500/20 border-sky-500/40 text-sky-300"
                  : "border-white/10 text-slate-500 hover:border-white/20 hover:text-slate-400"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {form.interests.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {form.interests.map((s) => (
              <InterestBadge key={s} item={s} onRemove={removeInterest} />
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-600 italic">No interests added yet.</p>
        )}
      </section>

      {/* Error */}
      {error && (
        <p className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          <Icon d={icons.alert} size={15} className="shrink-0" /> {error}
        </p>
      )}

      {/* Submit */}
      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-400 hover:to-blue-400 text-white font-bold text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-sky-500/20 hover:shadow-sky-500/40"
        >
          <Icon d={icons.save} size={15} />
          {loading ? "Saving…" : "Save Changes"}
        </button>
        {success && (
          <span className="flex items-center gap-1.5 text-sm text-emerald-400 font-medium">
            <Icon d={icons.check} size={15} className="text-emerald-400" /> Saved successfully!
          </span>
        )}
      </div>
    </div>
  );
};

/* ─── Password Form ─── */
const PasswordForm = () => {
  const [form, setForm]     = useState({ current: "", next: "", confirm: "" });
  const [show, setShow]     = useState({ current: false, next: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");
  const [success, setSuccess] = useState(false);

  const mismatch = form.next !== form.confirm && form.confirm !== "";
  const strength =
    form.next.length >= 8 ? "strong" :
    form.next.length >= 6 ? "medium" :
    form.next.length > 0  ? "weak"   : "";
  const strengthColor = { strong: "bg-emerald-500", medium: "bg-sky-500", weak: "bg-red-500" }[strength] || "";
  const strengthWidth = { strong: "w-full", medium: "w-2/3", weak: "w-1/3" }[strength] || "w-0";

  const handleSubmit = async () => {
    if (mismatch) return setError("Passwords don't match.");
    if (!form.current || !form.next) return setError("All fields are required.");
    setLoading(true);
    try {
      await axiosInstance.put("/users/change-password", {
        currentPassword: form.current,
        newPassword:     form.next,
      });
      setSuccess(true);
      setForm({ current: "", next: "", confirm: "" });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md space-y-5">
      <Field label="Current Password" icon={icons.lock}>
        <PwInput
          value={form.current}
          onChange={(e) => { setForm(p => ({ ...p, current: e.target.value })); setError(""); }}
          show={show.current}
          onToggle={() => setShow(p => ({ ...p, current: !p.current }))}
          placeholder="Enter current password"
        />
      </Field>

      <div className="space-y-1.5">
        <Field label="New Password" icon={icons.lock}>
          <PwInput
            value={form.next}
            onChange={(e) => { setForm(p => ({ ...p, next: e.target.value })); setError(""); }}
            show={show.next}
            onToggle={() => setShow(p => ({ ...p, next: !p.next }))}
            placeholder="Min. 8 characters recommended"
          />
        </Field>
        {strength && (
          <div className="space-y-1">
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-500 ${strengthColor} ${strengthWidth}`} />
            </div>
            <p className={`text-xs font-medium capitalize ${
              strength === "strong" ? "text-emerald-400" :
              strength === "medium" ? "text-sky-400" : "text-red-400"
            }`}>{strength} password</p>
          </div>
        )}
      </div>

      <Field label="Confirm New Password" icon={icons.lock} error={mismatch ? "Passwords don't match" : ""}>
        <PwInput
          value={form.confirm}
          onChange={(e) => { setForm(p => ({ ...p, confirm: e.target.value })); setError(""); }}
          show={show.confirm}
          onToggle={() => setShow(p => ({ ...p, confirm: !p.confirm }))}
          placeholder="Re-enter new password"
          hasError={mismatch}
        />
      </Field>

      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1.5">
          <Icon d={icons.alert} size={13} />{error}
        </p>
      )}

      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={handleSubmit}
          disabled={loading || mismatch || !form.current || !form.next}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-400 hover:to-blue-400 text-white font-bold text-sm flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-sky-500/20"
        >
          <Icon d={icons.lock} size={15} />
          {loading ? "Updating…" : "Update Password"}
        </button>
        {success && (
          <span className="flex items-center gap-1.5 text-sm text-emerald-400 font-medium">
            <Icon d={icons.check} size={15} /> Updated!
          </span>
        )}
      </div>
    </div>
  );
};

/* ─── Main Student Profile Page ─── */
const StudentProfile = () => {
  const { user: authUser, loading: authLoading, isAuthenticated, setUser: setAuthUser } = useAuth();
  const [user, setUser]   = useState(null);
  const [stats, setStats] = useState({ enrolled: 0, completed: 0, xp: 0, streak: 0 });
  const [tab, setTab]     = useState(0);

  useEffect(() => {
    if (!authUser) return;

    // Fetch full profile (includes studentProfile fields)
    axiosInstance.get("/users/profile")
      .then(({ data }) => setUser(data.user))
      .catch(console.error);

    // Gamification stats — fail silently if endpoint doesn't exist yet
    axiosInstance.get("/gamification/my-stats")
      .then(({ data }) => setStats((p) => ({ ...p, xp: data?.xp ?? 0, streak: data?.streak ?? 0 })))
      .catch(() => {});

    // Enrollment stats
    axiosInstance.get("/enrollments/my")
      .then(({ data }) => {
        const enrollments = data?.enrollments || data || [];
        const completed   = enrollments.filter((e) => e.isCompleted).length;
        setStats((p) => ({ ...p, enrolled: enrollments.length, completed }));
      })
      .catch(() => {});
  }, [authUser]);

  /* ─── Guards ─── */
  if (authLoading || !user) return (
    <div className="min-h-screen bg-[#0c0e14] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 text-sm">Loading profile…</p>
      </div>
    </div>
  );

  if (!isAuthenticated) return (
    <div className="min-h-screen bg-[#0c0e14] flex items-center justify-center">
      <p className="text-red-400">You must be logged in to view your profile.</p>
    </div>
  );

  const profile  = user.studentProfile || {};
  const joinDate = new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const tabs = [
    { label: "Edit Profile", icon: icons.user },
    { label: "Security",     icon: icons.lock },
  ];

  const handleUpdated = (updatedUser) => {
    setUser(updatedUser);         // refreshes sidebar cards instantly
    setAuthUser?.(updatedUser);   // refreshes navbar/header if it reads from context
  };

  return (
    <div className="min-h-screen bg-[#0c0e14] text-slate-100" style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>

      {/* ─── Hero Banner ─── */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00081a] via-[#0c0e14] to-[#080a16]" />
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: "radial-gradient(ellipse 80% 60% at 20% 40%, rgba(14,165,233,0.22) 0%, transparent 60%), radial-gradient(ellipse 60% 80% at 80% 20%, rgba(59,130,246,0.15) 0%, transparent 60%)"
        }} />
        <div className="absolute inset-0" style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
          opacity: 0.4,
        }} />

        <div className="relative max-w-6xl mx-auto px-6 py-12 pb-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 pb-8">
            {/* Avatar */}
            <div className="relative">
              <Avatar name={user.name} size={88} />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-[#0c0e14]" title="Active" />
            </div>

            {/* Name + meta */}
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl font-black tracking-tight">{user.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-400 text-xs font-bold tracking-widest uppercase">
                  Student
                </span>
              </div>
              <p className="text-slate-400 text-sm">{user.email}</p>
              <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                <Icon d={icons.calendar} size={13} />
                Member since {joinDate}
              </div>
            </div>

            {/* Education badge */}
            {profile.educationLevel && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                <Icon d={icons.grad} size={16} className="text-sky-400" />
                <span className="text-sm text-slate-300 font-medium">{profile.educationLevel}</span>
              </div>
            )}
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-4 gap-3 pb-8">
            <StatCard label="Enrolled"   value={stats.enrolled}  accent="text-sky-400"     icon={icons.book} />
            <StatCard label="Completed"  value={stats.completed} accent="text-emerald-400" icon={icons.check} />
            <StatCard label="XP Earned"  value={stats.xp}        accent="text-amber-400"   icon={icons.zap} />
            <StatCard label="Day Streak" value={stats.streak}    accent="text-orange-400"  icon={icons.flame} />
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 inset-x-0 h-8 bg-gradient-to-t from-[#0c0e14] to-transparent" />
      </div>

      {/* ─── Body ─── */}
      <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left sidebar */}
        <div className="space-y-4">

          {/* Learning Goals */}
          <div className="rounded-2xl bg-white/3 border border-white/8 p-5 space-y-3">
            <h3 className="text-xs font-bold tracking-widest text-slate-500 uppercase flex items-center gap-2">
              <Icon d={icons.target} size={13} className="text-sky-400" /> Goals
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              {profile.learningGoals || "No learning goals set yet. Edit your profile to add your goals."}
            </p>
          </div>

          {/* Interests */}
          {profile.interests?.length > 0 && (
            <div className="rounded-2xl bg-white/3 border border-white/8 p-5 space-y-3">
              <h3 className="text-xs font-bold tracking-widest text-slate-500 uppercase flex items-center gap-2">
                <Icon d={icons.star} size={13} className="text-sky-400" /> Interests
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((s, i) => (
                  <InterestBadge key={i} item={s} />
                ))}
              </div>
            </div>
          )}

          {/* Progress snapshot */}
          <div className="rounded-2xl bg-white/3 border border-white/8 p-5 space-y-3">
            <h3 className="text-xs font-bold tracking-widest text-slate-500 uppercase flex items-center gap-2">
              <Icon d={icons.trophy} size={13} className="text-sky-400" /> Progress
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Courses Completed</span>
                  <span className="text-emerald-400 font-semibold">{stats.completed}/{stats.enrolled}</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-sky-500 to-emerald-500 rounded-full transition-all duration-700"
                    style={{ width: stats.enrolled ? `${(stats.completed / stats.enrolled) * 100}%` : "0%" }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 pt-1">
                <div className="flex-1 text-center p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <p className="text-lg font-black text-amber-400">{stats.xp}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">Total XP</p>
                </div>
                <div className="flex-1 text-center p-2 rounded-xl bg-orange-500/10 border border-orange-500/20">
                  <p className="text-lg font-black text-orange-400">{stats.streak}🔥</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">Day Streak</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Tab Panel */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl bg-white/3 border border-white/8 overflow-hidden">
            {/* Tab bar */}
            <div className="flex border-b border-white/8">
              {tabs.map(({ label, icon }, i) => (
                <button
                  key={i}
                  onClick={() => setTab(i)}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-all duration-200 relative ${
                    tab === i ? "text-sky-400" : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  <Icon d={icon} size={15} />
                  {label}
                  {tab === i && (
                    <span className="absolute bottom-0 inset-x-0 h-0.5 bg-gradient-to-r from-sky-500 to-blue-500 rounded-t-full" />
                  )}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="p-6">
              {tab === 0 && <EditProfileForm user={user} onUpdated={handleUpdated} />}
              {tab === 1 && <PasswordForm />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;