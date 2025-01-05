document.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem('token');
    const tokenExpiry = localStorage.getItem('token_expiry');

    if (!token || !tokenExpiry || Date.now() > tokenExpiry) {
        alert('Your session has expired. Please log in again.');
        localStorage.removeItem('token');
        localStorage.removeItem('token_expiry');
        window.location.href = '/login'; // Redirect to login page
        return;
    }

    const jobId = new URLSearchParams(window.location.search).get('jobId');
    if (!jobId) {
        alert('Invalid job ID.');
        return;
    }

    const applicantData = JSON.parse(localStorage.getItem('applicantData'));
    const applicantList = document.getElementById('applicantList');

    if (!applicantData || applicantData.length === 0) {
        applicantList.innerHTML = '<p>No applicants found for this job.</p>';
        return;
    }

    applicantData.forEach(application => {
        const applicantElement = document.createElement('div');
        applicantElement.classList.add('applicant-card', 'card', 'mb-3');
        applicantElement.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">${application.user.name}</h5>
                <p><strong>Email:</strong> ${application.user.email}</p>
                <p><strong>Status:</strong> ${application.status}</p>
                <p><strong>Applied At:</strong> ${new Date(application.appliedAt).toLocaleDateString()}</p>
                <p><strong>Experience:</strong> ${application.profile.experience.map(exp => `${exp.role} at ${exp.company}`).join(', ')}</p>
                <p><strong>Education:</strong> ${application.profile.education.map(edu => `${edu.degree} from ${edu.university}`).join(', ')}</p>
                <p><strong>Skills:</strong> ${application.profile.skills.join(', ')}</p>
            </div>
        `;
        applicantList.appendChild(applicantElement);
    });
});
