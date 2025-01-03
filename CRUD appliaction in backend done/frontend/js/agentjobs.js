document.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem('token');
    const tokenExpiry = localStorage.getItem('token_expiry');

    // Token expiration validation
    if (!token || !tokenExpiry || Date.now() > tokenExpiry) {
        alert('Your session has expired. Please log in again.');
        localStorage.removeItem('token');
        localStorage.removeItem('token_expiry');
        window.location.href = '/login'; // Redirect to login page
        return;
    }

    const loader = document.getElementById('loadingSpinner');
    loader.style.display = 'block';

    // Fetch jobs posted by the authenticated agent
    fetch('/api/jobs', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token,
        }
    })
    .then(response => response.json())
    .then(data => {
        loader.style.display = 'none';
        if (data.message) {
            alert(data.message);
            return;
        }

        const jobsList = document.getElementById('jobsList');
        if (data.length === 0) {
            jobsList.innerHTML = '<p>No jobs found.</p>';
        } else {
            data.forEach(job => {
                fetch(`/api/jobs/${job._id}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': 'Bearer ' + token,
                    }
                })
                .then(response => response.json())
                .then(jobData => {
                    const jobElement = document.createElement('div');
                    jobElement.classList.add('job-card');

                    let statusIcon, statusColor;
                    if (jobData.status === 'open') {
                        statusIcon = 'check-circle';
                        statusColor = '#28a745';
                    } else if (jobData.status === 'closed') {
                        statusIcon = 'times-circle';
                        statusColor = '#dc3545';
                    }

                    const applicantColor = jobData.applicationCount > 0 ? '#007bff' : '#6c757d';

                    jobElement.innerHTML = `
                        <div class="job-header">
                            <h3 class="job-title">${jobData.title}</h3>
                            <div class="job-status" style="color: ${statusColor};">
                                <i class="fas fa-${statusIcon}"></i>
                                <span>${jobData.status.charAt(0).toUpperCase() + jobData.status.slice(1)}</span>
                            </div>
                            <div class="job-applicants" style="color: ${applicantColor};">
                                <i class="fas fa-users"></i>
                                <span>${jobData.applicationCount || 0} Applicants</span>
                                <button class="btn btn-info view-applicants" data-job-id="${jobData._id}">
                                    View Applicants
                                </button>
                            </div>
                        </div>
                        <p class="job-description">${jobData.description}</p>
                        <p class="job-location"><strong>Location:</strong> ${jobData.location}</p>
                        <p class="job-salary"><strong>Salary:</strong> $${jobData.salary}</p>
                        <p class="job-type"><strong>Type:</strong> ${jobData.type}</p>
                        <div class="job-actions">
                            <a href="/update-job.html?id=${jobData._id}" class="btn btn-primary">
                                <i class="fas fa-edit"></i> Update Details
                            </a>
                            <button class="btn btn-danger delete-job" data-job-id="${jobData._id}">
                                <i class="fas fa-trash-alt"></i> Delete
                            </button>
                        </div>
                        <hr>
                    `;
                    jobsList.appendChild(jobElement);
                })
                .catch(error => {
                    console.error('Error fetching job details:', error);
                    alert('Error fetching job details. Please try again later.');
                });
            });
        }
    })
    .catch(error => {
        console.error('Error fetching jobs:', error);
        loader.style.display = 'none';
        alert('Error fetching jobs. Please try again later.');
    });

    // Fetch applicants when 'View Applicants' button is clicked
    document.getElementById('jobsList').addEventListener('click', function(e) {
        if (e.target && e.target.classList.contains('view-applicants')) {
            const jobId = e.target.getAttribute('data-job-id');
            viewApplicantsDetails(jobId);
        }
    });

    function viewApplicantsDetails(jobId) {
        const loader = document.getElementById('loadingSpinner');
        loader.style.display = 'block';

        fetch(`/api/jobs/${jobId}/applications`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token,
            }
        })
        .then(response => response.json())
        .then(data => {
            loader.style.display = 'none';
            if (data.message) {
                alert(data.message);
                return;
            }
            showApplicantsModal(data.applications);
        })
        .catch(error => {
            console.error('Error fetching applicants:', error);
            loader.style.display = 'none';
            alert('Error fetching applicants. Please try again later.');
        });
    }

    function showApplicantsModal(applications) {
        const modal = new bootstrap.Modal(document.getElementById('applicantsModal'));
        const container = document.getElementById('applicantDetailsContainer');
        container.innerHTML = applications.map(application => ` 
            <p>
                <strong>Name:</strong> ${application.user.name} <br>
                <strong>Email:</strong> ${application.user.email} <br>
                <strong>Status:</strong> ${application.status} <br>
                <strong>Applied At:</strong> ${new Date(application.appliedAt).toLocaleDateString()}
            </p>
            <hr>
        `).join('');
        modal.show();
    }
});
