
module.exports = {
    mapCategories : (posts) => {
        posts.map((post) => {
            switch (post.category) {
                case "Beds":
                    post.category_mapped = "beds";
                    break;
                case "Sofas":
                    post.category_mapped = "sofas";
                    break;
                case "Dining Tables":
                    post.category_mapped = "dining tables";
                    break;
                case "Other Furniture":
                    post.category_mapped = "similar items";
                    break;
                case "Coffee Tables":
                    post.category_mapped = "coffee tables";
                    break;
                case "Cabinets":
                    post.category_mapped = "cabinets";
                    break;
                case "Desks":
                    post.category_mapped = "desks";
                    break;
                case "Entertainment & TV Units":
                    post.category_mapped = "TV Units";
                    break;
                case "Dining Chairs":
                    post.category_mapped = "dining chairs";
                    break;
                case "Bookcases & Shelves":
                    post.category_mapped = "bookcases & shelves";
                    break;
                case "Armchairs":
                    post.category_mapped = "armchairs";
                    break;
                case "Dressers & Drawers":
                    post.category_mapped = "dressers & drawers";
                    break;
                case "Buffets & Side Tables":
                    post.category_mapped = "buffets & side tables";
                    break;
                case "Stools & Bar stools":
                    post.category_mapped = "stools & bar stools";
                    break;
                case "Mirrors":
                    post.category_mapped = "mirrors";
                    break;
                case "Bedside Tables":
                    post.category_mapped = "bedside tables";
                    break;
                case "Office Chairs":
                    post.category_mapped = "office chairs";
                    break;
                case "Wardrobes":
                    post.category_mapped = "wardrobes";
                    break;
            }
        });
    }
}
