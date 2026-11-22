import Crud from '../Crud.jsx';

export default function Categories({ isAdmin }) {
  return (
    <Crud
      title="Categorias" path="/categories" canWrite={isAdmin}
      fields={[{ name: 'name', label: 'Nome', required: true }, { name: 'description', label: 'Descrição' }]}
      columns={[{ key: 'name', label: 'Nome' }, { key: 'description', label: 'Descrição' }]}
    />
  );
}
