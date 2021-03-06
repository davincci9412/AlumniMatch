<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserAthlete extends Model
{
    protected $primaryKey = 'uid';

    public $timestamps = false;

    protected $fillable = [
        'uid', 'member', 'athlete', 'position', 'privacy'
    ];

    protected $hidden = [
        'uid'
    ];

    public function athlete() {
        return $this->belongsTo(Athlete::class, 'athlete');
    }
}
