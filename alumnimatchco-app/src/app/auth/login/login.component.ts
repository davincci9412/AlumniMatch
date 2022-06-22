import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AuthService } from 'src/app/_services/auth.service';
import { UtilsService } from 'src/app/_services/utils.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {

  constructor(
    private navCtrl: NavController,
    private auth: AuthService,
    private utils: UtilsService
  ) { }

  ngOnInit() {
  }

  goBack() {
    this.navCtrl.navigateBack('auth');
  }

  login(social) {
    console.log('login', social);
    this.auth.login(social.type, social.id).subscribe((res: any) => {
      console.log('login', res);
      localStorage.setItem('token', res.token);
      if (res.user.verified_at) {
        localStorage.setItem('verified', res.user.activated_at);
        if (res.user.activated_at) {
          localStorage.setItem('activated', res.user.activated_at);
          this.navCtrl.navigateRoot('/');
        } else {
          this.navCtrl.navigateForward('/auth/inactive');
        }
      } else {
        this.navCtrl.navigateRoot('/profile');
      }
    }, (err) => {
      console.error('login', err);
      this.utils.presentToast(err.error.message || 'Sorry. You failed to log in AlumniMatch.');
    });
  }

}
