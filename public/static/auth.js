// ================= BACKEND CONFIG =================

const API_BASE_URL = "/api";

const API_ENDPOINTS = {
  signup: "/auth/signup",
  login: "/auth/login",
  forgotPassword: "/auth/forgot-password",
  verifyOtp: "/auth/verify-otp",
  resetPassword: "/auth/reset-password"
};


// Common function for all backend requests
async function apiRequest(endpoint, options = {}) {

  const response = await fetch(
    API_BASE_URL + endpoint,
    {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      },
      credentials: "include",
      ...options
    }
  );

  let data;

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(
      data.message || "Something went wrong."
    );
  }

  return data;
}


//password toggle
document.querySelectorAll('.pw-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = btn.parentElement.querySelector('input');
    const isPw = input.type === 'password';
    input.type = isPw ? 'text' : 'password';
    btn.innerHTML = isPw
      ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>'
      : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-6.5 0-10-7-10-7a18.6 18.6 0 0 1 4.22-5.06M9.9 4.24A10.6 10.6 0 0 1 12 4c6.5 0 10 7 10 7a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><path d="M1 1l22 22"/></svg>';
  });
})

// ---------- signup: two-step role-first flow ----------
const stepRole = document.getElementById('stepRole');
const stepForm = document.getElementById('stepForm');
const stepBack = document.getElementById('stepBack');
const roleCards = document.querySelectorAll('.role-card');
const workerFields = document.getElementById('workerFields');
const addressField = document.getElementById('addressField');
const rolePill = document.getElementById('rolePill');
const formHeading = document.getElementById('formHeading');
const formSub = document.getElementById('formSub');
const submitBtn = document.getElementById('submitBtn');

const params = new URLSearchParams(window.location.search);
let selectedRole = params.get('role');

if (selectedRole === 'worker') {
  stepRole.classList.remove('active');
  stepForm.classList.add('active');

  workerFields.hidden = false;
  addressField.hidden = true;

  rolePill.textContent = 'Worker account';
  formHeading.textContent = 'Set up your pro profile';
  formSub.textContent = 'Share your work details so customers can find and trust you.';
  submitBtn.textContent = 'Create worker account';
}

if (stepRole && stepForm) {
  roleCards.forEach(card => {
    card.addEventListener('click', () => {
      const role = card.dataset.role;
       selectedRole = role
      stepRole.classList.remove('active');
      stepForm.classList.add('active');

      if (role === 'worker') {
        workerFields.hidden = false;
        addressField.hidden = true;
        rolePill.textContent = 'Worker account';
        formHeading.textContent = 'Set up your pro profile';
        formSub.textContent = 'Share your work details so customers can find and trust you.';
        submitBtn.textContent = 'Create worker account';
      } else {
        workerFields.hidden = true;
        addressField.hidden = false;
        rolePill.textContent = 'Customer account';
        formHeading.textContent = 'Create your account';
        formSub.textContent = 'Tell us a bit about yourself to get started.';
        submitBtn.textContent = 'Create account';
      }
    });
  });

  if (stepBack) {
    stepBack.addEventListener('click', () => {
      stepForm.classList.remove('active');
      stepRole.classList.add('active');
    });
  }
}
const signupForm = document.getElementById("signupForm");
// ---------- signup form ----------

if (signupForm) {

  signupForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const password = document.getElementById("password").value;

    const signupData = {
      role: selectedRole,
      fullName: fullName,
      email: email,
      phone: phone,
      password: password
    };


    // Customer ka data
    if (selectedRole === "customer") {

      signupData.address =
        document.getElementById("address").value.trim();

    }


    // Worker ka data
    if (selectedRole === "worker") {

      signupData.fieldOfWork =
        document.getElementById("fieldOfWork").value;

      signupData.experience =
        Number(document.getElementById("experience").value);

      signupData.workLocation =
        document.getElementById("workLocation").value.trim();

    }


    try {
      const result = await apiRequest(API_ENDPOINTS.signup, {
        method: "POST",
        body: JSON.stringify(signupData)
      });

      if (result.accessToken) {
        localStorage.setItem("accessToken", result.accessToken);
      }

      alert(result.message || "Account created successfully.");
      window.location.href = "./login.html";
    } catch (error) {
      console.error("Signup error:", error);
      alert(error.message);
    }

  });

}

// ---------- LOGIN ----------

const loginForm = document.getElementById("loginForm");

