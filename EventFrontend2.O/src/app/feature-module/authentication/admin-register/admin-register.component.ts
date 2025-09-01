import { Component } from '@angular/core';
import { DataService } from 'src/app/core/core.index';

@Component({
  selector: 'app-admin-register',
  templateUrl: './admin-register.component.html',
  styleUrls: ['./admin-register.component.scss']
})
export class AdminRegisterComponent {
  option = '--Choose--';
  option1 = '--Choose--';
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
