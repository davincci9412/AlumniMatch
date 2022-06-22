import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/_services/api.service';
import { ModalController } from '@ionic/angular';
import { SelectModalComponent } from 'src/app/_shared/select-modal/select-modal.component';
import { HOBBIES } from 'src/app/_config/hobbies.constant';

@Component({
  selector: 'app-cl-hobbies',
  templateUrl: './cl-hobbies.component.html',
  styleUrls: ['./cl-hobbies.component.scss'],
})
export class ClHobbiesComponent implements OnInit {

  data: any = [];
  all_hobbies = HOBBIES;
  constructor(
    private api: ApiService,
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {
    this.getHobbies();
  }

  getHobbies() {
    this.api.get('user/hobbies', true).subscribe((res) => {
      console.log('user/hobbies', res);
      this.data = res;
    }, (err) => {
      console.error('user/hobbies', err);
    });
  }

  onSubmit() {
    this.api.post('user/hobbies', this.data, true).subscribe((res) => {
      console.log('user/hobbies', res);
      this.modalCtrl.dismiss(true);
    }, (err) => {
      console.error('user/hobbies', err);
    });
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  async selectHobby(index) {
    const modal = await this.modalCtrl.create({
      component: SelectModalComponent,
      componentProps: {
        items: this.all_hobbies,
        selectedItem: this.data && this.data[index] ? this.data[index].hobby.id : null,
        multiple: false,
        title: 'Select hobby'
      },
      cssClass: 'select-modal-css',
      backdropDismiss: false
    });
    modal.onDidDismiss().then((res) => {
      console.log('chooseHobby', res);
      if (res.data) {
        if (this.data) {
          if (this.data[index]) {
            this.data[index].hobby = res.data;
          } else {
            this.data.push({hobby: res.data});
          }
        } else {
          this.data.industries = [{hobby: res.data}];
        }
      }
    }).catch((err) => {
      console.error('chooseHobby', err);
    });
    return await modal.present();
  }

}
