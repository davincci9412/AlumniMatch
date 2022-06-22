<?php

use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/
Route::group(['prefix' => 'static', 'namespace' => 'Api'], function () {
    Route::get('countries/ou', 'BaseDataController@getCountriesWithOUCollege');
    Route::get('countries', 'BaseDataController@getCountries');
    Route::get('states', 'BaseDataController@getStates');
    Route::get('states/filter', 'BaseDataController@filterState');
    Route::get('colleges', 'BaseDataController@getColleges');
    Route::get('college/{cid}', 'BaseDataController@getCollegeInfo');
    Route::get('colleges/filter', 'BaseDataController@filterColleges');
    Route::get('degrees', 'BaseDataController@getDegrees');
    Route::get('athletes', 'BaseDataController@getAthletes');
    Route::get('organizations', 'BaseDataController@getOrganizations');
    Route::get('ibcs', 'BaseDataController@getIBCs');
    Route::get('industries', 'BaseDataController@getIndustries');
    Route::get('ps', 'BaseDataController@getPSData');
});

Route::group(['prefix' => 'auth', 'namespace' => 'Api'], function () {
    Route::post('register', 'AuthController@register');
    Route::post('login', 'AuthController@login');
    Route::get('exist/{social}/{sid}', 'AuthController@isRegisteredUser');
    Route::get('invite/verify/{code}', 'AuthController@verifyInviteCode');
    Route::group(['middleware' => ['jwt.verify']], function() {
        Route::get('logout', 'AuthController@logout');
        Route::get('invite/code', 'AuthController@generateInviteCode');
        Route::post('ticket/account', 'AuthController@createAccountTicket');
    });

});

Route::group(['prefix' => 'user', 'namespace' => 'Api', 'middleware' => ['jwt.verify']], function () {
    Route::get('/', 'UserController@index');
    Route::get('weights', 'UserController@getMatchWeights');
    Route::post('weights', 'UserController@saveMatchWeights');
    Route::get('degrees', 'UserController@getDegrees');
    Route::post('degrees', 'UserController@saveDegrees');
    Route::get('orgs', 'UserController@getOrgs');
    Route::post('orgs', 'UserController@saveOrgs');
    Route::get('athlete', 'UserController@getAthlete');
    Route::post('athlete', 'UserController@saveAthlete');

    Route::get('gae', 'UserController@getGenderAgeEthnicity');
    Route::post('gae', 'UserController@saveGenderAgeEthnicity');
    Route::get('languages/speak', 'UserController@getSpeakLanguages');
    Route::post('languages/speak', 'UserController@saveSpeakLanguages');
    Route::get('languages/learn', 'UserController@getLearnLanguages');
    Route::post('languages/learn', 'UserController@saveLearnLanguages');
    Route::get('religion', 'UserController@getReligion');
    Route::post('religion', 'UserController@saveReligion');

    Route::group(['prefix' => 'relationship'], function() {
        Route::get('/', 'UserController@getRelationship');
        Route::post('married', 'UserController@saveRelationshipMarried');
        Route::post('divorced', 'UserController@saveRelationshipDivorced');
        Route::post('widowed', 'UserController@saveRelationshipWidowed');
        Route::post('engaged', 'UserController@saveRelationshipEngaged');
        Route::post('single', 'UserController@saveRelationshipSingle');
        Route::post('other', 'UserController@saveRelationshipOther');
        Route::post('invite-partner', 'UserController@invitePartner');
    });

    Route::get('work-career', 'UserController@getWorkCareer');
    Route::post('work-career', 'UserController@saveWorkCareer');
    Route::get('home', 'UserController@getHome');
    Route::post('home', 'UserController@saveHome');
    Route::get('hometown', 'UserController@getHometown');
    Route::post('hometown', 'UserController@saveHometown');
    Route::get('health', 'UserController@getHealth');
    Route::post('health', 'UserController@saveHealth');
    Route::get('hobbies', 'UserController@getHobbies');
    Route::post('hobbies', 'UserController@saveHobbies');
    Route::get('causes', 'UserController@getCauses');
    Route::post('causes', 'UserController@saveCauses');
    Route::get('school', 'UserController@getSchool');
    Route::post('school', 'UserController@saveSchool');

    Route::get('completed/ps', 'UserController@getPSProfileCompleted');
    Route::get('completed/cl', 'UserController@getCLProfileCompleted');
    Route::get('completed', 'UserController@getProfileCompleted');
    Route::get('activate', 'UserController@activateUser');

    Route::get('location/show/{show}', 'UserController@changeLocationShow');
    Route::post('location', 'UserController@updateLocation');
    Route::get('location', 'UserController@getLocation');
    Route::get('push/token/{deviceToken}', 'UserController@saveDeviceToken');
    Route::post('avatar', 'UserController@uploadAvatar');
    Route::get('invite-code', 'UserController@getInviteCode');
    Route::get('generate-code', 'UserController@generateInviteCode');
});

