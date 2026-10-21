import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowRight,
    Briefcase,
    Calendar,
    Eye,
    EyeOff,
    GraduationCap,
    Home,
    Info,
    LoaderCircle,
    Lock,
    Mail,
    Phone,
    User as UserIcon,
    Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { store } from '@/actions/App/Http/Controllers/Auth/RegisteredUserController';
import { EMAIL_DOMAIN, usernameOf } from '@/components/ui/email-input';
import { Select } from '@/components/ui/select';
import { cn } from '@/lib/utils';

type ClassItem = {
    id: number;
    name: string;
};

type StudentItem = {
    id: number;
    name: string;
    class_id: number;
};

type RegisterProps = {
    classes: ClassItem[];
    students: StudentItem[];
};

function Field({
    label,
    error,
    icon,
    children,
    action,
    suffix,
    hint,
}: {
    label: string;
    error?: string;
    icon?: ReactNode;
    children: ReactNode;
    action?: ReactNode;
    suffix?: ReactNode;
    hint?: ReactNode;
}) {
    return (
        <div>
            <div className="group flex items-stretch overflow-hidden rounded-2xl border border-line bg-surface transition-all focus-within:border-primary focus-within:shadow-lg focus-within:ring-2 focus-within:shadow-primary/10 focus-within:ring-primary/15">
                <div className="flex min-w-0 flex-1 items-center gap-2.5 px-3 py-2 sm:gap-3 sm:px-4 sm:py-2.5">
                    {icon && (
                        <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary transition-colors group-focus-within:bg-primary group-focus-within:text-white sm:size-9">
                            {icon}
                        </span>
                    )}
                    <div className="min-w-0 flex-1">
                        <span className="block text-[10px] font-medium text-muted sm:text-[11px]">
                            {label}
                        </span>
                        {children}
                    </div>
                    {action}
                </div>
                {suffix}
            </div>
            {hint && !error && (
                <p className="mt-1 px-1 text-xs text-muted">{hint}</p>
            )}
            {error && (
                <p className="mt-1 px-1 text-xs font-medium text-red-500">
                    {error}
                </p>
            )}
        </div>
    );
}

const inputClass =
    'w-full bg-transparent text-sm text-ink placeholder:text-muted/70 focus:outline-none';

function formatEmailSlug(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '.')
        .replace(/\.+/g, '.')
        .replace(/^\.+|\.+$/g, '');
}

