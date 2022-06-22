import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ApiService } from 'src/app/_services/api.service';
import {
  WORK_FORS,
  EMPLOYMENT_STATUSES,
  WORK_TITLES,
  HIRE_FORS,
  GIG_PROJECTS,
  HIRE_MONTHLY,
  OWN_BUSINESSES,
  BUYING_STUFFS,
  CUSTOMERS,
  WEALTHS,
  REVIEW_PLANS
} from 'src/app/_config/current-life.constant';
import { PickLocationModalComponent } from 'src/app/_shared/pick-location-modal/pick-location-modal.component';
import { SelectModalComponent } from 'src/app/_shared/select-modal/select-modal.component';
import { INDUSTRIES } from 'src/app/_config/industries.constant';

@Component({
  selector: 'app-cl-work-career',
  templateUrl: './cl-work-career.component.html',
  styleUrls: ['./cl-work-career.component.scss'],
})
export class ClWorkCareerComponent implements OnInit {

  data: any = {};

  work_fors = WORK_FORS;
  selectWorkForOption: any = {
    header: 'Select type',
    mode: 'md',
    cssClass: 'am-select-popup'
  };
  employment_statuses = EMPLOYMENT_STATUSES;
  selectEmploymentStatusOption: any = {
    header: 'Select status',
    mode: 'md',
    cssClass: 'am-select-popup'
  };
  work_titles = WORK_TITLES;
  selectWorkTItleOption: any = {
    header: 'Select title at work',
    mode: 'md',
    cssClass: 'am-select-popup'
  };
  hire_monthly = HIRE_MONTHLY;
  selectHireCountOption: any = {
    header: 'Select counts',
    mode: 'md',
    cssClass: 'am-select-popup'
  };
  hire_fors = HIRE_FORS;
  selectHireForOption: any = {
    header: 'Are you hiring for...',
    mode: 'md',
    cssClass: 'am-select-popup'
  };
  gig_projects = GIG_PROJECTS;
  selectGIGCountOption: any = {
    header: 'Select counts',
    mode: 'md',
    cssClass: 'am-select-popup'
  };
  own_businesses = OWN_BUSINESSES;
  selectOwnBusinessOption: any = {
    header: 'Have you ever wanted to own your own business?',
    mode: 'md',
    cssClass: 'am-select-popup'
  };
  buying_stuffs = BUYING_STUFFS;
  selectStuffOption: any = {
    header: 'Select buying stuff',
    mode: 'md',
    cssClass: 'am-select-popup'
  };
  customers = CUSTOMERS;
  selectCustomerOption: any = {
    header: 'Select kind of customer',
    mode: 'md',
    cssClass: 'am-select-popup'
  };
  ALL_INDUSTRIES = INDUSTRIES;
  selectNetWealthOption: any = {
    header: 'Select your net wealth category',
    mode: 'md',
    cssClass: 'am-select-popup'
  };
  wealths = WEALTHS;
  selectReviewPlanOption: any = {
    header: 'Select reviewing business plans',
    mode: 'md',
    cssClass: 'am-select-popup'
  };
  review_plans = REVIEW_PLANS;
  constructor(
    private modalCtrl: ModalController,
    private api: ApiService
  ) { }

  ngOnInit() {
    this.getWorkCareer();
  }

  getWorkCareer() {
    this.api.get('user/work-career', true).subscribe((res) => {
      console.log('user/work-career', res);
      this.data = res;
    }, (err) => {
      console.error('user/work-career', err);
    });
  }

  async addCity(type: any) {
    const modal = await this.modalCtrl.create({
      component: PickLocationModalComponent,
      backdropDismiss: false
    });
    modal.onWillDismiss().then((result) => {
      if (result && result.data) {
        console.log('result', result.data);
        const position = {
          country: result.data.country,
          state: result.data.state,
          city: result.data.city
        };
        switch (type) {
          case 'business':
            if (this.data.business_cities) {
              this.data.business_cities.push(position);
            } else {
              this.data.business_cities = [position];
            }
            break;
          case 'travel':
            if (this.data.travel_cities) {
              this.data.travel_cities.push(position);
            } else {
              this.data.travel_cities = [position];
            }
            break;
          default:
            break;
        }
      }
    });
    return await modal.present();
  }

  async selectIndustry(index) {
    const modal = await this.modalCtrl.create({
      component: SelectModalComponent,
      componentProps: {
        items: this.ALL_INDUSTRIES,
        selectedItem: this.data.industries && this.data.industries[index] ? this.data.industries[index].id : null,
        multiple: false,
        title: 'Select industry'
      },
      cssClass: 'select-modal-css',
      backdropDismiss: false
    });
    modal.onDidDismiss().then((res) => {
      console.log('chooseIndustry', res);
      if (res.data) {
        if (this.data.industries) {
          if (this.data.industries[index]) {
            this.data.industries[index] = res.data;
          } else {
            this.data.industries.push(res.data);
          }
        } else {
          this.data.industries = [res.data];
        }
      }
    }).catch((err) => {
      console.error('chooseIndustry', err);
    });
    return await modal.present();
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  onSubmit() {
    this.api.post('user/work-career', this.data, true).subscribe((res) => {
      console.log('user/work-career', res);
      this.modalCtrl.dismiss(true);
    }, (err) => {
      console.error('user/work-career', err);
    });
  }
}
