import { router } from '@inertiajs/react';
import { Shield, Search, UserCheck, Users, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { index } from '@/actions/App/Http/Controllers/UserController';
import { Pagination } from '@/components/ui/pagination';
import { Select } from '@/components/ui/select';
import type { SelectOption } from '@/components/ui/select';
import { AppLayout } from '@/layouts/app-layout';
import type { Paginated } from '@/types';

type UserItem = {
    id: number;
    name: string;
    email: string;
    roles: string[];
    password_masked: string;
    no_hp: string;
    keterangan: string;
    created_at: string | null;
};

type UsersIndexProps = {
    users: Paginated<UserItem>;
    filters: {
        search: string;
        role: string;
    };
    availableRoles: string[];
};

const ROLE_LABELS: Record<string, string> = {
    admin: 'Admin',
    wakasek: 'Wakasek',
    kaprog: 'Kaprog',
    guru: 'Guru',
    pembimbing: 'Pembimbing',
    siswa: 'Siswa',
    orangtua: 'Orang Tua',
};

const ROLE_BADGE_COLORS: Record<string, string> = {
    admin: 'bg-purple-50 text-purple-700 border-purple-200',
    wakasek: 'bg-blue-50 text-blue-700 border-blue-200',
    kaprog: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    guru: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    pembimbing: 'bg-amber-50 text-amber-700 border-amber-200',
    siswa: 'bg-sky-50 text-sky-700 border-sky-200',
    orangtua: 'bg-rose-50 text-rose-700 border-rose-200',
};

const ROLE_DOT_COLORS: Record<string, string> = {
    admin: 'bg-purple-600',
    wakasek: 'bg-blue-600',
    kaprog: 'bg-indigo-600',
    guru: 'bg-emerald-600',
    pembimbing: 'bg-amber-500',
    siswa: 'bg-sky-500',
    orangtua: 'bg-rose-500',
};

function RoleDot({ role }: { role: string }) {
    const color = ROLE_DOT_COLORS[role] ?? 'bg-slate-400';

    return <span className={`inline-block size-2 rounded-full ${color}`} />;
}

export default function UsersIndex({
    users,
    filters,
    availableRoles,
}: UsersIndexProps) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [role, setRole] = useState(filters.role ?? '');

    const roleOptions: SelectOption[] = useMemo(
        () => [
            { value: '', label: 'Semua role' },
            ...availableRoles.map((r) => ({
                value: r,
                label: ROLE_LABELS[r] ?? r,
                hint: <RoleDot role={r} />,
            })),
        ],
        [availableRoles],
    );

    function applyFilters(nextSearch: string, nextRole: string) {
        router.get(
            index.url(),
            {
                search: nextSearch || undefined,
                role: nextRole || undefined,
            },
            {
                preserveState: true,
                replace: true,
                preserveScroll: true,
            },
        );
    }

    function handleSearchSubmit(e: React.FormEvent) {
        e.preventDefault();
        applyFilters(search, role);
    }

    function handleRoleChange(nextRole: string) {
        setRole(nextRole);
        applyFilters(search, nextRole);
    }

    function resetFilters() {
        setSearch('');
        setRole('');
        applyFilters('', '');
    }

    const hasActiveFilters = Boolean(filters.search || filters.role);

    return (
        <AppLayout title="User Management">
            <section className="rounded-3xl bg-surface p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <Users className="size-5 text-primary" />
                            <h2 className="text-base font-bold text-ink">
                                User Management
                            </h2>
                        </div>
                        <p className="mt-1 text-sm text-muted">
                            {users.total} user terdaftar di sistem dari berbagai peran
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="mt-5 space-y-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <form
                            onSubmit={handleSearchSubmit}
                            className="flex flex-1 items-center gap-2 rounded-xl border border-line bg-canvas/40 px-4 py-2.5 text-sm text-muted transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15"
                        >
                            <Search className="size-4 shrink-0" />
                            <input
                                type="search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari nama atau email user…"
                                className="w-full bg-transparent text-ink placeholder:text-muted focus:outline-none"
                            />
                        </form>

                        <div className="w-full sm:w-56">
                            <Select
                                ariaLabel="Filter role"
                                value={role}
                                options={roleOptions}
                                onChange={handleRoleChange}
                                icon={<Shield className="size-4" />}
                                placeholder="Semua role"
                            />
                        </div>
                    </div>

                    {hasActiveFilters && (
                        <div className="flex items-center gap-2 text-xs text-muted">
                            <span>{users.total} hasil ditemukan</span>
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="inline-flex items-center gap-1 rounded-full bg-canvas px-2.5 py-1 font-medium text-ink/70 transition-colors hover:bg-primary-soft hover:text-primary"
                            >
                                <X className="size-3" />
                                Reset filter
                            </button>
                        </div>
                    )}
                </div>

                {/* Table */}
                {users.data.length === 0 ? (
                    <div className="mt-6 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-line py-14 text-center">
                        <UserCheck className="size-8 text-muted" />
                        <p className="text-sm font-medium text-ink">
                            Tidak ada user ditemukan
                        </p>
                        <p className="text-sm text-muted">
                            Sesuaikan kata kunci pencarian atau ubah filter role.
                        </p>
                    </div>
                ) : (
                    <div className="mt-4 overflow-x-auto">
                        <table className="w-full min-w-4xl border-collapse text-left text-sm">
                            <thead>
                                <tr className="border-b border-line text-xs font-semibold tracking-wide text-muted uppercase">
                                    <th className="w-12 px-3 pb-3 text-center font-semibold">
                                        No
                                    </th>
                                    <th className="px-3 pb-3 font-semibold">
                                        Role
                                    </th>
                                    <th className="px-3 pb-3 font-semibold">
                                        Nama Lengkap
                                    </th>
                                    <th className="px-3 pb-3 font-semibold">
                                        Email
                                    </th>
                                    <th className="px-3 pb-3 font-semibold">
                                        Password
                                    </th>
                                    <th className="px-3 pb-3 font-semibold">
                                        No. HP
                                    </th>
                                    <th className="px-3 pb-3 font-semibold">
                                        Keterangan
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-line">
                                {users.data.map((user, idx) => {
                                    const rowNumber = (users.from ?? 1) + idx;

                                    return (
                                        <tr
                                            key={user.id}
                                            className="transition-colors hover:bg-canvas/50"
                                        >
                                            <td className="px-3 py-3.5 text-center text-xs font-medium text-muted">
                                                {rowNumber}
                                            </td>
                                            <td className="px-3 py-3.5">
                                                <div className="flex flex-wrap gap-1">
                                                    {user.roles.length === 0 ? (
                                                        <span className="text-xs text-muted">
                                                            -
                                                        </span>
                                                    ) : (
                                                        user.roles.map((r) => (
                                                            <span
                                                                key={r}
                                                                className={`inline-block rounded-md border px-2 py-0.5 text-xs font-medium ${
                                                                    ROLE_BADGE_COLORS[r] ??
                                                                    'bg-slate-50 text-slate-700 border-slate-200'
                                                                }`}
                                                            >
                                                                {ROLE_LABELS[r] ?? r}
                                                            </span>
                                                        ))
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-3 py-3.5 font-semibold text-ink">
                                                {user.name}
                                            </td>
                                            <td className="px-3 py-3.5 text-ink/80">
                                                {user.email}
                                            </td>
                                            <td className="px-3 py-3.5 text-xs text-muted font-mono tracking-widest">
                                                {user.password_masked}
                                            </td>
                                            <td className="px-3 py-3.5 text-ink/80">
                                                {user.no_hp}
                                            </td>
                                            <td className="px-3 py-3.5 text-xs text-muted">
                                                {user.keterangan}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {users.last_page > 1 && (
                    <div className="mt-5 border-t border-line pt-4">
                        <Pagination meta={users} />
                    </div>
                )}
            </section>
        </AppLayout>
    );
}
