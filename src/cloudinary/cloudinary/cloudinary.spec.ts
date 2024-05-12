import { Test, TestingModule } from '@nestjs/testing';
import { CloudinaryProvider } from './cloudinary';
import { CloudinaryModule } from '../cloudinary.module';

describe('Cloudinary', () => {
  let provider: CloudinaryProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CloudinaryModule],
    }).compile();

    provider = module.get<Cloudinary>(Cloudinary);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
