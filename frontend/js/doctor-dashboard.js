// Doctor Dashboard JavaScript

let doctorToken = localStorage.getItem('jwtToken');
let currentAppointmentId = null;
let currentPatientId = null;

// Check if user is logged in and has doctor role
window.addEventListener('load', () => {
    const userRole = localStorage.getItem('userRole');
    if (!doctorToken || userRole !== 'DOCTOR') {
        window.location.href = '../login.html';
    }
    loadDashboardData();
});

/**
 * Load all dashboard data
 */
async function loadDashboardData() {
    await loadDashboardStats();
    await loadAppointments();
    await loadPatients();
}

/**
 * Load dashboard statistics
 */
async function loadDashboardStats() {
    try {
        const userId = localStorage.getItem('userId');
        const response = await apiClient.get(`/doctor/dashboard`, {
            headers: { 'Authorization': `Bearer ${doctorToken}` }
        });
        
        if (response.data.success) {
            const stats = response.data.data;
            document.getElementById('totalAppointments').textContent = stats.totalAppointments || 0;
            document.getElementById('pendingAppointments').textContent = stats.pendingAppointments || 0;
            document.getElementById('approvedAppointments').textContent = stats.approvedAppointments || 0;
            document.getElementById('completedAppointments').textContent = stats.completedAppointments || 0;
        }
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        showToast('Error loading statistics', 'danger');
    }
}

/**
 * Load appointments
 */
async function loadAppointments() {
    try {
        const response = await apiClient.get('/doctor/appointments', {
            headers: { 'Authorization': `Bearer ${doctorToken}` }
        });
        
        if (response.data.success) {
            const appointments = response.data.data;
            let html = '';
            
            appointments.forEach(appointment => {
                html += `
                    <tr>
                        <td>${appointment.id}</td>
                        <td>${appointment.patient.user.name}</td>
                        <td>${formatDate(appointment.appointmentDate)}</td>
                        <td>${appointment.appointmentTime}</td>
                        <td>
                            <span class="badge bg-${getStatusColor(appointment.status)}">
                                ${appointment.status}
                            </span>
                        </td>
                        <td>
                            <button class="btn btn-sm btn-primary" onclick="openUpdateStatusModal(${appointment.id})">
                                <i class="fas fa-edit"></i> Update
                            </button>
                            <button class="btn btn-sm btn-success" onclick="openPrescriptionModal(${appointment.id}, ${appointment.patient.id})">
                                <i class="fas fa-plus"></i> Prescription
                            </button>
                        </td>
                    </tr>
                `;
            });
            
            document.getElementById('appointmentsList').innerHTML = html || '<tr><td colspan="6" class="text-center">No appointments found</td></tr>';
        }
    } catch (error) {
        console.error('Error loading appointments:', error);
        document.getElementById('appointmentsList').innerHTML = '<tr><td colspan="6" class="text-center">Error loading appointments</td></tr>';
    }
}

/**
 * Load patients
 */
async function loadPatients() {
    try {
        const response = await apiClient.get('/doctor/patients', {
            headers: { 'Authorization': `Bearer ${doctorToken}` }
        });
        
        if (response.data.success) {
            const patients = response.data.data;
            let html = '';
            
            patients.forEach(patient => {
                html += `
                    <tr>
                        <td>${patient.id}</td>
                        <td>${patient.user.name}</td>
                        <td>${patient.user.email}</td>
                        <td>${patient.phoneNumber || 'N/A'}</td>
                        <td>${patient.age || 'N/A'}</td>
                        <td>
                            <button class="btn btn-sm btn-info" onclick="viewMedicalHistory(${patient.id})">
                                <i class="fas fa-history"></i> History
                            </button>
                        </td>
                    </tr>
                `;
            });
            
            document.getElementById('patientsList').innerHTML = html || '<tr><td colspan="6" class="text-center">No patients found</td></tr>';
        }
    } catch (error) {
        console.error('Error loading patients:', error);
        document.getElementById('patientsList').innerHTML = '<tr><td colspan="6" class="text-center">Error loading patients</td></tr>';
    }
}

/**
 * Open update status modal
 */
function openUpdateStatusModal(appointmentId) {
    currentAppointmentId = appointmentId;
    const modal = new bootstrap.Modal(document.getElementById('updateStatusModal'));
    modal.show();
}

/**
 * Update appointment status
 */
async function updateAppointmentStatus() {
    const status = document.getElementById('appointmentStatus').value;
    
    try {
        const response = await apiClient.put(
            `/doctor/appointments/${currentAppointmentId}/status`,
            { status },
            {
                headers: { 'Authorization': `Bearer ${doctorToken}` }
            }
        );
        
        if (response.data.success) {
            showToast('Appointment status updated', 'success');
            bootstrap.Modal.getInstance(document.getElementById('updateStatusModal')).hide();
            loadAppointments();
        }
    } catch (error) {
        console.error('Error updating appointment status:', error);
        showToast('Error updating appointment status', 'danger');
    }
}

/**
 * Open prescription modal
 */
function openPrescriptionModal(appointmentId, patientId) {
    currentAppointmentId = appointmentId;
    currentPatientId = patientId;
    const modal = new bootstrap.Modal(document.getElementById('addPrescriptionModal'));
    modal.show();
}

/**
 * Add prescription
 */
async function addPrescription() {
    const medication = document.getElementById('medication').value;
    const dosage = document.getElementById('dosage').value;
    const duration = document.getElementById('duration').value;
    const notes = document.getElementById('prescriptionNotes').value;
    
    if (!medication || !dosage || !duration) {
        showToast('Please fill all required fields', 'warning');
        return;
    }
    
    try {
        const response = await apiClient.post(
            '/doctor/prescriptions',
            {
                medication,
                dosage,
                duration: parseInt(duration),
                notes,
                appointmentId: currentAppointmentId,
                patientId: currentPatientId
            },
            {
                headers: { 'Authorization': `Bearer ${doctorToken}` }
            }
        );
        
        if (response.data.success) {
            showToast('Prescription added successfully', 'success');
            document.getElementById('prescriptionForm').reset();
            bootstrap.Modal.getInstance(document.getElementById('addPrescriptionModal')).hide();
            loadAppointments();
        }
    } catch (error) {
        console.error('Error adding prescription:', error);
        showToast('Error adding prescription', 'danger');
    }
}

/**
 * View medical history
 */
function viewMedicalHistory(patientId) {
    showToast('Medical history view coming soon', 'info');
}

/**
 * Get status color
 */
function getStatusColor(status) {
    switch(status) {
        case 'PENDING': return 'warning';
        case 'APPROVED': return 'success';
        case 'COMPLETED': return 'info';
        case 'CANCELLED': return 'danger';
        default: return 'secondary';
    }
}

/**
 * Format date
 */
function formatDate(date) {
    return new Date(date).toLocaleDateString();
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    const toast = document.getElementById('toastNotification');
    const toastBody = document.getElementById('toastBody');
    
    toastBody.textContent = message;
    toast.classList.remove('bg-primary', 'bg-success', 'bg-warning', 'bg-danger', 'bg-info');
    toast.classList.add(`bg-${type}`);
    
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
}

/**
 * Logout
 */
function logout() {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    window.location.href = '../login.html';
}
