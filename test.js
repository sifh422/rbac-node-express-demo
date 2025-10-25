const axios = require('axios');

const base = 'http://localhost:3000';

async function login(email, password) {
  const res = await axios.post(`${base}/login`, { email, password });
  return res.data.token;
}

async function tryGet(path, token) {
  try {
    const res = await axios.get(`${base}${path}`, { headers: { Authorization: `Bearer ${token}` } });
    return { status: res.status, data: res.data };
  } catch (err) {
    if (err.response) {
      return { status: err.response.status, data: err.response.data };
    }
    return { error: err.message, code: err.code };
  }
}

(async () => {
  try {
    console.log('--- Admin Flow ---');
    const adminToken = await login('admin@example.com', 'admin123');
    console.log('Admin token acquired');
    console.log('Admin /admin/dashboard:', await tryGet('/admin/dashboard', adminToken));
    console.log('Admin /moderator/tools:', await tryGet('/moderator/tools', adminToken));
    console.log('Admin /user/profile:', await tryGet('/user/profile', adminToken));

    console.log('\n--- Moderator Flow ---');
    const modToken = await login('mod@example.com', 'moderator123');
    console.log('Moderator token acquired');
    console.log('Moderator /admin/dashboard:', await tryGet('/admin/dashboard', modToken));
    console.log('Moderator /moderator/tools:', await tryGet('/moderator/tools', modToken));
    console.log('Moderator /user/profile:', await tryGet('/user/profile', modToken));

    console.log('\n--- User Flow ---');
    const userToken = await login('user@example.com', 'user123');
    console.log('User token acquired');
    console.log('User /admin/dashboard:', await tryGet('/admin/dashboard', userToken));
    console.log('User /moderator/tools:', await tryGet('/moderator/tools', userToken));
    console.log('User /user/profile:', await tryGet('/user/profile', userToken));
  } catch (e) {
    console.error('Test failed:', e.message, e.code);
    console.error(e.stack);
    process.exit(1);
  }
})();