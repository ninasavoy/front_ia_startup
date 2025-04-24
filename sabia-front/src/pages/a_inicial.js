import Button from '../components/botao.js'; 

export default function aInicial() {
    return (
        <div>
            <Button text="aluno" to="/a_inicial"/>

            <Button text="professor" to="/p_inicial"/>
        </div>

    );
}
