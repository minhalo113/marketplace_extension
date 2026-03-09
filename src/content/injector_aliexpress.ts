interface StoreComment {
    date: string;
    content: string;
    images: string[];
}

function harvestAliExpressReviews(): StoreComment[] {
    const reviewItems = document.querySelectorAll('.list--itemBox--je_KNzb');
    const comments: StoreComment[] = [];

    reviewItems.forEach((item) => {
        const infoText = item.querySelector('.list--itemInfo--VEcgSFh span')?.textContent || "";
        const date = infoText.split('|')[1]?.trim() || "Recent";
        const content = item.querySelector('.list--itemReview--d9Z9Z5Z')?.textContent?.trim() || "";

        const imgElements = item.querySelectorAll('.list--itemThumbnails--TtUDHhl img');
        const images = Array.from(imgElements).map(img => {
            const rawSrc = (img as HTMLImageElement).src;
            return rawSrc.split('_')[0];
        });

        if (content || images.length > 0) {
            comments.push({ date, content, images });
        }
    });

    console.log(`SUCCESS: Harvested ${comments.length} comments for your store.`);
    return comments;
}