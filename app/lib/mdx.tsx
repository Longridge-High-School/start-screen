import {getMDXComponent as gmc} from 'mdx-bundler/client/index.js'
import {motion, useMotionValue, useTransform} from 'framer-motion'
import {useMemo, useEffect} from 'react'
import * as dateFns from 'date-fns'

import {useHydrated} from './hooks/use-hydrated'

import {Button} from './components/boxes/button'

export const getMDXComponent = (
  code: string,
  {currentUser, startScreen}: {currentUser: string; startScreen: boolean} = {
    currentUser: '',
    startScreen: false
  }
) => {
  return gmc(code, {
    useHydrated,
    currentUser,
    motion,
    useMotionValue,
    useTransform,
    TickBox,
    Button,
    dateFns,
    startScreen,
    useEffect,
    letItSnow
  })
}

export const MDXComponent = ({
  code,
  currentUser,
  startScreen
}: {
  code: string
  currentUser: string
  startScreen: boolean
}) => {
  const Component = useMemo(
    () => getMDXComponent(code, {currentUser, startScreen}),
    [code, currentUser, startScreen]
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

export const letItSnow = () => {
  if (typeof document !== 'undefined') {
    var embedimSnow = document.getElementById('embedim--snow')
    if (!embedimSnow) {
      function embRand(a: number, b: number) {
        return Math.floor(Math.random() * (b - a + 1)) + a
      }
      var embCSS =
        '.embedim-snow{position: absolute;width: 10px;height: 10px;background: white;border-radius: 50%;margin-top:-10px}'
      var embHTML = ''
      for (let i = 1; i < 200; i++) {
        embHTML += '<i class="embedim-snow"></i>'
        var rndX = embRand(0, 1000000) * 0.0001,
          rndO = embRand(-100000, 100000) * 0.0001,
          rndT = (embRand(3, 8) * 10).toFixed(2),
          rndS = (embRand(0, 10000) * 0.0001).toFixed(2)
        embCSS +=
          '.embedim-snow:nth-child(' +
          i +
          '){' +
          'opacity:' +
          (embRand(1, 10000) * 0.0001).toFixed(2) +
          ';' +
          'transform:translate(' +
          rndX.toFixed(2) +
          'vw,-10px) scale(' +
          rndS +
          ');' +
          'animation:fall-' +
          i +
          ' ' +
          embRand(10, 30) +
          's -' +
          embRand(0, 30) +
          's linear infinite' +
          '}' +
          '@keyframes fall-' +
          i +
          '{' +
          rndT +
          '%{' +
          'transform:translate(' +
          (rndX + rndO).toFixed(2) +
          'vw,' +
          rndT +
          'vh) scale(' +
          rndS +
          ')' +
          '}' +
          'to{' +
          'transform:translate(' +
          (rndX + rndO / 2).toFixed(2) +
          'vw, 105vh) scale(' +
          rndS +
          ')' +
          '}' +
          '}'
      }
      embedimSnow = document.createElement('div')
      embedimSnow.id = 'embedim--snow'
      embedimSnow.innerHTML =
        '<style>#embedim--snow{position:fixed;left:0;top:0;bottom:0;width:100vw;height:100vh;overflow:hidden;z-index:9999999;pointer-events:none}' +
        embCSS +
        '</style>' +
        embHTML
      document.body.appendChild(embedimSnow)
    }
  }
}
