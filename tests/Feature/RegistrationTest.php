<?php

namespace Tests\Feature;

use App\Models\Classes;
use App\Models\Departemen;
use App\Models\Industry;
use App\Models\Parents;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleSeeder::class);
    }

    public function test_registration_screen_can_be_rendered(): void
    {
        $class = Classes::factory()->create();
        Student::factory()->create(['class_id' => $class->id, 'parent_id' => null]);

        $response = $this->get('/register');

        $response->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('auth/register')
                ->has('classes', 1)
                ->has('students', 1)
            );
    }

    public function test_registration_fails_if_role_is_not_orangtua(): void
    {
        $response = $this->post('/register', [
            'role' => 'guru',
            'name' => 'Guru Baru',
            'email' => 'guru@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertSessionHasErrors('role');
        $this->assertGuest();
    }

    public function test_registration_fails_if_child_birth_date_is_incorrect(): void
    {
        $class = Classes::factory()->create();
        $student = Student::factory()->create([
            'class_id' => $class->id,
            'dateOfBirth' => '2007-05-15',
            'parent_id' => null,
        ]);

        $response = $this->post('/register', [
            'role' => 'orangtua',
            'name' => 'Orang Tua Test',
            'phoneNumber' => '081234567890',
            'alamat' => 'Jl. Mawar No. 12',
            'email' => 'ortu@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'class_id' => $class->id,
            'student_id' => $student->id,
            'date_of_birth' => '2007-06-20', // Tanggal salah
        ]);

        $response->assertSessionHasErrors('date_of_birth');
        $this->assertGuest();
        $this->assertDatabaseMissing('users', ['email' => 'ortu@example.com']);
    }

    public function test_registration_fails_if_student_does_not_belong_to_selected_class(): void
    {
        $class1 = Classes::factory()->create();
        $class2 = Classes::factory()->create();
        $student = Student::factory()->create([
            'class_id' => $class1->id,
            'dateOfBirth' => '2007-05-15',
            'parent_id' => null,
        ]);

        $response = $this->post('/register', [
            'role' => 'orangtua',
            'name' => 'Orang Tua Test',
            'phoneNumber' => '081234567890',
            'alamat' => 'Jl. Mawar No. 12',
            'email' => 'ortu@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'class_id' => $class2->id, // Kelas tidak cocok dengan siswa
            'student_id' => $student->id,
            'date_of_birth' => '2007-05-15',
        ]);

        $response->assertSessionHasErrors('student_id');
        $this->assertGuest();
    }

    public function test_registration_fails_if_student_already_has_parent(): void
    {
        $class = Classes::factory()->create();
        $existingParent = Parents::factory()->create();
        $student = Student::factory()->create([
            'class_id' => $class->id,
            'dateOfBirth' => '2007-05-15',
            'parent_id' => $existingParent->id,
        ]);

        $response = $this->post('/register', [
            'role' => 'orangtua',
            'name' => 'Orang Tua Lain',
            'phoneNumber' => '081234567890',
            'alamat' => 'Jl. Mawar No. 12',
            'email' => 'ortulain@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'class_id' => $class->id,
            'student_id' => $student->id,
            'date_of_birth' => '2007-05-15',
        ]);

        $response->assertSessionHasErrors('student_id');
        $this->assertGuest();
        $this->assertDatabaseMissing('users', ['email' => 'ortulain@example.com']);
    }

    public function test_parent_can_register_successfully_with_exact_child_birth_date(): void
    {
        $class = Classes::factory()->create();
        $student = Student::factory()->create([
            'class_id' => $class->id,
            'dateOfBirth' => '2007-05-15',
            'parent_id' => null,
        ]);

        $response = $this->post('/register', [
            'role' => 'orangtua',
            'name' => 'Budi Santoso',
            'phoneNumber' => '081234567890',
            'alamat' => 'Jl. Kenanga No. 5',
            'email' => 'budi.santoso@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'class_id' => $class->id,
            'student_id' => $student->id,
            'date_of_birth' => '2007-05-15', // Tepat sesuai dateOfBirth siswa
        ]);

        $response->assertRedirect(route('dashboard'));
        $this->assertAuthenticated();

        $user = User::where('email', 'budi.santoso@example.com')->first();
        $this->assertNotNull($user);
        $this->assertTrue($user->hasRole('orangtua'));

        $parent = Parents::where('user_id', $user->id)->first();
        $this->assertNotNull($parent);
        $this->assertSame('Budi Santoso', $parent->nama);
        $this->assertSame('081234567890', $parent->phoneNumber);
        $this->assertSame('Jl. Kenanga No. 5', $parent->alamat);

        // Pastikan murid terhubung ke orang tua tersebut
        $this->assertSame($parent->id, $student->fresh()->parent_id);
    }

    public function test_authenticated_user_cannot_access_register(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get('/register')
            ->assertRedirect(route('dashboard'));
    }

    public function test_register_endpoint_is_throttled(): void
    {
        $class = Classes::factory()->create();
        $student = Student::factory()->create([
            'class_id' => $class->id,
            'dateOfBirth' => '2007-05-15',
            'parent_id' => null,
        ]);

        for ($i = 0; $i < 5; $i++) {
            $this->post('/register', [
                'role' => 'orangtua',
                'name' => 'Test ' . $i,
                'phoneNumber' => '081234567890',
                'alamat' => 'Jl. Mawar',
                'email' => "test{$i}@example.com",
                'password' => 'password123',
                'password_confirmation' => 'password123',
                'class_id' => $class->id,
                'student_id' => $student->id,
                'date_of_birth' => '2000-01-01', // salah
            ]);
        }

        // Percobaan ke-6 harus di-throttle (HTTP 429 Too Many Requests)
        $response = $this->post('/register', [
            'role' => 'orangtua',
            'name' => 'Test 6',
            'phoneNumber' => '081234567890',
            'alamat' => 'Jl. Mawar',
            'email' => 'test6@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'class_id' => $class->id,
            'student_id' => $student->id,
            'date_of_birth' => '2000-01-01',
        ]);

        $response->assertStatus(429);
    }
}
