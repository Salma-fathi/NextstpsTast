document.addEventListener("DOMContentLoaded", () => {
    // Get the jobId from the query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const jobId = urlParams.get('jobId');
  
    if (jobId) {
        // Fetch the job details from the backend
        fetch(`http://localhost:5000/api/jobs/jobs/${jobId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,  // Ensure token is available if needed
            }
        })
        .then(response => response.json())
        .then(job => {
            if (job) {
                // Fetch the number of applicants for the job
                fetch(`http://localhost:5000/api/jobs/${jobId}/applications/count`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}` // Include token
                    }
                })
                
                .then(response => response.json())
                .then(applicationsData => {
                    const applicationCount = applicationsData.applicationCount || 0;  // Default to 0 if undefined
                    displayJobDetails(job, applicationCount);
                })
                .catch(error => {
                    console.error('Error fetching applications count:', error);
                    displayJobDetails(job, 0);  // Default to 0 applicants if error occurs
                });
            } else {
                alert('Job not found!');
            }
        })
        .catch(error => {
            console.error('Error fetching job details:', error);
            alert('Error fetching job details');
        });
    } else {
        alert('Job ID is missing');
    }
});

// Function to display job details in the container
function displayJobDetails(job, applicationCount) {
    const jobDetailsContainer = document.getElementById('job-details-container');

    // Handle the job status
    const jobStatus = job.status ? job.status.trim().toLowerCase() : '';  // Ensure proper handling
    const statusText = (jobStatus === 'open') ? 'Open' : 'Closed';  // Default to "Closed" if not open

    const jobDetailsHTML = `
      <!-- Job Header Section with Icons in Horizontal Layout -->
      <div class="job-header">
          <div class="job-header-item">
              <i class="fas fa-map-marker-alt"></i> <strong>Location:</strong> ${job.location}
          </div>
          <div class="job-header-item">
              <i class="fas fa-users"></i> <strong>Applicants:</strong> ${applicationCount}
          </div>
          <div class="job-header-item">
              <i class="fas fa-check-circle"></i> <strong>Status:</strong> ${statusText}
          </div>
      </div>
      
      <!-- Job Title and Description -->
      <h2>${job.title}</h2>
      <p><strong>Description:</strong></p>
      <p>${job.description}</p>

      <!-- Job Details -->
      <div class="job-details">
          <p><strong>Salary:</strong> $${new Intl.NumberFormat().format(job.salary)}</p>
          <p><strong>Contract Type:</strong> ${job.type}</p>
          <p><strong>Remote:</strong> ${job.remote ? 'Yes' : 'No'}</p>
      </div>

      <!-- Apply Button -->
      <button id="applyBtn" class="btn btn-primary">Apply</button>
    `;
  
    jobDetailsContainer.innerHTML = jobDetailsHTML;
  
    // Handle apply button click
    document.getElementById('applyBtn').addEventListener('click', () => {
        applyForJob(job._id);
    });
}

// Function to handle applying for a job
function applyForJob(jobId) {
    fetch(`http://localhost:5000/api/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,  // Ensure token is available
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            alert(data.message);
        } else {
            alert('Successfully applied for the job!');
        }
    })
    .catch(error => {
        console.error('Error applying for the job:', error);
        alert('Something went wrong while applying for the job.');
    });
}
