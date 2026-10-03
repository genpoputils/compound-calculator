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

  it('should render nothing by default when ads are not live and placeholders are disabled', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(adsenseService.isLive()).toBe(false);
    expect(el.textContent?.trim()).toBe('');
    expect(el.querySelector('ins.adsbygoogle')).toBeNull();
  });

  it('should render preview placeholder state only when showPlaceholder is explicitly true', () => {
    adsenseService.updateConfig({
      showPlaceholder: true
    });
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(adsenseService.isLive()).toBe(false);
    expect(el.textContent).toContain('Advertisement');
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
    expect(el.textContent).toContain('Advertisement');
    const insTag = el.querySelector('ins.adsbygoogle');
    expect(insTag).toBeTruthy();
    expect(insTag?.getAttribute('data-ad-client')).toBe('ca-pub-9999999999999999');
  });
});
