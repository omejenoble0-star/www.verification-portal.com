// ===== State Management =====
let currentUser = null;
let verificationData = {
	fullName: '',
	nin: '',
	phone: '',
	email: '',
	position: '',
};

// ===== Initial Setup =====
document.addEventListener('DOMContentLoaded', function () {
	showLogin();
	setupEventListeners();
});

// ===== Event Listeners =====
function setupEventListeners() {
	// Password input to show strength meter
	const passwordInput = document.getElementById('password');
	if (passwordInput) {
		passwordInput.addEventListener('input', updatePasswordStrength);
	}

	// Real-time form validation
	const signupForm = document.getElementById('signupForm');
	if (signupForm) {
		signupForm.addEventListener('input', function () {
			validateForm();
		});
	}
}

// ===== Authentication Functions =====
function showLogin() {
	// Hide all pages
	document.getElementById('signupPage').classList.remove('active');
	document.getElementById('homePage').classList.remove('active');

	// Show login popup
	document.getElementById('loginPopup').classList.add('active');
}

function showSignup() {
	document.getElementById('loginPopup').classList.remove('active');
	document.getElementById('signupPage').classList.add('active');

	// Reset form
	document.getElementById('signupForm').reset();
	document
		.getElementById('password')
		.classList.remove('strength-weak', 'strength-medium', 'strength-strong');
}

function handleSignup(event) {
	event.preventDefault();

	const username = document.getElementById('username').value.trim();
	const password = document.getElementById('password').value;
	const confirmPassword = document.getElementById('confirmPassword').value;
	const terms = document.getElementById('terms').checked;

	// Validation
	if (username.length < 3) {
		showNotification('Full name must be at least 3 characters', 'error');
		return;
	}

	if (password.length < 6) {
		showNotification('Password must be at least 6 characters', 'error');
		return;
	}

	if (password !== confirmPassword) {
		showNotification('Passwords do not match', 'error');
		return;
	}

	if (!terms) {
		showNotification('Please accept the terms and conditions', 'error');
		return;
	}

	// Store user data
	currentUser = {
		name: username,
		password: password,
		createdAt: new Date(),
	};

	// Animate form submission
	const signupForm = document.getElementById('signupForm');
	signupForm.style.opacity = '0.6';
	signupForm.style.pointerEvents = 'none';

	// Simulate server delay
	setTimeout(() => {
		goToHome();
		showNotification('Account created successfully!', 'success');
	}, 1000);
}

function goToHome() {
	document.getElementById('signupPage').classList.remove('active');
	document.getElementById('loginPopup').classList.remove('active');
	document.getElementById('homePage').classList.add('active');

	if (currentUser) {
		updateUserGreeting();
	}

	// Reset any open modals
	document.getElementById('verificationPopup').classList.remove('active');
	document.getElementById('faceVerificationPopup').classList.remove('active');
	document.getElementById('successPopup').classList.remove('active');
}

function updateUserGreeting() {
	const greeting = document.getElementById('userGreeting');
	const avatar = document.getElementById('userAvatar');

	if (currentUser) {
		const firstName = currentUser.name.split(' ')[0];
		greeting.textContent = `Hello, ${firstName}`;

		// Create initials
		const names = currentUser.name.split(' ');
		const initials =
			(names[0]?.charAt(0) || '') + (names[names.length - 1]?.charAt(0) || '');
		avatar.textContent = initials.toUpperCase();
	}
}

function handleLogout() {
	// Show styled logout modal instead of alert
	document.getElementById('logoutModal').classList.add('active');
}

// ===== Verification Process =====
function showVerificationForm() {
	document.getElementById('verificationPopup').classList.add('active');
}

function closeVerificationPopup() {
	document.getElementById('verificationPopup').classList.remove('active');
	document.getElementById('verificationForm').reset();
}

