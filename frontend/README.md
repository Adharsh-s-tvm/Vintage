<!-- ------------------------------------------------------------------------------------------------------------------------------------------ -->
<!-- Search need to done from backend in shop -->
<!-- Crop image -->




PRODUXT VARIANT ADD BUG...........

WEEK 3

User side :
User profile(Show user details, show address, show orders, edit profile, cancel orders, forgot password).

<!-- Show user details including profile image and address. -->

Implement Edit profile (edit profile and profile page should not be the same)
Note : When editing email need to verify the emails via OTP or Token.
Implement an option to change password followed by its functionality.

Address Management
Implement Add,Edit and Delete.

Cart management (Add to cart, list products in cart, remove products from cart)
Implement Add to Cart
Ensure that if a product or its category is blocked or unlisted, the product cannot be added to the cart, even if the user is on the product detail page.
If the product is already in cart increase its quantity
If a product is added to the cart, ensure it is removed from the wishlist if it exists there.
Implement increment and decrement functionality for quantity. Ensure validation based on the stock left in inventory.
Handle the maximum quantity a person can add to the cart for a single product
Out-of-stock products should be displayed as disabled and ensure they cannot be moved to checkout upon proceeding.
Checkout page
Display user-added addresses.
Provide an option to add a new address and edit existing addresses.
Ensure one address is selected as the default.
Display products moved to checkout with:
Product image
Quantity
Item total (price based on quantity)
Taxes (optional)
Applicable discount
Final price summary (including taxes, discounts, and shipping)
Place order with Cash on Delivery
Order successful page with thanking statement and illustration and should contain buttons to redirect user to order detail page and continue shopping page.
Order Management
Implement an order listing page where each order has a unique, consistent orderID (not \_id in DBS).
Show basic details in the listing, such as status, order date, etc.
Provide an option to cancel the entire order or specific products. Upon cancellation, ensure that the stock of the respective products is incremented in the inventory.
when canceling an order should ask for reason(optional) .
Provide an option to return order when the order is delivered,should ask for reason for return (mandatory).
Include a detail page for each respective order.
Provide the option to download the invoice for each order.(pdf)
Implement search to find specific order

Admin side :
Order Management
List order in desc order by order date
Show basic details like orderID,date,,detail of user ,view button to show detailed view of order etc..
Implement functionality to change order Status(pending,shipped,out for delivery,delivered,cancelled)
Implement a functionality to verify the return request of product
If the verification is accepted ,then return the previously paid amount by the consumer or user to the wallet.
Implement search,sort and filter along with clear search functionality.
Implement Pagination
Inventory/Stock management.
