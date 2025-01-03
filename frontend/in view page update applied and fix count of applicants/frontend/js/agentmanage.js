document.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem('token');
    const tokenExpiry = localStorage.getItem('token_expiry');

    // Log the full URL to see if applicationId is in the URL
    console.log('Full URL:', window.location.href);

    // Extract applicationId from the URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const applicationId = urlParams.get('applicationId');

    // Log the extracted applicationId to verify
    console.log('Extracted applicationId:', applicationId);

    // Token expiration validation
    if (!token || !tokenExpiry || Date.now() > tokenExpiry) {
        alert('Your session has expired. Please log in again.');
        localStorage.removeItem('token');
        localStorage.removeItem('token_expiry');
        window.location.href = '/login'; // Redirect to login page
        return;
    }

    // If applicationId is missing, log and redirect
    if (!applicationId) {
        console.error('Error: Application ID is missing in the URL.');
        alert('Application ID is missing in the URL.');
        window.location.href = '/';  // Redirect to homepage
        return;
    }

    // Fetch application details using the extracted applicationId
    fetch(`/api/applications/${applicationId}`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token,
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch application details');
        }
        return response.json();
    })
    .then(data => {
        if (data.message) {
            alert(data.message);
            return;
        }

        const application = data.application;
        const applicationDetailsDiv = document.getElementById('applicationDetails');

        // Populate application details
        applicationDetailsDiv.innerHTML = `
            <p><strong>Job Title:</strong> ${application.job.title}</p>
            <p><strong>Applicant:</strong> ${application.user.name} (${application.user.email})</p>
            <p><strong>Application Status:</strong> ${application.status}</p>
            <p><strong>Applied At:</strong> ${new Date(application.appliedAt).toLocaleDateString()}</p>
            <p><strong>Updated At:</strong> ${new Date(application.updatedAt).toLocaleDateString()}</p>
        `;

        // Pre-fill the status dropdown with the current status
        const statusSelect = document.getElementById('applicationStatus');
        statusSelect.value = application.status;
    })
    .catch(error => {
        console.error('Error fetching application details:', error);
        alert('Error fetching application details.');
    });

    // Handle status update
    const updateStatusButton = document.getElementById('updateStatusButton');
    updateStatusButton.addEventListener('click', function () {
        const status = document.getElementById('applicationStatus').value;

        // Validate the selected status
        if (!status) {
            alert('Please select a valid application status.');
            return;
        }

        fetch(`/api/applications/${applicationId}/status`, {
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update application status');
            }
            return response.json();
        })
        .then(data => {
            if (data.message) {
                alert(data.message);
                return;
            }

            alert('Application status updated successfully!');
            // Optionally refresh the page or update the displayed status
            document.querySelector('#applicationDetails p:nth-child(3)').textContent = `Application Status: ${data.application.status}`;
        })
        .catch(error => {
            console.error('Error updating application status:', error);
            alert('Error updating application status.');
        });
    });
});
