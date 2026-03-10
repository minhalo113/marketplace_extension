function createFloatingUI() {
    const container = document.createElement('div');
    container.id = 'scr-command-center';
    Object.assign(container.style, {
        position: 'fixed', bottom: '20px', right: '20px', zIndex: '9999',
        backgroundColor: '#1a1a1a', padding: '15px', borderRadius: '8px',
        display: 'flex', flexDirection: 'column', gap: '10px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.5)', border: '1px solid #333'
    });

    const input = document.createElement('input');
    input.id = 'product-id-input';
    input.placeholder = 'Enter Product ID';
    Object.assign(input.style, {
        padding: '8px', borderRadius: '4px', border: '1px solid #444',
        backgroundColor: '#2d2d2d', color: '#fff', fontSize: '12px', outline: 'none'
    });

    const button = document.createElement('button');
    button.innerText = 'Send reviews';
    Object.assign(button.style, {
        padding: '10px', backgroundColor: '#E53238', color: 'white',
        border: 'none', borderRadius: '4px', cursor: 'pointer',
        fontWeight: 'bold', fontSize: '13px', transition: '0.2s'
    });

    button.addEventListener('mouseover', () => button.style.backgroundColor = '#c42a2f');
    button.addEventListener('mouseout', () => button.style.backgroundColor = '#E53238');
    button.addEventListener('click', sendReviewsToBackend);

    container.appendChild(input);
    container.appendChild(button);
    document.body.appendChild(container);
}

interface EnhancedComment {
    authorThumb: string;
    rating: number;
    date: string;
    content: string;
    reviewImages: string[];
}

function harvestFullReviews(): EnhancedComment[] {
    const reviewItems = document.querySelectorAll('.list--itemBox--je_KNzb');

    const uniqueComments = new Map<string, EnhancedComment>();

    reviewItems.forEach((item) => {
        const content = item.querySelector('.list--itemReview--d9Z9Z5Z')?.textContent?.trim() || "";
        const authorInfo = item.querySelector('.list--itemInfo--VEcgSFh span')?.textContent?.trim() || "";

        const uniqueId = `${authorInfo}-${content}`;

        if (!uniqueComments.has(uniqueId)) {
            const rating = item.querySelectorAll('.comet-icon-starreviewfilled').length;
            const authorThumb = item.querySelector('.list--itemPhoto--SQWM7vp img')?.getAttribute('src') || "";
            const infoText = item.querySelector('.list--itemInfo--VEcgSFh span')?.textContent || "";
            const date = infoText.split('|')[1]?.trim() || "";

            const imgElements = item.querySelectorAll('.list--itemThumbnails--TtUDHhl img');
            const reviewImages = Array.from(imgElements).map(img => {
                const src = (img as HTMLImageElement).src;
                return src.replace(/_\d+x\d+.*$/, "");
            });

            uniqueComments.set(uniqueId, { authorThumb, rating, date, content, reviewImages });
        }
    });

    const finalData = Array.from(uniqueComments.values());
    return finalData;
}

async function sendReviewsToBackend() {
    const inputElement = document.getElementById('product-id-input') as HTMLInputElement;
    const productId = inputElement?.value.trim();

    const reviews = harvestFullReviews();

    if (reviews.length === 0) {
        console.error("no reviews found")
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/reviews/scraping', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer YOUR_INTERNAL_SECRET'
            },
            body: JSON.stringify({
                productId: productId,
                harvestedAt: new Date().toISOString(),
                reviews: reviews
            })
        });

        if (response.ok) {
            alert(`Deployment Successful: ${reviews.length} reviews sent.`);
        } else {
            const errorText = await response.text();
            console.error(`${response.status} - ${errorText}`);
        }
    } catch (error) {
        console.error(error);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createFloatingUI);
} else {
    createFloatingUI();
}
