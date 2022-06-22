import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NavController, ModalController } from '@ionic/angular';
import { ApiService } from 'src/app/_services/api.service';
import { ATHLETE_POSITIONS } from 'src/app/_config/athletes.constant';
import * as ClConstants from 'src/app/_config/current-life.constant';
import { SimilarUsersModalComponent } from '../_components/similar-users-modal/similar-users-modal.component';
import { UtilsService } from 'src/app/_services/utils.service';
import { DataService } from 'src/app/_services/data.service';

@Component({
  selector: 'app-view-profile',
  templateUrl: './view-profile.component.html',
  styleUrls: ['./view-profile.component.scss'],
})
export class ViewProfileComponent implements OnInit {

  user: any;
  friends: any[];
  ps: any;
  cl: any;
  psegment = 'ps';

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
    private navCtrl: NavController,
    private api: ApiService,
    private modalCtrl: ModalController,
    private utils: UtilsService,
    private cdRef: ChangeDetectorRef,
    private dataSv: DataService
  ) { }

  ngOnInit() {
    this.getUserData();
  }

  takePhoto() {
    this.utils.takePhoto(true).then((imageData) => {
      this.user.avatar = 'data:image/jpeg;base64,' + imageData;
      this.api.post('user/avatar', {
        data: imageData
      }, true).subscribe((res) => {
        console.log('uploadResult', res);
        this.user.avatar = res + '?' + (new Date().getTime());
        this.dataSv.updateUserAvatar(this.user.avatar);
      }, (error) => {
        console.error('uploadAvatarError', error);
      });
    }).catch((err) => {
      console.error('err', err);
    });
  }

  editProfile() {
    this.navCtrl.navigateForward('/profile');
  }

  back() {
    this.navCtrl.navigateBack('/home');
  }

  getUserData() {
    this.api.get('user').subscribe((res: any) => {
      console.log('getUserData', res);
      this.user = res.user;
      this.friends = res.friends;
      this.ps = res.ps;
      this.cl = res.cl;
      this.cdRef.detectChanges();
    }, (err) => {
      console.error('alumni/all', err);
    });
  }

  segmentChanged($event) {
    console.log('segmentChanged', $event.target.checked);
  }

  async findSimilarUsers(category, cid) {
    console.log(category, cid);
    const modal = await this.modalCtrl.create({
      component: SimilarUsersModalComponent,
      backdropDismiss: false,
      componentProps: {category, cid}
    });
    return await modal.present();
  }
}
