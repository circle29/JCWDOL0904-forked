const {
  Transaction,
  Warehouse,
  Products,
  Stocks,
  TransactionItem,
  Address,
  sequelize,
  User,
  Ekspedisi,
  Notification,
  StockHistory,
} = require("../models");
const db = require("../models");
const moment = require("moment");
const { io } = require("../src/index");
const { createNotification } = require("./notificationController");

module.exports = {
  confirmOrder: async (req, res) => {
    try {
      const { id } = req.body;
      const transaction = await Transaction.findOne({
        where: {
          id,
        },
        include: [
          {
            model: TransactionItem,
            include: {
              model: Products,
            },
          },
        ],
      });

      if (transaction.status === "On Process") {
        return res
          .status(400)
          .send({ message: "Transaction is already in process" });
      }

      if (transaction.status !== "Waiting For Payment Confirmation") {
        return res
          .status(404)
          .send({ message: "Transaction not eligible for confirmation" });
      }

      // Deduct stock from the warehouse and create stock history
      const transactionItems = transaction.TransactionItems;
      const promises = transactionItems.map(async (item) => {
        const product = item.Product;
        const stock = await Stocks.findOne({
          where: {
            id_product: product.id,
            id_warehouse: transaction.id_warehouse, // Assuming warehouse ID is stored in the transaction
          },
        });

        if (!stock || stock.stock < item.quantity) {
          throw new Error(
            `Insufficient stock for product ${product.product_name}`
          );
        }

        // Deduct stock quantity
        stock.stock -= item.quantity;
        await stock.save();

        // Create stock history
        await StockHistory.create({
          quantity: item.quantity,
          status: "out",
          id_product: product.id,
          current_stock: stock.stock - item.quantity,
        });
      });

      await Promise.all(promises);

      // Create a notification for the user
      await createNotification(
        `Invoice ${transaction.invoice_number}`,
        "Your order is being processed",
        transaction.id_user,
        "admin"
      );
      await transaction.update({ status: "On Process" });

      res.status(200).send({ message: "Transaction confirmed successfully" });
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "Failed to confirm transaction" });
    }
  },
  rejectOrder: async (req, res) => {
    try {
      const transactionId = req.params.id;
      const transaction = await Transaction.findByPk(transactionId);

      if (!transaction) {
        return res.status(404).send({ message: "Transaction not found" });
      }
      if (transaction.status !== "Waiting For Payment Confirmation") {
        return res.status(400).send({
          message: "Cannot reject transaction with the current status",
        });
      }
      await transaction.update({ status: "Waiting For Payment" });

      const expirationDate = new Date();
      expirationDate.setSeconds(expirationDate.getSeconds() + 30);
      await transaction.update({ expired: expirationDate });
      await transaction.update({ payment_proof: null });

      // Create a notification for the user
      await createNotification(
        `Invoice ${transaction.invoice_number}`,
        "Your order is rejected, please update proof of payment",
        transaction.id_user,
        "admin"
      );

      res.status(200).send({ message: "Transaction rejected successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Error rejecting transaction" });
    }
  },
  sendOrder: async (req, res) => {
    try {
      const { orderId } = req.params;
      const order = await Transaction.findByPk(orderId, {
        include: [
          {
            model: TransactionItem,
            include: [Products],
          },
          {
            model: User,
          },
        ],
      });

      if (!order) {
        return res.status(404).send({ message: "Order not found" });
      }
      if (order.status == "Shipped") {
        return res.status(400).send({ message: "Transaction is already sent" });
      }
      if (order.status !== "On Process") {
        return res
          .status(400)
          .send({ message: "The transaction is not eligible to be sent" });
      }

      for (const item of order.TransactionItems) {
        const product = await Products.findByPk(item.id_product);
        if (!product) {
          return res
            .status(404)
            .send({ error: `Product with ID ${item.id_product} not found` });
        }

        const totalStock = await Stocks.sum("stock", {
          where: { id_product: item.id_product },
        });
        if (totalStock <= 0) {
          return res.status(400).send({
            error: `Product with ID ${item.id_product} is out of stock`,
          });
        }
        if (item.quantity > totalStock) {
          return res.status(400).send({
            error: `Insufficient stock for product with ID ${item.id_product}`,
          });
        }
      }

      const expirationDate = new Date();
      expirationDate.setSeconds(expirationDate.getSeconds() + 30);
      await order.update({
        status: "Shipped",
        expired_confirmed: expirationDate,
      });

      let notification = await createNotification(
        `Invoice ${order.invoice_number}`,
        "Your order has been shipped",
        order.id_user,
        "admin"
      );
      io.emit("notification", notification);

      const timeoutDuration = order.expired_confirmed - new Date();
      setTimeout(async () => {
        const updatedOrder = await Transaction.findAll({
          where: {
            status: "Shipped",
            expired_confirmed: {
              [db.Sequelize.Op.lte]: moment().toDate(),
            },
          },
          include: [
            {
              model: TransactionItem,
              include: [Products],
            },
            {
              model: Address,
            },
            {
              model: Ekspedisi,
            },
          ],
          order: [["createdAt", "DESC"]],
        });
        for (const order of updatedOrder) {
          await order.update({ status: "Order Confirmed" });
          io.emit("orderConfirmed", order.toJSON());
          await createNotification(
            `Invoice ${order.invoice_number}`,
            "Order has been received",
            order.id_user,
            "admin"
          );
          await createNotification(
            `Invoice ${order.invoice_number}`,
            "Order has been received",
            order.id_user,
            "user"
          );
        }
      }, timeoutDuration);
      res.status(200).send({ message: "Order sent successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Error sending order" });
    }
  },
};
