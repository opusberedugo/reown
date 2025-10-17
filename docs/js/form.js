// // Import Firestore
// import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// // import swal from 'sweetalert2'

// // Get Firestore instance (assuming 'app' is already initialized in your HTML)
// const db = getFirestore(window.app);

// // Get form element
// const form = document.querySelector('form');
// const emailInput = document.getElementById('email-input');

// // Handle form submission
// form.addEventListener('submit', async (e) => {
//   e.preventDefault();
  
//   const email = emailInput.value.trim();
  
//   // Basic email validation
//   if (!email || !isValidEmail(email)) {
//     swal("Invalid Email", "Please enter a valid email address.", "error");
//     return;
//   }
  
//   // Disable submit button to prevent double submission
//   const submitBtn = form.querySelector('button');
//   const originalText = submitBtn.textContent;
//   submitBtn.disabled = true;
//   submitBtn.textContent = 'Subscribing...';
  
//   try {
//     // Add document to Firestore
//     await addDoc(collection(db, "subscribers"), {
//       email: email,
//       subscribedAt: serverTimestamp(),
//       status: "pending"
//     });
    
//     // Success message
//     swal("Success!", "You've been added to the waitlist. We'll notify you when we launch!", "success");
    
//     // Clear form
//     emailInput.value = '';
    
//   } catch (error) {
//     console.error("Error adding subscriber:", error);
//     swal("Oops!", "Something went wrong. Please try again later.", "error");
//   } finally {
//     // Re-enable submit button
//     submitBtn.disabled = false;
//     submitBtn.textContent = originalText;
//   }
// });

// // Email validation helper
// function isValidEmail(email) {
//   const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
//   return re.test(email);
// }
// // const emailRegex = 


// Import Firestore
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// Initialize Firebase (since form.js loads as a module, we need to initialize here too)
const firebaseConfig = {
  apiKey: "AIzaSyDwjZipQHzQG96y-W563I-sTvJAbeFfJ6Y",
  authDomain: "reown-ca7aa.firebaseapp.com",
  projectId: "reown-ca7aa",
  storageBucket: "reown-ca7aa.firebasestorage.app",
  messagingSenderId: "557293711232",
  appId: "1:557293711232:web:99a9d093f17bf7888ddb65",
  measurementId: "G-ZYD5P3STLT"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Get form element
const form = document.querySelector('form');
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