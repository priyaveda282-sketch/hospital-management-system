package com.hospital.service;

import com.hospital.repository.UserRepository;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.PatientRepository;
import com.hospital.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;

    /**
     * Get admin dashboard statistics
     */
    public Map<String, Object> getAdminDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        stats.put("totalDoctors", doctorRepository.count());
        stats.put("totalPatients", patientRepository.count());
        stats.put("totalAppointments", appointmentRepository.count());
        stats.put("pendingAppointments", appointmentRepository.findByStatus("PENDING").size());
        stats.put("completedAppointments", appointmentRepository.findByStatus("COMPLETED").size());
        
        return stats;
    }

    /**
     * Get doctor dashboard statistics
     */
    public Map<String, Object> getDoctorDashboardStats(Long doctorId) {
        Map<String, Object> stats = new HashMap<>();
        
        stats.put("totalAppointments", appointmentRepository.findByDoctorId(doctorId).size());
        stats.put("pendingAppointments", appointmentRepository.findByDoctorIdAndStatus(doctorId, "PENDING").size());
        stats.put("approvedAppointments", appointmentRepository.findByDoctorIdAndStatus(doctorId, "APPROVED").size());
        stats.put("completedAppointments", appointmentRepository.findByDoctorIdAndStatus(doctorId, "COMPLETED").size());
        
        return stats;
    }

    /**
     * Get patient dashboard statistics
     */
    public Map<String, Object> getPatientDashboardStats(Long patientId) {
        Map<String, Object> stats = new HashMap<>();
        
        stats.put("totalAppointments", appointmentRepository.findByPatientId(patientId).size());
        stats.put("pendingAppointments", appointmentRepository.findByPatientIdAndStatus(patientId, "PENDING").size());
        stats.put("approvedAppointments", appointmentRepository.findByPatientIdAndStatus(patientId, "APPROVED").size());
        stats.put("completedAppointments", appointmentRepository.findByPatientIdAndStatus(patientId, "COMPLETED").size());
        
        return stats;
    }
}
