import { Component, OnInit } from '@angular/core';
import { NavController, ModalController } from '@ionic/angular';
import { ApiService } from 'src/app/_services/api.service';
import { AddPostComponent } from './add-post/add-post.component';

@Component({
  selector: 'app-bulletinboard',
  templateUrl: './bulletinboard.page.html',
  styleUrls: ['./bulletinboard.page.scss'],
})
export class BulletinboardPage implements OnInit {
  postType = 'other';
  isLoading = true;
  isError: false;
  isLiked = false;
  posts: any[] = [];
  likes: any[] = [];

  constructor(private navCtrl: NavController, private api: ApiService, public modalController: ModalController) {
    this._getLikes();
  }

  ngOnInit() {
    this.getPosts(this.postType === 'other' ? false : true);
  }

  back() {
    this.navCtrl.navigateBack('/home');
  }

  changePostType($event) {
    this.isLoading = true;
    this.posts = [];
    this.postType = $event.target.value;
    this.getPosts($event.target.value === 'other' ? false : true);
  }

  getPosts(isAuthPost: boolean) {
    this.isLoading = true;
    this.api.post('post', { isAuthPost }).subscribe(
      (res: any) => {
        this.posts = res.data;
        this.isLoading = false;
      },
      (err) => {
        console.error('getpostdataError', err);
        this.isLoading = false;
      }
    );
  }

  composePost(postId: number) {
    this.navCtrl.navigateForward(`/home/bulletinboard/details/${postId}`);
  }

  async _handleNewPost() {
    console.log('test');
    const modal = await this.modalController.create({
      component: AddPostComponent,
    });

    modal.onDidDismiss().then(() => {
      this.getPosts(true);
      this.postType = 'own';
    });

    return await modal.present();
  }

  _checkLike(postId) {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    let loggedUserId = currentUser.id;
    console.log('likes', this.likes.filter((l) => l.likedBy === loggedUserId && l.postId === postId).length);
    let isLiked = this.likes.filter((l) => l.likedBy === loggedUserId && l.postId === postId).length;
    return isLiked === 0 ? false : true;
  }

  _getLikes() {
    this.isLoading = true;
    this.api.get(`post/likes`).subscribe(
      (res: any) => {
        this.likes = res.data;
        this.isLoading = false;
        console.log('likes', res);
      },
      (err) => {
        console.error('get_post_error', err);
        this.isLoading = false;
        this.isError = err.error.message;
      }
    );
  }

  likePost(postId) {
    if (!this._checkLike(postId)) {
      let postData = {
        type: 'like',
        postId,
      };
      this.api.post('post/reaction', postData).subscribe(
        (res: any) => {
          let findPost = this.posts.find((p) => p.id === postId);
          findPost.likes_count += 1;
          findPost.isLiked = true;
          console.log(res.data);
        },
        (err) => {
          console.error('getpostdataError', err);
          this.isError = err.error.message;
        }
      );
    }
  }
}
