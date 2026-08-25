        // Suas credenciais do JSONBin
        const BIN_ID = '6a8ca917da38895dfe0c130b';
        const MASTER_KEY = '$2a$10$dQGLRurlOEnFFy4JdgxjxOLObuCSsZflIg.lBeAR.nzdcGdOHgIjq';
        
        // Suas credenciais do JSONBin (já configuradas)
async function salvarNaNuvem() {
    try {
        // Monta o objeto completo de backup com todas as suas listas atuais
        const dadosCompletos = {
            moradores: typeof moradores !== 'undefined' ? moradores : [],
            notas: typeof notas !== 'undefined' ? notas : [],
            reservas: typeof reservas !== 'undefined' ? reservas : [],
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
        
        // Opcional: um aviso sutil ou alerta na tela
       // alert("Alterações salvas na nuvem com sucesso!");

    } catch (error) {
        console.error("Erro:", error);
        alert("Erro ao tentar salvar os dados na nuvem.");
    }
}

        // 1. CARREGAR OS DADOS (Use quando a página abrir)
        
        let moradores = JSON.parse(localStorage.getItem('lista_condominio')) || [];
        let notas = JSON.parse(localStorage.getItem('lista_notas')) || [];
        let reservas = JSON.parse(localStorage.getItem('lista_reservas')) || [];
        let encomendas = JSON.parse(localStorage.getItem('lista_encomendas')) || [];
        let espacos = JSON.parse(localStorage.getItem('lista_espacos')) || ['Salão de Festas'];
        let contextoModalCasa = 'busca';
        


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

        function mudarAba(aba) {
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

            toggleMenu();
            renderizar(); renderizarNotas(); renderizarEncomendas(); renderizarHistorico(); renderizarEspacosSelect(); renderizarEspacosGerencia(); renderizarReservas();
            lucide.createIcons();
        }

        function exportarDados() {
            const dadosCompletos = {
                moradores: moradores,
                notas: notas,
                reservas: reservas,
                encomendas: encomendas,
                espacos: espacos
            };
        
            const dadosStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dadosCompletos, null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dadosStr);
            downloadAnchor.setAttribute("download", "backup_sistema_condominio.json");
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
        }

// Suas credenciais do JSONBin

