// Function to handle search with filters
document.getElementById('searchBtn').addEventListener('click', function() {
  // Get values from the filters
  const locationType = document.getElementById('locationType').value;
  const location = document.getElementById('location').value;
  const contractType = document.getElementById('contract').value;
  const salary = document.getElementById('salary').value;
  const searchQuery = document.getElementById('jobSearch').value.trim();  // Trim whitespace from search query

  // Build the query parameters to send to the backend
  const queryParams = new URLSearchParams();

  // Add search query if provided (case-insensitive, allows partial matches)
  if (searchQuery) {
      queryParams.append('title', searchQuery.toLowerCase());  // Ensures case-insensitivity
  }

  // Add location filter if location type is 'local' and location is provided
  if (locationType === 'local' && location) {
      queryParams.append('location', location);
  }

  // Add contract type filter if selected
  if (contractType) {
      queryParams.append('type', contractType);
  }

  // Add salary filter if provided
  if (salary) {
      queryParams.append('salary', salary);
  }

  // Add remote filter based on location type
  const remote = locationType === 'remote' ? 'true' : 'false';
  queryParams.append('remote', remote);

  // If no filters are applied (e.g., searchQuery, location, contract, salary), show an error message or use all jobs
  if (queryParams.toString() === '') {
      alert('Please provide at least one filter for the search.');
      return;
  }

  // Fetch the filtered jobs from the backend using the query params
  fetch(`/api/jobs/search?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,  // Assumes token is stored in localStorage
      }
  })
  .then(response => response.json())
  .then(data => {
      // Clear previous job listings
      const jobListContainer = document.getElementById('jobList');
      jobListContainer.innerHTML = '';  // Clear previous jobs

      if (data.message) {
          const noJobsMessage = document.createElement('p');
          noJobsMessage.textContent = data.message;
          jobListContainer.appendChild(noJobsMessage);
          return;
      }

      // Dynamically populate the job listings
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

      // Using event delegation for View and Apply buttons
      jobListContainer.addEventListener('click', (e) => {
          if (e.target.classList.contains('view-btn')) {
              const jobId = e.target.getAttribute('data-job-id');
              viewJob(jobId);
          }
          if (e.target.classList.contains('apply-btn')) {
              const jobId = e.target.getAttribute('data-job-id');
              applyForJob(jobId);
          }
      });
  })
  .catch(error => {
      console.error('Error fetching filtered jobs:', error);
  });
});

// Function to handle viewing a job's details
function viewJob(jobId) {
fetch(`/api/jobs/${jobId}`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
  }
})
.then(response => response.json())
.then(data => {
  if (data.message) {
    alert(data.message);
  } else {
    const jobDetails = `
      <div>
        <h2>${data.title}</h2>
        <p><strong>Description:</strong> ${data.description}</p>
        <p><strong>Location:</strong> ${data.location}</p>
        <p><strong>Salary:</strong> $${new Intl.NumberFormat().format(data.salary)}</p>
        <p><strong>Type:</strong> ${data.type}</p>
        <p><strong>Remote:</strong> ${data.remote ? 'Yes' : 'No'}</p>
        <p><strong>Requirements:</strong> ${data.requirements}</p>
      </div>
    `;
    const modal = document.createElement('div');
    modal.classList.add('modal');
    modal.innerHTML = jobDetails + '<button class="close-modal">Close</button>';
    document.body.appendChild(modal);

    // Close modal functionality
    document.querySelector('.close-modal').addEventListener('click', () => {
      modal.remove();
    });
  }
})
.catch(error => {
  console.error('Error viewing job:', error);
  alert('Something went wrong while fetching job details.');
});
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
