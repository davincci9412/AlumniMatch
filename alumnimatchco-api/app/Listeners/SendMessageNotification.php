<?php

namespace App\Listeners;

use App\Models\User;
use App\Traits\MatchTrait;
use App\Traits\PushTrait;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SendMessageNotification
{
    use PushTrait;
    use MatchTrait;
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
        switch ($event->params['type']) {
            case 'user':
                $this->sendToOne($event->params);
                break;
            case 'multi':
                $this->sentToMulti($event->params);
                break;
        }
    }

    private function sendToOne($data){
        $user = User::where('id', $data['uid'])->first();
        $match = $this->getMatchPercent($data['message']['rid'], $user->id);
        $userTokens = DB::table('user_devices')->where('uid', $data['message']['rid'])->first();
        if (!is_null($userTokens)) {
            $tokenArr = explode(',', $userTokens->tokens);
            if (count($tokenArr) > 0) {
                $data['message']['avatar'] = $user->avatar;
                $this->sendMultiPush(1, $tokenArr, Str::limit($data['message']['title'], 20), 'You have a new message from '.$user->first_name.' '.$user->last_name.' ('.$match.'%)', $data['message']);
                echo '$user => '.$data['uid'].' tokenArr: '.json_encode($tokenArr);
            }
        }
    }

    private function sentToMulti($data){
        $user = User::where('id', $data['uid'])->first();

        for ($i = 0; $i < count($data['messages']); $i++) {
            $message = $data['messages'][$i];
            $message['avatar'] = $user->avatar;
            $match = $this->getMatchPercent($message['rid'], $user->id);
            $userTokens = DB::table('user_devices')->where('uid', $message['rid'])->first();
            if (!is_null($userTokens)) {
                $tokenArr = explode(',', $userTokens->tokens);
                if (count($tokenArr) > 0) {
                    $this->sendMultiPush(1, $tokenArr, Str::limit($message['title'], 20), 'You have a new message from '.$user->first_name.' '.$user->last_name.' ('.$match.'%)', $message);
                }
            }
        }
    }

}
