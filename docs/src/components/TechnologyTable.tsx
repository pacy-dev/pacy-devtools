import type { ReactNode, JSX } from 'react'

const TechnologyTable = (props: {
  children: ReactNode
}): JSX.Element => {
  const { children } = props
  return (
    <div className="technology-table-wrapper">
      <table className="technology-table">
        {children}
      </table>
    </div>
  )
}

const Row = (props: {
  category: string
  children: ReactNode
}): JSX.Element => {
  const { category, children } = props
  return (
    <tr>
      <td className="category-cell">{category}</td>
      <td className="logos-cell">
        <div className="logos-wrapper">
          {children}
        </div>
      </td>
    </tr>
  )
}

const Logo = (props: {
  src: string
  alt: string
}): JSX.Element => {
  const { src, alt } = props
  return (
    <img
      src={src}
      alt={alt}
      className="technology-logo"
    />
  )
}

TechnologyTable.Row = Row
TechnologyTable.Logo = Logo

export default TechnologyTable 