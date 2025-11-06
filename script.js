let jogadores = [];
let poderes = [
    {
        id: 1,
        nome: "Demissão",
        descricao: "O usuário do poder se demite, trocando todas as cartas da mão."
    },
    {
        id: 2,
        nome: "Demitir",
        descricao: "Um jogador alvo deve descartar a sua mão e recomprá-la. Contudo, compra uma carta a menos."
    },
    {
        id: 3,
        nome: "Renda Fixa",
        descricao: "O usuário do poder faz uma aplicação de renda fixa. Ganha R$ 100,00 de patrimônio por rodada."
    },
    {
        id: 4,
        nome: "Esquema de Pirâmide",
        descricao: "O usuário escolhe um alvo para rodar um dado. Se o resultado for de 1 a 4, o alvo perde patrimônio, e o utilizador do poder ganha metade do patrimônio perdido. Se for 5 ou 6, o alvo ganha patrimônio, e o usuário do poder perde patrimônio equivalente. A quantidade de patrimônio que será ganha/perdida é definida pela rolagem de um dado. (1 equivale a 100 reais, 2 equivale a 200 reais...)"
    },
    {
        id: 5,
        nome: "Processo Judicial",
        descricao: "O usuário pode anular uma carta poder utilizada por outro jogador."
    }
];

const modaisParaFechar = [
    'modalRegras',
    'modalPlacar',
    'modalPoderes',
    'modalCatalogoPoderes'
];

let jogoIniciado = false;
let jogadorAtualId = null;

function iniciarPlacar() {
    const numJogadores = parseInt(document.getElementById('numJogadores').value);
    jogadores = [];

    for (let i = 1; i <= numJogadores; i++) {
        jogadores.push({
            id: i,
            nome: `Jogador ${i}`,
            pontos: 1000,
            poderes: []
        });
    }

    jogoIniciado = true;
    document.getElementById('configInicial').style.display = 'none';
    document.getElementById('placarContainer').style.display = 'block';
    atualizarPlacar();

    // Salva no localStorage
    localStorage.setItem('jogoDados', JSON.stringify({
        jogadores: jogadores,
        jogoIniciado: true
    }));
}

function atualizarPlacar() {
    const container = document.getElementById('jogadoresContainer');
    container.innerHTML = '';

    jogadores.forEach(jogador => {
        const jogadorDiv = document.createElement('div');
        jogadorDiv.className = 'jogador-item';
        jogadorDiv.innerHTML = `
    <div class="nome-jogador">
        <span id="nome-jogador-${jogador.id}">${jogador.nome}</span>
        <button class="btn-renomear" onclick="habilitarRenomear(${jogador.id})">✏️</button>
    </div>
    <div class="pontos-controle">
        <button onclick="alterarPontos(${jogador.id}, -50)">-</button>
        <span>${jogador.pontos}</span>
        <button onclick="alterarPontos(${jogador.id}, 50)">+</button>
        <button class="btn-poder" onclick="mostrarPoderes(${jogador.id})">P</button>
    </div>
`;
        container.appendChild(jogadorDiv);
    });
}

function habilitarRenomear(jogadorId) {
    const jogador = jogadores.find(j => j.id === jogadorId);
    const elementoNome = document.getElementById(`nome-jogador-${jogadorId}`);
    
    // Cria um input temporário
    const input = document.createElement('input');
    input.type = 'text';
    input.value = jogador.nome;
    input.className = 'input-renomear';
    
    // Substitui o span pelo input
    elementoNome.replaceWith(input);
    input.focus();
    
    // Configura o evento ao pressionar Enter
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            finalizarRenomear(jogadorId, input.value);
        }
    });
    
    // Configura o evento ao perder foco
    input.addEventListener('blur', function() {
        finalizarRenomear(jogadorId, input.value);
    });
}

