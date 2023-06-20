import type {FunctionComponent} from 'react'
import {motion} from 'framer-motion'
import {useState} from 'react'

export const Button: FunctionComponent<{
  image: string
  label: string
  target: string
  delay: number
  newTab?: boolean
}> = ({image, label, target, delay, newTab}) => {
  const [open, setOpen] = useState(false)

  const spring = {
    type: 'spring',
    mass: 1
  }

  const variants = {
    initial: {scale: newTab ? 1 : 0.7, transition: {...spring, delay: 0}},
    active: () => {
      return {scale: 1, transition: {...spring, delay: !open ? delay : 0}}
    },
    hovering: {scale: 0.8, transition: {...spring, delay: 0}}
  }

  return (
    <motion.a
      href={target}
      rel="nofollow"
      className="rounded bg-white p-2 text-center shadow-lg relative flex flex-row items-center content-center gap-2 plausible-event-name=Link+Pressed"
      variants={variants}
      initial={'initial'}
      animate={'active'}
      whileHover={'hovering'}
      onAnimationComplete={() => setOpen(true)}
    >
      <img src={image} className="w-16 basis-16 aspect-square" alt={label} />
      <span className="text-lg basis-1/2 text-left">{label}</span>
    </motion.a>
  )
}
