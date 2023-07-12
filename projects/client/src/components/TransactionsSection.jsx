import React from "react";
import {TruckIcon} from "@heroicons/react/20/solid";
import moment from "moment";

const TransactionSections = ({
  transactions,
  handleFileUpload,
  cancelOrder,
  acceptOrder,
}) => {
  return (
    <div>
      {transactions &&
        transactions.map((transaction) => (
          <table
            className="mt-3 w-full text-gray-500 sm:mt-6"
            key={transaction.id}>
            <div>
              <h1 className="text-xs font-bold tracking-tight text-gray-900 px-3 py-3 rounded-md sm:text-xl">
                Invoice: {transaction.invoice_number}
              </h1>
            </div>
            <div className="pr-4">
              <caption className="sr-only">Products</caption>
              <thead className="sr-only text-left text-sm text-gray-500 sm:not-sr-only">
                <tr className="text-gray-900 font-medium">
                  <th
                    scope="col"
                    className="py-3 pr-8 w-full  sm:w-2/5 lg:w-1/3">
                    Product
                  </th>
                  <th scope="col" className="hidden w-1/5 py-3  sm:table-cell">
                    Price
                  </th>
                  <th
                    scope="col"
                    className="hidden py-3 pr-80 w-full sm:table-cell">
                    Description
                  </th>
                  <th scope="col" className="w-0 py-3 text-right w-full">
                    Quantity
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 border-b border-gray-200 text-sm sm:border-t">
                {transaction.TransactionItems.map((transactionItem) => (
                  <tr key={transactionItem.id}>
                    <td className="py-5">
                      <div className="flex items-center">
                        <img
                          src={transactionItem.Product.product_image}
                          alt={transactionItem.Product.product_name}
                          className="mr-6 h-16 w-16 rounded object-cover object-center"
                        />
                        <div className="flex flex-col">
                          <div className="font-medium text-sm -ml-1  mr-24 text-left text-gray-900">
                            {transactionItem.Product.product_name}
                          </div>
                          <div className="mt-2 text-xs -ml-16 sm:hidden">
                            Rp.{" "}
                            {transactionItem.Product.price.toLocaleString(
                              "id-ID"
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="hidden text-left py-6 pr-8 sm:table-cell">
                      Rp.{" "}
                      {transactionItem.Product.price.toLocaleString("id-ID")}
                    </td>
                    <td className="text-left py-6 pr-8 text-md sm:table-cell">
                      {transactionItem.Product.description}
                    </td>
                    <td className="py-6 text-right font-medium">
                      <a
                        href={transactionItem.href}
                        className="text-indigo-600">
                        <span className="hidden lg:inline md:inline">
                          {transactionItem.quantity}
                        </span>
                        <span className="sr-only">
                          , {transactionItem.Product.product_name}
                        </span>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </div>
            {/* Billing */}
            <section
              aria-labelledby="summary-heading"
              className="mt-5 shadow-md rounded-lg transition duration-300">
              <h2 id="summary-heading" className="sr-only">
                Billing Summary
              </h2>

              <div className="bg-gray-100 py-6 px-4 sm:rounded-lg sm:px-6 lg:grid lg:grid-cols-12 lg:gap-x-8 lg:px-8 lg:py-8">
                <dl className="grid grid-cols-2 gap-6 text-sm sm:grid-cols-2 md:gap-x-8 lg:col-span-7">
                  <div>
                    <dt className="font-medium text-gray-900">
                      Shipping address
                    </dt>
                    <dd className="mt-2 text-gray-500">
                      <span className="block">
                        {transaction.Address.recipient_name}
                      </span>
                      <div>
                        <span>{transaction.Address.city}, </span>
                        <span>{transaction.Address.province}</span>
                      </div>
                      <span>{transaction.Address.subdistrict}, </span>
                      <span>{transaction.Address.zip}</span>
                    </dd>
                  </div>
                  <div className="flex flex-col items-center">
                    <dt className="font-medium text-gray-900">
                      Shipping courier
                    </dt>
                    <dd className="-ml-4 -mt-1 flex flex-wrap  items-center">
                      <div className="mt-3 items-center  flex">
                        <p className="text-gray-900 justify-center flex gap-1 items-center">
                          <TruckIcon className="h-4 ml-4" />
                          <span>{transaction.Ekspedisi.name} </span>
                          <p className="text-gray-600"> 2–5 business days</p>
                        </p>
                      </div>
                    </dd>
                    <dt className="font-medium mt-3 block text-gray-900">
                      Status
                    </dt>
                    <div className="mt-1">
                      {transaction.status === "Canceled" ? (
                        <p className="text-red-500 font-medium">
                          {transaction.status}
                        </p>
                      ) : transaction.status === "Order Confirmed" ? (
                        <p className="text-green-600 font-medium">
                          {transaction.status}
                        </p>
                      ) : (
                        <p className="text-gray-600">{transaction.status}</p>
                      )}
                    </div>
                    <div className="mt-1">
                      {transaction.status === "Waiting For Payment" ? (
                        <p className="text-gray-600 text-xs">
                          <span>Expired Payment: </span>
                          {moment(transaction.expired).format(
                            "YYYY-MM-DD HH:mm:ss"
                          )}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </dl>

                <dl className="mt-8  text-sm lg:col-span-5 lg:mt-0">
                  <div className="divide-y divide-gray-200">
                    <div className="flex items-center justify-between pb-1">
                      <dt className="text-gray-900">Shipping fee</dt>
                      <dd className="font-medium text-gray-900">
                        Rp.{" "}
                        {transaction.ongkir
                          ? transaction.ongkir.toLocaleString("id-ID")
                          : null}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <dt className="text-gray-900 font-medium">Order total</dt>
                      <dd className="font-medium text-gray-900">
                        Rp. {transaction.total_price.toLocaleString("id-ID")}
                      </dd>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-4">
                    <div className="flex items-center">
                      {transaction.status === "Shipped" && (
                        <button
                          onClick={() => acceptOrder(transaction.id)}
                          className="px-4 py-2 text-sm font-medium text-white bg-black rounded-full hover:bg-gray-800">
                          Accept Order
                        </button>
                      )}
                      {transaction.status === "Waiting For Payment" && (
                        <label className="px-4 py-2 text-sm font-medium text-white bg-black rounded-full hover:bg-gray-800 transition ease-in-out duration-300">
                          <input
                            type="file"
                            className="hidden"
                            disabled={
                              transaction.status === "Canceled" ||
                              transaction.payment_proof
                            }
                            onChange={(e) =>
                              handleFileUpload(e, transaction.id)
                            }
                          />
                          Upload Payment Proof
                        </label>
                      )}
                      {transaction.status === "Waiting For Payment" && (
                        <button
                          onClick={() => cancelOrder(transaction.id)}
                          className="px-5 py-2 ml-4 text-sm font-medium text-black hover:bg-red-600 hover:text-white transition ease-in-out duration-300 rounded-full bg-slate-100">
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </div>
                </dl>
              </div>
            </section>
          </table>
        ))}
    </div>
  );
};

export default TransactionSections;
