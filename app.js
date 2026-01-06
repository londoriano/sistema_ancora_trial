const DB_KEY = "consultoria_db";
const SESSAO_KEY = "consultoria_logado";
const TRIAL_KEY = "ancora_trial_start";
const DIAS_TRIAL = 14; 
const CONTATO_RENOVACAO = "ancora.consultoriafinancas@gmail.com";

// --- VERIFICAÇÃO DE TRIAL ---
async function verificarLicenca() {
    const inicioStr = localStorage.getItem(TRIAL_KEY);
    if (!inicioStr) return; 

    const dataInicio = new Date(inicioStr);
    const dataExpiracao = new Date(dataInicio);
    dataExpiracao.setDate(dataExpiracao.getDate() + DIAS_TRIAL);

    const hoje = new Date();
    hoje.setHours(0,0,0,0);
    dataExpiracao.setHours(0,0,0,0);

    const diffTime = dataExpiracao - hoje;
    const diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // BLOQUEIO FATAL SE EXPIROU
    if (diasRestantes < 0) {
        sessionStorage.clear();
        document.body.innerHTML = `
            <div style="height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background-color: #212529; color: white; font-family: 'Segoe UI', sans-serif; text-align: center; padding: 20px;">
                <h1 style="font-size: 3rem; margin-bottom: 20px; color: #dc3545;">🚫 Período de Teste Encerrado</h1>
                <p style="font-size: 1.2rem; max-width: 600px; margin-bottom: 30px; color: #adb5bd;">
                    Seus ${DIAS_TRIAL} dias gratuitos acabaram.
                    <br>Para continuar usando a ferramenta profissionalmente, adquira a licença completa.
                </p>
                <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 8px; border: 1px solid #495057;">
                    <p style="margin:0; font-size: 0.9rem; color: #ced4da;">Fale Conosco:</p>
                    <h3 style="margin: 10px 0; color: #0dcaf0;">${CONTATO_RENOVACAO}</h3>
                </div>
                <button onclick="localStorage.removeItem('${DB_KEY}'); localStorage.removeItem('${TRIAL_KEY}'); location.reload()" style="margin-top: 40px; background:none; border:none; color: #495057; font-size:0.8rem; cursor:pointer;">
                    [Resetar Sistema - Apagar Tudo]
                </button>
            </div>`;
        throw new Error("TRIAL EXPIRADO"); 
    }

    const msgElement = document.getElementById('licencaMsg');
    if (msgElement) {
        if (diasRestantes > 5) {
            msgElement.innerHTML = `<i class="bi bi-hourglass-split text-primary"></i> Versão Trial: <strong>${diasRestantes} dias</strong> restantes`;
        } else {
            msgElement.innerHTML = `<span class="text-danger fw-bold"><i class="bi bi-exclamation-circle-fill"></i> Expira em ${diasRestantes} dias. Faça backup!</span>`;
        }
    }
}

// --- SEGURANÇA E SESSÃO ---
function verificarAutenticacao() {
    const path = window.location.pathname;
    const page = path.split("/").pop();
    const isIndex = page === 'index.html' || page === '' || page === '/';
    const logado = sessionStorage.getItem(SESSAO_KEY);
    
    // 1. Se não está logado, chuta para o index
    if (!logado && !isIndex) {
        window.location.href = 'index.html';
        return;
    }

    // 2. LISTA NEGRA: Páginas que NÃO podem ser acessadas no Trial
    // Adicione aqui todos os arquivos HTML que devem ser bloqueados
    const PAGINAS_PROIBIDAS = [
        'reserva_emergencia.html', 
        'protecao_patrimonial.html', 
        'aposentadoria.html'
    ];

    if (PAGINAS_PROIBIDAS.includes(page)) {
        alert("Acesso Negado: Este módulo é exclusivo da versão PRO."); // Alerta simples pois o DOM pode não estar pronto para modal
        window.location.href = 'clientes.html'; // Redireciona para área segura
    }
}

let inatividadeTime;
function resetarTimer() {
    clearTimeout(inatividadeTime);
    inatividadeTime = setTimeout(logout, 30 * 60 * 1000); 
}

