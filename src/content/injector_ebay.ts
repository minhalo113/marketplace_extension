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
    button.style.backgroundColor = '#E53238';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '5px';
    button.style.cursor = 'pointer';
    button.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    button.style.fontWeight = 'bold';

    button.addEventListener('click', fillEbayForm);

    document.body.appendChild(button);
}

function setValueAndDispatch(element: HTMLElement, value: string | number) {
    if (!element) return;

    const stringValue = value.toString();

    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
        element.value = stringValue;
    } else if (element.isContentEditable) {
        element.innerHTML = stringValue;
        element.classList.remove('placeholder');
    } else {
        element.textContent = stringValue;
    }
    const eventConfig = { bubbles: true, composed: true };
    ['input', 'change', 'blur'].forEach(type => {
        element.dispatchEvent(new Event(type, eventConfig));
    });
}
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function uploadToEbay(imageUrls: string[]) {
    const fileInput = document.querySelector('input#fehelix-uploader') as HTMLInputElement;

    if (!fileInput) {
        console.error("Can't find image input element for eBay.");
        return;
    }

    for (const [index, url] of imageUrls.entries()) {
        const dataTransfer = new DataTransfer();
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const file = new File([blob], `product_image_${index}.jpg`, { type: blob.type });

            dataTransfer.items.add(file);
            fileInput.files = dataTransfer.files;
            fileInput.dispatchEvent(new Event('change', { bubbles: true }));

            console.log(`Uploading Images ${index}. Delaying...`)
            const randomDelay = Math.floor(Math.random() * (2034)) + 1500;
            await sleep(randomDelay);
        } catch (error) {
            console.error(`Failed to download images from Cloudinary: ${url}`)
        }
    }
}

function disableBestOffer() {
    const bestOfferSwitch = document.querySelector('input[name="bestOfferEnabled"]') as HTMLInputElement;

    if (bestOfferSwitch) {
        if (bestOfferSwitch.checked) {
            bestOfferSwitch.click();

            const eventConfig = { bubbles: true, composed: true };
            bestOfferSwitch.dispatchEvent(new Event('change', eventConfig));
        } else {
            console.log("Best Offer is already OFF. Moving to next task.");
        }
    } else {
        console.warn("CRITICAL: Best Offer switch not found. Check selector stability.");
    }
}

function fillPrice(price: string) {
    const priceInput = document.querySelector('input[name="price"], input[id*="price"]') as HTMLInputElement;
    if (priceInput) {
        const currentPrice = 5 + parseFloat(price);
        const numericPrice = String(currentPrice).replace(/[^0-9.]/g, '');
        if (numericPrice) {
            setValueAndDispatch(priceInput, numericPrice);
            console.log(`SUCCESS: Price set to ${numericPrice}.`);
        }
    } else {
        console.warn("Can't find price input element");
    }
}

async function setEbayToBuyItNow() {
    console.log("Strategic Maneuver: Forcing Fixed Price format...");

    const nativeSelect = document.querySelector('select[name="format"]') as HTMLSelectElement;

    const formatButton = document.querySelector('.listbox-button__control') as HTMLButtonElement;

    if (nativeSelect && formatButton) {
        formatButton.click();
        await sleep(200);

        nativeSelect.value = "FixedPrice";

        const eventConfig = { bubbles: true, composed: true };
        nativeSelect.dispatchEvent(new Event('change', eventConfig));
        nativeSelect.dispatchEvent(new Event('input', eventConfig));

        console.log("SUCCESS: Format shifted to FixedPrice. Inventory liquidity secured.");
    } else {
        console.error("CRITICAL: Ebay Format selectors not found. The system is blind.");
    }
    const strategicDelay = Math.floor(Math.random() * 501) + 1500;
    await sleep(strategicDelay);
}

async function uploadToEbayAutomate(price: string) {
    await setEbayToBuyItNow();
    fillPrice(price);
    disableBestOffer();
}

async function getDescriptionEditor(): Promise<HTMLElement | null> {
    const iframes = document.querySelectorAll('iframe');

    for (const iframe of Array.from(iframes)) {
        try {
            const innerDoc = iframe.contentDocument || iframe.contentWindow?.document;
            if (!innerDoc) continue;

            const editor = innerDoc.querySelector('div[datatestid="richEditor"]') as HTMLElement;

            if (editor) {
                return editor;
            }
        } catch (e) {
            console.log(e)
            continue;
        }
    }

    return document.querySelector('div[datatestid="richEditor"]') as HTMLElement;
}

function fillEbayForm() {
    chrome.storage.local.get(['harvestedProduct'], async (result) => {
        const product = result.harvestedProduct as Product;
        if (product) {
            console.log('Injecting product into eBay:', product);

            const searchInput = document.querySelector('input[placeholder*="selling"]') as HTMLInputElement;
            if (searchInput) {
                setValueAndDispatch(searchInput, product.title);
                console.log(`SUCCESS: Title set to: "${product.title}"`);
            } else {
                console.warn("Can't find title input element");
            }

            const titleInput = document.querySelector('input[name="title"], input[id*="title"]') as HTMLInputElement;
            if (titleInput) {
                setValueAndDispatch(titleInput, product.title.slice(0, 80).trim());
                console.log(`SUCCESS: Title set to: "${product.title.slice(0, 80).trim()}"`);
            } else {
                console.warn("Can't find title input element");
            }

            const editor = await getDescriptionEditor();

            if (editor) {
                setValueAndDispatch(editor, product.description);
                return true;
            }

            if (product.images && product.images.length > 0) {
                await uploadToEbay(product.images);
            } else {
                console.log(`Cant find the image input`);
            }

            await uploadToEbayAutomate(product.price)
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