export default function Register({ classes, students }: RegisterProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] =
        useState(false);

    const { data, setData, post, processing, errors } = useForm({
        role: 'orangtua',
        name: '',
        phoneNumber: '',
        alamat: '',
        email: '',
        password: '',
        password_confirmation: '',
        class_id: '',
        student_id: '',
        date_of_birth: '',
    });

    const roleOptions = [
        { value: 'industri', label: 'Industri' },
        { value: 'guru', label: 'Guru' },
        { value: 'orangtua', label: 'Orang Tua' },
    ];

    const classOptions = useMemo(
        () => [
            { value: '', label: 'Pilih Kelas' },
            ...classes.map((c) => ({
                value: String(c.id),
                label: c.name,
            })),
        ],
        [classes],
    );

    const filteredStudents = useMemo(() => {
        if (!data.class_id) {
            return [];
        }

        return students.filter(
            (s) => String(s.class_id) === String(data.class_id),
        );
    }, [students, data.class_id]);

    const studentOptions = useMemo(
        () => [
            {
                value: '',
                label: data.class_id
                    ? 'Pilih Nama Murid'
                    : 'Pilih Kelas Terlebih Dahulu',
            },
            ...filteredStudents.map((s) => ({
                value: String(s.id),
                label: s.name,
            })),
        ],
        [filteredStudents, data.class_id],
    );

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        post(store.url());
    }

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br from-primary via-primary to-[#5d69df] p-4 py-10">
            <Head title="Daftar Akun — SIMONIK" />

            {/* decorative background */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -left-40 size-128 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute -right-40 -bottom-48 size-144 rounded-full bg-white/10 blur-3xl" />
            </div>

            <div className="relative w-full max-w-2xl overflow-hidden rounded-4xl bg-surface p-6 shadow-xl shadow-ink/10 sm:p-10">
                <div className="mb-6 flex items-center justify-between border-b border-line pb-4">
                    <div>
                        <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
                            Daftar Akun
                        </h1>
                        <p className="mt-1 text-sm text-muted">
                            Buat akun baru untuk mengakses sistem SIMONIK.
                        </p>
                    </div>
                    <Link
                        href="/login"
                        className="text-xs font-semibold text-primary hover:underline sm:text-sm"
                    >
                        Sudah punya akun? Masuk
                    </Link>
                </div>

                {/* Dropdown Role */}
                <div className="mb-6">
                    <label className="mb-2 block text-xs font-bold tracking-wide text-ink uppercase">
                        Pilih Role
                    </label>
                    <Select
                        value={data.role}
                        onChange={(val) => {
                            setData('role', val);
                        }}
                        options={roleOptions}
                        placeholder="Pilih Role"
                    />
                    {errors.role && (
                        <p className="mt-1 text-xs font-medium text-red-500">
                            {errors.role}
                        </p>
                    )}
                </div>

                {data.role !== 'orangtua' ? (
                    <div className="rounded-2xl border border-line bg-canvas/50 p-6 text-center">
                        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                            {data.role === 'guru' ? (
                                <GraduationCap className="size-6" />
                            ) : (
                                <Briefcase className="size-6" />
                            )}
                        </span>
                        <h3 className="mt-3 text-base font-bold text-ink">
                            Pendaftaran Akun{' '}
                            {data.role === 'guru' ? 'Guru' : 'Industri'}
                        </h3>
                        <p className="mt-2 text-sm text-muted">
                            Pendaftaran mandiri saat ini hanya tersedia untuk
                            akun <strong className="text-ink">Orang Tua</strong>
                            . Akun Guru dan Pembimbing Industri didaftarkan dan
                            diverifikasi langsung oleh pihak sekolah.
                        </p>
                        <p className="mt-2 text-xs text-muted">
                            Silakan hubungi Administrator sekolah, Kaprog, atau
                            Wakasek Humas.
                        </p>
                        <div className="mt-6">
                            <button
                                type="button"
                                onClick={() => setData('role', 'orangtua')}
                                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover"
                            >
                                Daftar sebagai Orang Tua
                                <ArrowRight className="size-4" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Form Biodata */}
                        <div className="space-y-3">
                            <Field
                                label="Nama Lengkap Orang Tua"
                                error={errors.name}
                                icon={<UserIcon className="size-4" />}
                            >
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    value={data.name}
                                    onChange={(e) => {
                                        const newName = e.target.value;
                                        const slug = formatEmailSlug(newName);

                                        setData((prev) => ({
                                            ...prev,
                                            name: newName,
                                            email: slug
                                                ? `${slug}@${EMAIL_DOMAIN}`
                                                : '',
                                        }));
                                    }}
                                    placeholder="Nama Lengkap Ayah / Ibu / Wali"
                                    className={inputClass}
                                />
                            </Field>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <Field
                                    label="Nomor HP / WhatsApp"
                                    error={errors.phoneNumber}
                                    icon={<Phone className="size-4" />}
                                >
                                    <input
                                        id="phoneNumber"
                                        name="phoneNumber"
                                        type="tel"
                                        required
                                        value={data.phoneNumber}
                                        onChange={(e) =>
                                            setData(
                                                'phoneNumber',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="081234567890"
                                        className={inputClass}
                                    />
                                </Field>

                                <Field
                                    label="Email"
                                    error={errors.email}
                                    icon={<Mail className="size-4" />}
                                    suffix={
                                        <span
                                            aria-hidden="true"
                                            className="grid shrink-0 place-items-center border-l border-line bg-canvas/60 px-2.5 text-[11px] font-semibold tracking-tight text-muted/80 select-none sm:px-3 sm:text-xs"
                                        >
                                            @{EMAIL_DOMAIN}
                                        </span>
                                    }
                                    hint={
                                        <>
                                            Email otomatis:{' '}
                                            <span className="font-semibold text-ink">
                                                {data.email ||
                                                    `nama.lengkap@${EMAIL_DOMAIN}`}
                                            </span>
                                        </>
                                    }
                                >
                                    <input
                                        id="email"
                                        name="email"
                                        type="text"
                                        readOnly
                                        tabIndex={-1}
                                        value={usernameOf(data.email)}
                                        placeholder="nama.lengkap"
                                        className={cn(
                                            inputClass,
                                            'cursor-default text-xs text-ink/80 select-none sm:text-sm',
                                        )}
                                    />
                                </Field>
                            </div>

                            <Field
                                label="Alamat Tempat Tinggal"
                                error={errors.alamat}
                                icon={<Home className="size-4" />}
                            >
                                <input
                                    id="alamat"
                                    name="alamat"
                                    type="text"
                                    required
                                    value={data.alamat}
                                    onChange={(e) =>
                                        setData('alamat', e.target.value)
                                    }
                                    placeholder="Jl. Merdeka No. 10, Kota"
                                    className={inputClass}
                                />
                            </Field>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <Field
                                    label="Kata Sandi"
                                    error={errors.password}
                                    icon={<Lock className="size-4" />}
                                    action={
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword((prev) => !prev)
                                            }
                                            className="shrink-0 text-muted hover:text-ink"
                                            aria-label="Tampilkan sandi"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="size-4" />
                                            ) : (
                                                <Eye className="size-4" />
                                            )}
                                        </button>
                                    }
                                >
                                    <input
                                        id="password"
                                        name="password"
                                        type={
                                            showPassword ? 'text' : 'password'
                                        }
                                        required
                                        value={data.password}
                                        onChange={(e) =>
                                            setData('password', e.target.value)
                                        }
                                        placeholder="Minimal 8 karakter"
                                        className={inputClass}
                                    />
                                </Field>

                                <Field
                                    label="Konfirmasi Kata Sandi"
                                    error={errors.password_confirmation}
                                    icon={<Lock className="size-4" />}
                                    action={
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPasswordConfirmation(
                                                    (prev) => !prev,
                                                )
                                            }
                                            className="shrink-0 text-muted hover:text-ink"
                                            aria-label="Tampilkan konfirmasi sandi"
                                        >
                                            {showPasswordConfirmation ? (
                                                <EyeOff className="size-4" />
                                            ) : (
                                                <Eye className="size-4" />
                                            )}
                                        </button>
                                    }
                                >
                                    <input
                                        id="password_confirmation"
                                        name="password_confirmation"
                                        type={
                                            showPasswordConfirmation
                                                ? 'text'
                                                : 'password'
                                        }
                                        required
                                        value={data.password_confirmation}
                                        onChange={(e) =>
                                            setData(
                                                'password_confirmation',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Ulangi kata sandi"
                                        className={inputClass}
                                    />
                                </Field>
                            </div>
                        </div>

                        {/* Hubungan Siswa & Validasi Tanggal Lahir */}
                        <div className="mt-4 rounded-3xl border border-primary/20 bg-primary-soft/30 p-4 sm:p-5">
                            <h2 className="flex items-center gap-2 text-sm font-bold text-ink">
                                <Users className="size-4 text-primary" />
                                Hubungkan Data Anak
                            </h2>
                            <p className="mt-1 text-xs text-muted">
                                Pilih kelas dan nama anak Anda, serta isi
                                tanggal lahirnya sebagai validasi keamanan.
                            </p>

                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1.5 block text-xs font-semibold text-ink">
                                        Kelas Anak
                                    </label>
                                    <Select
                                        value={data.class_id}
                                        onChange={(val) => {
                                            setData((prev) => ({
                                                ...prev,
                                                class_id: val,
                                                student_id: '',
                                            }));
                                        }}
                                        options={classOptions}
                                        placeholder="Pilih Kelas"
                                    />
                                    {errors.class_id && (
                                        <p className="mt-1 text-xs font-medium text-red-500">
                                            {errors.class_id}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-xs font-semibold text-ink">
                                        Nama Murid
                                    </label>
                                    <Select
                                        value={data.student_id}
                                        onChange={(val) =>
                                            setData('student_id', val)
                                        }
                                        options={studentOptions}
                                        placeholder="Pilih Nama Murid"
                                        disabled={!data.class_id}
                                    />
                                    {errors.student_id && (
                                        <p className="mt-1 text-xs font-medium text-red-500">
                                            {errors.student_id}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="mt-3">
                                <Field
                                    label="Tanggal Lahir Anak"
                                    error={errors.date_of_birth}
                                    icon={<Calendar className="size-4" />}
                                >
                                    <input
                                        id="date_of_birth"
                                        name="date_of_birth"
                                        type="date"
                                        required
                                        value={data.date_of_birth}
                                        onChange={(e) =>
                                            setData(
                                                'date_of_birth',
                                                e.target.value,
                                            )
                                        }
                                        className={inputClass}
                                    />
                                </Field>
                                <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-muted">
                                    <Info className="size-3.5 shrink-0 text-primary" />
                                    Akun orang tua berhasil didaftarkan apabila
                                    tanggal lahir anak sesuai dengan data
                                    sekolah.
                                </p>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-all hover:bg-primary-hover hover:shadow-xl hover:shadow-primary/40 active:scale-[0.99] disabled:opacity-60"
                        >
                            {processing && (
                                <LoaderCircle className="size-4 animate-spin" />
                            )}
                            Daftar Akun Orang Tua
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
