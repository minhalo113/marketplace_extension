import type { Product } from '../types';

console.log('Amazon Injector Loaded');

function createFillButton() {
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.bottom = '20px';
    container.style.right = '20px';
    container.style.zIndex = '9999';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '10px';
    container.style.alignItems = 'flex-end';

    const stepsContainer = document.createElement('div');
    stepsContainer.style.display = 'none';
    stepsContainer.style.flexDirection = 'column';
    stepsContainer.style.gap = '10px';

    const steps = [
        { text: 'Step 1: Basic Info', handler: fillAmazonStep1 },
        { text: 'Step 2: Desc & Images', handler: fillAmazonStep2 },
        { text: 'Step 3: Customizations', handler: fillAmazonStep3 },
        { text: 'Step 4: Offer', handler: fillAmazonStep4 },
        { text: 'Step 5: Safety & Compliance', handler: fillAmazonStep5 }
    ];

    steps.forEach(step => {
        const button = document.createElement('button');
        button.innerText = step.text;
        button.style.padding = '10px 20px';
        button.style.backgroundColor = '#FF9900'; // Amazon Orange
        button.style.color = '#111111';
        button.style.border = 'none';
        button.style.borderRadius = '5px';
        button.style.cursor = 'pointer';
        button.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
        button.style.fontWeight = 'bold';
        button.addEventListener('click', step.handler);
        stepsContainer.appendChild(button);
    });

    const toggleButton = document.createElement('button');
    toggleButton.innerText = 'Show Injector Steps';
    toggleButton.style.padding = '12px 24px';
    toggleButton.style.backgroundColor = '#232F3E'; // Amazon Dark Blue
    toggleButton.style.color = '#FFFFFF';
    toggleButton.style.border = 'none';
    toggleButton.style.borderRadius = '5px';
    toggleButton.style.cursor = 'pointer';
    toggleButton.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    toggleButton.style.fontWeight = 'bold';
    toggleButton.style.fontSize = '14px';

    toggleButton.addEventListener('click', () => {
        if (stepsContainer.style.display === 'none') {
            stepsContainer.style.display = 'flex';
            toggleButton.innerText = 'Hide Injector Steps';
        } else {
            stepsContainer.style.display = 'none';
            toggleButton.innerText = 'Show Injector Steps';
        }
    });

    container.appendChild(stepsContainer);
    container.appendChild(toggleButton);
    document.body.appendChild(container);
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
    console.log(host)
    if (host) {
        console.log("Found checkbox");
        host.click();
        host.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
        console.log("Clicked checkbox");
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

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
            fileInput.files = dataTransfer.files;
            fileInput.dispatchEvent(new Event('change', { bubbles: true, composed: true }));

            const randomDelay = Math.floor(Math.random() * (2034)) + 1500;
            await sleep(randomDelay);
        } catch (error) {
            console.error(`Failed processing image: ${url}`, error);
        }
    }

    // if (dataTransfer.files.length > 0) {

    //     fileInput.files = dataTransfer.files;
    //     fileInput.dispatchEvent(new Event('change', { bubbles: true, composed: true }));

    //     const finalJitter = Math.random() * 1500 + 500;
    //     await sleep(finalJitter);
    //     console.log(`SUCCESS: Injected ${dataTransfer.files.length} images with Stealth Jitter.`);
    // }
}

const generateSKU = (productName: string): string => {
    const namePrefix = productName
        .replace(/[^a-zA-Z0-9]/g, '')
        .toUpperCase()
        .slice(0, 10);

    const randomSuffix = Math.random()
        .toString(36)
        .substring(2, 7)
        .toUpperCase();

    return `${namePrefix}-${randomSuffix}`;
};

