'use client';

import { motion } from 'motion/react';
import { ArrowLeft, SendHorizonal, Check, ChevronDown, LockKeyhole } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { getRoleDisplayLabel } from '@/lib/role-labels';
import { useState, useEffect, useRef } from 'react';
import { browserSupabase, supabase } from '@/lib/supabase';
import { normalizeProfileChangeValue, type ProfileChangeValue } from '@/lib/profile-change-requests';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ToastProvider';
import { SwipeBack } from '@/components/SwipeBack';
import { useEmbeddedWebBridge } from '@/components/EmbeddedWebBridgeProvider';
import { authenticatedWebFetch } from '@/lib/web-auth-capability';

/* ---------- Field config ---------- */
type FieldKey =
  | 'email'
  | 'phone'
  | 'birth_date'
  | 'school_id'
  | 'department_id'
  | 'favorite_song_id'
  | 'about_text'
  | 'linkedin_url'
  | 'instagram_url'
  | 'youtube_url'
  | 'spotify_url'
  | 'tiktok_url'
  | 'x_url';

interface FieldDef {
  key: FieldKey;
  label: string;
  type: 'text' | 'email' | 'tel' | 'date' | 'select' | 'textarea';
  placeholder?: string;
}

type ReferenceOption = { id: string; name: string };

interface SubmitProfileChangeResponse {
  mode?: 'created' | 'updated' | 'unchanged';
}

const FIELDS: FieldDef[] = [
  { key: 'email', label: 'E-posta', type: 'email', placeholder: 'E-posta adresiniz' },
  { key: 'phone', label: 'Telefon', type: 'tel', placeholder: '05XX XXX XX XX' },
  { key: 'birth_date', label: 'Doğum Tarihi', type: 'date' },
  { key: 'school_id', label: 'Okul', type: 'select' },
  { key: 'department_id', label: 'Bölüm', type: 'select' },
  { key: 'favorite_song_id', label: 'Favori Eser', type: 'select' },
  { key: 'about_text', label: 'Hakkımda', type: 'textarea', placeholder: 'Kendin hakkında kısa bir not...' },
  { key: 'linkedin_url', label: 'LinkedIn', type: 'text', placeholder: 'https://linkedin.com/in/...' },
  { key: 'instagram_url', label: 'Instagram', type: 'text', placeholder: 'https://instagram.com/...' },
  { key: 'youtube_url', label: 'YouTube', type: 'text', placeholder: 'https://youtube.com/@...' },
  { key: 'spotify_url', label: 'Spotify veya YTMUSIC', type: 'text', placeholder: 'https://open.spotify.com/user/...' },
  { key: 'tiktok_url', label: 'TikTok', type: 'text', placeholder: 'https://tiktok.com/@...' },
  { key: 'x_url', label: 'X', type: 'text', placeholder: 'https://x.com/...' },
];

