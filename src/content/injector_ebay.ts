import type { Product } from '../types';

console.log('eBay Injector Loaded');

function createFillButton() {
    const button = document.createElement('button');
    button.innerText = 'Fill eBay Details';
    button.style.position = 'fixed';
    button.style.bottom = '20px';
    button.style.right = '20px';
    button.style.zIndex = '9999';
    button.style.padding = '10px 20px';
    button.style.backgroundColor = '#E53238'; // eBay red
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '5px';
    button.style.cursor = 'pointer';
    button.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    button.style.fontWeight = 'bold';

    button.addEventListener('click', fillEbayForm);

    document.body.appendChild(button);
}

function setValueAndDispatch(element: HTMLInputElement | HTMLTextAreaElement | HTMLElement, value: string | number) {
    if (element) {
        if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
            element.value = value.toString();
        } else {
            element.textContent = value.toString();
        }
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
        element.dispatchEvent(new Event('blur', { bubbles: true }));
    }
}

function fillEbayForm() {
    chrome.storage.local.get(['harvestedProduct'], (result) => {
        const product = result.harvestedProduct as Product;
        if (product) {
            console.log('Injecting product into eBay:', product);

            // These selectors will likely need adjustment based on the exact eBay listing page used
            const titleInput = document.querySelector('input[name="title"], input[id*="title"]') as HTMLInputElement;
            if (titleInput) {
                setValueAndDispatch(titleInput, product.title);
                console.log(`SUCCESS: Title set to: "${product.title}"`);
            } else {
                console.warn("Can't find title input element");
            }

            const priceInput = document.querySelector('input[name="price"], input[id*="price"]') as HTMLInputElement;
            if (priceInput) {
                const numericPrice = parseFloat(product.price.replace(/[^0-9.]/g, ''));
                if (!isNaN(numericPrice)) {
                    setValueAndDispatch(priceInput, numericPrice);
                    console.log(`SUCCESS: Price set to ${numericPrice}.`);
                }
            } else {
                console.warn("Can't find price input element");
            }

            const descriptionIframe = document.querySelector('iframe[id*="desc_ifr"], iframe.tox-edit-area__iframe') as HTMLIFrameElement;
            if (descriptionIframe && descriptionIframe.contentDocument) {
                const body = descriptionIframe.contentDocument.querySelector('body');
                if (body) {
                    setValueAndDispatch(body, product.description);
                    console.log("SUCCESS: Picked description (rich text)");
                }
            } else {
                const descriptionArea = document.querySelector('textarea[name="description"], textarea[id*="desc"]') as HTMLTextAreaElement;
                if (descriptionArea) {
                    setValueAndDispatch(descriptionArea, product.description);
                    console.log("SUCCESS: Picked description (plain text)");
                } else {
                    console.warn("Can't find description textarea/iframe");
                }
            }

            alert(`Attempted to fill details for "${product.title}" on eBay. Check console for missing fields.`);

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
