import Crud from '../Crud.jsx';
import { api, errMsg } from '../api';

export default function Users({ currentId }) {
  const toggle = async (u, reload) => {
    try { await api.patch(`/user/${u.id}/active`, { active: !u.active }); reload(); } catch (e) { alert(errMsg(e)); }
  };
  return (
    <Crud
      title="Atendentes" path="/user" canDelete={false}
      fields={[
        { name: 'name', label: 'Nome', required: true },
        { name: 'username', label: 'Usuário', required: true },
        { name: 'email', label: 'E-mail', type: 'email', required: true },
        { name: 'password', label: 'Senha (mín. 6)', type: 'password', createOnly: true },
        { name: 'isAdmin', label: 'Administrador', type: 'checkbox' },
      ]}
      columns={[
        { key: 'name', label: 'Nome' },
        { key: 'email', label: 'E-mail' },
        { key: 'isAdmin', label: 'Perfil', render: (r) => (r.isAdmin ? 'Admin' : 'Atendente') },
        { key: 'active', label: 'Status', render: (r) => (r.active ? 'Ativo' : 'Desativado') },
      ]}
      rowActions={(u, reload) => u.id !== currentId && (
        <button className="sec" onClick={() => toggle(u, reload)}>{u.active ? 'Desativar' : 'Ativar'}</button>
      )}
    />
  );
}
