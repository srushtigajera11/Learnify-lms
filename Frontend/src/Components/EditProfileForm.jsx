import { useState } from "react";
import axiosInstance from "../utils/axiosInstance";

/* ─── Icon helper ─── */
const Icon = ({ d, size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={d} />
  </svg>
);
const icons = {
  user:  "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  brief: "M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2",
  map:   "M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0zM12 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2z",
  globe: "M12 22C6.48 22 2 17.52 2 12S6.48 2 12 2s10 4.48 10 10-4.48 10-10 10zM2.05 12h19.9M12 2c2.76 3.33 4 6.6 4 10s-1.24 6.67-4 10M12 2C9.24 5.33 8 8.6 8 12s1.24 6.67 4 10",
  save:  "M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2zM17 21v-8H7v8M7 3v5h8",
  check: "M20 6L9 17l-5-5",
  alert: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 8v4M12 16h.01",
  plus:  "M12 5v14M5 12h14",
  x:     "M18 6 6 18M6 6l12 12",
};

const inputCls =
  "w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-amber-500/60 focus:bg-white/8 focus:ring-1 focus:ring-amber-500/30 transition-all duration-200";

const Field = ({ label, icon, children }) => (
  <div className="space-y-1.5">
    <label className="flex items-center gap-2 text-xs font-semibold tracking-widest text-slate-400 uppercase">
      {icon && <Icon d={icon} size={13} className="text-amber-400" />}
      {label}
    </label>
    {children}
  </div>
);

const SkillBadge = ({ skill, onRemove }) => (
  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold tracking-wide hover:bg-amber-500/25 transition-colors">
    {skill}
    {onRemove && (
      <button onClick={() => onRemove(skill)} className="opacity-50 hover:opacity-100 hover:text-red-400 transition-all ml-0.5">
        <Icon d={icons.x} size={12} />
      </button>
    )}
  </span>
);

/* ─── Main Component ─── */
const EditProfileForm = ({ user, onUpdated }) => {
  // Initialize from user prop — this is the source of truth from the backend
  const buildForm = (u) => ({
    name:       u?.name || "",
    email:      u?.email || "",
    headline:   u?.tutorProfile?.headline || "",
    bio:        u?.tutorProfile?.bio || "",
    location:   u?.tutorProfile?.location || "",
    experience: u?.tutorProfile?.experience || "",
    website:    u?.tutorProfile?.socialLinks?.website || "",
    linkedin:   u?.tutorProfile?.socialLinks?.linkedin || "",
    twitter:    u?.tutorProfile?.socialLinks?.twitter || "",
    youtube:    u?.tutorProfile?.socialLinks?.youtube || "",
    expertise:  u?.tutorProfile?.expertise || [],
  });

  const [form, setForm]       = useState(() => buildForm(user));
  const [newSkill, setNewSkill] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState("");

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const addSkill = () => {
    const s = newSkill.trim();
    if (s && !form.expertise.includes(s)) {
      setForm((p) => ({ ...p, expertise: [...p.expertise, s] }));
      setNewSkill("");
    }
  };
  const removeSkill = (s) =>
    setForm((p) => ({ ...p, expertise: p.expertise.filter((x) => x !== s) }));

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
        tutorProfile: {
          headline:   form.headline,
          bio:        form.bio,
          location:   form.location,
          experience: form.experience ? Number(form.experience) : undefined,
          expertise:  form.expertise,
          socialLinks: {
            website:  form.website,
            linkedin: form.linkedin,
            twitter:  form.twitter,
            youtube:  form.youtube,
          },
        },
      });

      // Sync local form state with what the backend actually saved
      if (data?.user) {
        setForm(buildForm(data.user));
        // Notify parent (e.g. to refresh the displayed profile/avatar/name)
        onUpdated?.(data.user);
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const suggestions = ["React", "Node.js", "Python", "TypeScript", "MongoDB", "DevOps", "UI/UX", "ML/AI"];

  return (
    <div className="space-y-6">
      {/* ── Basic Info ── */}
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

      {/* ── Bio ── */}
      <Field label="Professional Bio">
        <textarea
          className={`${inputCls} resize-none`}
          rows={4}
          value={form.bio}
          onChange={set("bio")}
          placeholder="Tell students about your background and teaching style..."
        />
      </Field>

      {/* ── Expertise ── */}
      <section>
        <h4 className="text-xs font-bold tracking-widest text-slate-500 uppercase mb-4 pb-2 border-b border-white/5">
          Areas of Expertise
        </h4>
        <div className="flex gap-2 mb-3">
          <input
            className={`${inputCls} flex-1`}
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
            placeholder="Type a skill & press Enter"
          />
          <button
            onClick={addSkill}
            disabled={!newSkill.trim()}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
          >
            <Icon d={icons.plus} size={15} /> Add
          </button>
        </div>

        {/* Quick suggestions */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() =>
                !form.expertise.includes(s) &&
                setForm((p) => ({ ...p, expertise: [...p.expertise, s] }))
              }
              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                form.expertise.includes(s)
                  ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                  : "border-white/10 text-slate-500 hover:border-white/20 hover:text-slate-400"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {form.expertise.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {form.expertise.map((s) => (
              <SkillBadge key={s} skill={s} onRemove={removeSkill} />
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-600 italic">No skills added yet.</p>
        )}
      </section>

      {/* ── Social Links ── */}
      <section>
        <h4 className="text-xs font-bold tracking-widest text-slate-500 uppercase mb-4 pb-2 border-b border-white/5">
          Social Links
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="LinkedIn">
            <input className={inputCls} value={form.linkedin} onChange={set("linkedin")} placeholder="linkedin.com/in/username" />
          </Field>
          <Field label="Twitter / X">
            <input className={inputCls} value={form.twitter} onChange={set("twitter")} placeholder="twitter.com/username" />
          </Field>
          <Field label="YouTube">
            <input className={inputCls} value={form.youtube} onChange={set("youtube")} placeholder="youtube.com/@channel" />
          </Field>
        </div>
      </section>

      {/* ── Error ── */}
      {error && (
        <p className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          <Icon d={icons.alert} size={15} className="shrink-0" /> {error}
        </p>
      )}

      {/* ── Submit ── */}
      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-900 font-bold text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40"
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

export default EditProfileForm;