function finalizarRenomear(jogadorId, novoNome) {
    const jogador = jogadores.find(j => j.id === jogadorId);
    
    // Validação
    novoNome = novoNome.trim();
    
    if (!jogador || !novoNome) {
        mostrarNotificacao("Nome não pode estar vazio!", "erro");
        atualizarPlacar(); // Restaura o nome original
        return;
    }
    
    if (novoNome.length > 20) {
        mostrarNotificacao("Máximo de 20 caracteres!", "erro");
        document.querySelector(`#nome-jogador-${jogadorId}`).style.color = "red";
        setTimeout(() => {
            if (document.querySelector(`#nome-jogador-${jogadorId}`)) {
                document.querySelector(`#nome-jogador-${jogadorId}`).style.color = "";
            }
        }, 1000);
        return;
    }
    
    // Atualiza o nome
    jogador.nome = novoNome;
    
    // Salva e atualiza
    localStorage.setItem('jogoDados', JSON.stringify({
        jogadores: jogadores,
        jogoIniciado: true
    }));
    
    mostrarNotificacao(`Nome alterado para: ${novoNome}`, "sucesso");
    atualizarPlacar();
}

function alterarPontos(id, valor) {
    const jogador = jogadores.find(j => j.id === id);
    if (jogador) {
        jogador.pontos += valor;
        if (jogador.pontos < 0) jogador.pontos = 0;
        atualizarPlacar();

        // Salva alterações
        localStorage.setItem('jogoDados', JSON.stringify({
            jogadores: jogadores,
            jogoIniciado: true
        }));
    }
}

function resetarJogo() {
    if (confirm("Tem certeza que deseja resetar TODOS os dados do jogo?")) {
        localStorage.removeItem('jogoDados');
        jogoIniciado = false;
        jogadores = [];

        // Reinicia as frases
        frasesDisponiveis = [...frases];
        problemasFinanceirosDisponiveis = [...problemasFinanceiros];
        
        // Limpa o elemento de frases
        const elemento = document.getElementById('problema');
        elemento.innerHTML = '';
        elemento.classList.remove('esgotado');

        // Fecha todos os modais
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });

        // Reabre o placar para nova configuração
        setTimeout(() => {
            document.getElementById('modalPlacar').style.display = 'flex';
            document.getElementById('configInicial').style.display = 'block';
            document.getElementById('placarContainer').style.display = 'none';
        }, 300);
    }
}

function mostrarPoderes(jogadorId) {
    jogadorAtualId = jogadorId;
    document.getElementById('modalPlacar').style.display = 'none';
    document.getElementById('modalPoderes').style.display = 'flex';

    const container = document.getElementById('poderesContainer');
    container.innerHTML = `
        <h3>${jogadores.find(j => j.id === jogadorId).nome}</h3>
        <button class="btn-catalogo" onclick="abrirCatalogoPoderes()">
            Ver Todos os Poderes
        </button>
    `;

    const jogador = jogadores.find(j => j.id === jogadorId);
    
    if (jogador.poderes.length === 0) {
        container.innerHTML += '<p>Nenhum poder disponível</p>';
    } else {
        jogador.poderes.forEach((poderId, index) => {
            const poder = poderes.find(p => p.id === poderId);
            container.innerHTML += `
                <div class="poder-item">
                    <div class="poder-info">
                        <strong>${poder.nome}</strong>
                        <p>${poder.descricao}</p>
                    </div>
                    <button class="btn-usar" onclick="usarPoder(${jogadorId}, ${index})">
                        Usar Poder
                    </button>
                </div>
            `;
        });
    }

    // Configura o botão de rolar dado
    document.getElementById('btnRolarDado').onclick = () => rolarDadoPoder(jogadorAtualId);
}

function usarPoder(jogadorId, poderIndex) {
    if (confirm("Usar este poder? Ele será removido do seu inventário.")) {
        const jogador = jogadores.find(j => j.id === jogadorId);
        const poderUsado = jogador.poderes.splice(poderIndex, 1)[0];
        
        mostrarPoderes(jogadorId);
        localStorage.setItem('jogoDados', JSON.stringify({
            jogadores: jogadores,
            jogoIniciado: true
        }));
        
        // Notificação temporária
        mostrarNotificacao(
            `${jogador.nome} usou: ${poderes.find(p => p.id === poderUsado).nome}`,
            'info'
        );
    }
}

