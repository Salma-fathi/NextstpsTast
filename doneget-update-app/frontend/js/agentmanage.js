// Wait until the document is fully loaded
document.addEventListener('DOMContentLoaded', function () {

    const applicationId = '12345'; // Example application ID. This would be dynamic or passed from the server.
    const applicationContainer = document.getElementById('application-container');
    const loadingSpinner = document.getElementById('loadingSpinner');

    // Function to show or hide the loading spinner
    function showLoading(isLoading) {
        if (isLoading) {
            loadingSpinner.style.display = 'block';
        } else {
            loadingSpinner.style.display = 'none';
        }
    }

    // Function to fetch application details
    function fetchApplicationDetails() {
        showLoading(true);

        // Fetch the application details from the backend
        fetch(`/api/applications/${applicationId}`)
            .then(response => response.json())
            .then(data => {
                showLoading(false);
                if (data) {
                    // Render application details
                    renderApplicationDetails(data);
                } else {
                    alert('Application details not found.');
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
            <h5>Application for ${application.jobTitle}</h5>
            <p>Applicant: ${application.applicantName}</p>
            <p>Status: <span id="application-status">${application.status}</span></p>
            
            <div class="status-btns">
                <button class="btn btn-approve" onclick="updateApplicationStatus('${application.id}', 'approved')">Approve</button>
                <button class="btn btn-reject" onclick="updateApplicationStatus('${application.id}', 'rejected')">Reject</button>
                <button class="btn btn-interview" onclick="updateApplicationStatus('${application.id}', 'interviewing')">Interview</button>
            </div>
        `;
    }

    // Function to update application status
    function updateApplicationStatus(applicationId, status) {
        showLoading(true);

        // Send the request to the backend to update the status
        fetch(`/api/applications/${applicationId}/status`, {
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
                alert(data.message); // Display the response message from the backend
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
