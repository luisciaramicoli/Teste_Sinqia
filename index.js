const express = require('express'); 
const cors = require('cors'); 
const router = require('./routes/routes');


const app = express(); 
app.use(cors()); 
app.use(express.json()); 
app.use(router);



// const porta = process.env.PORT || 3333;
const porta = 3333;

app.listen(porta, () => {
    console.log(`Servidor iniciado na porta ${porta}`);
});

// Rota de verificação de status
app.get('/health', (req, res) => {
    res.status(200).send('API funcionando corretamente!');
});

app.get('/', (request, response) => {
    response.send('Hello World');
});
