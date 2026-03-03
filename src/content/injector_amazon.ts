import type { Product } from '../types';

console.log('Amazon Injector Loaded');

function createFillButton() {
    const button = document.createElement('button');
    button.innerText = 'Fill Amazon Details';
    button.style.position = 'fixed';
    button.style.bottom = '20px';
    button.style.right = '20px';
    button.style.zIndex = '9999';
    button.style.padding = '10px 20px';
    button.style.backgroundColor = '#FF9900'; // Amazon Orange
    button.style.color = '#111111';
    button.style.border = 'none';
    button.style.borderRadius = '5px';
    button.style.cursor = 'pointer';
    button.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    button.style.fontWeight = 'bold';

    button.addEventListener('click', fillAmazonForm);

    document.body.appendChild(button);
}

function setValueAndDispatch(element: HTMLInputElement | HTMLTextAreaElement, value: string | number) {
    if (element) {
        element.value = value.toString();
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
        element.dispatchEvent(new Event('blur', { bubbles: true }));
    }
}

function fillAmazonForm() {
    chrome.storage.local.get(['harvestedProduct'], (result) => {
        const product = result.harvestedProduct as Product;
        if (product) {
            console.log('Injecting product into Amazon:', product);

            // These selectors will likely need adjustment based on the exact Amazon listing page used
            const titleInput = document.querySelector('input[name="item_name"], input[name="title"]') as HTMLInputElement;
            if (titleInput) {
                setValueAndDispatch(titleInput, product.title);
                console.log(`SUCCESS: Title set to: "${product.title}"`);
            } else {
                console.warn("Can't find title input element");
            }

            const priceInput = document.querySelector('input[name="standard_price"], input[name="price"]') as HTMLInputElement;
            if (priceInput) {
                const numericPrice = parseFloat(product.price.replace(/[^0-9.]/g, ''));
                if (!isNaN(numericPrice)) {
                    setValueAndDispatch(priceInput, numericPrice);
                    console.log(`SUCCESS: Price set to ${numericPrice}.`);
                }
            } else {
                console.warn("Can't find price input element");
            }

            const descriptionArea = document.querySelector('textarea[name="product_description"], textarea[name="description"]') as HTMLTextAreaElement;
            if (descriptionArea) {
                setValueAndDispatch(descriptionArea, product.description);
                console.log("SUCCESS: Picked description");
            } else {
                console.warn("Can't find description textarea");
            }

            alert(`Attempted to fill details for "${product.title}" on Amazon. Check console for missing fields.`);

        } else {
            alert('No product data found. Please harvest a product first.');
        }
    });
}


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createFillButton);
} else {
    createFillButton();
}
