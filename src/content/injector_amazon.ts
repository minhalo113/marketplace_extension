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

const forceKatCheckbox = (selector: string): void => {
    const host = document.querySelector(selector) as HTMLElement;
    if (host) {
        host.click();
        host.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
    } else {
        console.log("Cant find checkbox")
    }
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

const generateSKU = (productName: string): string => {
    // 1. Làm sạch: Chỉ giữ lại chữ và số, viết hoa, lấy 10 ký tự đầu
    const namePrefix = productName
        .replace(/[^a-zA-Z0-9]/g, '') // Xóa sạch rác (khoảng trắng, #, &, /...)
        .toUpperCase()
        .slice(0, 10);

    // 2. Tạo chuỗi ngẫu nhiên 5 ký tự để đảm bảo không bị trùng (Collision)
    const randomSuffix = Math.random()
        .toString(36)
        .substring(2, 7)
        .toUpperCase();

    // Kết quả dạng: FIGURINEAN-X8K2L
    return `${namePrefix}-${randomSuffix}`;
};

function fillAmazonForm() {
    chrome.storage.local.get(['harvestedProduct'], async (result) => {
        const product = result.harvestedProduct as Product;
        if (product) {
            console.log('Injecting product into Amazon:', product);

            const titleKat = document.querySelector('kat-textarea[name*="item_name" i], kat-input[name*="item_name" i]') as HTMLElement;

            if (titleKat && !(titleKat as any).disabled) {
                setKatValueAndDispatch(titleKat, product.title);
                console.log(`SUCCESS: Title set to: "${product.title}" (Kat-UI)`);
            } else {
                console.log(`Cant find the title input`);
            }

            forceKatCheckbox('kat-checkbox[data-testid="no-brand-name-checkbox"]');
            forceKatCheckbox('kat-checkbox[data-cy="upc-exemption-checkbox"]');
            forceKatCheckbox('kat-radiobutton[name="is_assembly_required-0-value"][value="false"]');

            const bulletPoint = document.querySelector('kat-textarea[name="bullet_point-0-value"]') as HTMLElement;

            if (bulletPoint && !(bulletPoint as any).disabled) {
                setKatValueAndDispatch(bulletPoint, product.title);
                console.log(`SUCCESS: Bulletpoints set to: "${product.title}" (Kat-UI)`);
            } else {
                console.log(`Cant find the bullet point input`)
            }

            const targetAudience = document.querySelector('kat-predictive-input[name="target_audience_keyword-0-value"]') as HTMLElement;

            if (targetAudience && !(targetAudience as any).disabled) {
                setKatValueAndDispatch(targetAudience, "Unisex Adults");
                console.log(`SUCCESS: Target audience set to: "Unisex Adults" (Kat-UI)`);
            } else {
                console.log(`Cant find the target audience input`)
            }

            const modelName = document.querySelector('kat-input[name="model_name-0-value"]') as HTMLElement;

            if (modelName && !(modelName as any).disabled) {
                setKatValueAndDispatch(modelName, product.title);
                console.log(`SUCCESS: Model name set to: "${product.title}" (Kat-UI)`);
            } else {
                console.log(`Cant find the model name input`)
            }

            const fillManufacturer = document.querySelector('kat-input[name="manufacturer-0-value"]') as HTMLElement;

            if (fillManufacturer && !(fillManufacturer as any).disabled) {
                setKatValueAndDispatch(fillManufacturer, "A Figure A Day");
                console.log(`SUCCESS: Manufacturer set to: "A Figure A Day" (Kat-UI)`);
            } else {
                console.log(`Cant find the manufacturer input`)
            }

            // const genericKeywords = document.querySelector('kat-input[name="generic_keywords-0-value"]') as HTMLElement;

            // if (genericKeywords && !(genericKeywords as any).disabled) {
            //     setKatValueAndDispatch(genericKeywords, "collectible figure");
            //     console.log(`SUCCESS: Generic keywords set to: "collectible figure" (Kat-UI)`);
            // } else {
            //     console.log(genericKeywords)
            //     console.log(!(genericKeywords as any).disabled)
            //     console.log(`Cant find the generic keywords input`)
            // }

            // const fillManufacturerPartNumber = document.querySelector('kat-input[name="manufacturer_part_number-0-value"]') as HTMLElement;

            // if (fillManufacturerPartNumber && !(fillManufacturerPartNumber as any).disabled) {
            //     const sku = generateSKU(product.title);
            //     setKatValueAndDispatch(fillManufacturerPartNumber, sku);
            //     console.log(`SUCCESS: Manufacturer part number set to: "${sku}" (Kat-UI)`);
            // } else {
            //     console.log(fillManufacturerPartNumber)
            //     console.log(!(fillManufacturerPartNumber as any).disabled)
            //     console.log(`Cant find the manufacturer part number input`)
            // }

            const fillMaterialDetails = document.querySelector('kat-predictive-input[name="material-0-value"]') as HTMLElement;

            if (fillMaterialDetails && !(fillMaterialDetails as any).disabled) {
                setKatValueAndDispatch(fillMaterialDetails, "ATBC PVC Acrylonitrile Butadiene Styrene");
                console.log(`SUCCESS: Material details set to: "ATBC PVC Acrylonitrile Butadiene Styrene" (Kat-UI)`);
            } else {
                console.log(`Cant find the material details input`)
            }

            const targetGender = document.querySelector('kat-dropdown[name="target_gender-0-value"]') as HTMLElement;

            if (targetGender && !(targetGender as any).disabled) {
                setKatValueAndDispatch(targetGender, "Unisex");
                console.log(`SUCCESS: Target gender set to: "Unisex" (Kat-UI)`);
            } else {
                console.log(`Cant find the target gender input`)
            }

            const numberOfItems = document.querySelector('kat-input[name="number_of_items-0-value"]') as HTMLElement;

            if (numberOfItems && !(numberOfItems as any).disabled) {
                setKatValueAndDispatch(numberOfItems, "1");
                console.log(`SUCCESS: Number of items set to: "1" (Kat-UI)`);
            } else {
                console.log(`Cant find the number of items input`)
            }

            const unit_count = document.querySelector('kat-input[name="unit_count-0-value"]') as HTMLElement;

            if (unit_count && !(unit_count as any).disabled) {
                setKatValueAndDispatch(unit_count, "200");
                console.log(`SUCCESS: Unit count set to: "200" (Kat-UI)`);
            } else {
                console.log(`Cant find the unit count input`)
            }

            const unitType = document.querySelector('kat-dropdown[name="unit_count-0-type-value"]') as HTMLElement;

            if (unitType && !(unitType as any).disabled) {
                setKatValueAndDispatch(unitType, "count");
                console.log(`SUCCESS: Unit type set to: "count" (Kat-UI)`);
            } else {
                console.log(`Cant find the unit type input`)
            }

            const priceInput = document.querySelector('input[name="standard_price"], input[name="price"], input[id*="price" i], input[id*="standard_price" i]') as HTMLInputElement;
            if (priceInput && !priceInput.disabled) {
                const numericPrice = parseFloat(product.price.replace(/[^0-9.]/g, ''));
                if (!isNaN(numericPrice)) {
                    console.log(`SUCCESS: Price set to: $${numericPrice} (Standard Price)`);
                }
            } else {
                console.log(`Cant find the price input`);
            }

            const descriptionKat = document.querySelector('kat-textarea[name*="product_description" i]') as HTMLElement;

            if (descriptionKat && !(descriptionKat as any).disabled) {
                setKatValueAndDispatch(descriptionKat, product.description);
                console.log("SUCCESS: Picked description (Kat-UI)");
            } else {
                console.log(`Cant find the description input`);
            }

            // Image Upload

            if (product.images && product.images.length > 0) {
                await uploadToAmazon(product.images);
            } else {
                console.log(`Cant find the image input`);

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
