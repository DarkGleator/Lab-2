import './style.css';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const BASE_URL = window.location.hostname.includes('localhost')
  ? 'http://localhost:3000' // URL local
  : 'https://oasi.onrender.com'; // URL de produção


gsap.registerPlugin(ScrollTrigger);

import Lenis from "@studio-freight/lenis";

const lenis = new Lenis({
  smooth: true,    // Scroll suave
  duration: 1.2,   // Tempo do scroll
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}

requestAnimationFrame(raf);


// Navbar ////////////////////

document.addEventListener('DOMContentLoaded', () => {
  const navbar = document.querySelector('.navbar');
  let lastScrollTop = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;

    if (currentScroll > lastScrollTop) {
      // Rolando para baixo - oculta a navbar
      navbar.classList.add('hidden');
    } else {
      // Rolando para cima - mostra a navbar
      navbar.classList.remove('hidden');
    }

    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll; // Evita valores negativos
  });
});


document.querySelectorAll('.menu a').forEach(link => {
  link.addEventListener('click', function (event) {
    event.preventDefault(); // Impede o comportamento padrão do navegador
    const targetId = this.getAttribute('href').substring(1); // Obtém o ID da seção (sem o #)
    const targetSection = document.getElementById(targetId);

    if (targetSection) {
      // Rola suavemente até a seção desejada
      window.scrollTo({
        top: targetSection.offsetTop - 60, // Ajusta o valor conforme a altura da navbar
        behavior: 'smooth'
      });
    }
  });
});



// 1 SECÇÃO /////////////////////////////////////////


// Função para bloquear e desbloquear o scroll
function lockScroll() {
  document.body.style.overflow = 'hidden'; // Bloqueia o scroll
}

function unlockScroll() {
  document.body.style.overflow = ''; // Libera o scroll
}

// Função para exibir o texto diretamente no elemento
function displayText(element, text, onComplete) {
  element.innerHTML = text; // Define o texto diretamente
  element.style.opacity = 1; // Garante que o texto fique visível
  if (onComplete) {
    onComplete(); // Executa o callback se fornecido
  }
}

// Configuração inicial para o primeiro texto
const firstText = document.getElementById('text1');
firstText.style.opacity = 1; // Torna o primeiro texto visível
const text1 = "Soluções sustentáveis para um futuro mais conectado";

// Bloqueia o scroll assim que a página carrega
lockScroll();

// Exibe o primeiro texto diretamente
displayText(firstText, text1, () => {
  unlockScroll(); // Libera o scroll após a frase ser exibida
  startScrollTrigger(); // Inicia o ScrollTrigger para os textos subsequentes
});

function startScrollTrigger() {
  const text2 = "Serviços Essenciais, Impacto Sustentável";
  const text3 = "A cidade evolui, os serviços também";

  gsap.timeline({
    scrollTrigger: {
      trigger: '.hero-section',
      start: 'top top',  // Começa logo no início da seção
      end: '+=200%',     // Se estende até 200% da altura da seção
      scrub: true,
      pin: true,
      onUpdate: (self) => {
        const progress = self.progress; // Pega o progresso do scroll
        // Movendo o fundo e aplicando uma leve ampliação
        gsap.to('.background-video', {
          y: progress * 10, // Movimenta o fundo suavemente
          scale: 1 + progress * 0.05, // Ampliação sutil do fundo
        });
      },
    }
  })
  .to('#text1', { opacity: 0, duration: 1 }) // Desaparece o primeiro texto
  .fromTo('#text2', 
    { opacity: 0 }, 
    { opacity: 1, duration: 0.5, onStart: () => displayText(document.getElementById('text2'), text2) }
  ) // Aparece o segundo texto
  .to('#text2', { opacity: 0, duration: 1 }) // Desaparece o segundo texto
  .fromTo('#text3', 
    { opacity: 0 }, 
    { opacity: 1, duration: 0.5, onStart: () => displayText(document.getElementById('text3'), text3) }
  ); // Aparece o terceiro texto
}



// Loop Vídeo /// 

document.addEventListener('DOMContentLoaded', () => {
  const video = document.querySelector('.background-video');

  // Verifica a posição atual do vídeo a cada 100ms
  video.addEventListener('timeupdate', () => {
    if (video.currentTime >= 10) {
      video.currentTime = 0; // Volta para o início
      video.play(); // Garante que o vídeo continue reproduzindo
    }
  });
});


// 3D ///////////////////////////////////////////////////////



