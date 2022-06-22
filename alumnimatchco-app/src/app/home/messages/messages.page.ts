import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiService } from 'src/app/_services/api.service';
import { NavController, ModalController } from '@ionic/angular';
import { DataService } from 'src/app/_services/data.service';
import { DetailMessageModalComponent } from 'src/app/_shared/detail-message-modal/detail-message-modal.component';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.page.html',
  styleUrls: ['./messages.page.scss'],
})
export class MessagesPage implements OnInit, OnDestroy {

  user: any;
  messages: any[];
  subscriptions: Subscription[] = [];

  constructor(
    private api: ApiService,
    private dataSv: DataService,
    private navCtrl: NavController,
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {
    this.getMessages();
    this.subscriptions.push(this.dataSv.msgRead.subscribe((res) => {
      this.messages.forEach((msg) => {
        if (msg.id === res) {
          msg.read = true;
        }
      });
    }));
    this.subscriptions.push(this.dataSv.userStatus.subscribe((res) => {
      this.user.unread_num = res.messages_count || 0;
    }));
  }

  ngOnDestroy() {
    this.subscriptions.forEach((el) => {
      el.unsubscribe();
    });
  }

  back() {
    this.navCtrl.navigateBack('/home');
  }

  getMessages() {
    this.api.get('message/users').subscribe((res: any) => {
      this.user = res.user;
      this.messages = res.messages;
      this.dataSv.updateMessageNum(res.user.unread_num);
    }, (err) => console.error('getMessages', err));
  }

  viewMessages($event) {
    console.log('viewMessages', $event);
    this.dataSv.alumni = $event;
    this.navCtrl.navigateForward(`home/messages/user/${$event.id}`);
  }

  async viewMessage(msg) {
    const modal = await this.modalCtrl.create({
      component: DetailMessageModalComponent,
      backdropDismiss: false,
      componentProps: {msg, user: msg.sender || msg.receiver},
    });
    modal.onWillDismiss().then(() => {
      msg.read = 1;
    });
    return await modal.present();
  }

  markAsRead(msg) {
    if (msg.read) {
      return;
    }
    this.dataSv.markAsReadMessage(msg.id).then(() => {
      msg.read = true;
    });
  }

  composeMsg() {
    this.navCtrl.navigateForward('/home/messages/compose');
  }
}
