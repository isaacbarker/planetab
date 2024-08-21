// google search form
document.getElementById("search").addEventListener('submit', e => {
    e.preventDefault();
    const input = document.getElementById('search__input').value;
    window.location.replace(`https://www.google.com/search?q=${input}`);
})

// favourites tab manager
async function getFavicon(domain) {
    const url = `https://www.google.com/s2/favicons?sz=32&domain_url=${domain}`;

    const response = await fetch(url, { mode: 'cors' });

    console.log(response);

    if (response.ok && response.headers.get('Content-Type').includes('image')) {
        console.log('Favicon found');
    } else {
        console.log('Favicon not found!')
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const listElement = document.getElementById('list');
    const addBtn = document.getElementById('add-btn');

    function removeFavourite(index) {
        chrome.storage.sync.get(['favourites'], function(result) {
            let list = result.favourites || [];
            list.splice(index, 1);  // Remove the item at index i

            chrome.storage.sync.set({ 'favourites': list }, function() {
                loadList();
            });
        });
    }

    function loadList() {
        chrome.storage.sync.get(['favourites'], function(result) {
            const list = result.favourites || [];
            listElement.innerHTML = '';

            list.forEach(function(item, index) {
                // define wrapper
                const div = document.createElement('div');
                div.classList.add('list__favourite__container')
                // define image icon
                const imgWrapper = document.createElement('a')
                imgWrapper.href = item.url;
                const img = document.createElement('img')
                img.classList.add('list__favourite__img')
                let domain = item.url;
                if (domain) {
                    if (domain.includes('//')) {
                        domain = domain.split('//')[1];
                        domain = domain.split('/')[0];
                    }
                    
                    const imageURL = `https://favicone.com/${domain}?s=32`
                    getFavicon(domain)
                    img.src = imageURL;
                }
                imgWrapper.appendChild(img);
                div.appendChild(imgWrapper)
                // add clickable link
                if (item.name) {
                    const a = document.createElement('a');
                    a.classList.add('list__favourite__link');
                    a.href = item.url;
                    a.innerText = item.name;
                    div.appendChild(a);
                }
                // add remove item btn
                const remove = document.createElement('button');
                remove.classList.add('list__favourite__remove');
                remove.onclick = () => removeFavourite(index);
                const removeIcon = document.createElement("img")
                removeIcon.classList.add('list__favourite__remove__icon')
                removeIcon.src = '../images/remove.svg';
                removeIcon.alt = `remove favourite ${item.name}`
                remove.appendChild(removeIcon)
                div.append(remove);
                // add div to list
                listElement.appendChild(div);
            });
        });
    }

    addBtn.addEventListener('click', () => {
        const name = window.prompt('Enter name of your favourite:');
        const url = window.prompt('Enter url of your favourite:')

        if (url == null || (!url.includes("https://") && !url.includes("http://"))) {
            return;
        }

        chrome.storage.sync.get(['favourites'], function(result) {
            const list = result.favourites || [];
            list.push({ 'name': name, 'url': url});

            chrome.storage.sync.set({ 'favourites': list }, function() {
                loadList();
            });
        });
    })

    loadList();
})