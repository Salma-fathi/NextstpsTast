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
              // Inside the job creation loop, update the "Update Details" button HTML to include an icon
jobElement.innerHTML = `
<h3 class="job-title">${job.title}</h3>
<p class="job-description">${job.description}</p>
<p class="job-location"><strong>Location:</strong> ${job.location}</p>
<p class="job-salary"><strong>Salary:</strong> $${job.salary}</p>
<p class="job-type"><strong>Type:</strong> ${job.type}</p>
<p class="job-status"><strong>Status:</strong> ${job.status}</p>
<div class="job-actions">
    <!-- Update link with icon should go to an update job page with the job ID -->
    <a href="/update-job.html?id=${job._id}" class="btn btn-primary">
        <i class="fas fa-edit"></i> Update Details
    </a>
    <!-- Delete button -->
    <button class="btn btn-danger delete-job" data-job-id="${job._id}">
        <i class="fas fa-trash-alt"></i> Delete
    </button>
</div>
<hr>
`;


                jobsList.appendChild(jobElement);
            });

            // Attach event listener to each delete button
            const deleteButtons = document.querySelectorAll('.delete-job');
            deleteButtons.forEach(button => {
                button.addEventListener('click', function (e) {
                    const jobId = e.target.closest('.delete-job').getAttribute('data-job-id');
                    if (confirm('Are you sure you want to delete this job?')) {
                        deleteJob(jobId);
                    }
                });
            });
        }
    })
    .catch(error => {
        console.error('Error fetching jobs:', error);
        loader.style.display = 'none'; // Hide loading spinner
        alert('Error fetching jobs. Please try again later.');
    });

    // Function to delete a job
    function deleteJob(jobId) {
        // Show loading spinner while deleting
        const loader = document.getElementById('loadingSpinner');
        loader.style.display = 'block';

        fetch(`/api/jobs/${jobId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + token,
            }
        })
        .then(response => response.json())
        .then(data => {
            loader.style.display = 'none'; // Hide loading spinner
            if (data.message === 'Job deleted successfully.') {
                alert('Job deleted successfully.');
                // Remove the job from the DOM
                const jobCard = document.querySelector(`[data-job-id="${jobId}"]`).closest('.job-card');
                jobCard.remove();
            } else {
                alert('Error deleting job. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error deleting job:', error);
            loader.style.display = 'none'; // Hide loading spinner
            alert('Error deleting job. Please try again.');
        });
    }
});
