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

// Initialize Quill editor
const quill = new Quill('#jobDescriptionEditor', {
    theme: 'snow', // or 'bubble'
    placeholder: 'Enter job description...',
    modules: {
        toolbar: [
            ['bold', 'italic', 'underline'], // Formatting options
            ['link', 'image'], // Insert options
            [{ 'list': 'ordered' }, { 'list': 'bullet' }], // List options
            [{ 'align': [] }], // Text alignment
        ]
    }
});

// Add event listener to handle form submission
document.getElementById('postJobForm').addEventListener('submit', async function (event) {
    event.preventDefault(); // Prevent default form submission

    // Get the Quill editor content
    const jobDescriptionContent = quill.root.innerHTML.trim();

    // Validate Quill content
    if (!jobDescriptionContent || jobDescriptionContent === '<p><br></p>') {
        alert('Job description cannot be empty.');
        return;
    }

    // Gather other form data
    const companyName = document.getElementById('companyName').value.trim();
    const jobTitle = document.getElementById('jobTitle').value.trim();
    const location = document.getElementById('location').value.trim();
    const salary = document.getElementById('salary').value.trim();
    const skills = document.getElementById('skills').value
        .split(',')
        .map(skill => skill.trim())
        .filter(skill => skill); // Remove empty entries
    const jobType = document.getElementById('jobType').value.trim().toLowerCase(); // Ensure lowercase
    const remote = document.getElementById('remote').checked;

    // Validate required fields
    if (!companyName || !jobTitle || !location || !salary || skills.length === 0 || !jobType) {
        alert('Please fill in all required fields.');
        return;
    }

    // Create FormData object
    const formData = new FormData();
    formData.append('companyName', companyName);
    formData.append('jobTitle', jobTitle);
    formData.append('description', jobDescriptionContent);
    formData.append('location', location);
    formData.append('salary', salary);
    formData.append('type', jobType);
    formData.append('remote', remote);
    formData.append('skills', JSON.stringify(skills));

    // Handle logo upload
    const companyLogo = document.getElementById('companyLogo').files[0];
    if (companyLogo) {
        formData.append('companyLogo', companyLogo);
    }

    try {
        // Retrieve token from localStorage
        const authToken = localStorage.getItem('authToken');
        console.log('Auth Token:', authToken);

        // Check for missing token
        if (!authToken) {
            alert('Authentication token is missing. Please log in.');
            return;
        }

        // Make the API request
        const response = await fetch('http://localhost:5000/api/jobs', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${authToken}` // Attach the token
            },
            body: formData // Send form data
        });

        // Handle the response
        const result = await response.json();
        if (response.ok) {
            alert('Job posted successfully!');
            console.log(result);

            // Reset the form
            document.getElementById('postJobForm').reset();
            quill.root.innerHTML = ''; // Clear Quill editor
            document.getElementById('logoPreview').style.display = 'none'; // Hide logo preview
        } else {
            console.error('Error response:', result);
            alert(`Error: ${result.message || 'Something went wrong.'}`);
        }
    } catch (err) {
        console.error('Error posting job:', err);
        alert('An error occurred while posting the job. Please try again.');
    }
});
