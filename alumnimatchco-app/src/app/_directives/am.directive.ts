import { Directive, ElementRef, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appAM]'
})
export class AMDirective {

  constructor(
    el: ElementRef,
    private renderer: Renderer2
  ) {
    let theme: any;
    if (localStorage.college) {
      theme = JSON.parse(localStorage.college);
    } else {
      theme = {
        color1: '09548a',
        color2: 'ffffff',
        banner: 'assets/imgs/banner.png',
        logo1: 'logo1_default.png',
        logo2: 'logo2_default.png',
        slogal: 'Alumni Match',
        acronym: 'AM'
      };
    }
    let style;
    switch (el.nativeElement.tagName) {
      case 'ION-TOOLBAR':
        style = `
          --background: #${theme.color1};
          color: #${theme.color2};
        `;
        break;
      case 'ION-FOOTER':
        style = `
          background: #${theme.color1};
        `;
        break;
      case 'ION-ITEM':
        style = `
          --background: #${theme.color1};
          --background-activated: #${theme.color1};
          --background-focused: #${theme.color1};
          --background-hover: #${theme.color1};
          --color: #${theme.color2};
        `;
        break;
      case 'ION-BUTTON':
        style = `
          --background: #${theme.color1};
          --background-activated: #${theme.color1};
          --background-focused: #${theme.color1};
          --background-hover: #${theme.color1};
          color: #${theme.color2};
        `;
        break;
      case 'ION-FAB-BUTTON':
        style = `
          --background: #${theme.color1};
          --background-activated: #${theme.color1};
          --background-focused: #${theme.color1};
          --background-hover: #${theme.color1};
          color: #${theme.color2};
        `;
        break;
      case 'ION-RANGE':
        style = `
          --bar-background-active: #${theme.color1};
          --knob-background: #${theme.color1};
        `;
        break;
      case 'ION-ICON':
        style = `
          color: #${theme.color1};
        `;
        break;
      case 'ION-BADGE':
        style = `
          color: #${theme.color2};
          background: #${theme.color1};
        `;
        break;
      case 'ION-TOGGLE':
        style = `
          --background-checked: #${theme.color1};
        `;
        break;
      case 'ION-CHECKBOX':
        style = `
          --background-checked: #${theme.color1};
          --border-color-checked: #${theme.color1};
        `;
        break;
      case 'ION-RADIO':
        style = `
          --color-checked: #${theme.color1};
        `;
        break;
      case 'ION-CARD':
        style = `
          --background: #${theme.color1};
        `;
        break;
      case 'ION-SEGMENT-BUTTON':
        style = `
          --background-checked: #${theme.color1};
          --background-focused: #${theme.color1}22;
          --background-hover: #${theme.color1}22;
          --border-color: #${theme.color1};
          --color: #${theme.color1};
        `;
        break;
      case 'ION-CONTENT':
        style = `
          --background: #${theme.color1}
        `;
        break;
      case 'DIV':
        style = `
          background: #${theme.color1}
        `;
        break;
      case 'IMG':
        style = `
          background: #${theme.color1}
        `;
        break;
      default:
        style = `
          color: #${theme.color1}
        `;
        break;
    }
    this.renderer.setAttribute(el.nativeElement, 'style', style);
  }

}