export default function ProfilDuzenle() {
  const { member, user, roles, activeChoir, isLoading } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const embeddedBridge = useEmbeddedWebBridge();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [form, setForm] = useState<Record<FieldKey, string>>({
    email: '', phone: '', birth_date: '', school_id: '', department_id: '',
    favorite_song_id: '', about_text: '',
    linkedin_url: '', instagram_url: '', youtube_url: '', spotify_url: '',
    tiktok_url: '', x_url: '',
  });
  const [schoolOptions, setSchoolOptions] = useState<ReferenceOption[]>([]);
  const [departmentOptions, setDepartmentOptions] = useState<ReferenceOption[]>([]);
  const [repertoireOptions, setRepertoireOptions] = useState<ReferenceOption[]>([]);
  const [referenceStatus, setReferenceStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [loadedReferenceChoirId, setLoadedReferenceChoirId] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saving' | 'sent'>('idle');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<'idle' | 'saving' | 'done'>('idle');

  useEffect(() => {
    if (member) {
      setForm({
        email: member.email || '',
        phone: member.phone || '',
        birth_date: member.birth_date || '',
        school_id: member.school_id || '',
        department_id: member.department_id || '',
        favorite_song_id: member.favorite_song_id || '',
        about_text: member.about_text || '',
        linkedin_url: member.linkedin_url || '',
        instagram_url: member.instagram_url || '',
        youtube_url: member.youtube_url || '',
        spotify_url: member.spotify_url || '',
        tiktok_url: member.tiktok_url || '',
        x_url: member.x_url || '',
      });
      setPhotoUrl(member.photo_url || '');
    }
  }, [member]);

  useEffect(() => {
    let cancelled = false;
    const choirId = activeChoir?.choir_id;
    setSchoolOptions([]);
    setDepartmentOptions([]);
    setRepertoireOptions([]);
    setLoadedReferenceChoirId(null);
    setReferenceStatus(choirId ? 'loading' : 'error');
    if (!choirId) return () => { cancelled = true; };
    const resolvedChoirId = choirId;

    async function loadReferenceOptions() {
      const [schools, departments, repertoire] = await Promise.all([
        supabase.from('schools').select('id, name').eq('choir_id', resolvedChoirId).order('name'),
        supabase.from('departments').select('id, name').eq('choir_id', resolvedChoirId).order('name'),
        supabase.from('repertoire').select('id, title, composer').eq('choir_id', resolvedChoirId).order('title'),
      ]);
      if (cancelled) return;
      if (schools.error || departments.error || repertoire.error) {
        setReferenceStatus('error');
        return;
      }
      setSchoolOptions((schools.data ?? []).map((row) => ({ id: row.id, name: row.name })));
      setDepartmentOptions((departments.data ?? []).map((row) => ({ id: row.id, name: row.name })));
      setRepertoireOptions((repertoire.data ?? []).map((song) => ({
          id: song.id,
          name: `${song.title}${song.composer ? ` - ${song.composer}` : ''}`,
      })));
      setLoadedReferenceChoirId(resolvedChoirId);
      setReferenceStatus('ready');
    }

    void loadReferenceOptions().catch(() => {
      if (!cancelled) setReferenceStatus('error');
    });

    return () => {
      cancelled = true;
    };
  }, [activeChoir?.choir_id]);

  const referenceReady = referenceStatus === 'ready'
    && loadedReferenceChoirId === activeChoir?.choir_id;
  const optionsFor = (key: FieldKey): ReferenceOption[] => {
    if (!referenceReady) return [];
    return key === 'school_id' ? schoolOptions
      : key === 'department_id' ? departmentOptions : repertoireOptions;
  };

  const handlePickPhoto = () => {
    if (status !== 'idle' || uploadingPhoto) return;
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !member || !user) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Lütfen geçerli bir görsel dosyası seçin.', 'Profil fotoğrafı');
      e.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Görsel boyutu 5MB altında olmalıdır.', 'Profil fotoğrafı');
      e.target.value = '';
      return;
    }

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await authenticatedWebFetch('/api/profile-photo', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Fotoğraf yüklenemedi.');
      }

      const payload = await res.json() as { publicUrl?: string };
      const publicUrl = payload.publicUrl;
      if (!publicUrl) throw new Error('Public URL alınamadı.');
      setPhotoUrl(publicUrl);
    } catch (err: any) {
      toast.error(`Fotoğraf yükleme hatası: ${err.message}`, 'Profil fotoğrafı');
    } finally {
      setUploadingPhoto(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member || !activeChoir || member.choir_id !== activeChoir.choir_id
      || !referenceReady) {
      toast.error('Koro bilgileri yüklenemedi. Sayfayı yenileyip tekrar deneyin.', 'Değişiklik talebi');
      return;
    }

    // Yalnızca değişen alanları gönder
    const original: Record<string, string> = {
      email: member.email || '', phone: member.phone || '', birth_date: member.birth_date || '',
      school_id: member.school_id || '', department_id: member.department_id || '',
      favorite_song_id: member.favorite_song_id || '', about_text: member.about_text || '',
      linkedin_url: member.linkedin_url || '', instagram_url: member.instagram_url || '',
      youtube_url: member.youtube_url || '', spotify_url: member.spotify_url || '',
      tiktok_url: member.tiktok_url || '', x_url: member.x_url || '',
      photo_url: member.photo_url || '',
    };
    const changes: Record<string, ProfileChangeValue> = {};
    (Object.keys(form) as FieldKey[]).forEach(k => {
      const nextValue = normalizeProfileChangeValue(form[k]) ?? null;
      const currentValue = normalizeProfileChangeValue(original[k]) ?? null;
      if (nextValue !== currentValue) changes[k] = nextValue;
    });
    const nextPhotoUrl = normalizeProfileChangeValue(photoUrl) ?? null;
    const currentPhotoUrl = normalizeProfileChangeValue(original.photo_url) ?? null;
    if (nextPhotoUrl !== currentPhotoUrl) changes.photo_url = nextPhotoUrl;

    if (Object.keys(changes).length === 0) {
      router.push('/profil');
      return;
    }

    setStatus('saving');
    try {
      const response = await authenticatedWebFetch('/api/profile-change-requests/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ changes, note, expected_choir_id: activeChoir.choir_id }),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Değişiklik talebi gönderilemedi.');
      }

      const payload = (await response.json()) as SubmitProfileChangeResponse;
      setStatus('sent');
      if (payload.mode === 'updated') {
        toast.success('Bekleyen değişiklik talebin yeni bilgilerle güncellendi.');
      } else if (payload.mode === 'unchanged') {
        toast.info('Profilinde güncellenecek yeni bir değişiklik yok.', 'Değişiklik talebi');
      } else {
        toast.success('Değişiklik talebi şefe gönderildi.');
      }
      setTimeout(() => router.push('/profil'), 1500);
    } catch (err: any) {
      toast.error(`Hata: ${err.message}`, 'Değişiklik talebi');
      setStatus('idle');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member?.email) {
      toast.error('Şifre değiştirilemedi: e-posta bilgisi bulunamadı.', 'Şifre');
      return;
    }

    if (!oldPassword || !newPassword || !confirmNewPassword) {
      toast.error('Lütfen tüm şifre alanlarını doldurun.', 'Şifre');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Yeni şifre en az 8 karakter olmalıdır.', 'Şifre');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error('Yeni şifre ve tekrar şifresi eşleşmiyor.', 'Şifre');
      return;
    }

    if (oldPassword === newPassword) {
      toast.error('Yeni şifre eski şifre ile aynı olamaz.', 'Şifre');
      return;
    }

    setPasswordStatus('saving');
    try {
      const { error: reauthError } = await browserSupabase.auth.signInWithPassword({
        email: member.email,
        password: oldPassword,
      });
      if (reauthError) throw new Error('Eski şifre yanlış.');

      const { error: updateError } = await browserSupabase.auth.updateUser({ password: newPassword });
      if (updateError) throw updateError;

      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setPasswordStatus('done');
      toast.success('Şifre güncellendi.');
      setTimeout(() => setPasswordStatus('idle'), 1800);
    } catch (err: any) {
      toast.error(`Şifre değiştirme hatası: ${err.message}`, 'Şifre');
      setPasswordStatus('idle');
    }
  };

  if (isLoading) {
    return (
      <main className="page-shell flex min-h-[50vh] items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="h-10 w-10 rounded-full border-2 border-[var(--color-accent)] border-t-transparent" />
      </main>
    );
  }

  const initials = member?.first_name && member?.last_name
    ? `${member.first_name[0]}${member.last_name[0]}`.toUpperCase() : 'GY';
  const hasProfileChanges = !!member && (
    (Object.keys(form) as FieldKey[]).some((k) => (normalizeProfileChangeValue(form[k]) ?? null) !== (normalizeProfileChangeValue(member[k]) ?? null)) ||
    (normalizeProfileChangeValue(photoUrl) ?? null) !== (normalizeProfileChangeValue(member.photo_url) ?? null)
  );

  return (
    <SwipeBack fallback="/profil">
    <main className="relative page-shell pb-28 space-y-4 !pt-[calc(1.5rem+env(safe-area-inset-top))]">
      <div className="absolute right-5 top-[max(env(safe-area-inset-top),1.5rem)] z-10">
        <Link href="/profil" className="flex h-8 items-center justify-center gap-1.5 rounded-full border border-white/10 bg-white/5 pr-3 pl-2.5 text-[var(--color-text-medium)] backdrop-blur-md transition-all hover:bg-white/10 hover:text-[var(--color-text-high)] active:scale-95">
          <ArrowLeft size={16} />
          <span className="text-[0.65rem] font-bold uppercase tracking-[0.1em]">Geri</span>
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 px-1 pt-2 pr-20">
        <span className="font-serif text-xl tracking-tight font-medium text-[var(--color-text-high)]">Değişiklik Talebi</span>
      </div>

      {/* Bilgi notu */}
      <div className="rounded-xl border border-[var(--status-pending-border)] bg-[var(--status-pending-bg)] px-4 py-3 text-[0.78rem] text-[var(--status-pending-text)] leading-relaxed">
        Aşağıdaki bilgilerde yaptığın değişiklikler <strong className="text-[var(--color-text-high)]">Şef onayına</strong> gönderilecek. Onaylandıktan sonra profilinde güncellenecek.
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-4">
        {/* Avatar gösterimi */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="glass-panel px-6 pb-4 pt-4 flex flex-col items-center mt-12 !overflow-visible"
        >
          <button
            type="button"
            onClick={handlePickPhoto}
            disabled={uploadingPhoto || status !== 'idle'}
            className="-mt-12 mb-3 relative h-[88px] w-[88px] rounded-full ring-[3px] ring-black transition-transform hover:scale-[1.02] disabled:opacity-70"
            aria-label="Profil fotoğrafını değiştir"
          >
            <div className="h-full w-full flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[var(--color-accent)] to-[#b48600] text-3xl font-serif font-medium text-black shadow-[0_0_24px_rgba(192,178,131,0.3)]">
              {photoUrl ? <img src={photoUrl} alt="" className="h-full w-full object-cover" /> : initials}
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoChange}
          />
          <p className="text-[0.85rem] font-medium text-[var(--color-text-high)] font-serif">{member?.first_name} {member?.last_name}</p>
          <div className="flex flex-wrap justify-center gap-1.5 mt-1.5">
            {member?.voice_group && (
              <span className="status-pill text-[var(--color-accent)] border-[var(--color-accent-soft)] !py-1 !min-h-0 !text-[0.62rem]">
                {member.voice_group}
              </span>
            )}
            {roles.map(role => (
              <span key={role} className="status-pill border-[var(--color-border)] bg-[var(--color-soft-bg)] text-[var(--color-text-medium)] !py-1 !min-h-0 !text-[0.62rem]">
                {getRoleDisplayLabel(role, member?.voice_group)}
              </span>
            ))}
          </div>
        </motion.div>

      {/* Form alanları */}
      {referenceStatus === 'error' && (
        <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          Koro seçenekleri yüklenemedi. Sayfayı yenileyip tekrar deneyin.
        </p>
      )}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          className="glass-panel p-5 flex flex-col gap-4">
          {FIELDS.map(field => (
            <div key={field.key} className="space-y-1.5">
              <label className="text-[0.62rem] uppercase tracking-[0.18em] font-bold text-[var(--color-text-medium)] px-0.5">
                {field.label}
              </label>
              {field.type === 'select' ? (
                <div className="relative">
                  <select
                    aria-label={field.label}
                    value={form[field.key]}
                    onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                    disabled={!referenceReady || status !== 'idle'}
                    className="editorial-input w-full appearance-none pr-9 cursor-pointer"
                  >
                    <option value="">{!referenceReady && referenceStatus !== 'error' ? '-- Yükleniyor --' : '-- Seçiniz --'}</option>
                    {form[field.key] && !optionsFor(field.key).some(option => option.id === form[field.key]) && (
                      <option value={form[field.key]} disabled>Mevcut kayıt bu koroda bulunamadı</option>
                    )}
                    {optionsFor(field.key).map(o => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-medium)]" />
                  {referenceReady && optionsFor(field.key).length === 0 && (
                    <p className="mt-1 text-xs text-[var(--color-text-medium)]">
                      Bu koroda henüz {field.key === 'school_id' ? 'okul' : field.key === 'department_id' ? 'bölüm' : 'eser'} tanımlanmadı.
                    </p>
                  )}
                </div>
              ) : field.type === 'textarea' ? (
                <textarea
                  value={form[field.key]}
                  onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                  rows={4}
                  maxLength={1200}
                  className="editorial-input w-full resize-none"
                  placeholder={field.placeholder}
                />
              ) : (
                <input
                  type={field.type}
                  value={form[field.key]}
                  onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                  className={`editorial-input w-full ${field.type === 'date' ? 'theme-date-input' : ''}`}
                  placeholder={field.placeholder}
                />
              )}
            </div>
          ))}
        </motion.div>

        {/* Not alanı */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.13 }}
          className="glass-panel p-5 space-y-1.5">
          <label className="text-[0.62rem] uppercase tracking-[0.18em] font-bold text-[var(--color-text-medium)]">
            Şefe Not (isteğe bağlı)
          </label>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            rows={2}
            placeholder="Değişiklik hakkında kısa bir not..."
            className="editorial-input w-full resize-none"
          />
        </motion.div>

        {/* Submit */}
        <button
          type="submit"
          disabled={status !== 'idle' || uploadingPhoto || !referenceReady
            || !activeChoir || member?.choir_id !== activeChoir.choir_id || !hasProfileChanges}
          className="mt-1 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[var(--color-accent)] to-[#b48600] text-black px-6 py-3.5 font-serif font-bold text-[0.95rem] transition-all disabled:opacity-60 hover:shadow-[0_0_20px_rgba(192,178,131,0.35)] active:scale-[0.98]"
        >
          {status === 'sent' ? (
            <><Check size={18} /> Onaya Gönderildi</>
          ) : status === 'saving' ? (
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="h-5 w-5 rounded-full border-2 border-black border-t-transparent" />
          ) : (
            <><SendHorizonal size={17} /> Değişiklikleri Onaya Gönder</>
          )}
        </button>
      </form>

      {/* Şifre Değiştir */}
      {embeddedBridge.isEmbedded ? (
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="glass-panel p-5 space-y-3 mt-4"
          aria-labelledby="embedded-password-title"
        >
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-soft-bg)] text-[var(--color-accent)]">
              <LockKeyhole size={14} aria-hidden="true" />
            </div>
            <div>
              <p id="embedded-password-title" className="text-[0.82rem] font-semibold text-[var(--color-text-high)]">Şifre Değiştir</p>
              <p className="mt-1 text-xs leading-5 text-[var(--color-text-medium)]">Şifren güvenli mobil ekranda güncellenir.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={embeddedBridge.requestPasswordChange}
            className="mt-1 flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-[var(--color-accent-soft)] bg-[var(--color-accent-soft)] px-6 py-3 text-[var(--color-accent)] font-serif font-bold text-[0.9rem] outline-none transition-all hover:bg-[#C0B283]/10 focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
          >
            Güvenli şifre ekranını aç
          </button>
        </motion.section>
      ) : (
      <motion.form
        onSubmit={handlePasswordChange}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
        className="glass-panel p-5 space-y-3 mt-4"
      >
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-soft-bg)] text-[var(--color-accent)]">
            <LockKeyhole size={14} />
          </div>
          <div>
            <p className="text-[0.82rem] font-semibold text-[var(--color-text-high)]">Şifre Değiştir</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[0.62rem] uppercase tracking-[0.18em] font-bold text-[var(--color-text-medium)]">
            Eski Şifre
          </label>
          <input
            type="password"
            value={oldPassword}
            onChange={e => setOldPassword(e.target.value)}
            className="editorial-input w-full"
            placeholder="Mevcut şifreniz"
            autoComplete="current-password"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[0.62rem] uppercase tracking-[0.18em] font-bold text-[var(--color-text-medium)]">
            Yeni Şifre
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            className="editorial-input w-full"
            placeholder="En az 8 karakter"
            autoComplete="new-password"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[0.62rem] uppercase tracking-[0.18em] font-bold text-[var(--color-text-medium)]">
            Yeni Şifre (Tekrar)
          </label>
          <input
            type="password"
            value={confirmNewPassword}
            onChange={e => setConfirmNewPassword(e.target.value)}
            className="editorial-input w-full"
            placeholder="Yeni şifreyi tekrar girin"
            autoComplete="new-password"
          />
        </div>

        <button
          type="submit"
          disabled={passwordStatus === 'saving'}
          className="mt-1 flex w-full items-center justify-center gap-2 rounded-full border border-[var(--color-accent-soft)] bg-[var(--color-accent-soft)] px-6 py-3 text-[var(--color-accent)] font-serif font-bold text-[0.9rem] transition-all hover:bg-[#C0B283]/10 disabled:opacity-60"
        >
          {passwordStatus === 'done' ? 'Şifre Güncellendi' : passwordStatus === 'saving' ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
        </button>
      </motion.form>
      )}
    </main>
    </SwipeBack>
  );
}
