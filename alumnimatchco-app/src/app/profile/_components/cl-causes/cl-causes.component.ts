import { Component, OnInit } from '@angular/core';
import { CAUSES } from 'src/app/_config/current-life.constant';
import { ApiService } from 'src/app/_services/api.service';
import { ModalController } from '@ionic/angular';
import { UtilsService } from 'src/app/_services/utils.service';

@Component({
  selector: 'app-cl-causes',
  templateUrl: './cl-causes.component.html',
  styleUrls: ['./cl-causes.component.scss'],
})
export class ClCausesComponent implements OnInit {

  data: any[] = [{}];
  causes = CAUSES;
  selectCauseOption: any = {
    header: 'Select cause',
    mode: 'md',
    cssClass: 'am-select-popup'
  };

  constructor(
    private api: ApiService,
    private modalCtrl: ModalController,
    private utils: UtilsService
  ) { }

  ngOnInit() {
    this.getCauses();
  }

  getCauses() {
    this.api.get('user/causes', true).subscribe((res: any[]) => {
      console.log('user/causes', res);
      if (res && res.length) {
        this.data = res;
      } else {
        this.data = [{}];
      }
    }, (err) => {
      console.error('user/causes', err);
    });
  }

  onSubmit() {
    const filteredCauses = this.data.filter((item) => {
      if (item.hasOwnProperty('cause')) {
        return true;
      } else {
        return false;
      }
    });
    if (!filteredCauses.length) {
      this.utils.presentErrorAlert('Pelase select cause');
      return;
    }
    this.api.post('user/causes', this.data, true).subscribe((res) => {
      console.log('user/causes', res);
      this.modalCtrl.dismiss(true);
    }, (err) => {
      console.error('user/causes', err);
    });
  }

  addCause() {
    if (this.data.length && this.data[this.data.length - 1].cause !== undefined) {
      this.data.push({});
    } else if (this.data.length === 0) {
      this.data = [{}];
    }
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

}
