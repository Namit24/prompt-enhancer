document.addEventListener('DOMContentLoaded', async () => {
  const statusEl = document.getElementById('status');
  
  try {
    const response = await fetch('http://localhost:3000/health');
    if (response.ok) {
      statusEl.textContent = 'Backend connected and ready!';
      statusEl.className = 'status success';
    } else {
      throw new Error('Backend not responding');
    }
  } catch (error) {
    statusEl.textContent = 'Backend not connected. Please start your server.';
    statusEl.className = 'status error';
  }
});