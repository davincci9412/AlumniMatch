<?php

namespace App\Listeners;

use App\Events\FriendRequested;
use App\Models\User;
use App\Models\UserAthlete;
use App\Models\UserOrg;
use App\Models\Visit;
use App\Traits\FriendTrait;
use App\Traits\MatchTrait;
use App\Traits\PushTrait;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class NewJoinNotification
{
    use FriendTrait;
    use MatchTrait;
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
        DB::table('user_logins')->updateOrInsert(
            [
                'uid' => $event->params['uid']
            ],
            [
                'count' => 1
            ]
        );
        $user = User::where('id', $event->params['uid'])->first();
        $userOrgs = UserOrg::where('uid', $user->id)->with('org')->get();

        $userAthletes = UserAthlete::where('uid', $user->id)->with('athlete')->first();
        $admin = User::where('id', 1)->first();
        if ($user->college === $admin->college) {
            Visit::firstOrCreate(
                [
                    'uid' => 1,
                    'vid' => $event->params['uid']
                ],
                [
                    'count' => 1
                ]
            );
            //send 1 message from Jonathon
            $body = 'Welcome to Our Great Community! It is my great pleasure to welcome you to the AlumniMatch community. Here you will find a fun, safe, and trusted digital connection between you and all of your college alumni. My advice to you when getting started is to simply click on each of the sections in the Navigation, which can be found in the bottom left by clicking the Menu looking button. You can view my profile to learn more about me and PLEASE be sure to update your location settings to ON and let other alumni know where you are in a controlled, secure way. Build incredible relationships and live a more fulfilling and meaningful life because of people from your alma mater. Sincerely, Jon Lunardi, Creator of AlumniMatch';

            $this->invite(1, $event->params['uid'], $body);
            $data = [
                'uid' => 1,
                'fid' => $event->params['uid'],
                'msg' => $body
            ];
            event(new FriendRequested($data));
        }

        $users = User::where('id', '<>', $user->id)->where('college', $user->college)->whereNotNull(['verified_at', 'activated_at'])->get()
            ->map(function($alumni) use ($user) {
                $alumni->match = $this->getMatchPercent($user->id, $alumni->id);
                return $alumni;
            });
        foreach ($users as $alumni){
            $matchOrgName = '';
            $alumniOrgs = UserOrg::where('uid', $alumni->id)->get();
            for ($i = 0; $i < count($userOrgs); $i++) {
                for ($j = 0; $j < count($alumniOrgs); $j++) {
                    if ($userOrgs[$i]['org']['id'] === $alumniOrgs[$j]['org']) {
                        $matchOrgName = $userOrgs[$i]['org']['name'];
                        break;
                    }
                }
                if ($matchOrgName != '') {
                    break;
                }
            }

            $alumniAthlete = UserAthlete::where('uid', $alumni->id)->first();
            $matchAthleteName = '';
            if (!is_null($userAthletes->athlete) && !is_null($alumniAthlete->athlete) && $userAthletes->athlete['id'] === $alumniAthlete->althlete) {
                $matchAthleteName = $userAthletes->athlete['name'];
            }

            $alumniTokens = DB::table('user_devices')->where('uid', $alumni->id)->first();
            if (!is_null($alumniTokens)) {
                $tokenArr = explode(',', $alumniTokens->tokens);
                if (count($tokenArr) > 0) {
                    if ($matchOrgName !== '') {
                        $title = 'Other user joins that is from same student organization';
                        $msg = $user->first_name.' '.$user->last_name.' ('.$alumni->match.'%)'.' joined in AlumniMatch.';
                        $this->sendMultiPush(6, $tokenArr, $title, $msg, $user);
                    }
                    if ($matchAthleteName !== '') {
                        $title = 'Other user joins that is from same student athletic';
                        $msg = $user->first_name.' '.$user->last_name.' ('.$alumni->match.'%)'.' joined in AlumniMatch.';
                        $this->sendMultiPush(6, $tokenArr, $title, $msg, $user);
                    }
                    if ($alumni->match > 70) {
                        $title = $user->first_name.' '.$user->last_name.' just joined.';
                        $msg = 'This person is a '.$alumni->match.'%';
                        $this->sendMultiPush(5, $tokenArr, $title, $msg, $user);
                    }
                }
            }
        }
    }
}
