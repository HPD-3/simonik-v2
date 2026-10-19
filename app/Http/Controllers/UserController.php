<?php

namespace App\Http\Controllers;

use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Tampilkan daftar user management untuk Admin.
     */
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $role = trim((string) $request->query('role', ''));

        $validRoles = RoleSeeder::ROLES;

        $users = User::query()
            ->with([
                'roles:id,name',
                'teachers.departements:id,name',
                'pembimbing',
                'parents',
                'students.classes:id,name',
                'departements:id,name,user_id',
            ])
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($q) use ($search): void {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($role !== '' && in_array($role, $validRoles, true), function ($query) use ($role): void {
                $query->role($role);
            })
            ->latest('id')
            ->paginate(10)
            ->withQueryString()
            ->through(function (User $user): array {
                $roleNames = $user->roles->pluck('name')->all();

                $phone = $user->teachers?->no_hp
                    ?? $user->pembimbing?->no_hp
                    ?? $user->parents?->phoneNumber
                    ?? '-';

                $keterangan = match (true) {
                    in_array('kaprog', $roleNames, true) => $user->departements->isNotEmpty()
                        ? 'Kaprog: '.$user->departements->pluck('name')->join(', ')
                        : 'Kepala Program Keahlian',
                    in_array('guru', $roleNames, true) => $user->teachers?->departements
                        ? 'Guru: '.$user->teachers->departements->name
                        : 'Guru Pembimbing Sekolah',
                    in_array('pembimbing', $roleNames, true) => 'Pembimbing Industri DUDI',
                    in_array('siswa', $roleNames, true) => $user->students
                        ? 'Kelas '.($user->students->classes?->name ?? '-').($user->students->nis ? ' • NIS: '.$user->students->nis : '')
                        : 'Siswa PKL',
                    in_array('orangtua', $roleNames, true) => 'Orang Tua / Wali Siswa',
                    in_array('wakasek', $roleNames, true) => 'Wakasek Humas / Hubin',
                    in_array('admin', $roleNames, true) => 'Administrator Sistem',
                    default => '-',
                };

                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'roles' => $roleNames,
                    'password_masked' => '••••••••',
                    'no_hp' => $phone,
                    'keterangan' => $keterangan,
                    'created_at' => $user->created_at?->translatedFormat('d M Y'),
                ];
            });

        return Inertia::render('users/index', [
            'users' => $users,
            'filters' => [
                'search' => $search,
                'role' => $role,
            ],
            'availableRoles' => $validRoles,
        ]);
    }
}
