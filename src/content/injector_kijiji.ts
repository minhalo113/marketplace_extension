import type { Product } from '../types';

console.log('Kijiji Injector Loaded');

function createFillButton() {
    const button = document.createElement('button');
    button.innerText = 'Fill Kijiji Details';
    button.style.position = 'fixed';
    button.style.bottom = '20px';
    button.style.right = '20px';
    button.style.zIndex = '9999';
    button.style.padding = '10px 20px';
    button.style.backgroundColor = '#4D1D89'; // Kijiji Purple
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '5px';
    button.style.cursor = 'pointer';
    button.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';

    button.addEventListener('click', fillKijijiForm);

    document.body.appendChild(button);
}

function fillKijijiForm() {
    chrome.storage.local.get(['harvestedProduct'], (result) => {
        const product = result.harvestedProduct as Product;
        if (product) {
            console.log('Injecting product into Kijiji:', product);

            const titleInput = document.getElementById('post-ad-title') as HTMLInputElement || document.querySelector('input[name="adTitle"]');
            if (titleInput) {
                titleInput.value = product.title;
                titleInput.dispatchEvent(new Event('input', { bubbles: true }));
            } else {
                console.warn('Title input not found');
            }

            const priceInput = document.getElementById('price-amount') as HTMLInputElement || document.querySelector('input[name="priceAmount"]');
            if (priceInput) {
                priceInput.value = product.price.replace(/[^0-9.]/g, '');
                priceInput.dispatchEvent(new Event('input', { bubbles: true }));
            } else {
                console.warn('Price input not found');
            }

            const descriptionInput = document.getElementById('pstad-descrptn') as HTMLTextAreaElement || document.querySelector('textarea[name="description"]');
            if (descriptionInput) {
                descriptionInput.value = product.description;
                descriptionInput.dispatchEvent(new Event('input', { bubbles: true }));
            } else {
                console.warn('Description input not found');
            }

            console.log('Images to be uploaded:', product.images);
            alert(`Attempted to fill details for "${product.title}". Check console for missing fields.`);
        } else {
            alert('No product data found. Please harvest a product first.');
        }
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createFillButton);
} else {
    createFillButton();
}
