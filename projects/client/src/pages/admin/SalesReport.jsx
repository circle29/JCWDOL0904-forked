import React, { useEffect, useState } from "react";
import { Stack, Spinner, Select } from "@chakra-ui/react";
import { api } from "../../API/api";
import { useDispatch, useSelector } from "react-redux";
import { transactionData } from "../../features/transactionSlice";
import { transactionItemData } from "../../features/transactionItemSlice";
import moment from "moment";
import Pagination from "../../components/admin/Pagination";
import OrderDetailModal from "../../components/admin/OrderDetailModal";
import OrderSearch from "../../components/admin/OrderSearch";
import OrderWarehouseDropdown from "../../components/admin/OrderWarehouseDropdown";
import ProductCategoryDropdown from "../../components/admin/ProductCategoryDropdown";
import ProductSearch from "../../components/admin/ProductSearch";

const SalesReport = () => {
  const value = useSelector((state) => state.transactionSlice.value);
  // console.log(value);
  const itemValue = useSelector((state) => state.transactionItemSlice.value);
  // console.log(itemValue);
  const [page, setPage] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [transaction, setTransaction] = useState(null);
  const [product, setProduct] = useState(null);
  const [paddingLeft, setPaddingLeft] = useState("pl-72");
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState("");
  const [currentPage, setCurrentPage] = useState(0); // Starting page is 0
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [warehouses, setWarehouses] = useState([]);
  const [order, setOrder] = useState("product_name");
  const [sort, setSort] = useState("ASC");
  const user = useSelector((state) => state.userSlice);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [category, setCategory] = useState([]);
  const [productSearch, setProductSearch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(1);

  const dispatch = useDispatch();
  useEffect(() => {
    const updatePaddingLeft = () => {
      if (window.innerWidth < 401) {
        setPaddingLeft("");
      } else {
        setPaddingLeft("pl-72");
      }
    };
    window.addEventListener("DOMContentLoaded", updatePaddingLeft);
    window.addEventListener("resize", updatePaddingLeft);
    return () => {
      window.removeEventListener("DOMContentLoaded", updatePaddingLeft);
      window.removeEventListener("resize", updatePaddingLeft);
    };
  }, []);

  const urlProduct = "/transaction/product";
  const getProductTransaction = async () => {
    try {
      let selectWarehouse;
      if (user.id_warehouse) {
        selectWarehouse = user.id_warehouse;
      } else {
        selectWarehouse = selectedWarehouse;
      }
      let selectCategory = selectedCategory;

      let result = await api.get(urlProduct, {
        params: {
          page,
          userId: user.id,
          productSearch,
          role: user.role,
          warehouse: selectWarehouse,
          category: selectCategory,
          month: selectedMonth,
        },
      });
      console.log(result);
      // setProduct(result.data.result);
      setTotalPage(result.data.totalPages);
      dispatch(transactionItemData(result.data.allProduct));
      setTotalPrice(result.data.total_price);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const response = await api.get("/warehouses/data");
      // console.log(response.data.result);
      setWarehouses(response.data.result);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCategory = async () => {
    try {
      const response = await api.get("/category");
      // console.log(response.data.result);
      setCategory(response.data.result);
    } catch (error) {
      console.error(error);
    }
  };

  const handlePage = (event) => {
    setPage(event.selected);
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  useEffect(() => {
    fetchCategory();
  }, []);

  useEffect(() => {
    getProductTransaction();
  }, [page, productSearch, selectedWarehouse, selectedCategory, selectedMonth]);

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
  };

  const handleViewOrderDetail = (idtrans) => {
    setSelectedTransaction(idtrans);
    setIsDetailModalOpen(true);
  };

  const handleWarehouseChange = (event) => {
    const selectedValue = event.target.value;
    console.log(selectedValue);
    if (user.role === "adminWarehouse") {
      setSelectedWarehouse(user.id_warehouse);
    } else {
      setSelectedWarehouse(selectedValue);
    }
  };
  const handleCategoryChange = (event) => {
    const selectedCategoryValue = event.target.value;
    console.log(selectedCategoryValue);
    setSelectedCategory(selectedCategoryValue);
    console.log(setSelectedMonth);
  };

  const handleSorting = (value) => {
    if (value === "1") {
      setOrder("product_name");
      setSort("DESC");
    } else if (value === "2") {
      setOrder("price");
      setSort("ASC");
    } else if (value === "3") {
      setOrder("price");
      setSort("DESC");
    } else {
      setOrder("product_name");
      setSort("ASC");
    }
  };

  const ProductMap = itemValue?.map((pEl) => {
    const date = pEl.Transaction.transaction_date;
    const formattedDate = moment(date).format("DD MMMM YYYY");
    console.log(pEl);
    // console.log(pEl.Product.Stocks);
    return (
      <tr key={pEl}>
        <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-900">
          {pEl.Product.product_name}
        </td>
        <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-900">
          {formattedDate}
        </td>
        <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-900">
          {pEl.Transaction.Warehouse.warehouse}
        </td>
        <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-900">
          {pEl.category}
        </td>
        <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-900">
          {`Rp ${pEl.price.toLocaleString()}`}
        </td>
      </tr>
    );
  });

  return (
    <div className={` ${paddingLeft}  py-10 items-center`}>
      {itemValue ? (
        <div>
          <div className="sm:flex-auto">
            <h1 className="text-xl font-semibold text-gray-900">
              Sales Report
            </h1>
            <Stack direction={"row"} className="flex gap-3 pb-3 pt-5">
              <ProductSearch
                handleSearch={setProductSearch}
                productSearch={productSearch}
              />
            </Stack>
            <Stack direction="row">
              <OrderWarehouseDropdown
                user={user}
                handleWarehouseChange={handleWarehouseChange}
                selectedWarehouse={selectedWarehouse}
                warehouses={warehouses}
              />
              <ProductCategoryDropdown
                // user={user}
                handleCategoryChange={handleCategoryChange}
                selectedCategory={selectedCategory}
                category={category}
              />
            </Stack>
            <Stack direction="row">
              <Select
                placeholder=""
                width="120px"
                display="flex"
                justifyContent="center"
                borderRadius="50px"
                style={{ fontSize: "11px" }}
                onChange={(e) => handleSorting(e.target.value)}
              >
                <option value="1" style={{ fontSize: "10px", borderRadius: 0 }}>
                  Newest Date
                </option>
                <option value="2" style={{ fontSize: "10px", borderRadius: 0 }}>
                  Oldest Date
                </option>
                <option value="3" style={{ fontSize: "10px", borderRadius: 0 }}>
                  Price low - high
                </option>
                <option value="3" style={{ fontSize: "10px", borderRadius: 0 }}>
                  Price high - low
                </option>
              </Select>
              <Select
                // placeholder="-"
                width="120px"
                display="flex"
                justifyContent="center"
                borderRadius="50px"
                style={{ fontSize: "11px" }}
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                <option value="01">January</option>
                <option value="02">February</option>
                <option value="03">March</option>
                <option value="04">April</option>
                <option value="05">May</option>
                <option value="06">June</option>
                <option value="07">July</option>
                <option value="08">August</option>
                <option value="09">September</option>
                <option value="10">October</option>
                <option value="11">November</option>
                <option value="12">December</option>
              </Select>
            </Stack>
          </div>
          <div className="mt-6 flex flex-col justify-end max-w-5xl xl">
            <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="whitespace-nowrap px-2 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Product
                        </th>

                        <th
                          scope="col"
                          className="whitespace-nowrap px-2 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Transaction Date
                        </th>
                        <th
                          scope="col"
                          className="whitespace-nowrap px-2 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Warehouse
                        </th>
                        <th
                          scope="col"
                          className="whitespace-nowrap px-2 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Category
                        </th>
                        <th
                          scope="col"
                          className="whitespace-nowrap px-2 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Item Price
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {ProductMap}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td
                          colSpan="2"
                          className="whitespace-nowrap px-2 py-2 pr-4 text-sm font-semibold text-left text-gray-900"
                        >
                          Total Transaction:
                        </td>
                        <td></td>
                        <td
                          colSpan="1"
                          className="whitespace-nowrap px-2 py-2 text-sm text-gray-500 font-bold"
                        >
                          {`Rp ${totalPrice.toLocaleString()}`}
                        </td>
                      </tr>
                    </tfoot>
                    <tfoot>
                      <tr>
                        <td
                          colSpan="2"
                          className="whitespace-nowrap px-2 py-2 pr-4 text-sm font-semibold text-left text-gray-900"
                        >
                          Transaction:
                        </td>
                        <td></td>
                        <td
                          colSpan="1"
                          className="whitespace-nowrap px-2 py-2 text-sm text-gray-500 font-bold"
                        >
                          {`Rp ${totalPrice.toLocaleString()}`}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
              <Pagination
                totalPages={totalPage}
                handlePageChange={handlePage}
              />
              <OrderDetailModal
                isDetailModalOpen={isDetailModalOpen}
                closeDetailModal={closeDetailModal}
                selectedTransaction={selectedTransaction}
              />
            </div>
          </div>
        </div>
      ) : (
        <Spinner />
      )}
    </div>
  );
};

export default SalesReport;
