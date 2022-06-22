import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ApiService } from 'src/app/_services/api.service';
import { UtilsService } from 'src/app/_services/utils.service';

@Component({
  selector: 'app-send-message-modal',
  templateUrl: './send-message-modal.component.html',
  styleUrls: ['./send-message-modal.component.scss'],
})
export class SendMessageModalComponent implements OnInit {

  msgForm: FormGroup;

  constructor(
    private modalCtrl: ModalController,
    private formBuilder: FormBuilder,
    private navParams: NavParams,
    private api: ApiService,
    private utils: UtilsService
  ) { }

  ngOnInit() {
    const rid = this.navParams.get('rid');
    console.log('rid', rid);
    this.msgForm = this.formBuilder.group({
      title: new FormControl('', [Validators.required, Validators.maxLength(50)]),
      content: new FormControl('', [Validators.required, Validators.maxLength(144)]),
      rid: new FormControl(rid, Validators.required)
    });
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  onSubmit() {
    this.api.post('message/send', this.msgForm.value).subscribe((res) => {
      console.log('sendMessage', res);
      this.modalCtrl.dismiss(res);
    }, (err) => {
      console.error('sendMessage', err);
      if (err.status === 403) {
        this.utils.presentErrorAlert(err.error.message);
      }
      this.modalCtrl.dismiss();
    });
  }

}
