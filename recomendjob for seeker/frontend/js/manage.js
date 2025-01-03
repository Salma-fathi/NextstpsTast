document.addEventListener('DOMContentLoaded', function() {
    // Get the user's skills (this could be from localStorage, a form, or any other source)
    const userSkills = localStorage.getItem('skills') || 'js, html, css, mongodb'; // Assuming skills are stored in localStorage, default to 'js, html, css, mongodb'
  
    // Build the query string based on the user's skills
    const queryString = userSkills ? `?skills=${encodeURIComponent(userSkills)}` : '';
  
    // Fetch job recommendations based on the user's skills
    fetch(`/api/jobs/recommend${queryString}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}` // Assumes token is stored in localStorage
      }
    })
    .then(response => response.json())
    .then(data => {
      const jobListContainer = document.getElementById('jobList');
      jobListContainer.innerHTML = '';  // Clear previous job listings
  
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
  
      // Event delegation for View and Apply buttons
      jobListContainer.addEventListener('click', function(e) {
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
      console.error('Error fetching recommended jobs:', error);
    });
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
      }
    })
    .catch(error => {
      console.error('Error applying for job:', error);
    });
  }
  