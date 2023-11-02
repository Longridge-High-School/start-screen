import {useState, type FC, type ReactElement} from 'react'

export const TabedBox: FC<{
  children: (ReactElement<typeof Tab> | undefined)[]
}> = ({children}) => {
  const [openTab, setOpenTab] = useState(0)

  return (
    <div className="col-span-2 flex w-full h-64">
      <div className="bg-white shadow-xl grow border-gray-300 border-t border-l border-b">
        {children[openTab]}
      </div>
      <div className="w-16 flex flex-col">
        {children.map((child, i) => {
          if (child === undefined) {
            return //eslint-disable-line
          }

          return (
            <button
              key={i}
              onClick={() => {
                setOpenTab(i)
              }}
              className={`grow ${
                i === openTab
                  ? 'bg-white border-y border-r border-gray-300'
                  : 'bg-gray-300'
              }`}
            >
              {(child.props as any as {icon: string}).icon}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export const Tab: FC<{icon: string; children: ReactElement | String}> = ({
  children
}) => {
  return <div>{children}</div>
}
