import { Link } from "react-router"

const CoinInfo = ({ id, image, name, symbol, price }) => {
  return (
    <div>
      {price ? ( // rendering only if API call actually returned us data
        <li className="main-list" key={id}>
          <Link
            style={{ color: "white" }}
            to={`/coinDetails/${id}`}
            key={id}
            className="coin-link"
          >
            <img
              className="icons"
              src={image}
              alt={`Small icon for ${name} crypto coin`}
            />
            {name} ({symbol?.toUpperCase()})
            <span className="tab"></span>
            <span className="price">{`$${price.toLocaleString()} USD`}</span>
          </Link>
        </li>
      ) : (
        null
      )}
    </div>
  )
}

export default CoinInfo
