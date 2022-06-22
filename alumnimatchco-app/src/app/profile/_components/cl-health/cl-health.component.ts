import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/_services/api.service';
import { MENTAL_EXERCISES, PHYSICAL_EXERCISES } from 'src/app/_config/current-life.constant';
import { ModalController } from '@ionic/angular';
import { UtilsService } from 'src/app/_services/utils.service';

@Component({
  selector: 'app-cl-health',
  templateUrl: './cl-health.component.html',
  styleUrls: ['./cl-health.component.scss'],
})
export class ClHealthComponent implements OnInit {

  data: any = {};

  mental_exercises = MENTAL_EXERCISES;
  selectMentalOption: any = {
    header: 'How often do you do...',
    mode: 'md',
    cssClass: 'am-select-popup'
  };
  physical_exercises = PHYSICAL_EXERCISES;
  selectPhysicalOption: any = {
    header: 'How often do you do...',
    mode: 'md',
    cssClass: 'am-select-popup'
  };
  constructor(
    private api: ApiService,
    private modalCtrl: ModalController,
    private utils: UtilsService
  ) { }

  ngOnInit() {
    this.getHealth();
  }

  getHealth() {
    this.api.get('user/health', true).subscribe((res) => {
      this.data = res;
    });
  }

  onSubmit() {
    if (this.data.mental === undefined) {
      this.utils.presentErrorAlert('Please select mental info.');
      return;
    }
    if (this.data.physical === undefined) {
      this.utils.presentErrorAlert('Please select physical info.');
      return;
    }
    this.api.post('user/health', this.data, true).subscribe((res) => {
      console.log('user/health', res);
      this.modalCtrl.dismiss(true);
    }, (err) => {
      console.error('user/health', err);
    });
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

}