function handleVerificationSubmit(event) {
	event.preventDefault();

	// Collect form data
	verificationData.fullName = document.getElementById('fullName').value;
	verificationData.nin = document.getElementById('nin').value;
	verificationData.phone = document.getElementById('phone').value;
	verificationData.email = document.getElementById('email').value;
	verificationData.position = document.getElementById('position').value;

	// Validate
	if (
		!verificationData.fullName ||
		!verificationData.nin ||
		!verificationData.phone ||
		!verificationData.email ||
		!verificationData.position
	) {
		showNotification('Please fill in all fields', 'error');
		return;
	}

	// Validate NIN format (simple check)
	if (verificationData.nin.length < 11) {
		showNotification('NIN must be at least 11 digits', 'error');
		return;
	}

	// Validate phone
	if (verificationData.phone.length < 10) {
		showNotification('Phone number must be at least 10 digits', 'error');
		return;
	}

	// Animate submission
	const verificationForm = document.getElementById('verificationForm');
	verificationForm.style.opacity = '0.6';
	verificationForm.style.pointerEvents = 'none';

	setTimeout(() => {
		closeVerificationPopup();
		verificationForm.style.opacity = '1';
		verificationForm.style.pointerEvents = 'auto';

		// Show face verification popup
		setTimeout(() => {
			showFaceVerification();
		}, 300);
	}, 800);
}

function showFaceVerification() {
	document.getElementById('faceVerificationPopup').classList.add('active');
}

function closeFaceVerification() {
	document.getElementById('faceVerificationPopup').classList.remove('active');
}

function startFaceVerification() {
	// This function is no longer used - capture happens directly
}

function captureFace() {
	const canvas = document.getElementById('faceCanvas');
	const ctx = canvas.getContext('2d');
	const cameraPlaceholder = document.querySelector('.camera-placeholder');
	const captureBtn = document.getElementById('captureBtn');

	// Disable button
	captureBtn.disabled = true;
	captureBtn.style.opacity = '0.6';

	// Create progress bar container
	const progressContainer = document.createElement('div');
	progressContainer.className = 'capture-progress-container';
	progressContainer.style.cssText = `
		width: 100%;
		margin-top: 15px;
		text-align: center;
	`;

	const progressLabel = document.createElement('p');
	progressLabel.textContent = 'Capturing Face...';
	progressLabel.style.cssText = `
		color: var(--purple-main);
		font-size: 14px;
		font-weight: 600;
		margin-bottom: 10px;
	`;

	const progressBar = document.createElement('div');
	progressBar.style.cssText = `
		width: 100%;
		height: 6px;
		background: var(--purple-lighter);
		border-radius: 10px;
		overflow: hidden;
	`;

	const progressFill = document.createElement('div');
	progressFill.style.cssText = `
		height: 100%;
		background: linear-gradient(90deg, var(--purple-main), var(--purple-light));
		width: 0%;
		transition: width 0.1s linear;
	`;

	progressBar.appendChild(progressFill);
	progressContainer.appendChild(progressLabel);
	progressContainer.appendChild(progressBar);
	captureBtn.parentElement.appendChild(progressContainer);

	// Animate progress bar (3 seconds for capture)
	let progress = 0;
	const captureInterval = setInterval(() => {
		progress += Math.random() * 35;
		if (progress > 100) progress = 100;
		progressFill.style.width = progress + '%';

		if (progress >= 100) {
			clearInterval(captureInterval);
			// Now draw the face on canvas
			drawFaceOnCanvas(canvas, ctx);

			// Hide placeholder and button
			cameraPlaceholder.style.display = 'none';
			captureBtn.style.display = 'none';

			// Update label and start processing
			progressLabel.textContent = 'Processing Face...';
			progressFill.style.width = '100%';

			// Processing phase (2 seconds)
			setTimeout(() => {
				progressLabel.textContent = 'Face Verified Successfully!';
				progressLabel.style.color = 'var(--success-green)';
				progressFill.style.background =
					'linear-gradient(90deg, var(--success-green), #34d399)';

				// Final success
				setTimeout(() => {
					closeFaceVerification();
					updateVerificationStatus();
					showSuccessPopup();

					// Reset for next time
					canvas.style.display = 'none';
					cameraPlaceholder.style.display = 'flex';
					captureBtn.style.display = 'block';
					captureBtn.disabled = false;
					captureBtn.style.opacity = '1';
					progressContainer.remove();
				}, 1500);
			}, 2000);
		}
	}, 100);
}

