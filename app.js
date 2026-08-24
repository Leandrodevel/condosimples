
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

        function importarDados(event) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const dados = JSON.parse(e.target.result);
                    
                    // Compatibilidade com arquivos antigos (apenas array de moradores)
                    if (Array.isArray(dados)) {
                        moradores = dados;
                        localStorage.setItem('lista_condominio', JSON.stringify(moradores));
                        renderizar();
                        alert("Moradores importados com sucesso!");
                        return;
                    }

                    // Novo formato completo de backup
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

                        renderizar();
                        renderizarNotas();
                        renderizarEncomendas();
                        renderizarHistorico();
                        renderizarEspacosSelect();
                        renderizarEspacosGerencia();
                        renderizarReservas();

                        alert("Backup completo importado com sucesso!");
                    } else {
                        alert("O arquivo JSON não tem o formato esperado.");
                    }
                } catch (error) {
                    alert("Erro ao ler o arquivo JSON.");
                }
                event.target.value = '';
            };
            reader.readAsText(file);
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

            localStorage.setItem('lista_espacos', JSON.stringify(espacos));
            renderizarEspacosSelect();
            renderizarEspacosGerencia();
            fecharModalNovoEspaco();
        });

        function excluirEspaco(nome) {
            const senhaInformada = prompt("Digite a senha para excluir este espaço:");
            if (senhaInformada === "@granja123") {
                espacos = espacos.filter(esp => esp !== nome);
                localStorage.setItem('lista_espacos', JSON.stringify(espacos));
                renderizarEspacosSelect();
                renderizarEspacosGerencia();
                alert("Espaço excluído com sucesso.");
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
                localStorage.setItem('lista_condominio', JSON.stringify(moradores));
                fecharModal();
                renderizar();
                alert("Morador atualizado com sucesso.");
            } else if (senhaInformada !== null) {
                alert("Senha incorreta! As alterações foram canceladas.");
            }
        });

        document.getElementById('formCadastro').addEventListener('submit', (e) => {
            e.preventDefault();
            moradores.push({ id: Date.now(), casa: document.getElementById('numeroCasa').value, nome: document.getElementById('nomeMorador').value, telefone: document.getElementById('telefoneMorador').value });
            localStorage.setItem('lista_condominio', JSON.stringify(moradores));
            e.target.reset();
            mudarAba('busca');
        });

        function excluirMorador(id) {
            const senhaInformada = prompt("Digite a senha para excluir este morador:");
            if (senhaInformada === "@granja123") {
                moradores = moradores.filter(m => m.id !== id);
                localStorage.setItem('lista_condominio', JSON.stringify(moradores));
                renderizar();
                alert("Morador excluído com sucesso.");
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
               // fecharModalEncomenda();
                renderizarEncomendas();
            }
        });

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
            }
        }

        function excluirEncomenda(id) {
            const senhaInformada = prompt("Digite a senha para excluir esta encomenda:");
            if (senhaInformada === "@granja123") {
                encomendas = encomendas.filter(e => e.id !== id);
                localStorage.setItem('lista_encomendas', JSON.stringify(encomendas));
                renderizarEncomendas();
                renderizarHistorico();
                alert("Encomenda excluída com sucesso.");
            } else if (senhaInformada !== null) {
                alert("Senha incorreta! A exclusão foi cancelada.");
            }
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
            notas.push({ id: Date.now(), casa: document.getElementById('notaCasa').value, texto: document.getElementById('notaTexto').value });
            localStorage.setItem('lista_notas', JSON.stringify(notas));
            e.target.reset();
            renderizarNotas();
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
            localStorage.setItem('lista_notas', JSON.stringify(notas));
            fecharModalNota();
            renderizarNotas();
            alert("Anotação atualizada com sucesso.");
        });

        function excluirNota(id) {
            // Removida a senha: apaga direto
            notas = notas.filter(n => n.id !== id);
            localStorage.setItem('lista_notas', JSON.stringify(notas));
            renderizarNotas();
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
            reservas.push({
                id: Date.now(),
                area: document.getElementById('reservaArea').value,
                data: document.getElementById('reservaData').value,
                horario: document.getElementById('reservaHora').value,
                lote: document.getElementById('reservaLote').value
            });
            localStorage.setItem('lista_reservas', JSON.stringify(reservas));
            e.target.reset();
            renderizarReservas();
        });

        function excluirReserva(id) {
            // Adicionada a exigência de senha
            const senhaInformada = prompt("Digite a senha para excluir esta reserva:");
            if (senhaInformada === "@granja123") {
                reservas = reservas.filter(r => r.id !== id);
                localStorage.setItem('lista_reservas', JSON.stringify(reservas));
                renderizarReservas();
                alert("Reserva excluída com sucesso.");
            } else if (senhaInformada !== null) {
                alert("Senha incorreta! A exclusão foi cancelada.");
            }
        }

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
                    return casaStr === termoBusca || casaStr.startsWith(termoBusca + ' ') || nomeStr.split(' ').some(palavra => palavra.startsWith(termoBusca));
                });

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

        renderizar();
        renderizarEncomendas();
        renderizarHistorico();
        renderizarEspacosSelect();
        renderizarEspacosGerencia();
        renderizarReservas();
        renderizarNotas();
        lucide.createIcons();
    
