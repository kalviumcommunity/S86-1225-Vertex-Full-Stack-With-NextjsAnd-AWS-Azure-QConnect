-- Add indexes to speed up frequent queries

-- Add index on Doctor.specialty
CREATE INDEX "Doctor_specialty_idx" ON "Doctor"("specialty");

-- Add composite index on Queue(doctorId, date)
CREATE INDEX "Queue_doctorId_date_idx" ON "Queue"("doctorId", "date");

-- Add index on Appointment.userId
CREATE INDEX "Appointment_userId_idx" ON "Appointment"("userId");

-- Add index on Appointment.status
CREATE INDEX "Appointment_status_idx" ON "Appointment"("status");
