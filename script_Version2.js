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

modalClose.onclick = function() {
  modal.style.display = "none";
}
modal.onclick = function(event) {
  if (event.target === modal) {
    modal.style.display = "none";
  }
}

let emprestimos = JSON.parse(localStorage.getItem('emprestimos')) || [];

function render() {
  historico.innerHTML = '';
  emprestimos.forEach((item, index) => {
    const div = document.createElement('div');
    div.classList.add('loan-item');
    
    const totalDevolvido = item.devolucoes.reduce((sum, d) => sum + Number(d.quantidade), 0);
    const quantidadeRestante = item.quantidade - totalDevolvido;
    
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
    
    const textContainerHTML = `<div class="loan-content">${contentHTML}</div>`;
    
    div.innerHTML =
      '<div class="status-container">' + statusIcon + "</div>" +
      '<div class="loan-details">' + imageHTML + textContainerHTML + "</div>";
    
    if (item.imagem) {
      const imgElem = div.querySelector('.loan-image img');
      imgElem.style.cursor = "pointer";
      imgElem.addEventListener('click', () => {
        modalImg.src = item.imagem;
        modal.style.display = "block";
      });
    }
    
    if (quantidadeRestante > 0) {
      const btnContainer = document.createElement('div');
      
      const devolverParcialBtn = document.createElement('button');
      devolverParcialBtn.classList.add('devolver-parcial');
      devolverParcialBtn.textContent = 'Devolver Parcial';
      devolverParcialBtn.addEventListener('click', () => {
        let qtd = prompt(`Digite a quantidade a devolver (máximo ${quantidadeRestante}):`);
        if (qtd !== null) {
          qtd = Number(qtd);
          if (qtd > 0 && qtd <= quantidadeRestante) {
            let funcionarioRetorno = prompt("Digite o nome do funcionário que pegou de volta (mauricio, cirilo, silvana, luis, julio):");
            if (funcionarioRetorno) {
              funcionarioRetorno = funcionarioRetorno.toLowerCase().trim();
              if (funcionariosPermitidos.indexOf(funcionarioRetorno) === -1) {
                alert("Nome inválido. Utilize um dos nomes: mauricio, cirilo, silvana, luis, julio.");
                return;
              }
              item.devolucoes.push({
                data: getCurrentDate(),
                quantidade: qtd,
                devolvidoPor: funcionarioRetorno
              });
              localStorage.setItem('emprestimos', JSON.stringify(emprestimos));
              render();
            }
          } else {
            alert('Quantidade inválida.');
          }
        }
      });
      btnContainer.appendChild(devolverParcialBtn);
      
      const devolverTudoBtn = document.createElement('button');
      devolverTudoBtn.classList.add('devolver-tudo');
      devolverTudoBtn.textContent = 'Devolver Tudo';
      devolverTudoBtn.addEventListener('click', () => {
        if (confirm(`Confirma a devolução de todos os ${quantidadeRestante} itens pendentes?`)) {
          let funcionarioRetorno = prompt("Digite o nome do funcionário que pegou de volta (mauricio, cirilo, silvana, luis, julio):");
          if (funcionarioRetorno) {
            funcionarioRetorno = funcionarioRetorno.toLowerCase().trim();
            if (funcionariosPermitidos.indexOf(funcionarioRetorno) === -1) {
              alert("Nome inválido. Utilize um dos nomes: mauricio, cirilo, silvana, luis, julio.");
              return;
            }
            item.devolucoes.push({
              data: getCurrentDate(),
              quantidade: quantidadeRestante,
              devolvidoPor: funcionarioRetorno
            });
            localStorage.setItem('emprestimos', JSON.stringify(emprestimos));
            render();
          }
        }
      });
      btnContainer.appendChild(devolverTudoBtn);
      div.querySelector('.loan-content').appendChild(btnContainer);
    } else {
      div.querySelector('.loan-content').innerHTML += `<br><strong>Status:</strong> Devolvido Integralmente`;
    }

    // botão excluir empréstimo
    const excluirBtn = document.createElement('button');
    excluirBtn.classList.add('excluir');
    excluirBtn.textContent = 'Excluir Registro';
    excluirBtn.addEventListener('click', () => {
      if (confirm('Tem certeza que deseja excluir este registro?')) {
        emprestimos.splice(index, 1);
        localStorage.setItem('emprestimos', JSON.stringify(emprestimos));
        render();
      }
    });
    div.querySelector('.loan-content').appendChild(excluirBtn);

    historico.appendChild(div);
  });

  if (emprestimos.length === 0) {
    historico.innerHTML = "<em>Nenhum empréstimo registrado.</em>";
  }
}

form.addEventListener('submit', function(e) {
  e.preventDefault();
  const categoria = document.getElementById('categoria').value;
  const nomeItem = document.getElementById('nomeItem').value.trim();
  const detalhes = document.getElementById('detalhes').value.trim();
  const quantidade = Number(document.getElementById('quantidade').value);
  const quemPegou = document.getElementById('quemPegou').value.trim();
  const emprestouTeatro = document.getElementById('emprestouTeatro').value;
  const imagemInput = document.getElementById('imagem');
  let imagem = '';

  if (!funcionariosPermitidos.includes(emprestouTeatro)) {
    alert("Funcionário do teatro inválido.");
    return;
  }

  function addEmprestimo(imgBase64) {
    const novoEmprestimo = {
      categoria,
      nomeItem,
      detalhes,
      quantidade,
      quemPegou,
      emprestouTeatro,
      imagem: imgBase64 || '',
      dataRetirada: getCurrentDate(),
      devolucoes: []
    };
    emprestimos.push(novoEmprestimo);
    localStorage.setItem('emprestimos', JSON.stringify(emprestimos));
    render();
    form.reset();
  }

  if (imagemInput.files && imagemInput.files[0]) {
    const reader = new FileReader();
    reader.onload = function(evt) {
      addEmprestimo(evt.target.result);
    };
    reader.readAsDataURL(imagemInput.files[0]);
  } else {
    addEmprestimo('');
  }
});

// Exportar para JSON
document.getElementById('exportar').onclick = function() {
  const data = JSON.stringify(emprestimos, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'emprestimos.json';
  a.click();
  URL.revokeObjectURL(url);
};

// Importar de JSON
const importarBtn = document.getElementById('importarBtn');
const importarInput = document.getElementById('importarInput');

importarBtn.onclick = () => importarInput.click();

importarInput.onchange = function(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (Array.isArray(imported)) {
        emprestimos = imported;
        localStorage.setItem('emprestimos', JSON.stringify(emprestimos));
        render();
        alert('Registros importados com sucesso!');
      } else {
        alert('Arquivo inválido.');
      }
    } catch {
      alert('Arquivo inválido.');
    }
  };
  reader.readAsText(file);
};

render();