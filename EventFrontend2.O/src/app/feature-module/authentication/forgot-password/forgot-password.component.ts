import { Component} from '@angular/core';
import { routes, DataService } from 'src/app/core/core.index';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent  {
  public routes = routes;
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
