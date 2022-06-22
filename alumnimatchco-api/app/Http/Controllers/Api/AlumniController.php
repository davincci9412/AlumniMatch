<?php

namespace App\Http\Controllers\Api;

use App\Models\College;
use App\Models\Friend;
use App\Models\Message;
use App\Models\User;
use App\Models\UserAthlete;
use App\Models\UserCoords;
use App\Models\UserDegree;
use App\Models\UserHobby;
use App\Models\UserOrg;
use App\Models\Visit;
use App\Traits\DistanceTrait;
use App\Traits\MatchTrait;
use Carbon\Carbon;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

class AlumniController extends Controller
{
    use MatchTrait;
    use DistanceTrait;

    public function index(Request $request) {
        $user = $request->get('user');
        $users = User::whereNotNull(['verified_at', 'activated_at'])->where('college', '=', $user->college)->where('id', '<>', $user->id)
            ->orderBy('updated_at', 'desc')->take(100)->get()
            ->map(function($alumni) use ($user) {
                $alumni->match = $this->getMatchPercent($user->id, $alumni->id);
                $alumni->distance = $this->getDistance($user->id, $alumni->id);
                $alumni->shares = Friend::where('uid', $alumni->id)->where('shared', 1)->count();
                return $alumni;
            });
        return response()->json($users);
    }

    public function getUserDetail(Request $request, $uid) {
        $user = $request->get('user');
        $percents = $this->getMatchPercent($user->id, $uid);
        return response()->json(compact('percents'));
    }

    public function getDashboardData(Request $request) {
        $user = $request->get('user');

        $messages = Message::with('sender')
            ->where('rid', $user->id)
            ->where('read', 0)
            ->orderBy('updated_at', 'desc')
            ->take(5)->get();

        $visitors = Visit::where('vid', $user->id)
            ->join('users', 'visits.uid', '=', 'users.id')
            ->select('users.id', 'users.first_name', 'users.last_name', 'users.avatar', 'users.online', 'visits.count', 'visits.updated_at')
            ->orderBy('updated_at', 'desc')->take(20)->get();

        $coords = UserCoords::where('uid', $user->id)->first();
        if (!is_null($coords)) {
            $query = User::whereNotNull(['verified_at', 'activated_at'])->where('college', $user->college)->where('id', '<>', $user->id)->join('user_coords', 'users.id', '=', 'user_coords.uid')->where('user_coords.show', '=', 1);
            $nears = $this->buildDistanceQuery($query, $coords, $coords->radius)->selectRaw('users.*')->with('coordinate')->get();
        }

        $friend_requests = DB::table('friend_requests')->where('fid', $user->id)
            ->join('users', 'users.id', '=', 'friend_requests.uid')
            ->select('users.id', 'users.first_name', 'users.last_name', 'users.avatar', 'users.online', 'friend_requests.msg', 'friend_requests.updated_at')
            ->orderBy('updated_at', 'desc')->take(20)->get();

        $matchArr = array();
        foreach ( $messages as $message) {
            if (array_key_exists($message->sender->id, $matchArr)) {
                $message->sender->match = $matchArr[$message->sender->id];
            } else {
                $match = $this->getMatchPercent($user->id, $message->sender->id);
                $matchArr[$message->sender->id] = $match;
                $message->sender->match = $match;
            }
        }
        foreach ( $visitors as $v) {
            if (array_key_exists($v->id, $matchArr)) {
                $v->match = $matchArr[$v->id];
            } else {
                $match = $this->getMatchPercent($user->id, $v->id);
                $matchArr[$v->id] = $match;
                $v->match = $match;
            }
        }
        foreach ($nears as $near) {
            if (array_key_exists($near->id, $matchArr)) {
                $near->match = $matchArr[$near->id];
            } else {
                $match = $this->getMatchPercent($user->id, $near->id);
                $matchArr[$near->id] = $match;
                $near->match = $match;
            }
        }
        foreach ($friend_requests as $f) {
            if (array_key_exists($f->id, $matchArr)) {
                $f->match = $matchArr[$f->id];
            } else {
                $match = $this->getMatchPercent($user->id, $f->id);
                $matchArr[$f->id] = $match;
                $f->match = $match;
            }
        }

        $user = User::where('id', $user->id)->withCount([
            'messages' => function($query) {
                $query->where('read', '=', 0);
            },
            'friends',
            'visits',
            'visits AS new_visits_count' => function($query) {
                $query->where('count', '=', 1);
            }
        ])->with('coordinate')->first();


        $ranks = User::whereNotNull(['verified_at', 'activated_at'])->select('id')->withCount(['friends', 'visits'])->get()->sort(function ($a,$b) {
            if($a->friends_count == $b->friends_count){
                return $a->visits_count < $b->visits_count;
            } else {
                return $a->friends_count < $b->friends_count;
            }
        })->toArray();
        $user->rank = array_search($user->id, array_column($ranks, 'id')) + 1;

        $user->freq_count = DB::table('friend_requests')->where('fid', $user->id)->count();

        return response()->json(compact('user', 'friend_requests', 'messages', 'nears', 'visitors'));
    }

