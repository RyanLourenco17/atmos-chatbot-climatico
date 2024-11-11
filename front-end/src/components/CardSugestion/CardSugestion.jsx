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
                <p className="card-title">Como está a umidade do ar em Santa Catarina ?</p>
            </div>
            <div className="card-body">
                <p className="card-title">Como está o clima em Campinas ?</p>
            </div>
        </div>
    </>
  )
}

export default CardSugestion
