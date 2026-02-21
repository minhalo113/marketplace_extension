import type { Product } from '../types';

console.log('Facebook Injector Loaded');

function createFillButton() {
    const button = document.createElement('button');
    button.innerText = 'Fill Product Details';
    button.style.position = 'fixed';
    button.style.bottom = '20px';
    button.style.right = '20px';
    button.style.zIndex = '9999';
    button.style.padding = '10px 20px';
    button.style.backgroundColor = '#1877F2';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '5px';
    button.style.cursor = 'pointer';
    button.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';

    button.addEventListener('click', fillFacebookForm);

    document.body.appendChild(button);
}

async function selectCategory(targetCategory: string) {
    const categoryLabel = Array.from(document.querySelectorAll('label'))
        .find(el => el.textContent?.includes('Category') || el.textContent?.includes('Hạng mục'));

    if (!categoryLabel) {
        console.error("Cant find Category dropdown");
        return;
    }

    (categoryLabel as HTMLElement).click();
    console.log("Opening Category dropdown...");

    await new Promise(resolve => setTimeout(resolve, 1000));

    const dialog = document.querySelector('div[role="dialog"][aria-label="Dropdown menu"]');

    if (!dialog) {
        console.error("Cant find dialog");
        return;
    }

    const options = Array.from(dialog.querySelectorAll('div[role="button"]'));

    if (options.length === 0) {
        console.log("cant find option")
    }
    // console.log("options")
    // console.log(options)

    const target = options.find(el => {
        // console.log("el:")
        // console.log(el.textContent?.trim())
        return el.textContent?.trim() === targetCategory
    });

    if (target) {
        (target as HTMLElement).click();
        console.log(`Selected category: ${targetCategory}`);
    } else {
        console.error(`Cant find category: ${targetCategory}`);
    }
}

async function selectDropdown(targetCondition: string, targetTitle: string[]) {
    const conditionLabel = Array.from(document.querySelectorAll('label')).find(el =>
        targetTitle.some(title => el.textContent?.includes(title))
    );

    if (!conditionLabel) {
        console.error(`Cant find ${targetTitle} dropdown`);
        return;
    }

    (conditionLabel as HTMLElement).click();
    console.log(`Opening ${targetTitle} dropdown...`);

    const maxRetries = 10;
    let dialog: HTMLElement | null = null;

    for (let i = 0; i < maxRetries; i++) {
        dialog = document.querySelector('div[role="listbox"][aria-label="Select an option"]');
        if (dialog) break;
        await new Promise(r => setTimeout(r, 100));
    }


    if (!dialog) {
        console.error("Cant find dialog");
        return;
    }

    const options = Array.from(dialog.querySelectorAll('div[role="option"]'));
    const target = options.find(el => el.textContent?.trim() === targetCondition);

    if (target) {
        (target as HTMLElement).click();
        console.log(`Selected condition: ${targetCondition}`);
    } else {
        console.error(`Cant find condition: ${targetCondition}`);
    }
}

function getMinPrice(input: string): number {
    if (!input) return 0;

    const parts = input.split(',');

    const minPrice = parts.reduce((min, item) => {
        const trimmed = item.trim();
        if (!trimmed) return min;

        const match = trimmed.match(/(?::\s*)?(\d+(?:\.\d+)?)/);
        const price = match ? parseFloat(match[1]) : NaN;

        if (!isNaN(price) && price < min) {
            return price;
        }
        return min;
    }, Infinity);

    return minPrice === Infinity ? 0 : Math.floor(minPrice);
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function uploadToFacebook(imageUrls: string[]) {
    const fileInput = document.querySelector('input[type="file"][accept*="image"]') as HTMLInputElement;

    if (!fileInput) {
        console.error("Cant find image input element")
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

async function fillFacebookForm() {
    chrome.storage.local.get(['harvestedProduct'], async (result) => {
        const product = result.harvestedProduct as Product;

        if (product) {
            console.log('Injecting product into Facebook:', product);

            const titleInput = Array.from(document.querySelectorAll('label'))
                .find(label => label.textContent?.includes('Title') || label.textContent?.includes('Tiêu đề'))
                ?.querySelector('input') as HTMLInputElement;

            if (titleInput) {
                titleInput.value = product.title;
                titleInput.dispatchEvent(new Event('input', { bubbles: true }));
            } else {
                console.warn('Title input not found');
            }

            const priceInput = Array.from(document.querySelectorAll('label'))
                .find(label => label.textContent?.includes('Price') || label.textContent?.includes('Giá'))
                ?.querySelector('input') as HTMLInputElement;

            if (priceInput) {
                const minPrice = getMinPrice(product.price);
                priceInput.value = minPrice.toString();
                priceInput.dispatchEvent(new Event('input', { bubbles: true }));
            } else {
                console.warn('Price input not found');
            }

            const descriptionInput = Array.from(document.querySelectorAll('label'))
                .find(label => label.textContent?.includes('Description') || label.textContent?.includes('Mô tả'))
                ?.querySelector('textarea') as HTMLTextAreaElement;

            if (descriptionInput) {
                descriptionInput.value = product.description;
                descriptionInput.dispatchEvent(new Event('input', { bubbles: true }));
            } else {
                console.warn('Description input not found');
            }

            await selectCategory('Toys & GamesShipping available');

            await selectDropdown('New', ['Condition', 'Điều Kiện']);

            await new Promise(resolve => setTimeout(resolve, 1000));

            await selectDropdown('12+ years', ['Age Range', 'Độ tuổi']);
            await selectDropdown('List as In StockIf you\'re selling more than one item, show "In Stock" on your listing.', ['Availability', 'Tình trạng']);

            await uploadToFacebook(product.images);
            console.log('Images to be uploaded manually or via advanced script:', product.images);

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
