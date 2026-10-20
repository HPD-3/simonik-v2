<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Classes;
use App\Models\Parents;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Tampilkan halaman registrasi akun.
     */
    public function create(): Response
    {
        $classes = Classes::query()
            ->orderBy('name')
            ->get(['id', 'name']);

        $students = Student::query()
            ->whereNotNull('class_id')
            ->orderBy('name')
            ->get(['id', 'name', 'class_id']);

        return Inertia::render('auth/register', [
            'classes' => $classes,
            'students' => $students,
        ]);
    }

    /**
     * Proses pendaftaran akun orang tua.
     */
    public function store(Request $request): RedirectResponse
    {
        $role = (string) $request->input('role', 'orangtua');

        if ($role !== 'orangtua') {
            throw ValidationException::withMessages([
                'role' => 'Pendaftaran mandiri saat ini hanya tersedia untuk akun Orang Tua. Akun Guru dan Industri dibuat langsung oleh pihak sekolah.',
            ]);
        }

        $validated = $request->validate([
            'role' => ['required', 'string'],
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:'.User::class],
            'phoneNumber' => ['required', 'string', 'max:25'],
            'alamat' => ['required', 'string', 'max:500'],
            'password' => ['required', 'confirmed', Password::defaults()],
            'class_id' => ['required', 'exists:classes,id'],
            'student_id' => ['required', 'exists:students,id'],
            'date_of_birth' => ['required', 'date'],
        ]);

        /** @var Student|null $student */
        $student = Student::query()
            ->where('id', $validated['student_id'])
            ->where('class_id', $validated['class_id'])
            ->first();

        if (! $student) {
            throw ValidationException::withMessages([
                'student_id' => 'Data murid tidak ditemukan di kelas yang dipilih.',
            ]);
        }

        if ($student->parent_id !== null) {
            throw ValidationException::withMessages([
                'student_id' => 'Siswa ini sudah memiliki akun orang tua terdaftar. Hubungi pihak sekolah jika terjadi kendala.',
            ]);
        }

        // Acceptance Criteria:
        // Validasi register berhasil apabila mengisi tanggal lahir anaknya dengan tepat
        $studentDob = $student->dateOfBirth ? Carbon::parse($student->dateOfBirth)->toDateString() : null;
        $inputDob = Carbon::parse($validated['date_of_birth'])->toDateString();

        if (! $studentDob || $studentDob !== $inputDob) {
            throw ValidationException::withMessages([
                'date_of_birth' => 'Tanggal lahir anak tidak sesuai dengan data siswa terdaftar.',
            ]);
        }

        $user = DB::transaction(function () use ($validated, $student) {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
            ]);

            $user->assignRole('orangtua');

            $parent = Parents::create([
                'nama' => $user->name,
                'gender' => 'other',
                'alamat' => $validated['alamat'],
                'occupation' => '-',
                'phoneNumber' => $validated['phoneNumber'],
                'user_id' => $user->id,
            ]);

            $student->update([
                'parent_id' => $parent->id,
            ]);

            return $user;
        });

        Auth::login($user);

        return redirect()->route('dashboard')->with('success', 'Pendaftaran akun orang tua berhasil.');
    }
}
