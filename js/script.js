

function showCategory(category) {
    const allCategories = document.querySelectorAll('.category');
    if (category === 'all') {
        allCategories.forEach(cat => cat.classList.remove('hidden'));
    } else {
        allCategories.forEach(cat => {
            if (cat.id === category) {
                cat.classList.remove('hidden');
            } else {
                cat.classList.add('hidden');
            }
        });
    }
}
document.addEventListener('DOMContentLoaded', function() {
    showCategory('all'); // Показываем все категории по умолчанию
    const query = localStorage.getItem('searchQuery');
    const category = localStorage.getItem('searchCategory') || 'all';
    if (query) {
        fetch('data.json')
            .then(response => response.json())
            .then(data => {
                console.log("Data loaded for search:", data); // Добавлено для отладки
                const results = searchCatalog(query, data);
                displaySearchResults(results, data); // Передаем результаты и данные каталога
            })
            .catch(error => console.error('Error loading data:', error));
        localStorage.removeItem('searchQuery');
        localStorage.removeItem('searchCategory');
    } else {
        fetch('data.json')
            .then(response => response.json())
            .then(data => {
                console.log("Data loaded for display:", data); // Добавлено для отладки
                displayData(data);
            })
            .catch(error => console.error('Error loading data:', error));
    }
});
function searchCatalog(query, data) {
    const results = [];
    const queryWords = query.toLowerCase().split(' ');

    console.log("Data in searchCatalog:", data); // Добавлено для отладки

    for (const cat in data) {
        if (data.hasOwnProperty(cat)) {
            console.log(`Category: ${cat}, Data:`, data[cat]); // Добавлено для отладки
            if (Array.isArray(data[cat])) {  // Проверяем, является ли data[cat] массивом
                data[cat].forEach(item => {
                    const detailsText = item.details ? Object.values(item.details).join(' ') : '';
                    const combinedText = `${item.title} ${item.descr} ${cat} ${detailsText}`.toLowerCase();
                    const matchesQuery = queryWords.every(word => combinedText.includes(word));
                    if (matchesQuery) {
                        results.push(item);
                    }
                });
            } else {
                console.warn(`Category ${cat} is not an array`, data[cat]); // Предупреждение если data[cat] не массив
            }
        }
    }

    return results;
}

function displaySearchResults(results, data) {
    const searchResultsContainer = document.getElementById('searchResults');
    searchResultsContainer.innerHTML = ''; // Очистка предыдущих результатов

    if (results.length === 0) {
        const noResultsMessage = document.createElement('p');
        noResultsMessage.textContent = 'Ничего не найдено по данному запросу.';
        searchResultsContainer.appendChild(noResultsMessage);

        // Отображение всего каталога ниже сообщения
        displayData(data);
    } else {
        results.forEach(item => {
            const itemCard = createItemCard(item);
            searchResultsContainer.appendChild(itemCard);
        });
    }
}

function displayData(data) {
    const catalogContainer = document.getElementById('catalog');
    const treesContainer = document.getElementById('trees');
    const shrubsContainer = document.getElementById('shrubs');
    const climbersContainer = document.getElementById('climbers');
    const perennialsContainer = document.getElementById('perennials');
    const containerPlantsContainer = document.getElementById('container_plants');

    if (Array.isArray(data.trees)) {
        data.trees.slice(0, 12).forEach(tree => {
            const treeCard = createItemCard(tree);
            treesContainer.appendChild(treeCard);
        });
    } else {
        console.warn('trees is not an array', data.trees);
    }

    if (Array.isArray(data.shrubs)) {
        data.shrubs.slice(0, 12).forEach(shrub => {
            const shrubCard = createItemCard(shrub);
            shrubsContainer.appendChild(shrubCard);
        });
    } else {
        console.warn('shrubs is not an array', data.shrubs);
    }

    if (Array.isArray(data.climbers)) {
        data.climbers.slice(0, 12).forEach(climber => {
            const climberCard = createItemCard(climber);
            climbersContainer.appendChild(climberCard);
        });
    } else {
        console.warn('climbers is not an array', data.climbers);
    }

    if (Array.isArray(data.perennials)) {
        data.perennials.slice(0, 12).forEach(perennial => {
            const perennialCard = createItemCard(perennial);
            perennialsContainer.appendChild(perennialCard);
        });
    } else {
        console.warn('perennials is not an array', data.perennials);
    }

    if (Array.isArray(data.container_plants)) {
        data.container_plants.slice(0, 12).forEach(containerPlant => {
            const containerPlantCard = createItemCard(containerPlant);
            containerPlantsContainer.appendChild(containerPlantCard);
        });
    } else {
        console.warn('container_plants is not an array', data.container_plants);
    }
}

