import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-alumni-slides',
  templateUrl: './alumni-slides.component.html',
  styleUrls: ['./alumni-slides.component.scss'],
})
export class AlumniSlidesComponent implements OnInit {

  @Input() users: any[];
  slideOpts = {
    slidesPerView: 5
  };

  constructor() { }

  ngOnInit() {}

}
