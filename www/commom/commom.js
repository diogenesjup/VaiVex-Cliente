




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




