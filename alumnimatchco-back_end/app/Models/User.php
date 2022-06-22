<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'sid', 'social', 'first_name', 'last_name', 'avatar', 'show', 'verified_at', 'activated_at', 'college', 'online'
    ];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
        'social', 'sid', 'show'
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'verified_at' => 'datetime',
        'activated_at' => 'datetime',
    ];

    /**
     * Get the identifier that will be stored in the subject claim of the JWT.
     *
     * @return mixed
     */
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    /**
     * Return a key value array, containing any custom claims to be added to the JWT.
     *
     * @return array
     */
    public function getJWTCustomClaims()
    {
        return [];
    }

    public function setPasswordAttribute($password)
    {
        if ( !empty($password) ) {
            $this->attributes['password'] = bcrypt($password);
        }
    }

    public function college() {
        return $this->belongsTo(College::class, 'college');
    }

    public function friends() {
        return $this->hasMany(Friend::class, 'uid');
    }

    public function messages() {
        return $this->hasMany(Message::class, 'rid');
    }

    public function visits() {
        return $this->hasMany(Visit::class, 'vid');
    }

    public function coordinate() {
        return $this->hasOne(UserCoords::class, 'uid');
    }

    public function degrees() {
        return $this->hasMany(UserDegree::class, 'uid');
    }

    public function graduated() {
        return $this->hasOne(UserDegree::class, 'uid')->latest('year');
    }

    public function orgs() {
        return $this->hasMany(UserOrg::class, 'uid');
    }

    public function industries() {
        return $this->hasMany(UserIndustry::class, 'uid');
    }
}
