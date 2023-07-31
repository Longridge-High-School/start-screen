import {useState} from 'react'

import {type ComponentState} from '@prisma/client'
import {COMPONENT_STATUS, COMPONENT_STATUSES} from '~/utils/constants'

export const StateSelector = ({
  initial,
  name
}: {
  initial: ComponentState
  name: string
}) => {
  const [state, setState] = useState(initial)

  return (
    <div className="w-full grid grid-cols-5 gap-4 mb-4 mt-2">
      {COMPONENT_STATUSES.map(k => {
        const {icon, status} = COMPONENT_STATUS[k]

        return (
          <div
            key={k}
            className={`text-center p-2 cursor-pointer border  ${
              state === k ? 'border-gray-200 rounded shadow' : 'border-white'
            }`}
            onClick={() => {
              setState(k)
            }}
          >
            {icon}
            <br />
            {status}
          </div>
        )
      })}
      <input type="hidden" value={state} name={name} />
    </div>
  )
}
