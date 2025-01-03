document.addEventListener('DOMContentLoaded', function() {
  // Get the user's skills (this could be from localStorage, a form, or any other source)
  let userSkills = localStorage.getItem('skills') || 'js, html, css, mongodb'; // Default skills if not set
  
  // Function to update skills in localStorage and refresh job recommendations
  function updateSkills(newSkills) {
      localStorage.setItem('skills', newSkills);
      userSkills = newSkills;
      fetchJobs(); // Re-fetch the jobs after updating skills
  }

  // Build the query string based on the user's skills
  function buildQueryString() {
      return userSkills ? `?skills=${encodeURIComponent(userSkills)}` : '';
  }

  // Function to fetch job recommendations based on user's skills
  function fetchJobs() {
      const queryString = buildQueryString();
      
      // Show a loading indicator while fetching
      const jobListContainer = document.getElementById('recommendedJobList');
      jobListContainer.innerHTML = '<p>Loading jobs...</p>';  // Loading text or spinner
      
      fetch(`/api/jobs/recommend${queryString}`, {
          method: 'GET',
          headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}` // Assuming token is stored in localStorage
          }
      })
      .then(response => response.json())
      .then(data => {
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
          jobListContainer.innerHTML = '<p>Error loading jobs. Please try again later.</p>';
      });
  }

  // Fetch jobs when the page loads
  fetchJobs();

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

  // Example: Update skills based on user input (e.g., from an input field or a button click)
  const updateSkillsButton = document.getElementById('updateSkillsButton');
  if (updateSkillsButton) {
      updateSkillsButton.addEventListener('click', function() {
          const newSkills = prompt('Enter your skills (comma separated):', userSkills);
          if (newSkills) {
              updateSkills(newSkills);
          }
      });
  }
});
