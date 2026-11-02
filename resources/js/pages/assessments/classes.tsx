import { Link } from '@inertiajs/react';
import { AlertCircle, ChevronRight, Download, School } from 'lucide-react';
import {
    index,
    students,
} from '@/actions/App/Http/Controllers/AssessmentController';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { AppLayout } from '@/layouts/app-layout';

type ClassCard = {
    id: number;
    name: string;
    students: number;
    unassessed: number;
};

type Props = {
    departemen: { id: number; name: string };
    classes: ClassCard[];
};

export default function AssessmentsClasses({ departemen, classes }: Props) {
    return (
        <AppLayout title="Rekap Penilaian">
            <section className="rounded-3xl bg-surface p-5 sm:p-6">
                <Breadcrumb
                    items={[
                        { label: 'Rekap Penilaian', href: index.url() },
                        { label: departemen.name },
                    ]}
                />

                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-base font-bold text-ink">
                            Pilih kelas
                        </h2>
                        <p className="text-sm text-muted">
                            Kelas pada jurusan {departemen.name}.
                        </p>
                    </div>
                    <a
                        href={`/penilaian/jurusan/${departemen.id}/export`}
                        className="inline-flex items-center gap-2 self-start rounded-xl border border-line bg-canvas/60 px-3.5 py-2 text-xs font-semibold text-ink transition-colors hover:border-primary/40 hover:bg-canvas sm:self-auto"
                    >
                        <Download className="size-4 text-primary" />
                        Download Nilai PKL (.xlsx)
                    </a>
                </div>

                {classes.length === 0 ? (
                    <div className="mt-6 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-line py-14 text-center">
                        <School className="size-8 text-muted" />
                        <p className="text-sm font-medium text-ink">
                            Belum ada kelas dengan murid
                        </p>
                    </div>
                ) : (
                    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {classes.map((klass) => (
                            <Link
                                key={klass.id}
                                href={students.url(klass.id)}
                                prefetch
                                className="group flex items-center justify-between gap-3 rounded-2xl border border-line bg-canvas/40 p-4 transition-colors hover:border-primary/40 hover:bg-canvas"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="grid size-10 place-items-center rounded-xl bg-surface text-primary">
                                        <School className="size-5" />
                                    </span>
                                    <div>
                                        <p className="font-semibold text-ink">
                                            {klass.name}
                                        </p>
                                        <div className="mt-0.5 flex flex-wrap items-center gap-2">
                                            <p className="text-xs text-muted">
                                                {klass.students} murid
                                            </p>
                                            {klass.unassessed > 0 && (
                                                <span
                                                    title={`${klass.unassessed} murid belum lengkap dinilai`}
                                                    className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-0.5 text-xs font-semibold text-rose-600 dark:text-rose-400"
                                                >
                                                    <AlertCircle className="size-3" />
                                                    {klass.unassessed} belum
                                                    dinilai
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <ChevronRight className="size-5 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </AppLayout>
    );
}
