import { IsInt, IsDateString } from 'class-validator';

export class CreateAppointmentDto {
  @IsInt()
  doctorId!: number;

  @IsInt()
  patientId!: number;

  @IsDateString()
  startTime!: string;
}