const moodInput = document.getElementById('moodInput');
const generateBtn = document.getElementById('generateBtn');
const moodGrid = document.getElementById('moodGrid');
const themeToggle = document.getElementById('themeToggle');

generateBtn.addEventListener('click', async () => {
  const mood = moodInput.value.trim() || 'vaporwave';
  moodGrid.innerHTML = '';
  for (let i = 0; i < 6; i++) {
    const img = document.createElement('img');
    img.src = `https://source.unsplash.com/400x400/?${encodeURIComponent(mood)},vaporwave,aesthetic`;
    moodGrid.appendChild(img);
  }
});

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
});