function fillAmazonStep1() {
    chrome.storage.local.get(['harvestedProduct'], async (result) => {
        const product = result.harvestedProduct as Product;
        if (product) {
            console.log('Amazon Step 1: Injecting basic info:', product);

            // Item Name
            const titleKat = document.querySelector('kat-textarea[name*="item_name" i], kat-input[name*="item_name" i]') as HTMLElement;
            if (titleKat && !(titleKat as any).disabled) {
                setKatValueAndDispatch(titleKat, product.title);
                console.log(`SUCCESS: Title set to: "${product.title}" (Kat-UI)`);
            } else {
                console.log(`Cant find the title input`);
            }

            // Brand Name & External Product ID (using the checkboxes as currently implemented)
            forceKatCheckbox('kat-checkbox[data-testid="no-brand-name-checkbox"]');
            forceKatCheckbox('kat-checkbox[data-cy="upc-exemption-checkbox"]');

        } else {
            alert('No product data found. Please harvest a product first.');
        }
    });
}

function fillAmazonStep2() {
    chrome.storage.local.get(['harvestedProduct'], async (result) => {
        const product = result.harvestedProduct as Product;
        if (product) {
            console.log('Amazon Step 2: Injecting description & images:', product);

            // Product Description
            const descriptionKat = document.querySelector('kat-textarea[name*="product_description" i]') as HTMLElement;
            if (descriptionKat && !(descriptionKat as any).disabled) {
                setKatValueAndDispatch(descriptionKat, product.description);
                console.log("SUCCESS: Picked description (Kat-UI)");
            } else {
                console.log(`Cant find the description input`);
            }

            // Bulletpoints
            const bulletPoint = document.querySelector('kat-textarea[name="bullet_point-0-value"]') as HTMLElement;
            if (bulletPoint && !(bulletPoint as any).disabled) {
                setKatValueAndDispatch(bulletPoint, product.title); // Using title as originally coded
                console.log(`SUCCESS: Bulletpoints set to: "${product.title}" (Kat-UI)`);
            } else {
                console.log(`Cant find the bullet point input`)
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

const selectDropdownOption = (dropdownSelector: string, targetOption: string): void => {
    const host = document.querySelector(dropdownSelector) as any;

    console.log(host);
    console.log(host.shadowRoot);

    if (host && host.shadowRoot) {
        const option = host.shadowRoot.querySelector(`kat-option[value="${targetOption}"]`) as HTMLElement;

        if (option) {
            option.click();
            const eventConfig = { bubbles: true, composed: true };
            host.dispatchEvent(new Event('input', eventConfig));
            host.dispatchEvent(new Event('change', eventConfig));

            console.log(`SUCCESS: Target Gender established as ${targetOption} via Direct Option Click.`);
        } else {
            console.error(`FAILURE: kat-option[value="${targetOption}"] not found inside Shadow DOM.`);
        }
    } else {
        console.error("CRITICAL: kat-dropdown not found or Shadow DOM is inaccessible.");
    }
};

const forceSetChecked = (selector: string): void => {
    const host = document.querySelector(selector) as any;

    if (host && host.shadowRoot) {
        let internalRadio = host.querySelector('input[type="radio"]') as HTMLInputElement;

        if (internalRadio) {
            internalRadio.checked = true;
            host.setAttribute('checked', 'true');
            host.checked = true;

            const eventConfig = { bubbles: true, composed: true };
            internalRadio.dispatchEvent(new Event('input', eventConfig));
            internalRadio.dispatchEvent(new Event('change', eventConfig));

            console.log(`SUCCESS: Checked state forced for ${host}`);
        }
    } else {
        console.error(`CRITICAL: Element or ShadowRoot not found for ${selector}`);
    }
};
function fillAmazonStep3() {
    chrome.storage.local.get(['harvestedProduct'], async (result) => {
        const product = result.harvestedProduct as Product;
        if (product) {
            console.log('Amazon Step 3: Injecting customizations and details:', product);

            // Does this product have customizations?
            forceKatCheckbox('kat-radiobutton[name="has_customizations-0-value"][value="false"]');

            // Is this product assembly required?
            forceSetChecked('kat-radiobutton[name="is_assembly_required-0-value"][value="false"]');

            // Target Audience
            const targetAudience = document.querySelector('kat-predictive-input[name="target_audience_keyword-0-value"]') as HTMLElement;
            if (targetAudience && !(targetAudience as any).disabled) {
                setKatValueAndDispatch(targetAudience, "Unisex Adults");
                console.log(`SUCCESS: Target audience set to: "Unisex Adults" (Kat-UI)`);
            } else {
                console.log(`Cant find the target audience input`)
            }

            // Model Name
            const modelName = document.querySelector('kat-input[name="model_name-0-value"]') as HTMLElement;
            if (modelName && !(modelName as any).disabled) {
                setKatValueAndDispatch(modelName, product.title);
                console.log(`SUCCESS: Model name set to: "${product.title}" (Kat-UI)`);
            } else {
                console.log(`Cant find the model name input`)
            }

            // Manufacturer
            const fillManufacturer = document.querySelector('kat-input[name="manufacturer-0-value"]') as HTMLElement;
            if (fillManufacturer && !(fillManufacturer as any).disabled) {
                setKatValueAndDispatch(fillManufacturer, "A Figure A Day");
                console.log(`SUCCESS: Manufacturer set to: "A Figure A Day" (Kat-UI)`);
            } else {
                console.log(`Cant find the manufacturer input`)
            }

            // Generic Keyword
            const genericKeywords = document.querySelector('kat-input[name="generic_keyword-0-value"]') as HTMLElement; // Example placeholder selector
            if (genericKeywords && !(genericKeywords as any).disabled) {
                setKatValueAndDispatch(genericKeywords, "collectible figure");
                console.log(`SUCCESS: Generic keywords set (Kat-UI)`);
            } else {
                console.log(`Cant find the generic keywords input`)
            }

            // Material Details
            const fillMaterialDetails = document.querySelector('kat-predictive-input[name="material-0-value"]') as HTMLElement;
            if (fillMaterialDetails && !(fillMaterialDetails as any).disabled) {
                setKatValueAndDispatch(fillMaterialDetails, "ATBC PVC Acrylonitrile Butadiene Styrene");
                console.log(`SUCCESS: Material details set to: "ATBC PVC Acrylonitrile Butadiene Styrene" (Kat-UI)`);
            } else {
                console.log(`Cant find the material details input`)
            }

            // Number of Items
            const numberOfItems = document.querySelector('kat-input[name="number_of_items-0-value"]') as HTMLElement;
            if (numberOfItems && !(numberOfItems as any).disabled) {
                setKatValueAndDispatch(numberOfItems, "1");
                console.log(`SUCCESS: Number of items set to: "1" (Kat-UI)`);
            } else {
                console.log(`Cant find the number of items input`)
            }

            // Part Number
            const fillManufacturerPartNumber = document.querySelector('kat-input[name="part_number-0-value"]') as HTMLElement; // Example placeholder selector
            if (fillManufacturerPartNumber && !(fillManufacturerPartNumber as any).disabled) {
                setKatValueAndDispatch(fillManufacturerPartNumber, generateSKU(product.title));
                console.log(`SUCCESS: Part number set (Kat-UI)`);
            } else {
                console.log(`Cant find the part number input`)
            }

            // Unit Count
            const unit_count = document.querySelector('kat-input[name="unit_count-0-value"]') as HTMLElement;
            if (unit_count && !(unit_count as any).disabled) {
                setKatValueAndDispatch(unit_count, "1");
                console.log(`SUCCESS: Unit count set to: "1" (Kat-UI)`);
            } else {
                console.log(`Cant find the unit count input`)
            }

            // Unit Count Type
            selectDropdownOption('kat-dropdown[name="unit_count-0-type-value"]', 'count');

            // Manufacturer Minimum Age
            const minAge = document.querySelector('kat-input[name="manufacturer_minimum_age-0-value"]') as HTMLElement; // Example placeholder selector
            if (minAge && !(minAge as any).disabled) {
                setKatValueAndDispatch(minAge, "180");
                console.log(`SUCCESS: Manufacturer Minimum Age set (Kat-UI)`);
            } else {
                console.log(`Cant find the minimum age input`)
            }

            // Manufacturer Maximum Age
            const maxAge = document.querySelector('kat-input[name="manufacturer_maximum_age-0-value"]') as HTMLElement; // Example placeholder selector
            if (maxAge && !(maxAge as any).disabled) {
                setKatValueAndDispatch(maxAge, "1188");
                console.log(`SUCCESS: Manufacturer Maximum Age set (Kat-UI)`);
            } else {
                console.log(`Cant find the maximum age input`)
            }

            // Included Components
            const includedComponents = document.querySelector('kat-input[name="included_components-0-value"]') as HTMLElement; // Example placeholder selector
            if (includedComponents && !(includedComponents as any).disabled) {
                setKatValueAndDispatch(includedComponents, "1 x Figure, Accessories (if applicable)");
                console.log(`SUCCESS: Included Components set (Kat-UI)`);
            } else {
                console.log(`Cant find the included components input`)
            }

            // Manufacturer Contact Information
            const contactInfo = document.querySelector('kat-textarea[name="manufacturer_contact_information-0-value"]') as HTMLElement; // Example placeholder selector
            if (contactInfo && !(contactInfo as any).disabled) {
                setKatValueAndDispatch(contactInfo, "figureaday.store@gmail.com");
                console.log(`SUCCESS: Manufacturer Contact Information set (Kat-UI)`);
            } else {
                console.log(`Cant find the contact information input`)
            }

            // Item Dimensions L x W x H
            // Height Unit
            selectDropdownOption('kat-dropdown[name="item_length_width_height-0-height-unit"]', 'centimeters');

            // Length Unit
            selectDropdownOption('kat-dropdown[name="item_length_width_height-0-length-unit"]', 'centimeters');

            // Width Unit
            selectDropdownOption('kat-dropdown[name="item_length_width_height-0-width-unit"]', 'centimeters');

            selectDropdownOption('kat-dropdown[name="target_gender-0-value"]', 'unisex');

            // Price (Original property)

        } else {
            alert('No product data found. Please harvest a product first.');
        }
    });
}

function fillAmazonStep4() {
    // Quantity
    const quantity = document.querySelector('kat-input[id="fulfillment_availability#1.quantity"]') as HTMLInputElement;
    if (quantity && !quantity.disabled) {
        setKatValueAndDispatch(quantity, "200");
        console.log(`SUCCESS: Quantity set to: 200 (Kat-UI)`);
    } else {
        console.log(`Cant find the quantity input`);
    }

    // Condition
    selectDropdownOption('kat-dropdown[name="condition_type-0-value"]', 'new_new');

    // List Price
    const listPrice = document.querySelector('kat-input[name="list_price-0-value"]') as HTMLInputElement;
    if (listPrice && !listPrice.disabled) {
        setKatValueAndDispatch(listPrice, "0");
        console.log(`SUCCESS: List Price set to: 0 (Kat-UI)`);
    } else {
        console.log(`Cant find the list price input`);
    }

    forceKatCheckbox('kat-radiobutton[name="offerFulfillment"][value="MFN"]');
}

function fillAmazonStep5() {
    // Safety Warning
    const safetyWarning = document.querySelector('kat-textarea[name="safety_warning-0-value"]') as HTMLInputElement;
    if (safetyWarning && !safetyWarning.disabled) {
        setKatValueAndDispatch(safetyWarning, "This product is not a toy. It is a collectible item intended for adult collectors aged 14 and above. Choking Hazard: Small parts. Not for children under 15 years.");
        console.log(`SUCCESS: Safety Warning set to: This product is not a toy. It is a collectible item intended for adult collectors aged 14 and above. Choking Hazard: Small parts. Not for children under 15 years. (Kat-UI)`);
    } else {
        console.log(`Cant find the safety warning input`);
    }

    // Country of Origin
    selectDropdownOption('kat-dropdown[name="country_of_origin-0-value"]', 'CN');

    // CPSIA Cautionary Statement
    selectDropdownOption('kat-dropdown[name="cpsia_cautionary_statement-0-value"]', 'no_warning_applicable');

    console.log("SUCCESS: Compliance data injected. Regulatory bypass active.");

}


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createFillButton);
} else {
    createFillButton();
}
