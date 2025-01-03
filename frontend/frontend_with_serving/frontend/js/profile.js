document.getElementById('profile-form').addEventListener('submit', function(event) {
  event.preventDefault(); // Prevent the form from submitting the default way

  console.log('Form submitted');

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

  const formData = new FormData();
  
  // Append form data fields to FormData object
  formData.append('fullName', document.getElementById('fullName').value);
  formData.append('phone', document.getElementById('phone').value);
  formData.append('bio', document.getElementById('bio').value);
  formData.append('experienceRole', document.getElementById('experienceRole').value);
  formData.append('experienceCompany', document.getElementById('experienceCompany').value);
  formData.append('experienceYears', document.getElementById('experienceYears').value);
  formData.append('educationDegree', document.getElementById('educationDegree').value);
  formData.append('educationUniversity', document.getElementById('educationUniversity').value);
  formData.append('educationYear', document.getElementById('educationYear').value);
  formData.append('skills', document.getElementById('skills').value);
  formData.append('linkedin', document.getElementById('linkedin').value);
  formData.append('github', document.getElementById('github').value);
  formData.append('address', document.getElementById('address').value);

  const profileImage = document.getElementById('profileImage').files[0];
  const resume = document.getElementById('resume').files[0];

  // Validate required fields
  if (!document.getElementById('fullName').value) {
    alert('Full Name is required');
    return;
  }

  if (profileImage && !profileImage.type.startsWith('image/')) {
    alert('Please select a valid image file for profile picture.');
    return;
  }

  if (resume && resume.type !== 'application/pdf') {
    alert('Please select a valid PDF file for the resume.');
    return;
  }

  if (profileImage) {
    formData.append('profileImage', profileImage);
  }
  if (resume) {
    formData.append('resume', resume);
  }

  // Show loading indicator
  const loader = document.getElementById('loadingSpinner');
  loader.style.display = 'block';

  // Send the form data to the backend API using fetch
  fetch('/api/profile', {
    method: 'POST',
    body: formData,
    headers: {
      'Authorization': 'Bearer ' + token
    }
  })
  .then(response => {
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('token_expiry');
      window.location.href = '/login';
    }
    return response.json();
  })
  .then(data => {
    loader.style.display = 'none';

    const successMessage = document.getElementById('successMessage');
    successMessage.textContent = data.message;
    successMessage.style.display = 'block';
  })
  .catch(error => {
    console.error('Error:', error);
    alert('An error occurred while updating the profile. Please try again later.');
    loader.style.display = 'none';
  });
});
