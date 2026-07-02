import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { cmsService, uploadService } from "../../services";
import { QUERY_KEYS } from "../../constants/queryKeys";
import { toast } from "sonner";
import { Plus, Trash2, Save, Image, Tag, HelpCircle, Star, Award, Trophy, Settings as SettingsIcon, X } from "lucide-react";
import { cn } from "../../utils";
import { useDropzone } from "react-dropzone";

const SECTIONS = [
  { id: "settings", label: "Settings", icon: SettingsIcon },
  { id: "gallery", label: "Gallery", icon: Image },
  { id: "awards", label: "Awards", icon: Award },
  { id: "faqs", label: "FAQs", icon: HelpCircle },
  { id: "testimonials", label: "Testimonials", icon: Star },
  { id: "certificates", label: "Certificates", icon: Award },
  { id: "achievements", label: "Achievements", icon: Trophy },
];

function SettingsSection() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: QUERY_KEYS.SETTINGS, queryFn: cmsService.getSettings });
  const settings = data?.data || {};
  const [form, setForm] = useState(null);
  const s = form || settings;

  const { mutate: save, isPending } = useMutation({
    mutationFn: (data) => cmsService.updateSettings(data),
    onSuccess: () => { toast.success("Settings saved!"); qc.invalidateQueries({ queryKey: QUERY_KEYS.SETTINGS }); setForm(null); },
    onError: err => toast.error(err.message),
  });

  if (!data && !form) return <div className="text-[var(--color-text-muted)]">Loading...</div>;

  const set = (path, value) => {
    const newForm = JSON.parse(JSON.stringify(s));
    const keys = path.split(".");
    let obj = newForm;
    for (let i = 0; i < keys.length - 1; i++) { if (!obj[keys[i]]) obj[keys[i]] = {}; obj = obj[keys[i]]; }
    obj[keys[keys.length - 1]] = value;
    setForm(newForm);
  };

  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-display text-xl font-bold text-[var(--color-text-primary)]">Website Settings</h2>
        <button onClick={() => save(s)} disabled={isPending} className="flex items-center gap-2 px-5 py-2.5 -white text-sm font-medium rounded-xl transition-all disabled:opacity-50">
          <Save className="w-4 h-4" /> {isPending ? "Saving..." : "Save All"}
        </button>
      </div>
      {[
        { section: "hero", title: "Hero Section", fields: [{ key: "title", label: "Hero Title" }, { key: "subtitle", label: "Hero Subtitle" }, { key: "primaryButtonText", label: "Button Text" }] },
        { section: "contact", title: "Contact Info", fields: [{ key: "phone", label: "Phone" }, { key: "email", label: "Email" }, { key: "whatsapp", label: "WhatsApp" }, { key: "address", label: "Address" }] },
        { section: "general", title: "About Us", fields: [{ key: "about", label: "About" }, { key: "mission", label: "Mission" }, { key: "vision", label: "Vision" }] },
      ].map(({ section, title, fields }) => (
        <div key={section} className="rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] p-5">
          <h3 className="font-semibold text-[var(--color-text-primary)] mb-4">{title}</h3>
          <div className="space-y-3">
            {fields.map(({ key, label }) => (
              <div key={key}>
                <label className="block text-xs text-[var(--color-text-muted)] mb-1">{label}</label>
                <input value={s[section]?.[key] || ""} onChange={e => set(`${section}.${key}`, e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--color-surface-3)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-sm focus:outline-none focus:border-[var(--color-rose-500)] transition-all"
                />
              </div>
            ))}
          </div>
        </div>
      ))}
      {/* Business Hours */}
      <div className="rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] p-5">
        <h3 className="font-semibold text-[var(--color-text-primary)] mb-4">Business Hours</h3>
        <div className="space-y-2">
          {days.map(day => {
            const h = s.businessHours?.[day] || { isOpen: false, openTime: "09:00", closeTime: "18:00" };
            return (
              <div key={day} className="flex items-center gap-3">
                <span className="capitalize text-sm text-[var(--color-text-secondary)] w-24">{day}</span>
                <button onClick={() => set(`businessHours.${day}.isOpen`, !h.isOpen)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${h.isOpen ? "bg-emerald-500" : "bg-[var(--color-surface-3)]"}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${h.isOpen ? "translate-x-5" : "translate-x-0.5"}`} />
                </button>
                {h.isOpen && <>
                  <input type="time" value={h.openTime} onChange={e => set(`businessHours.${day}.openTime`, e.target.value)} className="px-2 py-1 rounded-lg bg-[var(--color-surface-3)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs focus:outline-none" />
                  <span className="text-[var(--color-text-muted)] text-xs">–</span>
                  <input type="time" value={h.closeTime} onChange={e => set(`businessHours.${day}.closeTime`, e.target.value)} className="px-2 py-1 rounded-lg bg-[var(--color-surface-3)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs focus:outline-none" />
                </>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SimpleListSection({ queryKey, fetchFn, createFn, deleteFn, fields, title, imageField }) {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey, queryFn: fetchFn });
  const items = data?.data || [];
  const [form, setForm] = useState(() => Object.fromEntries(fields.map(f => [f.key, f.type === 'dropzone' ? [] : (f.options ? f.options[0] : "")])));
  const [uploading, setUploading] = useState(false);
  const resetForm = () => setForm(Object.fromEntries(fields.map(f => [f.key, f.type === 'dropzone' ? [] : (f.options ? f.options[0] : "")])));

  const { mutate: create, isPending } = useMutation({ mutationFn: createFn, onSuccess: () => { toast.success("Created!"); qc.invalidateQueries({ queryKey }); resetForm(); }, onError: err => toast.error(err.message) });
  const { mutate: del } = useMutation({ mutationFn: deleteFn, onSuccess: () => { toast.success("Deleted!"); qc.invalidateQueries({ queryKey }); }, onError: err => toast.error(err.message) });

  const handleImageUpload = async (e, key, multiple = false) => {
    const input = e.target;
    const files = input ? Array.from(input.files || []) : Array.from(e);
    if (!files.length) return;

    const imageFiles = files.filter(file => file.type.startsWith("image/"));
    if (imageFiles.length !== files.length) {
      toast.error("Only image files can be uploaded");
    }
    if (!imageFiles.length) return;

    setUploading(true);
    try {
      if (multiple) {
        const uploads = await Promise.allSettled(imageFiles.map(file => uploadService.uploadImage(file).then(res => res.data.url)));
        const urls = uploads.filter(result => result.status === "fulfilled").map(result => result.value);
        if (urls.length) setForm(f => ({ ...f, [key]: [...(Array.isArray(f[key]) ? f[key] : []), ...urls] }));
        if (uploads.some(result => result.status === "rejected")) toast.error("Some images failed to upload");
        if (urls.length) toast.success(`${urls.length} image${urls.length === 1 ? "" : "s"} uploaded`);
      } else {
        const res = await uploadService.uploadImage(imageFiles[0]);
        setForm(f => ({ ...f, [key]: res.data.url }));
        toast.success("Image uploaded");
      }
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      if (input) input.value = "";
    }
  };

  const normalizePayload = (payload) => Object.fromEntries(Object.entries(payload).map(([key, value]) => {
    const field = fields.find(item => item.key === key);
    if (field?.type === "number") return [key, Number(value)];
    if (typeof value === "string") return [key, value.trim()];
    return [key, value];
  }));

  const handleCreate = async () => {
    const missingField = fields.find(field => {
      if (field.required === false) return false;
      const value = form[field.key];
      return Array.isArray(value) ? value.length === 0 : !String(value || "").trim();
    });

    if (missingField) {
      toast.error(`Please provide ${missingField.label.toLowerCase()}`);
      return;
    }

    const arrayFields = Object.entries(form).filter(([, value]) => Array.isArray(value));

    if (arrayFields.length > 0) {
      const [arrayKey, arrayValues] = arrayFields[0];
      setUploading(true);
      try {
        const results = await Promise.allSettled(arrayValues.map(value => createFn(normalizePayload({ ...form, [arrayKey]: value }))));
        const createdCount = results.filter(result => result.status === "fulfilled").length;

        if (createdCount) {
          toast.success(`${createdCount} ${title.toLowerCase()} item${createdCount === 1 ? "" : "s"} created`);
          qc.invalidateQueries({ queryKey });
          resetForm();
        }
        if (createdCount !== arrayValues.length) toast.error(`${arrayValues.length - createdCount} item${arrayValues.length - createdCount === 1 ? "" : "s"} failed to create`);
      } catch {
        toast.error("Failed to create items");
      } finally {
        setUploading(false);
      }
    } else {
      create(normalizePayload(form));
    }
  };

  function DropzoneField({ fieldKey }) {
    const onDrop = (acceptedFiles) => handleImageUpload(acceptedFiles, fieldKey, true);
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: {'image/*': []} });
    const images = form[fieldKey] || [];

    return (
      <div className="space-y-2">
        <div {...getRootProps()} className={cn("border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors", isDragActive ? "border-[var(--color-rose-500)] bg-[var(--color-rose-500)]/5" : "border-[var(--color-border)] hover:border-[var(--color-rose-400)] bg-[var(--color-surface-3)]")}>
          <input {...getInputProps()} />
          <Image className="w-8 h-8 text-[var(--color-text-muted)] mb-2" />
          <p className="text-sm font-medium text-[var(--color-text-primary)]">Drag & drop images here</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">or click to select files (Multiple allowed)</p>
        </div>
        {images.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {images.map((url, idx) => (
              <div key={idx} className="relative group">
                <img src={url} alt="" className="w-16 h-16 rounded-lg object-cover border border-[var(--color-border)]" />
                <button type="button" aria-label="Remove selected image" onClick={(event) => { event.stopPropagation(); setForm(f => ({ ...f, [fieldKey]: (f[fieldKey] || []).filter((_, i) => i !== idx) })); }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h2 className="font-display text-xl font-bold text-[var(--color-text-primary)]">{title}</h2>
      <div className="rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] p-5 space-y-3">
        <h3 className="font-medium text-[var(--color-text-primary)] text-sm">Add New</h3>
        {fields.map(f => (
          <div key={f.key}>
            <label className="block text-xs text-[var(--color-text-muted)] mb-1">{f.label}</label>
            {f.type === "file" ? (
              <input type="file" accept="image/*" onChange={e => handleImageUpload(e, f.key)} className="text-xs text-[var(--color-text-muted)]" />
            ) : f.type === "dropzone" ? (
              <DropzoneField fieldKey={f.key} />
            ) : f.type === "textarea" ? (
              <textarea value={form[f.key]} onChange={e => setForm(fv => ({ ...fv, [f.key]: e.target.value }))} rows={2} className="w-full px-3 py-2 rounded-lg bg-[var(--color-surface-3)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-sm focus:outline-none focus:border-[var(--color-rose-500)] transition-all resize-none" />
            ) : f.type === "select" ? (
              <select value={form[f.key]} onChange={e => setForm(fv => ({ ...fv, [f.key]: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-[var(--color-surface-3)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-sm focus:outline-none focus:border-[var(--color-rose-500)] transition-all appearance-none cursor-pointer">
                <option value="" disabled>Select {f.label}</option>
                {f.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            ) : (
              <input type={f.type || "text"} value={form[f.key]} onChange={e => setForm(fv => ({ ...fv, [f.key]: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-[var(--color-surface-3)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-sm focus:outline-none focus:border-[var(--color-rose-500)] transition-all" />
            )}
          </div>
        ))}
        <button type="button" onClick={handleCreate} disabled={uploading || isPending} className="px-5 py-2 bg-[var(--color-rose-600)] text-white text-sm font-medium rounded-xl transition-all disabled:opacity-50">
          <Plus className="w-4 h-4 inline mr-1" /> {uploading || isPending ? "Saving..." : "Add"}
        </button>
      </div>
      <div className="space-y-2">
        {isLoading && <div className="text-sm text-[var(--color-text-muted)]">Loading {title.toLowerCase()}...</div>}
        {!isLoading && items.length === 0 && <div className="text-sm text-[var(--color-text-muted)]">No {title.toLowerCase()} items yet.</div>}
        {!isLoading && items.map(item => (
          <div key={item._id} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)]">
            {imageField && item[imageField] && <img src={item[imageField]} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />}
            <div className="flex-1 min-w-0">
              <p className="text-[var(--color-text-primary)] text-sm font-medium truncate">{item.title || item.question || item.name || item.customerName || item.organization}</p>
              <p className="text-xs text-[var(--color-text-muted)] truncate">{item.description || item.answer || item.review}</p>
            </div>
            <button type="button" onClick={() => del(item._id)} className="p-1.5 hover:bg-red-500/10 rounded-lg text-[var(--color-text-muted)] hover:text-red-400 transition-colors flex-shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CMS() {
  const [section, setSection] = useState("settings");

  const sectionProps = {
    gallery: { queryKey: QUERY_KEYS.GALLERY, fetchFn: cmsService.getGallery, createFn: cmsService.createGallery, deleteFn: cmsService.deleteGallery, title: "Gallery", imageField: "image", fields: [{ key: "title", label: "Title" }, { key: "category", label: "Category", type: "select", options: ["Facial", "Hair", "Hair Color", "Hair Spa", "Waxing", "Threading", "Bridal", "Nails", "Skin", "Other"] }, { key: "image", label: "Image", type: "dropzone" }] },
    awards: { queryKey: QUERY_KEYS.AWARDS, fetchFn: cmsService.getAwards, createFn: cmsService.createAward, deleteFn: cmsService.deleteAward, title: "Awards", imageField: "image", fields: [{ key: "title", label: "Title" }, { key: "description", label: "Description", type: "textarea", required: false }, { key: "image", label: "Image", type: "file" }] },
    faqs: { queryKey: QUERY_KEYS.FAQS, fetchFn: cmsService.getFAQs, createFn: cmsService.createFAQ, deleteFn: cmsService.deleteFAQ, title: "FAQs", fields: [{ key: "question", label: "Question" }, { key: "answer", label: "Answer", type: "textarea" }] },
    testimonials: { queryKey: QUERY_KEYS.TESTIMONIALS, fetchFn: cmsService.getTestimonials, createFn: cmsService.createTestimonial, deleteFn: cmsService.deleteTestimonial, title: "Testimonials", fields: [{ key: "customerName", label: "Customer Name" }, { key: "review", label: "Review", type: "textarea" }, { key: "rating", label: "Rating (1-5)", type: "number" }] },
    certificates: { queryKey: QUERY_KEYS.CERTIFICATES, fetchFn: cmsService.getCertificates, createFn: cmsService.createCertificate, deleteFn: cmsService.deleteCertificate, title: "Certificates", imageField: "certificateImage", fields: [{ key: "title", label: "Title" }, { key: "organization", label: "Organization" }, { key: "issueDate", label: "Issue Date", type: "date" }, { key: "certificateImage", label: "Image", type: "file" }] },
    achievements: { queryKey: QUERY_KEYS.ACHIEVEMENTS, fetchFn: cmsService.getAchievements, createFn: cmsService.createAchievement, deleteFn: cmsService.deleteAchievement, title: "Achievements", fields: [{ key: "title", label: "Title" }, { key: "description", label: "Description", type: "textarea" }, { key: "year", label: "Year", type: "number" }, { key: "category", label: "Category", type: "select", options: ["Award", "Achievement", "Certificate", "Trophy", "Milestone", "Media"] }] },
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full">
      {/* Sidebar */}
      <div className="md:w-52 flex-shrink-0">
        <h1 className="font-display text-lg font-bold text-[var(--color-text-primary)] mb-4">CMS</h1>
        <div className="flex md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0">
        {SECTIONS.map(s => (
          <button key={s.id} onClick={() => setSection(s.id)}
            className={cn("flex items-center gap-2.5 whitespace-nowrap w-full px-3 py-2.5 rounded-xl text-sm transition-all", section === s.id ? "bg-[var(--color-rose-600)] text-white border border-[var(--color-rose-500)]/30" : "text-[var(--color-text-secondary)] hover:bg-[var(--color-rose-500)]/5 hover:text-[var(--color-text-primary)]")}
          >
            <s.icon className="w-4 h-4 flex-shrink-0" />{s.label}
          </button>
        ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {section === "settings" && <SettingsSection />}
        {sectionProps[section] && <SimpleListSection {...sectionProps[section]} />}
      </div>
    </div>
  );
}
