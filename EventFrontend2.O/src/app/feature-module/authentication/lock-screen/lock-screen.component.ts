import { Component} from '@angular/core';
import { DataService } from 'src/app/core/core.index';

@Component({
  selector: 'app-lock-screen',
  templateUrl: './lock-screen.component.html',
  styleUrls: ['./lock-screen.component.scss']
})
export class LockScreenComponent  {
  companySettings: any = {};

  constructor(private data: DataService) {
    this.loadCompanySettings();
  }

  loadCompanySettings() {
    this.data.getCompanySettings().subscribe((res: any) => {
      if(res.data.length > 0) {
        this.companySettings = res.data[0];
        localStorage.setItem('companySettings', JSON.stringify(res.data[0]));
      } else {
        this.companySettings = {};
        localStorage.setItem('companySettings', JSON.stringify({}));
      }
      console.log('Company Settings', this.companySettings);
    });
  }
}
