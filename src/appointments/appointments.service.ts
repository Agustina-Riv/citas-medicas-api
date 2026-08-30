import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAppointmentDto) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id: dto.doctorId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor no encontrado');
    }

    const patient = await this.prisma.user.findUnique({
      where: { id: dto.patientId },
    });

    if (!patient) {
      throw new NotFoundException('Paciente no encontrado');
    }

    const overlappingAppointment = await this.prisma.appointment.findFirst({
      where: {
        doctorId: dto.doctorId,
        startTime: new Date(dto.startTime),
        status: { not: 'CANCELLED' },
      },
    });

    if (overlappingAppointment) {
      throw new ConflictException(
        'Ese horario ya está ocupado para este doctor',
      );
    }

    return this.prisma.appointment.create({
      data: {
        doctorId: dto.doctorId,
        patientId: dto.patientId,
        startTime: new Date(dto.startTime),
      },
    });
  }

  findAll() {
    return this.prisma.appointment.findMany({
      include: {
        doctor: { select: { id: true, specialty: true } },
        patient: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async findOne(id: number) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        doctor: { select: { id: true, specialty: true } },
        patient: { select: { id: true, name: true, email: true } },
      },
    });

    if (!appointment) {
      throw new NotFoundException('Turno no encontrado');
    }

    return appointment;
  }

  async update(id: number, dto: UpdateAppointmentDto) {
    await this.findOne(id);
    return this.prisma.appointment.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.appointment.delete({ where: { id } });
  }
}
