import { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";

/* ─── tiny helpers ─── */
const initials = (name = "") =>
  name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

const Avatar = ({ name, size = 96 }) => (
  <div
    style={{ width: size, height: size, fontSize: size * 0.36 }}
    className="rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center font-black text-white shadow-xl ring-4 ring-white/30 select-none"
  >
    {initials(name)}
  </div>
);

/* ─── Icon set (inline SVGs, no extra dep) ─── */
const Icon = ({ d, size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={d} />
  </svg>
);
const icons = {
  user:     "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  lock:     "M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM17 11V7a5 5 0 0 0-10 0v4",
  map:      "M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0zM12 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2z",
  globe:    "M12 22C6.48 22 2 17.52 2 12S6.48 2 12 2s10 4.48 10 10-4.48 10-10 10zM2.05 12h19.9M12 2c2.76 3.33 4 6.6 4 10s-1.24 6.67-4 10M12 2C9.24 5.33 8 8.6 8 12s1.24 6.67 4 10",
  linkedin: "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z M4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  twitter:  "M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z",
  youtube:  "M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z",
  star:     "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  check:    "M20 6L9 17l-5-5",
  x:        "M18 6 6 18M6 6l12 12",
  plus:     "M12 5v14M5 12h14",
  save:     "M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2zM17 21v-8H7v8M7 3v5h8",
  eye:      "M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  eyeOff:   "M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22",
  alert:    "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 8v4M12 16h.01",
  brief:    "M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2",
};

/* ─── Stats Card ─── */
const StatCard = ({ label, value, accent }) => (
  <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 group">
    <span className={`text-2xl font-black ${accent} group-hover:scale-110 transition-transform duration-200`}>{value}</span>
    <span className="text-xs text-slate-400 mt-1 font-medium tracking-wide uppercase">{label}</span>
  </div>
);

/* ─── Skill Badge ─── */
const SkillBadge = ({ skill, onRemove }) => (
  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold tracking-wide hover:bg-amber-500/25 transition-colors group">
    {skill}
    {onRemove && (
      <button onClick={() => onRemove(skill)} className="opacity-50 hover:opacity-100 hover:text-red-400 transition-all ml-0.5">
        <Icon d={icons.x} size={12} />
      </button>
    )}
  </span>
);

/* ─── Input Field ─── */
const Field = ({ label, icon, error, children }) => (
  <div className="space-y-1.5">
    <label className="flex items-center gap-2 text-xs font-semibold tracking-widest text-slate-400 uppercase">
      {icon && <Icon d={icon} size={13} className="text-amber-400" />}
      {label}
    </label>
    {children}
    {error && <p className="text-xs text-red-400 flex items-center gap-1"><Icon d={icons.alert} size={12}/>{error}</p>}
  </div>
);

const inputCls = "w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-amber-500/60 focus:bg-white/8 focus:ring-1 focus:ring-amber-500/30 transition-all duration-200";

/* ─── Edit Profile Form ─── */
const EditProfileForm = ({ user, onUpdated }) => {
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    headline: user?.tutorProfile?.headline || "",
    bio: user?.tutorProfile?.bio || "",
    location: user?.tutorProfile?.location || "",
    website: user?.tutorProfile?.socialLinks?.website || "",
    linkedin: user?.tutorProfile?.socialLinks?.linkedin || "",
    twitter: user?.tutorProfile?.socialLinks?.twitter || "",
    youtube: user?.tutorProfile?.socialLinks?.youtube || "",
    expertise: user?.tutorProfile?.expertise || [],
    experience: user?.tutorProfile?.experience || "",
  });
  const [newSkill, setNewSkill] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const addSkill = () => {
    const s = newSkill.trim();
    if (s && !form.expertise.includes(s)) {
      setForm((p) => ({ ...p, expertise: [...p.expertise, s] }));
      setNewSkill("");
    }
  };
  const removeSkill = (s) => setForm((p) => ({ ...p, expertise: p.expertise.filter((x) => x !== s) }));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await axiosInstance.put("/users/profile", {
        name: form.name,
        email: form.email,
        tutorProfile: {
          headline: form.headline,
          bio: form.bio,
          location: form.location,
          experience: form.experience,
          expertise: form.expertise,
          socialLinks: { website: form.website, linkedin: form.linkedin, twitter: form.twitter, youtube: form.youtube },
        },
      });
      setSuccess(true);
      onUpdated?.();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = ["React", "Node.js", "Python", "TypeScript", "MongoDB", "DevOps", "UI/UX", "ML/AI"];

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <section>
        <h4 className="text-xs font-bold tracking-widest text-slate-500 uppercase mb-4 pb-2 border-b border-white/5">Basic Information</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Full Name" icon={icons.user}>
            <input className={inputCls} value={form.name} onChange={set("name")} placeholder="Your full name" />
          </Field>
          <Field label="Email Address">
            <input className={inputCls} type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" />
          </Field>
          <Field label="Professional Headline" icon={icons.brief}>
            <input className={inputCls} value={form.headline} onChange={set("headline")} placeholder="e.g. Full-Stack Instructor" />
          </Field>
          <Field label="Years of Experience">
            <input className={inputCls} type="number" min={0} value={form.experience} onChange={set("experience")} placeholder="e.g. 5" />
          </Field>
          <Field label="Location" icon={icons.map}>
            <input className={inputCls} value={form.location} onChange={set("location")} placeholder="City, Country" />
          </Field>
          <Field label="Website" icon={icons.globe}>
            <input className={inputCls} value={form.website} onChange={set("website")} placeholder="https://yoursite.com" />
          </Field>
        </div>
      </section>

      {/* Bio */}
      <Field label="Professional Bio">
        <textarea
          className={`${inputCls} resize-none`}
          rows={4}
          value={form.bio}
          onChange={set("bio")}
          placeholder="Tell students about your background, teaching style, and what they'll gain..."
        />
      </Field>

      {/* Expertise */}
      <section>
        <h4 className="text-xs font-bold tracking-widest text-slate-500 uppercase mb-4 pb-2 border-b border-white/5">Areas of Expertise</h4>
        <div className="flex gap-2 mb-3">
          <input
            className={`${inputCls} flex-1`}
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
            placeholder="Type a skill & press Enter"
          />
          <button onClick={addSkill} disabled={!newSkill.trim()} className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5">
            <Icon d={icons.plus} size={15} /> Add
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => !form.expertise.includes(s) && setForm((p) => ({ ...p, expertise: [...p.expertise, s] }))}
              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${form.expertise.includes(s) ? "bg-amber-500/20 border-amber-500/40 text-amber-300" : "border-white/10 text-slate-500 hover:border-white/20 hover:text-slate-400"}`}
            >
              {s}
            </button>
          ))}
        </div>
        {form.expertise.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {form.expertise.map((s) => <SkillBadge key={s} skill={s} onRemove={removeSkill} />)}
          </div>
        ) : (
          <p className="text-xs text-slate-600 italic">No skills added yet.</p>
        )}
      </section>

      {/* Socials */}
      <section>
        <h4 className="text-xs font-bold tracking-widest text-slate-500 uppercase mb-4 pb-2 border-b border-white/5">Social Links</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="LinkedIn" icon={icons.linkedin}>
            <input className={inputCls} value={form.linkedin} onChange={set("linkedin")} placeholder="linkedin.com/in/username" />
          </Field>
          <Field label="Twitter / X" icon={icons.twitter}>
            <input className={inputCls} value={form.twitter} onChange={set("twitter")} placeholder="twitter.com/username" />
          </Field>
          <Field label="YouTube" icon={icons.youtube}>
            <input className={inputCls} value={form.youtube} onChange={set("youtube")} placeholder="youtube.com/@channel" />
          </Field>
        </div>
      </section>

      {/* CTA */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-900 font-bold text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40"
        >
          <Icon d={icons.save} size={15} />
          {loading ? "Saving…" : "Save Changes"}
        </button>
        {success && (
          <span className="flex items-center gap-1.5 text-sm text-emerald-400 font-medium animate-pulse">
            <Icon d={icons.check} size={15} className="text-emerald-400" /> Saved!
          </span>
        )}
      </div>
    </div>
  );
};

/* ─── Password Form ─── */
const PasswordForm = () => {
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [show, setShow] = useState({ current: false, next: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const set = (k) => (e) => { setForm((p) => ({ ...p, [k]: e.target.value })); setError(""); };
  const toggle = (k) => setShow((p) => ({ ...p, [k]: !p[k] }));

  const strength = form.next.length >= 8 ? "strong" : form.next.length >= 6 ? "medium" : form.next.length > 0 ? "weak" : "";
  const strengthColor = { strong: "bg-emerald-500", medium: "bg-amber-500", weak: "bg-red-500" }[strength] || "";
  const strengthWidth = { strong: "w-full", medium: "w-2/3", weak: "w-1/3" }[strength] || "w-0";
  const mismatch = form.next !== form.confirm && form.confirm !== "";

  const handleSubmit = async () => {
    if (mismatch) return setError("Passwords don't match.");
    if (!form.current || !form.next) return setError("All fields are required.");
    setLoading(true);
    try {
      await axiosInstance.put("/users/change-password", { currentPassword: form.current, newPassword: form.next });
      setSuccess(true);
      setForm({ current: "", next: "", confirm: "" });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  const PwInput = ({ field, placeholder }) => (
    <div className="relative">
      <input
        type={show[field] ? "text" : "password"}
        className={`${inputCls} pr-11 ${field === "confirm" && mismatch ? "border-red-500/60" : ""}`}
        value={form[field]}
        onChange={set(field)}
        placeholder={placeholder}
      />
      <button type="button" onClick={() => toggle(field)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
        <Icon d={show[field] ? icons.eyeOff : icons.eye} size={16} />
      </button>
    </div>
  );

  return (
    <div className="max-w-md space-y-5">
      <Field label="Current Password" icon={icons.lock}>
        <PwInput field="current" placeholder="Enter current password" />
      </Field>

      <div className="space-y-1.5">
        <Field label="New Password" icon={icons.lock}>
          <PwInput field="next" placeholder="Min. 8 characters recommended" />
        </Field>
        {strength && (
          <div className="space-y-1">
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-500 ${strengthColor} ${strengthWidth}`} />
            </div>
            <p className={`text-xs font-medium capitalize ${strength === "strong" ? "text-emerald-400" : strength === "medium" ? "text-amber-400" : "text-red-400"}`}>
              {strength} password
            </p>
          </div>
        )}
      </div>

      <Field label="Confirm New Password" icon={icons.lock} error={mismatch ? "Passwords don't match" : ""}>
        <PwInput field="confirm" placeholder="Re-enter new password" />
      </Field>

      {error && <p className="text-xs text-red-400 flex items-center gap-1.5"><Icon d={icons.alert} size={13}/>{error}</p>}

      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={handleSubmit}
          disabled={loading || mismatch || !form.current || !form.next}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-900 font-bold text-sm flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-amber-500/20"
        >
          <Icon d={icons.lock} size={15} />
          {loading ? "Updating…" : "Update Password"}
        </button>
        {success && <span className="flex items-center gap-1.5 text-sm text-emerald-400 font-medium"><Icon d={icons.check} size={15} /> Updated!</span>}
      </div>
    </div>
  );
};

