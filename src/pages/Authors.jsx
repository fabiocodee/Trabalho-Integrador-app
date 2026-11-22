import Crud from '../Crud.jsx';
import { fmtDate } from '../api';

export default function Authors({ isAdmin }) {
  return (
    <Crud
      title="Autores" path="/authors" canWrite={isAdmin}
      fields={[
        { name: 'name', label: 'Nome', required: true },
        { name: 'nationality', label: 'Nacionalidade' },
        { name: 'birthDate', label: 'Nascimento', type: 'date' },
      ]}
      columns={[
        { key: 'name', label: 'Nome' },
        { key: 'nationality', label: 'Nacionalidade' },
        { key: 'birthDate', label: 'Nascimento', render: (r) => fmtDate(r.birthDate && `${r.birthDate}T12:00:00`) },
      ]}
    />
  );
}
