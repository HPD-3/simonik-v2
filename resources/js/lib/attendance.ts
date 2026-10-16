/**
 * Label & gaya badge status absensi (case-insensitive). Selaras dengan nilai
 * `attendances.status` yang ditulis modul absen siswa: hadir/izin/sakit/alpha.
 */
export function attendanceLabel(status: string | null): string {
    switch ((status ?? '').toLowerCase()) {
        case 'hadir':
        case 'masuk':
            return 'Hadir';
        case 'terlambat':
            return 'Terlambat';
        case 'belum-lengkap':
        case 'belum lengkap':
            return 'Belum lengkap';
        case 'izin':
            return 'Izin';
        case 'sakit':
            return 'Sakit';
        case 'libur':
            return 'Libur';
        case 'alpha':
        case 'alpa':
            return 'Alpa';
        default:
            return 'Belum absen';
    }
}

export function attendanceStyle(status: string | null): string {
    switch ((status ?? '').toLowerCase()) {
        case 'hadir':
        case 'masuk':
            return 'bg-positive/15 text-positive';
        case 'belum-lengkap':
        case 'belum lengkap':
            return 'bg-warning/15 text-warning';
        case 'terlambat':
            return 'bg-orange-500/15 text-orange-600';
        case 'izin':
            return 'bg-warning/15 text-warning';
        case 'sakit':
            return 'bg-primary/10 text-primary';
        case 'libur':
            return 'bg-cyan-500/10 text-cyan-500';
        case 'alpha':
        case 'alpa':
            return 'bg-red-500/15 text-red-500';
        default:
            return 'bg-canvas text-muted';
    }
}