Route::group(['prefix' => 'alumni', 'namespace' => 'Api', 'middleware' => ['jwt.verify']], function () {
    Route::get('all', 'AlumniController@index');
    Route::get('match/{uid}', 'AlumniController@getUserDetail');
    Route::get('dashboard', 'AlumniController@getDashboardData');
    Route::get('nears', 'AlumniController@getNears');
    Route::get('leaderboard', 'AlumniController@getLeaderboardData');
    Route::get('users', 'AlumniController@getUsers');
    Route::get('requests', 'AlumniController@getFriendRequests');
    Route::get('suggests', 'AlumniController@getSuggests');
    Route::get('visits', 'AlumniController@getVisits');
    Route::get('friends', 'AlumniController@getFriends');
    Route::get('pendings', 'AlumniController@getPendings');
    Route::get('similar/{category}/{cid}', 'AlumniController@getSimilarUsers');
    Route::post('search', 'AlumniController@searchUsers');
    Route::get('extra/{uid}', 'AlumniController@getMiniAlumniData');
    Route::get('detail/{uid}', 'AlumniController@getFullAlumniData');
});

Route::group(['prefix' => 'friend', 'namespace' => 'Api', 'middleware' => ['jwt.verify']], function () {
    Route::post('approve', 'FriendController@approveFriendRequest');
    Route::post('ignore', 'FriendController@ignoreFriendRequest');
    Route::post('invite', 'FriendController@inviteAsFriend');
    Route::get('all', 'FriendController@getAllFriends');
});

Route::group(['prefix' => 'message', 'namespace' => 'Api', 'middleware' => ['jwt.verify']], function() {
    Route::get('users', 'MessageController@index');
    Route::get('user/{uid}', 'MessageController@getUserMessages');
    Route::post('send', 'MessageController@sendMessage');
    Route::get('read/{mid}', 'MessageController@markAsRead');
    Route::delete('{mid}', 'MessageController@deleteMessage');
    Route::post('send/all', 'MessageController@sendMessageToAll');
    Route::post('send/radius', 'MessageController@sendMessageInRadius');
    Route::post('send/users', 'MessageController@sendMessageToUsers');
});


Route::group(['prefix' => 'post', 'namespace' => 'Api', 'middleware' => ['jwt.verify']], function() {
    
    Route::get('types/{typeId?}', 'PostController@getPostType');
    Route::post('type-create-or-update/{typeId?}', 'PostController@createOrUpdatePostType');
    Route::get('type-categories/{typeId?}', 'PostController@getPostTypeCategories');
    Route::post('type-category-create-or-update/{categoryId?}', 'postController@createOrUpdatePostCategory');

    Route::post('create-or-update/{postId?}', 'PostController@createOrUpdatePost');
    Route::delete('get/{postId}', 'PostController@deletePost');
    Route::post('reaction', 'PostController@postReaction');
    Route::get('likes/{postId?}', 'PostController@getPostLike');
    Route::get('comments/{postId}', 'PostController@getPostComments');
    Route::post('/{postId?}', 'PostController@getAllPosts');

});

Route::group(['prefix' => 'test', 'namespace' => 'Api', 'middleware' => ['jwt.verify']], function () {
    Route::get('send', 'UserController@sendTestPush');
});
