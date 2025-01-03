document.addEventListener('DOMContentLoaded', function () {
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

    // Get references to form and elements
    const applicationForm = document.getElementById('createApplicationForm');
    const jobInput = document.getElementById('job');
    const userInput = document.getElementById('user');
    const profileInput = document.getElementById('profile');
    const resumeInput = document.getElementById('resume');
    const skillsInput = document.getElementById('skills');
    const socialLinksInput = document.getElementById('socialLinks');

    // Handle form submission
    applicationForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Create FormData object to handle file uploads
        const formData = new FormData();
        formData.append('job', jobInput.value);
        formData.append('user', userInput.value);
        formData.append('profile', profileInput.value);
        formData.append('resume', resumeInput.files[0]); // Assuming only 1 file
        formData.append('skills', skillsInput.value);
        formData.append('socialLinks', socialLinksInput.value);

        // Make POST request to create application
        fetch('/api/applications', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
            },
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                alert(data.message);
            } else {
                alert('Application successfully created!');
                // Optionally, reset the form here after submission
                applicationForm.reset();
            }
        })
        .catch(error => {
            console.error('Error submitting application:', error);
            alert('Error creating application. Please try again later.');
        });
    });
});
