import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AuthService } from 'src/app/_services/auth.service';
import { ApiService } from 'src/app/_services/api.service';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.page.html',
  styleUrls: ['./leaderboard.page.scss'],
})
export class LeaderboardPage implements OnInit {

  user: any;
  users: any[];
  constructor(
    private navCtrl: NavController,
    private api: ApiService
  ) { }

  ngOnInit() {
    this.getLeaderboardData();
  }

  back() {
    this.navCtrl.navigateBack('/home');
  }

  getLeaderboardData() {
    this.api.get('alumni/leaderboard').subscribe((res: any) => {
      this.user = res.user;
      res.users.sort((a, b) => {
        return a.rank - b.rank;
      });
      this.users = res.users;
    }, (err) => console.error('getLeaderboardData', err));
  }

  viewProfile(user) {
    this.navCtrl.navigateForward('/home/user/' + user.id);
  }

}