function rolarDadoPoder(jogadorId) {
    const resultado = Math.floor(Math.random() * 6) + 1;
    const jogador = jogadores.find(j => j.id === jogadorId);

    if (jogador) {
        // Verifica se o resultado é um poder válido
        const poderSorteado = poderes.find(p => p.id === resultado);
        if (poderSorteado) {
            jogador.poderes.push(resultado);
            mostrarPoderes(jogadorId); // Atualiza a lista
            
            // Mostra notificação temporária
            mostrarNotificacao(
                `${jogador.nome} ganhou: ${poderSorteado.nome}`,
                'sucesso'
            );

            localStorage.setItem('jogoDados', JSON.stringify({
                jogadores: jogadores,
                jogoIniciado: true
            }));
        }
    }
}

function mostrarNotificacao(mensagem, tipo = 'sucesso') {
    // Remove notificações anteriores
    const notificacoesAntigas = document.querySelectorAll('.notificacao');
    notificacoesAntigas.forEach(el => el.remove());
    
    // Cria nova notificação
    const notificacao = document.createElement('div');
    notificacao.className = `notificacao notificacao-${tipo}`;
    notificacao.textContent = mensagem;
    document.body.appendChild(notificacao);
    
    // Remove após a animação
    setTimeout(() => {
        notificacao.remove();
    }, 3000);
}

function carregarJogoSalvo() {
    const dadosSalvos = localStorage.getItem('jogoDados');
    if (dadosSalvos) {
        const { jogadores: savedJogadores, jogoIniciado: savedIniciado } = JSON.parse(dadosSalvos);
        jogadores = savedJogadores;
        jogoIniciado = savedIniciado;
        
        if (jogoIniciado) {
            document.getElementById('placarContainer').style.display = 'block';
            document.getElementById('configInicial').style.display = 'none';
            atualizarPlacar();
        }
    }
}

function abrirCatalogoPoderes() {
    const container = document.getElementById('catalogoContainer');
    container.innerHTML = '';
    
    poderes.forEach(poder => {
        container.innerHTML += `
            <div class="poder-item">
                <h3>${poder.nome} (Poder ${poder.id})</h3>
                <p>${poder.descricao}</p>
            </div>
        `;
    });
    
    document.getElementById('modalCatalogoPoderes').style.display = 'flex';
}

function abrirPlacar() {
    document.getElementById('modalPlacar').style.display = 'flex';

    if (!jogoIniciado) {
        document.getElementById('configInicial').style.display = 'block';
        document.getElementById('placarContainer').style.display = 'none';
    } else {
        document.getElementById('configInicial').style.display = 'none';
        document.getElementById('placarContainer').style.display = 'block';
        atualizarPlacar();
    }
}

function voltarPlacar() {
    document.getElementById('modalPoderes').style.display = 'none';
    document.getElementById('modalPlacar').style.display = 'flex';
}

function abrirModal() {
    document.getElementById('modalRegras').style.display = 'flex';
}

function fecharModal() {
    // Lista de todos os modais que devem ser fechados
    modaisParaFechar.concat(['modalProblemasFinanceiros']).forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    });
}

window.addEventListener('click', (event) => {
    if (event.target.classList.contains('modal')) {
        fecharModal();
    }
});

document.addEventListener('DOMContentLoaded', carregarJogoSalvo);

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('notificacao')) {
        e.target.remove();
    }
});

function reiniciarFrases() {
    if (confirm("Tem certeza que deseja reiniciar as frases? O jogo voltará ao início.")) {
        // Reinicia as frases
        frasesDisponiveis = [...frases];
        problemasFinanceirosDisponiveis = [...problemasFinanceiros];
        
        // Limpa o elemento
        const elemento = document.getElementById('problema');
        elemento.classList.add('fade-out');
        setTimeout(() => {
            elemento.innerHTML = ''; // Limpa o conteúdo
            elemento.classList.remove('fade-out');
            elemento.classList.remove('esgotado');
        }, 500);
        // Reinicia o jogo
        resetarJogo();
    }
}