// --- MODAL PREMIUM (PAYWALL) ---
function exibirModalPremium(tipo) {
    const antigo = document.getElementById('modalPremium');
    if (antigo) antigo.remove();

    let titulo = "Funcionalidade Premium";
    let texto = "Este recurso é exclusivo da versão completa.";
    let icone = "bi-star-fill";

    if (tipo === 'backup') {
        titulo = "Proteção de Dados";
        texto = "A realização de backups, <strong>exportação e restauração</strong> são recursos exclusivos da versão PRO.";
        icone = "bi-shield-lock-fill";
    } else if (tipo === 'limite_clientes') {
        titulo = "Limite de Clientes";
        texto = "Você atingiu o limite de <strong>4 clientes</strong> da versão gratuita. <br>Para gerenciar uma carteira ilimitada, faça o upgrade.";
        icone = "bi-people-fill";
    } else if (tipo === 'limite_recursos') {
        titulo = "Limite de Recursos";
        texto = "Na versão Trial, você possui limites de cadastros por cliente.";
        icone = "bi-speedometer2";
    } else if (tipo === 'modulo_bloqueado') {
        titulo = "Módulo Avançado";
        texto = "O acesso aos módulos de <strong>Reserva de Emergência, Proteção Patrimonial e Aposentadoria</strong> é exclusivo para assinantes PRO.";
        icone = "bi-lock-fill";
    }

    const modalHtml = `
    <div class="modal fade" id="modalPremium" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content text-center border-0 shadow-lg">
                <div class="modal-header bg-warning bg-opacity-10 border-0 justify-content-center position-relative">
                    <h5 class="modal-title fw-bold text-warning-emphasis"><i class="bi ${icone}"></i> Versão PRO</h5>
                    <button type="button" class="btn-close position-absolute end-0 top-0 m-3" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body p-4">
                    <h4 class="fw-bold mb-3 text-dark">${titulo}</h4>
                    <p class="text-muted mb-4 fs-6">${texto}</p>
                    
                    <div class="card border-warning mb-4" style="border: 2px dashed #ffc107; background-color: #fffbef;">
                        <div class="card-body">
                            <p class="small fw-bold text-uppercase text-muted mb-2 letter-spacing-1">Acesso Vitalício: R$997,00</p>
                            <div class="bg-white p-2 d-inline-block rounded shadow-sm border mb-2">
                                <img src="img/qrcode-pix.png" class="img-fluid" style="width: 140px; height: 140px; object-fit: contain;" alt="QR Code PIX" onerror="this.src='https://placehold.co/140x140?text=QR+Code+Aqui'">
                            </div>
                            <p class="small text-muted mt-1 mb-0 user-select-all">Chave PIX: <strong>jeferson4320@gmail.com</strong></p>
                        </div>
                    </div>

                    <div class="d-grid gap-2">
                       <a href="https://wa.me/5548920011614?text=Ol%C3%A1%2C%20sobre%20a%20vers%C3%A3o%20PRO%20do%20Sistema%20%C3%82ncora..." target="_blank"> <button class="btn btn-success fw-bold btn-lg shadow-sm">
                            <i class="bi bi-whatsapp"></i> Enviar Comprovante
                        </button></a>
                    </div>
                </div>
                <div class="modal-footer justify-content-center border-0 pb-4">
                    <small class="text-muted cursor-pointer" data-bs-dismiss="modal">Continuar na versão limitada</small>
                </div>
            </div>
        </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modalObj = new bootstrap.Modal(document.getElementById('modalPremium'));
    modalObj.show();
}

// --- VERIFICAÇÃO DE LIMITES ---
function verificarLimites(tipoRecurso, qtdAtual = 0) {
    const db = getDB();
    
    // NOVOS LIMITES (Escassez)
    const LIMITES = {
        'clientes': 4,      
        'dividas': 3,       // Reduzido para 3
        'objetivos': 2,     // Reduzido para 2
        'investimentos': 1  // Reduzido para 1
    };

    if (tipoRecurso === 'clientes') {
        if (db.length >= LIMITES.clientes) {
            exibirModalPremium('limite_clientes');
            return false;
        }
    } else if (['dividas', 'objetivos', 'investimentos'].includes(tipoRecurso)) {
        // Verifica se a quantidade atual já atingiu o limite
        if (qtdAtual >= LIMITES[tipoRecurso]) {
            exibirModalPremium('limite_recursos');
            return false;
        }
    }
    
    return true; 
}

// --- UTILITÁRIOS ---
function exibirMensagem(texto, tipo = 'sucesso', callback = null) {
    const antigo = document.getElementById('modalAvisoGeral');
    if (antigo) antigo.remove();

    let config = { titulo: 'Sucesso!', cor: 'success', icone: 'bi-check-circle-fill' };
    if (tipo === 'erro') config = { titulo: 'Erro', cor: 'danger', icone: 'bi-x-circle-fill' };
    else if (tipo === 'aviso') config = { titulo: 'Atenção', cor: 'warning', icone: 'bi-exclamation-triangle-fill' };

    const modalHtml = `
    <div class="modal fade" id="modalAvisoGeral" tabindex="-1" data-bs-backdrop="static">
        <div class="modal-dialog modal-dialog-centered modal-sm">
            <div class="modal-content text-center border-0 shadow">
                <div class="modal-body p-4">
                    <div class="mb-3"><i class="bi ${config.icone} text-${config.cor}" style="font-size: 3rem;"></i></div>
                    <h5 class="fw-bold text-${config.cor} mb-2">${config.titulo}</h5>
                    <p class="mb-4 text-muted">${texto}</p>
                    <button type="button" class="btn btn-${config.cor} w-100 fw-bold rounded-pill" id="btnAvisoOk">OK</button>
                </div>
            </div>
        </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modalElement = document.getElementById('modalAvisoGeral');
    const modalObj = new bootstrap.Modal(modalElement);
    const btnOk = document.getElementById('btnAvisoOk');
    
    const fechar = () => {
        modalObj.hide();
        modalElement.addEventListener('hidden.bs.modal', () => {
            modalElement.remove();
            if (callback) callback();
        });
    };

    btnOk.onclick = fechar;
    modalElement.addEventListener('keypress', (e) => { if (e.key === 'Enter') fechar(); });
    modalObj.show();
    setTimeout(() => btnOk.focus(), 100); 
}

