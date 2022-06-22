import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ApiService } from 'src/app/_services/api.service';

@Component({
  selector: 'app-final',
  templateUrl: './final.component.html',
  styleUrls: ['./final.component.scss'],
})
export class FinalComponent implements OnInit {

  completed = 0;
  constructor(
    private nav: NavController,
    private api: ApiService
  ) { }

  ngOnInit() {
  }

  goBack() {
    this.nav.navigateBack('/profile');
  }

  onSubmit() {
    this.api.get('user/activate', true).subscribe((res) => {
      if (res) {
        localStorage.setItem('verified', JSON.stringify(new Date()));
        localStorage.setItem('activated', JSON.stringify(new Date()));
        this.nav.navigateRoot('/home');
      }
    }, (err) => {
      console.error('user/activate', err);
    });
  }
}
