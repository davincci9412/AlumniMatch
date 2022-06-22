import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-alumni',
  templateUrl: './alumni.component.html',
  styleUrls: ['./alumni.component.scss'],
})
export class AlumniComponent implements OnInit {

  @Input() user: any;
  @Input() detailIcon = true;
  @Output() profileClick: EventEmitter<any> = new EventEmitter();
  constructor() { }

  ngOnInit() {
  }

  viewProfile() {
    this.profileClick.emit(this.user);
  }

}
