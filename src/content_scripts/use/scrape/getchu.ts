import { backgroundFetch } from '../utils'
import { getNumber, JANCodeWithAssociatedPrices } from './scrape'

export const parseGetchu = (html: string, id: string): JANCodeWithAssociatedPrices => {
  const dom = new DOMParser().parseFromString(html, 'text/html')

  let code = ""
  const trs = dom.querySelectorAll("#soft_table tr")
  trs.forEach(tr => {
    if (tr.innerHTML.includes("JANコード")) {
      const digits = getNumber(tr.innerHTML).toString()
      if (digits.length === 13 || digits.length === 8) {
        code = digits
      }
    }
  })

  let getchuPrice = 0
  const getchuPrices = dom.querySelectorAll("[class^='cart_block']")
  getchuPrices.forEach(gp => {
    const getchuPriceDOM = gp.querySelector(".taxin")
    if (getchuPriceDOM) {
      const p = getNumber(getchuPriceDOM.innerHTML)
      if (p < getchuPrice || getchuPrice === 0) {
        getchuPrice = p
      }
    }
  })

  return {
    janCode: code,
    getchu: {
      title: "Getchu",
      priceURL: "https://www.getchu.com/item/" + id + "/",
      price: getchuPrice
    }
  }
}

const scrapeGetchu = async (id: string): Promise<JANCodeWithAssociatedPrices> => {
  const body = await backgroundFetch({ url: 'https://www.getchu.com/item/' + id + '/', params: { gc: 'gc' } })
  return parseGetchu(body, id)
}

export default scrapeGetchu