function drawFaceOnCanvas(canvas, ctx) {
	const w = canvas.width;
	const h = canvas.height;
	const centerX = w / 2;
	const centerY = h / 2.1;

	// Background with gradient
	const bgGradient = ctx.createLinearGradient(0, 0, 0, h);
	bgGradient.addColorStop(0, '#F3E8FF');
	bgGradient.addColorStop(1, '#E9D5FF');
	ctx.fillStyle = bgGradient;
	ctx.fillRect(0, 0, w, h);

	// Draw head with gradient for realistic look
	const headGradient = ctx.createLinearGradient(
		centerX - 85,
		centerY - 120,
		centerX + 85,
		centerY + 120,
	);
	headGradient.addColorStop(0, '#F5D9C6');
	headGradient.addColorStop(0.5, '#ECC9B0');
	headGradient.addColorStop(1, '#E8BFA0');

	// Face oval
	ctx.fillStyle = headGradient;
	ctx.beginPath();
	ctx.ellipse(centerX, centerY, 85, 125, 0, 0, Math.PI * 2);
	ctx.fill();

	// Face shadow for depth
	ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
	ctx.beginPath();
	ctx.ellipse(centerX, centerY + 5, 85, 125, 0, 0, Math.PI * 2);
	ctx.fill();

	// Ears
	ctx.fillStyle = '#E0C4AA';
	ctx.beginPath();
	ctx.ellipse(centerX - 90, centerY - 20, 18, 35, 0, 0, Math.PI * 2);
	ctx.fill();
	ctx.beginPath();
	ctx.ellipse(centerX + 90, centerY - 20, 18, 35, 0, 0, Math.PI * 2);
	ctx.fill();

	// Eyes background
	const eyeY = centerY - 35;
	ctx.fillStyle = '#FFFFFF';
	ctx.beginPath();
	ctx.ellipse(centerX - 28, eyeY, 14, 18, 0, 0, Math.PI * 2);
	ctx.fill();
	ctx.beginPath();
	ctx.ellipse(centerX + 28, eyeY, 14, 18, 0, 0, Math.PI * 2);
	ctx.fill();

	// Iris
	ctx.fillStyle = '#5B7C99';
	ctx.beginPath();
	ctx.arc(centerX - 28, eyeY + 2, 8, 0, Math.PI * 2);
	ctx.fill();
	ctx.beginPath();
	ctx.arc(centerX + 28, eyeY + 2, 8, 0, Math.PI * 2);
	ctx.fill();

	// Pupils with shine
	ctx.fillStyle = '#1A1A2E';
	ctx.beginPath();
	ctx.arc(centerX - 28, eyeY + 2, 5, 0, Math.PI * 2);
	ctx.fill();
	ctx.beginPath();
	ctx.arc(centerX + 28, eyeY + 2, 5, 0, Math.PI * 2);
	ctx.fill();

	// Eye shine
	ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
	ctx.beginPath();
	ctx.arc(centerX - 26, eyeY, 2.5, 0, Math.PI * 2);
	ctx.fill();
	ctx.beginPath();
	ctx.arc(centerX + 30, eyeY, 2.5, 0, Math.PI * 2);
	ctx.fill();

	// Eyebrows
	ctx.strokeStyle = '#8B6F47';
	ctx.lineWidth = 2.5;
	ctx.lineCap = 'round';
	ctx.beginPath();
	ctx.arc(centerX - 28, eyeY - 18, 16, Math.PI * 0.7, Math.PI * 0.3, false);
	ctx.stroke();
	ctx.beginPath();
	ctx.arc(centerX + 28, eyeY - 18, 16, Math.PI * 0.7, Math.PI * 0.3, false);
	ctx.stroke();

	// Nose shadow
	ctx.strokeStyle = '#D9B099';
	ctx.lineWidth = 2;
	ctx.lineCap = 'round';
	ctx.beginPath();
	ctx.moveTo(centerX, centerY - 15);
	ctx.lineTo(centerX, centerY + 15);
	ctx.stroke();

	// Nose tip
	ctx.fillStyle = '#D4A574';
	ctx.beginPath();
	ctx.ellipse(centerX - 6, centerY + 15, 4, 6, 0, 0, Math.PI * 2);
	ctx.fill();
	ctx.beginPath();
	ctx.ellipse(centerX + 6, centerY + 15, 4, 6, 0, 0, Math.PI * 2);
	ctx.fill();

	// Mouth
	ctx.strokeStyle = '#C1897B';
	ctx.lineWidth = 2.5;
	ctx.lineCap = 'round';
	ctx.beginPath();
	ctx.arc(centerX, centerY + 45, 22, 0, Math.PI, false);
	ctx.stroke();

	// Mouth fill
	ctx.fillStyle = 'rgba(193, 137, 123, 0.15)';
	ctx.beginPath();
	ctx.arc(centerX, centerY + 45, 22, 0, Math.PI, false);
	ctx.fill();

	// Cheeks blush
	ctx.fillStyle = 'rgba(234, 128, 128, 0.15)';
	ctx.beginPath();
	ctx.ellipse(centerX - 50, centerY + 10, 20, 15, 0, 0, Math.PI * 2);
	ctx.fill();
	ctx.beginPath();
	ctx.ellipse(centerX + 50, centerY + 10, 20, 15, 0, 0, Math.PI * 2);
	ctx.fill();

	// Neck
	ctx.fillStyle = '#E8BFA0';
	ctx.fillRect(centerX - 30, centerY + 115, 60, 40);

	// Show canvas
	canvas.style.display = 'block';
}

