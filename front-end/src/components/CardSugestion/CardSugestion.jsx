import './CardSugestion.css'

const CardSugestion = () => {
  return (
    <>
        <div className="grid-card">
            <div className="card-body">
                <p className="card-title">Qual é a previsão do tempo para hoje?</p>
            </div>
            <div className="card-body">
                <p className="card-title">Qual é a velocidade do vento?</p>
            </div>
            <div className="card-body">
                <p className="card-title">Há previsão de tempestade?</p>
            </div>
            <div className="card-body">
                <p className="card-title">Como está o tempo em São Paulo?</p>
            </div>
        </div>
    </>
  )
}

export default CardSugestion