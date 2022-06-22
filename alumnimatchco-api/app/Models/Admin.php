<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Illuminate\Foundation\Auth\User as Authenticatable;

class Admin extends Authenticatable
{
    use Notifiable;

    const ROLE_SUPER = 0;
    const ROLE_MANAGER = 1;
    const ROLE_READER = 2;

    protected $fillable = [
        'name', 'email', 'role', 'password'
    ];

    protected $hidden = [
        'password', 'remember_token',
    ];

    public function role()
    {
        $roles = [
            self::ROLE_SUPER => 'Super Manager',
            self::ROLE_MANAGER => 'Manager',
            self::ROLE_READER => 'Reader',
        ];
        return $roles[$this->role];
    }
}
