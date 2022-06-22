<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserOrg extends Model
{
    protected $primaryKey = 'uid';

    protected $fillable = [
        'uid', 'org'
    ];

    protected $hidden = [
        'uid'
    ];

    public $timestamps = false;

    public function org() {
        return $this->belongsTo(Organization::class, 'org');
    }
}
