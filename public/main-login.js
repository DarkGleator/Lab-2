const BASE_URL = window.location.hostname.includes('localhost')
  ? 'http://localhost:3000' // URL do backend local
  : 'https://oasi-backend.onrender.com'; // URL do backend no Render

document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('register-form');
  const loginForm = document.getElementById('login-form');
  const switchToRegister = document.getElementById('switch-to-register');
  const switchToLogin = document.getElementById('switch-to-login');
  const forgotPasswordLink = document.querySelector('.forgot-password');
  const recoverForm = document.getElementById('recover-form');
  const backToLoginButton = document.getElementById('back-to-login');


  // Alternar entre formulários
  switchToRegister?.addEventListener('click', () => {
    loginForm.classList.add('hidden'); // Esconde o formulário de login
    registerForm.classList.remove('hidden'); // Mostra o formulário de registo
  });

  switchToLogin?.addEventListener('click', () => {
    registerForm.classList.add('hidden'); // Esconde o formulário de registo
    loginForm.classList.remove('hidden'); // Mostra o formulário de login
  });

    // Alternar para o formulário de recuperação
  forgotPasswordLink?.addEventListener('click', () => {
    loginForm.classList.add('hidden'); // Esconde o login
    registerForm.classList.add('hidden'); // Esconde o registo
    recoverForm.classList.remove('hidden'); // Mostra o formulário de recuperação
  });

    // Voltar para o formulário de login
  backToLoginButton?.addEventListener('click', () => {
    recoverForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
  });

  // Função para exibir mensagem de sucesso
  function showSuccessMessage(message) {
    const successMessage = document.createElement('div');
    successMessage.classList.add('success-message');
    successMessage.innerHTML = `<p>${message}</p>`;

    // Adiciona a mensagem no formulário de registo
    registerForm.appendChild(successMessage);

    // Remove a mensagem após 5 segundos
    setTimeout(() => {
      successMessage.remove();
    }, 5000);
  }

  // Submissão do formulário de registo
  registerForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = registerForm.querySelector('input[name="name"]').value;
    const email = registerForm.querySelector('input[name="email"]').value;
    const password = registerForm.querySelector('input[name="password"]').value;

    try {
      const response = await fetch(`${BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        showSuccessMessage("Registou-se com sucesso,<br>faça login para entrar na sua conta.");
        registerForm.reset();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Erro ao realizar registo:', error);
    }
  });

  // Submissão do formulário de login
  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = loginForm.querySelector('input[name="email"]').value;
    const password = loginForm.querySelector('input[name="password"]').value;
  
    try {
      const response = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
      if (response.ok) {
        // Armazena os dados do utilizador no localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = 'profile.html'; // Redireciona para a página de perfil
      } else {
        alert(data.message); // Mensagem de erro
      }
    } catch (error) {
      console.error('Erro ao realizar login:', error);
    }
  });
});

function showSuccessMessage(message) {
  const successMessage = document.createElement('div');
  successMessage.classList.add('success-message'); // Aplica a classe CSS
  successMessage.innerHTML = `<p>${message}</p>`;

  // Adiciona a mensagem no formulário de recuperação
  const recoverForm = document.getElementById('recover-form');
  recoverForm.appendChild(successMessage);

  // Remove a mensagem após 5 segundos
  setTimeout(() => {
    successMessage.remove();
  }, 5000);
}

const recoverForm = document.getElementById('recover-form');

recoverForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = recoverForm.querySelector('input[name="email"]').value;

  try {
    const response = await fetch(`${BASE_URL}/recover-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (response.ok) {
      // Exibe mensagem de sucesso no formulário
      showSuccessMessage('A tua password foi redefinida para "123456789". Faz login com a nova password.');
      recoverForm.reset();
    } else {
      // Mostra mensagem de erro
      showSuccessMessage(data.message || 'Erro ao processar o pedido.');
    }
  } catch (error) {
    console.error('Erro ao recuperar a password:', error);
    showSuccessMessage('Erro ao conectar com o servidor. Tenta novamente mais tarde.');
  }
});