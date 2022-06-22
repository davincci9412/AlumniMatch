import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ModalController, NavParams } from '@ionic/angular';
import { SelectModalComponent } from 'src/app/_shared/select-modal/select-modal.component';
import { ATHLETE_POSITIONS, ATHLETES } from 'src/app/_config/athletes.constant';
import { UtilsService } from 'src/app/_services/utils.service';
import { ApiService } from 'src/app/_services/api.service';

@Component({
  selector: 'app-ps-athlete',
  templateUrl: './ps-athlete.component.html',
  styleUrls: ['./ps-athlete.component.scss'],
})
export class PsAthleteComponent implements OnInit {

  data: any = {};

  selectAthleteOption: any = {
    header: 'Were you an official member within your college’s athletic department?',
    mode: 'md',
    cssClass: 'am-select-popup'
  };
  selectTeamPosOption: any = {
    header: 'What was your position?',
    mode: 'md',
    cssClass: 'am-select-popup'
  };
  ALL_ATHLETES: any[] = ATHLETES;
  POSITIONS: string[] = ATHLETE_POSITIONS;

  constructor(
    private modalCtrl: ModalController,
    private utils: UtilsService,
    private api: ApiService
  ) { }

  ngOnInit() {
    this.getUserAthlete();
  }

  getUserAthlete() {
    this.api.get('user/athlete', true).subscribe((res: any) => {
      console.log('getUserProfile', res);
      if (res) {
        this.data = res;
        if (res.privacy === undefined) {
          console.log('undefine privacy');
          this.data.privacy = true;
        }
      }
    });
  }

  async selectAthlete(athlete) {
    const modal = await this.modalCtrl.create({
      component: SelectModalComponent,
      componentProps: {
        items: this.ALL_ATHLETES,
        selectedItem: athlete ? athlete.id : null,
        multiple: false,
        title: 'Select athlete'
      },
      cssClass: 'select-modal-css',
      backdropDismiss: false
    });
    modal.onDidDismiss().then((res) => {
      console.log('chooseOrg', res);
      if (res.data) {
        this.data.athlete = res.data;
      }
    }).catch((err) => {
      console.error('chooseOrg', err);
    });
    return await modal.present();
  }

  onSubmit() {
    let body;
    console.log('this.data', this.data);
    if (this.data.member === 0) {
      if (!this.data.athlete) {
        this.utils.presentErrorAlert('Please select athlete');
        return;
      }
      if (this.data.position === undefined) {
        this.utils.presentErrorAlert('Please select position');
        return;
      }
      body = {
        privacy: this.data.privacy,
        member: 0,
        athlete: this.data.athlete,
        position: this.data.position
      };
    } else {
      body = {
        privacy: this.data.privacy,
        member: this.data.member
      };
    }
    console.log('body', body);
    this.api.post('user/athlete', body, true).subscribe((res) => {
      console.log('saveUserAthlete', res);
      this.modalCtrl.dismiss(true);
    }, (err) => {
      console.error('saveUserAthlete', err);
    });
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

}
