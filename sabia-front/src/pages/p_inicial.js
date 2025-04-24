import Button from '../components/botao.js'; 

export default function PInicial() {
    return (
      <div>
        <h1>Minhas Atividades</h1>
        <Button text="criar" to="/criar" />
      </div>
    );
}
