<?php
namespace App\Http\Controllers\Api;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\PostType;
use App\Models\PostCategory;
use App\Models\PostLikes;
use App\Models\PostComments;

class PostController extends Controller
{
    public function getPostType(Request $request) {
        $typeId = $request->route('typeId');
        $types = $typeId ? PostType::find($typeId) : PostType::all();
        return $this->successResponse($types,"Post Types Listed successfully");
    }

    public function createOrUpdatePostType(Request $request) {
        $typeId = $request->route('typeId');
        $validator = $this->_validatePostTypeCategories();
        if($validator->fails()){
            return $this->errorResponse($validator->messages(), 422);
        }
        $isPostTypeCreated = PostType::updateOrCreate(['id' => $typeId],$request->all());
        $message = $typeId ? "Post Type Updated successfully" : "Post Type Created successfully";
        return $this->successResponse(null,$message);
    }

    public function getPostTypeCategories(Request $request) {
        $typeId = $request->route('typeId');
        $categories = $typeId ? PostCategory::where("postTypeId",$typeId)->get() : PostCategory::all();
        return $this->successResponse($categories,"Post Type Categories Listed successfully");
    }

    public function createOrUpdatePostCategory(Request $request) {
        $categoryId = $request->route('categoryId');
        $validator = $this->_validatePostTypeCategories(true);
        if($validator->fails()){
            return $this->errorResponse($validator->messages(), 422);
        }
        $isPostTypeCategoryCreated = PostCategory::updateOrCreate(['id' => $categoryId],$request->all());
        $message = $categoryId ? "Post Type Category updated successfully" : "Post Type Category created successfully";
        return $this->successResponse(null,$message);
    }

    public function getAllPosts(Request $request){
        $postId = $request->route('postId');
        $authUserId = $request->user()->id;
        $isAuthPost = $request->isAuthPost;
        $query = Post::query();
        
        if($isAuthPost === true){
            $query->where("userId",'=',$authUserId);
        } 
        if($isAuthPost === false){
            $query->where("userId",'!=',$authUserId)->with('user');
        }

        if($postId){
            $query->whereId($postId)->with('user');
        }
        
        $query->with('type')->with('category')->withCount('likes')->withCount("comments")->orderBy('created_at', 'desc');

        $posts = $postId ? $query->first() : $query->get();

        return $this->successResponse($posts,"Post listed successfully");
    }

    public function createOrUpdatePost(Request $request){
        $postId = $request->route('postId');
        $authUserId = $request->user()->id;
        $validator = $this->_validatePost(true);
        if($validator->fails()){
            return $this->errorResponse($validator->messages(), 422);
        }
        $post = Arr::add($request->all(), 'userId', $authUserId);
        
        if (preg_match('/^data:image\/(\w+);base64,/', $post['photoUrl'])) {
            $data = substr($post['photoUrl'], strpos($post['photoUrl'], ',') + 1);
            $data = base64_decode($data);
            $fileName = uniqid($authUserId.'_post_').'.jpg';
            Storage::disk('avatar')->put($fileName, $data);
            $post['photoUrl'] = config('app.url').'/images/avatar/'.$fileName;;
        }
        $isPostCreated = Post::updateOrCreate(['id' => $postId],$post);
        $message = $postId ? "Post updated successfully" : "Post created successfully";
        return $this->successResponse(null, $message);
    }

    public function postReaction(Request $request) {
        $validator = $this->_validatePostReaction(true);
        if($validator->fails()){
            return $this->errorResponse($validator->messages(), 422);
        }
        $userId = $request->userId ? $request->userId : $request->user()->id;
        $reaction = $request->type === "comment" ? new PostComments : new PostLikes;
        $reaction->postId = $request->postId;
        if($request->type === "like")  $reaction->likedBy = $userId;
        if($request->type === "comment"){
            $reaction->commentBy = $userId;
            $reaction->comment = $request->comment;
        }
        $isPostReactionSaved = $reaction->save();
        return $isPostReactionSaved ? $this->successResponse(null, $request->type === "comment" ? "commented Successfully" : "liked Successfully") : $this->errorResponse("Error in post reaction");

    }

    public function getPostLike(Request $request) {
        $likes = new PostLikes;
        $postId = $request->route('postId');
        $types = $postId ? $likes->where("postId",$postId) : $likes;
        $postLikes = $types->with("likeBy")->get();
        return $this->successResponse($postLikes,"post likes list successfully");
    }

    public function getPostComments(Request $request) {
        $postComments = PostComments::where("postId",$request->route('postId'))->with("commentUser")->get();
        return $this->successResponse($postComments,"post comment list successfully");
    }

    public function _validatePostReaction() {
        $rule = [
            "postId" => "required|numeric",
            "audience" =>  "in:like,comment"
        ];
        return Validator::make(request()->all(), $rule);
    }

    public function _validatePost() {
        $rule = [
            "title" => "required|string|max:255",
            "description" => "",
            "summary" => "required|string|max:144",
            "postTypeId" => "required|numeric",
            "postCategoryId" => "required|numeric",
            "photoUrl" => "string|nullable",
            // "audience" =>  "in:distance,friend,everywhere"
        ];
        return Validator::make(request()->all(), $rule);
    }

    public function _validatePostTypeCategories($isCategory=false){
        $rule = [
            'name' => 'required|string|max:255',
            'shortDescription' => 'string|max:144|nullable',
            'icon' => 'string|nullable',
        ];
        if($isCategory){
            $rule = Arr::add($rule, 'postTypeId', 'required|numeric');
        }
        return Validator::make(request()->all(), $rule);
    }
}

