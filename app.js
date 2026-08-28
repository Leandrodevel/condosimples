// Senha padrão de acesso ao sistema
const admin_pass = "207730";


// Verifica se já está logado ao carregar a página
window.addEventListener('DOMContentLoaded', () => {
    const logado = localStorage.getItem('sistema_logado');
    if (logado === 'true') {
        const telaLogin = document.getElementById('telaLogin');
        if (telaLogin) telaLogin.classList.add('hidden');
    }
});

function realizarLoginSimples() {
    const senhaDigitada = document.getElementById('inputAdminPass').value;

    if (senhaDigitada === admin_pass) {
        localStorage.setItem('sistema_logado', 'true');
        const telaLogin = document.getElementById('telaLogin');
        if (telaLogin) {
            telaLogin.classList.add('hidden');
             // Chama a função para registrar o acesso na nuvem em segundo plano
    
        }
    } else {
        alert("Senha incorreta! Tente novamente.");
        document.getElementById('inputAdminPass').value = '';
    }
}

// Opcional: Verifica se o usuário já fez login ao abrir a página
window.addEventListener('DOMContentLoaded', () => {
    const jaLogado = sessionStorage.getItem('autenticado');
    const telaLogin = document.getElementById('telaLogin');
    
    if (jaLogado === 'true' && telaLogin) {
        telaLogin.classList.add('hidden');
    }
});

// Suas credenciais do JSONBin
        const BIN_ID = '6a8ca917da38895dfe0c130b';
        const MASTER_KEY = '$2a$10$dQGLRurlOEnFFy4JdgxjxOLObuCSsZflIg.lBeAR.nzdcGdOHgIjq';
        
 async function salvarNaNuvem() {
    try {
        const dadosCompletos = {
            moradores: typeof moradores !== 'undefined' ? moradores : [],
            notas: typeof notas !== 'undefined' ? notas : [],
            reservas: typeof reservas !== 'undefined' ? reservas : [],
            reservas_salao: typeof reservas_salao !== 'undefined' ? reservas_salao : [],
            encomendas: typeof encomendas !== 'undefined' ? encomendas : [],
            espacos: typeof espacos !== 'undefined' ? espacos : []
        };

        console.log("Enviando dados para a nuvem...");

        const resposta = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': MASTER_KEY
            },
            body: JSON.stringify(dadosCompletos)
        });

        if (!resposta.ok) throw new Error('Erro ao salvar na nuvem');

        const resultado = await resposta.json();
        console.log("Dados salvos e sincronizados com sucesso na nuvem!", resultado);

    } catch (error) {
        console.error("Erro:", error);
        alert("Erro ao tentar salvar os dados na nuvem.");
    }
}


        // 1. CARREGAR OS DADOS (Use quando a página abrir)
        
       let moradores = JSON.parse(localStorage.getItem('lista_condominio')) || [];
let notas = JSON.parse(localStorage.getItem('lista_notas')) || [];
let reservas = JSON.parse(localStorage.getItem('lista_reservas')) || [];
let reservas_salao = JSON.parse(localStorage.getItem('lista_reservas_salao')) || [];
limparReservasAntigas();
let encomendas = JSON.parse(localStorage.getItem('lista_encomendas')) || [];
let espacos = JSON.parse(localStorage.getItem('lista_espacos')) || ['Salão de Festas'];
let contextoModalCasa = 'busca';

async function carregarDaNuvem() {
    try {
        console.log("Baixando dados da nuvem...");

        const resposta = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
            headers: {
                'X-Master-Key': MASTER_KEY
            }
        });

        if (!resposta.ok) throw new Error('Erro ao carregar da nuvem');

        const resultado = await resposta.json();
        const dados = resultado.record;

        if (Array.isArray(dados)) {
            moradores = dados;
            localStorage.setItem('lista_condominio', JSON.stringify(moradores));
            renderizar();
            return;
        }

        if (dados && typeof dados === 'object') {
            if (Array.isArray(dados.moradores)) {
                moradores = dados.moradores;
                localStorage.setItem('lista_condominio', JSON.stringify(moradores));
            }
            if (Array.isArray(dados.notas)) {
                notas = dados.notas;
                localStorage.setItem('lista_notas', JSON.stringify(notas));
            }
            if (Array.isArray(dados.reservas)) {
                reservas = dados.reservas;
                limparReservasAntigas();
                localStorage.setItem('lista_reservas', JSON.stringify(reservas));
            }
            if (Array.isArray(dados.reservas_salao)) {
                reservas_salao = dados.reservas_salao;
                localStorage.setItem('lista_reservas_salao', JSON.stringify(reservas_salao));
            }
            if (Array.isArray(dados.encomendas)) {
                encomendas = dados.encomendas;
                localStorage.setItem('lista_encomendas', JSON.stringify(encomendas));
            }
            if (Array.isArray(dados.espacos)) {
                espacos = dados.espacos;
                localStorage.setItem('lista_espacos', JSON.stringify(espacos));
            }

            if (typeof renderizar === 'function') renderizar();
            if (typeof renderizarNotas === 'function') renderizarNotas();
            if (typeof renderizarEncomendas === 'function') renderizarEncomendas();
            if (typeof renderizarHistorico === 'function') renderizarHistorico();
            if (typeof renderizarEspacosSelect === 'function') renderizarEspacosSelect();
            if (typeof renderizarEspacosGerencia === 'function') renderizarEspacosGerencia();
            if (typeof renderizarReservas === 'function') renderizarReservas();
            if (typeof renderizarEspacos === 'function') renderizarEspacos();
            if (typeof renderizarReservasSalao === 'function') renderizarReservasSalao();

            console.log("Dados sincronizados com sucesso!");
        } else {
            alert("Os dados da nuvem não têm o formato esperado.");
        }

    } catch (error) {
        console.error("Erro:", error);
        alert("Erro ao conectar com a nuvem para carregar os dados.");
    }
}

function verificarEncomendasAntigas() {
    let encomendas = JSON.parse(localStorage.getItem('lista_encomendas')) || [];
    if (encomendas.length === 0) return;

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const CINCO_DIAS_MS = 5 * 24 * 60 * 60 * 1000;
    let encomendasParaRemover = [];
    let encomendasMantidas = [];

    encomendas.forEach(enc => {
        const dataEncStr = enc.data || enc.dataEntrega;
        if (!dataEncStr) {
            encomendasMantidas.push(enc);
            return;
        }

        const dataEnc = new Date(dataEncStr + 'T00:00:00');
        const diferencaTempo = hoje - dataEnc;

        if (diferencaTempo > CINCO_DIAS_MS) {
            encomendasParaRemover.push(enc);
        } else {
            encomendasMantidas.push(enc);
        }
    });

    if (encomendasParaRemover.length > 0) {
        mostrarModalExclusaoEncomendas(encomendasParaRemover, encomendasMantidas);
    }
}

