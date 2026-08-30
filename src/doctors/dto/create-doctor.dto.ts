import { IsString, IsNotEmpty, IsInt } from 'class-validator';

export class CreateDoctorDto {
  @IsString()
  @IsNotEmpty()
  specialty!: string;

  @IsString()
  @IsNotEmpty()
  license!: string;

  @IsInt()
  userId!: number;
}