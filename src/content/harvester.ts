import type { Product } from '../types';

console.log('Harvester script loaded');

function createHarvestButton() {
    const button = document.createElement('button')
    button.innerText = 'Harvest Product'
    button.style.position = 'fixed'
    button.style.bottom = '20px'
    button.style.right = '20px'
    button.style.zIndex = '9999';
    button.style.padding = '10px 20px';
    button.style.backgroundColor = '#4CAF50';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '5px';
    button.style.cursor = 'pointer';
    button.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';

    button.addEventListener('click', harvestProduct);

    document.body.appendChild(button);
}

function harvestProduct() {
    const title = (document.getElementById('name') as HTMLInputElement)?.value || 'Example Product Title';
    const price = (document.getElementById('colorPrices') as HTMLInputElement)?.value || (document.getElementById('price') as HTMLInputElement)?.value || '$100.00';
    const description = (document.getElementById('description') as HTMLInputElement)?.value || 'This is a sample product description.';

    const images: string[] = [];
    const imgElements = document.querySelectorAll('img');
    imgElements.forEach((img) => {
        if (img.src && img.src.startsWith('http') && images.length < 5 && !img.src.includes("localhost")) {
            images.push(img.src);
        }
    });

    const product: Product = {
        title,
        price,
        description,
        images
    };

    // console.log('Harvested product:', product);

    chrome.storage.local.set({ 'harvestedProduct': product }, () => {
        if (chrome.runtime.lastError) {
            console.error('Error saving product:', chrome.runtime.lastError);
            alert('Failed to save product.');
        } else {
            console.log('Product saved to storage');
            alert(`Product "${product.title}" harvested!`);
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createHarvestButton);
} else {
    createHarvestButton();
}
