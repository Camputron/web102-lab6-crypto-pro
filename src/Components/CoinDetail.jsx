import { useEffect, useState } from "react"
import { useParams } from "react-router"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"

const API_KEY = import.meta.env.VITE_APP_API_KEY

// Only send the demo key header if a real key has been provided.
const headers =
  API_KEY && API_KEY !== "your_key_here"
    ? { "x-cg-demo-api-key": API_KEY }
    : {}

// Strip any HTML tags CoinGecko sometimes embeds in descriptions.
const stripHtml = (html) => (html ? html.replace(/<[^>]*>/g, "") : "")

const formatUSD = (value) =>
  value || value === 0
    ? `$${Number(value).toLocaleString(undefined, {
        maximumFractionDigits: 8,
      })} USD`
    : "—"

const CoinDetail = () => {
  const { id } = useParams()
  const [fullDetails, setFullDetails] = useState(null)
  const [priceHistory, setPriceHistory] = useState([])
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const fetchCoinDetails = async () => {
      // 1) Full details for the coin (description, links, market data, etc.)
      const detailRes = await fetch(
        `https://api.coingecko.com/api/v3/coins/${id}?localization=false&tickers=false&community_data=false&developer_data=false`,
        { headers }
      )

      if (!detailRes.ok) {
        setNotFound(true)
        return
      }

      const detailJson = await detailRes.json()
      setFullDetails(detailJson)

      // 2) 30-day price history for the chart (stretch goal)
      const chartRes = await fetch(
        `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=30`,
        { headers }
      )
      const chartJson = await chartRes.json()
      const points = (chartJson.prices || []).map(([timestamp, price]) => ({
        date: new Date(timestamp).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }),
        price,
      }))
      setPriceHistory(points)
    }

    setFullDetails(null)
    setPriceHistory([])
    setNotFound(false)
    fetchCoinDetails().catch(console.error)
  }, [id])

  if (notFound) {
    return (
      <div className="detail-view">
        <h1>Coin not found</h1>
        <p>
          We couldn't find any data for <code>{id}</code>. Double-check the
          coin id in the URL.
        </p>
      </div>
    )
  }

  // Render only once the API calls have returned.
  if (!fullDetails) {
    return (
      <div className="detail-view">
        <p className="loading">Loading coin details…</p>
      </div>
    )
  }

  const market = fullDetails.market_data || {}
  const links = fullDetails.links || {}
  const homepage = links.homepage?.find((url) => url) || null
  const whitepaper = links.whitepaper || null

  return (
    <div className="detail-view">
      <header className="detail-header">
        {fullDetails.image?.large && (
          <img
            className="detail-icon"
            src={fullDetails.image.large}
            alt={`${fullDetails.name} logo`}
          />
        )}
        <div>
          <h1>
            {fullDetails.name}{" "}
            <span className="symbol">
              ({fullDetails.symbol?.toUpperCase()})
            </span>
          </h1>
          {market.current_price?.usd != null && (
            <p className="current-price">
              {formatUSD(market.current_price.usd)}
            </p>
          )}
          {fullDetails.market_cap_rank && (
            <p className="rank">Market Cap Rank #{fullDetails.market_cap_rank}</p>
          )}
        </div>
      </header>

      {fullDetails.description?.en && (
        <p className="summary">
          {stripHtml(fullDetails.description.en).split(". ")[0]}.
        </p>
      )}

      {priceHistory.length > 0 && (
        <section className="chart-section">
          <h2>Price — Last 30 Days</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={priceHistory}
              margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3d" />
              <XAxis dataKey="date" stroke="#9ca3af" minTickGap={30} />
              <YAxis
                stroke="#9ca3af"
                domain={["auto", "auto"]}
                tickFormatter={(v) => `$${Number(v).toLocaleString()}`}
                width={80}
              />
              <Tooltip
                contentStyle={{
                  background: "#1c1c2b",
                  border: "1px solid #2a2a3d",
                  borderRadius: 8,
                  color: "#fff",
                }}
                formatter={(value) => [formatUSD(value), "Price"]}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#f7931a"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </section>
      )}

      <section className="table-section">
        <h2>Key Stats</h2>
        <table className="detail-table">
          <tbody>
            <tr>
              <th>Launch Date</th>
              <td>{fullDetails.genesis_date || "—"}</td>
            </tr>
            <tr>
              <th>Hashing Algorithm</th>
              <td>{fullDetails.hashing_algorithm || "—"}</td>
            </tr>
            <tr>
              <th>Website</th>
              <td>
                {homepage ? (
                  <a href={homepage} target="_blank" rel="noreferrer">
                    {homepage}
                  </a>
                ) : (
                  "—"
                )}
              </td>
            </tr>
            <tr>
              <th>Whitepaper</th>
              <td>
                {whitepaper ? (
                  <a href={whitepaper} target="_blank" rel="noreferrer">
                    {whitepaper}
                  </a>
                ) : (
                  "—"
                )}
              </td>
            </tr>
            <tr>
              <th>Today's Open (24h ago)</th>
              <td>
                {market.current_price?.usd != null &&
                market.price_change_24h != null
                  ? formatUSD(market.current_price.usd - market.price_change_24h)
                  : "—"}
              </td>
            </tr>
            <tr>
              <th>24h High</th>
              <td>{formatUSD(market.high_24h?.usd)}</td>
            </tr>
            <tr>
              <th>24h Low</th>
              <td>{formatUSD(market.low_24h?.usd)}</td>
            </tr>
            <tr>
              <th>Change (24h)</th>
              <td
                className={
                  market.price_change_percentage_24h >= 0 ? "up" : "down"
                }
              >
                {market.price_change_percentage_24h != null
                  ? `${market.price_change_percentage_24h.toFixed(2)}%`
                  : "—"}
              </td>
            </tr>
            <tr>
              <th>24h Volume</th>
              <td>{formatUSD(market.total_volume?.usd)}</td>
            </tr>
            <tr>
              <th>Market Cap</th>
              <td>{formatUSD(market.market_cap?.usd)}</td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  )
}

export default CoinDetail
