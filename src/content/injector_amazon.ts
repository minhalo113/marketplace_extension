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

async function transcodeToJpeg(blob: Blob): Promise<Blob> {
    const imageBitmap = await createImageBitmap(blob);

    const canvas = document.createElement('canvas');
    canvas.width = imageBitmap.width;
    canvas.height = imageBitmap.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new Error("Could not get canvas context");
    }

    ctx.drawImage(imageBitmap, 0, 0);
    imageBitmap.close();

    return new Promise((resolve, reject) => {
        canvas.toBlob((resultBlob) => {
            if (resultBlob) resolve(resultBlob);
            else reject(new Error("Canvas toBlob failed"));
        }, 'image/jpeg', 0.95);
    })
}
// function setValueAndDispatch(element: HTMLInputElement | HTMLTextAreaElement, value: string | number) {
//     if (element) {
//         element.value = value.toString();
//         element.dispatchEvent(new Event('input', { bubbles: true }));
//         element.dispatchEvent(new Event('change', { bubbles: true }));
//         element.dispatchEvent(new Event('blur', { bubbles: true }));
//     }
// }

function setKatValueAndDispatch(element: HTMLElement, value: string | number) {
    if (element) {
        // Set the value property on the custom element itself
        (element as any).value = value.toString();

        // Try to find the internal textarea/input within the shadow DOM and set it there too
        if (element.shadowRoot) {
            const internalInput = element.shadowRoot.querySelector('textarea, input') as HTMLInputElement | HTMLTextAreaElement;
            if (internalInput) {
                internalInput.value = value.toString();
                internalInput.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
                internalInput.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
            }
        }

        // Also update any hidden textareas in the light DOM slot
        const lightDomInput = element.querySelector('textarea[hidden], input[hidden]') as HTMLInputElement | HTMLTextAreaElement;
        if (lightDomInput) {
            lightDomInput.value = value.toString();
        }

        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
        element.dispatchEvent(new Event('blur', { bubbles: true }));
    }
}

async function uploadToAmazon(imageUrls: string[]) {
    const fileInput = document.querySelector('input[type="file"][accept*=".JPEG"]') as HTMLInputElement;

    if (!fileInput) {
        console.error("Can't find image input element for Amazon.");
        return;
    }

    const dataTransfer = new DataTransfer();

    for (const [index, url] of imageUrls.entries()) {
        try {
            const response = await fetch(url);
            let blob = await response.blob();

            if (blob.type !== `image/jpeg` && blob.type !== 'image/jpg') {
                blob = await transcodeToJpeg(blob);
            }

            const file = new File([blob], `product_image_${index}.jpg`, { type: `image/jpeg` });
            dataTransfer.items.add(file);
        } catch (error) {
            console.error(`Failed processing image: ${url}`, error);
        }
    }

    if (dataTransfer.files.length > 0) {
        fileInput.files = dataTransfer.files;
        fileInput.dispatchEvent(new Event('change', { bubbles: true }));
        console.log(`SUCCESS: Dispatching upload event for ${dataTransfer.files.length} images.`);
    }
}

function fillAmazonForm() {
    chrome.storage.local.get(['harvestedProduct'], async (result) => {
        const product = result.harvestedProduct as Product;
        if (product) {
            console.log('Injecting product into Amazon:', product);

            let fieldsFilled = 0;

            const titleKat = document.querySelector('kat-textarea[name*="item_name" i], kat-input[name*="item_name" i]') as HTMLElement;

            if (titleKat && !(titleKat as any).disabled) {
                setKatValueAndDispatch(titleKat, product.title);
                console.log(`SUCCESS: Title set to: "${product.title}" (Kat-UI)`);
                fieldsFilled++;
            } else {
                console.log(`Cant find the title input`);
            }

            const priceInput = document.querySelector('input[name="standard_price"], input[name="price"], input[id*="price" i], input[id*="standard_price" i]') as HTMLInputElement;
            if (priceInput && !priceInput.disabled) {
                const numericPrice = parseFloat(product.price.replace(/[^0-9.]/g, ''));
                if (!isNaN(numericPrice)) {
                    console.log(`SUCCESS: Price set to: $${numericPrice} (Standard Price)`);
                    fieldsFilled++;
                }
            } else {
                console.log(`Cant find the price input`);
            }

            const descriptionKat = document.querySelector('kat-textarea[name*="product_description" i]') as HTMLElement;

            if (descriptionKat && !(descriptionKat as any).disabled) {
                setKatValueAndDispatch(descriptionKat, product.description);
                console.log("SUCCESS: Picked description (Kat-UI)");
                fieldsFilled++;
            } else {
                console.log(`Cant find the description input`);
            }

            // Image Upload

            if (product.images && product.images.length > 0) {
                await uploadToAmazon(product.images);
                fieldsFilled++;
            } else {
                console.log(`Cant find the image input`);

            }

            if (fieldsFilled > 0) {
                console.log(`Successfully filled/processed ${fieldsFilled} field(s) on this page.`);
            } else {
                console.log(`No matching fields found on this page to fill.`);
            }

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
