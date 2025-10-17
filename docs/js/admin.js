// Import Firebase modules from CDN
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js';
import { getFirestore, collection, getDocs, addDoc, query, where, doc, setDoc, collectionGroup } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js';

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDwjZipQHzQG96y-W563I-sTvJAbeFfJ6Y",
    authDomain: "reown-ca7aa.firebaseapp.com",
    projectId: "reown-ca7aa",
    storageBucket: "reown-ca7aa.firebasestorage.app",
    messagingSenderId: "557293711232",
    appId: "1:557293711232:web:99a9d093f17bf7888ddb65",
    measurementId: "G-ZYD5P3STLT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ============================================
// APPLICATION STATE
// ============================================
let selectedGroup = null;
let adminVerified = false;
let availableCollections = [];
let recipientCounts = {};

// ============================================
// ADMIN VERIFICATION
// ============================================
async function checkAdmin() {
    try {
        // Check if admins collection exists and has documents
        const adminsRef = collection(db, 'admins');
        const adminSnapshot = await getDocs(adminsRef);

        if (adminSnapshot.empty) {
            // No admin exists, create one
            const result = await Swal.fire({
                title: 'Create Admin Account',
                text: 'No admin found. Create the first admin account.',
                input: 'email',
                inputPlaceholder: 'Enter admin email',
                showCancelButton: true,
                confirmButtonText: 'Create Admin',
                confirmButtonColor: '#9b7fd4',
                allowOutsideClick: false,
                allowEscapeKey: false,
                inputValidator: (value) => {
                    if (!value || !isValidEmail(value)) {
                        return 'Please enter a valid email address';
                    }
                }
            });

            if (result.isConfirmed) {
                // Create admin document with email as document ID for easy lookup
                await setDoc(doc(db, 'admins', result.value), {
                    email: result.value,
                    createdAt: new Date().toISOString(),
                    role: 'admin'
                });

                await Swal.fire({
                    icon: 'success',
                    title: 'Admin Created!',
                    text: `Admin account created for ${result.value}`,
                    confirmButtonColor: '#9b7fd4'
                });

                adminVerified = true;
                return true;
            } else {
                // User cancelled, close the tab
                await Swal.fire({
                    icon: 'warning',
                    title: 'Access Denied',
                    text: 'Admin account required to access dashboard',
                    confirmButtonColor: '#9b7fd4'
                });
                window.close();
                return false;
            }
        } else {
            // Admin collection exists, verify email
            const result = await Swal.fire({
                title: 'Admin Login',
                text: 'Enter your admin email to access the dashboard',
                input: 'email',
                inputPlaceholder: 'Enter admin email',
                showCancelButton: true,
                confirmButtonText: 'Login',
                confirmButtonColor: '#9b7fd4',
                allowOutsideClick: false,
                allowEscapeKey: false,
                inputValidator: (value) => {
                    if (!value || !isValidEmail(value)) {
                        return 'Please enter a valid email address';
                    }
                }
            });

            if (result.isConfirmed) {
                const email = result.value;
                
                // Check if email exists in admins collection
                const adminQuery = query(adminsRef, where('email', '==', email));
                const adminCheck = await getDocs(adminQuery);

                if (!adminCheck.empty) {
                    adminVerified = true;
                    await Swal.fire({
                        icon: 'success',
                        title: 'Welcome!',
                        text: 'Access granted',
                        timer: 1500,
                        showConfirmButton: false
                    });
                    return true;
                } else {
                    await Swal.fire({
                        icon: 'error',
                        title: 'Access Denied',
                        text: 'Email not found in admin list',
                        confirmButtonColor: '#9b7fd4'
                    });
                    window.close();
                    return false;
                }
            } else {
                window.close();
                return false;
            }
        }
    } catch (error) {
        console.error('Admin check error:', error);
        await Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to verify admin access: ' + error.message,
            confirmButtonColor: '#9b7fd4'
        });
        window.close();
        return false;
    }
}

// Email validation helper
function isValidEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

// ============================================
// LOAD COLLECTIONS DYNAMICALLY
// ============================================
async function loadCollections() {
    try {
        // Get all collections that might contain emails
        // We'll check common collection names and exclude system collections
        const potentialCollections = ['subscribers', 'testers', 'customers', 'users', 'waitlist'];
        availableCollections = [];
        recipientCounts = {};

        for (const collectionName of potentialCollections) {
            try {
                const snapshot = await getDocs(collection(db, collectionName));
                if (snapshot.size > 0) {
                    // Check if documents have email field
                    let hasEmails = false;
                    snapshot.forEach(doc => {
                        if (doc.data().email) {
                            hasEmails = true;
                        }
                    });

                    if (hasEmails) {
                        availableCollections.push(collectionName);
                        recipientCounts[collectionName] = snapshot.size;
                    }
                }
            } catch (error) {
                // Collection might not exist or no permission, skip it
                console.log(`Skipping collection ${collectionName}:`, error.message);
            }
        }

        if (availableCollections.length === 0) {
            await Swal.fire({
                icon: 'info',
                title: 'No Collections Found',
                text: 'No email collections found in the database. Collections will appear here once you have subscribers.',
                confirmButtonColor: '#9b7fd4'
            });
        }

        return availableCollections;
    } catch (error) {
        console.error('Error loading collections:', error);
        await Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to load collections: ' + error.message,
            confirmButtonColor: '#9b7fd4'
        });
        return [];
    }
}

