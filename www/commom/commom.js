// AUTO COMPLETE ENDEREÇO
// Variáveis globais para o autocomplete
let autoCompleteService = null;
let geocoder = null;
let campoAtual = null;
let enderecoSelecionado = null;
let searchTimeout = null;

// Inicializar serviços do Google Maps quando a API carregar
function initAutoCompleteServices() {
    if (typeof google !== 'undefined' && google.maps) {
        autoCompleteService = new google.maps.places.AutocompleteService();
        geocoder = new google.maps.Geocoder();
    }
}

// Abrir layer de autocomplete
function abrirLayerAutoComplete(campo) {
    campoAtual = campo;
    const layer = document.getElementById('layerAutoCompleteEndereco');
    const input = document.getElementById('layerEnderecoInput');
    const titulo = document.getElementById('layerTitulo');
    
    // Definir título baseado no campo
    if (campo === 'origem') {
        titulo.textContent = 'Defina o endereço de origem';
    } else {
        titulo.textContent = 'Define o endereço de destino';
    }
    
    // Pegar valor atual do campo
    const valorAtual = document.getElementById(`${campo}-input`).value;
    input.value = valorAtual;
    
    // Abrir layer
    layer.classList.add('active');
    
    // Focar no input após animação
    setTimeout(() => {
        input.focus();
        if (valorAtual) {
            buscarEnderecos(valorAtual);
        }
    }, 300);
}

// Fechar layer de autocomplete
function fecharLayerAutoComplete() {
    const layer = document.getElementById('layerAutoCompleteEndereco');
    layer.classList.remove('active');
    
    // Limpar após animação
    setTimeout(() => {
        document.getElementById('layerEnderecoInput').value = '';
        document.getElementById('layerSugestoes').innerHTML = '';
        campoAtual = null;
        enderecoSelecionado = null;
    }, 300);
}

// Confirmar endereço selecionado
function confirmarEnderecoAntiga() {
    const input = document.getElementById('layerEnderecoInput');
    const endereco = enderecoSelecionado || input.value;
    
    if (endereco && campoAtual) {
        // Colocar endereço no campo correspondente
        document.getElementById(`${campoAtual}-input`).value = endereco;
        
        // Fechar layer
        fecharLayerAutoComplete();
    }
}

confirmarEndereco = function() {
    const input = document.getElementById('layerEnderecoInput');
    const endereco = enderecoSelecionado || input.value;
    
    if (endereco && campoAtual) {
        // Verificar se é um destino adicional
        const destinoAdicional = destinosAdicionais.find(d => d.id === campoAtual);
        
        if (destinoAdicional) {
            // Atualizar endereço do destino adicional
            destinoAdicional.endereco = endereco;
            document.getElementById(`${campoAtual}-input`).value = endereco;
        } else {
            // Comportamento original para origem e destino principal
            document.getElementById(`${campoAtual}-input`).value = endereco;
        }
        
        // Fechar layer
        fecharLayerAutoComplete();
    }
};

const confirmarEnderecoOriginal = confirmarEndereco;

// Função para obter todos os endereços (origem, destino principal e paradas)
function obterTodosEnderecos() {
    const enderecos = {
        origem: document.getElementById('origem-input').value,
        destinos: [
            document.getElementById('destino-input').value,
            ...destinosAdicionais.map(d => d.endereco)
        ].filter(e => e) // Remove endereços vazios
    };
    
    return enderecos;
}

// Função para resetar destinos adicionais (útil ao mudar de tela)
function resetarDestinosAdicionais() {
    destinosAdicionais = [];
    destinoIdCounter = 1;
    elementoArrastando = null;
}




// Buscar endereços
function buscarEnderecos(query) {
    if (!query || query.length < 3) {
        document.getElementById('layerSugestoes').innerHTML = '';
        return;
    }
    
    // Mostrar loading
    document.getElementById('layerSugestoes').innerHTML = `
        <div class="layer-auto-complete-endereco-loading">
            Buscando endereços...
        </div>
    `;
    
    // Cancelar busca anterior
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }
    
    // Aguardar um pouco antes de buscar (debounce)
    searchTimeout = setTimeout(() => {
        if (autoCompleteService) {
            const request = {
                input: query,
                componentRestrictions: { country: 'br' },
                language: 'pt-BR'
            };
            
            autoCompleteService.getPlacePredictions(request, (predictions, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
                    mostrarSugestoes(predictions);
                } else {
                    mostrarSemResultados();
                }
            });
        } else {
            // Fallback se Google Maps não estiver disponível
            mostrarSemResultados();
        }
    }, 300);
}

