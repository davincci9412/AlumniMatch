<?php

namespace App\Providers;

use App\Events\FriendApproved;
use App\Events\FriendRequested;
use App\Events\LocationUpdated;
use App\Events\MessageSent;
use App\Events\NewJoined;
use App\Listeners\FriendApproveNotification;
use App\Listeners\FriendRequestNotification;
use App\Listeners\NewJoinNotification;
use App\Listeners\SendMessageNotification;
use App\Listeners\UpdateLocationNotification;
use Illuminate\Support\Facades\Event;
use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Listeners\SendEmailVerificationNotification;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event listener mappings for the application.
     *
     * @var array
     */
    protected $listen = [
        Registered::class => [
            SendEmailVerificationNotification::class,
        ],
        MessageSent::class => [
            SendMessageNotification::class
        ],
        FriendRequested::class => [
            FriendRequestNotification::class
        ],
        FriendApproved::class => [
            FriendApproveNotification::class
        ],
        LocationUpdated::class => [
            UpdateLocationNotification::class
        ],
        NewJoined::class => [
            NewJoinNotification::class
        ]
    ];

    /**
     * Register any events for your application.
     *
     * @return void
     */
    public function boot()
    {
        parent::boot();

        //
    }
}
