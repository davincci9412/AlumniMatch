import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ApiService } from '../_services/api.service';
import { FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { UtilsService } from '../_services/utils.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  verified = true;
  weights = {
    ps: 25,
    cl: 75
  }; // [PastSchool, CurrentLife];
  weightControl: FormControl = new FormControl(25);

  constructor(
    private nav: NavController,
    private api: ApiService,
    private utils: UtilsService
  ) { }

  ngOnInit() {
    this.getWeights();
    if (localStorage.verified) {
      this.verified = true;
    } else {
      this.verified = false;
    }
    this.weightControl.valueChanges.pipe(debounceTime(500)).subscribe((e) => {
      console.log('change weights', this.weights);
      this.saveWeights();
    });
  }

  getWeights() {
    this.api.get('user/weights', true).subscribe((res: any) => {
      console.log('user/weights', res);
      if (res) {
        this.weights = res;
      }
    }, (err) => {
      console.error('user/weights', err);
    });
  }

  changeWeight($event) {
    if ($event.target.value > 100) {
      this.weights.ps = 100;
      this.weights.cl = 0;
    } else if ($event.target.value < 0) {
      this.weights.ps = 0;
      this.weights.cl = 100;
    } else {
      this.weights.cl = 100 - this.weights.ps;
    }
  }

  saveWeights() {
    this.api.post('user/weights', this.weights).subscribe((res) => {
      console.log('saveWeights', res);
    }, (err) => {
      console.error('saveWeights', err);
    });
  }

  onSubmit() {
    this.api.get('user/completed', true).subscribe((res: any) => {
      console.log('user/completed', res);
      if (res.uncompleted && res.uncompleted.length) {
        this.utils.presentErrorAlert(
          `You must answer all questions in user registration before being able to fully Submit. Please finish registration, thanks!'
          ${res.uncompleted && res.uncompleted.length ? ('<br>Uncompleted: ' + res.uncompleted.join(', ')) : ''}`
        );
      } else {
        this.nav.navigateForward('/auth/final');
      }
    }, (err) => {
      console.error('user/completed', err);
    });
  }

  goProfileEdit(m: number) {
    switch (m) {
      case 0:
        this.nav.navigateForward('/profile/past-school');
        break;
      case 1:
        this.nav.navigateForward('/profile/current-life');
        break;
      case 2:
        this.nav.navigateForward('/profile/causes');
        break;
      default:
        break;
    }
  }

}
