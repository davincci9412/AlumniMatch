<?php

use Illuminate\Database\Seeder;

class AdminsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $admins = [
            [
                'id' => 1,
                'name' => 'Jonathon Lunardi',
                'email' => 'alumnimatchco@gmail.com',
                'role' => 1
            ],
            [
                'id' => 2,
                'name' => 'Michael Lee',
                'email' => 'smartman21cen@gmail.com',
                'role' => 1
            ]
        ];

        foreach ($admins as $admin){
            \App\Models\Admin::create($admin);
        }
    }
}
