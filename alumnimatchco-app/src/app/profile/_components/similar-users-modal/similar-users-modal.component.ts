import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ApiService } from 'src/app/_services/api.service';

@Component({
  selector: 'app-similar-users-modal',
  templateUrl: './similar-users-modal.component.html',
  styleUrls: ['./similar-users-modal.component.scss'],
})
export class SimilarUsersModalComponent implements OnInit {

  category: any;
  cid: any;
  users: any[] = [];

  is_load = 0;
  constructor(
    private api: ApiService,
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {
    console.log('category', this.category);
    this.getSimilarUsers();
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  getSimilarUsers() {
    this.is_load = 1;
    this.api.get(`alumni/similar/${this.category}/${this.cid}?count=${this.users.length}`).subscribe((res: any[]) => {
      this.users = this.users.concat(res);
      if (res.length < 20) {
        this.is_load = 2;
      } else {
        this.is_load = 0;
      }
    });
  }
}
