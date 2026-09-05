# Citas Médicas API

API REST para la gestión de turnos médicos, desarrollada con NestJS, TypeScript, Prisma y PostgreSQL. Permite el registro y autenticación de usuarios (pacientes, doctores y administradores), la gestión de perfiles de doctores, y la reserva de turnos con validación automática de disponibilidad horaria.

## Regla de negocio principal

No es posible reservar dos turnos que se superpongan para un mismo doctor. Cada turno tiene una duración fija de 30 minutos; al intentar reservar un horario ya ocupado, la API rechaza la operación con un error `409 Conflict`.

## Tecnologías

- **NestJS 11** + TypeScript
- **PostgreSQL** como base de datos
- **Prisma ORM** (v7, con adaptador `@prisma/adapter-pg`)
- **JWT** (access + refresh tokens) para autenticación
- **bcrypt** para el hasheo de contraseñas
- **Helmet**, **CORS** y **rate limiting** (`@nestjs/throttler`) como capas de seguridad

## Requisitos previos

- Node.js 20+
- pnpm
- PostgreSQL instalado y corriendo localmente (o accesible remotamente)

## Instalación

1. Cloná el repositorio:
```bash
   git clone https://github.com/Agustina-Riv/citas-medicas-api.git
   cd citas-medicas-api
```

2. Instalá las dependencias:
```bash
   pnpm install
```

3. Creá una base de datos en PostgreSQL:
```sql
   CREATE DATABASE citas_medicas_db;
```

4. Copiá el archivo de variables de entorno de ejemplo y completalo con tus datos:
```bash
   cp .env.example .env
```

5. Aplicá las migraciones de Prisma:
```bash
   npx prisma migrate dev
```

6. Iniciá el servidor en modo desarrollo:
```bash
   pnpm run start:dev
```

La API queda disponible en `http://localhost:3000`.

## Endpoints

Todas las rutas (excepto `/auth/register` y `/auth/login`) requieren un `accessToken` válido en el header:


### Autenticación

#### `POST /auth/register`
Registra un nuevo usuario (rol `USER` por defecto).

**Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123",
  "name": "Nombre Apellido"
}
```

**Respuesta `201`:** datos del usuario creado (sin la contraseña).

---

#### `POST /auth/login`
Inicia sesión y devuelve los tokens de acceso.

**Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}
```

**Respuesta `200`:**
```json
{
  "accessToken": "...",
  "refreshToken": "..."
}
```

---

#### `POST /auth/refresh`
Genera un nuevo par de tokens a partir de un `refreshToken` válido.

**Header:** `Authorization: Bearer <refreshToken>`

**Respuesta `200`:** nuevo `accessToken` y `refreshToken`.

---

#### `POST /auth/logout`
Invalida el `refreshToken` del usuario autenticado.

**Header:** `Authorization: Bearer <refreshToken>`

**Respuesta `200`:**
```json
{
  "message": "Sesión cerrada correctamente"
}
```

### Doctors

#### `POST /doctors`
Crea un perfil de doctor vinculado a un usuario existente. El usuario pasa automáticamente a tener rol `DOCTOR`.

**Body:**
```json
{
  "specialty": "Cardiología",
  "license": "MP-12345",
  "userId": 1
}
```

**Respuesta `201`:** datos del doctor creado.

---

#### `GET /doctors`
Lista todos los doctores, incluyendo datos básicos del usuario asociado.

**Respuesta `200`:** array de doctores.

---

#### `GET /doctors/:id`
Obtiene un doctor por su id.

**Respuesta `200`:** datos del doctor. `404` si no existe.

---

#### `PATCH /doctors/:id`
Actualiza los datos de un doctor.

**Body:** cualquier subconjunto de `{ specialty, license, userId }`.

**Respuesta `200`:** doctor actualizado.

---

#### `DELETE /doctors/:id`
Elimina un doctor.

**Respuesta `200`:** doctor eliminado.

### Appointments

#### `POST /appointments`
Reserva un turno para un paciente con un doctor. Valida que el doctor y el paciente existan, y que **no haya ya un turno reservado para ese doctor en el mismo horario**.

**Body:**
```json
{
  "doctorId": 1,
  "patientId": 2,
  "startTime": "2026-09-15T14:30:00.000Z"
}
```

**Respuesta `201`:** turno creado, con estado `PENDING`.

**Respuesta `409`** (horario ocupado):
```json
{
  "message": "Ese horario ya está ocupado para este doctor",
  "error": "Conflict",
  "statusCode": 409
}
```

---

#### `GET /appointments`
Lista todos los turnos, incluyendo datos del doctor y del paciente.

**Respuesta `200`:** array de turnos.

---

#### `GET /appointments/:id`
Obtiene un turno por su id.

**Respuesta `200`:** datos del turno. `404` si no existe.

---

#### `PATCH /appointments/:id`
Actualiza un turno (por ejemplo, cambiar su `status` a `CONFIRMED` o `CANCELLED`).

**Body:** cualquier subconjunto de `{ doctorId, patientId, startTime, status }`.

**Respuesta `200`:** turno actualizado.

---

#### `DELETE /appointments/:id`
Elimina un turno.

**Respuesta `200`:** turno eliminado.