const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

const USERS_FILE = path.join(__dirname, 'users.json');
// Middleware para servir arquivos estáticos do `dist`
app.use(express.static(path.join(__dirname, 'dist')));



// Permitir múltiplos domínios
const allowedOrigins = [
  'http://localhost:3000', // Para ambiente local
  'https://oasi.onrender.com' // Domínio hospedado no Render
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Permite qualquer domínio listado
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true,
  })
);

app.use(express.json());

// Função para ler os utilizadores do arquivo
function loadUsers() {
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Função para guardar os utilizadores no arquivo
function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
}

// Rota de login
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const users = loadUsers();
  const user = users.find((u) => u.email === email && u.password === password);

  if (user) {
    res.json({ message: 'Login bem-sucedido!', user });
  } else {
    res.status(401).json({ message: 'Email ou senha inválidos.' });
  }
});

// Rota de registo
app.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  const users = loadUsers();

  if (users.some((user) => user.email === email)) {
    return res.status(400).json({ message: 'Este email já está registrado.' });
  }

  const newUser = { name, email, password };
  users.push(newUser);
  saveUsers(users);

  res.status(201).json({ message: 'Utilizador registado com sucesso!', user: newUser });
});

app.post('/update-user', (req, res) => {
  const { originalEmail, email,emailNewsletter, newsletter, profileImage, ...updatedData } = req.body; // Desestrutura o email original e os dados atualizados
  const users = loadUsers(); // Carrega os utilizadores

  // Encontra o índice do utilizador pelo email ORIGINAL
  
  const userIndex = users.findIndex((user) => user.email && user.email.trim() === email.trim());

  if (userIndex !== -1) {
    // Atualiza os dados do utilizador, incluindo o email
    users[userIndex] = { ...users[userIndex], email, ...(profileImage && { profileImage }),...(emailNewsletter && { emailNewsletter }),...(newsletter && { newsletter }), ...updatedData };

    saveUsers(users); // Salva os dados no arquivo JSON

    return res.json({
      user: users[userIndex],
    });
  } else {
    return res.status(404).json({ message: 'Utilizador não encontrado.' });
  }
});

// Rota para recuperação de password
app.post('/recover-password', (req, res) => {
  const { email } = req.body;

  // Lê o ficheiro users.json
  fs.readFile(USERS_FILE, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ message: 'Erro no servidor ao ler o ficheiro.' });
    }

    let users = JSON.parse(data);
    const userIndex = users.findIndex((user) => user.email === email);

    if (userIndex === -1) {
      return res.status(404).json({ message: 'Email não encontrado.' });
    }

    // Atualiza a password para 123456789
    users[userIndex].password = '123456789';

    // Escreve as alterações no ficheiro users.json
    fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ message: 'Erro ao atualizar a password.' });
      }
      return res.status(200).json({ message: 'Password redefinida com sucesso.' });
    });
  });
});

// Rota para subscrever à newsletter
app.post('/newsletter', (req, res) => {
  const { email, newsletterEmail } = req.body; // Email do utilizador e o email da newsletter

  if (!email) {
    return res.status(400).json({ message: 'O campo de e-mail é obrigatório.' });
  }

  const users = loadUsers();
  const user = users.find((u) => u.email === email); // Encontrar o utilizador pelo email

  if (!user) {
    return res.status(404).json({ message: 'E-mail não encontrado. Por favor, crie uma conta primeiro.' });
  }

  // Atualiza o estado da newsletter e o email específico da newsletter
  user.newsletter = 'Ativa';
  user.emailNewsletter = newsletterEmail || email; // Define o emailNewsletter como o email do utilizador ou o fornecido

  saveUsers(users); // Grava no arquivo JSON

  return res.status(200).json({ message: 'Subscrição na newsletter realizada com sucesso!' });
});

// Rota para deletar o usuário
app.post('/delete-user', (req, res) => {
  const { email } = req.body;
  const users = loadUsers(); // Carrega os utilizadores do arquivo

  const userIndex = users.findIndex((user) => user.email === email); // Encontra o índice do utilizador pelo email

  if (userIndex !== -1) {
    users.splice(userIndex, 1); 
    saveUsers(users); // 
    return res.status(200).json({ message: 'Utilizador apagado com sucesso.' });
  } else {
    return res.status(404).json({ message: 'Utilizador não encontrado.' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});


// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