if (loginForm) {

  loginForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    const loginData = {
      email: email,
      password: password
    };

    try {

      const result = await apiRequest(API_ENDPOINTS.login, {
        method: "POST",
        body: JSON.stringify(loginData)
      });

      console.log("Login successful:", result);

     // TODO: Redirect to customer/worker dashboard after dashboard pages are created
      window.location.href = "./customerhomepage.html";

    } catch (error) {

      console.error("Login error:", error);

      alert(error.message);

    }

  });

}
// ---------- forgot password: multi-step flow ----------
const stepIdentify = document.getElementById('stepIdentify');
const stepOtp = document.getElementById('stepOtp');
const stepReset = document.getElementById('stepReset');
const stepSuccess = document.getElementById('stepSuccess');
 
if (stepIdentify) {
  const methodButtons = document.querySelectorAll('.method-btn');
  const emailField = document.getElementById('identifyEmailField');
  const phoneField = document.getElementById('identifyPhoneField');
  const otpSentTo = document.getElementById('otpSentTo');
  let currentMethod = 'email';
 
  methodButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      methodButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentMethod = btn.dataset.method;
      emailField.hidden = currentMethod !== 'email';
      phoneField.hidden = currentMethod !== 'phone';
    });
  });
 
  function maskEmail(email) {
    const [user, domain] = email.split('@');
    if (!domain) return email;
    const visible = user.slice(0, 2);
    return `${visible}${'*'.repeat(Math.max(user.length - 2, 3))}@${domain}`;
  }
  function maskPhone(phone) {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 4) return phone;
    return `${'*'.repeat(digits.length - 2)}${digits.slice(-2)}`;
  }
 
  document.getElementById('identifyForm').addEventListener('submit', () => {
    if (currentMethod === 'email') {
      const val = document.getElementById('resetEmail').value || 'you@example.com';
      otpSentTo.innerHTML = `We've sent a 6-digit code to <strong>${maskEmail(val)}</strong>.`;
    } else {
      const val = document.getElementById('resetPhone').value || '9876543210';
      otpSentTo.innerHTML = `We've sent a 6-digit code to <strong>${maskPhone(val)}</strong>.`;
    }
    stepIdentify.classList.remove('active');
    stepOtp.classList.add('active');
    startResendTimer();
    const firstBox = document.querySelector('.otp-box');
    if (firstBox) firstBox.focus();
  });
 
  document.getElementById('otpBack').addEventListener('click', () => {
    stepOtp.classList.remove('active');
    stepIdentify.classList.add('active');
  });
}
 
// OTP box auto-advance + backspace navigation
const otpBoxes = document.querySelectorAll('.otp-box');
otpBoxes.forEach((box, i) => {
  box.addEventListener('input', () => {
    box.value = box.value.replace(/\D/g, '').slice(0, 1);
    if (box.value && otpBoxes[i + 1]) otpBoxes[i + 1].focus();
  });
  box.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace' && !box.value && otpBoxes[i - 1]) {
      otpBoxes[i - 1].focus();
    }
  });
});
 
// resend timer
let resendInterval;
function startResendTimer() {
  const timerEl = document.getElementById('resendTimer');
  const timerWrap = document.getElementById('resendTimerWrap');
  const resendBtn = document.getElementById('resendBtn');
  if (!timerEl) return;
  let seconds = 30;
  timerEl.textContent = '0:30';
  resendBtn.hidden = true;
  timerWrap.hidden = false;
  clearInterval(resendInterval);
  resendInterval = setInterval(() => {
    seconds--;
    timerEl.textContent = `0:${seconds.toString().padStart(2, '0')}`;
    if (seconds <= 0) {
      clearInterval(resendInterval);
      timerWrap.hidden = true;
      resendBtn.hidden = false;
    }
  }, 1000);
}
const resendBtn = document.getElementById('resendBtn');
if (resendBtn) {
  resendBtn.addEventListener('click', () => {
    otpBoxes.forEach(b => b.value = '');
    if (otpBoxes[0]) otpBoxes[0].focus();
    startResendTimer();
  });
}
 
if (stepOtp) {
  document.getElementById('otpForm').addEventListener('submit', () => {
    clearInterval(resendInterval);
    stepOtp.classList.remove('active');
    stepReset.classList.add('active');
  });
}
 
if (stepReset) {
  document.getElementById('resetForm').addEventListener('submit', () => {
    stepReset.classList.remove('active');
    stepSuccess.classList.add('active');
  });
}
 