async function carregarDaNuvem() {
    try {
        // Mostra um aviso opcional de carregando (se quiser)
        console.log("Baixando dados da nuvem...");

        const resposta = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
            headers: {
                'X-Master-Key': MASTER_KEY
            }
        });

        if (!resposta.ok) throw new Error('Erro ao carregar da nuvem');

        const resultado = await resposta.json();
        const dados = resultado.record; // Aqui está o objeto JSON vindo do JSONBin

        // Compatibilidade com arquivos antigos (apenas array de moradores)
        if (Array.isArray(dados)) {
            moradores = dados;
            localStorage.setItem('lista_condominio', JSON.stringify(moradores));
            renderizar();
           // alert("Moradores carregados da nuvem com sucesso!");
            return;
        }

        // Novo formato completo de backup (igualzinho ao seu código original)
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
                localStorage.setItem('lista_reservas', JSON.stringify(reservas));
            }
            if (Array.isArray(dados.encomendas)) {
                encomendas = dados.encomendas;
                localStorage.setItem('lista_encomendas', JSON.stringify(encomendas));
            }
            if (Array.isArray(dados.espacos)) {
                espacos = dados.espacos;
                localStorage.setItem('lista_espacos', JSON.stringify(espacos));
            }

            // Atualiza todas as telas do seu sistema de condomínio
            if (typeof renderizar === 'function') renderizar();
            if (typeof renderizarNotas === 'function') renderizarNotas();
            if (typeof renderizarEncomendas === 'function') renderizarEncomendas();
            if (typeof renderizarHistorico === 'function') renderizarHistorico();
            if (typeof renderizarEspacosSelect === 'function') renderizarEspacosSelect();
            if (typeof renderizarEspacosGerencia === 'function') renderizarEspacosGerencia();
            if (typeof renderizarReservas === 'function') renderizarReservas();

            console.log("Dados sincronizados com sucesso!");
        } else {
            alert("Os dados da nuvem não têm o formato esperado.");
        }

    } catch (error) {
        console.error("Erro:", error);
        alert("Erro ao conectar com a nuvem para carregar os dados.");
    }
}


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
            if (contextoModalCasa === 'encomenda') {
                document.getElementById('encomendaCasa').value = casa;
                const moradorEncontrado = moradores.find(m => m.casa.toLowerCase() === casa.toLowerCase());
                if (moradorEncontrado) {
                    document.getElementById('encomendaDestinatario').value = moradorEncontrado.nome;
                }
            } else {
                document.getElementById('busca').value = casa;
                renderizar();
            }
            fecharModalCasas();
        }

        function abrirModalLetras() {
            const grid = document.getElementById('gridLetras');
            grid.innerHTML = '';
            "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").forEach(letra => {
                grid.innerHTML += `<button onclick="selecionarLetraBusca('${letra}')" class="bg-green-50 hover:bg-green-600 hover:text-white border border-green-200 text-green-800 font-bold p-3 rounded-xl transition-all text-center shadow-sm">${letra}</button>`;
            });
            document.getElementById('modalLetras').classList.remove('hidden');
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
    renderizarEspacosSelect();
    renderizarEspacosGerencia();
    fecharModalNovoEspaco();

    // Sincroniza todas as alterações (espaços e reservas) direto com a nuvem (JSONBin)
    salvarNaNuvem();
});

        function excluirEspaco(nome) {
    const senhaInformada = prompt("Digite a senha para excluir este espaço:");
    if (senhaInformada === "@granja123") {
        // 1. Filtra o array removendo o espaço
        espacos = espacos.filter(esp => esp !== nome);
        
        // 2. Salva localmente
        localStorage.setItem('lista_espacos', JSON.stringify(espacos));
        
        // 3. Atualiza as telas do sistema
        renderizarEspacosSelect();
        renderizarEspacosGerencia();
        
        // 4. Envia o estado atualizado direto para a nuvem (JSONBin)
        salvarNaNuvem();

        alert("Espaço excluído com sucesso e sincronizado na nuvem!");
    } else if (senhaInformada !== null) {
        alert("Senha incorreta! A exclusão foi cancelada.");
    }
}


        function renderizarEspacosSelect() {
            const select = document.getElementById('reservaArea');
            if(!select) return;
            select.innerHTML = '<option value="">Selecione o Espaço...</option>';
            espacos.forEach(espaco => { select.innerHTML += `<option value="${espaco}">${espaco}</option>`; });
        }

        function renderizarEspacosGerencia() {
            const lista = document.getElementById('listaEspacosGerencia');
            if (!lista) return;

            if (espacos.length === 0) {
                lista.innerHTML = `<div class="p-4 text-center text-gray-400 italic">Nenhum espaço cadastrado.</div>`;
                return;
            }

            let html = '';
            espacos.forEach(espaco => {
                html += `
                    <div class="p-4 flex justify-between items-center group bg-white">
                        <span class="font-bold text-green-800 text-lg">${espaco}</span>
                        <div class="flex gap-2">
                            <button onclick="abrirModalNovoEspaco('${espaco}')" class="p-2 text-gray-400 hover:text-blue-600 transition-colors" title="Editar Espaço">
                                <i data-lucide="pencil" class="w-4 h-4"></i>
                            </button>
                            <button onclick="excluirEspaco('${espaco}')" class="p-2 text-gray-400 hover:text-red-600 transition-colors" title="Excluir Espaço (Exige Senha)">
                                <i data-lucide="trash-2" class="w-4 h-4"></i>
                            </button>
                        </div>
                    </div>`;
            });
            lista.innerHTML = html;
            lucide.createIcons();
        }
        // editar morador
        
