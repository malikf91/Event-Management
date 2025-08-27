import 'zone.js/testing';
import { getTestBed, TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { NgxEditorModule } from 'ngx-editor';
import { of } from 'rxjs';
import { Lightbox } from 'ngx-lightbox';

// Define a default env for tests
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalAny: any = globalThis as any;
if (!globalAny.window) {
  globalAny.window = {} as any;
}
if (!globalAny.window.env) {
  globalAny.window.env = { backendUrl: 'http://localhost:3000' };
}

// Initialize the Angular testing environment.
getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());

// Shared mocks
const activatedRouteMock = {
  snapshot: { paramMap: convertToParamMap({}), queryParamMap: convertToParamMap({}) },
  params: of({}),
  queryParams: of({}),
  paramMap: of(convertToParamMap({})),
  queryParamMap: of(convertToParamMap({})),
};
const lightboxMock: Partial<Lightbox> = {
  open: () => {},
  close: () => {},
};

// Monkey-patch TestBed.configureTestingModule to always include common testing modules/schemas
const originalConfigureTestingModule = TestBed.configureTestingModule.bind(TestBed);
(TestBed as any).configureTestingModule = (moduleDef: any) => {
  moduleDef = moduleDef || {};
  moduleDef.imports = [
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    AngularEditorModule,
    NgxEditorModule,
    BsDatepickerModule.forRoot(),
    HttpClientTestingModule,
    RouterTestingModule,
    ToastrModule.forRoot(),
    ...(moduleDef.imports || [])
  ];
  moduleDef.schemas = [
    NO_ERRORS_SCHEMA,
    ...(moduleDef.schemas || [])
  ];
  moduleDef.providers = [
    { provide: ActivatedRoute, useValue: activatedRouteMock },
    { provide: Lightbox, useValue: lightboxMock },
    ...(moduleDef.providers || [])
  ];
  return originalConfigureTestingModule(moduleDef);
};
