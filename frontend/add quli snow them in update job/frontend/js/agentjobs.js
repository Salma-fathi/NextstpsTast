document.addEventListener('DOMContentLoaded', function () {
    // Get the token and token expiry from localStorage
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

    // Show loading spinner
    const loader = document.getElementById('loadingSpinner');
    loader.style.display = 'block';

    // Fetch the jobs posted by the authenticated agent
    fetch('/api/jobs', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token,
        }
    })
    .then(response => response.json())
    .then(data => {
        loader.style.display = 'none'; // Hide loading spinner
        if (data.message) {
            alert(data.message); // Show message if no jobs found or error
            return;
        }

        // Display jobs on the page
        const jobsList = document.getElementById('jobsList');
        if (data.length === 0) {
            jobsList.innerHTML = '<p>No jobs found.</p>';
        } else {
            data.forEach(job => {
                const jobElement = document.createElement('div');
                jobElement.classList.add('job-card');
                jobElement.innerHTML = `
                <h3 class="job-title">${job.title}</h3>
                <p class="job-description">${job.description}</p>
                <p class="job-location"><strong>Location:</strong> ${job.location}</p>
                <p class="job-salary"><strong>Salary:</strong> $${job.salary}</p>
                <p class="job-type"><strong>Type:</strong> ${job.type}</p>
                <p class="job-status"><strong>Status:</strong> ${job.status}</p>
                <div class="job-actions">
                    <!-- Update link should go to an update job page with the job ID -->
                    <a href="/update-job.html?id=${job._id}" class="btn btn-primary">Update Details</a>
                </div>
                <hr>
            `;
            
                jobsList.appendChild(jobElement);
            });
        }
    })
    .catch(error => {
        console.error('Error fetching jobs:', error);
        loader.style.display = 'none'; // Hide loading spinner
        alert('Error fetching jobs. Please try again later.');
    });
});
