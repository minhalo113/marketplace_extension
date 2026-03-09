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