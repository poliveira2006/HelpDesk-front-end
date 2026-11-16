import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api, fmt } from '../api.js';
import { useAuth } from '../auth.jsx';
import { useLookups } from '../hooks.js';
const R = ({ l, children }) => (
  <div className="row">
    <label>{l}</label>
    <div>{children}</div>
  </div>
);
const S = ({ k, src, l, blank, f, set, L }) => (
  <R l={l}>
    <select value={f[k]} onChange={set(k)}>
      <option value="">{blank}</option>
      {(L[src] || []).map((x) => (
        <option key={x.id} value={x.id}>
          {x.nome}
        </option>
      ))}
    </select>
  </R>
);
const empty = {
  titulo: '',
  descricao: '',
  prioridadeId: '',
  empresaId: '',
  areaId: '',
  responsavelId: '',
  sistemaId: '',
  categoriaId: '',
  comentario: '',
};
export default function NovoTicket() {
  const { user } = useAuth(),
    nav = useNavigate(),
    qc = useQueryClient(),
    { data: L = {} } = useLookups();
  const [f, setF] = useState(empty),
    [err, setErr] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const opts = (k) =>
    (L[k] || []).map((x) => (
      <option key={x.id} value={x.id}>
        {x.nome}
      </option>
    ));
  const create = useMutation({
    mutationFn: (b) => api('/tickets', { method: 'POST', body: b }),
    onError: (e) => setErr(e.message),
  });
  const save = (exit) => {
    const prio = f.prioridadeId || L.prioridades?.[0]?.id;
    if (
      !f.titulo ||
      !f.descricao ||
      !prio ||
      !f.empresaId ||
      !f.areaId ||
      !f.sistemaId ||
      !f.categoriaId
    )
      return setErr('Preencha os campos obrigatórios (*)');
    create.mutate(
      {
        titulo: f.titulo,
        descricao: f.descricao,
        prioridadeId: +prio,
        empresaId: +f.empresaId,
        areaId: +f.areaId,
        sistemaId: +f.sistemaId,
        categoriaId: +f.categoriaId,
        responsavelId: f.responsavelId ? +f.responsavelId : null,
        ...(f.comentario ? { comentario: f.comentario } : {}),
      },
      {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: ['tickets'] });
          if (exit) nav('/ativos');
          else {
            setF(empty);
            setErr('');
          }
        },
      },
    );
  };
  return (
    <>
      <div className="box">
        <h3>Dados do Novo Ticket</h3>
        <div className="body form">
          <R l="Título *">
            <input
              placeholder="Título do Ticket"
              value={f.titulo}
              onChange={set('titulo')}
            />
          </R>
          <R l="Descrição *">
            <textarea
              rows={4}
              placeholder="Descrição do Ticket"
              value={f.descricao}
              onChange={set('descricao')}
            />
          </R>
          <R l="Status">Aberto</R>
          <R l="Previsão inicial para solução">{fmt(Date.now() + 7 * 864e5)}</R>
          <R l="Prioridade *">
            <select
              value={f.prioridadeId || L.prioridades?.[0]?.id || ''}
              onChange={set('prioridadeId')}
            >
              {opts('prioridades')}
            </select>
          </R>
          <S
            f={f}
            set={set}
            L={L}
            k="empresaId"
            src="empresas"
            l="Empresa *"
            blank="Escolha a Empresa..."
          />
          <S f={f} set={set} L={L} k="areaId" src="areas" l="Área *" />
          <S
            f={f}
            set={set}
            L={L}
            k="responsavelId"
            src="usuarios"
            l="Atribuir Responsável"
          />
          <R l="Solicitante">{user.nome}</R>
          <S f={f} set={set} L={L} k="sistemaId" src="sistemas" l="Sistema *" />
          <S
            f={f}
            set={set}
            L={L}
            k="categoriaId"
            src="categorias"
            l="Categoria *"
          />
          <R l="Mensagens">
            <div className="callout">
              Por favor, anexe um documento ou print com a evidência da
              inconsistência.
            </div>
          </R>
          <R l={user.nome}>
            <textarea
              rows={3}
              placeholder="Adicionar comentário"
              value={f.comentario}
              onChange={set('comentario')}
            />
          </R>
          <div className="row">
            <span />
            <div>
              <button
                className="btn sec"
                onClick={() => {
                  setF(empty);
                  setErr('');
                }}
              >
                Limpar
              </button>{' '}
              <button className="btn" onClick={() => save(false)}>
                Salvar
              </button>{' '}
              <button className="btn" onClick={() => save(true)}>
                Salvar e Sair
              </button>
              <div className="err">{err}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