function showSuccessPopup() {
	document.getElementById('successPopup').classList.add('active');
}

// ===== Form Utilities =====
function updatePasswordStrength() {
	const password = document.getElementById('password').value;
	const strengthMeter = document.querySelector('.strength-meter');
	const strengthText = document.querySelector('.strength-text');

	let strength = 'weak';
	let score = 0;

	if (password.length >= 8) score++;
	if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
	if (/\d/.test(password)) score++;
	if (/[@$!%*?&]/.test(password)) score++;

	if (score >= 3) strength = 'strong';
	else if (score >= 2) strength = 'medium';

	strengthMeter.className = 'strength-meter ' + strength;
	strengthText.textContent = `Password strength: ${strength}`;
}

function validateForm() {
	const username = document.getElementById('username').value.trim();
	const password = document.getElementById('password').value;
	const confirmPassword = document.getElementById('confirmPassword').value;
	const terms = document.getElementById('terms').checked;

	const submitBtn = document.querySelector('#signupForm .btn-primary');

	const isValid =
		username.length >= 3 &&
		password.length >= 6 &&
		password === confirmPassword &&
		terms;

	submitBtn.disabled = !isValid;
	submitBtn.style.opacity = isValid ? '1' : '0.6';
}

function togglePasswordVisibility() {
	const passwordInput = document.getElementById('password');
	const toggleBtn = document.querySelector('.toggle-password');

	if (passwordInput.type === 'password') {
		passwordInput.type = 'text';
		toggleBtn.textContent = '🙈';
	} else {
		passwordInput.type = 'password';
		toggleBtn.textContent = '👁️';
	}
}

// ===== Notification System =====
function showNotification(message, type = 'info') {
	const notification = document.createElement('div');
	notification.className = `notification notification-${type}`;
	notification.textContent = message;

	notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${
					type === 'success' ? '#10B981'
					: type === 'error' ? '#EF4444'
					: '#3B82F6'
				};
        color: white;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        animation: slideInUp 0.3s ease;
        z-index: 2000;
        max-width: 300px;
        word-wrap: break-word;
        font-weight: 500;
    `;

	document.body.appendChild(notification);

	setTimeout(() => {
		notification.style.animation = 'fadeOut 0.3s ease';
		setTimeout(() => {
			notification.remove();
		}, 300);
	}, 3000);
}

// Add fade out animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from {
            opacity: 1;
        }
        to {
            opacity: 0;
            transform: translateY(10px);
        }
    }
`;
document.head.appendChild(style);

// ===== Input Validation =====
// NIN validation
document.addEventListener('DOMContentLoaded', function () {
	const ninInput = document.getElementById('nin');
	if (ninInput) {
		ninInput.addEventListener('input', function (e) {
			this.value = this.value.replace(/\D/g, '').slice(0, 20);
		});
	}

	// Phone validation
	const phoneInput = document.getElementById('phone');
	if (phoneInput) {
		phoneInput.addEventListener('input', function (e) {
			this.value = this.value.replace(/\D/g, '').slice(0, 15);
		});
	}
});

// ===== Smooth Scroll Behavior =====
document.documentElement.style.scrollBehavior = 'smooth';

// ===== Keyboard Navigation =====
document.addEventListener('keydown', function (e) {
	if (e.key === 'Escape') {
		closeVerificationPopup();
		closeFaceVerification();
	}
});

// ===== Performance Optimization =====
// Debounce function for resize events
function debounce(func, wait) {
	let timeout;
	return function executedFunction(...args) {
		const later = () => {
			clearTimeout(timeout);
			func(...args);
		};
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
	};
}

// Handle window resize
window.addEventListener(
	'resize',
	debounce(function () {
		// Adjust layout if needed
	}, 250),
);

// ===== Additional Features =====
// Prevent form submission on enter in non-form inputs
document.addEventListener('keypress', function (e) {
	if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
		const form = e.target.closest('form');
		if (form) {
			form.dispatchEvent(new Event('submit'));
		}
	}
});

