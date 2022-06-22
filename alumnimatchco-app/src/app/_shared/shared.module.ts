import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SelectModalComponent } from './select-modal/select-modal.component';
import { DirectivesModule } from '../_directives/directives.module';
import { PickLocationModalComponent } from './pick-location-modal/pick-location-modal.component';
import { environment } from 'src/environments/environment';
import { AgmCoreModule } from '@agm/core';
import { PipesModule } from '../_pipes/pipes.module';

import { AlumniSlidesComponent } from './alumni-slides/alumni-slides.component';
import { AlumniSmComponent } from './alumni-sm/alumni-sm.component';
import { MessageComponent } from './message/message.component';
import { AlumniComponent } from './alumni/alumni.component';
import { LocationOptionModalComponent } from './location-option-modal/location-option-modal.component';
import { SendMessageModalComponent } from './send-message-modal/send-message-modal.component';
import { DetailMessageModalComponent } from './detail-message-modal/detail-message-modal.component';
import { AlumniLoadingComponent } from './alumni-loading/alumni-loading.component';
import { AlumniModalComponent } from './alumni-modal/alumni-modal.component';
import { SelectAlumniModalComponent } from './select-alumni-modal/select-alumni-modal.component';
import { LoadingComponent } from './loading/loading.component';

@NgModule({
  declarations: [
    SelectModalComponent,
    PickLocationModalComponent,
    AlumniSlidesComponent,
    AlumniSmComponent,
    MessageComponent,
    AlumniComponent,
    LocationOptionModalComponent,
    SendMessageModalComponent,
    DetailMessageModalComponent,
    AlumniLoadingComponent,
    AlumniModalComponent,
    SelectAlumniModalComponent,
    LoadingComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    DirectivesModule,
    AgmCoreModule.forRoot({
      apiKey: environment.GOOGLEMAP_APIKEY,
      libraries: ['places'],
    }),
    PipesModule,
  ],
  entryComponents: [SelectModalComponent, PickLocationModalComponent, LocationOptionModalComponent, SendMessageModalComponent, DetailMessageModalComponent, AlumniModalComponent, SelectAlumniModalComponent],
  exports: [
    SelectModalComponent,
    PickLocationModalComponent,
    AlumniSlidesComponent,
    AlumniSmComponent,
    MessageComponent,
    AlumniComponent,
    LocationOptionModalComponent,
    SendMessageModalComponent,
    DetailMessageModalComponent,
    AlumniLoadingComponent,
    AlumniModalComponent,
    SelectAlumniModalComponent,
    LoadingComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SharedModule {}
