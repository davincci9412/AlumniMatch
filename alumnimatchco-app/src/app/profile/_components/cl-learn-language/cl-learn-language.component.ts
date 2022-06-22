import { Component, OnInit } from '@angular/core';
import { LANGUAGES } from 'src/app/_config/current-life.constant';
import { ModalController } from '@ionic/angular';
import { ApiService } from 'src/app/_services/api.service';
import { UtilsService } from 'src/app/_services/utils.service';

@Component({
  selector: 'app-cl-learn-language',
  templateUrl: './cl-learn-language.component.html',
  styleUrls: ['./cl-learn-language.component.scss'],
})
export class ClLearnLanguageComponent implements OnInit {

  selectLearnLanguageOption: any = {
    header: 'What languages are you trying to learn?',
    mode: 'md',
    cssClass: 'am-select-popup'
  };

  languages = LANGUAGES;
  data: any = {
    languages: [{}],
    ranges: {}
  };

  constructor(
    private modalCtrl: ModalController,
    private api: ApiService,
    private utils: UtilsService
  ) { }

  ngOnInit() {
    this.getLearnLanguages();
  }

  getLearnLanguages() {
    this.api.get('user/languages/learn', true).subscribe((res: any) => {
      console.log('getLearnLanguages', res);
      if (res.languages && res.languages.length) {
        this.data.languages = res.languages;
      }
      if (res.ranges) {
        this.data.ranges = res.ranges;
      }
    });
  }

  addLanguage() {
    console.log('data', this.data);
    if (this.data.languages[this.data.languages.length - 1] && this.data.languages[this.data.languages.length - 1].language !== undefined) {
      this.data.languages.push({});
    }
  }

  changeSelction($event) {
    console.log('event', $event);
  }

  onSubmit() {
    const filteredLanguages = this.data.languages.filter(x => {
      return x.language !== undefined;
    });
    this.api.post('user/languages/learn', {
      languages: filteredLanguages,
      ranges: this.data.ranges
    }, true).subscribe((res) => {
      console.log('saveLearnLanguages', res);
      this.modalCtrl.dismiss(true);
    });
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }
}
