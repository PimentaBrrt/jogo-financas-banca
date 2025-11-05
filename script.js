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
        jogador.poderes.push(resultado);
        mostrarPoderes(jogadorId); // Atualiza a lista
        
        // Mostra notificação temporária
        mostrarNotificacao(
            `${jogador.nome} ganhou: ${poderes[resultado-1].nome}`,
            'sucesso'
        );

        localStorage.setItem('jogoDados', JSON.stringify({
            jogadores: jogadores,
            jogoIniciado: true
        }));
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
    
    modaisParaFechar.forEach(modalId => {
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

const frases = [
    "Teste1",
    "Teste2",
    "Teste3",
    "Teste4",
    "Teste5"
  ];

function frase() {
    const elemento = document.getElementById('problema');
    elemento.classList.add('fade-out');

    setTimeout(() => {
        const num = Math.floor(Math.random() * frases.length);
        elemento.innerText = frases[num];
        elemento.classList.remove('fade-out');
    }, 500);
}