// Import Firestore
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// Get Firestore instance (assuming 'app' is already initialized in your HTML)
const db = getFirestore(window.app);

// Get form element
const form = document.querySelector('form[action="subscribe"]');
const emailInput = document.getElementById('email-input');

// Handle form submission
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = emailInput.value.trim();
  
  // Basic email validation
  if (!email || !isValidEmail(email)) {
    swal("Invalid Email", "Please enter a valid email address.", "error");
    return;
  }
  
  // Disable submit button to prevent double submission
  const submitBtn = form.querySelector('button');
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Subscribing...';
  
  try {
    // Add document to Firestore
    await addDoc(collection(db, "subscribers"), {
      email: email,
      subscribedAt: serverTimestamp(),
      status: "pending"
    });
    
    // Success message
    swal("Success!", "You've been added to the waitlist. We'll notify you when we launch!", "success");
    
    // Clear form
    emailInput.value = '';
    
  } catch (error) {
    console.error("Error adding subscriber:", error);
    swal("Oops!", "Something went wrong. Please try again later.", "error");
  } finally {
    // Re-enable submit button
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
});

// Email validation helper
function isValidEmail(email) {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}
// const emailRegex = 