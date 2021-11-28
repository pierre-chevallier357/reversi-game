import { TestBed } from '@angular/core/testing';

import { ReversiGameEngineService } from './reversi-game-engine.service';

describe('ReversiGameEngineService', () => {
  let service: ReversiGameEngineService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReversiGameEngineService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
