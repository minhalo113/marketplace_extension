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
    button.style.backgroundColor = '#4D1D89';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '5px';
    button.style.cursor = 'pointer';
    button.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';

    button.addEventListener('click', fillKijijiForm);

    document.body.appendChild(button);
}

function selectRadioOption(text: string) {
    const containers = Array.from(document.querySelectorAll('[data-testid="toggle-list"]'));

    const targetContainer = containers.find(div =>
        div.querySelector('label')?.textContent?.trim().includes(text)
    );

    if (targetContainer) {
        const input = targetContainer.querySelector('input') as HTMLInputElement;
        const label = targetContainer.querySelector('label') as HTMLLabelElement;

        if (input && label) {
            input.checked = true;
            label.click();
            input.dispatchEvent(new Event('change', { bubbles: true }));
            console.log(`SUCCESS: Picked "${text}"`);
        }
    } else {
        console.warn(`FAILED: Can't find "${text}"`);
    }
}

function setConditionToNew(condition: string) {
    const selectElement = document.getElementById('condition_s') as HTMLSelectElement;

    if (selectElement) {
        selectElement.value = condition;
        selectElement.dispatchEvent(new Event('change', { bubbles: true }));
        selectElement.dispatchEvent(new Event('input', { bubbles: true }));
        console.log(`SUCCESS: Picked "${condition}"`);
    } else {
        console.warn("CRITICAL: Can't find condition dropdown");
    }
}

function setDescription(text: string) {
    const descriptionArea = document.getElementById('pstad-descrptn') as HTMLTextAreaElement;

    if (descriptionArea) {
        descriptionArea.value = text;
        descriptionArea.dispatchEvent(new Event('input', { bubbles: true }));
        descriptionArea.dispatchEvent(new Event('change', { bubbles: true }));
        descriptionArea.dispatchEvent(new Event('blur', { bubbles: true }));
        console.log("SUCCESS: Picked description");
    } else {
        console.warn("CRITICAL: Can't find description textarea");
    }
}

async function uploadToKijiji(imageUrls: string[]) {
    const fileInput = document.querySelector('#FileInputWrapper input[type="file"]') as HTMLInputElement;

    if (!fileInput) {
        console.error("CRITICAL: Can't find image input element");
        return;
    }


    for (const [index, url] of imageUrls.entries()) {
        const dataTransfer = new DataTransfer();
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const file = new File([blob], `prod_${index}_${Date.now()}.jpg`, { type: blob.type });

            dataTransfer.items.add(file);
            fileInput.files = dataTransfer.files;

            fileInput.dispatchEvent(new Event('change', { bubbles: true }));

            console.log(`[+] Uploaded image ${index + 1}/${imageUrls.length}`);

            if (index < imageUrls.length - 1) {
                const delay = Math.floor(Math.random() * (6000 - 3000 + 1) + 3000);
                await new Promise(res => setTimeout(res, delay));
            }
        } catch (err) {
            console.error(`[-] Failed at image ${index}:`, err);
        }
    }
}

function getMinPrice(input: string): number {
    console.log(input);
    if (!input) return 0;

    const parts = input.split(',');

    console.log(parts);
    const minPrice = parts.reduce((min, item) => {
        const trimmed = item.trim();
        if (!trimmed) return min;
        console.log(trimmed);
        const match = trimmed.match(/(?::\s*)?(\d+(?:\.\d+)?)/);
        const price = match ? parseFloat(match[1]) : NaN;

        if (!isNaN(price) && price < min) {
            return price;
        }
        return min;
    }, Infinity);

    return minPrice === Infinity ? 0 : Math.floor(minPrice);
}



function setPrice(amount: number) {
    const priceInput = document.getElementById('PriceAmount') as HTMLInputElement;

    if (priceInput) {
        const finalPrice = amount;
        priceInput.value = finalPrice.toString();

        priceInput.dispatchEvent(new Event('input', { bubbles: true }));

        priceInput.dispatchEvent(new Event('change', { bubbles: true }));

        priceInput.dispatchEvent(new Event('blur', { bubbles: true }));

        console.log(`SUCCESS: Price set to ${finalPrice}.`);
    } else {
        console.warn("CRITICAL: Can't find price input element");
    }
}
function setTitle(title: string) {
    const titleInput = document.getElementById('postad-title') as HTMLInputElement;

    if (titleInput) {
        const optimizedTitle = title;

        titleInput.value = optimizedTitle;

        titleInput.dispatchEvent(new Event('input', { bubbles: true }));

        titleInput.dispatchEvent(new Event('change', { bubbles: true }));

        titleInput.dispatchEvent(new Event('blur', { bubbles: true }));

        console.log(`SUCCESS: Title set to: "${optimizedTitle}"`);
    } else {
        console.warn("CRITICAL: Can't find title input element");
    }
}

function fillKijijiForm() {
    chrome.storage.local.get(['harvestedProduct'], (result) => {
        const product = result.harvestedProduct as Product;
        if (product) {
            console.log('Injecting product into Kijiji:', product);

            const adTypeInput = Array.from(document.querySelectorAll('legend')).
                find(el => {
                    return el.textContent?.includes('Ad Type')
                })?.
                nextElementSibling?.querySelectorAll('input')

            if (!adTypeInput) {
                console.warn('Ad type input not found');
                return;
            }

            const targetInput = Array.from(adTypeInput || [])
                .find(el => {
                    return el.parentElement?.textContent?.includes("I'm offering")
                }) as HTMLInputElement;

            console.log(targetInput)
            if (targetInput) {
                targetInput.checked = true;
                targetInput.dispatchEvent(new Event('input', { bubbles: true }));
            } else {
                console.warn('Ad type input not found');
            }

            selectRadioOption("Business");

            setConditionToNew("new");
            setTitle(product.title);

            setDescription(product.description);

            uploadToKijiji(product.images);
            setPrice(getMinPrice(product.price));

            console.log('Images to be uploaded:', product.images);
            alert(`Attempted to fill details for "${product.title}". Check console for missing fields.`);
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
