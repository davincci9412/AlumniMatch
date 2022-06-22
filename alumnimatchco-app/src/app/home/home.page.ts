import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { AuthService } from '../_services/auth.service';
import { NavController, MenuController } from '@ionic/angular';
import { PushService } from '../_services/push.service';
import { DataService } from '../_services/data.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {

  pages: any[] = [
    {
      title: 'Home',
      link: '/home/dashboard',
      icon: 'ios-home'
    },
    {
      title: 'Search',
      link: '/home/search',
      icon: 'search'
    },
    {
      title: 'Map',
      link: '/home/nearme',
      icon: 'pin'
    },
    {
      title: 'Profile',
      link: '/profile/view',
      icon: 'person'
    },
    {
      title: 'Messages',
      link: '/home/messages',
      icon: 'mail'
    },
    {
      title: 'Friends',
      link: '/home/friends',
      icon: 'md-contacts'
    },
    {
      title: 'Bulletin Board',
      link: '/home/bulletinboard',
      icon: 'calendar'
    },
    {
      title: 'Leaderboard',
      link: '/home/leaderboard',
      icon: 'speedometer'
    },
    {
      title: 'Invite Code',
      link: '/home/invite-code',
      icon: 'code-working'
    },
    // {
    //   title: 'Twitter Pulse',
    //   link: '/home/tweets',
    //   icon: 'logo-twitter'
    // },
    // {
    //   title: 'Photo Stream',
    //   link: '/home/photo-stream',
    //   icon: 'images'
    // },
    // {
    //   title: 'Invited Users',
    //   link: '/home/invites',
    //   icon: 'md-people'
    // },
    {
      title: 'Support',
      link: '/privacy',
      icon: 'md-help'
    },
    {
      title: 'Log out',
      link: '/auth',
      icon: 'md-log-out'
    }
  ];

  user: any;
  subscription: any;

  constructor(
    private auth: AuthService,
    private nav: NavController,
    private menuCtrl: MenuController,
    private push: PushService,
    private cdRef: ChangeDetectorRef,
    private dataSv: DataService
  ) {}

  ngOnInit(): void {
    this.subscription = this.dataSv.userStatus.subscribe((u) => {
      console.log('userStatus', u);
      this.user = u;
      this.cdRef.detectChanges();
    });
    if (!localStorage.device_token) {
      this.push.initialize();
      this.push.getIds();
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onClickMenu(page) {
    this.menuCtrl.close();
    if (page.title === 'Profile') {
      return;
    }
    if (page.title === 'Log out') {
      this.auth.signout();
    } else {
      this.nav.navigateForward(page.link);
    }
    console.log('page', page);
  }

  viewProfile() {
    console.log('view profile');
    this.nav.navigateForward('/profile/view');
  }

  editProfile() {
    console.log('edit profile');
    this.nav.navigateForward('/profile');
    this.menuCtrl.close();
  }

}
