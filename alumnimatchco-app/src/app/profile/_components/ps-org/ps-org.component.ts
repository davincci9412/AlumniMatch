import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { SelectModalComponent } from 'src/app/_shared/select-modal/select-modal.component';
import { ApiService } from 'src/app/_services/api.service';
import { ORGANIZATIONS } from 'src/app/_config/organizations.constant';
import { UtilsService } from 'src/app/_services/utils.service';

@Component({
  selector: 'app-ps-org',
  templateUrl: './ps-org.component.html',
  styleUrls: ['./ps-org.component.scss'],
})
export class PsOrgComponent implements OnInit {

  data: any = [{}];
  ALL_ORGS: any[] = ORGANIZATIONS;

  constructor(
    private modalCtrl: ModalController,
    private api: ApiService,
    private utils: UtilsService
  ) { }

  ngOnInit() {
    this.getUserOrgs();
  }

  getUserOrgs() {
    this.api.get('user/orgs', true).subscribe((res: any[]) => {
      if (res.length) {
        this.data = res;
      }
    }, (err) => {
      console.error('getUserOrgs', err);
    });
  }

  async selectOrg(org, index) {
    const selectedItem = org;
    const modal = await this.modalCtrl.create({
      component: SelectModalComponent,
      componentProps: {
        items: this.ALL_ORGS,
        selectedItem: selectedItem ? selectedItem.id : null,
        multiple: false,
        title: 'Select organization'
      },
      cssClass: 'select-modal-css',
      backdropDismiss: false
    });
    modal.onDidDismiss().then((res) => {
      console.log('chooseOrg', res);
      if (res.data) {
        this.data[index] = res.data;
      }
    }).catch((err) => {
      console.error('chooseOrg', err);
    });
    return await modal.present();
  }

  addOrg() {
    if (this.data.length > 0 && !this.data[this.data.length - 1].id) {
        return;
    }
    this.data.push({});
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  onSubmit() {
    const filteredOrgs = this.data.filter(x => !!x.id);
    if (!filteredOrgs.length) {
      this.utils.presentErrorAlert('Please select organization.');
      return false;
    }
    this.api.post('user/orgs', {orgs: filteredOrgs}, true).subscribe((res) => {
      console.log('saveUserOrgs', res);
      this.modalCtrl.dismiss(true);
    }, (err) => {
      console.error('saveUserOrgs', err);
    });
  }

}