// Função global para exibir o overlay
function showOverlay(title, description) {
  const overlay = document.createElement("div");
  overlay.classList.add("info-overlay");
  overlay.innerHTML = `
    <div class="info-content">
      <h2>${title}</h2>
      <p>${description}</p>
      <button id="close-overlay">Fechar</button>
    </div>
  `;
  document.body.appendChild(overlay);

  document.getElementById("close-overlay").addEventListener("click", () => {
    document.body.removeChild(overlay);
  });
}


function loadModel(canvasId, modelPath) {
  const canvasElement = document.getElementById(canvasId);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, canvasElement.width / canvasElement.height, 0.1, 1000);
  camera.position.set(0, 0, 4); 

  // Configuração do renderizador
  const renderer = new THREE.WebGLRenderer({ canvas: canvasElement, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight * 0.9); 
  renderer.setClearColor(0x252527); 

  const ambientLight = new THREE.AmbientLight(0xffffff, 1);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 5, 7.5).normalize();
  scene.add(directionalLight);

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const clickableObjects = [];


  // Variáveis para controle do mouse
  let isMouseDown = false;
  let mouseX = 0;
  let mouseY = 0;

  // Limites para rotação
  const minRotationX = -Math.PI / 11; // Permite leve rotação para baixo
  const maxRotationX = Math.PI / 8; // Permite leve rotação para cima

  // Variável para controle do zoom
  const zoomSpeed = 1.0;
  const minZoom = 2;
  const maxZoom = 15;


// Função para criar uma esfera interativa em um objeto
function createInteractiveSphere(object, position, title, description) {
  const sphereGeometry = new THREE.SphereGeometry(0.1, 32, 32);
  const sphereMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.9, // Aparência leve
    emissive:  0xffffff,
    emissiveIntensity: 0.5,
  });

  // Criar a esfera
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  sphere.position.set(...position);
  sphere.userData = { title, description };

  object.add(sphere); 
  clickableObjects.push(sphere); 

  // Função de animação para hover
  function animateSphere(scaleFactor) {
    gsap.to(sphere.scale, {
      x: scaleFactor,
      y: scaleFactor,
      z: scaleFactor,
      duration: duration,
      ease: "power2.inOut",
    });
  }

  return sphere; // Retorna a esfera criada
}

  


  // Carregar o modelo GLB/GLTF
  const loader = new GLTFLoader();
  loader.load(
    modelPath,
    (gltf) => {
      const model = gltf.scene;

      

     
    // Adicionar esferas interativas no modelo
    const celulaEnergia = model.getObjectByName("Celula_de_Energia_0");
    if (celulaEnergia) {
      createInteractiveSphere(celulaEnergia, [1.1, 0.3, 0.6], "Energia Solar", "Através da utilização de painéis solares, a OASI promove a sustentabilidade, gerando energia de forma mais eficiente e amiga do ambiente. ");
    }

    const portas2 = model.getObjectByName("PORTAS_2");
    if (portas2) {
      createInteractiveSphere(portas2, [1.78, 1.6, 2.5], "Sistema de Locky/Cacifos", "Este módulo inclui um sistema Locky altamente seguro.<br> Podes utilizá-lo para receber as tuas entregas de forma prática ou simplesmente guardar os teus pertences com total confiança.");
    }

    const porta21 = model.getObjectByName("PORTA_2_1");
    if (porta21) {
      createInteractiveSphere(porta21, [0, 0.3, 0.6], "Armazém para Bicicletas/Trótinetes", "O módulo OASI dispõe de compartimentos dedicados para bicicletas e trotinetes, garantindo um espaço seguro enquanto tratas das tuas tarefas diárias.");
    }

    const food1 = model.getObjectByName("FOOD_1");
    if (food1) {
      createInteractiveSphere(food1, [0, 0, -1], "Snacks Rápidos", "<b>Estás com fome?</b><br> O módulo OASI está equipado com uma máquina de snacks disponível 24 horas por dia, ideal para petiscar algo a qualquer momento.");
    }




      // Ajuste a escala para que o modelo se encaixe bem no canvas e aumente o tamanho
      const box = new THREE.Box3().setFromObject(model);
      const size = new THREE.Vector3();
      box.getSize(size);
      const maxDimension = Math.max(size.x, size.y, size.z);
      model.scale.setScalar(6 / maxDimension); // Aumenta a escala do modelo

      // Ajuste de posição (caso o modelo esteja fora da visualização)
      model.position.set(0, -1, 0);

      scene.add(model);

      // Função de animação para renderizar o modelo
      function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
      }

      animate(); // Inicia a animação

  // Hover e clique para os objetos clicáveis
  canvasElement.addEventListener("mousemove", (event) => {
    const rect = canvasElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(clickableObjects);

    clickableObjects.forEach((obj) => {
      obj.scale.set(1, 1, 1); // Resetar escala
    });

    if (intersects.length > 0) {
      const sphere = intersects[0].object;
      gsap.to(sphere.scale, { x: 1.5, y: 1.5, z: 1.5, duration: 0.3 });
    }
  });

  canvasElement.addEventListener("click", (event) => {
    const rect = canvasElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(clickableObjects);

    if (intersects.length > 0) {
      const sphere = intersects[0].object;
      showOverlay(sphere.userData.title, sphere.userData.description);
    }
  });


  

 // Eventos do mouse para controlar a rotação do modelo
 canvasElement.addEventListener('mousedown', (event) => {
  isMouseDown = true;
  mouseX = event.clientX;
  mouseY = event.clientY;
});

canvasElement.addEventListener('mouseup', () => {
  isMouseDown = false;
});

canvasElement.addEventListener('mousemove', (event) => {
  if (isMouseDown) {
    const deltaX = event.clientX - mouseX;
    const deltaY = event.clientY - mouseY;

    // Ajuste de rotação do modelo com limites (corrigindo a inversão)
    model.rotation.y += deltaX * 0.005;
    model.rotation.x = Math.max(
      minRotationX,
      Math.min(maxRotationX, model.rotation.x + deltaY * 0.005) // Corrige deltaY para rotação correta
    );

    mouseX = event.clientX;
    mouseY = event.clientY;
  }
});


      // Evento para controle de zoom com scroll do mouse
      canvasElement.addEventListener('wheel', (event) => {
        event.preventDefault();
      });
    })

  // Redimensiona o renderizador junto com a janela
  window.addEventListener('resize', () => {
    // Atualiza o aspecto da câmera e o tamanho do renderizador
    camera.aspect = window.innerWidth / (window.innerHeight * 0.8); // Altura menor para o canvas
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight * 0.8); // Canvas redimensionado com altura reduzida
  });
}



