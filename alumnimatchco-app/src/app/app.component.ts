import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { PushService } from './_services/push.service';
import { Zoom } from '@ionic-native/zoom/ngx';
import { API_KEY, API_SECRET } from 'src/app/_config/zoom.config';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private push: PushService,
    private zoomService: Zoom
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      if (this.platform.is('android')) {
        this.statusBar.overlaysWebView(false);
        this.statusBar.backgroundColorByHexString('#000000');
      }
      this.splashScreen.hide();

      // intialize zoom
      this.zoomService.initialize(API_KEY, API_SECRET)
      .then((success: any) => console.log(success))
      .catch((error: any) => console.log(error));
    });
  }
}
