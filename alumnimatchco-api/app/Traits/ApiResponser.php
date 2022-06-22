<?php

namespace App\Traits;

use Illuminate\Support\Arr;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Validator;
use Illuminate\Pagination\LengthAwarePaginator;

trait ApiResponser{

    protected function successResponse($data, $message = null, $code = 200)
	{
		$response = [
			'status'=> 'Success', 
			'message' => $message,
		];
		if($data){
			$response = Arr::add($response, 'data', $data);
		}
		return response()->json($response, $code);
	}

	protected function errorResponse($message = null, $code)
	{
		$errorResponse = [
			'status'=>'Error',
			'message' => $message
		];
		return response()->json($errorResponse, $code);
	}


	function object_to_array( $object ) {
    if( !is_object( $object ) && !is_array( $object ) ) return $object;
    return array_map( 'object_to_array', (array) $object );
}

}