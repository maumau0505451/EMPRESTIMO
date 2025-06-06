function getCurrentDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const form = document.getElementById('emprestimo-form');
const historico = document.getElementById('historico');
const funcionariosPermitidos = ['mauricio', 'cirilo', 'silvana', 'luis', 'julio'];
const modal = document.getElementById("modal");
const modalImg = document.getElementById("modalImg");
const modalClose = document.querySelector(".modal .close");

// Corrigindo o modal
modalClose.onclick = function() {
  modal.style.display = "none";
}

modal.onclick = function(event) {
  if (event.target === modal) {
    modal.style.display = "none";
  }
}

let emprestimos = JSON.parse(localStorage.getItem('emprestimos')) || [];

// CORREÇÃO 1: Implementando o botão "Ver Somente Ativos"
document.getElementById('verAntigos').addEventListener('click', () => {
  const confirmView = confirm("Deseja visualizar todos os registros (inclusive devolvidos)?");
  if (confirmView) {
    document.getElementById('verAntigos').style.display = 'none';
    document.getElementById('voltarAtivos').style.display = 'inline-block';
    render(true);
  }
});

// CORREÇÃO 2: Adicionando funcionalidade ao botão "Ver Somente Ativos"
document.getElementById('voltarAtivos').addEventListener('click', () => {
  document.getElementById('verAntigos').style.display = 'inline-block';
  document.getElementById('voltarAtivos').style.display = 'none';
  render(false);
});

// CORREÇÃO 3: Implementando a impressão selecionada
document.getElementById('botaoImprimir').addEventListener('click', () => {
  const selectImpressao = document.getElementById('selecionarImpressao');
  const selectedIndex = selectImpressao.value;
  
  if (selectedIndex === '' || selectedIndex === undefined) {
    alert('Selecione um empréstimo para imprimir');
    return;
  }
  
  const item = emprestimos[selectedIndex];
  if (!item) {
    alert('Empréstimo não encontrado');
    return;
  }
  
  imprimirEmprestimo(item);
});

