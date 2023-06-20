import {twClassNameFn} from '@arcath/utils'

export const labelClasses = twClassNameFn('w-full grid grid-cols-3 p-2')

export const labelSpanClasses = twClassNameFn('pt-2')

export const labelInfoClasses = twClassNameFn(
  'col-start-2 col-span-2 text-gray-400 px-2'
)

export const inputClasses = twClassNameFn(
  'border-gray-300 border col-span-2 p-2 rounded'
)

export const fieldsetClasses = twClassNameFn(
  'border border-gray-100 rounded gap-2'
)

const _buttonClasses = twClassNameFn([
  'col-start-2',
  'rounded-md',
  'shadow',
  'p-2'
])

export const buttonClasses = (
  color: string = 'bg-green-300',
  classes: string | string[] = []
) => {
  return _buttonClasses([color, ...classes])
}
