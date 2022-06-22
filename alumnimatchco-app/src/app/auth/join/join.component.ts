import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AuthService } from 'src/app/_services/auth.service';
import { UtilsService } from 'src/app/_services/utils.service';

@Component({
  selector: 'app-join',
  templateUrl: './join.component.html',
  styleUrls: ['./join.component.scss'],
})
export class JoinComponent implements OnInit {

  constructor(
    private navCtrl: NavController,
    private auth: AuthService,
    private utils: UtilsService
  ) { }

  ngOnInit() {}

  goBack() {
    this.navCtrl.navigateBack('auth');
  }

  viewPrivacy() {
    this.navCtrl.navigateForward('/privacy');
  }

  join(data) {
    this.auth.isRegisteredUser(data.type, data.id).subscribe((res) => {
      if (res) {
        sessionStorage.setItem('user', JSON.stringify(data));
        this.navCtrl.navigateForward(`auth/verify-code/${data.type}`);
      }
    }, (err) => {
      this.utils.presentErrorAlert(err.error.message || 'Sorry. error occured in this step.');
    });
  }

}