    public function getNears(Request $request) {
        $user = $request->get('user');

        $coords = UserCoords::where('uid', $user->id)->first();
        if (!is_null($coords)) {
            $query = User::whereNotNull(['verified_at', 'activated_at'])
                ->with('graduated', 'coordinate')
                ->withCount(['friends as shares' => function($query) {$query->where('shared', '=', 1);}])
                ->where('college', $user->college)->where('id', '<>', $user->id)
                ->join('user_coords', 'users.id', '=', 'user_coords.uid')->where('user_coords.show', '=', 1);
            $nears = $this->buildDistanceQuery($query, $coords, $coords->radius)->selectRaw('users.*')->get()
                ->map(function ($alumni) use ($user) {
                    $alumni->match = $this->getMatchPercent($user->id, $alumni->id);
                    return $alumni;
                });
        }
        return response()->json($nears);
    }

    public function getLeaderboardData(Request $request) {
        $user = $request->get('user');
        $coords = UserCoords::where('uid', $user->id)->first();

        $ranks = User::whereNotNull(['verified_at', 'activated_at'])->select('id')->withCount(['friends', 'visits'])->get()->sort(function ($a,$b) {
            if($a->friends_count == $b->friends_count){
                return $a->visits_count < $b->visits_count;
            } else {
                return $a->friends_count < $b->friends_count;
            }
        })->toArray();
        $user->rank = array_search($user->id, array_column($ranks, 'id')) + 1;

        $query = User::where('id', '<>', $user->id)->where('college', $user->college)
            ->whereNotNull(['verified_at', 'activated_at'])->with('graduated')
            ->withCount(['friends as shares' => function($query) {$query->where('shared', '=', 1);}]);
        $users = $this->buildNormalDistanceQuery($query, $coords) ->get()->map(function ($u) use ($ranks, $user) {
            $u->rank = array_search($u->id, array_column($ranks, 'id')) + 1;
            $u->match = $this->getMatchPercent($user->id, $u->id);
            return $u;
        });

        $user->college = College::where('id', $user->college)->first();
        return response()->json(compact('user', 'users'));
    }

    public function getUsers(Request $request) {
        $user = $request->get('user');
        $coords = UserCoords::where('uid', $user->id)->first();
        $query = User::where('id', '<>', $user->id)->where('college', $user->college)->whereNotNull(['verified_at', 'activated_at'])
            ->with('graduated')->withCount(['friends as shares' => function($query) {$query->where('shared', '=', 1);}]);
        $query = $this->buildNormalDistanceQuery($query, $coords);

        $users = $query->orderBy('created_at', 'desc')->skip($request->query('count'))->take(20)->get()->map(function ($alumni) use ($user) {
            $alumni->match = $this->getMatchPercent($user->id, $alumni->id);
            return $alumni;
        });

        return response()->json($users);
    }

