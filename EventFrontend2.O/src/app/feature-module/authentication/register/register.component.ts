import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, routes, DataService } from 'src/app/core/core.index';
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent  {
  public isValidConfirmPassword = false;
  public CustomControler: undefined;
  public routes = routes;
  companySettings: any = {};

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
    confirmPassword: new FormControl('', [Validators.required]),
  });

  get f() {
    return this.form.controls;
  }

  constructor(private router: Router, private auth: AuthService, private data: DataService) {
    this.loadCompanySettings();
  }

  
  submit() {
    if (this.form.value.password != this.form.value.confirmPassword) {
      this.isValidConfirmPassword = true;
    } else {
      this.isValidConfirmPassword = false;
      // this.auth.login();
    }
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
