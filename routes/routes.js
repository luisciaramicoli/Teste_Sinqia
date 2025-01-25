const express = require("express");
const router = express.Router();

// referência a controllers que serão utilizados nas rotas
const ComprasController = require("../controllers/compras");


//Compras
router.get("/compras", ComprasController.listarCompras);
router.post("/compras", ComprasController.cadastrarCompra); //body
router.patch("/compras/:comp_id", ComprasController.editarCompra); // params (URL) e body
router.delete("/compras/:comp_id", ComprasController.apagarCompra); // params (URL)



module.exports = router;
