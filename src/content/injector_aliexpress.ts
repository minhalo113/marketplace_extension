function createFillButton() {
    const button = document.createElement('button');
    button.innerText = 'Send Reviews To Backend';
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

    button.addEventListener('click', sendReviewsToBackend);

    document.body.appendChild(button);
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
    const comments: EnhancedComment[] = [];

    reviewItems.forEach((item) => {
        const rating = item.querySelectorAll('.comet-icon-starreviewfilled').length;

        const authorThumb = item.querySelector('.list--itemPhoto--SQWM7vp img')?.getAttribute('src') || "";

        const infoText = item.querySelector('.list--itemInfo--VEcgSFh span')?.textContent || "";
        const date = infoText.split('|')[1]?.trim() || "";
        const content = item.querySelector('.list--itemReview--d9Z9Z5Z')?.textContent?.trim() || "";

        const imgElements = item.querySelectorAll('.list--itemThumbnails--TtUDHhl img');
        const reviewImages = Array.from(imgElements).map(img => {
            const src = (img as HTMLImageElement).src;
            return src.replace(/_\d+x\d+.*$/, "");
        });

        comments.push({ authorThumb, rating, date, content, reviewImages });
    });

    return comments;
}

async function sendReviewsToBackend() {
    const reviews = harvestFullReviews();
    console.log(reviews);
}