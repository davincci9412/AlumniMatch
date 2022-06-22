import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { PipesModule } from 'src/app/_pipes/pipes.module';

import { HomePage } from './home.page';
import { HomeRoutingModule } from './home-routing.module';
import { DirectivesModule } from '../_directives/directives.module';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, HomeRoutingModule, DirectivesModule],
  declarations: [HomePage],
})
export class HomePageModule {}
