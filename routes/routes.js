const express = require("express");
const router = express.Router();
// isso aí
// referência a controllers que serão utilizados nas rotas
const TurismoController = require('../controllers/turismo');  // Verifique o caminho correto
const CadastroController = require('../controllers/usuarios');  // Verifique o caminho correto
const LoginController = require('../controllers/login');  // Verifique o caminho correto
const EstadosController = require('../controllers/estados');  // Verifique o caminho correto
// Listar todos os pontos turísticos
router.get("/pontosTuristicos", TurismoController.listarPontosTuristicos);
router.get("/listar", TurismoController.listarTudo);
// Cadastrar um novo ponto turístico
router.post("/cadastrarPonto", TurismoController.cadastrarPontoTuristico);

// Editar um ponto turístico
router.put("/pontosTuristicos/:ponto_id", TurismoController.editarPontoTuristico);

// Apagar um ponto turístico
router.delete("/pontosTuristicos/:ponto_id", TurismoController.apagarPontoTuristico);

// Cadastrar um novo ponto usuario
router.post("/cadastrarUsuario", CadastroController.cadastrarUsuario);

// Cadastrar um novo ponto usuario
router.post("/login", LoginController.login);

router.get("/estados", EstadosController.listarEstados);
router.get("/endereco", EstadosController.listarEndereco);

module.exports = router;