function createItemCard(item) {
    const itemDiv = document.createElement('div');
    itemDiv.classList.add('item');

    const img = document.createElement('img');
    img.src = item.image;
    img.alt = item.title;

    const contentDiv = document.createElement('div');
    contentDiv.classList.add('content');

    const title = document.createElement('h2');
    title.textContent = item.title;

    const price = document.createElement('p');
    price.classList.add('price');
    price.textContent = `Цена: ${item.price} руб.`;

    const descr = document.createElement('p');
    descr.classList.add('description');
    descr.textContent = item.descr;

    contentDiv.appendChild(title);
    contentDiv.appendChild(price);
    contentDiv.appendChild(descr);

    const buyButton = document.createElement('button');
    buyButton.classList.add('buy-button');
    buyButton.textContent = 'Купить';
    buyButton.onclick = () => openModal(item);

    contentDiv.appendChild(buyButton);

    itemDiv.appendChild(img);
    itemDiv.appendChild(contentDiv);

    // Добавление обработчика события для открытия модального окна при клике на карточку товара
    itemDiv.onclick = () => openModal(item);

    return itemDiv;
}

// Модальное окно
const modal = document.getElementById('myModal');
const modalTitle = document.getElementById('modalTitle');
const modalPrice = document.getElementById('modalPrice');
const modalImage = document.getElementById('modalImage');
const modalDetails = document.getElementById('modalDetails');
const addToCartButton = document.getElementById('addToCartButton');
const quantityInput = document.getElementById('quantity');
const span = document.getElementsByClassName('close')[0];

let currentItem = null;

// Открытие модального окна
function openModal(item) {
    modal.style.display = 'block';
    modalTitle.textContent = item.title;
    quantityInput.value = 1;  // Сбросить количество до 1
    modalPrice.textContent = `Цена: ${item.price} руб.`;
    modalImage.src = item.image;
    currentItem = item;

    // Очистка и заполнение деталей
    modalDetails.innerHTML = '';
    for (const [key, value] of Object.entries(item.details)) {
        const detailItem = document.createElement('p');
        detailItem.innerHTML = `<strong>${key}:</strong> ${value}`;
        modalDetails.appendChild(detailItem);
    }

    addToCartButton.onclick = () => addToCart(item);

    document.getElementById('increaseQuantity').onclick = increaseQuantity;
    document.getElementById('decreaseQuantity').onclick = decreaseQuantity;
}

// Закрытие модального окна
span.onclick = () => {
    modal.style.display = 'none';
}

window.onclick = (event) => {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

// Обновление суммы при изменении количества
quantityInput.oninput = () => {
    if (currentItem) {
        let quantity = parseInt(quantityInput.value, 10);
        if (quantity > 100) {
            quantity = 100;
            quantityInput.value = quantity;
        }
        modalPrice.textContent = `Цена: ${currentItem.price * quantity} руб.`;
    }
}

// Увеличение количества
function increaseQuantity() {
    let quantity = parseInt(quantityInput.value, 10);
    if (quantity < 100) {
        quantity++;
        quantityInput.value = quantity;
        updateModalPrice();
    }
}

// Уменьшение количества
function decreaseQuantity() {
    let quantity = parseInt(quantityInput.value, 10);
    if (quantity > 1) {
        quantity--;
        quantityInput.value = quantity;
        updateModalPrice();
    }
}

// Обновление цены в модальном окне
function updateModalPrice() {
    if (currentItem) {
        const quantity = parseInt(quantityInput.value, 10);
        modalPrice.textContent = `Цена: ${currentItem.price * quantity} руб.`;
    }
}

// Функция добавления в корзину
function addToCart(item) {
    const quantityToAdd = parseInt(quantityInput.value, 10);
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    const existingItem = cart.find(cartItem => cartItem.id === item.id);

    if (existingItem) {
        const newQuantity = existingItem.quantity + quantityToAdd;
        if (newQuantity > 100) {
            alert(`Нельзя добавить более 100 единиц товара. У вас уже ${existingItem.quantity} единиц в корзине.`);
            return;
        } else {
            existingItem.quantity = newQuantity;
        }
    } else {
        if (quantityToAdd > 100) {
            alert('Нельзя добавить более 100 единиц товара.');
            return;
        }
        cart.push({ ...item, quantity: quantityToAdd });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`${item.title} в количестве ${quantityToAdd} добавлен в корзину!`);
    modal.style.display = 'none';
}