// Carregar o modelo GLB no canvas
loadModel('canvas1', '/models/model1.glb');



// Colunas ///////////////////////////////////////////////////////

document.addEventListener('DOMContentLoaded', () => {
  const columns = document.querySelectorAll('.column'); // Seleciona todas as colunas
  const infoSection = document.querySelector('.info-section'); // Seção 4 onde as colunas estão localizadas
  let currentOpen = null; // Variável para controlar qual coluna está aberta

  window.addEventListener('scroll', () => {
    // Checa se a seção 4 está visível na tela
    const rect = infoSection.getBoundingClientRect();
    const isInView = (rect.top < window.innerHeight * 0.5) && (rect.bottom > window.innerHeight * 0.5);  // A seção 4 deve estar 50% visível

    // Só permite abrir as colunas quando a seção 4 estiver visível na tela
    if (isInView) {
      let scrolledToColumn = false; // Flag para saber se estamos dentro de uma coluna visível

      columns.forEach((column, index) => {
        const columnRect = column.getBoundingClientRect(); // Posição da coluna na tela

        // Checa se a coluna está visível (verifica se pelo menos 50% da altura está visível)
        if (columnRect.top < window.innerHeight * 0.5 && columnRect.bottom > window.innerHeight * 0.5) {
          // Se já existe uma coluna aberta, fecha a anterior antes de abrir a nova
          if (currentOpen !== column) {
            if (currentOpen) {
              currentOpen.classList.remove('open'); // Fecha a coluna anterior
            }
            column.classList.add('open'); // Abre a nova coluna
            currentOpen = column; // Atualiza a coluna aberta
          }
          scrolledToColumn = true; // Marca que encontramos uma coluna visível
        }
      });

      // Se nenhuma coluna for visível, fecha a coluna aberta
      if (!scrolledToColumn && currentOpen) {
        currentOpen.classList.remove('open');
        currentOpen = null;
      }
    } else {
      // Se a seção 4 não está visível suficientemente, fecha qualquer coluna aberta
      if (currentOpen) {
        currentOpen.classList.remove('open');
        currentOpen = null;
      }
    }
  });
});

// Secção 6 - Localização //////////////

