import CriarATV from '../components/criar_atv.js';

export default function Criar() {
    const handleCreate = (newActivity) => {
      console.log(newActivity);
    };

    return (
        <div>
            <CriarATV onCreate={handleCreate} />
        </div>
    );
}
