// Function to handle search with filters
document.getElementById('searchBtn').addEventListener('click', function() {
    const locationType = document.getElementById('locationType').value;
    const location = document.getElementById('location').value;
    const contractType = document.getElementById('contract').value;
    const salary = document.getElementById('salary').value;
    const searchQuery = document.getElementById('jobSearch').value.trim(); 

    const queryParams = new URLSearchParams();

    if (searchQuery) {
        queryParams.append('title', searchQuery.toLowerCase());
    }

    if (locationType === 'local' && location) {
        queryParams.append('location', location);
    }

    if (contractType) {
        queryParams.append('type', contractType);
    }

    if (salary) {
        queryParams.append('salary', salary);
    }

    const remote = locationType === 'remote' ? 'true' : 'false';
    queryParams.append('remote', remote);

    if (queryParams.toString() === '') {
        alert('Please provide at least one filter for the search.');
        return;
    }

    fetch(`/api/jobs/search?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
    })
    .then(response => response.json())
    .then(data => {
        const jobListContainer = document.getElementById('jobList');
        jobListContainer.innerHTML = '';

        if (data.message) {
            const noJobsMessage = document.createElement('p');
            noJobsMessage.textContent = data.message;
            jobListContainer.appendChild(noJobsMessage);
            return;
        }

        data.forEach(job => {
            const jobItem = document.createElement('div');
            jobItem.classList.add('job-item');

            jobItem.innerHTML = `
                <h3>${job.title}</h3>
                <p>${job.description}</p>
                <p><strong>Location:</strong> ${job.location}</p>
                <p><strong>Salary:</strong> $${new Intl.NumberFormat().format(job.salary)}</p>
                <p><strong>Type:</strong> ${job.type}</p>
                <p><strong>Remote:</strong> ${job.remote ? 'Yes' : 'No'}</p>
                <button class="view-btn" data-job-id="${job._id}">View</button>
                <button class="apply-btn" data-job-id="${job._id}">Apply</button> 
            `;

            jobListContainer.appendChild(jobItem);
        });

        // Add event delegation for both "view-btn" and "apply-btn"
        jobListContainer.addEventListener('click', function(e) {
            if (e.target.classList.contains('view-btn')) {
                const jobId = e.target.getAttribute('data-job-id');
                viewJob(jobId);  // Call viewJob() when View button is clicked
            }
            if (e.target.classList.contains('apply-btn')) {
                const jobId = e.target.getAttribute('data-job-id');
                openApplyModal(jobId); // Open modal for applying to job
            }
        });
    })
    .catch(error => {
        console.error('Error fetching filtered jobs:', error);
    });
});

// Show/hide the location filter based on location type
document.getElementById('locationType').addEventListener('change', function() {
    const locationType = this.value;
    const locationFilter = document.getElementById('locationFilter');
    locationFilter.style.display = locationType === 'local' ? 'block' : 'none';
});

// Update salary display when slider changes
document.getElementById('salary').addEventListener('input', function() {
    const salaryValue = document.getElementById('salaryValue');
    salaryValue.textContent = new Intl.NumberFormat().format(this.value);
});

// Function to handle viewing a job's details
function viewJob(jobId) {
    // Redirect to the view page with the jobId
    window.location.href = `view.html?jobId=${jobId}`;
}

// Function to handle applying for a job
function applyForJob(jobId) {
    fetch(`/api/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
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

// Function to open the Apply modal (this is triggered by clicking "Apply" button)
function openApplyModal(jobId) {
    const applyModal = document.getElementById('applyModal');
    const applyWithResumeBtn = document.getElementById('applyWithResume');
    const resumeFileInput = document.getElementById('resumeFile');
    const errorMessage = document.getElementById('error-message');

    applyModal.style.display = 'flex';

    applyWithResumeBtn.onclick = function () {
        const formData = new FormData();
        const resumeFile = resumeFileInput.files[0];

        if (!resumeFile) {
            errorMessage.style.display = 'block';
            return;
        }

        errorMessage.style.display = 'none';
        formData.append('resume', resumeFile);

        fetch(`/api/jobs/${jobId}/apply`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message || 'Successfully applied for the job!');
            applyModal.style.display = 'none';
        })
        .catch(error => {
            console.error('Error applying for the job:', error);
            alert('Something went wrong while applying for the job.');
        });
    };

    document.getElementById('closeModal').onclick = function () {
        applyModal.style.display = 'none';
    };
}
