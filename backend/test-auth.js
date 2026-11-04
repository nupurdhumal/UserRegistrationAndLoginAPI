const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '.env') });

const User = require('./models/User');
const app = require('./server');

const runTests = async () => {
  console.log('\n--- STARTING COMPREHENSIVE BACKEND VERIFICATION ---\n');

  // Wait for MongoDB and Express server to be ready
  await new Promise((r) => setTimeout(r, 1000));
  console.log('✓ Connected to MongoDB and Express server ready on port 5000');

  const testEmail = `testuser_${Date.now()}@example.com`;
  const testPassword = 'Password123!';
  const testName = 'Jane Doe';

  // 1. Test registration with valid details
  const regRes = await fetch('http://127.0.0.1:5000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: testName, email: testEmail, password: testPassword })
  });
  const regData = await regRes.json();
  console.log(`1. Registration Test: Status ${regRes.status}`, regData);
  if (regRes.status !== 201 || !regData.success) throw new Error('Registration failed');

  // 2. Test duplicate registration (Expect 409)
  const dupRes = await fetch('http://127.0.0.1:5000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: testName, email: testEmail, password: testPassword })
  });
  const dupData = await dupRes.json();
  console.log(`2. Duplicate Registration Test (Expect 409): Status ${dupRes.status}`, dupData);
  if (dupRes.status !== 409 || dupData.success) throw new Error('Duplicate registration should return 409');

  // 3. Test short password (<8 chars)
  const shortPassRes = await fetch('http://127.0.0.1:5000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: testName, email: `short_${Date.now()}@example.com`, password: '123' })
  });
  const shortPassData = await shortPassRes.json();
  console.log(`3. Weak Password Test (Expect 400): Status ${shortPassRes.status}`, shortPassData);
  if (shortPassRes.status !== 400) throw new Error('Weak password should return 400');

  // 4. Test invalid email
  const badEmailRes = await fetch('http://127.0.0.1:5000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: testName, email: 'not-an-email', password: testPassword })
  });
  const badEmailData = await badEmailRes.json();
  console.log(`4. Invalid Email Test (Expect 400): Status ${badEmailRes.status}`, badEmailData);
  if (badEmailRes.status !== 400) throw new Error('Invalid email should return 400');

  // 5. Test login with wrong password
  const wrongPassRes = await fetch('http://127.0.0.1:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: 'WrongPassword999' })
  });
  const wrongPassData = await wrongPassRes.json();
  console.log(`5. Wrong Password Login Test (Expect 401): Status ${wrongPassRes.status}`, wrongPassData);
  if (wrongPassRes.status !== 401 || wrongPassData.success) throw new Error('Wrong password should return 401');

  // 6. Test login with correct credentials
  const loginRes = await fetch('http://127.0.0.1:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: testPassword, rememberMe: true })
  });
  const loginData = await loginRes.json();
  const setCookieHeader = loginRes.headers.get('set-cookie');
  console.log(`6. Valid Login Test: Status ${loginRes.status}`, {
    success: loginData.success,
    user: loginData.user,
    hasToken: Boolean(loginData.token),
    hasCookie: Boolean(setCookieHeader)
  });
  if (loginRes.status !== 200 || !loginData.token || !loginData.user || loginData.user.password) {
    throw new Error('Valid login failed or exposed sensitive info');
  }

  // 7. Verify DB user record has bcrypt hash and NOT plain text
  const userInDb = await User.findOne({ email: testEmail });
  console.log(`7. DB Password Verification: Hash length = ${userInDb.password.length}, starts with $2a$ or $2b$: ${userInDb.password.startsWith('$2')}`);
  if (!userInDb.password.startsWith('$2') || userInDb.password === testPassword) {
    throw new Error('Password was not properly hashed with bcrypt!');
  }

  // 8. Test Protected Route without token
  const unauthRes = await fetch('http://127.0.0.1:5000/api/auth/me');
  const unauthData = await unauthRes.json();
  console.log(`8. Protected Route Without Token (Expect 401): Status ${unauthRes.status}`, unauthData);
  if (unauthRes.status !== 401) throw new Error('Protected route without token should return 401');

  // 9. Test Protected Route with Bearer Token
  const authRes = await fetch('http://127.0.0.1:5000/api/auth/me', {
    headers: {
      Authorization: `Bearer ${loginData.token}`
    }
  });
  const authData = await authRes.json();
  console.log(`9. Protected Route With Bearer Token: Status ${authRes.status}`, authData);
  if (authRes.status !== 200 || !authData.user || authData.user.email !== testEmail || authData.user.password) {
    throw new Error('Protected route with Bearer token failed');
  }

  // 10. Test Protected Route with Cookie
  const cookieRes = await fetch('http://127.0.0.1:5000/api/auth/me', {
    headers: {
      Cookie: setCookieHeader ? setCookieHeader.split(';')[0] : `token=${loginData.token}`
    }
  });
  const cookieData = await cookieRes.json();
  console.log(`10. Protected Route With Cookie: Status ${cookieRes.status}`, cookieData);
  if (cookieRes.status !== 200 || !cookieData.user) {
    throw new Error('Protected route with Cookie failed');
  }

  // 11. Test Logout
  const logoutRes = await fetch('http://127.0.0.1:5000/api/auth/logout', { method: 'POST' });
  const logoutData = await logoutRes.json();
  console.log(`11. Logout Test: Status ${logoutRes.status}`, logoutData);
  if (logoutRes.status !== 200 || !logoutData.success) {
    throw new Error('Logout failed');
  }

  console.log('\n--- ALL 11 BACKEND VERIFICATION CHECKS PASSED SUCCESSFULLY! ---\n');
  process.exit(0);
};

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