/* ─── Main Profile Page ─── */
const Profile = ({ user }) => {
  const [tab, setTab] = useState(0);

  if (!user) return (
    <div className="min-h-screen bg-[#0c0e14] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 text-sm">Loading profile…</p>
      </div>
    </div>
  );

  const profile = user.tutorProfile || {};
  const socials = profile.socialLinks || {};
  const tabs = [
    { label: "Edit Profile", icon: icons.user },
    { label: "Security", icon: icons.lock },
  ];

  return (
    <div className="min-h-screen bg-[#0c0e14] text-slate-100" style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>

      {/* ─── Hero Banner ─── */}
      <div className="relative overflow-hidden">
        {/* Animated grain + gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1200] via-[#0c0e14] to-[#0a0c18]" />
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: "radial-gradient(ellipse 80% 60% at 20% 40%, rgba(245,158,11,0.25) 0%, transparent 60%), radial-gradient(ellipse 60% 80% at 80% 20%, rgba(251,146,60,0.15) 0%, transparent 60%)"
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

            {/* Name + headline */}
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black tracking-tight">{user.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold tracking-widest uppercase">Tutor</span>
              </div>
              <p className="text-slate-400 text-sm">{profile.headline || "Instructor on EduHub"}</p>
              {profile.location && (
                <p className="flex items-center gap-1.5 text-slate-500 text-xs">
                  <Icon d={icons.map} size={13} /> {profile.location}
                </p>
              )}
            </div>

            {/* Social links */}
            <div className="flex items-center gap-2">
              {socials.website && (
                <a href={socials.website} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-white/5 hover:bg-amber-500/20 hover:text-amber-400 flex items-center justify-center transition-all duration-200 text-slate-400">
                  <Icon d={icons.globe} size={15} />
                </a>
              )}
              {socials.linkedin && (
                <a href={socials.linkedin} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-white/5 hover:bg-amber-500/20 hover:text-amber-400 flex items-center justify-center transition-all duration-200 text-slate-400">
                  <Icon d={icons.linkedin} size={15} />
                </a>
              )}
              {socials.twitter && (
                <a href={socials.twitter} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-white/5 hover:bg-amber-500/20 hover:text-amber-400 flex items-center justify-center transition-all duration-200 text-slate-400">
                  <Icon d={icons.twitter} size={15} />
                </a>
              )}
              {socials.youtube && (
                <a href={socials.youtube} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-white/5 hover:bg-amber-500/20 hover:text-amber-400 flex items-center justify-center transition-all duration-200 text-slate-400">
                  <Icon d={icons.youtube} size={15} />
                </a>
              )}
            </div>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-4 gap-3 pb-8">
            <StatCard label="Students" value="1,250" accent="text-amber-400" />
            <StatCard label="Courses" value="8" accent="text-orange-400" />
            <StatCard label="Rating" value="4.8★" accent="text-yellow-400" />
            <StatCard label="Reviews" value="156" accent="text-amber-300" />
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 inset-x-0 h-8 bg-gradient-to-t from-[#0c0e14] to-transparent" />
      </div>

      {/* ─── Body ─── */}
      <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: Bio + Skills */}
        <div className="space-y-4">
          {/* Bio Card */}
          <div className="rounded-2xl bg-white/3 border border-white/8 p-5 space-y-3">
            <h3 className="text-xs font-bold tracking-widest text-slate-500 uppercase">About</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              {profile.bio || "No bio added yet. Edit your profile to add a bio."}
            </p>
          </div>

          {/* Expertise */}
          {profile.expertise?.length > 0 && (
            <div className="rounded-2xl bg-white/3 border border-white/8 p-5 space-y-3">
              <h3 className="text-xs font-bold tracking-widest text-slate-500 uppercase">Expertise</h3>
              <div className="flex flex-wrap gap-2">
                {profile.expertise.map((s, i) => <SkillBadge key={i} skill={s} />)}
              </div>
            </div>
          )}

          {/* Experience */}
          {profile.experience && (
            <div className="rounded-2xl bg-white/3 border border-white/8 p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400">
                <Icon d={icons.brief} size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Experience</p>
                <p className="text-lg font-black text-amber-400">{profile.experience} <span className="text-sm font-normal text-slate-400">years</span></p>
              </div>
            </div>
          )}
        </div>

        {/* Right: Tab panel */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl bg-white/3 border border-white/8 overflow-hidden">
            {/* Tab bar */}
            <div className="flex border-b border-white/8">
              {tabs.map(({ label, icon }, i) => (
                <button
                  key={i}
                  onClick={() => setTab(i)}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-all duration-200 relative ${
                    tab === i
                      ? "text-amber-400"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  <Icon d={icon} size={15} />
                  {label}
                  {tab === i && (
                    <span className="absolute bottom-0 inset-x-0 h-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-t-full" />
                  )}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="p-6">
              {tab === 0 && <EditProfileForm user={user} />}
              {tab === 1 && <PasswordForm />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;