function mostrarModalExclusaoEncomendas(removidas, mantidas) {
    const modalAntigo = document.getElementById('modalAvisoEncomendas');
    if (modalAntigo) modalAntigo.remove();

    const modalHTML = `
        <div id="modalAvisoEncomendas" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl max-w-md w-full flex flex-col gap-4 border border-gray-100 dark:border-slate-700">
                <div class="flex items-center gap-3">
                    <div class="p-3 bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 rounded-xl">
                        <i data-lucide="alert-triangle" class="w-6 h-6"></i>
                    </div>
                    <div>
                        <h3 class="font-bold text-gray-800 dark:text-gray-100 text-base">Limpeza Automática de Encomendas</h3>
                        <p class="text-xs text-gray-500 dark:text-gray-400">Foram encontradas ${removidas.length} encomenda(s) com mais de 5 dias.</p>
                    </div>
                </div>
                
                <p class="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                    Encomendas entregues há mais de 5 dias serão removidas automaticamente para manter o sistema limpo. Você pode fazer um backup geral antes de prosseguir.
                </p>

                <div class="flex flex-col gap-2 mt-2">
                    <button onclick='exportarDados()' class="w-full py-2.5 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-xl font-bold text-xs hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-2">
                        <i data-lucide="download" class="w-4 h-4"></i> Exportar Dados Gerais (Backup)
                    </button>
                    
                    <button onclick='confirmarLimpezaEncomendas(${JSON.stringify(mantidas)})' class="w-full py-3 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-colors shadow-md">
                        Entendido e Continuar
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function confirmarLimpezaEncomendas(encomendasMantidas) {
    localStorage.setItem('lista_encomendas', JSON.stringify(encomendasMantidas));
    encomendas = encomendasMantidas;

    const modal = document.getElementById('modalAvisoEncomendas');
    if (modal) modal.remove();

    if (typeof renderizarEncomendas === 'function') {
        renderizarEncomendas();
    }
    
    if (typeof salvarNaNuvem === 'function') {
        salvarNaNuvem();
    }
}

window.addEventListener('DOMContentLoaded', () => {
    setTimeout(verificarEncomendasAntigas, 500);
});

        function toggleMenu() {
            const sidebar = document.getElementById('sidebar');
            const overlay = document.getElementById('sidebarOverlay');
            const isOpen = !sidebar.classList.contains('-translate-x-full');

            if (isOpen) {
                sidebar.classList.add('-translate-x-full');
                overlay.classList.add('hidden');
            } else {
                sidebar.classList.remove('-translate-x-full');
                overlay.classList.remove('hidden');
            }
        }
        
        function mudarAbaNav(aba) {
            document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
            document.getElementById('aba' + aba.charAt(0).toUpperCase() + aba.slice(1)).classList.remove('hidden');
            
            const nomesAbas = { 
                'busca': 'Buscar', 
                'cadastro': 'Cadastrar', 
                'encomendas': 'Pendentes', 
                'historicoEncomendas': 'Histórico',
                'reservas': 'Reservas', 
                'espacos': 'Espaços',
                'notas': 'Anotações' 
            };
            document.getElementById('tituloAbaAtual').innerText = nomesAbas[aba] || '';

            document.querySelectorAll('.menu-btn').forEach(btn => {
                btn.classList.remove('bg-green-50', 'text-green-700', 'font-bold');
                btn.classList.add('font-medium', 'text-gray-600');
            });
            event?.currentTarget?.classList?.remove('font-medium', 'text-gray-600');
            event?.currentTarget?.classList?.add('bg-green-50', 'text-green-700', 'font-bold');

          // toggleMenu();
            renderizar(); renderizarNotas(); renderizarEncomendas(); renderizarHistorico(); 
            lucide.createIcons();
        }
       function mudarAba(aba) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    
    // Tratamento especial para o ID da aba do Salão de Festas (abaSalaoFestas vs abaSalaofestas)
    let idElemento = 'aba' + aba.charAt(0).toUpperCase() + aba.slice(1);
    if (aba === 'salaoFestas') idElemento = 'abaSalaoFestas';
    
    const elementoAba = document.getElementById(idElemento);
    if (elementoAba) elementoAba.classList.remove('hidden');
    
    const nomesAbas = { 
        'busca': 'Buscar', 
        'cadastro': 'Cadastrar', 
        'encomendas': 'Pendentes', 
        'historicoEncomendas': 'Histórico',
        'reservas': 'Reservas', 
        'espacos': 'Espaços',
        'salaoFestas': 'Salão de Festas',
        'notas': 'Anotações' 
    };
    
    const tituloEl = document.getElementById('tituloAbaAtual');
    if (tituloEl) tituloEl.innerText = nomesAbas[aba] || '';

    document.querySelectorAll('.menu-btn').forEach(btn => {
        btn.classList.remove('bg-green-50', 'text-green-700', 'font-bold');
        btn.classList.add('font-medium', 'text-gray-600');
    });
    event?.currentTarget?.classList?.remove('font-medium', 'text-gray-600');
    event?.currentTarget?.classList?.add('bg-green-50', 'text-green-700', 'font-bold');

    toggleMenu();
    
    // Executa as funções de renderização disponíveis no sistema
    if (typeof renderizar === 'function') renderizar();
    if (typeof renderizarNotas === 'function') renderizarNotas();
    if (typeof renderizarEncomendas === 'function') renderizarEncomendas();
    if (typeof renderizarHistorico === 'function') renderizarHistorico();
    if (typeof renderizarEspacos === 'function') renderizarEspacos();
    if (typeof renderizarReservasSalao === 'function') renderizarReservasSalao();
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

  function exportarDados() {
    const dadosCompletos = {
        moradores: typeof moradores !== 'undefined' ? moradores : [],
        notas: typeof notas !== 'undefined' ? notas : [],
        reservas: typeof reservas !== 'undefined' ? reservas : [],
        reservas_salao: typeof reservas_salao !== 'undefined' ? reservas_salao : [],
        encomendas: typeof encomendas !== 'undefined' ? encomendas : [],
        espacos: typeof espacos !== 'undefined' ? espacos : []
    };

    const dadosStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dadosCompletos, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dadosStr);
    downloadAnchor.setAttribute("download", "backup_sistema_condominio.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}
function importarDados(event) {
    const arquivo = event.target.files[0];
    if (!arquivo) return;

    const leitor = new FileReader();
    leitor.onload = function(e) {
        try {
            const conteudo = e.target.result;
            const dados = JSON.parse(conteudo);

            if (!dados || typeof dados !== 'object') {
                alert("O arquivo selecionado não contém um formato JSON válido.");
                return;
            }

            if (confirm("Tem certeza que deseja importar estes dados? Isso substituirá as informações atuais do sistema.")) {
                if (Array.isArray(dados.moradores)) {
                    moradores = dados.moradores;
                    localStorage.setItem('lista_condominio', JSON.stringify(moradores));
                }
                if (Array.isArray(dados.notas)) {
                    notas = dados.notas;
                    localStorage.setItem('lista_notas', JSON.stringify(notas));
                }
                if (Array.isArray(dados.reservas)) {
                    reservas = dados.reservas;
                    localStorage.setItem('lista_reservas', JSON.stringify(reservas));
                }
                if (Array.isArray(dados.reservas_salao)) {
                    reservas_salao = dados.reservas_salao;
                    localStorage.setItem('lista_reservas_salao', JSON.stringify(reservas_salao));
                }
                if (Array.isArray(dados.encomendas)) {
                    encomendas = dados.encomendas;
                    localStorage.setItem('lista_encomendas', JSON.stringify(encomendas));
                }
                if (Array.isArray(dados.espacos)) {
                    espacos = dados.espacos;
                    localStorage.setItem('lista_espacos', JSON.stringify(espacos));
                }

                // Atualiza todas as telas do sistema
                if (typeof renderizar === 'function') renderizar();
                if (typeof renderizarNotas === 'function') renderizarNotas();
                if (typeof renderizarEncomendas === 'function') renderizarEncomendas();
                if (typeof renderizarHistorico === 'function') renderizarHistorico();
                if (typeof renderizarEspacosSelect === 'function') renderizarEspacosSelect();
                if (typeof renderizarEspacosGerencia === 'function') renderizarEspacosGerencia();
                if (typeof renderizarReservas === 'function') renderizarReservas();
                if (typeof renderizarEspacos === 'function') renderizarEspacos();
                if (typeof renderizarReservasSalao === 'function') renderizarReservasSalao();

                // Sincroniza com a nuvem, se aplicável
                if (typeof salvarNaNuvem === 'function') {
                  //  salvarNaNuvem();
                }

                alert("Dados importados com sucesso!");
            }
        } catch (erro) {
            console.error("Erro ao ler o arquivo:", erro);
            alert("Erro ao processar o arquivo JSON. Verifique se o formato está correto.");
        } finally {
            // Limpa o input de arquivo para permitir selecionar o mesmo arquivo novamente se necessário
            event.target.value = '';
        }
    };

    leitor.readAsText(arquivo);
}
// Suas credenciais do JSONBin


        function abrirModal(id) {
            const m = moradores.find(x => x.id === id);
            if (!m) return;
            document.getElementById('editId').value = m.id;
            document.getElementById('editCasa').value = m.casa;
            document.getElementById('editNome').value = m.nome;
            document.getElementById('editTelefone').value = m.telefone || '';
            document.getElementById('modalEdicao').classList.remove('hidden');
        }

        function fecharModal() {
            document.getElementById('modalEdicao').classList.add('hidden');
        }

        function abrirModalEncomenda() {
            document.getElementById('formEncomendas').reset();
            document.getElementById('modalEncomenda').classList.remove('hidden');
        }

        function fecharModalEncomenda() {
           const selectDestinatario = document.getElementById('encomendaDestinatario');
selectDestinatario.innerHTML = '<option value="">Selecione a casa primeiro...</option>';
selectDestinatario.disabled = true; // Trava o select novamente até escolher uma nova casa
            document.getElementById('modalEncomenda').classList.add('hidden');
       
        }

        function abrirModalCasas(contexto = 'busca') {
            contextoModalCasa = contexto;
            const grid = document.getElementById('gridCasas');
            grid.innerHTML = '';
            const casasUnicas = [...new Set(moradores.map(m => m.casa))].sort((a, b) => a.localeCompare(b, undefined, {numeric: true}));

            if (casasUnicas.length === 0) {
                grid.innerHTML = `<div class="col-span-4 p-4 text-center text-gray-400 italic">Nenhuma casa cadastrada.</div>`;
            } else {
                casasUnicas.forEach(casa => {
                    grid.innerHTML += `<button onclick="selecionarCasaModal('${casa}')" class="bg-green-50 hover:bg-green-600 hover:text-white border border-green-200 text-green-800 font-bold p-3 rounded-xl transition-all text-center shadow-sm">${casa}</button>`;
                });
            }
            document.getElementById('modalCasas').classList.remove('hidden');
        }

        function fecharModalCasas() { document.getElementById('modalCasas').classList.add('hidden'); }
        
        function selecionarCasaModal(casa) {
    // Fecha o modal primeiro
    document.getElementById('modalCasas').classList.add('hidden');

    // Se o contexto for encomenda, preenche o input e alimenta o select
    if (contextoModalCasa === 'encomenda') {
        document.getElementById('encomendaCasa').value = casa;
        
        const moradoresDaCasa = moradores.filter(m => m.casa === casa);
        const selectDestinatario = document.getElementById('encomendaDestinatario');
        
        selectDestinatario.innerHTML = '<option value="">Selecione o destinatário...</option>';
        
        moradoresDaCasa.forEach(morador => {
            const option = document.createElement('option');
            option.value = morador.nome;
            option.textContent = morador.nome;
            selectDestinatario.appendChild(option);
        });
        
        selectDestinatario.disabled = false;
    } 
    else {
        // Se for para outro contexto (como a busca de moradores), você coloca a sua lógica atual aqui
        const inputBusca = document.getElementById('busca'); // Substitua pelo ID real do seu input de busca se for diferente
        if (inputBusca) {
            inputBusca.value = casa;
            // Se você tiver uma função que dispara a busca ao selecionar, chame aqui
            renderizar()
        }else{
            alert('erro -contate o administrador')
        }
    }
}

        function abrirModalLetras() {
            const grid = document.getElementById('gridLetras');
            grid.innerHTML = '';
            "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").forEach(letra => {
                grid.innerHTML += `<button onclick="selecionarLetraBusca('${letra}')" class="bg-green-50 hover:bg-green-600 hover:text-white border border-green-200 text-green-800 font-bold p-3 rounded-xl transition-all text-center shadow-sm">${letra}</button>`;
            });
            document.getElementById('modalLetras').classList.remove('hidden');
        }
     function limparBusca() { 
        document.getElementById('busca').value = '';
         renderizar();
     }

        function fecharModalLetras() { document.getElementById('modalLetras').classList.add('hidden'); }
        function selecionarLetraBusca(letra) { document.getElementById('busca').value = letra.toLowerCase(); fecharModalLetras(); renderizar(); }

        function abrirModalNovoEspaco(nomeAtual = '') { 
            document.getElementById('formNovoEspaco').reset();
            document.getElementById('editEspacoAntigo').value = nomeAtual;
            document.getElementById('tituloModalEspaco').innerText = nomeAtual ? 'Editar Espaço' : 'Cadastrar Novo Espaço';
            if (nomeAtual) {
                document.getElementById('nomeNovoEspaco').value = nomeAtual;
            }
            document.getElementById('modalNovoEspaco').classList.remove('hidden'); 
        }
        function fecharModalNovoEspaco() { document.getElementById('modalNovoEspaco').classList.add('hidden'); }

        document.getElementById('formNovoEspaco').addEventListener('submit', (e) => {
    e.preventDefault();
    const nomeAntigo = document.getElementById('editEspacoAntigo').value;
    const nomeNovo = document.getElementById('nomeNovoEspaco').value.trim();

    if (espacos.includes(nomeNovo) && nomeNovo !== nomeAntigo) { 
        alert("Este espaço já está cadastrado."); 
        return; 
    }

    if (nomeAntigo) {
        // Editando
        espacos = espacos.map(esp => esp === nomeAntigo ? nomeNovo : esp);
        reservas = reservas.map(res => res.area === nomeAntigo ? { ...res, area: nomeNovo } : res);
        localStorage.setItem('lista_reservas', JSON.stringify(reservas));
        alert("Espaço atualizado com sucesso!");
    } else {
        // Criando novo
        espacos.push(nomeNovo);
        alert("Espaço cadastrado com sucesso!");
    }

    // Salva localmente
    localStorage.setItem('lista_espacos', JSON.stringify(espacos));
    
    // Atualiza a interface
   
    renderizarEspacosGerencia();
    fecharModalNovoEspaco();

    // Sincroniza todas as alterações (espaços e reservas) direto com a nuvem (JSONBin)
    salvarNaNuvem();
});

// === FUNÇÕES DE GESTÃO DE ESPAÇOS E RESERVAS (Integrado ao app.js) ===

function renderizarEspacos() {
    const grid = document.getElementById('gridEspacos');
    if (!grid) return;
    grid.innerHTML = '';

    if (!espacos || espacos.length === 0) {
        grid.innerHTML = `<p class="text-sm text-gray-400 col-span-full">Nenhum espaço cadastrado.</p>`;
        return;
    }

    espacos.forEach(espaco => {
        let totalReservas = reservas.filter(r => r.area.toLowerCase() === espaco.toLowerCase()).length;
        if (espaco.toLowerCase() === 'salão de festas' || espaco.toLowerCase() === 'salao de festas') {
            totalReservas += (typeof reservas_salao !== 'undefined' ? reservas_salao.length : 0);
        }

        const temReservas = totalReservas > 0;
        
        // Mantém o estilo original do card, alterando apenas a borda se houver reservas
        const classeBorda = temReservas 
            ? 'bg-white p-5 rounded-xl shadow-sm border-2 border-green-500 transition-all flex flex-col justify-between gap-4 relative group' 
            : 'bg-white p-5 rounded-xl shadow-sm border border-green-100 hover:border-green-400 transition-all flex flex-col justify-between gap-4 relative group';

        grid.innerHTML += `
            <div class="${classeBorda}">
                <div onclick="abrirDetalhesEspaco('${espaco}')" class="cursor-pointer">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div class="p-3 bg-green-50 text-green-600 rounded-lg">
                                <i data-lucide="map-pin" class="w-6 h-6"></i>
                            </div>
                            <div>
                                <h4 class="font-bold text-gray-800">${espaco}</h4>
                                <span class="text-xs text-gray-500">${totalReservas} reserva(s) cadastrada(s)</span>
                            </div>
                        </div>
                        <button onclick="event.stopPropagation(); excluirEspaco('${espaco}')" class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Excluir Espaço">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                    </div>
                </div>
                <div onclick="abrirDetalhesEspaco('${espaco}')" class="text-xs font-semibold text-green-600 flex items-center gap-1 cursor-pointer pt-2 border-t border-gray-50">
                    Gerenciar reservas <i data-lucide="arrow-right" class="w-4 h-4"></i>
                </div>
            </div>
        `;
    });

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function excluirEspaco(nomeEspaco) {
    const senhaDigitada = prompt("Digite a senha de administrador para apagar este espaço:");
    
    if (senhaDigitada === null) return; // Cancelado pelo usuário

    if (senhaDigitada === admin_pass) {
        // Remove o espaço do array
        espacos = espacos.filter(e => e.toLowerCase() !== nomeEspaco.toLowerCase());
        
        // Opcional: Remove também as reservas associadas a este espaço apagado
        reservas = reservas.filter(r => r.area.toLowerCase() !== nomeEspaco.toLowerCase());
        
        // Atualiza o localStorage
        localStorage.setItem('lista_espacos', JSON.stringify(espacos));
        localStorage.setItem('lista_reservas', JSON.stringify(reservas));
        
        // Se houver salvamento na nuvem, chame aqui:
        // if (typeof salvarNaNuvem === 'function') salvarNaNuvem();
        salvarNaNuvem(); // Sincroniza a exclusão com a nuvem
        renderizarEspacos();

        alert("Espaço excluído com sucesso!");
    } else {
        alert("Senha incorreta!");
    }
}
function abrirDetalhesEspaco(nomeEspaco) {
    document.getElementById('painelEspacos').classList.add('hidden');
    document.getElementById('painelDetalhesEspaco').classList.remove('hidden');
    
    document.getElementById('tituloEspacoSelecionado').innerText = nomeEspaco;
    document.getElementById('reservaArea').value = nomeEspaco;

    renderizarReservasDoEspaco(nomeEspaco);
}

function voltarParaEspacos() {
    document.getElementById('painelDetalhesEspaco').classList.add('hidden');
    document.getElementById('painelEspacos').classList.remove('hidden');
    renderizarEspacos();
}

function renderizarReservasDoEspaco(nomeEspaco) {
    const container = document.getElementById('listaReservasEspaco');
    if (!container) return;
    
    // Remove os botões antigos de filtro para recriá-corretamente vinculados ao espaço atual
    const filtroAntigo = document.getElementById('filtroReservasContainer');
    if (filtroAntigo) filtroAntigo.remove();

    container.innerHTML = '';

    const reservasFiltradas = reservas.filter(r => r.area.toLowerCase() === nomeEspaco.toLowerCase());

    // Injeta os botões de filtro no topo da lista
    let filtroContainer = document.createElement('div');
    filtroContainer.id = 'filtroReservasContainer';
    filtroContainer.className = 'flex gap-2 mb-3';
    filtroContainer.innerHTML = `
        <button onclick="mudarFiltroReserva('${nomeEspaco}', 'todos')" id="btnFiltro-todos" class="px-3 py-1 text-xs font-semibold rounded-lg bg-green-600 text-white transition-colors">Todas</button>
        <button onclick="mudarFiltroReserva('${nomeEspaco}', 'hoje')" id="btnFiltro-hoje" class="px-3 py-1 text-xs font-semibold rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">Hoje</button>
        <button onclick="mudarFiltroReserva('${nomeEspaco}', 'mes')" id="btnFiltro-mes" class="px-3 py-1 text-xs font-semibold rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">Este Mês</button>
    `;
    container.parentNode.insertBefore(filtroContainer, container);

    if (reservasFiltradas.length === 0) {
        container.innerHTML = `<p class="text-sm text-gray-400 py-3">Nenhuma reserva encontrada para este espaço.</p>`;
        return;
    }

    // Ordena da mais próxima para a mais distante (por data e horário)
    reservasFiltradas.sort((a, b) => {
        const dataA = new Date(`${a.data}T${a.horario || '00:00'}`);
        const dataB = new Date(`${b.data}T${b.horario || '00:00'}`);
        return dataA - dataB;
    });

    // Recupera o filtro atual (padrão 'todos')
    const filtroAtual = window.filtroReservaAtivo || 'todos';
    
    // Atualiza o estilo visual dos botões
    ['todos', 'hoje', 'mes'].forEach(f => {
        const btn = document.getElementById(`btnFiltro-${f}`);
        if (btn) {
            if (f === filtroAtual) {
                btn.className = "px-3 py-1 text-xs font-semibold rounded-lg bg-green-600 text-white transition-colors";
            } else {
                btn.className = "px-3 py-1 text-xs font-semibold rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors";
            }
        }
    });

    const hojeStr = new Date().toISOString().split('T')[0];
    const anoMesAtual = hojeStr.substring(0, 7); // "YYYY-MM"

    // Aplica o filtro selecionado
    const reservasProcessadas = reservasFiltradas.filter(reserva => {
        if (filtroAtual === 'hoje') return reserva.data === hojeStr;
        if (filtroAtual === 'mes') return reserva.data.startsWith(anoMesAtual);
        return true;
    });

    if (reservasProcessadas.length === 0) {
        container.innerHTML = `<p class="text-sm text-gray-400 py-3">Nenhuma reserva encontrada para este filtro.</p>`;
        return;
    }

    // Separa as de hoje das demais para o separador visual
    const reservasHoje = reservasProcessadas.filter(r => r.data === hojeStr);
    const outrasReservas = reservasProcessadas.filter(r => r.data !== hojeStr);

    let htmlFinal = '';

    if (reservasHoje.length > 0 && filtroAtual === 'todos') {
        htmlFinal += `<div class="text-xs font-bold text-green-700 uppercase tracking-wider py-2 bg-green-50 px-2 rounded-md mb-2">Reservas para Hoje</div>`;
    }

    const montarItemHtml = (reserva) => `
        <div class="py-3 flex justify-between items-center text-sm border-b border-gray-100">
            <div>
                <p class="font-semibold text-gray-800">Lote/Casa: ${reserva.lote}</p>
                <p class="text-xs text-gray-500">Data: ${formatarDataBR(reserva.data)} às ${reserva.horario}</p>
            </div>
            <button onclick="excluirReserva(${reserva.id})" class="text-red-500 hover:text-red-700 text-xs font-medium">Excluir</button>
        </div>
    `;

    reservasHoje.forEach(reserva => {
        htmlFinal += montarItemHtml(reserva);
    });

    if (reservasHoje.length > 0 && outrasReservas.length > 0 && filtroAtual === 'todos') {
        htmlFinal += `<div class="text-xs font-bold text-gray-500 uppercase tracking-wider py-2 bg-gray-50 px-2 rounded-md mt-4 mb-2">Próximas Reservas</div>`;
    }

    outrasReservas.forEach(reserva => {
        htmlFinal += montarItemHtml(reserva);
    });

    container.innerHTML = htmlFinal;
}

function mudarFiltroReserva(nomeEspaco, tipoFiltro) {
    window.filtroReservaAtivo = tipoFiltro;
    renderizarReservasDoEspaco(nomeEspaco);
}
// Vinculado ao formulário de cadastro de reserva dentro dos detalhes do espaço
document.addEventListener('submit', function(event) {
    if (event.target && event.target.id === 'formReservas') {
        event.preventDefault();
        
        const novaReserva = {
            id: Date.now(),
            area: document.getElementById('reservaArea').value,
            data: document.getElementById('reservaData').value,
            horario: document.getElementById('reservaHora').value,
            lote: document.getElementById('reservaLote').value
        };

        reservas.push(novaReserva);
        localStorage.setItem('lista_reservas', JSON.stringify(reservas));
        
        // Se você tiver uma função de salvamento na nuvem, chame aqui:
        // if (typeof salvarNaNuvem === 'function') salvarNaNuvem();

        event.target.reset();
        document.getElementById('reservaArea').value = novaReserva.area; // Mantém a área selecionada
        renderizarReservasDoEspaco(novaReserva.area);
        renderizarEspacos();
    }
});
function excluirReserva(idReserva) {
    const senhaDigitada = prompt("Digite a senha de administrador para excluir esta reserva:");
    
    if (senhaDigitada === null) return; // Cancelado pelo usuário

    if (senhaDigitada === admin_pass) {
        const areaAtual = document.getElementById('reservaArea').value;
        reservas = reservas.filter(r => r.id !== idReserva);
        
        localStorage.setItem('lista_reservas', JSON.stringify(reservas));
        
        renderizarReservasDoEspaco(areaAtual);
        renderizarEspacos();
        
        if (typeof salvarNaNuvem === 'function') {
            salvarNaNuvem(); // Sincroniza a exclusão com a nuvem
        }
        
        alert("Reserva excluída com sucesso!");
    } else {
        alert("Senha incorreta!");
    }
}
function limparReservasAntigas() {
    // Obtém a data atual no formato YYYY-MM-DD (compatível com a string salva no JSON)
    const hoje = new Date().toISOString().split('T')[0];

    // Filtra mantendo apenas as reservas cuja data seja hoje ou futura
    const reservasAtualizadas = reservas.filter(reserva => reserva.data >= hoje);

    // Se houve alguma remoção, atualiza o array global, o localStorage e o JSON
    if (reservasAtualizadas.length !== reservas.length) {
        reservas = reservasAtualizadas;
        localStorage.setItem('lista_reservas', JSON.stringify(reservas));
        
        // Se você tiver a função de salvar na nuvem, pode descomentar a linha abaixo:
        // if (typeof salvarNaNuvem === 'function') salvarNaNuvem();
        
        console.log("Reservas antigas removidas automaticamente.");
    }
}
function abrirModalNovoEspaco() {
    const modal = document.getElementById('modalNovoEspaco');
    if (modal) modal.classList.remove('hidden');
}

function fecharModalNovoEspaco() {
    const modal = document.getElementById('modalNovoEspaco');
    if (modal) modal.classList.add('hidden');
    const input = document.getElementById('nomeNovoEspaco');
    if (input) input.value = '';
}

function adicionarNovoEspaco(event) {
    event.preventDefault();
    const input = document.getElementById('nomeNovoEspaco');
    const novoNome = input ? input.value.trim() : '';

    if (novoNome && !espacos.some(e => e.toLowerCase() === novoNome.toLowerCase())) {
        espacos.push(novoNome);
        
        localStorage.setItem('lista_espacos', JSON.stringify(espacos));
        // if (typeof salvarNaNuvem === 'function') salvarNaNuvem();

        fecharModalNovoEspaco();
        renderizarEspacos();
    } else {
        alert('Este espaço já existe ou o nome é inválido.');
    }
}
        // editar morador
        
document.getElementById('formEditar').addEventListener('submit', (e) => {
    e.preventDefault();
    const senhaInformada = prompt("Digite a senha para salvar as alterações do morador:");
    if (senhaInformada === admin_pass) {
        const id = parseInt(document.getElementById('editId').value);
        moradores = moradores.map(m => m.id === id ? { 
            id, 
            casa: document.getElementById('editCasa').value, 
            nome: document.getElementById('editNome').value, 
            telefone: document.getElementById('editTelefone').value 
        } : m);
        
        // 1. Salva localmente
        localStorage.setItem('lista_condominio', JSON.stringify(moradores));
        
        // 2. Fecha o modal e atualiza a tela
        fecharModal();
        renderizar();
        
        // 3. Sincroniza as alterações com a nuvem (JSONBin)
        salvarNaNuvem();
        
        alert("Morador atualizado com sucesso.");
    } else if (senhaInformada !== null) {
        alert("Senha incorreta! As alterações foram canceladas.");
    }
});

document.getElementById('formCadastro').addEventListener('submit', (e) => {
    e.preventDefault();
    
    // 1. Adiciona o novo morador na lista
    moradores.push({ 
        id: Date.now(), 
        casa: document.getElementById('numeroCasa').value, 
        nome: document.getElementById('nomeMorador').value, 
        telefone: document.getElementById('telefoneMorador').value 
    });
    
    // 2. Salva localmente
    localStorage.setItem('lista_condominio', JSON.stringify(moradores));
    
    // 3. Reseta o formulário e muda para a aba de busca
    e.target.reset();
    mudarAba('busca');
    
    // 4. Sincroniza automaticamente com a nuvem (JSONBin)
    salvarNaNuvem();
});

        function excluirMorador(id) {
    const senhaInformada = prompt("Digite a senha para excluir este morador:");
    if (senhaInformada === admin_pass) {
        // 1. Remove o morador da lista local
        moradores = moradores.filter(m => m.id !== id);
        
        // 2. Salva no localStorage
        localStorage.setItem('lista_condominio', JSON.stringify(moradores));
        
        // 3. Atualiza a interface
        renderizar();
        
        // 4. Envia a lista atualizada direto para o JSONBin (nuvem)
        salvarNaNuvem();

        alert("Morador excluído com sucesso e sincronizado na nuvem!");
    } else if (senhaInformada !== null) {
        alert("Senha incorreta! A exclusão foi cancelada.");
    }
}


// --- Encomendas ---
document.addEventListener('submit', (e) => {
    if (e.target && e.target.id === 'formEncomendas') {
        e.preventDefault();
        
        const dataAtual = new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
        
        encomendas.push({
            id: Date.now(),
            casa: document.getElementById('encomendaCasa').value,
            destinatario: document.getElementById('encomendaDestinatario').value,
            idPacote: document.getElementById('encomendaIdPacote').value,
            dataChegada: dataAtual,
            retiradoPor: null,
            dataRetirada: null
        });
        
        localStorage.setItem('lista_encomendas', JSON.stringify(encomendas));
       
        renderizarEncomendas();
        // fecharModalEncomenda();
        
        // Sincroniza com a nuvem
        salvarNaNuvem();
            
        // --- ADIÇÃO / AJUSTE SOLICITADO ---
        const inputIdPacote = document.getElementById('encomendaIdPacote');
        inputIdPacote.value = ''; // Limpa apenas o ID do pacote
        inputIdPacote.focus();    // Seleciona/foca automaticamente no input do ID da encomenda
        
        // Nota: A casa e o morador (<select>) NÃO são limpos, mantendo os valores na tela.
    }
});

function selecionarCasa(casaId) {
    // 1. Define o valor no input da casa
    document.getElementById('encomendaCasa').value = casaId;
    
    // 2. Busca os moradores daquela casa (exemplo de array/função do seu projeto)
    const moradoresDaCasa = buscarMoradoresPorCasa(casaId); 
    
    // 3. Preenche o select de destinatários
    const selectDestinatario = document.getElementById('encomendaDestinatario');
    selectDestinatario.innerHTML = '<option value="">Selecione o destinatário...</option>';
    
    moradoresDaCasa.forEach(morador => {
        const option = document.createElement('option');
        option.value = morador.nome; // ou ID do morador
        option.textContent = morador.nome;
        selectDestinatario.appendChild(option);
    });
    
    // 4. Habilita o select
    selectDestinatario.disabled = false;
    
    // 5. Fecha o modal de casas
    fecharModalCasas();
}


    function atualizarVisualizacaoRapida(pendentes) {
    const container = document.getElementById('visualizacaoRapidaCasas');
    if (!container) return;

    const casasPendentes = [...new Set(pendentes.map(e => e.casa))];
    casasPendentes.sort((a, b) => a.localeCompare(b, undefined, {numeric: true}));

    if (casasPendentes.length === 0) {
        container.innerHTML = "Nenhuma encomenda pendente.";
        container.className = "text-gray-400 italic text-sm bg-green-50 p-3 rounded-lg border border-green-200 min-h-[50px] flex items-center";
    } else {
        const cardsHTML = casasPendentes.map(casa => `
       <button type="button" 
    onclick="selecionarCasaEVoltarAoTopo('${casa}')"
    class="bg-orange-500 hover:bg-orange-600 text-white font-bold py-1 px-2 rounded shadow-sm transition-all duration-200 text-xl cursor-pointer min-w-[50px] text-center">
    ${casa}
</button>

                
        `).join("");

        container.innerHTML = cardsHTML;
        // Alterado para justify-start e gap-1.5 para ficarem bem próximos e alinhados à esquerda
        container.className = "flex flex-wrap justify-start gap-1.5 bg-green-50 p-2.5 rounded-lg border border-green-200 min-h-[50px] items-center";
    }
}

function selecionarCasaEVoltarAoTopo(casa) {
    const inputBusca = document.getElementById('buscaEncomendas');
    
    // Atualiza o valor e dispara o evento
    inputBusca.value = casa;
    inputBusca.dispatchEvent(new Event('input'));
    
    // Remove o foco para o navegador não puxar a tela de volta para o input
    inputBusca.blur(); 
    
    // Rola suavemente até o topo após um breve intervalo
    setTimeout(() => {
        inputBusca.scrollIntoView({ top: 0, behavior: 'smooth' });
    }, 50);
}


function renderizarEncomendas() {
    const lista = document.getElementById('listaEncomendas');
    if(!lista) return;

    const termo = document.getElementById('buscaEncomendas')?.value.toLowerCase().trim() || '';
    
    const todasPendentes = encomendas.filter(enc => enc.retiradoPor == null);
    atualizarVisualizacaoRapida(todasPendentes);

    let ehBuscaPorCasaExata = false;

    const pendentesFiltradas = todasPendentes.filter(enc => {
        // Se o campo de busca estiver vazio, mostra todas as pendentes por padrão
        if (termo === '') return true;

        const casasUnicas = [...new Set(todasPendentes.map(e => e.casa.toLowerCase()))];
        const éNumeroDeCasaExato = casasUnicas.includes(termo);

        if (éNumeroDeCasaExato) {
            ehBuscaPorCasaExata = true; // Identifica que é uma busca exclusiva por casa
            return enc.casa.toLowerCase() === termo;
        } else {
            const destinatarioInclui = enc.destinatario.toLowerCase().includes(termo);
            const idInclui = enc.idPacote.toLowerCase().includes(termo);
            return destinatarioInclui || idInclui;
        }
    });

    if (pendentesFiltradas.length === 0) {
        lista.innerHTML = `<div class="p-4 text-center text-gray-400 italic">Nenhuma encomenda pendente encontrada.</div>`;
        return;
    }

    let html = '';
    
    // O botão "Entregar Todos" SÓ APARECE se houver uma busca ativa por casa exata
    if (ehBuscaPorCasaExata && pendentesFiltradas.length > 0) {
        const idsFiltrados = pendentesFiltradas.map(enc => enc.id).join(',');
        html += `
            <div class="p-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                <span class="text-xs font-bold text-gray-500">${pendentesFiltradas.length} encomenda(s) para esta casa</span>
                <button onclick="retirarVariasEncomendas([${idsFiltrados}])" class="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm transition-colors">
                    <i data-lucide="check-check" class="w-4 h-4"></i> Entregar Todos (Desta Casa)
                </button>
            </div>
        `;
    }

    pendentesFiltradas.forEach(enc => {
        html += `
            <div class="p-4 flex justify-between items-center group bg-white border-b border-gray-100 last:border-none">
                <div>
                    <span class="text-[10px] text-gray-400 font-bold uppercase">Casa / Lote</span>
                    <span class="text-xl text-green-700 font-bold uppercase block">${enc.casa}</span>
                    <p class="font-bold text-gray-800 text-md mt-1">Destinatário: ${enc.destinatario}</p>
                    <p class="text-sm text-gray-600">Pacote / ID: <span class="font-mono bg-gray-100 px-1 rounded">${enc.idPacote}</span></p>
                    <p class="text-xs text-gray-400 mt-1"><i data-lucide="clock" class="w-3 h-3 inline mr-1"></i>Chegada: ${enc.dataChegada}</p>
                </div>
                <div class="flex flex-col gap-2 items-end">
                    <button onclick="retirarEncomenda(${enc.id})" class="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1 shadow-sm transition-colors" title="Dar baixa na encomenda">
                        <i data-lucide="check" class="w-4 h-4"></i> Dar Baixa
                    </button>
                    <button onclick="excluirEncomenda(${enc.id})" class="text-gray-400 hover:text-red-600 text-xs transition-colors p-1" title="Excluir Registro (Exige Senha)">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>`;
    });
    
    lista.innerHTML = html;
    lucide.createIcons();
}


function retirarVariasEncomendas(ids) {
    if (!ids || ids.length === 0) return;

    if (confirm(`Deseja realmente dar baixa em todas as ${ids.length} encomendas exibidas?`)) {
        const retiradoPor = prompt('Digite o nome de quem está retirando:');
        
        if (!retiradoPor || retiradoPor.trim() === '') {
            alert('A operação foi cancelada. O nome de quem retira é obrigatório.');
            return;
        }

        // Mantém o mesmo padrão de data da função individual
        const dataHoraAtual = new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});

        encomendas = encomendas.map(enc => {
            if (ids.includes(enc.id)) {
                return { 
                    ...enc, 
                    retiradoPor: retiradoPor.trim(),
                    dataRetirada: dataHoraAtual 
                };
            }
            return enc;
        });

        // Salva no localStorage
        localStorage.setItem('lista_encomendas', JSON.stringify(encomendas));

        // Atualiza as telas
        renderizarEncomendas();
        if (typeof renderizarHistorico === 'function') {
            renderizarHistorico();
        }

        // Envia os dados para a nuvem (mesma função usada na baixa individual)
        if (typeof salvarNaNuvem === 'function') {
            salvarNaNuvem();
        } else if (typeof salvarDados === 'function') {
            salvarDados();
        }
    }
}
    


// Garanta que esta função está no escopo global (fora de qualquer outra função)

function retirarEncomenda(id) {

    const nomeRetirante = prompt("Digite o nome de quem está retirando a encomenda:");

    if (nomeRetirante !== null && nomeRetirante.trim() !== "") {

        const dataRetiradaAtual = new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});

        

        encomendas = encomendas.map(enc => {

            if (enc.id === id) {

                return { ...enc, retiradoPor: nomeRetirante.trim(), dataRetirada: dataRetiradaAtual };

            }

            return enc;

        });

        

        localStorage.setItem('lista_encomendas', JSON.stringify(encomendas));

        renderizarEncomendas();

        renderizarHistorico();

        

        // Sincroniza a baixa da encomenda com a nuvem (JSONBin)

        salvarNaNuvem();

    }

}



// Garanta que esta também está no escopo global

function excluirEncomenda(id) {

    const senhaInformada = prompt("Digite a senha para excluir esta encomenda:");

    if (senhaInformada === admin_pass) {

        encomendas = encomendas.filter(e => e.id !== id);

        

        localStorage.setItem('lista_encomendas', JSON.stringify(encomendas));

        renderizarEncomendas();

        renderizarHistorico();

        

        // Sincroniza a exclusão com a nuvem (JSONBin)

        salvarNaNuvem();

        

        alert("Encomenda excluída com sucesso.");

    } else if (senhaInformada !== null) {

        alert("Senha incorreta! A exclusão foi cancelada.");

    }

}


let filtroAtualHistorico = 'todos'; // Variável de controle para o filtro ativo

function definirFiltroHistorico(tipo) {
    filtroAtualHistorico = tipo;
    renderizarHistorico();
}

function renderizarHistorico() {
    const lista = document.getElementById('listaHistorico');
    if(!lista) return;

    const termo = document.getElementById('buscaHistorico')?.value.toLowerCase() || '';
    
    // 1. Filtra os entregues e aplica a busca
    let entregues = encomendas.filter(enc => enc.retiradoPor != null && (
        enc.casa.toLowerCase().includes(termo) || 
        enc.destinatario.toLowerCase().includes(termo) || 
        enc.idPacote.toLowerCase().includes(termo) ||
        enc.retiradoPor.toLowerCase().includes(termo)
    ));

    // 2. Aplica o filtro de data (Hoje vs Todos) baseado na data de retirada ou chegada (ajuste conforme a propriedade de data usada no registro)
    if (filtroAtualHistorico === 'hoje') {
        const hoje = new Date().toLocaleDateString('pt-BR'); // Formato DD/MM/AAAA comum no Brasil, ou ajuste para enc.dataRetirada se estiver nesse formato
        entregues = entregues.filter(enc => enc.dataRetirada && enc.dataRetirada.includes(hoje));
    }

    // 3. Ordena os mais recentes em cima (decrescente por ID ou data)
    entregues.sort((a, b) => b.id - a.id);

    if (entregues.length === 0) {
        lista.innerHTML = `<div class="p-4 text-center text-gray-400 italic">Nenhum histórico encontrado.</div>`;
        return;
    }

    let html = '';
    entregues.forEach(enc => {
        html += `
            <div class="p-4 flex justify-between items-center group bg-gray-50 opacity-90">
                <div>
                    <span class="text-[10px] text-gray-400 font-bold uppercase">Casa / Lote</span>
                    <span class="text-xl text-green-700 font-bold uppercase block">${enc.casa}</span>
                    <p class="font-bold text-gray-800 text-md mt-1">Destinatário: ${enc.destinatario}</p>
                    <p class="text-sm text-gray-600">Pacote / ID: <span class="font-mono bg-gray-100 px-1 rounded">${enc.idPacote}</span></p>
                    <p class="text-xs text-gray-400 mt-1"><i data-lucide="clock" class="w-3 h-3 inline mr-1"></i>Chegada: ${enc.dataChegada}</p>
                    <p class="text-xs text-green-700 font-bold mt-1"><i data-lucide="check-circle" class="w-3 h-3 inline mr-1"></i>Retirado por ${enc.retiradoPor} em ${enc.dataRetirada}</p>
                </div>
                <div>
                    <button onclick="excluirEncomenda(${enc.id})" class="text-gray-400 hover:text-red-600 text-xs transition-colors p-1" title="Excluir Registro (Exige Senha)">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>`;
    });
    lista.innerHTML = html;
    lucide.createIcons();
}


// --- Notas ---
document.getElementById('formNotas').addEventListener('submit', (e) => {
    e.preventDefault();
    
    // 1. Adiciona a nova nota na lista
    notas.push({ 
        id: Date.now(), 
        casa: document.getElementById('notaCasa').value, 
        texto: document.getElementById('notaTexto').value 
    });
    
    // 2. Salva localmente
    localStorage.setItem('lista_notas', JSON.stringify(notas));
    
    // 3. Limpa o formulário e atualiza a tela
    e.target.reset();
    renderizarNotas();
    
    // 4. Sincroniza automaticamente com a nuvem (JSONBin)
    salvarNaNuvem();
});

        function abrirModalNota(id) {
            const nota = notas.find(n => n.id === id);
            if (!nota) return;
            document.getElementById('editNotaId').value = nota.id;
            document.getElementById('editNotaCasa').value = nota.casa;
            document.getElementById('editNotaTexto').value = nota.texto;
            document.getElementById('modalEdicaoNota').classList.remove('hidden');
        }

        function fecharModalNota() {
            document.getElementById('modalEdicaoNota').classList.add('hidden');
        }
document.getElementById('formEditarNota').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = parseInt(document.getElementById('editNotaId').value);
    
    notas = notas.map(n => n.id === id ? {
        id,
        casa: document.getElementById('editNotaCasa').value,
        texto: document.getElementById('editNotaTexto').value
    } : n);
    
    // 1. Salva localmente
    localStorage.setItem('lista_notas', JSON.stringify(notas));
    
    // 2. Fecha o modal e atualiza a tela
    fecharModalNota();
    renderizarNotas();
    
    // 3. Sincroniza a alteração na nuvem (JSONBin)
    salvarNaNuvem();
    
    alert("Anotação atualizada com sucesso.");
});

function excluirNota(id) {
    // Removida a senha: apaga direto
    notas = notas.filter(n => n.id !== id);
    
    // Salva localmente
    localStorage.setItem('lista_notas', JSON.stringify(notas));
    
    // Atualiza a tela
    renderizarNotas();
    
    // Sincroniza a remoção com a nuvem (JSONBin)
    salvarNaNuvem();
}

        

        function renderizarNotas() {
            const lista = document.getElementById('listaNotas');
            if(!lista) return;
            let html = '';
            notas.forEach(n => {
                html += `
                    <div class="p-4 flex justify-between items-center group">
                        <div>
                            <p class="font-bold text-blue-900">Casa ${n.casa}</p>
                            <p class="text-gray-700 mt-1">${n.texto}</p>
                        </div>
                        <div class="flex gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button onclick="abrirModalNota(${n.id})" class="p-2 text-gray-400 hover:text-blue-600 transition-colors" title="Editar Anotação">
                                <i data-lucide="pencil" class="w-4 h-4"></i>
                            </button>
                            <button onclick="excluirNota(${n.id})" class="p-2 text-gray-400 hover:text-red-600 transition-colors" title="Apagar Anotação">
                                <i data-lucide="trash-2" class="w-4 h-4"></i>
                            </button>
                        </div>
                    </div>`;
            });
            lista.innerHTML = html || `<div class="p-4 text-center text-gray-400 italic">Nenhuma anotação.</div>`;
            lucide.createIcons();
        }

// --- Reservas ---
document.getElementById('formReservas').addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Adiciona a nova reserva na lista
    reservas.push({
        id: Date.now(),
        area: document.getElementById('reservaArea').value,
        data: document.getElementById('reservaData').value,
        horario: document.getElementById('reservaHora').value,
        lote: document.getElementById('reservaLote').value
    });
    
    // Salva localmente
    localStorage.setItem('lista_reservas', JSON.stringify(reservas));
    e.target.reset();
    
    
    // Sincroniza automaticamente com a nuvem (JSONBin)
    salvarNaNuvem();
});


        let timerBusca;


   function renderizar() {
    clearTimeout(timerBusca);
        
    timerBusca = setTimeout(() => {
        const lista = document.getElementById('listaMoradores');
        if(!lista) return;
        
        const termoBusca = document.getElementById('busca').value.trim().toLowerCase();
        
        const moradoresFiltrados = moradores.filter(m => {
            if (!termoBusca) return true;
            const casaStr = m.casa.toLowerCase();
            const nomeStr = m.nome.toLowerCase();

            if (termoBusca.length === 1 && /^[a-z]$/.test(termoBusca)) {
                return nomeStr.some(palavra => palavra.startsWith(termoBusca));
            }
                
            return casaStr === termoBusca || 
                   casaStr.startsWith(termoBusca + ' ') || 
                   nomeStr.includes(termoBusca);
        });

        const limiteExibicao = moradoresFiltrados;
        let html = '';

        limiteExibicao.sort((a,b) => a.casa.localeCompare(b.casa, undefined, {numeric: true}))
            .forEach(m => {
                html += `
                    <div class="p-4 flex justify-between items-center group">
                        <div>
                            <span class="text-[10px] text-gray-400 font-bold uppercase">Casa</span>
                            <span class="text-xl text-red-400 font-bold uppercase">${m.casa}</span>
                            <p class="font-bold text-gray-800 text-lg mb-2">${m.nome}</p>
                            <a href="tel:${m.telefone}" class="text-sm text-green-700 rounded-sm px-2 ring-1">${m.telefone || 'Sem tel'}</a>
                        </div>
                        <div class="flex gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button onclick="abrirModal(${m.id})" class="p-2 text-gray-400 hover:text-blue-600 transition-colors" title="Editar Morador (Exige Senha)"><i data-lucide="pencil" class="w-4 h-4"></i></button>
                            <button onclick="excluirMorador(${m.id})" class="p-2 text-gray-400 hover:text-red-600 transition-colors" title="Excluir Morador (Exige Senha)"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                        </div>
                    </div>`;
        });

        lista.innerHTML = html;
        lucide.createIcons();
    }, 50);
}

  // Garanta que a variável global exista no início do app.js:
// let reservas_salao = JSON.parse(localStorage.getItem('lista_reservas_salao')) || [];

function renderizarReservasSalao() {
    const container = document.getElementById('listaReservasSalao');
    if (!container) return;
    container.innerHTML = '';

    if (!reservas_salao || reservas_salao.length === 0) {
        container.innerHTML = `<p class="text-sm text-gray-400 py-3">Nenhuma reserva cadastrada para o Salão de Festas.</p>`;
        return;
    }

    // Ordena da mais próxima para a mais distante
    reservas_salao.sort((a, b) => {
        const dataA = new Date(`${a.data}T${a.horario || '00:00'}`);
        const dataB = new Date(`${b.data}T${b.horario || '00:00'}`);
        return dataA - dataB;
    });

    // Injeta os botões de filtro no topo da lista se já não existirem
    let filtroContainer = document.getElementById('filtroReservasSalaoContainer');
    if (!filtroContainer) {
        filtroContainer = document.createElement('div');
        filtroContainer.id = 'filtroReservasSalaoContainer';
        filtroContainer.className = 'flex gap-2 mb-3';
        filtroContainer.innerHTML = `
            <button onclick="mudarFiltroReservaSalao('todos')" id="btnFiltroSalao-todos" class="px-3 py-1 text-xs font-semibold rounded-lg bg-green-600 text-white transition-colors">Todas</button>
            <button onclick="mudarFiltroReservaSalao('hoje')" id="btnFiltroSalao-hoje" class="px-3 py-1 text-xs font-semibold rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">Hoje</button>
            <button onclick="mudarFiltroReservaSalao('mes')" id="btnFiltroSalao-mes" class="px-3 py-1 text-xs font-semibold rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">Este Mês</button>
        `;
        container.parentNode.insertBefore(filtroContainer, container);
    }

    // Recupera o filtro atual (padrão 'todos')
    const filtroAtual = window.filtroReservaSalaoAtivo || 'todos';
    
    // Atualiza o estilo visual dos botões
    ['todos', 'hoje', 'mes'].forEach(f => {
        const btn = document.getElementById(`btnFiltroSalao-${f}`);
        if (btn) {
            if (f === filtroAtual) {
                btn.className = "px-3 py-1 text-xs font-semibold rounded-lg bg-green-600 text-white transition-colors";
            } else {
                btn.className = "px-3 py-1 text-xs font-semibold rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors";
            }
        }
    });

    const hojeStr = new Date().toISOString().split('T')[0];
    const anoMesAtual = hojeStr.substring(0, 7); // "YYYY-MM"

    // Aplica o filtro selecionado
    const reservasProcessadas = reservas_salao.filter(reserva => {
        if (filtroAtual === 'hoje') return reserva.data === hojeStr;
        if (filtroAtual === 'mes') return reserva.data.startsWith(anoMesAtual);
        return true;
    });

    if (reservasProcessadas.length === 0) {
        container.innerHTML = `<p class="text-sm text-gray-400 py-3">Nenhuma reserva encontrada para este filtro.</p>`;
        return;
    }

    // Separa as de hoje das demais para o separador visual
    const reservasHoje = reservasProcessadas.filter(r => r.data === hojeStr);
    const outrasReservas = reservasProcessadas.filter(r => r.data !== hojeStr);

    let htmlFinal = '';

    if (reservasHoje.length > 0 && filtroAtual === 'todos') {
        htmlFinal += `<div class="text-xs font-bold text-green-700 uppercase tracking-wider py-2 bg-green-50 px-2 rounded-md mb-2">Reservas para Hoje</div>`;
    }

    const montarItemHtml = (reserva) => `
        <div class="py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b border-gray-100 text-sm">
            <div>
                <h5 class="font-bold text-gray-800 text-base">${reserva.titulo}</h5>
                <p class="text-xs text-gray-600 font-medium">Morador: ${reserva.morador} (Lote/Casa: ${reserva.lote})</p>
                <p class="text-xs text-gray-500">Data: ${formatarDataBR(reserva.data)} às ${reserva.horario}</p>
                <p class="text-xs text-green-700 mt-1"><strong>Serviços:</strong> ${reserva.servicos || 'Nenhum informado'}</p>
                <p class="text-xs text-gray-500 mt-1"><strong>Convidados:</strong> ${reserva.convidados ? reserva.convidados.replace(/\n/g, ', ') : 'Nenhum listado'}</p>
            </div>
            <button onclick="excluirReservaSalao(${reserva.id})" class="text-red-500 hover:text-red-700 text-xs font-semibold bg-red-50 px-3 py-1.5 rounded-lg transition-colors">Excluir</button>
        </div>
    `;

    reservasHoje.forEach(reserva => {
        htmlFinal += montarItemHtml(reserva);
    });

    if (reservasHoje.length > 0 && outrasReservas.length > 0 && filtroAtual === 'todos') {
        htmlFinal += `<div class="text-xs font-bold text-gray-500 uppercase tracking-wider py-2 bg-gray-50 px-2 rounded-md mt-4 mb-2">Próximas Reservas</div>`;
    }

    outrasReservas.forEach(reserva => {
        htmlFinal += montarItemHtml(reserva);
    });

    container.innerHTML = htmlFinal;
}

function mudarFiltroReservaSalao(tipoFiltro) {
    window.filtroReservaSalaoAtivo = tipoFiltro;
    renderizarReservasSalao();
}

function abrirModalNovaReservaSalao() {
    document.getElementById('modalReservaSalao').classList.remove('hidden');
}

function fecharModalReservaSalao() {
    document.getElementById('modalReservaSalao').classList.add('hidden');
    document.getElementById('formReservaSalao').reset();
}

function salvarReservaSalao(event) {
    event.preventDefault();

    const novaReserva = {
        id: Date.now(),
        lote: document.getElementById('salaoLote').value,
        morador: document.getElementById('salaoMorador').value,
        titulo: document.getElementById('salaoTitulo').value,
        data: document.getElementById('salaoData').value,
        horario: document.getElementById('salaoHora').value,
        servicos: document.getElementById('salaoServicos').value,
        convidados: document.getElementById('salaoConvidados').value
    };

    reservas_salao.push(novaReserva);
    localStorage.setItem('lista_reservas_salao', JSON.stringify(reservas_salao));
    
    // Se utilizar sincronização em nuvem:
    if (typeof salvarNaNuvem === 'function') salvarNaNuvem();

    fecharModalReservaSalao();
    renderizarReservasSalao();
}

function excluirReservaSalao(id) {
    const senhaDigitada = prompt("Digite a senha de administração para excluir esta reserva:");
    
    // Altere '1234' para a senha desejada do seu sistema
    if (senhaDigitada === null) return; // Cancelado pelo usuário
    
    if (senhaDigitada !== admin_pass) {
        alert("Senha incorreta! A exclusão foi cancelada.");
        return;
    }

    if (confirm("Deseja realmente cancelar esta reserva do salão de festas?")) {
        reservas_salao = reservas_salao.filter(r => r.id !== id);
        localStorage.setItem('lista_reservas_salao', JSON.stringify(reservas_salao));
        
        if (typeof salvarNaNuvem === 'function') salvarNaNuvem();
        
        renderizarReservasSalao();
    }
}
function formatarDataBR(dataStr) {
    if (!dataStr) return '';
    // Se a data vier no formato AAAA-MM-DD (ex: 2026-07-15)
    if (dataStr.includes('-')) {
        const partes = dataStr.split('-');
        if (partes.length === 3) {
            return `${partes[2]}/${partes[1]}/${partes[0]}`;
        }
    }
    return dataStr;
}

        
    // Assim que o site abre no celular ou computador, ele busca os dados atualizados
window.addEventListener('DOMContentLoaded', () => {
    carregarDaNuvem();
});

        renderizar();
        renderizarEncomendas();
        renderizarHistorico();
        renderizarEspacos();
        renderizarNotas();
        lucide.createIcons();
    
