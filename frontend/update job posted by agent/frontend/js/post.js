// Preview the selected logo image
document.getElementById('companyLogo').addEventListener('change', function (event) {
    const logoPreview = document.getElementById('logoPreview');
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            logoPreview.src = e.target.result;
            logoPreview.style.display = 'block'; // Show the preview
        };
        reader.readAsDataURL(file);
    }
});
// Preview company logo
    companyLogoInput.addEventListener('change', function () {
        const file = companyLogoInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                logoPreview.src = e.target.result;
                logoPreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        } else {
            logoPreview.style.display = 'none';
        }
    });


 // Initialize Quill editor
 const quill = new Quill(jobDescriptionEditor, {
    theme: 'snow',
    placeholder: 'Enter job description...',
    modules: {
        toolbar: [
            [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['bold', 'italic', 'underline'],
            [{ 'align': [] }],
            ['link', 'blockquote', 'image'],
        ],
    },
});
// Handle job posting form submission
document.getElementById('postJobForm').addEventListener('submit', function (event) {
    event.preventDefault();

    console.log('Job post form submitted');

    const token = localStorage.getItem('token');
    const tokenExpiry = localStorage.getItem('token_expiry');

    // Token expiration validation
    if (!token || !tokenExpiry || Date.now() > tokenExpiry) {
        alert('Your session has expired. Please log in again.');
        localStorage.removeItem('token');
        localStorage.removeItem('token_expiry');
        window.location.href = '/login';
        return;
    }

    // Prepare the job post data
    const jobData = {
        title: document.getElementById('jobTitle').value,
        description: quill.root.innerHTML, // Get the HTML content from Quill editor
        location: document.getElementById('location').value,
        salary: document.getElementById('salary').value,
        type: document.getElementById('jobType').value,
        remote: document.getElementById('remote').checked,
        skills: document.getElementById('skills').value.split(',').map(skill => skill.trim())
    };

    // Handle company logo image file
    const companyLogo = document.getElementById('companyLogo').files[0];
    if (companyLogo) {
        const reader = new FileReader();
        reader.onload = function (e) {
            // Convert the image to base64 string
            jobData.companyLogo = e.target.result.split(',')[1]; // Only get the base64 part

            // Show loading indicator
            const loader = document.getElementById('loadingSpinner');
            loader.style.display = 'block';

            // Submit the job posting as raw JSON
            fetch('/api/jobs', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json' // Set Content-Type to application/json
                },
                body: JSON.stringify(jobData) // Send the data as a JSON string
            })
            .then(response => response.json())
            .then(data => {
                loader.style.display = 'none';
                if (data.message === 'Job posted successfully') {
                    alert(data.message);
                    window.location.href = '/agent-dashboard.html'; // Redirect after successful job post
                } else {
                    alert(data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                loader.style.display = 'none';
                alert('Error posting job. Please try again later.');
            });
        };
        reader.readAsDataURL(companyLogo);
    } else {
        // No logo selected, just submit the job without it
        const loader = document.getElementById('loadingSpinner');
        loader.style.display = 'block';

        fetch('/api/jobs', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json' // Set Content-Type to application/json
            },
            body: JSON.stringify(jobData) // Send the data as a JSON string
        })
        .then(response => response.json())
        .then(data => {
            loader.style.display = 'none';
            if (data.message === 'Job posted successfully') {
                alert(data.message);
                window.location.href = '/post-job.html'; // Redirect after successful job post
            } else {
                alert(data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            loader.style.display = 'none';
            alert('Error posting job. Please try again later.');
        });
    }
});
