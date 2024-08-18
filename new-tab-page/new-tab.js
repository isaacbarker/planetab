// google search form
document.getElementById("search").addEventListener('submit', e => {
    e.preventDefault();
    const input = document.getElementById('search__input').value;
    window.location.replace(`https://www.google.com/search?q=${input}`);
})