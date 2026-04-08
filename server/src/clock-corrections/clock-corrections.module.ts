import { Module } from '@nestjs/common';
import { ClockCorrectionsController } from './clock-corrections.controller';
import { ClockCorrectionsService } from './clock-corrections.service';

@Module({
  controllers: [ClockCorrectionsController],
  providers: [ClockCorrectionsService],
})
export class ClockCorrectionsModule {}
