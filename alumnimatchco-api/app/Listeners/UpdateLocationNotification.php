<?php

namespace App\Listeners;

use App\Models\User;
use App\Models\UserCoords;
use App\Traits\DistanceTrait;
use App\Traits\MatchTrait;
use App\Traits\PushTrait;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\DB;

class UpdateLocationNotification
{
    use MatchTrait;
    use DistanceTrait;
    use PushTrait;
    /**
     * Create the event listener.
     *
     * @return void
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     *
     * @param  object  $event
     * @return void
     */
    public function handle($event)
    {
        $user = User::where('id', $event->params['uid'])
            ->with('graduated', 'coordinate')
            ->withCount(['friends as shares' => function($query) {$query->where('shared', '=', 1);}])
            ->join('user_coords', 'users.id', '=', 'user_coords.uid')->where('user_coords.show', '=', 1)
            ->first();

        $coords = UserCoords::where('uid', $user->id)->first();
        if (!is_null($coords)) {
            $query = User::whereNotNull(['verified_at', 'activated_at'])
                ->with('graduated', 'coordinate')
                ->withCount(['friends as shares' => function($query) {$query->where('shared', '=', 1);}])
                ->where('college', $user->college)->where('id', '<>', $user->id)
                ->join('user_coords', 'users.id', '=', 'user_coords.uid')->where('user_coords.show', '=', 1);
            $nears = $this->buildDistanceQuery($query, $coords, 5)->selectRaw('users.*')->get()
                ->map(function ($alumni) use ($user) {
                    $alumni->match = $this->getMatchPercent($alumni->id, $user->id);
                    return $alumni;
                });
            foreach ($nears as $alumni) {
                $userTokens = DB::table('user_devices')->where('uid', $alumni->id)->first();
                if (!is_null($userTokens)) {
                    $tokenArr = explode(',', $userTokens->tokens);
                    if (count($tokenArr) > 0) {
                        $msg = $user->first_name.' '.$user->last_name.' ('.$alumni->match.'%)'.' updated location, and is in 5 miles from you';
                        $user->distance = $alumni->distance;
                        $user->match = $alumni->match;
                        $this->sendMultiPush(4, $tokenArr, 'User updated location', $msg, $user);
                    }
                }
            }
        }
    }
}