    public function getFriendRequests(Request $request) {
        $user = $request->get('user');
        $coords = UserCoords::where('uid', $user->id)->first();
        $query = User::join('friend_requests', 'friend_requests.uid', '=', 'users.id')->where('friend_requests.fid', '=', $user->id)
            ->orderBy('friend_requests.created_at', 'desc')->select('users.*')
            ->where('id', '<>', $user->id)->where('college', $user->college)->whereNotNull(['verified_at', 'activated_at'])
            ->with('graduated')->withCount(['friends as shares' => function($query) {$query->where('shared', '=', 1);}]);
        $query = $this->buildNormalDistanceQuery($query, $coords);

        $users = $query->skip($request->query('count'))->take(20)->get()->map(function ($alumni) use ($user) {
            $alumni->match = $this->getMatchPercent($user->id, $alumni->id);
            return $alumni;
        });

        return response()->json($users);
    }

    public function getSuggests(Request $request) {
        $user = $request->get('user');
        $coords = UserCoords::where('uid', $user->id)->first();
        $query = User::where('id', '<>', $user->id)->where('college', $user->college)->whereNotNull(['verified_at', 'activated_at'])
            ->whereNotIn('id', function ($query) use ($user) {
                $query->selectRaw('uid')->from('friend_requests')->where('fid', $user->id);
            })
            ->whereNotIn('id', function ($query) use ($user) {
                $query->selectRaw('fid')->from('friend_requests')->where('uid', $user->id);
            })
            ->whereNotIn('id', function ($query) use ($user) {
                $query->selectRaw('uid')->from('friends')->where('fid', $user->id);
            })
            ->select('users.*')
            ->with('graduated')->withCount(['friends as shares' => function($query) {$query->where('shared', '=', 1);}]);
        $query = $this->buildNormalDistanceQuery($query, $coords);

        $users = $query->orderBy('created_at', 'desc')->skip($request->query('count'))->take(20)->get()->map(function ($alumni) use ($user) {
            $alumni->match = $this->getMatchPercent($user->id, $alumni->id);
            return $alumni;
        });

        return response()->json($users);
    }

    public function getVisits(Request $request) {
        $user = $request->get('user');
        $coords = UserCoords::where('uid', $user->id)->first();
        $query = User::where('id', '<>', $user->id)->where('college', $user->college)->whereNotNull(['verified_at', 'activated_at'])
            ->whereIn('id', function($query) use ($user) {
                $query->selectRaw('uid')->from('visits')->where('vid', $user->id);
            })
            ->with('graduated')->withCount(['friends as shares' => function($query) {$query->where('shared', '=', 1);}]);
        $query = $this->buildNormalDistanceQuery($query, $coords);

        $users = $query->orderBy('created_at', 'desc')->skip($request->query('count'))->take(20)->get()->map(function ($alumni) use ($user) {
            $alumni->match = $this->getMatchPercent($user->id, $alumni->id);
            return $alumni;
        });

        return response()->json($users);
    }

    public function getFriends(Request $request) {
        $user = $request->get('user');
        $coords = UserCoords::where('uid', $user->id)->first();
        $query = User::where('id', '<>', $user->id)->where('college', $user->college)->whereNotNull(['verified_at', 'activated_at'])
            ->join('friends', 'friends.fid', '=', 'users.id')->where('friends.uid', '=', $user->id)->select('users.*', 'friends.shared')
            ->with('graduated')->withCount(['friends as shares' => function($query) {$query->where('shared', '=', 1);}]);
        $query = $this->buildNormalDistanceQuery($query, $coords);

        $users = $query->skip($request->query('count'))->take(20)->get()->map(function ($alumni) use ($user) {
            $alumni->match = $this->getMatchPercent($user->id, $alumni->id);
            return $alumni;
        });

        return response()->json($users->reverse()->values());
    }

