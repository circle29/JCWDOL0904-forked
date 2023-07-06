import {useState, useEffect} from "react";
import {api} from "../API/api";
import Swal from "sweetalert2";
import {useDispatch} from "react-redux";
import {cart, subtotal} from "../features/cartSlice";
import {useNavigate} from "react-router-dom";
import {CartItem} from "../components/CartItem";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  console.log(cartItems);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fetchCartItems = async () => {
    try {
      const userId = JSON.parse(localStorage.getItem("auth")).id;
      const response = await api.get(`/cart`, {
        params: {userId},
      });
      setCartItems(response.data.cartItems);

      let sum = 0;
      response.data.cartItems.forEach(
        (e) => (sum += e.quantity * e.Product.price)
      );
      setTotalPrice(sum);

      dispatch(
        cart({
          cart: response.data.cartItems,
        })
      );
      dispatch(
        subtotal({
          subtotal: sum,
        })
      );
      localStorage.setItem(
        "cartItems",
        JSON.stringify(response.data.cartItems)
      );
      localStorage.setItem("subTotal", JSON.stringify(sum));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

  const updateCartProduct = async (cartItemId, action) => {
    setLoading(true);
    try {
      const response = await api.patch(`/cart`, {
        cartItemId,
        action,
      });
      console.log(response.data);
      const updatedItems = cartItems.map((item) => {
        if (item.id === cartItemId) {
          return {
            ...item,
            quantity: response.data.quantity,
          };
        }
        return item;
      });
      setCartItems(updatedItems);
      fetchCartItems();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteCartItem = async (cartItemId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You are about to delete this item from your cart.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      confirmButtonColor: "black",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/cart/${cartItemId}`);
          fetchCartItems();
        } catch (error) {
          console.error(error);
        }
      }
    });
  };

  return (
    <div className="bg-white min-h-[700px] pt-10">
      <div className="mx-auto max-w-2xl px-4 pt-16 pb-24 sm:px-6 lg:max-w-7xl lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Shopping Cart
        </h1>
        <form className="mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
          <section aria-labelledby="cart-heading" className="lg:col-span-7">
            <h2 id="cart-heading" className="sr-only">
              Items in your shopping cart
            </h2>
            <ul
              role="list"
              className="divide-y divide-gray-200 border-t border-b border-gray-200">
              {cartItems.map((item) => {
                return (
                  <CartItem
                    key={item.id}
                    item={item}
                    updateCartProduct={updateCartProduct}
                    deleteCartItem={deleteCartItem}
                  />
                );
              })}
            </ul>
          </section>

          <section
            aria-labelledby="summary-heading"
            className="mt-16 rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8">
            <h2
              id="summary-heading"
              className="text-lg font-medium text-gray-900">
              Order summary
            </h2>

            <dl className="mt-6 space-y-4">
              <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                <dt className="text-base font-medium text-gray-900">
                  Order total
                </dt>
                <dd className="text-base font-medium text-gray-900">
                  Rp. {totalPrice.toLocaleString("id-ID")}
                </dd>
              </div>
            </dl>

            <div className="mt-6">
              <button
                onClick={() => navigate("/checkout")}
                type="submit"
                className="w-full rounded-full border border-transparent bg-gray-950 py-2 px-4 text-base font-medium text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Continue to Checkout
              </button>
            </div>
          </section>
        </form>
      </div>
    </div>
  );
};

export default Cart;
