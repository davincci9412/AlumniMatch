import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { TwitterConnect } from '@ionic-native/twitter-connect/ngx';
import { UtilsService } from 'src/app/_services/utils.service';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook/ngx';
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { SOCIALS } from 'src/app/_config/devdata';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-social-buttons',
  templateUrl: './social-buttons.component.html',
  styleUrls: ['./social-buttons.component.scss'],
})
export class SocialButtonsComponent implements OnInit {

  socials: any = SOCIALS;
  @Output() scClick: EventEmitter<any> = new EventEmitter();
  constructor(
    private utils: UtilsService,
    private twitter: TwitterConnect,
    private facebook: Facebook,
    private google: GooglePlus
  ) { }

  ngOnInit() {}

  clickSc(type) {
    if (!environment.production) {
      const sc = this.socials[type];
      sc.type = type;
      this.scClick.emit(sc);
    } else {
      switch (type) {
        case 'facebook':
          this.facebookAuth().then((social) => {
            this.scClick.emit(social);
          }).catch((err) => {
            this.utils.presentErrorAlert(err.error);
          });
          break;
        case 'twitter':
          this.twitterAuth().then((social) => {
            this.scClick.emit(social);
          }).catch((err) => {
            this.utils.presentErrorAlert(err.error);
          });
          break;
        case 'google':
          this.googleAuth().then((social) => {
            this.scClick.emit(social);
          }).catch((err) => {
            this.utils.presentErrorAlert(err.error);
          });
          break;
        default:
          break;
      }
    }
  }

  facebookAuth() {
    const promise = new Promise((resolve, reject) => {
      this.facebook.login(['email', 'public_profile']).then((response: FacebookLoginResponse) => {
        console.log('facebook login:', response.authResponse);
        this.facebook.api('me?fields=id,name,link,first_name,last_name,picture', []).then(profile => {
          console.log('facebook profile', profile);
          const data: any = {
            first_name: profile.first_name,
            last_name: profile.last_name,
            username: profile.name,
            id: response.authResponse.userID,
            type: 'facebook'
          };
          if (profile.picture) {
            data.avatar = 'https://graph.facebook.com/' + data.id + '/picture?type=large';
          } else {
            data.avatar = 'assets/imgs/user.png';
          }
          resolve(data);
        }).catch((err) => {
          console.error('facebook profile', err);
          reject({error: 'Facebook login failed.'});
        });
      }).catch((err) => {
        console.error('facebook login', err);
        reject({error: 'Facebook login failed.'});
      });
    });
    return promise;
  }

  twitterAuth() {
    const promise = new Promise((resolve, reject) => {
      this.twitter.login().then((res) => {
        console.log('twitter login : ', res);
        let data: any = {};
        this.twitter.showUser().then((user) => {
          console.log('Twitter show user', user);
          const name = user.name.split(' ');
          data = {first_name: name[0], last_name: name[1], username: res.userName, id: res.userId, type: 'twitter'};

          if (user.profile_image_url_https) {
            data.avatar = user.profile_image_url_https;
          } else {
            data.avatar = 'assets/imgs/user.png';
          }
          console.log('twitter user:', data);
          resolve(data);
        }, (err) => {
          console.error('twitter:', err);
          reject({error: 'Twitter login failed.'});
        });
      }).catch((err) => {
        console.error('twitter login:', err);
        reject({error: 'Twitter login failed.'});
      });
    });
    return promise;
  }

  googleAuth() {
    const promise = new Promise((resolve, reject) => {
      this.google.login({})
        .then(res => {
          console.log('google login', res);
          const data: any = {
            first_name: res.givenName,
            last_name: res.familyName,
            username: res.displayName,
            id: res.userId,
            type: 'google'
          };
          console.log('google  plus login:', data);
          if (res.imageUrl) {
            data.avatar = res.imageUrl;
          } else {
            data.avatar = 'assets/imgs/user.png';
          }
          resolve(data);
        })
        .catch(err => {
          console.error('google login', err);
          reject({error: 'Google+ login failed.'});
        });
    });
    return promise;
  }
}