    public function getPendings(Request $request) {
        $user = $request->get('user');
        $coords = UserCoords::where('uid', $user->id)->first();
        $query = User::where('id', '<>', $user->id)->where('college', $user->college)->whereNotNull(['verified_at', 'activated_at'])
            ->join('friend_requests', 'friend_requests.fid', '=', 'users.id')->where('friend_requests.uid', '=', $user->id)
            ->orderBy('friend_requests.created_at', 'desc')->select('users.*')
            ->with('graduated')->withCount(['friends as shares' => function($query) {$query->where('shared', '=', 1);}]);
        $query = $this->buildNormalDistanceQuery($query, $coords);

        $users = $query->skip($request->query('count'))->take(20)->get()->map(function ($alumni) use ($user) {
            $alumni->match = $this->getMatchPercent($user->id, $alumni->id);
            return $alumni;
        });

        return response()->json($users);
    }

    public function getSimilarUsers(Request $request, $category, $cid) {
        $user = $request->get('user');
        $coords = UserCoords::where('uid', $user->id)->first();
        $query = User::where('id', '<>', $user->id)->where('college', $user->college)->whereNotNull(['verified_at', 'activated_at'])
            ->with('graduated')->withCount(['friends as shares' => function($query) {$query->where('shared', '=', 1);}]);

        if (strtolower($category) === 'degree') {
            $query->whereHas('degrees', function($query) use ($cid) {
                $query->where('degree', $cid);
            });
        } else {
            $query->whereHas('orgs', function($query) use ($cid) {
                $query->where('org', $cid);
            });
        }

        $query = $this->buildNormalDistanceQuery($query, $coords);

        $users = $query->orderBy('created_at', 'desc')->skip($request->query('count'))->take(20)->get()->map(function ($alumni) use ($user) {
            $alumni->match = $this->getMatchPercent($user->id, $alumni->id);
            return $alumni;
        });

        return response()->json($users);
    }

    public function searchUsers(Request $request) {
        $user = $request->get('user');
        $query = User::where('id', '<>', $user->id)->where('college', $user->college)->whereNotNull(['verified_at', 'activated_at']);
        if ($request->has('keyword')) {
            $query->where(DB::raw('concat(first_name, " ", last_name)'), 'like', '%'.$request['keyword'].'%');
        }
        if ($request->has('degree')) {
            $query->whereHas('degrees', function($query) use ($request) {
                $query->where('degree', $request['degree']);
            });
        }
        if ($request->has('industry')) {
            $query->whereHas('industries', function($query) use ($request) {
                $query->where('industry', $request['industry']);
            });
        }
        if ($request->has('org')) {
            $query->whereHas('orgs', function($query) use ($request) {
                $query->where('org', $request['org']);
            });
        }
        if ($request->has('zipcode')) {
            $query->join('user_homes', 'user_homes.uid', '=', 'users.id')->where('user_homes.zip', '=', $request['zip'])->select('users.*');
        }
        if ($request->has('religion')) {
            $query->join('user_religions', 'user_religions.uid', '=', 'users.id')->where('user_religions.religion', '=', $request['religion'])->select('users.*');
        }
        if ($request->has('relationship')) {
            $query->join('user_relationships', 'user_relationships.uid', '=', 'users.id')->where('user_relationships.relationship', '=', $request['relationship'])->select('users.*');
        }
        if ($request->has('gender')) {
            $query->join('user_gender_ages', 'user_gender_ages.uid', '=', 'users.id')->where('user_gender_ages.gender', '=', $request['gender'])->select('users.*');
        }

        $coords = UserCoords::where('uid', $user->id)->first();
        $query->with('graduated')->withCount(['friends as shares' => function($query) {$query->where('shared', '=', 1);}]);

        $query = $this->buildNormalDistanceQuery($query, $coords);

        $users = $query->orderBy('created_at', 'desc')->skip($request->query('count'))->take(20)->get()->map(function ($alumni) use ($user) {
            $alumni->match = $this->getMatchPercent($user->id, $alumni->id);
            return $alumni;
        });

        return response()->json($users);
    }