// CORREÇÃO 4: Função de impressão melhorada
function imprimirEmprestimo(item) {
  const totalDevolvido = item.devolucoes.reduce((sum, d) => sum + Number(d.quantidade), 0);
  const quantidadeRestante = item.quantidade - totalDevolvido;
  
  const printWindow = window.open('', '_blank');
  const printContent = `
    <html>
      <head>
        <title>Empréstimo - ${item.nomeItem}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; }
          .content { margin: 20px 0; }
          .field { margin: 10px 0; }
          .field strong { display: inline-block; width: 200px; }
          .devolucao { margin: 5px 0; padding: 5px; background-color: #f0f0f0; }
          .status { font-weight: bold; color: ${quantidadeRestante > 0 ? 'red' : 'green'}; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Controle de Empréstimos</h1>
          <h2>Detalhes do Empréstimo</h2>
        </div>
        <div class="content">
          <div class="field"><strong>Categoria:</strong> ${item.categoria}</div>
          <div class="field"><strong>Item:</strong> ${item.nomeItem}</div>
          ${item.detalhes ? `<div class="field"><strong>Detalhes:</strong> ${item.detalhes}</div>` : ''}
          <div class="field"><strong>Quantidade Total:</strong> ${item.quantidade}</div>
          <div class="field"><strong>Quem pegou emprestado:</strong> ${item.quemPegou}</div>
          <div class="field"><strong>Quem do teatro emprestou:</strong> ${item.emprestouTeatro}</div>
          <div class="field"><strong>Data de Empréstimo:</strong> ${item.dataRetirada}</div>
          <div class="field"><strong>Quantidade Devolvida:</strong> ${totalDevolvido}</div>
          <div class="field"><strong>Quantidade Restante:</strong> <span class="status">${quantidadeRestante}</span></div>
          
          ${item.devolucoes.length > 0 ? `
            <div class="field">
              <strong>Histórico de Devoluções:</strong><br>
              ${item.devolucoes.map(d => 
                `<div class="devolucao">Devolução de ${d.quantidade} em ${d.data} – Responsável: ${d.devolvidoPor}</div>`
              ).join('')}
            </div>
          ` : ''}
          
          <div class="field">
            <strong>Status:</strong> 
            <span class="status">${quantidadeRestante > 0 ? 'PENDENTE DEVOLUÇÃO' : 'DEVOLVIDO INTEGRALMENTE'}</span>
          </div>
        </div>
      </body>
    </html>
  `;
  
  printWindow.document.write(printContent);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

// CORREÇÃO 5: Função para popular o select de impressão
function popularSelectImpressao() {
  const selectImpressao = document.getElementById('selecionarImpressao');
  selectImpressao.innerHTML = '<option value="">Selecione um empréstimo para imprimir</option>';
  
  emprestimos.forEach((item, index) => {
    const totalDevolvido = item.devolucoes.reduce((sum, d) => sum + Number(d.quantidade), 0);
    const quantidadeRestante = item.quantidade - totalDevolvido;
    const status = quantidadeRestante > 0 ? '(ATIVO)' : '(DEVOLVIDO)';
    
    const option = document.createElement('option');
    option.value = index;
    option.textContent = `${item.nomeItem} - ${item.quemPegou} ${status}`;
    selectImpressao.appendChild(option);
  });
}

function render(mostrarTodos = false) {
  historico.innerHTML = '';
  
  // CORREÇÃO 6: Populando o select sempre que renderizar
  popularSelectImpressao();
  
  emprestimos.forEach((item, index) => {
    const div = document.createElement('div');
    div.classList.add('loan-item');
    
    const totalDevolvido = item.devolucoes.reduce((sum, d) => sum + Number(d.quantidade), 0);
    const quantidadeRestante = item.quantidade - totalDevolvido;
    
    if (!mostrarTodos && quantidadeRestante <= 0) return;
    
    const today = new Date();
    const loanDate = new Date(item.dataRetirada);
    const diffDays = Math.floor((today - loanDate) / (1000 * 60 * 60 * 24));
    
    if (quantidadeRestante > 0) {
      if (diffDays > 30) {
        div.classList.add('alert-overdue');
      } else {
        div.classList.add('alert-pending');
      }
    }
    
    let statusIcon = "";
    if (quantidadeRestante > 0) {
      statusIcon = diffDays > 30 
        ? '<span title="Em atraso" class="status-icon" style="color: red;">&#9888;</span>'
        : '<span title="Pendente devolução" class="status-icon" style="color: goldenrod;">&#9888;</span>';
    } else {
      statusIcon = '<span title="Devolvido" class="status-icon" style="color: green;">&#10003;</span>';
    }
    
    let contentHTML = `<strong>Categoria:</strong> ${item.categoria}<br>`;
    contentHTML += `<strong>Item:</strong> ${item.nomeItem}<br>`;
    if (item.detalhes) {
      contentHTML += `<strong>Detalhes:</strong> ${item.detalhes}<br>`;
    }
    contentHTML += `<strong>Quantidade Total:</strong> ${item.quantidade}<br>`;
    contentHTML += `<strong>Quem pegou emprestado:</strong> ${item.quemPegou}<br>`;
    contentHTML += `<strong>Quem do teatro emprestou:</strong> ${item.emprestouTeatro}<br>`;
    contentHTML += `<strong>Data de Empréstimo:</strong> ${item.dataRetirada}<br>`;
    contentHTML += `<strong>Quantidade Devolvida:</strong> ${totalDevolvido}<br>`;
    contentHTML += `<strong>Quantidade Restante:</strong> ${quantidadeRestante}<br>`;
    
    if (item.devolucoes.length > 0) {
      let devolucoesHTML = '<strong>Histórico de Devoluções:</strong><br>';
      item.devolucoes.forEach((d) => {
        devolucoesHTML += `<div class="devolucao">Devolução de ${d.quantidade} em ${d.data} – <strong>Responsável que pegou de volta:</strong> ${d.devolvidoPor}</div>`;
      });
      contentHTML += devolucoesHTML;
    }
    
    let imageHTML = "";
    if (item.imagem) {
      imageHTML = `<div class="loan-image"><img src="${item.imagem}" alt="Imagem do item"></div>`;
    }
    
    const textContainer = document.createElement('div');
    textContainer.classList.add('loan-content');
    textContainer.innerHTML = contentHTML;
    
    // CORREÇÃO 7: Melhorando o botão de impressão individual
    const imprimirBtn = document.createElement('button');
    imprimirBtn.textContent = 'Imprimir Item';
    imprimirBtn.style.backgroundColor = '#9C27B0';
    imprimirBtn.style.color = 'white';
    imprimirBtn.style.border = 'none';
    imprimirBtn.style.padding = '8px 16px';
    imprimirBtn.style.borderRadius = '4px';
    imprimirBtn.style.cursor = 'pointer';
    imprimirBtn.style.marginTop = '10px';
    imprimirBtn.style.marginRight = '10px';
    imprimirBtn.onclick = () => {
      imprimirEmprestimo(item);
    };
    
    textContainer.appendChild(imprimirBtn);
    
    if (item.imagem) {
      const imgElem = new DOMParser().parseFromString(imageHTML, 'text/html').querySelector('img');
      imgElem.style.cursor = "pointer";
      imgElem.addEventListener('click', () => {
        modalImg.src = item.imagem;
        modal.style.display = "block";
      });
    }
    
    if (quantidadeRestante > 0) {
      const btnContainer = document.createElement('div');
      btnContainer.style.marginTop = '10px';
      
      // CORREÇÃO 8: Melhorando validação da devolução parcial
      const devolverParcialBtn = document.createElement('button');
      devolverParcialBtn.classList.add('devolver-parcial');
      devolverParcialBtn.textContent = 'Devolver Parcial';
      devolverParcialBtn.style.marginRight = '10px';
      devolverParcialBtn.addEventListener('click', () => {
        let qtd = prompt(`Digite a quantidade a devolver (máximo ${quantidadeRestante}):`);
        if (qtd !== null && qtd !== '') {
          qtd = Number(qtd);
          if (isNaN(qtd) || qtd <= 0) {
            alert('Por favor, digite um número válido maior que zero.');
            return;
          }
          if (qtd > quantidadeRestante) {
            alert(`Quantidade inválida. Máximo disponível: ${quantidadeRestante}`);
            return;
          }
          
          let funcionarioRetorno = prompt("Digite o nome do funcionário que pegou de volta (mauricio, cirilo, silvana, luis, julio):");
          if (funcionarioRetorno) {
            funcionarioRetorno = funcionarioRetorno.toLowerCase().trim();
            if (!funcionariosPermitidos.includes(funcionarioRetorno)) {
              alert("Nome inválido. Use: mauricio, cirilo, silvana, luis ou julio");
              return;
            }
            item.devolucoes.push({ 
              data: getCurrentDate(), 
              quantidade: qtd, 
              devolvidoPor: funcionarioRetorno 
            });
            localStorage.setItem('emprestimos', JSON.stringify(emprestimos));
            render(mostrarTodos);
            alert(`Devolução parcial de ${qtd} item(s) registrada com sucesso!`);
          }
        }
      });
      
      btnContainer.appendChild(devolverParcialBtn);
      
      