<?php

namespace App\Exports;

use App\Exports\Concerns\StylesHeadings;
use App\Models\AspekProduktif;
use App\Models\Evaluation;
use App\Models\Student;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;

/**
 * Ekspor rekap nilai PKL siswa (aspek teknis & non-teknis, rata-rata, grade, status).
 *
 * @implements WithMapping<Student>
 */
class AssessmentExport implements FromQuery, ShouldAutoSize, WithEvents, WithHeadings, WithMapping, WithStyles
{
    use StylesHeadings;

    /**
     * @var Collection<int, AspekProduktif>
     */
    private Collection $aspects;

    private int $rowIndex = 0;

    /**
     * @param  Builder<Student>  $query
     */
    public function __construct(
        private readonly Builder $query,
    ) {
        $this->aspects = AspekProduktif::query()
            ->orderBy('category')
            ->orderBy('no')
            ->orderBy('id')
            ->get(['id', 'category', 'no', 'kemampuan']);
    }

    /**
     * @return Builder<Student>
     */
    public function query(): Builder
    {
        return (clone $this->query)
            ->with([
                'classes:id,name',
                'departements:id,name',
                'industries:id,name',
                'evaluations:id,student_id,aspek_produktif_id,score,technical_label',
            ])
            ->orderBy('name');
    }

    /**
     * @return array<int, string>
     */
    public function headings(): array
    {
        $headings = [
            'No',
            'NIS',
            'Nama Siswa',
            'Kelas',
            'Jurusan',
            'Industri',
        ];

        foreach ($this->aspects as $aspect) {
            $cat = $aspect->category === AspekProduktif::CATEGORY_TEKNIS ? 'Teknis' : 'Non-Teknis';
            $headings[] = "{$aspect->kemampuan} ({$cat})";
        }

        $headings[] = 'Rata-rata';
        $headings[] = 'Grade';
        $headings[] = 'Status Penilaian';

        return $headings;
    }

    /**
     * @param  Student  $student
     * @return array<int, int|string|null>
     */
    public function map($student): array
    {
        $this->rowIndex++;
        $aspectTotal = $this->aspects->count();
        $evaluations = $student->evaluations->keyBy('aspek_produktif_id');

        $row = [
            $this->rowIndex,
            $student->nis,
            $student->name,
            $student->classes->name ?? '—',
            $student->departements->name ?? '—',
            $student->industries->name ?? '—',
        ];

        $validScores = [];

        foreach ($this->aspects as $aspect) {
            $eval = $evaluations->get($aspect->id);
            $score = $eval?->score;

            if ($score !== null) {
                $validScores[] = (int) $score;
                $row[] = (int) $score;
            } else {
                $row[] = '-';
            }
        }

        $count = count($validScores);
        $avg = $count > 0 ? (int) round(array_sum($validScores) / $count) : null;

        $row[] = $avg ?? '-';
        $row[] = Evaluation::gradeFor($avg) ?? '-';
        $row[] = ($aspectTotal > 0 && $count >= $aspectTotal) ? 'Sudah Lengkap' : 'Belum Lengkap';

        return $row;
    }
}
