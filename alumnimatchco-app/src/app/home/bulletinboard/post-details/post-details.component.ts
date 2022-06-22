import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController, IonContent } from '@ionic/angular';
import { ApiService } from 'src/app/_services/api.service';
import { ActivatedRoute } from '@angular/router';
import { formatDate } from '@angular/common';

@Component({
  selector: 'post-details',
  templateUrl: './post-details.component.html',
  styleUrls: ['./post-details.component.scss']
})
export class PostDetailsPage implements OnInit {
  @ViewChild(IonContent, { static: false }) content: IonContent;

  comments: any[] = [];
  likes: any[] = [];
  comment: any = {};
  isLoading = true;
  isFocus = false;
  isError = false;
  isDisabled = true;
  post: any = {};

  JSON: any;

  constructor(private navCtrl: NavController, private route: ActivatedRoute, private api: ApiService) {
    this.JSON = JSON;

    const isFocus = this.route.snapshot.paramMap.get('focus');
    console.log('isFocus', isFocus);
    this.isFocus = isFocus === 'focus' ? true : false;

    const currentUser = JSON.parse(localStorage.getItem('user'));
    this.comment = { ...this.comment, comment_user: currentUser };
    console.log(currentUser);
  }

  ngOnInit() {
    const postId = this.route.snapshot.paramMap.get('id');
    this._getPost(postId);
    this._getComments(postId);
    this._getLikes(postId);
  }

  ScrollToBottom() {
    this.content.scrollToBottom(1500);
  }

  _handleMessageInput(e) {
    this.isDisabled = e.target.value.length === 0 ? true : false;
    this.comment = { ...this.comment, [e.target.name]: e.target.value };
  }

  _getPost(postId) {
    this.isLoading = true;
    this.api.post(`post/${postId}`, { isAuth: true }).subscribe(
      (res: any) => {
        this.post = { ...res.data };
        this.isLoading = false;
        console.log(res);
      },
      (err) => {
        console.error('get_post_error', err);
        this.isLoading = false;
        this.isError = err.error.message;
      }
    );
  }

  _checkLike() {
    const loggedUserId = this.comment.comment_user.id;
    console.log('loggedUserId', loggedUserId);
    console.log('likes', this.likes);
    const isLiked = this.likes.filter((l) => l.likedBy === loggedUserId).length;

    this.post.isLiked = isLiked === 0 ? false : true;
  }

  _getLikes(postId) {
    this.isLoading = true;
    this.api.get(`post/likes/${postId}`).subscribe(
      (res: any) => {
        this.likes = res.data;
        this.isLoading = false;
        this._checkLike();
        console.log(res);
      },
      (err) => {
        console.error('get_post_error', err);
        this.isLoading = false;
        this.isError = err.error.message;
      }
    );
  }

  _getComments(postId) {
    this.isLoading = true;
    this.api.get(`post/comments/${postId}`).subscribe(
      (res: any) => {
        this.comments = res.data;
        this.isLoading = false;
        console.log(res);
      },
      (err) => {
        console.error('get_post_error', err);
        this.isLoading = false;
        this.isError = err.error.message;
      }
    );
  }

  likePost(postId, type = 'like') {
    const postData: any = {
      type,
      postId
    };

    if (type === 'comment') {
      postData.comment = this.comment.comment;
    }

    if (!this.post.isLiked || type === 'comment') {
      this.api.post('post/reaction', postData).subscribe(
        (res: any) => {
          this.post.isLiked = true;
          if (type === 'comment') {
            this.comment.created_at = formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en');
            this.comments = [...this.comments, this.comment];
            this.comment = { };
            this.isDisabled = true;
          }

          if (type === 'like') {
            this.post.likes_count = this.post.likes_count + 1;
          }

          console.log(res.message);
        },
        (err) => {
          console.error('getpostdataError', err);
          this.isError = err.error.message;
        }
      );
    }
  }

  goBack() {
    this.navCtrl.navigateBack(`/home/bulletinboard`);
  }
}
