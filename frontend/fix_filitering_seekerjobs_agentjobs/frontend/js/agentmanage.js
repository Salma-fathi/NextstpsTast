document.addEventListener('DOMContentLoaded', function () {
    // Assume the application ID is passed dynamically, e.g., from the URL or context
    const applicationId = window.location.pathname.split('/').pop();  // Get the application ID from the URL (e.g., "/applications/12345")
    const applicationContainer = document.getElementById('application-container');
    const loadingSpinner = document.getElementById('loadingSpinner');

    // Function to show or hide the loading spinner
    function showLoading(isLoading) {
        loadingSpinner.style.display = isLoading ? 'block' : 'none';
    }

    // Function to fetch application details
    function fetchApplicationDetails() {
        showLoading(true);

        fetch(`/applications/${applicationId}`)
            .then(response => response.json())
            .then(data => {
                showLoading(false);
                console.log('Received data from backend:', data);  // Log the data for debugging

                // Handle different response messages
                if (data.message === 'Application details fetched successfully') {
                    renderApplicationDetails(data.application);
                } else if (data.message === 'Application not found') {
                    alert('Application not found.');
                } else {
                    alert('Unknown error occurred.');
                }
            })
            .catch(error => {
                showLoading(false);
                console.error('Error:', error);
                alert('There was an error fetching the application details.');
            });
    }

    // Function to render application details in the UI
    function renderApplicationDetails(application) {
        applicationContainer.innerHTML = `
            <h5>Application for ${application.job?.title || 'Job not found'}</h5>
            <p>Applicant: ${application.user?.email || 'Email not available'}</p>
            <p>Status: <span id="application-status">${application.status || 'Status not set'}</span></p>
            
            <div class="status-btns">
                ${application.status === 'applied' ? `
                    <button class="btn btn-approve" onclick="updateApplicationStatus('${application._id}', 'approved')">Approve</button>
                    <button class="btn btn-reject" onclick="updateApplicationStatus('${application._id}', 'rejected')">Reject</button>
                    <button class="btn btn-interview" onclick="updateApplicationStatus('${application._id}', 'interviewing')">Interview</button>
                ` : ''}
            </div>
        `;
    }

    // Function to update application status
    function updateApplicationStatus(applicationId, status) {
        showLoading(true);

        fetch(`/applications/${applicationId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: status }), // Send the status to be updated
        })
        .then(response => response.json())
        .then(data => {
            showLoading(false);
            if (data.message) {
                alert(data.message);  // Display the response message from the backend
                document.getElementById('application-status').innerText = status.charAt(0).toUpperCase() + status.slice(1); // Update the status text on UI
            }
        })
        .catch(error => {
            showLoading(false);
            console.error('Error:', error);
            alert('There was an error updating the application status.');
        });
    }

    // Fetch application details when the page loads
    fetchApplicationDetails();
});
