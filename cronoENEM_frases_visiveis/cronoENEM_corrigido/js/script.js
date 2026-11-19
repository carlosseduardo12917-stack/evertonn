const contasKey = 'cronoENEM_contas';
const sessaoKey = 'cronoENEM_sessao';

const conteudos = {
    linguagens: ['Interpretação de texto', 'Gramática', 'Literatura', 'Gêneros textuais', 'Artes', 'Educação física'],
    humanas: ['História do Brasil', 'História Geral', 'Geografia', 'Filosofia', 'Sociologia'],
    natureza: ['Biologia', 'Química', 'Física', 'Ecologia', 'Genética'],
    matematica: ['Matemática básica', 'Álgebra', 'Geometria', 'Funções', 'Probabilidade e estatística']
};

const dadosAreas = {
    linguagens: { nome: 'Linguagens', icone: '<i class="fa-solid fa-book-open"></i>' },
    humanas: { nome: 'Ciências Humanas', icone: '<i class="fa-solid fa-landmark"></i>' },
    natureza: { nome: 'Ciências da Natureza', icone: '<i class="fa-solid fa-flask"></i>' },
    matematica: { nome: 'Matemática', icone: '<i class="fa-solid fa-calculator"></i>' }
};

function obterContas(){
    try { return JSON.parse(localStorage.getItem(contasKey)) || []; }
    catch { return []; }
}
function salvarContas(contas){ localStorage.setItem(contasKey, JSON.stringify(contas)); }

function alternarAuth(tipo){
    const login = document.getElementById('loginForm');
    const cadastro = document.getElementById('formCadastro');
    const tabLogin = document.getElementById('tabLogin');
    const tabCadastro = document.getElementById('tabCadastro');
    const msg = document.getElementById('authMessage');
    msg.textContent = '';
    const isLogin = tipo === 'login';
    login.classList.toggle('hidden', !isLogin);
    cadastro.classList.toggle('hidden', isLogin);
    tabLogin.classList.toggle('active', isLogin);
    tabCadastro.classList.toggle('active', !isLogin);
}

function entrar(event){
    event.preventDefault();
    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const senha = document.getElementById('loginSenha').value;
    const conta = obterContas().find(c => c.email === email && c.senha === senha);
    const msg = document.getElementById('authMessage');
    if(!conta){ msg.textContent = 'E-mail ou senha incorretos.'; return; }
    localStorage.setItem(sessaoKey, email);
    mostrarSite();
}

function criarConta(event){
    event.preventDefault();
    const email = document.getElementById('cadastroEmail').value.trim().toLowerCase();
    const senha = document.getElementById('cadastroSenha').value;
    const confirmar = document.getElementById('cadastroConfirmar').value;
    const msg = document.getElementById('authMessage');
    if(!email || !email.includes('@')){ msg.textContent = 'Digite um e-mail válido.'; return; }
    if(senha.length < 6){ msg.textContent = 'A senha deve ter pelo menos 6 caracteres.'; return; }
    if(senha !== confirmar){ msg.textContent = 'As senhas não coincidem.'; return; }
    const contas = obterContas();
    if(contas.some(c => c.email === email)){ msg.textContent = 'Este e-mail já possui uma conta.'; return; }
    contas.push({email, senha});
    salvarContas(contas);

    // Após criar a conta, o usuário deve voltar para a tela de login.
    document.getElementById('formCadastro').reset();
    alternarAuth('login');
    msg.textContent = 'Conta criada com sucesso! Agora faça login para acessar o CronoENEM.';
}

function abrirAuth(){
    document.getElementById('paginaAuth').classList.remove('hidden');
    alternarAuth('login');
    document.body.style.overflow = 'hidden';
    const email = localStorage.getItem(sessaoKey);
    if(email) document.getElementById('loginEmail').value = email;
}

function fecharAuth(){
    document.getElementById('paginaAuth').classList.add('hidden');
    document.body.style.overflow = '';
}

function mostrarSite(){
    document.getElementById('paginaAuth').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    // A tela inicial permanece pública; apenas os conteúdos exigem identificação.
    document.getElementById('botaoIdentificacao').classList.add('hidden');
    document.getElementById('botaoSair').classList.remove('hidden');
    document.body.style.overflow = '';
    const email = localStorage.getItem(sessaoKey);
    const usuario = document.getElementById('usuarioLogado');
    if(usuario) usuario.textContent = email || '';
}

