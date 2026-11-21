import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [AppComponent],
    providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
  }));

  it('renderiza o cabeçalho e a área de navegação', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-header nav')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('router-outlet')).toBeTruthy();
  });
});
