import { Link, router } from '@inertiajs/react';
import { AlertCircle, ClipboardList, Download, Search } from 'lucide-react';
import { useState } from 'react';
import {
    classes,
    index,
    show,
    students,
} from '@/actions/App/Http/Controllers/AssessmentController';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Pagination } from '@/components/ui/pagination';
import { AppLayout } from '@/layouts/app-layout';
import { gradeStyles } from '@/lib/grade';
import type { Grade } from '@/lib/grade';
import { cn } from '@/lib/utils';
import type { Paginated } from '@/types';

type StudentRow = {
    id: number;
    name: string;
    nis: string;
    industry: string | null;
    scored: number;
    avg: number | null;
    grade: Grade | null;
    is_complete: boolean;
};

type Props = {
    departemen: { id: number; name: string } | null;
    class: { id: number; name: string };
    students: Paginated<StudentRow>;
    filters: { search: string; status?: string };
    statusCounts: { all: number; sudah: number; belum: number };
    aspectTotal: number;
};

export default function AssessmentsStudents({
    departemen,
    class: klass,
    students: rows,
    filters,
    statusCounts,
    aspectTotal,
}: Props) {
    const [search, setSearch] = useState(filters.search);

    function applyFilter(next: { search?: string; status?: string }) {
        const params: Record<string, string> = {};
        const effectiveSearch =
            next.search !== undefined ? next.search : search;
        const effectiveStatus =
            next.status !== undefined ? next.status : (filters.status ?? '');

        if (effectiveSearch.trim() !== '') {
            params.search = effectiveSearch.trim();
        }

        if (effectiveStatus !== '') {
            params.status = effectiveStatus;
        }

        router.get(students.url(klass.id), params, {
            preserveState: true,
            replace: true,
            preserveScroll: true,
        });
    }

    return (
        <AppLayout title="Rekap Penilaian">
            <section className="rounded-3xl bg-surface p-5 sm:p-6">
                <Breadcrumb
                    items={[
                        { label: 'Rekap Penilaian', href: index.url() },
                        departemen
                            ? {
                                  label: departemen.name,
                                  href: classes.url(departemen.id),
                              }
                            : { label: '—' },
                        { label: klass.name },
                    ]}
                />

                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-base font-bold text-ink">
                            Penilaian kelas {klass.name}
                        </h2>
                        <p className="text-sm text-muted">
                            {rows.total} murid · {aspectTotal} aspek penilaian
                        </p>
                    </div>
                    <a
                        href={`/penilaian/kelas/${klass.id}/export`}
                        className="inline-flex items-center gap-2 self-start rounded-xl border border-line bg-canvas/60 px-3.5 py-2 text-xs font-semibold text-ink transition-colors hover:border-primary/40 hover:bg-canvas sm:self-auto"
                    >
                        <Download className="size-4 text-primary" />
                        Download Nilai PKL (.xlsx)
                    </a>
                </div>

                {/* Filter Status: Semua, Penilaian Sudah, Penilaian Belum */}
                <div className="mt-5 flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={() => applyFilter({ status: '' })}
                        className={cn(
                            'inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-colors',
                            !filters.status
                                ? 'bg-primary text-white shadow-xs'
                                : 'border border-line bg-canvas/40 text-muted hover:border-primary/40 hover:text-ink',
                        )}
                    >
                        <span>Semua</span>
                        <span
                            className={cn(
                                'py-0.2 rounded-full px-1.5 text-[10px] font-bold tabular-nums',
                                !filters.status
                                    ? 'bg-white/20 text-white'
                                    : 'bg-line text-muted',
                            )}
                        >
                            {statusCounts.all}
                        </span>
                    </button>
                    <button
                        type="button"
                        onClick={() => applyFilter({ status: 'sudah' })}
                        className={cn(
                            'inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-colors',
                            filters.status === 'sudah'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'border border-line bg-canvas/40 text-muted hover:border-emerald-500/40 hover:text-ink',
                        )}
                    >
                        <span>Penilaian Sudah</span>
                        <span
                            className={cn(
                                'py-0.2 rounded-full px-1.5 text-[10px] font-bold tabular-nums',
                                filters.status === 'sudah'
                                    ? 'bg-white/20 text-white'
                                    : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
                            )}
                        >
                            {statusCounts.sudah}
                        </span>
                    </button>
                    <button
                        type="button"
                        onClick={() => applyFilter({ status: 'belum' })}
                        className={cn(
                            'inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-colors',
                            filters.status === 'belum'
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'border border-line bg-canvas/40 text-muted hover:border-rose-500/40 hover:text-ink',
                        )}
                    >
                        <AlertCircle className="size-3.5" />
                        <span>Penilaian Belum</span>
                        <span
                            className={cn(
                                'py-0.2 rounded-full px-1.5 text-[10px] font-bold tabular-nums',
                                filters.status === 'belum'
                                    ? 'bg-white/20 text-white'
                                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
                            )}
                        >
                            {statusCounts.belum}
                        </span>
                    </button>
                </div>

                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        applyFilter({ search });
                    }}
                    className="mt-3"
                >
                    <label className="flex items-center gap-2 rounded-xl border border-line bg-canvas/40 px-4 py-2.5 text-sm text-muted">
                        <Search className="size-4" />
                        <input
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Cari nama atau NIS…"
                            className="w-full bg-transparent text-ink placeholder:text-muted focus:outline-none"
                        />
                    </label>
                </form>

                {rows.data.length === 0 ? (
                    <div className="mt-6 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-line py-14 text-center">
                        <ClipboardList className="size-8 text-muted" />
                        <p className="text-sm font-medium text-ink">
                            Tidak ada murid
                        </p>
                    </div>
                ) : (
                    <div className="mt-4 overflow-x-auto">
                        <table className="w-full min-w-160 border-collapse text-left text-sm">
                            <thead>
                                <tr className="text-xs font-semibold tracking-wide text-muted uppercase">
                                    <th className="pb-3 font-semibold">
                                        Murid
                                    </th>
                                    <th className="pb-3 font-semibold">
                                        Industri
                                    </th>
                                    <th className="pb-3 font-semibold">
                                        Aspek dinilai
                                    </th>
                                    <th className="pb-3 font-semibold">
                                        Rata-rata
                                    </th>
                                    <th className="pb-3 text-right font-semibold">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-line">
                                {rows.data.map((student) => (
                                    <tr key={student.id}>
                                        <td className="py-3">
                                            <p className="font-semibold text-ink">
                                                {student.name}
                                            </p>
                                            <p className="text-xs text-muted">
                                                NIS {student.nis}
                                            </p>
                                        </td>
                                        <td className="py-3 text-ink/80">
                                            {student.industry ?? '—'}
                                        </td>
                                        <td className="py-3 text-ink/80">
                                            {student.scored} / {aspectTotal}
                                        </td>
                                        <td className="py-3">
                                            {student.avg === null ||
                                            student.grade === null ? (
                                                <span className="text-sm text-muted">
                                                    Belum dinilai
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-2">
                                                    <span className="font-semibold text-ink">
                                                        {student.avg}
                                                    </span>
                                                    <span
                                                        className={cn(
                                                            'inline-flex rounded-full px-2 py-0.5 text-xs font-bold',
                                                            gradeStyles[
                                                                student.grade
                                                            ],
                                                        )}
                                                    >
                                                        {student.grade}
                                                    </span>
                                                    {!student.is_complete && (
                                                        <span
                                                            title="Nilai belum lengkap"
                                                            className="inline-flex items-center rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400"
                                                        >
                                                            Belum lengkap
                                                        </span>
                                                    )}
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3 text-right">
                                            <Link
                                                href={show.url(student.id)}
                                                prefetch
                                                className={
                                                    student.is_complete
                                                        ? 'inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-semibold text-primary transition-colors hover:bg-canvas'
                                                        : 'inline-flex items-center rounded-xl bg-primary px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-primary-hover'
                                                }
                                            >
                                                {student.is_complete
                                                    ? 'Lihat / Edit Nilai'
                                                    : 'Nilai'}
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <Pagination meta={rows} />
            </section>
        </AppLayout>
    );
}
