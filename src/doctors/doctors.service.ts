import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';

@Injectable()
export class DoctorsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateDoctorDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const existingDoctor = await this.prisma.doctor.findUnique({
      where: { userId: dto.userId },
    });

    if (existingDoctor) {
      throw new ConflictException('Este usuario ya tiene un perfil de doctor');
    }

    const doctor = await this.prisma.doctor.create({
      data: dto,
    });

    await this.prisma.user.update({
      where: { id: dto.userId },
      data: { role: 'DOCTOR' },
    });

    return doctor;
  }

  findAll() {
    return this.prisma.doctor.findMany({
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  }

  async findOne(id: number) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor no encontrado');
    }

    return doctor;
  }

  async update(id: number, dto: UpdateDoctorDto) {
    await this.findOne(id);
    return this.prisma.doctor.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.doctor.delete({ where: { id } });
  }
}
