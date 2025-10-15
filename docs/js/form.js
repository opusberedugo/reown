// Configuration
const FORM_SUBMIT_EMAIL = 'anengib@yahoo.com'; // Change this to your email
const FORM_SUBMIT_URL = `https://formsubmit.co/${FORM_SUBMIT_EMAIL}`;

// Get form elements
const form = document.querySelector('form[action="subscribe"]');
const emailInput = document.getElementById('email-input');
const submitButton = form.querySelector('button');

// Email validation regex
const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

// Handle form submission
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = emailInput.value.trim();
  
  // Validate email
  if (!email) {
    Swal.fire({
      icon: 'warning',
      title: 'Email Required',
      text: 'Please enter your email address',
      confirmButtonColor: '#1e1e1e'
    });
    emailInput.focus();
    return;
  }
  
  if (!emailRegex.test(email)) {
    Swal.fire({
      icon: 'error',
      title: 'Invalid Email',
      text: 'Please enter a valid email address',
      confirmButtonColor: '#1e1e1e'
    });
    emailInput.focus();
    return;
  }
  
  // Disable button and show loading state
  submitButton.disabled = true;
  submitButton.textContent = 'Subscribing...';
  
  try {
    const response = await fetch(FORM_SUBMIT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        subject: 'New Reown Waitlist Signup',
        message: `New waitlist signup from: ${email}`,
        _captcha: 'false'
      })
    });
    
    if (response.ok) {
      // Success
      Swal.fire({
        icon: 'success',
        title: 'Welcome to Reown!',
        text: 'Thank you for joining our waitlist. You\'ll be among the first to know when we launch!',
        confirmButtonColor: '#1e1e1e',
        confirmButtonText: 'Got it!'
      });
      emailInput.value = '';
    } else {
      throw new Error('Submission failed');
    }
  } catch (error) {
    console.error('Error:', error);
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'Something went wrong. Please try again later.',
      confirmButtonColor: '#1e1e1e'
    });
  } finally {
    // Re-enable button
    submitButton.disabled = false;
    submitButton.textContent = 'Subscribe';
  }
});