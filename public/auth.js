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
let selectedRole = null;

function configureRole(role) {
  selectedRole = role;
  roleCards.forEach(card => card.classList.toggle('selected', card.dataset.role === role));
  if (workerFields) workerFields.hidden = role !== 'worker';
  if (addressField) addressField.style.display = role === 'customer' ? '' : 'none';
  if (rolePill) rolePill.textContent = role === 'worker' ? 'WORKER' : 'CUSTOMER';
  if (formHeading) formHeading.textContent = role === 'worker' ? 'Create your worker account' : 'Create your customer account';
  if (formSub) formSub.textContent = role === 'worker' ? 'Offer your skills to people in your community.' : 'Get trusted local help whenever you need it.';
  if (submitBtn) submitBtn.textContent = 'Create account';
  if (stepRole && stepForm) { stepRole.style.display='none'; stepForm.style.display='block'; stepRole.classList.remove('active'); stepForm.classList.add('active'); }
}
roleCards.forEach(card => card.addEventListener('click', () => configureRole(card.dataset.role)));
stepBack?.addEventListener('click', () => { stepForm.style.display='none'; stepRole.style.display='block'; stepForm.classList.remove('active'); stepRole.classList.add('active'); });

function saveAuth(data) {
  if (data.accessToken) localStorage.setItem("nabhi_access_token", data.accessToken);
  if (data.user) localStorage.setItem("nabhi_user", JSON.stringify(data.user));
}

function goAfterLogin(user) {
  location.href = user?.role === "worker" ? "worker-dashboard.html" : "customerhomepage.html";
}

const signupForm = document.getElementById('signupForm');
signupForm?.addEventListener('submit', async e => {
  e.preventDefault();
  if (!selectedRole) return alert('Please select a role first.');
  const data = {
    role: selectedRole,
    name: document.getElementById('fullName')?.value.trim() || '',
    email: document.getElementById('email')?.value.trim() || '',
    phone: document.getElementById('phone')?.value.trim() || '',
    password: document.getElementById('password')?.value || ''
  };
  if (selectedRole === 'customer') data.address = document.getElementById('address')?.value.trim() || '';
  if (selectedRole === 'worker') {
    data.fieldOfWork = document.getElementById('fieldOfWork')?.value || '';
    data.experience = Number(document.getElementById('experience')?.value || 0);
    data.workLocation = document.getElementById('workLocation')?.value.trim() || '';
    data.description = 'Reliable local service professional.';
  }
  try {
    submitBtn.disabled = true;
    const r = await fetch('/api/auth/signup', {method:'POST',headers:{'Content-Type':'application/json'},credentials:'include',body:JSON.stringify(data)});
    const out = await r.json();
    if (!r.ok) throw new Error(out.message || 'Signup failed');
    saveAuth(out);
    alert('Account created successfully.');
    goAfterLogin(out.user);
  } catch (err) { alert(err.message); }
  finally { submitBtn.disabled = false; }
});

const loginForm = document.getElementById('loginForm');
loginForm?.addEventListener('submit', async e => {
  e.preventDefault();
  const btn = loginForm.querySelector('button[type="submit"]');
  try {
    btn.disabled = true;
    const r = await fetch('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'include',body:JSON.stringify({email:document.getElementById('email').value.trim(),password:document.getElementById('password').value})});
    const out = await r.json();
    if (!r.ok) throw new Error(out.message || 'Login failed');
    saveAuth(out);
    goAfterLogin(out.user);
  } catch (err) { alert(err.message); }
  finally { btn.disabled = false; }
});

async function setupGoogle() {
  const googleBtn = document.querySelector('.social-btn.google-btn') || document.querySelector('.social-btn');
  if (!googleBtn) return;

  try {
    const cfgResponse = await fetch('/api/auth/google-config', { credentials: 'include' });
    const cfg = await cfgResponse.json();
    if (!cfg.clientId) {
      console.warn('Google authentication is not configured on the backend.');
      return;
    }

    const loadGoogle = () => {
      if (!window.google?.accounts?.id) return;

      window.google.accounts.id.initialize({
        client_id: cfg.clientId,
        callback: async (response) => {
          if (!response?.credential) {
            alert('Google sign-in was cancelled or no credential was returned.');
            return;
          }

          try {
            googleBtn.disabled = true;
            const r = await fetch('/api/auth/google', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ credential: response.credential })
            });
            const out = await r.json();
            if (!r.ok) throw new Error(out.message || 'Google login failed');
            saveAuth(out);
            goAfterLogin(out.user);
          } catch (err) {
            alert(err.message || 'Google login failed');
          } finally {
            googleBtn.disabled = false;
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true
      });

      // Render the official Google Sign-In button into the existing Google button area.
      // Calling prompt() from a custom button is unreliable because browser/user settings
      // may suppress the One Tap prompt. renderButton() gives the user a real Google button.
      googleBtn.innerHTML = '';
      googleBtn.type = 'button';
      googleBtn.classList.add('google-rendered-btn');
      window.google.accounts.id.renderButton(googleBtn, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: Math.max(180, googleBtn.clientWidth || 220)
      });
    };

    if (window.google?.accounts?.id) loadGoogle();
    else {
      const existing = document.querySelector('script[src*="accounts.google.com/gsi/client"]');
      if (existing) existing.addEventListener('load', loadGoogle, { once: true });
      else {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = loadGoogle;
        script.onerror = () => console.error('Unable to load Google Identity Services.');
        document.head.appendChild(script);
      }
    }
  } catch (err) {
    console.error('Google setup failed:', err);
  }
}

setupGoogle();

document.querySelectorAll('.pw-toggle').forEach(button => button.addEventListener('click', () => {
  const input = button.dataset.target ? document.getElementById(button.dataset.target) : button.closest('.field-input')?.querySelector('input');
  if (!input) return;
  input.type = input.type === 'password' ? 'text' : 'password';
  button.setAttribute('aria-label', input.type === 'password' ? 'Show password' : 'Hide password');
}));


// ============================================================
// FORGOT PASSWORD
// ============================================================

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
 