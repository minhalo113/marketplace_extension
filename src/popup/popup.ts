import type { Product } from '../types';

document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get(['harvestedProduct'], (result) => {
        const product = result.harvestedProduct as Product | undefined;

        const statusDiv = document.getElementById('status');
        const detailsDiv = document.getElementById('product-details');
        const titleEl = document.getElementById('product-title');
        const priceEl = document.getElementById('product-price');
        const imgEl = document.getElementById('product-image') as HTMLImageElement;

        if (product && statusDiv && detailsDiv && titleEl && priceEl && imgEl) {
            statusDiv.textContent = 'Product Ready to Upload';
            // detailsDiv.classList.add('visible');
            detailsDiv.style.display = 'block';

            titleEl.textContent = product.title;
            priceEl.textContent = product.price;

            // console.log('test');
            // console.log(product.images);

            if (product.images && product.images.length > 0) {
                imgEl.src = product.images[0];
                imgEl.style.display = 'block';
            }
        } else if (statusDiv) {
            statusDiv.textContent = 'No product harvested yet. Go to your dashboard and click "Harvest Product".';
        }
    });
});