function exibirConfirmacao(texto, callbackSim) {
    const antigo = document.getElementById('modalConfirmacaoAcao');
    if (antigo) antigo.remove();

    const modalHtml = `
    <div class="modal fade" id="modalConfirmacaoAcao" tabindex="-1" data-bs-backdrop="static">
        <div class="modal-dialog modal-dialog-centered modal-sm">
            <div class="modal-content border-0 shadow">
                <div class="modal-header border-0 pb-0">
                    <h5 class="modal-title text-danger fw-bold"><i class="bi bi-trash"></i> Tem certeza?</h5>
                </div>
                <div class="modal-body text-secondary">
                    ${texto}
                </div>
                <div class="modal-footer border-0 pt-0">
                    <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-danger fw-bold" id="btnConfirmarSim">Sim, Confirmar</button>
                </div>
            </div>
        </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modalEl = document.getElementById('modalConfirmacaoAcao');
    const modalObj = new bootstrap.Modal(modalEl);
    
    document.getElementById('btnConfirmarSim').onclick = () => {
        modalObj.hide();
        setTimeout(() => {
            modalEl.remove();
            callbackSim();
        }, 100);
    };
    modalObj.show();
}

function verificarSaida(acaoDestino) {
    if (typeof isDirty !== 'undefined' && isDirty) {
        if (!document.getElementById('modalNavConfirm')) {
            const modalHtml = `
            <div class="modal fade" id="modalNavConfirm" tabindex="-1" data-bs-backdrop="static">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header bg-warning bg-opacity-10 border-0">
                            <h5 class="modal-title text-warning-emphasis"><i class="bi bi-hdd-fill"></i> Salvar alterações?</h5>
                        </div>
                        <div class="modal-body">
                            <p class="mb-0">Você tem dados pendentes. Se sair agora, eles serão perdidos.</p>
                        </div>
                        <div class="modal-footer border-0">
                            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-danger" id="btnNavNao">Sair sem Salvar</button>
                            <button type="button" class="btn btn-success fw-bold px-4" id="btnNavSim">Salvar e Sair</button>
                        </div>
                    </div>
                </div>
            </div>`;
            document.body.insertAdjacentHTML('beforeend', modalHtml);
        }

        const modalElement = document.getElementById('modalNavConfirm');
        const modalObj = new bootstrap.Modal(modalElement);

        document.getElementById('btnNavSim').onclick = function() {
            modalObj.hide();
            if (typeof salvarAlteracoes === 'function') {
                salvarAlteracoes(true);
                setTimeout(acaoDestino, 100);
            } else {
                acaoDestino();
            }
        };

        document.getElementById('btnNavNao').onclick = function() {
            modalObj.hide();
            isDirty = false;
            acaoDestino();
        };
        modalObj.show();
    } else {
        acaoDestino();
    }
}

function navegarPara(url) { verificarSaida(() => window.location.href = url); }
function logout() { verificarSaida(() => { sessionStorage.removeItem(SESSAO_KEY); window.location.href = 'index.html'; }); }

function getDB() { const data = localStorage.getItem(DB_KEY); return data ? JSON.parse(data) : []; }
function saveDB(data) { localStorage.setItem(DB_KEY, JSON.stringify(data)); }

function mascaraTelefone(input) {
    let v = input.value.replace(/\D/g,'');
    v = v.replace(/^(\d{2})(\d)/g,"($1) $2"); 
    v = v.replace(/(\d)(\d{4})(\d{4})$/,"$1 $2-$3");
    input.value = v;
}

function formatarMoeda(valor) {
    if(!valor && valor !== 0) return "R$ 0,00";
    return parseFloat(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// --- CONSTRUÇÃO DO MENU LATERAL (COM BLOQUEIO) ---
function construirMenuLateral(clientId) {
    const container = document.getElementById('conteudoMenuLateral');
    if (!container) return; 

    // Lista de módulos que serão bloqueados visualmente e funcionalmente
    const ARQUIVOS_BLOQUEADOS = [
        'reserva_emergencia.html', 
        'protecao_patrimonial.html', 
        'aposentadoria.html'
    ];

    const paginas = [
        { nome: 'Dados Pessoais', arquivo: 'dados_pessoais.html', icone: 'bi-person-vcard' },
        { nome: 'Fluxo de Caixa', arquivo: 'fluxo_caixa.html', icone: 'bi-cash-coin' },
        { nome: 'Objetivos', arquivo: 'objetivos.html', icone: 'bi-bullseye' },
        { nome: 'Endividamento', arquivo: 'endividamento.html', icone: 'bi-credit-card-2-front' },
        { nome: 'Reserva de Emergência', arquivo: 'reserva_emergencia.html', icone: 'bi-shield-check' },
        { nome: 'Proteção Patrimonial', arquivo: 'protecao_patrimonial.html', icone: 'bi-umbrella' },
        { nome: 'Aposentadoria', arquivo: 'aposentadoria.html', icone: 'bi-hourglass-split' },
        { nome: 'Investimentos', arquivo: 'investimentos.html', icone: 'bi-graph-up-arrow' },
        { nome: 'Planejamento', arquivo: 'planejamento.html', icone: 'bi-map' }
    ];

    let html = '<div class="list-group list-group-flush">';
    html += `
        <a href="#" onclick="navegarPara('clientes.html')" class="list-group-item list-group-item-action bg-light text-dark fw-bold">
            <i class="bi bi-arrow-left-circle-fill"></i> Sair do Cliente
        </a>
        <div class="dropdown-divider"></div>
    `;

    const paginaAtual = window.location.pathname.split("/").pop();
    
    paginas.forEach(p => {
        const isBloqueado = ARQUIVOS_BLOQUEADOS.includes(p.arquivo);
        const activeClass = paginaAtual === p.arquivo ? 'active fw-bold' : '';
        const urlCompleta = `${p.arquivo}?id=${clientId}`;
        
        // Se bloqueado: Ícone de cadeado e chama o modal ao clicar
        if (isBloqueado) {
            html += `
            <a href="#" onclick="exibirModalPremium('modulo_bloqueado')" class="list-group-item list-group-item-action text-muted" style="opacity: 0.7;">
                <div class="d-flex justify-content-between align-items-center">
                    <span><i class="bi ${p.icone} me-2"></i> ${p.nome}</span>
                    <i class="bi bi-lock-fill text-warning small"></i>
                </div>
            </a>`;
        } else {
            // Se liberado: Navegação normal
            html += `<a href="#" onclick="navegarPara('${urlCompleta}')" class="list-group-item list-group-item-action ${activeClass}"><i class="bi ${p.icone} me-2"></i> ${p.nome}</a>`;
        }
    });

    html += '</div>';
    html += `<div class="mt-auto p-3 text-center text-muted small border-top"><small>Âncora Trial v2.2</small></div>`;
    container.innerHTML = html;
}

window.onload = async function() {
    await verificarLicenca();
    document.onmousemove = resetarTimer;
    document.onkeypress = resetarTimer;
    verificarAutenticacao();
    resetarTimer();
};