import {getMDXComponent as gmc} from 'mdx-bundler/client'
import {motion, useMotionValue, useTransform} from 'framer-motion'
import {useMemo} from 'react'

import {useHydrated} from './hooks/use-hydrated'

import {Button} from './components/boxes/button'

export const getMDXComponent = (
  code: string,
  {currentUser}: {currentUser: string} = {currentUser: ''}
) => {
  return gmc(code, {
    useHydrated,
    currentUser,
    motion,
    useMotionValue,
    useTransform,
    TickBox,
    Button
  })
}

export const MDXComponent = ({
  code,
  currentUser
}: {
  code: string
  currentUser: string
}) => {
  const Component = useMemo(
    () => getMDXComponent(code, {currentUser}),
    [code, currentUser]
  )

  return <Component />
}

// Components for Use with MDX

export const TickBox: React.FC<{delay: number}> = ({delay}) => {
  const pathLength = useMotionValue(0)
  const opacity = useTransform(pathLength, [0.05, 0.15], [0, 1])

  return (
    <motion.div
      style={{
        width: 50,
        height: 50,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,1)'
      }}
      animate={{
        scale: 1,
        backgroundColor: 'rgba(255, 255, 255, 1)'
      }}
      transition={{type: 'spring', stiffness: 300, damping: 20}}
      //onTap={() => setIsChecked(!isChecked)}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="50"
        height="50"
        viewBox="0 0 150 150"
      >
        <motion.path
          d="M38 74.707l24.647 24.646L116.5 45.5"
          fill="transparent"
          strokeWidth="20"
          stroke="#39e"
          strokeLinecap="round"
          animate={{pathLength: 0.9}}
          style={{pathLength: pathLength, opacity: opacity}}
          transition={{duration: 0.5, delay}}
        />
      </svg>
    </motion.div>
  )
}
