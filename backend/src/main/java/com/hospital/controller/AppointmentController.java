package com.hospital.controller;

import com.hospital.dto.ApiResponse;
import com.hospital.dto.AppointmentDto;
import com.hospital.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class AppointmentController {

    private final AppointmentService appointmentService;

    /**
     * Get appointment by ID
     */
    @GetMapping("/{appointmentId}")
    public ResponseEntity<?> getAppointmentById(@PathVariable Long appointmentId) {
        AppointmentDto appointment = appointmentService.getAppointmentById(appointmentId);
        return new ResponseEntity<>(
                new ApiResponse(true, "Appointment retrieved", appointment),
                HttpStatus.OK
        );
    }

    /**
     * Get appointments by doctor
     */
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<?> getAppointmentsByDoctor(
            @PathVariable Long doctorId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<?> appointments = appointmentService.getAppointmentsByDoctor(doctorId, pageable);
        return new ResponseEntity<>(
                new ApiResponse(true, "Appointments retrieved", appointments),
                HttpStatus.OK
        );
    }

    /**
     * Get appointments by patient
     */
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<?> getAppointmentsByPatient(
            @PathVariable Long patientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<?> appointments = appointmentService.getAppointmentsByPatient(patientId, pageable);
        return new ResponseEntity<>(
                new ApiResponse(true, "Appointments retrieved", appointments),
                HttpStatus.OK
        );
    }

    /**
     * Get appointments by status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<?> getAppointmentsByStatus(
            @PathVariable String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<?> appointments = appointmentService.getAppointmentsByStatus(status, pageable);
        return new ResponseEntity<>(
                new ApiResponse(true, "Appointments retrieved", appointments),
                HttpStatus.OK
        );
    }

    /**
     * Check doctor availability for specific date and time
     */
    @GetMapping("/doctor/{doctorId}/availability")
    public ResponseEntity<?> checkDoctorAvailability(
            @PathVariable Long doctorId,
            @RequestParam String date,
            @RequestParam String time) {
        boolean isAvailable = appointmentService.checkDoctorAvailability(doctorId, date, time);
        return new ResponseEntity<>(
                new ApiResponse(true, "Availability checked", 
                        java.util.Map.of("available", isAvailable)),
                HttpStatus.OK
        );
    }
}
