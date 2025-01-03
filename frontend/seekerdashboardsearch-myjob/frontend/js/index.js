// Ensure the DOM is fully loaded before executing the script
document.addEventListener('DOMContentLoaded', function() {
    console.log('Script loaded');  // Debugging log
    
    // Redirect to login page when Find Job button is clicked
    document.getElementById('findJobBtn').addEventListener('click', function() {
      console.log('Find Job button clicked');
      window.location.href = 'login.html';  // This will redirect to login page
    });
  
    // Redirect to login page when Post Job button is clicked
    document.getElementById('postJobBtn').addEventListener('click', function() {
      console.log('Post Job button clicked');
      window.location.href = 'login.html';  // This will redirect to login page
    });
  });
  