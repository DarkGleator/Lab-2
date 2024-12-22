const BASE_URL = window.location.hostname.includes('localhost')
? 'http://localhost:3000' // URL do backend local
: 'https://oasi.onrender.com'; // URL do backend no Render
  
  // ------------------- Dados do Perfil -------------------
document.addEventListener('DOMContentLoaded', () => {
  // ------------------- Elementos Globais -------------------
  const tabs = document.querySelectorAll('.tab-link'); // Abas
  const contents = document.querySelectorAll('.content'); // Conteúdo das abas

  // ------------------- Dados do Perfil -------------------

  
  const profileForm = document.getElementById('profile-form');
  const usernameInput = document.getElementById('username');
  const emailInput = document.getElementById('email');
  const localidadeInput = document.getElementById('localidade');
  const codigoPostalInput = document.getElementById('codigo-postal');
  const moradaInput = document.getElementById('morada');
  const uploadBtn = document.getElementById('upload-btn');
  const fileInput = document.getElementById('file-input');
  const profileImage = document.getElementById('profile-image');
  let uploadedImageBase64 = '';
  
  
  const profileMessage = document.getElementById('profile-message'); // Obter o elemento da mensagem
  profileMessage.textContent = ''; // Limpar mensagem anterior
  profileMessage.className = '';

  // Validação do Código Postal
  codigoPostalInput.addEventListener('input', () => {
    const codigoPostalPattern = /^\d{4}-\d{3}$/; // Padrão 4 dígitos, hífen, 3 dígitos
    if (!codigoPostalPattern.test(codigoPostalInput.value)) {
      codigoPostalInput.setCustomValidity('O Código Postal deve estar no formato 1234-567.');
    } else {
      codigoPostalInput.setCustomValidity('');
    }
  });

  // Validação da Localidade (não pode conter números)
  localidadeInput.addEventListener('input', () => {
    const localidadePattern = /^[A-Za-zÀ-ÿ\s]+$/; // Apenas letras e espaços
    if (!localidadePattern.test(localidadeInput.value)) {
      localidadeInput.setCustomValidity('A Localidade não pode conter números.');
    } else {
      localidadeInput.setCustomValidity('');
    }
  });


  // Recuperar dados do utilizador autenticado
  const currentUser = JSON.parse(localStorage.getItem('user'));

  if (!currentUser) {
    alert('Nenhum utilizador autenticado! Faça login novamente.');
    window.location.href = 'login.html';
    return;
  }

  // Preencher o formulário com os dados do utilizador
  function loadUserData(user) {
    usernameInput.value = user.name || '';
    emailInput.value = user.email || '';
    localidadeInput.value = user.localidade || '';
    codigoPostalInput.value = user.codigoPostal || '';
    moradaInput.value = user.morada || '';
    if (user.profileImage) {
      profileImage.src = user.profileImage; // Mostrar a imagem guardada
    }
  }

  loadUserData(currentUser);

  profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();

        // Validação final antes de enviar os dados
        if (!codigoPostalInput.checkValidity() || !localidadeInput.checkValidity()) {
          alert('Corrija os campos inválidos antes de guardar.');
          return;
        }
  
    const newPassword = document.getElementById('password').value;
  
    const updatedData = {
      originalEmail: currentUser.email,
      name: usernameInput.value,
      email: emailInput.value,
      localidade: localidadeInput.value,
      codigoPostal: codigoPostalInput.value,
      morada: moradaInput.value,
      ...(newPassword && { password: newPassword }), 
      ...(uploadedImageBase64 && { profileImage: uploadedImageBase64 }),
    };
  
    try {
      const response = await fetch(`${BASE_URL}/update-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
        credentials: 'include',
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao atualizar os dados.');
      }
  
      const result = await response.json();
      localStorage.setItem('user', JSON.stringify(result.user)); // Atualiza o localStorage

      profileMessage.textContent = 'Dados atualizados com sucesso!';
      profileMessage.className = 'success';

      loadUserData(result.user);
    } catch (error) {
      console.error('Erro ao atualizar os dados:', error.message);
      profileMessage.textContent = error.message;
      profileMessage.className = 'error';
    }
  });

  // ------------------- Newsletter -------------------
  const newsletterEmailInput = document.getElementById('newsletter-email');
  const stopNewsletterCheckbox = document.getElementById('stop-emails');
  const saveNewsletterBtn = document.getElementById('save-newsletter-btn');
  const newsletterMessage = document.getElementById('newsletter-message');

  // Função para validar o email
  function isValidEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const invalidDomains = ['fdfdd.com', '1231.pt', 'dsds.pt']; // Lista de domínios inválidos
    const domain = email.split('@')[1]; // Extrai o domínio do email
  
    return emailRegex.test(email) && !invalidDomains.includes(domain);
  }
  
// Preencher campos da Newsletter
function loadNewsletterData(user) {
  newsletterEmailInput.value = user.emailNewsletter || ''; // Preenche o campo com o email da newsletter
  stopNewsletterCheckbox.checked = user.newsletter === 'Cancelado'; // Marca se estiver cancelado
}

loadNewsletterData(currentUser);

  // Preencher campos da Newsletter
  if (currentUser.newsletterEmail) {
    newsletterEmailInput.value = currentUser.newsletterEmail || '';
    stopNewsletterCheckbox.checked = currentUser.newsletter === 'Cancelado';
  }
  
  saveNewsletterBtn?.addEventListener('click', async (e) => {
    e.preventDefault();
    
    const email = newsletterEmailInput.value.trim();

      // Validação do email
  if (!isValidEmail(email) && !stopNewsletterCheckbox.checked) {
    newsletterMessage.textContent = 'Por favor, insira um email válido.';
    newsletterMessage.className = 'error';
    return;
  }
  
    const isCanceled = stopNewsletterCheckbox.checked; // Verifica se a newsletter está cancelada
    const updatedNewsletterData = {
      email: currentUser.email, // Email principal para identificar o utilizadore no backend
      emailNewsletter: newsletterEmailInput.value.trim(), // Atualiza o email da newsletter
      newsletter: isCanceled ? 'Cancelado' : 'Ativa', // Altera o status baseado no checkbox
    };
  
    try {
      const response = await fetch(`${BASE_URL}/update-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedNewsletterData),
        credentials: 'include',
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao atualizar a newsletter.');
      }
  
      const result = await response.json();
      localStorage.setItem('user', JSON.stringify(result.user)); // Atualiza os dados no localStorage
  
      newsletterMessage.textContent = isCanceled
      ? 'Inscrição na newsletter cancelada com sucesso.'
      : 'Email da newsletter atualizado com sucesso.';
    newsletterMessage.className = 'success';

    loadNewsletterData(result.user);
  
    } catch (error) {
      console.error('Erro ao atualizar a newsletter:', error.message);
      alert(error.message);
    }
  });
  // ------------------- Upload da Foto -------------------

    // Evento para carregar a imagem e converter para base64
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          uploadedImageBase64 = reader.result; // Armazena a imagem em base64
          profileImage.src = uploadedImageBase64; // Atualiza a pré-visualização
        };
        reader.readAsDataURL(file);
      }
    });



  uploadBtn?.addEventListener('click', () => fileInput.click());
  fileInput?.addEventListener('change', (e) => {
    alert('Foto carregada: ' + e.target.files[0].name);
  });

  // ------------------- Troca de Abas -------------------
  tabs.forEach((tab) => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();

      tabs.forEach((t) => t.classList.remove('active'));
      contents.forEach((c) => c.classList.remove('active'));

      tab.classList.add('active');
      const target = tab.dataset.tab;
      document.getElementById(target).classList.add('active');
    });
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const profileTitle = document.getElementById('profile-title');
  const logoutBtn = document.getElementById('logout-btn');

  // Recuperar dados do utilizador autenticado
  const currentUser = JSON.parse(localStorage.getItem('user'));

  if (!currentUser) {
    alert('Nenhum utilizador autenticado! Faça login novamente.');
    window.location.href = 'login.html';
    return;
  }

  // Atualiza o título do perfil com o nome do utilizador
  profileTitle.textContent = currentUser.name || 'Perfil';

  // Função de Logout
  logoutBtn?.addEventListener('click', () => {
    localStorage.removeItem('user'); // Remove os dados do utilizador
    window.location.href = 'login.html'; // Redireciona para a página de login
  });
});

//Apagar a conta///

const deleteAccountBtn = document.getElementById('delete-account-btn');

document.addEventListener('DOMContentLoaded', () => {
  // Selecionar o link de apagar conta
  const deleteAccountLink = document.getElementById('delete-account-link');

  if (deleteAccountLink) {
    // Evento para apagar a conta
    deleteAccountLink.addEventListener('click', async (e) => {
      e.preventDefault(); // Evita comportamento padrão do link

      const currentUser = JSON.parse(localStorage.getItem('user'));

      if (!currentUser) {
        alert('Nenhum utilizador autenticado! Faça login novamente.');
        window.location.href = 'login.html';
        return;
      }

      try {
        const response = await fetch(`${BASE_URL}/delete-user`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: currentUser.email }),
          credentials: 'include',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Erro ao apagar a conta.');
        }

        localStorage.removeItem('user'); // Remove os dados do usuário do localStorage
        window.location.href = 'login.html'; // Redireciona para a página de login
      } catch (error) {
        console.error('Erro ao apagar a conta:', error.message);
        alert('Ocorreu um erro ao apagar a conta. Tente novamente mais tarde.');
      }
    });
  }
});
