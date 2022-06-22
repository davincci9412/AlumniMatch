import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ApiService } from 'src/app/_services/api.service';
import { DataService } from 'src/app/_services/data.service';
import { NavController, ModalController } from '@ionic/angular';
import { LocationOptionModalComponent } from 'src/app/_shared/location-option-modal/location-option-modal.component';
import { Subscription } from 'rxjs/internal/Subscription';
import { PushService } from 'src/app/_services/push.service';
import { UtilsService } from 'src/app/_services/utils.service';
import { PickLocationModalComponent } from 'src/app/_shared/pick-location-modal/pick-location-modal.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit, OnDestroy {

  visitors: any[];
  nears: any[];
  messages: any[];
  user: any;
  college: any;
  friend_requests: any[];
  subscriptions: Subscription[] = [];

  constructor(
    private api: ApiService,
    private dataSv: DataService,
    private cdRef: ChangeDetectorRef,
    private navCtrl: NavController,
    private modalCtrl: ModalController,
    private push: PushService,
    private utils: UtilsService
  ) { }

  ngOnInit() {
    this.college = JSON.parse(localStorage.college);
    this.getDashboardData();
    this.subscriptions.push(this.dataSv.userStatus.subscribe((res) => {
      this.user = res;
      this.cdRef.detectChanges();
    }));
    this.subscriptions.push(this.push.freqAccepted.subscribe((res) => {
      const freqIndex = this.friend_requests.map(x => x.id).indexOf(res.id);
      if (freqIndex > -1) {
        this.friend_requests.splice(freqIndex, 1);
      }
      this.getDashboardData();
    }));
    this.subscriptions.push(this.push.freqReceived.subscribe((res) => {
      this.friend_requests = [...this.friend_requests, res];
      this.getDashboardData();
    }));
    this.subscriptions.push(this.push.messageReceived.subscribe((res) => {
      this.messages = [...this.messages, res];
      this.getDashboardData();
    }));
    this.subscriptions.push(this.push.locationUpdated.subscribe((res) => {
      const nearIndex = this.nears.map(x => x.id).indexOf(res.id);
      if (nearIndex > -1) {
        this.nears[nearIndex] = res;
      } else {
        this.nears = [...this.nears, res];
      }
      this.getDashboardData();
    }));
    this.subscriptions.push(this.dataSv.nearsChange.subscribe((res) => {
      this.nears = res;
      this.getDashboardData();
    }));
    this.subscriptions.push(this.dataSv.freqsChange.subscribe((res) => {
      this.friend_requests = res;
      this.getDashboardData();
    }));
    this.subscriptions.push(this.dataSv.msgRead.subscribe((res) => {
      this.messages.forEach((msg) => {
        if (msg.id === res) {
          msg.read = true;
        }
      });
      this.getDashboardData();
    }));
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  getDashboardData() {
    this.api.get('alumni/dashboard').subscribe((res: any) => {
      this.messages = res.messages;
      this.user = res.user;
      this.nears = res.nears;
      this.visitors = res.visitors;
      this.friend_requests = res.friend_requests;
      this.dataSv.initUserData(res.user);
      this.cdRef.detectChanges();
    }, (err) => {
      console.error('alumni/all', err);
    });
  }

  viewProfile(data) {
    console.log('viewProfile', data);
  }

  changeLocationShow($event) {
    console.log('changeLocationPrivacy', $event);
    if ($event) {
      this.openLocationOptionModal();
    }
    this.user.coordinate.show = $event ? 1 : 0;
    this.api.get(`user/location/show/${this.user.coordinate.show}`).subscribe((res) => {
      console.log('changeLocationShow', res);
      this.dataSv.updateUserCoordinate(this.user.coordinate);
    }, (err) => {
      console.error('changeLocationShow', err);
    });
  }

  async openLocationOptionModal() {
    const modal = await this.modalCtrl.create({
      component: LocationOptionModalComponent,
      backdropDismiss: false,
      cssClass: 'location-option-modal-css'
    });
    modal.onWillDismiss().then((result) => {
      console.log('result', result);
      if (result && result.data) {
        this.getUserLocation().then((coords: any) => {
          this.api.post('user/location', {
            radius: result.data.radius,
            lat: coords.lat,
            lng: coords.lng
          }).subscribe((res) => {
            this.dataSv.updateUserCoordinate({
              lat: coords.lat,
              lng: coords.lng,
              show: this.user.coordinate.show
            });
            console.log('updateLocation', res);
          });
        }).catch(() => {
          this.api.post('user/location', {
            radius: result.data.radius,
            lat: this.user.coordinate.lat,
            lng: this.user.coordinate.lng
          }).subscribe((res) => {
            console.log('updateLocation', res);
          });
        });
      }
    });
    return await modal.present();
  }

  getUserLocation() {
    return new Promise((resolve, reject) => {
      this.utils.getCurrentPosition().then((res) => {
        resolve(res);
      }).catch(async () => {
        const modal = await this.modalCtrl.create({
          component: PickLocationModalComponent,
          backdropDismiss: false
        });
        modal.onDidDismiss().then((result) => {
          if (result && result.data) {
            console.log('result', result.data);
            resolve({
              lat: result.data.lat,
              lng: result.data.lng
            });
          } else {
            reject();
          }
        });
        modal.present();
      });
    });
  }

  goFriendPage(segment = null) {
    console.log('goFriendPage', segment);
    this.navCtrl.navigateForward(`home/friends/${segment ? segment : ''}`);
  }

  goMapPage() {
    this.navCtrl.navigateForward('home/nearme');
  }

  goLeaderboardPage() {
    this.navCtrl.navigateForward('home/leaderboard');
  }

  editProfile() {
    this.navCtrl.navigateForward('profile');
  }

  viewAllMessages() {
    this.navCtrl.navigateForward('home/messages');
  }

}
