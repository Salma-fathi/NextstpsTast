document.addEventListener('DOMContentLoaded', function() {
    // Fetch applied jobs for the authenticated user
    fetch('/api/jobs/user/applications', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,  // Assuming token is stored in localStorage
        }
    })
    .then(response => response.json())
    .then(data => {
        const jobListContainer = document.getElementById('appliedJobList');
        jobListContainer.innerHTML = '';  // Clear any previous content

        if (!data || !data.appliedJobs || data.appliedJobs.length === 0) {
            // Display message if no jobs found
            const noJobsMessage = document.createElement('p');
            noJobsMessage.textContent = 'You have not applied for any jobs yet.';
            jobListContainer.appendChild(noJobsMessage);
            return;
        }

        // Dynamically populate the applied jobs
        data.appliedJobs.forEach(job => {
            const jobItem = document.createElement('div');
            jobItem.classList.add('col-md-6');  // Bootstrap grid column for responsive design
            jobItem.classList.add('job-item');
            let statusClass = '';  // To dynamically assign the correct color for the status
            let statusText = '';

            // Set status text and class based on the job status
            if (job.status === 'rejected') {
                statusClass = 'rejected';
                statusText = 'Rejected';
            } else if (job.status === 'approved') {
                statusClass = 'approved';
                statusText = 'Approved';
            } else if (job.status === 'interviewing') {
                statusClass = 'interviewing';
                statusText = 'Interviewing';
            }

            jobItem.innerHTML = `
                <div class="card mb-3 shadow job-card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <div class="job-status ${statusClass}">${statusText}</div>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <!-- Left side: Job details -->
                            <div class="col-8">
                                <h5 class="card-title">${job.job.title}</h5>
                                <p class="card-text">${job.job.description}</p>
                                <p><strong>Location:</strong> ${job.job.location}</p>
                                <p><strong>Salary:</strong> $${new Intl.NumberFormat().format(job.job.salary)}</p>
                                <p><strong>Type:</strong> ${job.job.type}</p>
                                <p><strong>Remote:</strong> ${job.job.remote ? 'Yes' : 'No'}</p>
                                <p><strong>Applied On:</strong> ${new Date(job.appliedAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            jobListContainer.appendChild(jobItem);
        });
    })
    .catch(error => {
        console.error('Error fetching applied jobs:', error);
    });
});