// ============================================
// RENDER UI DYNAMICALLY
// ============================================
function renderRecipientButtons() {
    const recipientGroup = document.querySelector('.recipient-group');
    recipientGroup.innerHTML = '';

    // Update stats
    const statsContainer = document.querySelector('.stats');
    statsContainer.innerHTML = '';

    availableCollections.forEach(collectionName => {
        // Add stat card
        const statCard = document.createElement('div');
        statCard.className = 'stat-card';
        statCard.innerHTML = `
            <div class="stat-value" id="${collectionName}-count">${recipientCounts[collectionName]}</div>
            <div class="stat-label">${capitalizeFirst(collectionName)}</div>
        `;
        statsContainer.appendChild(statCard);

        // Add recipient button
        const button = document.createElement('button');
        button.className = 'recipient-btn';
        button.dataset.group = collectionName;
        button.innerHTML = `
            <strong>${capitalizeFirst(collectionName)}</strong>
            <span class="recipient-count">${recipientCounts[collectionName]} recipients</span>
        `;
        
        button.addEventListener('click', () => {
            document.querySelectorAll('.recipient-btn').forEach(b => b.classList.remove('active'));
            button.classList.add('active');
            selectedGroup = collectionName;
        });

        recipientGroup.appendChild(button);
    });
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// ============================================
// PROCESS MESSAGE WITH LINKS
// ============================================
function processMessage(message) {
    // Convert {{link:URL|Text}} to HTML links styled with theme color
    return message.replace(/\{\{link:([^|]+)\|([^}]+)\}\}/g, 
        '<a href="$1" style="color: #9b7fd4; text-decoration: none; font-weight: 500;">$2</a>');
}

// ============================================
// SEND EMAIL CAMPAIGN
// ============================================
async function sendEmailCampaign(subject, message, recipientGroup) {
    try {
        // Get recipients from Firestore
        const recipientsSnapshot = await getDocs(collection(db, recipientGroup));
        
        if (recipientsSnapshot.empty) {
            await Swal.fire({
                icon: 'warning',
                title: 'No Recipients',
                text: `No ${recipientGroup} found in the database`,
                confirmButtonColor: '#9b7fd4'
            });
            return;
        }

        const recipients = [];
        recipientsSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.email) {
                recipients.push(data.email);
            }
        });

        if (recipients.length === 0) {
            await Swal.fire({
                icon: 'warning',
                title: 'No Email Addresses',
                text: `No valid email addresses found in ${recipientGroup}`,
                confirmButtonColor: '#9b7fd4'
            });
            return;
        }

        // Process message to add styled links
        const processedMessage = processMessage(message);

        // Add to mail collection for Trigger Email extension
        for (const email of recipients) {
            await addDoc(collection(db, 'mail'), {
                to: email,
                message: {
                    subject: subject,
                    html: `
                        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                            <div style="text-align: center; margin-bottom: 30px;">
                                <h1 style="color: #9b7fd4; letter-spacing: 0.3rem; font-weight: 300;">REOWN</h1>
                            </div>
                            <div style="background: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 8px rgba(155, 127, 212, 0.1);">
                                <div style="color: #2d2d2d; line-height: 1.6; white-space: pre-wrap;">${processedMessage}</div>
                            </div>
                            <div style="text-align: center; margin-top: 30px; color: #6b6b6b; font-size: 0.85rem;">
                                <p>Sent via REOWN Email Dashboard</p>
                            </div>
                        </div>
                    `
                },
                createdAt: new Date().toISOString()
            });
        }

        await Swal.fire({
            icon: 'success',
            title: 'Emails Sent!',
            text: `Successfully queued ${recipients.length} email(s) to ${recipientGroup}`,
            confirmButtonColor: '#9b7fd4'
        });

        // Reset form
        document.getElementById('email-form').reset();
        document.querySelectorAll('.recipient-btn').forEach(b => b.classList.remove('active'));
        selectedGroup = null;

    } catch (error) {
        console.error('Send error:', error);
        await Swal.fire({
            icon: 'error',
            title: 'Send Failed',
            text: error.message,
            confirmButtonColor: '#9b7fd4'
        });
    }
}

// ============================================
// FORM SUBMISSION
// ============================================
document.getElementById('email-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!selectedGroup) {
        await Swal.fire({
            icon: 'warning',
            title: 'Select Recipients',
            text: 'Please select a recipient group first',
            confirmButtonColor: '#9b7fd4'
        });
        return;
    }

    const subject = document.getElementById('subject').value.trim();
    const message = document.getElementById('message').value.trim();

    if (!subject || !message) {
        await Swal.fire({
            icon: 'warning',
            title: 'Missing Information',
            text: 'Please fill in both subject and message',
            confirmButtonColor: '#9b7fd4'
        });
        return;
    }

    const result = await Swal.fire({
        title: 'Confirm Send',
        text: `Send to all ${recipientCounts[selectedGroup]} recipients in ${selectedGroup}?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Send',
        confirmButtonColor: '#9b7fd4',
        cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
        const loading = document.getElementById('loading');
        const sendBtn = document.getElementById('send-btn');
        
        loading.classList.add('active');
        sendBtn.disabled = true;

        await sendEmailCampaign(subject, message, selectedGroup);

        loading.classList.remove('active');
        sendBtn.disabled = false;
    }
});

// ============================================
// INITIALIZE APPLICATION
// ============================================
async function init() {
    const adminExists = await checkAdmin();
    if (adminExists && adminVerified) {
        await loadCollections();
        renderRecipientButtons();
    }
}

// Start the application
init();