document.getElementById('formEditar').addEventListener('submit', (e) => {
    e.preventDefault();
    const senhaInformada = prompt("Digite a senha para salvar as alterações do morador:");
    if (senhaInformada === "@granja123") {
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
    if (senhaInformada === "@granja123") {
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
                fecharModal();
        // Sincroniza com a nuvem
        salvarNaNuvem();
            
    }
});

        function atualizarVisualizacaoRapida(pendentes) {
            const container = document.getElementById('visualizacaoRapidaCasas');
            if (!container) return;

            const casasPendentes = [...new Set(pendentes.map(e => e.casa))];
            casasPendentes.sort((a, b) => a.localeCompare(b, undefined, {numeric: true}));

            if (casasPendentes.length === 0) {
                container.innerHTML = "Nenhuma encomenda pendente.";
                container.className = "text-gray-400 italic text-sm bg-green-50 p-3 rounded-lg border border-green-200 min-h-[50px] flex items-center";
            } else {
                container.innerHTML = casasPendentes.join(", ");
                container.className = "text-green-900 font-extrabold text-xl tracking-wider bg-green-50 p-3 rounded-lg border border-green-200 min-h-[50px] flex items-center";
            }
        }

        function renderizarEncomendas() {
            const lista = document.getElementById('listaEncomendas');
            if(!lista) return;

            const termo = document.getElementById('buscaEncomendas')?.value.toLowerCase() || '';
            
            const todasPendentes = encomendas.filter(enc => enc.retiradoPor == null);
            atualizarVisualizacaoRapida(todasPendentes);

            const pendentesFiltradas = todasPendentes.filter(enc => 
                enc.casa.toLowerCase().includes(termo) || 
                enc.destinatario.toLowerCase().includes(termo) || 
                enc.idPacote.toLowerCase().includes(termo)
            );

            if (pendentesFiltradas.length === 0) {
                lista.innerHTML = `<div class="p-4 text-center text-gray-400 italic">Nenhuma encomenda pendente encontrada.</div>`;
                return;
            }

            let html = '';
            pendentesFiltradas.forEach(enc => {
                html += `
                    <div class="p-4 flex justify-between items-center group bg-white">
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

    if (senhaInformada === "@granja123") {

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


        function renderizarHistorico() {
            const lista = document.getElementById('listaHistorico');
            if(!lista) return;

            const termo = document.getElementById('buscaHistorico')?.value.toLowerCase() || '';
            const entregues = encomendas.filter(enc => enc.retiradoPor != null && (
                enc.casa.toLowerCase().includes(termo) || 
                enc.destinatario.toLowerCase().includes(termo) || 
                enc.idPacote.toLowerCase().includes(termo) ||
                enc.retiradoPor.toLowerCase().includes(termo)
            ));

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
    renderizarReservas();
    
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
    return nomeStr.split(' ').some(palavra => palavra.startsWith(termoBusca));
}

return casaStr === termoBusca || 
       casaStr.startsWith(termoBusca + ' ') || 
       nomeStr.includes(termoBusca);
                if (moradoresFiltrados.length === 0) {
                    lista.innerHTML = `<div class="p-4 text-center text-gray-400 italic">Nenhum morador encontrado.</div>`;
                    return;
                }

                const limiteExibicao = moradoresFiltrados
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

                if (moradoresFiltrados.length > 50) {
                    html += `<div class="p-3 text-center text-xs text-gray-400 bg-gray-50">Mostrando 50 de ${moradoresFiltrados.length} resultados. Refine a busca se necessário.</div>`;
                }

                lista.innerHTML = html;
                lucide.createIcons();
            }, 50);
        }

        function renderizarReservas() {
            const lista = document.getElementById('listaReservas');
            if(!lista) return;
            
            if (reservas.length === 0) {
                lista.innerHTML = `<div class="p-4 text-center text-gray-400 italic">Nenhuma reserva cadastrada.</div>`;
                return;
            }

            let html = '';
            reservas.forEach(r => {
                let dataFormatada = r.data;
                if(r.data) {
                    const partes = r.data.split('-');
                    if(partes.length === 3) dataFormatada = `${partes[2]}/${partes[1]}/${partes[0]}`;
                }

                html += `
                    <div class="p-4 flex justify-between items-center group">
                        <div>
                            <span class="text-[10px] text-gray-400 font-bold uppercase">Lote / Casa: ${r.lote}</span>
                            <p class="font-bold text-green-800 text-lg">${r.area}</p>
                            <p class="text-sm text-gray-600">
                                <i data-lucide="calendar" class="w-3.5 h-3.5 inline mr-1"></i>${dataFormatada || 'Sem data'} 
                                <i data-lucide="clock" class="w-3.5 h-3.5 inline ml-2 mr-1"></i>${r.horario}
                            </p>
                        </div>
                        <button onclick="excluirReserva(${r.id})" class="p-2 text-gray-400 hover:text-red-600 transition-colors opacity-60 group-hover:opacity-100" title="Excluir Reserva (Exige Senha)">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                    </div>`;
            });
            lista.innerHTML = html;
            lucide.createIcons();
        }
    // Assim que o site abre no celular ou computador, ele busca os dados atualizados
window.addEventListener('DOMContentLoaded', () => {
    carregarDaNuvem();
});

        renderizar();
        renderizarEncomendas();
        renderizarHistorico();
        renderizarEspacosSelect();
        renderizarEspacosGerencia();
        renderizarReservas();
        renderizarNotas();
        lucide.createIcons();
    