// Mostrar sugestões
function mostrarSugestoes(predictions) {
    const container = document.getElementById('layerSugestoes');
    
    if (predictions.length === 0) {
        mostrarSemResultados();
        return;
    }
    
    const html = predictions.map(prediction => {
        const mainText = prediction.structured_formatting.main_text;
        const secondaryText = prediction.structured_formatting.secondary_text;
        
        return `
            <div class="layer-auto-complete-endereco-suggestion" onclick="selecionarEndereco('${prediction.description.replace(/'/g, "\\'")}')">
                <div class="layer-auto-complete-endereco-suggestion-icon">
                    <svg viewBox="0 0 24 24" fill="none">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
                    </svg>
                </div>
                <div class="layer-auto-complete-endereco-suggestion-content">
                    <p class="layer-auto-complete-endereco-suggestion-title">${mainText}</p>
                    <p class="layer-auto-complete-endereco-suggestion-subtitle">${secondaryText || ''}</p>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = html;
}

// Mostrar mensagem sem resultados
function mostrarSemResultados() {
    document.getElementById('layerSugestoes').innerHTML = `
        <div class="layer-auto-complete-endereco-empty">
            Nenhum endereço encontrado
        </div>
    `;
}

// Selecionar endereço
function selecionarEndereco(endereco) {
    enderecoSelecionado = endereco;
    document.getElementById('layerEnderecoInput').value = endereco;
    confirmarEndereco();
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar serviços quando o documento carregar
    setTimeout(initAutoCompleteServices, 1000);
    
    // Listener para o input de busca
    const inputBusca = document.getElementById('layerEnderecoInput');
    if (inputBusca) {
        inputBusca.addEventListener('input', function(e) {
            buscarEnderecos(e.target.value);
        });
        
        // Confirmar ao pressionar Enter
        inputBusca.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                confirmarEndereco();
            }
        });
    }
});



// Variáveis globais para gerenciar destinos
let destinosAdicionais = [];
let destinoIdCounter = 1;
let elementoArrastando = null;

// Função para adicionar novo destino
function adicionarDestino() {
    const novoDestino = {
        id: `destino-adicional-${destinoIdCounter}`,
        numero: destinosAdicionais.length + 1,
        endereco: ''
    };
    
    destinosAdicionais.push(novoDestino);
    destinoIdCounter++;
    
    renderizarDestinosAdicionais();
}

// Função para remover destino
function removerDestino(id) {
    destinosAdicionais = destinosAdicionais.filter(d => d.id !== id);
    renderizarDestinosAdicionais();
}

// Função para renderizar destinos adicionais
function renderizarDestinosAdicionais() {
    // Verificar se o container existe, se não, criar
    let container = document.querySelector('.auto-complete-solic-destinos-adicionais');
    if (!container) {
        const addButton = document.querySelector('.auto-complete-solic-add-destination');
        if (!addButton) return;
        
        container = document.createElement('div');
        container.className = 'auto-complete-solic-destinos-adicionais';
        addButton.parentNode.insertBefore(container, addButton);
    }
    
    // Limpar container
    container.innerHTML = '';
    
    // Renderizar cada destino
    destinosAdicionais.forEach((destino, index) => {
        const destinoElement = criarElementoDestino(destino, index);
        container.appendChild(destinoElement);
    });
    
    // Adicionar listeners após renderizar
    setTimeout(() => {
        atualizarListenersDestinos();
    }, 100);
}

// Função para criar elemento de destino
function criarElementoDestino(destino, index) {
    const div = document.createElement('div');
    div.className = 'auto-complete-solic-destino-item';
    div.draggable = true;
    div.dataset.destinoId = destino.id;
    
    div.innerHTML = `
        <div class="auto-complete-solic-destino-header">
            <div class="auto-complete-solic-destino-titulo">
                <svg class="auto-complete-solic-destino-drag" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7 10h2v2H7v-2zm0-4h2v2H7V6zm0 8h2v2H7v-2zm4-4h2v2h-2v-2zm0 4h2v2h-2v-2zm0-8h2v2h-2V6zm4 4h2v2h-2v-2zm0 4h2v2h-2v-2zm0-8h2v2h-2V6z"/>
                </svg>
                <span class="auto-complete-solic-destino-numero">${index + 1}</span>
                <span>Parada adicional</span>
            </div>
            <div class="auto-complete-solic-destino-acoes">
                <button class="auto-complete-solic-destino-remover" onclick="removerDestino('${destino.id}')" title="Remover destino">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                </button>
            </div>
        </div>
        <div class="auto-complete-solic-destino-field">
            <svg class="auto-complete-solic-destino-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            <input 
                type="text" 
                class="auto-complete-solic-destino-input" 
                id="${destino.id}-input"
                placeholder="Digite o endereço da parada ${index + 1}"
                value="${destino.endereco}"
                readonly
                autocomplete="off"
            >
        </div>
    `;
    
    return div;
}

// Função para atualizar listeners dos destinos
function atualizarListenersDestinos() {
    // Listeners para arrastar
    document.querySelectorAll('.auto-complete-solic-destino-item').forEach(item => {
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragend', handleDragEnd);
        item.addEventListener('dragover', handleDragOver);
        item.addEventListener('drop', handleDrop);
        item.addEventListener('dragenter', handleDragEnter);
        item.addEventListener('dragleave', handleDragLeave);
    });
    
    // Listeners para campos de input
    document.querySelectorAll('.auto-complete-solic-destino-input').forEach(input => {
        input.addEventListener('click', function() {
            const destinoId = this.id.replace('-input', '');
            abrirLayerAutoCompleteDestino(destinoId);
        });
    });
}

// Funções de arrastar e soltar
function handleDragStart(e) {
    elementoArrastando = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    
    document.querySelectorAll('.auto-complete-solic-destino-item').forEach(item => {
        item.classList.remove('drag-over');
    });
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    
    e.dataTransfer.dropEffect = 'move';
    
    const afterElement = getDragAfterElement(this.parentNode, e.clientY);
    if (afterElement == null) {
        this.parentNode.appendChild(elementoArrastando);
    } else {
        this.parentNode.insertBefore(elementoArrastando, afterElement);
    }
    
    return false;
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    
    // Atualizar ordem no array
    const novosDestinos = [];
    document.querySelectorAll('.auto-complete-solic-destino-item').forEach(item => {
        const destinoId = item.dataset.destinoId;
        const destino = destinosAdicionais.find(d => d.id === destinoId);
        if (destino) {
            novosDestinos.push(destino);
        }
    });
    
    destinosAdicionais = novosDestinos;
    renderizarDestinosAdicionais();
    
    return false;
}

function handleDragEnter(e) {
    this.classList.add('drag-over');
}

function handleDragLeave(e) {
    this.classList.remove('drag-over');
}

// Função auxiliar para determinar posição do drop
function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.auto-complete-solic-destino-item:not(.dragging)')];
    
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}
// Função modificada para abrir autocomplete para destinos adicionais
function abrirLayerAutoCompleteDestino(destinoId) {
    campoAtual = destinoId;
    const layer = document.getElementById('layerAutoCompleteEndereco');
    const input = document.getElementById('layerEnderecoInput');
    const titulo = document.getElementById('layerTitulo');
    
    // Encontrar o destino
    const destino = destinosAdicionais.find(d => d.id === destinoId);
    const index = destinosAdicionais.findIndex(d => d.id === destinoId);
    
    // Definir título
    titulo.textContent = `Parada adicional ${index + 1}`;
    
    // Pegar valor atual
    input.value = destino ? destino.endereco : '';
    
    // Abrir layer
    layer.classList.add('active');
    
    // Focar no input após animação
    setTimeout(() => {
        input.focus();
        if (destino && destino.endereco) {
            buscarEnderecos(destino.endereco);
        }
    }, 300);
}
// FIM AUTO COMPLETE ENDEREÇO




let isFrontCamera = true; // Define a câmera inicial como frontal
let currentStream = null; // Armazena a stream atual da câmera

function ativarCameraOCR() {

    $(".modal-camera").fadeIn(100);
    $(".modal-camera .confirmacao").css("bottom","0");

    iniciarCamera(); // Inicia a câmera com a configuração atual
}

function iniciarCamera() {
    const areaCamera = document.getElementById("areaCamera");

    // Adiciona o elemento de vídeo para exibir o feed da câmera
    const video = document.createElement("video");
    video.setAttribute("autoplay", "true");
    video.style.width = "100%";
    video.style.height = "100%";
    areaCamera.innerHTML = ""; // Limpa qualquer conteúdo anterior
    areaCamera.appendChild(video);

    // Para a stream atual, se existir
    if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
    }

    // Configurações de vídeo com base na câmera selecionada
    const constraints = {
        video: {
            facingMode: isFrontCamera ? "user" : "environment", // Alterna entre frontal e traseira
        },
    };

    // Acessa a câmera do dispositivo
    /*
    navigator.mediaDevices
        .getUserMedia(constraints)
        .then((stream) => {
            currentStream = stream; // Salva a nova stream
            video.srcObject = stream;

            // Inicia o reconhecimento da placa
            processarPlaca(video);
        })
        .catch((error) => {
            console.error("Erro ao acessar a câmera:", error);
            alert("Não foi possível acessar a câmera. Verifique as permissões do dispositivo e se o dispositivo suporta múltiplas câmeras.");
        });
    */
}

function trocarCamera() {
    // Alterna entre câmera frontal e traseira
    isFrontCamera = !isFrontCamera;

    // Reinicia a câmera com a nova configuração
    iniciarCamera();
}

function desligarCamera() {
  const areaCamera = document.getElementById("areaCamera");

  // Para a stream atual, se existir
  if (currentStream) {
      currentStream.getTracks().forEach((track) => track.stop());
      currentStream = null; // Remove a referência à stream
  }

  // Limpa o conteúdo da área de câmera
  areaCamera.innerHTML = "";

  console.log("Câmera desligada e recursos liberados.");

  $(".modal-camera .confirmacao").css("bottom","-300%");
                $(".modal-camera").fadeOut(500);


}



















var controleD;

function abrirModalDetalhes(id, caso, valorChaves, grupo) {

  document.getElementById('modalTitulo').textContent = 'Caso ' + caso;
  
  document.getElementById('modalValorChaves').textContent = valorChaves;

  const btnLeiaMais = document.querySelector(`#anuncio${id} .btn-leia-mais`);
  const textoCompleto = btnLeiaMais.querySelector('.texto-completo').innerHTML;

  document.getElementById('modalTextoCompleto').textContent = textoCompleto;
  
  // Configurar o botão "COMPRAR" no modal
  document.getElementById('modalBtnComprar').onclick = function() {
    app.desbloqAnuncio(id, valorChaves, grupo);
    document.getElementById('modalDetalhesAnuncio').style.display = 'none';
  };
  
  // Exibir o modal
  document.getElementById('modalDetalhesAnuncio').style.display = 'block';
  
  // Fechar o modal ao clicar fora dele
  window.onclick = function(event) {
    const modal = document.getElementById('modalDetalhesAnuncio');
    if (event.target == modal) {
      modal.style.display = 'none';
    }
  }
}


function copiarDetalheCaso() {
  // Obtém o elemento
  const divDetalhes = document.getElementById('detalhe_caso');
  
  // Cria um elemento temporário para obter o texto sem formatação HTML
  const temp = document.createElement('div');
  temp.innerHTML = divDetalhes.innerHTML;
  
  // Extrai apenas o texto, removendo as tags HTML
  const textoParaCopiar = temp.innerText || temp.textContent;
  
  // Método 1: usando document.execCommand (compatibilidade maior)
  try {
    // Cria um elemento input temporário
    const tempInput = document.createElement('textarea');
    tempInput.value = textoParaCopiar;
    
    // Adiciona o elemento ao corpo do documento
    document.body.appendChild(tempInput);
    
    // Seleciona o texto
    tempInput.select();
    tempInput.setSelectionRange(0, 99999); // Para dispositivos móveis
    
    // Executa o comando de cópia
    document.execCommand('copy');
    
    // Remove o elemento temporário
    document.body.removeChild(tempInput);
    
    // Feedback opcional (pode ser removido se quiser uma função 100% silenciosa)
    alert('Conteúdo copiado para a área de transferência!');
    
    return true;
  } 
  catch (err) {
    // Método 2: usando a API Clipboard (navegadores modernos)
    try {
      navigator.clipboard.writeText(textoParaCopiar).then(() => {
        // Feedback opcional
        alert('Conteúdo copiado para a área de transferência!');
      });
      return true;
    } 
    catch (err2) {
      console.error('Não foi possível copiar o texto: ', err2);
      return false;
    }
  }
}



function filtroCasos() {
  // Obter o valor digitado na caixa de busca e converter para maiúsculas
  var input = document.getElementById("filtroTabela");
  var filtro = input.value.toUpperCase();
  
  // Obter o container de orçamentos
  var container = document.getElementById("listaDeOrcamentos");
  
  // Obter todas as divs de orçamentos (caixas de serviço)
  var divsCasos = container.getElementsByClassName("caixa-destaque-servicos");
  
  // Contador para verificar se algum resultado foi encontrado
  var resultadosEncontrados = 0;
  
  // Loop por todas as divs de casos
  for (var i = 0; i < divsCasos.length; i++) {
      // Obter o valor do atributo data-meu-caso
      var numeroCaso = divsCasos[i].getAttribute("data-meu-caso");
      
      // Se o número do caso contém o texto filtrado, mostrar o elemento, caso contrário, ocultar
      if (numeroCaso && numeroCaso.toUpperCase().indexOf(filtro) > -1) {
          divsCasos[i].style.display = "";
          resultadosEncontrados++;
      } else {
          divsCasos[i].style.display = "none";
      }
  }
  
  // Verificar se não foram encontrados resultados
  if (resultadosEncontrados === 0 && filtro !== "") {
      // Se não existir a mensagem de "Nenhum resultado encontrado", criar uma
      var msgNenhumResultado = document.getElementById("msgNenhumResultado");
      
      if (!msgNenhumResultado) {
          msgNenhumResultado = document.createElement("div");
          msgNenhumResultado.id = "msgNenhumResultado";
          msgNenhumResultado.className = "nenhum-resultado";
          msgNenhumResultado.innerHTML = `
              <p style="text-align:center; margin-top: 20px;">
                  <i class="fa fa-search" style="font-size: 30px; color: #ccc;"></i>
              </p>
              <p style="text-align:center; color:#747474; font-size:14px;">
                  Nenhum caso encontrado com este número.
              </p>
          `;
          container.appendChild(msgNenhumResultado);
      } else {
          msgNenhumResultado.style.display = "block";
      }
  } else {
      // Se existirem resultados, ocultar a mensagem de "Nenhum resultado encontrado"
      var msgNenhumResultado = document.getElementById("msgNenhumResultado");
      if (msgNenhumResultado) {
          msgNenhumResultado.style.display = "none";
      }
  }
}





// Função para filtrar as categorias
function filtrarCategorias() {

   // Pegando os valores de categoria1 e categoria2 da localStorage
let categoria1 = localStorage.getItem('categoria1'); // Supondo que os valores estão salvos como string na localStorage
let categoria2 = localStorage.getItem('categoria2');


    let isChecked = document.getElementById('toggleSwitch').checked;

    // Seleciona todas as divs .caixa-destaque-servicos
    let divs = document.querySelectorAll('.caixa-destaque-servicos');

    // Se o switch estiver ativado
    if (isChecked) {
        divs.forEach(function(div) {
            let categoria = div.getAttribute('data-categoria');

            // Verifica se a categoria da div é igual a categoria1 ou categoria2
            if (categoria === categoria1 || categoria === categoria2) {
                div.style.display = 'block'; // Exibe a div
            } else {
                div.style.display = 'none'; // Oculta a div
            }
        });
    } else {
        // Se o switch estiver desativado, todas as divs ficam visíveis
        divs.forEach(function(div) {
            div.style.display = 'block'; // Exibe todas as divs
        });
    }
}

// Adiciona o evento ao switch para detectar quando ele for ativado/desativado
//document.getElementById('toggleSwitch').addEventListener('change', filtrarCategorias);









            // COMO FAZER A CHAMADA NO FORMULÁRIO onSubmit="return ajaxSubmit(this);"
            var ajaxSubmit = function(form) {
                // fetch where we want to submit the form to
                var url = $(form).attr('action');
                var flag = 9;

                var data = $(form).serializeArray();

                // setup the ajax request
                $.ajax({
                    url: url,
                    data: data,
                    dataType: 'json',
                    type:'POST'
                });

                swal("Obrigado!", 'Sua mensagem foi enviada com sucesso', "success");

                return false;
            }


            

          // SE O USUÁRIO FIZER UM GESTURE PARA A PARTE INFERIOR DA PÁGINA
          // VAMOS FECHAR A LAYER DO CARRO, CASO ELA ESTEJA ABERTA

          $("#swipeAviso").swipe({
            swipe:function(event, direction, distance, duration, fingerCount) {

              if(direction=="down"){

                $(".modal-avisos .aviso").css("bottom","-300%");
                $(".modal-avisos").fadeOut(500);

              }

            }
          });
          
          $("#swipemeConfirmacao").swipe({
            swipe:function(event, direction, distance, duration, fingerCount) {

              if(direction=="down"){

                $(".modal-confirmacao .confirmacao").css("bottom","-300%");
                $(".modal-confirmacao").fadeOut(500);

              }

            }
          });



            /* FUNÇÃO GERAL PARA EXIBIR OS AVISOS DO PÁGINA */
            function aviso(titulo,mensagem){

              console.log("%c COMEÇANDO FUNÇÃO PARA EXIBIR AVISO","background:#ff0000;color:#fff;");
              $(".modal-avisos").fadeIn(100);

              $(".modal-avisos .aviso").css("bottom","0");


              // ALIMENTAR O HTML
              $(".modal-avisos .aviso h3").html(titulo);
              $(".modal-avisos .aviso p").html(mensagem+'<p style="padding-top:12px;padding-left:0px;"><button type="button" onclick="fecharAviso();" class="btn btn-primary">Ok</button></p>');
              
              //setTimeout("fecharAviso()",12000);


            }
            function fecharAviso(){
              
              $(".modal-avisos .aviso").css("bottom","-300%");
              $(".modal-avisos").fadeOut(500);

            }

            /* FUNÇÃO GERAL PARA EXIBIR CONFIRMAÇÕES DE AÇÕES */
            function confirmacao(titulo,mensagem,funcaoConfirmacao,textoConfirmacao){

              console.log("%c COMEÇANDO FUNÇÃO PARA EXIBIR AVISO","background:#ff0000;color:#fff;");
              $(".modal-confirmacao").fadeIn(100);

              $(".modal-confirmacao .confirmacao").css("bottom","0");

              // ALIMENTAR O HTML
              $(".confirmacao h3").html(titulo);
              $(".confirmacao p").html(mensagem);

              $(".confirmacao #acaoConfirmacao").attr("onclick",funcaoConfirmacao+"; fecharConfirmacao();");
              if(textoConfirmacao!=""){
                $(".confirmacao #acaoConfirmacao").html(textoConfirmacao);
              }
              

            }
            function fecharConfirmacao(){

                 $(".modal-confirmacao .confirmacao").css("bottom","-300%");
                 $(".modal-confirmacao").fadeOut(500);

            }







// FORMULARIO FLUTUANTE onclick="ativarFormularioFlutuante('','')"
function ativarFormularioFlutuante(campoParaPreenchimento,labelPreenchimento){

   $(".input-flutuante-acessibilidade").fadeIn(500);
   //$(".barra-navegacao").hide(0);

   $("#fieldInputFlutuante").val($(campoParaPreenchimento).val());

   localStorage.setItem("campoParaPreenchimento",campoParaPreenchimento);

   $("#fieldInputFlutuante").focus();
   $('.input-flutuante-acessibilidade label').html(labelPreenchimento);

}

function validarFormularioFlutuante(event){

    event.preventDefault();

    var fieldInputFlutuante = $("#fieldInputFlutuante").val();
    
    $(".input-flutuante-acessibilidade").fadeOut(500);
    //$(".barra-navegacao").show(0);

    $(localStorage.getItem("campoParaPreenchimento")).val(fieldInputFlutuante);

}

// GARANTIR O FECHAMENTO DO CAMPO QUANDO A TELA VOLTAR AO NORMAL

$(document).ready(function() {
  var _originalSize = $(window).width() + $(window).height()
  $(window).resize(function() {
    if ($(window).width() + $(window).height() == _originalSize) {
      console.log("keyboard active "+_originalSize);
      $(".input-flutuante-acessibilidade").fadeOut(500);
      //$(".barra-navegacao").show(0);
    }
  });
});

// ABRIR URL`s EXTERNAS`
function abrirUrl(url){

  cordova.InAppBrowser.open(url, '_blank', 'location=yes,hidden=no,hardwareback=no');

}




     // CODIGOS PARA UPLOAD DE ARQUIVOS LOCAIS
     function uploadLocal(){

         console.log("ENTRAMOS!");
         //var files = $(this)[0].files;
         
         /* Efetua o Upload */
         $('.fileForm').ajaxForm({
          dataType:  'json',
          success:   processJson 
        
         }).submit();

     }
     function processJson(dados) { 
            // 'data' is the json object returned from the server 
            console.log("%c RETORNO SOBRE O ENVIO DAS IMAGENS (UPLOAD):","background:#ff0000;color:#fff;");
            console.log(dados); 
            
            if(dados.erros===null){
            
                console.log("NENHUM ERRO!");

            }else{
              
              $(".retorno-upload").html('<div class="alert alert-danger">'+dados.erros+'</div>');              

            }

            $('.fileForm').resetForm();

        }
      // CODIGOS PARA UPLOAD DE ARQUIVOS LOCAIS



      // UPLOAD DE IMAGENS USANDO CAMERA ANDROID
      /* ######### FUNÇÕES USO DE CAMERA SELFIE #########  */
      var minhaImagem;
      var controleFotoEnviada = 1;
      var tipoArquivo = "nenhum";

      function initCameraSelfie(){ // CHAMAR ESSA FUNCAO PARA INICIALIZAR A CAMERA

               minhaImagem;
               controleFotoEnviada = 1;
               
               tipoArquivo = "camera";

               console.log("INICIANDO FUNÇÃO PARA INICIALIZAR A CAMERA SELFE");

              // SCRIPTS DA CAMERA                                 

                              controleFotoEnviada = 2;
                              console.log("CONTROLE FOTO ENVIADA ATUALIZADA");
                              
                              console.log("INICIALIZANDO A CAMERA");
                              $("#retornoMsgSelfie").html("inicializando a câmera para a selfie");
                              navigator.camera.getPicture(onSuccess2, onFail2, {
                                  quality: 50,
                                  destinationType: Camera.DestinationType.DATA_URL
                              });

                              function onSuccess2(imageData) {
                                  console.log("CAMERA INICIALIZADA COM SUCESSO");
                                  $("#retornoMsgSelfie").html("Imagem capturada com sucesso!");
                                  var image = document.getElementById('fotoDestinoSelfie');
                                  image.style.display = 'block';
                                  image.src = "data:image/jpeg;base64," + imageData;

                                  minhaImagem = imageData;

                                  //$(".perfil-banner .foto-perfil").css("background","url('data:image/jpeg;base64,"+imageData+"')");
                                  //$(".perfil-banner .foto-perfil").css("background-size","cover");
                                  //$(".perfil-banner .foto-perfil").css("background-position","center center");
                                  //localStorage.setItem("parametroFoto",1);

                                  $('.btn-action-foto').attr('onclick',"uploadMyImageSelfie()");

                              }

                              function onFail2(message) {
                                  console.log("CAMERA NÃO FUNCIONOU");
                                  $("#retornoMsgSelfie").html("Não possível obter a imagem da sua câmera, tente novamente. "+message);
                                  console.log('### MOTIVO FALHA DE ACESSO A CÂMERA: ' + message);
                              }                           

              document.addEventListener("deviceready", function () {  
              //alert("Phonegap");                                                                                        
              }, false); 

      }

      function uploadMyImageSelfie(){

                    console.log("INICIANDO FUNÇÃO PARA FAZER UPLOAD DA IMAGEM");
         
                                          if(controleFotoEnviada == 2){

                                                  $('.btn-action-foto').html("processando...");

                                                  var cadastroEmail = localStorage.getItem("idUsuario");
                                                  
                                                  $.ajax({
                                                    type: "POST",
                                                    url: app.urlApi+'upload-selfie-camera.php?idUsuario='+idUsuario,
                                                    data: { img_data:minhaImagem},
                                                    cache: false,
                                                    contentType: "application/x-www-form-urlencoded",
                                                    success: function (result) {
                                                      
                                                      $('#sendFileSelfie').html("ATUALIZAR IMAGEM");      
                                                      aviso("Foto de perfil atualizada com sucesso","Obrigado por manter o seu perfil atualizado!");
                                                      editarPerfil(); 

                                                      minhaImagem = "";
                                                      controleFotoEnviada = 1;
                                                      tipoArquivo = "nenhum";                                        

                                                    },
                                                    fail: function(result){
                                                      aviso("Oops! Algo deu errado, tente novamente",result);
                                                    }
                                                  });   

                                              }else{

                                                  aviso('Oops! Você não selecionou nenhuma imagem','Você não selecionou ou tirou nenhuma foto.');
                                                  $('.btn-action-foto').html("ATUALIZAR IMAGEM");

                                              }

}



function copiarCodigoPix(){

  // Cria um elemento textarea temporário
  var textArea = document.createElement("textarea");
            
  // Define o valor do textarea para o conteúdo do span
  textArea.value = document.querySelector('#codigoPix').value;
  
  // Adiciona o textarea ao DOM
  document.body.appendChild(textArea);
  
  // Seleciona o conteúdo do textarea
  textArea.select();
  
  // Copia o texto selecionado para a área de transferência
  document.execCommand('copy');
  
  // Remove o textarea do DOM
  document.body.removeChild(textArea);
  
  // (Opcional) Mostra uma mensagem para o usuário
  alert('Código copiado com sucesso!');

}


// UPLOAD DE IMAGEM DE PERFIL
function previewImagem(){

        // Correção: Use [0] para acessar o elemento DOM e obter o arquivo
        const file = jQuery("#foto_destaque")[0].files[0];
          
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                //preview.src = e.target.result; // Mostrar preview
                jQuery("#previewContainerId").html(`
                                                      <div 
                                                         class="foto-de-perfil-atual" id="previewFinal"
                                                         style="background:url('assets/images/default916955d994a3b0c76e1ea87bd0d124a7.jpg') no-repeat center center;background-size:cover;"
                                                      >
                                                         &nbsp;
                                                      </div>  
                  
                `);
                jQuery("#previewContainerId #previewFinal").css(`background`,`url('${e.target.result}') #f2f2f2 no-repeat`);
                jQuery("#previewContainerId #previewFinal").css(`background-size`,`cover`);
                jQuery("#previewContainerId #previewFinal").css(`background-position`,`center center`);
                jQuery("#previewContainerId").append(`
          
                  <p style="font-size:12px;text-align:center;">
                    Preview da imagem que será enviada
                  </p>
      
              `);
              
            }
            reader.readAsDataURL(file); // Converte a imagem para base64 para pré-visualização
        } else {
            //preview.src = ''; // Caso não haja imagem
        }

        

        const previewContainer = document.getElementById("previewContainerId");
        //const preview = document.createElement('img');
        //preview.style.maxWidth = '200px';
        //preview.style.marginTop = '10px';
        //previewContainer.appendChild(preview);

}