    public function getMiniAlumniData(Request $request, $uid) {
        $user = $request->get('user');
        $graduated = UserDegree::where('uid', $uid)->orderBy('year', 'desc')->first();
        $shares = Friend::where('uid', $uid)->where('shared', '=', 1)->count();
        $distance = $this->getDistance($user->id, $uid);

        $query = User::where([['id', '<>', $uid], ['id', '<>', $user->id], ['college', $user->college]])
            ->whereNotNull(['verified_at', 'activated_at'])
            ->join('friends', 'friends.fid', '=', 'users.id')->where([['friends.uid', '=', $uid], ['friends.uid', '<>', $user->id], ['shared', '=', 1]])
            ->select('users.*', 'friends.shared');

        $friends = $query->get()->map(function ($u) use ($user) {
            $u->match = $this->getMatchPercent($user->id, $u->id);
            return $u;
        });

        return response()->json([
            'graduated' => $graduated,
            'shares' => $shares,
            'distance' => $distance,
            'friends' => $friends
        ]);
    }

    public function getFullAlumniData(Request $request, $uid) {
        $user = $request->get('user');

        $alumni = User::where('id', $uid)
            ->with(['graduated', 'degrees', 'orgs'])->withCount(['friends', 'visits'])->first();


        $alumni->match = $this->getMatchPercent($user->id, $uid);

        $query = User::where([['id', '<>', $uid], ['id', '<>', $user->id], ['college', $user->college]])
            ->whereNotNull(['verified_at', 'activated_at'])
            ->join('friends', 'friends.fid', '=', 'users.id')->where([['friends.uid', '=', $uid], ['friends.uid', '<>', $user->id], ['shared', '=', 1]])
            ->select('users.*', 'friends.shared');

        $friends = $query->get()->map(function ($u) use ($user) {
            $u->match = $this->getMatchPercent($user->id, $u->id);
            return $u;
        });

        $ps = [
            'degrees' => UserDegree::where('uid',$uid)->with('degree')->with('ibc')->get(),
            'athlete' => UserAthlete::where([['uid', '=',$uid], ['privacy', '=', 1]])->with('athlete')->first(),
            'orgs' => UserOrg::where('uid',$uid)->with('org')->get()
        ];

        $cl = [
            'gender_age' => DB::table('user_gender_ages')->where('uid',$uid)->first(),
            'ethnicity' => DB::table('user_ethnicities')->where([['uid', '=',$uid], ['privacy', '=', 1]])->first(),
            'speak_languages' => DB::table('user_speak_languages')->where('uid',$uid)->get(),
            'learn_languages' => DB::table('user_learn_languages')->where('uid',$uid)->get(),
            'religion' => DB::table('user_religions')->where('uid',$uid)->first(),
            'relationship' => DB::table('user_relationships')->where('uid',$uid)->first(),
            'work' => DB::table('user_work_careers')->where('uid',$uid)->first(),
            'home' => DB::table('user_homes')->where('uid',$uid)->first(),
            'hometown' => DB::table('user_hometowns')->where('uid',$uid)->first(),
            'health' => DB::table('user_healths')->where('uid',$uid)->first(),
            'hobbies' => UserHobby::where('uid',$uid)->with('hobby')->get(),
            'causes' => DB::table('user_causes')->where('uid',$uid)->get(),
            'school' => DB::table('user_schools')->where('uid',$uid)->first(),
        ];

        $is_friend = Friend::where('uid', $user->id)->where('fid', $uid)->exists();
        if(!$is_friend){
            $is_pending = DB::table('friend_requests')->where([['uid', '=', $user->id], ['fid', '=', $uid]])->exists();
            $is_request = DB::table('friend_requests')->where([['uid', '=', $uid], ['fid', '=', $user->id]])->exists();
            if ($is_request) {
                $alumni->is_friend = 10;
            } else if ($is_pending) {
                $alumni->is_friend = 20;
            } else {
                $alumni->is_friend = 0;
            }
        } else {
            $alumni->is_friend = 1;
        }

        return response()->json(compact('alumni', 'friends', 'ps', 'cl'));
    }

}
