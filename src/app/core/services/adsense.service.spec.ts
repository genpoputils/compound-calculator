import { TestBed } from '@angular/core/testing';
import { AdSenseService, DEFAULT_ADSENSE_CONFIG } from './adsense.service';

describe('AdSenseService', () => {
  let service: AdSenseService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AdSenseService]
    });
    service = TestBed.inject(AdSenseService);
  });

  it('should initialize with default config (disabled and empty publisherId)', () => {
    expect(service.config()).toEqual(DEFAULT_ADSENSE_CONFIG);
    expect(service.isLive()).toBe(false);
    expect(service.publisherId()).toBe('');
  });

  it('should update config and compute isLive state correctly', () => {
    service.updateConfig({
      publisherId: 'ca-pub-1234567890123456',
      enabled: true,
      slots: {
        topLeaderboard: '1111111111',
        inContent: '2222222222'
      }
    });

    expect(service.publisherId()).toBe('ca-pub-1234567890123456');
    expect(service.isLive()).toBe(true);
    expect(service.config().slots.topLeaderboard).toBe('1111111111');
  });

  it('should remain not live when enabled is false even if publisherId is set', () => {
    service.updateConfig({
      publisherId: 'ca-pub-1234567890123456',
      enabled: false
    });

    expect(service.isLive()).toBe(false);
  });
});
