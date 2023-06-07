const router = require("express").Router()
const { productControllers } = require("../controllers")


router.get("/all", productControllers.getAllProduct)
router.post("/detail", productControllers.getOneProduct)


module.exports = router