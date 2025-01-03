// Sample job data for search
const jobs = [
    { id: 1, title: "Web Developer", company: "Company A", description: "Develop websites." },
    { id: 2, title: "Frontend Developer", company: "Company B", description: "Build UI components." },
    { id: 3, title: "Backend Developer", company: "Company C", description: "Develop server-side logic." }
  ];
  
  // Sample applied jobs
  let appliedJobs = [
    { id: 1, title: "Web Developer", company: "Company A" },
    { id: 2, title: "Frontend Developer", company: "Company B" }
  ];
  
  // Function to display applied jobs in the dashboard
  function displayAppliedJobs() {
    const appliedJobsList = document.getElementById('appliedJobsList');
    appliedJobsList.innerHTML = '';  // Clear the list
  
    if (appliedJobs.length > 0) {
      appliedJobs.forEach(job => {
        const listItem = document.createElement('li');
        listItem.textContent = `${job.title} at ${job.company}`;
        appliedJobsList.appendChild(listItem);
      });
    } else {
      appliedJobsList.innerHTML = '<li>No jobs applied yet.</li>';
    }
  }
  
  // Function to search for jobs
  function searchJobs(query) {
    const resultsContainer = document.getElementById('searchResults');
    resultsContainer.innerHTML = '';  // Clear previous results
  
    // Filter jobs based on the search query
    const filteredJobs = jobs.filter(job => job.title.toLowerCase().includes(query.toLowerCase()));
  
    if (filteredJobs.length > 0) {
      filteredJobs.forEach(job => {
        const jobElement = document.createElement('div');
        jobElement.classList.add('job-item');
        jobElement.innerHTML = `
          <h4>${job.title}</h4>
          <p>${job.company}</p>
          <p>${job.description}</p>
          <button class="btn btn-success" onclick="applyForJob(${job.id})">Apply</button>
        `;
        resultsContainer.appendChild(jobElement);
      });
    } else {
      resultsContainer.innerHTML = `<p>No jobs found</p>`;
    }
  }
  
  // Function to apply for a job
  function applyForJob(jobId) {
    const job = jobs.find(job => job.id === jobId);
  
    // Check if the seeker has already applied for this job
    if (!appliedJobs.find(apply => apply.id === jobId)) {
      appliedJobs.push(job);  // Add to applied jobs list
      alert(`You have successfully applied for ${job.title}`);
      displayAppliedJobs();  // Refresh the applied jobs list
    } else {
      alert("You have already applied for this job.");
    }
  }
  
  // Event listener for the search button
  document.getElementById('searchButton').addEventListener('click', () => {
    const query = document.getElementById('searchQuery').value;
    searchJobs(query);  // Trigger job search
  });
  
  // Initial load: Display applied jobs
  displayAppliedJobs();
  