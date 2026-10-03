import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdBannerComponent } from './ad-banner.component';
import { AdSenseService } from '../../../core/services/adsense.service';

describe('AdBannerComponent', () => {
  let component: AdBannerComponent;
  let fixture: ComponentFixture<AdBannerComponent>;
  let adsenseService: AdSenseService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdBannerComponent],
      providers: [AdSenseService]
    }).compileComponents();

    fixture = TestBed.createComponent(AdBannerComponent);
    component = fixture.componentInstance;
    adsenseService = TestBed.inject(AdSenseService);
    fixture.detectChanges();
  });

  it('should render the Advertisement label compliant with Google AdSense policy', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Advertisement');
  });

  it('should render preview placeholder state when ads are not live', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(adsenseService.isLive()).toBe(false);
    expect(el.textContent).toContain('AdSense Ready');
    expect(el.querySelector('ins.adsbygoogle')).toBeNull();
  });

  it('should render ins.adsbygoogle tag when live ads are enabled', () => {
    adsenseService.updateConfig({
      publisherId: 'ca-pub-9999999999999999',
      enabled: true,
      slots: {
        inContent: '5555555555'
      }
    });
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(adsenseService.isLive()).toBe(true);
    const insTag = el.querySelector('ins.adsbygoogle');
    expect(insTag).toBeTruthy();
    expect(insTag?.getAttribute('data-ad-client')).toBe('ca-pub-9999999999999999');
  });
});
