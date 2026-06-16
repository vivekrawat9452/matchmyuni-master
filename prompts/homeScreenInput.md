Screens to implement:

1. HomeScreen
Figma Node: 12:101
Features:
- Header
- Categories carousel
- Product list

API:
GET /products/home

Navigation:
Add to MainTab stack

---

2. ProductDetailsScreen
Figma Node: 12:102
Features:
- Image gallery
- Product details
- Add to cart button

API:
GET /products/:id
POST /cart/add

Navigation:
Push from HomeScreen

---

3. CartScreen
Figma Node: 12:103
Features:
- Cart items
- Quantity controls
- Checkout CTA

API:
GET /cart
PATCH /cart/item