// Modal Problemas Financeiros
function abrirModalProblemasFinanceiros() {
    document.getElementById('modalProblemasFinanceiros').style.display = 'flex';
    resetarTimerProblema();
    document.getElementById('problemaFinanceiroTexto').innerText = '';
}

function sortearProblemaFinanceiro() {
    if (problemasFinanceirosDisponiveis.length === 0) {
        document.getElementById('problemaFinanceiroTexto').innerText = 'Todos os problemas já foram sorteados!';
        return;
    }
    resetarTimerProblema(); // Resetar timer ao sortear
    const indice = Math.floor(Math.random() * problemasFinanceirosDisponiveis.length);
    const problema = problemasFinanceirosDisponiveis[indice];
    document.getElementById('problemaFinanceiroTexto').innerText = problema;
    problemasFinanceirosDisponiveis.splice(indice, 1);
    iniciarTimerProblema();
}

function iniciarTimerProblema() {
    resetarTimerProblema();
    tempoRestante = 60;
    atualizarTimerProblema();
    timerInterval = setInterval(() => {
        tempoRestante--;
        atualizarTimerProblema();
        if (tempoRestante <= 0) {
            clearInterval(timerInterval);
            document.getElementById('timerProblema').innerText = 'Tempo esgotado!';
        }
    }, 1000);
}

function resetarTimerProblema() {
    if (timerInterval) clearInterval(timerInterval);
    tempoRestante = 60;
    document.getElementById('timerProblema').innerText = '01:00';
}

function atualizarTimerProblema() {
    const min = String(Math.floor(tempoRestante / 60)).padStart(2, '0');
    const sec = String(tempoRestante % 60).padStart(2, '0');
    document.getElementById('timerProblema').innerText = `${min}:${sec}`;
}

const frases = [
    "A empresa pretende abrir uma nova filial e precisa definir como financiar o investimento de R$ 200.000.",
    "Você recebeu R$ 10.000 e quer aplicá-los por 2 anos. Há opções com juros simples e compostos.",
    "A taxa nominal é de 18% a.a., e a inflação prevista é de 8% a.a.",
    "Um amigo te pediu R$ 500,00 emprestados, prometendo devolver em um mês com 5% de juros. Vale a pena emprestar?",
    "Você investiu R$ 5.000 em uma aplicação com taxa de juros de 8% ao ano, durante 3 anos. Identifique a melhor estratégia ou cálculo para determinar o montante final (M) dessa aplicação no regime de juros compostos.",
    "A empresa enfrenta períodos de baixa liquidez e atrasos de recebimento.",
    "Você pode escolher entre investir em CDB (renda fixa) ou em ações de uma startup. Como decidir?",
    "Após fechamento do balanço, o patrimônio líquido caiu 25%.",
    "Um projeto apresenta TIR menor que o custo de capital da empresa.",
    "A empresa não consegue pagar fornecedores e salários no prazo."
];

let frasesDisponiveis = [...frases];

const problemasFinanceiros = [
    "Problema 1",
    "Problema 2",
    "Problema 3",
    "Problema 4",
    "Problema 5"
];

let problemasFinanceirosDisponiveis = [...problemasFinanceiros];
let timerInterval = null;
let tempoRestante = 60;

function frase() {
    const elemento = document.getElementById('problema');
    elemento.classList.add('fade-out');

    setTimeout(() => {
        if (frasesDisponiveis.length === 0) {
            elemento.innerHTML = `<button onclick="reiniciarFrases()" class="btn-reiniciar esgotado">Frases esgotadas.</button>`;
            elemento.classList.remove('fade-out');
            return;
        }

        const indice = Math.floor(Math.random() * frasesDisponiveis.length);
        elemento.innerText = frasesDisponiveis[indice];
        elemento.classList.remove('esgotado');
        
        // Remove a frase usada do array de disponíveis
        frasesDisponiveis.splice(indice, 1);
        
        elemento.classList.remove('fade-out');
    }, 500);
}