import { useLookups } from '../hooks.js';
export default function Filters({ v, set, onApply }) {
  const { data: L = {} } = useLookups();
  const on = (n) => (e) => set({ ...v, [n]: e.target.value });
  const sel = (n, l, k, cls) => (
    <div key={n} className={cls}>
      <label>{l}</label>
      <select value={v[n] || ''} onChange={on(n)}>
        <option value="" />
        {(L[k] || []).map((x) => (
          <option key={x.id} value={x.id}>
            {x.nome}
          </option>
        ))}
      </select>
    </div>
  );
  const rng = (n, l) => (
    <div key={n}>
      <label>{l}</label>
      <div className="rng">
        <input type="date" value={v[n + 'De'] || ''} onChange={on(n + 'De')} />
        <span>até</span>
        <input
          type="date"
          value={v[n + 'Ate'] || ''}
          onChange={on(n + 'Ate')}
        />
      </div>
    </div>
  );
  return (
    <div className="body">
      <div className="grid">
        <div className="s3">
          <label>Título / Descrição / Mensagem</label>
          <input value={v.titulo || ''} onChange={on('titulo')} />
        </div>
        <div>
          <label>Número do Ticket</label>
          <input type="number" value={v.numero || ''} onChange={on('numero')} />
        </div>
        {rng('criacao', 'Data de Criação')}
        {rng('alteracao', 'Data de Alteração')}
        {rng('previsao', 'Data Previsão Solução')}
        <div>
          <label>Sem Previsão Solução</label>
          <input
            type="checkbox"
            style={{ width: 'auto' }}
            checked={!!v.semPrevisao}
            onChange={(e) => set({ ...v, semPrevisao: e.target.checked })}
          />
        </div>
        {sel('prioridade', 'Prioridade', 'prioridades')}
        {sel('status', 'Status', 'status')}
        {sel('empresa', 'Empresa', 'empresas')}
        {sel('area', 'Área', 'areas')}
        {sel('responsavel', 'Responsável', 'usuarios', 's2')}
        {sel('solicitante', 'Solicitante', 'usuarios', 's2')}
        {sel('sistema', 'Sistema', 'sistemas')}
        {sel('categoria', 'Categoria', 'categorias')}
        {sel('classificacao', 'Classificação', 'classificacoes')}
        {rng('resolucao', 'Data de Resolução')}
      </div>
      <div style={{ textAlign: 'right', marginTop: 10 }}>
        <button className="btn" onClick={onApply}>
          Filtrar
        </button>
      </div>
    </div>
  );
}