// ===== Local Storage Integration (Optional) =====
function saveUserData() {
	if (currentUser) {
		localStorage.setItem('currentUser', JSON.stringify(currentUser));
	}
}

function loadUserData() {
	const saved = localStorage.getItem('currentUser');
	if (saved) {
		currentUser = JSON.parse(saved);
		return true;
	}
	return false;
}

// Auto-save user data
window.addEventListener('beforeunload', saveUserData);

// ===== Logout Modal Functions =====
function cancelLogout() {
	document.getElementById('logoutModal').classList.remove('active');
}

function confirmLogout() {
	// Close modal
	document.getElementById('logoutModal').classList.remove('active');

	// Reset data
	currentUser = null;
	verificationData = {
		fullName: '',
		nin: '',
		phone: '',
		email: '',
		position: '',
	};

	// Close all popups and pages
	document.getElementById('successPopup').classList.remove('active');
	document.getElementById('faceVerificationPopup').classList.remove('active');
	document.getElementById('verificationPopup').classList.remove('active');
	document.getElementById('homePage').classList.remove('active');

	// Show login with notification
	showLogin();
	showNotification('Logged out successfully', 'success');
}

// ===== Verification Status Update =====
function updateVerificationStatus() {
	// Update step 2 to completed
	const step2 = document.querySelectorAll('.step')[1];
	const step2Icon = step2.querySelector('.step-icon');
	step2Icon.classList.remove('pending');
	step2Icon.classList.add('completed');
	step2Icon.textContent = '✓';

	// Update step 3 to completed
	const step3 = document.querySelectorAll('.step')[2];
	const step3Icon = step3.querySelector('.step-icon');
	step3Icon.classList.remove('pending');
	step3Icon.classList.add('completed');
	step3Icon.textContent = '✓';

	// Update status circle
	const statusCircle = document.querySelector('.status-circle');
	statusCircle.classList.remove('pending');
	statusCircle.classList.add('completed');

	// Update card subtitle
	const cardSubtitle = document.querySelector('.card-subtitle');
	cardSubtitle.textContent = '✓ All verifications completed successfully!';
	cardSubtitle.style.color = 'var(--success-green)';
	cardSubtitle.style.fontWeight = '600';

	// Hide verification button and show completion message
	const verificationBtn = document.querySelector(
		'[onclick="showVerificationForm()"]',
	);
	verificationBtn.style.display = 'none';

	// Add completion message
	const verificationCard = document.querySelector('.verification-card');
	if (!verificationCard.querySelector('.completion-badge')) {
		const completionBadge = document.createElement('div');
		completionBadge.className = 'completion-badge';
		completionBadge.style.cssText = `
			background: linear-gradient(135deg, var(--success-green), #059669);
			color: white;
			padding: 15px 20px;
			border-radius: 10px;
			text-align: center;
			font-weight: 600;
			margin-top: 20px;
			animation: slideInUp 0.4s ease;
		`;
		completionBadge.textContent = '🎉 Verification Completed!';
		verificationCard.appendChild(completionBadge);
	}
}