document.addEventListener("DOMContentLoaded", () => { 
  const mapOverlay = document.createElement("div");
  mapOverlay.id = "map-overlay";
  mapOverlay.classList.add("hidden");
  mapOverlay.innerHTML = `
    <div class="overlay-content">
      <img id="overlay-map" src="" alt="Mapa da Região">
      <div id="gps-points-container" class="gps-points-container"></div>
      <div id="overlay-locations" class="overlay-locations"></div>
    </div>
  `;
  document.body.appendChild(mapOverlay);

  const overlayMap = document.getElementById("overlay-map");
  const overlayLocations = document.getElementById("overlay-locations");
  const gpsPointsContainer = document.getElementById("gps-points-container");

  const regions = {
    coimbra: {
      image: "/assets/coimbra.png",
      locations: [
        { name: "Praça da República", coords: { top: "50%", left: "20%" }, url: "https://maps.google.com/?q=Praça+da+República+Coimbra" },
        { name: "Centro Comercial Alma", coords: { top: "50%", left: "30%" }, url: "https://maps.google.com/?q=Centro+Comercial+Alma" },
        { name: "Rua Ferreira Borges", coords: { top: "50%", left: "10%" }, url: "https://maps.google.com/?q=Rua+Ferreira+Borges+Coimbra" },
      ]
    },
    lisboa: {
      image: "/assets/lisboa.png",
      locations: [
        { name: "Baixa Chiado", coords: { top: "90%", left: "25%" }, url: "https://maps.google.com/?q=Baixa+Chiado+Lisboa" },
        { name: "Parque das Nações", coords: { top: "75%", left: "35%" }, url: "https://maps.google.com/?q=Parque+das+Nações" },
        { name: "Cais do Sodré", coords: { top: "90%", left: "10%" }, url: "https://maps.google.com/?q=Cais+do+Sodré" },
      ]
    },
    evora: {
      image: "/assets/evora.png",
      locations: [
        { name: "Templo Romano", coords: { top: "60%", left: "50%" }, url: "https://maps.google.com/?q=Templo+Romano+Évora" }
      ]
    },
    porto: {
      image: "/assets/porto.png",
      locations: [
        { name: "Avenida dos Aliados", coords: { top: "60%", left: "40%" }, url: "https://maps.google.com/?q=Avenida+dos+Aliados+Porto" },
        { name: "Casa da Música", coords: { top: "55%", left: "35%" }, url: "https://maps.google.com/?q=Casa+da+Música+Porto" },
      ]
    },
    faro: {
      image: "/assets/faro.png",
      locations: [
        { name: "Marina de Faro", coords: { top: "88%", left: "50%" }, url: "https://maps.google.com/?q=Marina+de+Faro" },
        { name: "Universidade do Algarve", coords: { top: "75%", left: "50%" }, url: "https://maps.google.com/?q=Universidade+do+Algarve" }
      ]
    },
    braganca: {
      image: "/assets/braganca.png",
      locations: [
        { name: "Castelo de Bragança", coords: { top: "45%", left: "55%" },  url: "https://maps.google.com/?q=Castelo+de+Bragança"  },
      ]
    }
  };

  function generateOverlayContent(region) {
    overlayMap.src = region.image;
    gpsPointsContainer.innerHTML = "";
    overlayLocations.innerHTML = "";
  
    const columns = []; // Guarda as referências das colunas

    region.locations.forEach((location) => {
      // Adicionar ponto GPS no overlay
      const gpsPoint = document.createElement("div");
      gpsPoint.classList.add("gps-point-overlay");
      gpsPoint.style.top = location.coords.top;
      gpsPoint.style.left = location.coords.left;
      gpsPoint.title = location.name;
      gpsPointsContainer.appendChild(gpsPoint);
  
      // Adicionar lista de locais abaixo do mapa
      const locationItem = document.createElement("div");
      locationItem.classList.add("location-column");
      locationItem.innerHTML = `<h4>${location.name}</h4>`;
      overlayLocations.appendChild(locationItem);
      locationItem.style.cursor = "pointer";
      locationItem.addEventListener("click", () => {
        window.open(location.url, "_blank"); // Abre o link no Google Maps em nova aba
      });

      columns.push(locationItem);

      // Evento de clique para destacar a coluna
      gpsPoint.addEventListener("click", () => {
        columns.forEach((col) => col.classList.remove("highlight")); // Remove destaque
        locationItem.classList.add("highlight"); // Adiciona destaque à coluna correspondente
      });
    });
  }
  
  // Captura cliques nos pontos de GPS no mapa principal
  document.querySelectorAll(".gps-point").forEach((point) => {
    point.addEventListener("click", () => {
      const regionKey = point.dataset.region;

      if (regions[regionKey]) {
        generateOverlayContent(regions[regionKey]);
        mapOverlay.classList.remove("hidden");
      }
    });
  });

  // Adicionar eventos para as áreas do mapa
  document.querySelectorAll("area").forEach((area) => {
    const regionKey = area.dataset.region;

    area.addEventListener("click", (event) => {
      event.preventDefault();

      if (regions[regionKey]) {
        overlayMap.src = regions[regionKey].image;
        generateLocationColumns(regions[regionKey].locations);
        mapOverlay.classList.remove("hidden");
      }
    });
  });

  // Fechar o overlay ao clicar fora dele
  mapOverlay.addEventListener("click", (event) => {
    if (event.target === mapOverlay) {
      mapOverlay.classList.add("hidden");
    }
  });
});


