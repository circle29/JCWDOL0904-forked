import React, { useEffect, useState } from "react";
import { Fragment } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import {
  Bars3Icon,
  XMarkIcon,
  ShoppingCartIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import { Link, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { updateCart } from "../features/cartSlice";
import { useNavigate } from "react-router-dom";
import { login } from "../features/userSlice";
import { unreadCount } from "../features/notificationSlice";
import io from "socket.io-client";
import LoginModal from "./loginModal";
// import env from "react-dotenv";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export const Navbar = () => {
  const { user_image, id, username, email } = useSelector(
    (state) => state.userSlice
  );

  const navigation = useNavigate();
  const dispatch = useDispatch();
  const [isLogin, SetIsLogin] = useState(false);
  const [unreads, setUnreads] = useState(0);

  useEffect(() => {
    if (!localStorage.getItem("auth")) SetIsLogin(false);
    else if (localStorage.getItem("auth")) SetIsLogin(true);
  }, [localStorage.getItem("auth")]);

  useEffect(() => {
    const socket = io("http://localhost:8000");
    socket.on("notificationRead", (updatedNotifications) => {
      console.log("This is an update from the socket", updatedNotifications);

      const unread = updatedNotifications.filter((notification) => {
        return (
          notification.UserNotifications.length === 0 ||
          !notification.UserNotifications[0].read
        );
      });
      setUnreads(unread.length);
    });

    return () => {
      socket.off("notificationUpdate");
    };
  }, []);

  const handleLogOut = () => {
    localStorage.removeItem("selectedAddress");
    localStorage.removeItem("auth");
    dispatch(
      login({
        id: 0,
        fullname: "",
        username: "",
        is_verified: "",
        user_image: "",
        role: "",
      })
    );
    // navigation("/login");
  };

  const { cart } = useSelector((state) => state.cartSlice.value);
  const notificationUnread = useSelector(
    (state) => state.notificationSlice.value.unread
  );
  useEffect(() => {
    setUnreads(notificationUnread);
  }, [notificationUnread]);

  // Dispatch the Redux action to update the cart
  const updateCartData = (cart) => {
    dispatch(updateCart({ cart }));
  };
  const updateUnreadCount = (unread) => {
    dispatch(unreadCount({ unread }));
  };

  // update kembalo cartdata dan unreadCount notifikasi ketika load page
  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      updateCartData(JSON.parse(storedCart));
    }

    const unreadCount = localStorage.getItem("unread");
    if (unreadCount) {
      updateUnreadCount(JSON.parse(unreadCount));
    }
  }, []);

  // update cart, and notification di local storage setiap cart atau notification ada perubahan
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
    localStorage.setItem("unread", JSON.stringify(notificationUnread));
  }, [cart, notificationUnread]);
  return (
    <Disclosure
      as="nav"
      className="bg-white shadow z-50"
      style={{ position: "fixed", width: "100%" }}
    >
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between">
              <div className="flex">
                <div className="-ml-2 mr-2 flex items-center md:hidden">
                  {/* Mobile menu button */}
                  <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
                <div
                  className="flex flex-shrink-0 items-center cursor-pointer"
                  onClick={() => navigation("/")}
                >
                  <img
                    className="block h-8 w-auto lg:hidden "
                    src={`${process.env.REACT_APP_API_BASE}/logo_galaxy.png`}
                    alt="Your Company"
                  />
                  <img
                    className="hidden h-8 w-auto lg:block"
                    src={`${process.env.REACT_APP_API_BASE}/logo_galaxy.png`}
                    alt="Your Company"
                  />
                  <div className="flex ml-40 justify-end md:hidden lg:hidden xl:hidden">
                    {isLogin ? (
                      <button
                        type="button"
                        className="rounded-full bg-white p-1 text-gray-400 hover:text-gray-500"
                      >
                        <div className="flex gap-3">
                          <div className="flex">
                            <EnvelopeIcon
                              onClick={() => {
                                navigation("/notification");
                              }}
                              className="h-6 w-6"
                              aria-hidden="true"
                            />
                            <p>{unreads}</p>
                          </div>
                        </div>
                      </button>
                    ) : null}
                    {isLogin ? (
                      <button
                        type="button"
                        className="rounded-full bg-white p-1 text-gray-400 hover:text-gray-500"
                      >
                        <span className="sr-only">View notifications</span>
                        <div className="flex gap-3">
                          <div className="flex">
                            <ShoppingCartIcon
                              onClick={() => {
                                navigation("/cart");
                              }}
                              className="h-6 w-6"
                              aria-hidden="true"
                            />
                            <p>{cart.length}</p>
                          </div>
                        </div>
                      </button>
                    ) : null}
                  </div>
                </div>
                <div className="hidden md:ml-6 md:flex md:space-x-8"></div>
              </div>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {isLogin ? null : (
                    <LoginModal />
                    // <button
                    //   type="button"
                    //   className="relative inline-flex items-center rounded-md border border-transparent bg-black px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    //   onClick={() => navigation("/login")}
                    // >
                    //   <span>Login</span>
                    // </button>
                  )}
                </div>
                <div className="hidden md:ml-4 md:flex md:flex-shrink-0 md:items-center">
                  {isLogin ? (
                    <button
                      type="button"
                      className="rounded-full bg-white p-1 text-gray-400 hover:text-gray-500"
                    >
                      <div className="flex gap-3">
                        <div className="flex">
                          <EnvelopeIcon
                            onClick={() => {
                              navigation("/notification");
                            }}
                            className="h-6 w-6"
                            aria-hidden="true"
                          />
                          <p>{unreads}</p>
                        </div>
                      </div>
                    </button>
                  ) : null}
                  {isLogin ? (
                    <button
                      type="button"
                      className="rounded-full bg-white p-1 text-gray-400 hover:text-gray-500"
                    >
                      <span className="sr-only">View notifications</span>
                      <div className="flex gap-3">
                        <div className="flex">
                          <ShoppingCartIcon
                            onClick={() => {
                              navigation("/cart");
                            }}
                            className="h-6 w-6"
                            aria-hidden="true"
                          />
                          <p>{cart.length}</p>
                        </div>
                      </div>
                    </button>
                  ) : null}
                  {/* Profile dropdown */}
                  {isLogin ? (
                    <Menu as="div" className="relative ml-3">
                      <div>
                        <Menu.Button className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                          <span className="sr-only">Open user menu</span>
                          <img
                            className="h-8 w-8 rounded-full"
                            src={user_image}
                            alt="usr"
                          />
                        </Menu.Button>
                      </div>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <Menu.Item>
                            {({ active }) => (
                              <a
                                href="#"
                                className={classNames(
                                  active ? "bg-gray-100" : "",
                                  "block px-4 py-2 text-sm"
                                )}
                                onClick={() => navigation("/profile")}
                              >
                                Your Profile
                              </a>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <a
                                href="#"
                                className={classNames(
                                  active ? "bg-gray-100" : "",
                                  "block px-4 py-2 text-sm"
                                )}
                                onClick={() => navigation("/transactions")}
                              >
                                Transactions
                              </a>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <a
                                href="#"
                                className={classNames(
                                  active ? "bg-gray-100" : "",
                                  "block px-4 py-2 text-sm"
                                )}
                              >
                                Register
                              </a>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <a
                                href="#"
                                className={classNames(
                                  active ? "bg-gray-100" : "",
                                  "block px-4 py-2 text-sm text-gray-700"
                                )}
                              >
                                Settings
                              </a>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <a
                                className={classNames(
                                  active ? "bg-gray-100" : "",
                                  "block px-4 py-2 text-sm text-gray-700 cursor-pointer"
                                )}
                                onClick={() => handleLogOut()}
                              >
                                Sign out
                              </a>
                            )}
                          </Menu.Item>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
          <Disclosure.Panel className="md:hidden">
            <div className="space-y-1 pt-2 pb-3">
              <Disclosure.Button
                as="a"
                onClick={() => navigation("/")}
                className="block border-l-4 border-white bg-black py-2 pl-3 pr-4 text-base font-medium text-white sm:pl-5 sm:pr-6"
              >
                Dashboard
              </Disclosure.Button>
            </div>
            <div className="border-t border-gray-200 pt-4 pb-3">
              <div className="flex items-center px-4 sm:px-6 justify-between">
                <div className="flex-shrink-0">
                  <img
                    className="h-10 w-10 rounded-full"
                    src={user_image}
                    alt=""
                  />
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">
                    {username}
                  </div>
                  <div className="text-sm font-medium text-gray-500">
                    {email}
                  </div>
                </div>
                <div>
                  <Disclosure.Button
                    onClick={() => {
                      navigation("/notification");
                    }}
                    type="button"
                    className="ml-auto flex-shrink-0 rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2"
                  >
                    <EnvelopeIcon className="h-6 w-6" aria-hidden="true" />
                  </Disclosure.Button>
                  <Disclosure.Button
                    onClick={() => {
                      navigation("/cart");
                    }}
                    type="button"
                    className="ml-auto flex-shrink-0 rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2"
                  >
                    <ShoppingCartIcon className="h-6 w-6" aria-hidden="true" />
                  </Disclosure.Button>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <Disclosure.Button
                  onClick={() => navigation("/profile")}
                  as="a"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800 sm:px-6"
                >
                  Your Profile
                </Disclosure.Button>
                <Disclosure.Button
                  onClick={() => navigation("/transactions")}
                  as="a"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800 sm:px-6"
                >
                  Transactioin
                </Disclosure.Button>
                <Disclosure.Button
                  onClick={() => handleLogOut()}
                  as="a"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800 sm:px-6"
                >
                  Sign out
                </Disclosure.Button>
              </div>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};
