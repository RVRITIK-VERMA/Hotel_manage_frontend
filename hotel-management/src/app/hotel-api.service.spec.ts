import { TestBed } from '@angular/core/testing';

import { HotelApiService } from './hotel-api.service';

describe('HotelApiService', () => {
  let service: HotelApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HotelApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