// Secção 8 - Loja /////////////////////////////////////////





document.addEventListener('DOMContentLoaded', () => {
  const carousel = document.querySelector('.product-carousel');
  const prevButton = document.querySelector('.prev-btn');
  const nextButton = document.querySelector('.next-btn');

  const scrollStep = 270; // Tamanho do scroll por clique
  let scrollAmount = 0;

  // DUPLICAÇÃO DOS ELEMENTOS PARA LOOP
  const items = Array.from(carousel.children);
  const cloneFirst = items.slice(0, 4).map(item => item.cloneNode(true)); // Copia os primeiros 4 itens
  const cloneLast = items.slice(-4).map(item => item.cloneNode(true)); // Copia os últimos 4 itens

  // Adiciona clones ao início e ao final
  cloneLast.forEach(item => carousel.insertBefore(item, carousel.firstChild));
  cloneFirst.forEach(item => carousel.appendChild(item));

  const totalItems = carousel.children.length;
  const visibleItems = 4; // Ajuste de acordo com o design
  const maxScroll = scrollStep * (totalItems - visibleItems);

  // Define o carrossel na posição inicial (após os clones iniciais)
  carousel.style.transform = `translateX(-${scrollStep * 4}px)`;
  scrollAmount = scrollStep * 4;

  // BOTÃO NEXT
  nextButton.addEventListener('click', () => {
    scrollAmount += scrollStep;

    if (scrollAmount >= maxScroll) {
      // Se atingir o final, ajusta instantaneamente para o início (sem transição)
      scrollAmount = scrollStep * 4;
      carousel.style.transition = 'none';
      carousel.style.transform = `translateX(-${scrollAmount}px)`;

      setTimeout(() => {
        carousel.style.transition = 'transform 0.5s ease-in-out';
        scrollAmount += scrollStep;
        carousel.style.transform = `translateX(-${scrollAmount}px)`;
      }, 20);
    } else {
      carousel.style.transform = `translateX(-${scrollAmount}px)`;
    }
  });

  // BOTÃO PREV
  prevButton.addEventListener('click', () => {
    scrollAmount -= scrollStep;

    if (scrollAmount <= 0) {
      // Se atingir o início, ajusta instantaneamente para o final (sem transição)
      scrollAmount = maxScroll - scrollStep * 4;
      carousel.style.transition = 'none';
      carousel.style.transform = `translateX(-${scrollAmount}px)`;

      setTimeout(() => {
        carousel.style.transition = 'transform 0.5s ease-in-out';
        scrollAmount -= scrollStep;
        carousel.style.transform = `translateX(-${scrollAmount}px)`;
      }, 20);
    } else {
      carousel.style.transform = `translateX(-${scrollAmount}px)`;
    }
  });
});




// Secção 9 - Footer /////////////////////////////////////////


document.addEventListener('DOMContentLoaded', () => {
  const newsletterForm = document.getElementById('newsletter-form');
  const newsletterEmailInput = document.getElementById('newsletter-email');
  const newsletterMessage = document.getElementById('newsletter-message');

  newsletterForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = newsletterEmailInput.value.trim();

    if (!email) {
      newsletterMessage.textContent = 'O email é obrigatório.';
      newsletterMessage.className = 'error';
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/newsletter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newsletterEmail: email }),
      });

      const data = await response.json();
      if (response.ok) {
        newsletterMessage.textContent = 'Subscrição realizada com sucesso!';
        newsletterMessage.className = 'success';
      } else {
        newsletterMessage.textContent = data.message || 'Erro ao subscrever!';
        newsletterMessage.className = 'error';
      }
    } catch (error) {
      console.error('Erro ao subscrever na newsletter:', error);
      newsletterMessage.textContent = 'Erro de conexão. Tente novamente mais tarde.';
      newsletterMessage.className = 'error';
    }
  });
});
