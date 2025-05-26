const form = document.getElementById('emprestimo-form');
const historico = document.getElementById('historico');

let emprestimos = JSON.parse(localStorage.getItem('emprestimos')) || [];

function render() {
  historico.innerHTML = '';
  emprestimos.forEach((item, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>${item.equipamento}</strong> com ${item.responsavel} de ${item.dataRetirada} até ${item.dataDevolucao}
      <button onclick="remover(${index})">Devolver</button>
    `;
    historico.appendChild(li);
  });
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const equipamento = form.equipamento.value;
  const responsavel = form.responsavel.value;
  const dataRetirada = form.dataRetirada.value;
  const dataDevolucao = form.dataDevolucao.value;

  emprestimos.push({ equipamento, responsavel, dataRetirada, dataDevolucao });
  localStorage.setItem('emprestimos', JSON.stringify(emprestimos));
  render();
  form.reset();
});

function remover(index) {
  emprestimos.splice(index, 1);
  localStorage.setItem('emprestimos', JSON.stringify(emprestimos));
  render();
}

render();
