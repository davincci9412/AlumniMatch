import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/_services/api.service';
import { DEGREES } from 'src/app/_config/degrees.constant';
import * as ClConstants from 'src/app/_config/current-life.constant';
import { ATHLETE_POSITIONS } from 'src/app/_config/athletes.constant';
import { ModalController, ToastController, AlertController } from '@ionic/angular';
import { SendMessageModalComponent } from 'src/app/_shared/send-message-modal/send-message-modal.component';
import { AuthService } from 'src/app/_services/auth.service';
import { DataService } from 'src/app/_services/data.service';
import { Zoom } from '@ionic-native/zoom/ngx';

@Component({
  selector: 'app-user',
  templateUrl: './user.page.html',
  styleUrls: ['./user.page.scss'],
})
export class UserPage implements OnInit {

  college: any;
  user: any;
  friends: any[];
  ps: any;
  cl: any;
  psegment = 'ps';
  DEGREES: any[] = DEGREES;

  DEGREE_TYPES = ['Bachelors', 'Masters', 'Doctoral'];
  ATHLETE_POSITIONS = ATHLETE_POSITIONS;
  ATHLETE_MEMBERS = ['YES - Athlete', 'Yes - Staff', 'No - But big fan', 'NO - Don\'t care'];

  GENDERS = ClConstants.GENDERS;
  AGEGROUPS = ClConstants.AGEGROUPS;
  ETHNICITIES = ClConstants.ETHNICITIES;
  LANGUAGES = ClConstants.LANGUAGES;
  RELIGIONS = ClConstants.RELIGIONS;
  RELATIONSHIPS = ClConstants.RELATIONSHIPS;
  MENTAL_EXERCISES = ClConstants.MENTAL_EXERCISES;
  PHYSICAL_EXERCISES = ClConstants.PHYSICAL_EXERCISES;
  CAUSES = ClConstants.CAUSES;
  SATIS_LEVELS = ClConstants.SATIS_LEVELS;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private dataSv: DataService,
    private modalCtrl: ModalController,
    private zoomService: Zoom,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {
    this.college = JSON.parse(localStorage.college);
  }

  ngOnInit() {    
    const uid = this.route.snapshot.paramMap.get('uid');
    this.getUserProfile(uid);
  }

  getUserProfile(uid) {
    this.api.get(`alumni/detail/${uid}`).subscribe((res: any) => {
      console.log('getUserProfile', res);
      this.user = res.alumni;
      this.friends = res.friends;
      this.ps = res.ps;
      this.cl = res.cl;
    });
  }

  addasfriend() {
    this.api.post('friend/invite', {
      fid: this.user.id
    }).subscribe((res) => {
      this.user.is_friend = 20;
    });
  }

  approve() {
    this.api.post('friend/approve', {
      fid: this.user.id
    }).subscribe((res) => {
      this.user.is_friend = 1;
      this.dataSv.updateFreqCount(false);
      this.dataSv.updateFriendsCount(true);
    });
  }

  async sendMessage() {
    const modal = await this.modalCtrl.create({
      component: SendMessageModalComponent,
      componentProps: {rid: this.user.id},
      cssClass: 'send-message-modal-css'
    });
    return await modal.present();
  }

  video() {
    this.zoomService.isLoggedIn().then((success) => {
      console.log(success);
      if (success === true) {
        this.api.loggedInZoom = true;
        this.showZoomMeeting();
      } else {
        this.api.loggedInZoom = false;
        this.showZoomLogin();
      }
    }).catch((error) => {
      console.log(error);
      this.presentToast(error);
    });
  }

  async showZoomLogin() {
    const alert = await this.alertCtrl.create({
      header: 'Zoom Login',
      inputs: [
        {
          name: 'username',
          type: 'text',
          placeholder: 'username'
        },
        {
          name: 'password',
          type: 'password',
          placeholder: 'password'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Login',
          handler: (data) => {
            this.zoomService.login(data.username, data.password).then((success) => {
              console.log(success.message);
              this.presentToast(success.message);
              this.api.loggedInZoom = true;
            }).catch((error) => {
              console.log(error);
              this.presentToast(error.message);
            });
          }
        }
      ]
    });

    await alert.present();
  }

  async showZoomMeeting() {
    const alert = await this.alertCtrl.create({
      header: 'Zoom Meeting',
      inputs: [
        {
          name: 'meetingid',
          type: 'text',
          placeholder: 'meetingid'
        },
        {
          name: 'password',
          type: 'password',
          placeholder: 'password'
        },
        {
          name: 'yourname',
          type: 'text',
          placeholder: 'your name',
          value: this.user.first_name + ' ' + this.user.last_name
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Join',
          handler: (data) => {
            this.joinMeeting(data.meetingid, data.password, data.yourname);
          }
        }
      ]
    });

    await alert.present();
  }

  joinMeeting(meetingNumber, meetingPassword, displayName) {
    const options = {
      no_driving_mode: true,
      no_invite: true,
      no_meeting_end_message: true,
      no_titlebar: false,
      no_bottom_toolbar: false,
      no_dial_in_via_phone: true,
      no_dial_out_to_phone: true,
      no_disconnect_audio: true,
      no_share: true,
      no_audio: true,
      no_video: true,
      no_meeting_error_message: true,
      custom_meeting_id: "Customized Title",
      meeting_views_options: 64,
      no_unmute_confirm_dialog: true,
      no_webinar_register_dialog: false
    };
    this.zoomService.joinMeeting(meetingNumber, meetingPassword, displayName, options)
      .then((success) => {
        console.log(success);
        this.presentToast(success);
      }).catch((error) => {
        console.log(error);
        this.presentToast(error);
    });
  }

  async presentToast(text) {
    const toast = await this.toastCtrl.create({
      message: text,
      duration: 3000,
      position: 'top'
    });
    await toast.present();
  }

}