function mostrarVisitante(){
    document.getElementById('paginaAuth').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    // A tela inicial fica visível para visitantes, sem bloquear sua apresentação.
    document.getElementById('botaoIdentificacao').classList.remove('hidden');
    document.getElementById('botaoSair').classList.add('hidden');
    document.getElementById('usuarioLogado').textContent = '';
    document.body.style.overflow = '';
}

function sair(){
    localStorage.removeItem(sessaoKey);
    mostrarVisitante();
    voltarInicio();
}

let areaAtual = null;

function abrirArea(area){
    if(!localStorage.getItem(sessaoKey)){
        abrirAuth();
        return;
    }
    areaAtual = area;
    document.getElementById('paginaInicial').classList.add('hidden');
    document.getElementById('sobre').classList.add('hidden');
    document.getElementById('paginaArea').classList.remove('hidden');
    document.getElementById('nomeArea').textContent = dadosAreas[area].nome;
    document.getElementById('iconeArea').innerHTML = dadosAreas[area].icone;
    const lista = document.getElementById('listaConteudos');
    // Cada conteúdo vira uma opção para o aluno marcar o que quer no cronograma
    lista.innerHTML = '<p class="ajuda-dias">Marque os assuntos que você quer incluir no seu cronograma.</p>' +
        conteudos[area].map(item => `<label class="dia-option" style="margin-bottom:8px"><input type="checkbox" class="assunto-check" value="${item}"><span>${item}</span></label>`).join('');
    document.getElementById('resultadoPlano').classList.add('hidden');
    window.scrollTo({top:0, behavior:'smooth'});
}

function voltarInicio(){
    document.getElementById('paginaArea').classList.add('hidden');
    document.getElementById('paginaInicial').classList.remove('hidden');
    document.getElementById('sobre').classList.remove('hidden');
    window.scrollTo({top:0, behavior:'smooth'});
}

function atualizarDias(){
    const quantidade = Number(document.getElementById('dias').value);
    const checks = [...document.querySelectorAll('#diasSemana input')];
    const contador = document.getElementById('contadorDias');
    checks.forEach(c => { c.checked = false; c.disabled = !quantidade; });
    contador.textContent = quantidade ? `Selecione exatamente ${quantidade} dia(s).` : 'Selecione a quantidade de dias primeiro.';
}

function validarDias(){
    const quantidade = Number(document.getElementById('dias').value);
    const selecionados = [...document.querySelectorAll('#diasSemana input:checked')];
    if(!quantidade){ alert('Informe primeiro quantos dias por semana você irá estudar.'); return false; }
    if(selecionados.length !== quantidade){ alert(`Selecione exatamente ${quantidade} dia(s) da semana.`); return false; }
    return true;
}

function gerarPlano(){
    if(!validarDias()) return;
    const horas = document.getElementById('horas').value;
    const dias = [...document.querySelectorAll('#diasSemana input:checked')].map(c => c.value);
    if(!horas){ alert('Informe quantas horas você tem disponíveis por dia.'); return; }
    const todas = [...document.querySelectorAll('#listaConteudos .assunto-check:checked')].map(c => c.value);
    if(!todas.length){ alert('Selecione pelo menos um assunto para montar seu cronograma.'); return; }
    const resultado = document.getElementById('planoGerado');
    resultado.innerHTML = dias.map((dia, i) => {
        const porDia = Math.max(1, Math.ceil(todas.length / dias.length));
        const itens = todas.slice(i * porDia, (i + 1) * porDia);
        return `<div class="plano-item"><strong>${dia}</strong><br>${itens.join(' • ')}<br><small>${horas} hora(s) de estudo</small></div>`;
    }).join('');
    document.getElementById('resultadoPlano').classList.remove('hidden');
    document.getElementById('resultadoPlano').scrollIntoView({behavior:'smooth'});
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('dias').addEventListener('change', atualizarDias);
    document.querySelectorAll('#diasSemana input').forEach(input => {
        input.addEventListener('change', () => {
            const quantidade = Number(document.getElementById('dias').value);
            const selecionados = document.querySelectorAll('#diasSemana input:checked').length;
            document.getElementById('contadorDias').textContent = quantidade ? `${selecionados} de ${quantidade} dia(s) selecionado(s).` : 'Selecione a quantidade de dias primeiro.';
            if(quantidade && selecionados > quantidade) input.checked = false;
        });
        input.disabled = true;
    });

    if(localStorage.getItem(sessaoKey)) mostrarSite();
    else mostrarVisitante();
});
