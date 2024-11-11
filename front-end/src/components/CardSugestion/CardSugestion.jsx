import './CardSugestion.css'

const CardSugestion = () => {
  return (
    <>
        <div className="grid-card">
            <div className="card-body">
                <p className="card-title">Qual é o nível de poluição em Osasco?</p>
            </div>
            <div className="card-body">
                <p className="card-title">Qual é a velocidade do vento em Santos?</p>
            </div>
            <div className="card-body">
                <p className="card-title">Qual a pressão atmosférica em Recife ?</p>
            </div>
            <div className="card-body">
                <p className="card-title">Como está o clima atual em Campinas?</p>
            </div>
        </div>
    </>
  )
}

export default CardSugestion
