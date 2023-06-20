# Star Wars Day

![Star Wars Day Doodle](../../_media/examples/star-wars-doodle.png)

The Star Wars day doodle uses the current users username to pick a lightsaber
colour and side logo.

## Code

```mdx
import {rndFromString, invertString} from '@arcath/utils'
import motion from 'framer-motion/motion'
import currentUser from 'data-current-user'

export const StarWarsDay = () => {
  const side =
    rndFromString(invertString(currentUser), 10) % 2 === 0 ? 'rebels' : 'empire'
  const SABER_COLORS = [
    '#e74c3c', // Alizarin
    '#2980b9', // Belize Hole
    '#9b59b6', // Amethyst
    '#27ae60', // Nephritis,
    '#f1c40f', // Sun Flower
    '#e67e22', // Carrot
    '#1abc9c', // Turquoise
    '#7f8c8d', // Asbestos
    '#34495e', // Wet Asphalt
    '#bdc3c7' // Silver
  ]

const rnd = rndFromString(currentUser, 10)

const color = SABER_COLORS[rnd]

return ( <div className="h-full rounded-xl shadow-xl relative pt-8"
style={{backgroundColor: '#2e2e2e', minHeight: '500px'}} > <h1
className="text-center text-5xl mb-8 mx-8 font-bold"
style={{color: 'rgb(234 179 8)'}} > May the 4th be with you! </h1> {side ===
'rebels' ? ( <svg xmlns="http://www.w3.org/2000/svg" version="1.1" id="Layer_1"
x="0px" y="0px" width="300px" height="300px" viewBox="0 0 300 300"
className="absolute m-auto" style={{top: '9rem', left: '0', right: '0'}}
xmlSpace="preserve" > <g>

<path d="M7.42,145.986C9.185,99.193,32.899,56.035,76.25,27.516c0.128,0.048,1.251-0.361,0.738,0.61   c-3.434,3.184-65.172,76.114-8.344,133.68c0,0,29.858,28.704,53.011,1.468c0,0,22.847-29.577-0.289-74.413   c0,0-5.856-14.64-26.955-23.721l16.992-18.748c0,0,14.359,6.161,25.478,22.871c0,0,0.593-17.593-12.884-36.34l26.345-29.89   l26.08,29.609c0,0-11.993,16.991-12.876,36.902c0,0,8.191-13.477,25.776-23.151l16.686,18.748c0,0-16.045,5.287-26.794,23.529   c-9.242,16.902-16.357,53.05,0.416,75.223c0,0,18.772,26.618,51.792-1.571c0,0,60.712-54.399-6.226-133.048   c0,0-3.658-3.233,0.449-1.476c29.586,21.54,65.012,49.946,68.67,120.837c-1.444,85.966-59.012,147.334-143.074,147.334   C68.934,295.968,4.95,227.283,7.42,145.986" />
</g> </svg> ) : ( <svg xmlns="http://www.w3.org/2000/svg" version="1.0"
width="300" height="300" id="s1" className="absolute m-auto" viewBox="0 0 600
600" style={{top: '9rem', left: '0', right: '0'}} >
<g transform="translate(-187.14286,-110.93358)" id="l1"> <path
              d="M487.14284,110.93358C321.54286,110.93358 187.14286,245.33362 187.14286,410.93362C187.14286,576.53362 321.54284,710.93366 487.14284,710.93362C652.74284,710.93362 787.14286,576.53366 787.14286,410.93362C787.14286,245.3336 652.74284,110.93358 487.14284,110.93358zM472.98468,135.80606C473.15348,135.7975 473.32602,135.8143 473.49488,135.80606L474.7704,156.15044C457.46708,156.9754 440.62572,159.49878 424.38774,163.61218L429.42602,183.44638C386.80408,194.2423 348.84062,216.68778 319.09438,247.22188L304.48978,232.93618C292.61156,245.12214 281.99204,258.50792 272.7296,272.85964L255.63776,261.57136C302.31874,189.39406 381.83314,140.43148 472.98468,135.80606zM500.7908,135.80606C592.15428,140.27534 671.88054,189.26038 718.64796,261.57136L701.55612,272.85964C692.3145,258.54406 681.70474,245.1604 669.85968,232.99994L655.2551,247.22188C625.50422,216.67148 587.4965,194.24604 544.8597,183.44638L549.89796,163.61218C533.65998,159.49878 516.81864,156.9754 499.5153,156.15044L500.7908,135.80606zM487.14284,225.72952C495.81632,225.70964 504.48982,226.23972 511.63266,227.26016L500.47194,320.1173C523.9314,323.53822 544.4998,335.8161 558.69898,353.47188L633.18876,297.60452C642.23686,308.87632 652.49448,326.55928 657.8699,339.95148L572.28316,376.5586C576.58506,387.18706 578.9796,398.7686 578.9796,410.93362C578.9796,422.65322 576.80084,433.85232 572.79336,444.16066L657.67856,480.44894C652.44098,493.92068 642.29036,511.57208 633.3801,522.92342L559.4005,467.56628C545.2202,485.62538 524.41626,498.23626 500.66324,501.74994L511.63266,593.07648C497.34694,595.27646 476.93878,595.24488 462.65306,593.20404L473.62244,501.74994C449.85228,498.23372 429.06618,485.58252 414.8852,467.5025L341.09694,522.85964C332.04886,511.58784 321.79124,493.90488 316.4158,480.5127L401.49234,444.09688C397.4985,433.80382 395.30612,422.63222 395.30612,410.93362C395.30612,398.7476 397.6865,387.13824 402.00254,376.49484L316.60714,340.01524C321.84474,326.5435 331.99534,308.8921 340.90562,297.54074L415.58672,353.47188C429.7859,335.8161 450.3543,323.53822 473.81378,320.1173L462.65306,227.38768C469.79592,226.2877 478.46938,225.74942 487.14284,225.72952zM241.9898,285.16832L260.35714,294.22444C252.6104,309.24278 246.2766,325.09906 241.60714,341.6734L261.25,347.22188C255.53952,367.48714 252.44898,388.85 252.44898,410.93362C252.44898,433.03866 255.5288,454.4264 261.25,474.70912L241.60714,480.2576C246.27338,496.80526 252.61992,512.64756 260.35714,527.6428L241.9898,536.69892C222.59162,498.98758 211.63266,456.23444 211.63266,410.93362C211.63266,365.63278 222.59162,322.87966 241.9898,285.16832zM732.29592,285.16832C751.6941,322.87966 762.65302,365.63278 762.65302,410.93362C762.65302,456.23444 751.6941,498.98758 732.29592,536.69892L713.92856,527.6428C721.66906,512.6431 728.0108,496.81066 732.67858,480.2576L713.03572,474.70912C718.7569,454.4264 721.83674,433.03866 721.83674,410.93362C721.83674,388.85 718.74622,367.48714 713.03572,347.22188L732.67858,341.6734C728.01042,325.1037 721.67212,309.23918 713.92856,294.22444L732.29592,285.16832zM272.7296,549.00762C281.99558,563.35906 292.61104,576.74454 304.48978,588.93108L319.09438,574.64536C348.84062,605.17944 386.80408,627.62496 429.42602,638.42088L424.38774,658.25504C440.62572,662.36842 457.46708,664.89184 474.7704,665.7168L473.49488,686.06118C382.13144,681.59186 302.40516,632.60682 255.63776,560.29588L272.7296,549.00762zM701.6199,549.00762L718.64796,560.29588C671.88054,632.60682 592.15428,681.59186 500.7908,686.06118L499.5153,665.7168C516.81864,664.89184 533.65998,662.36842 549.89796,658.25504L544.8597,638.42088C587.4965,627.62118 625.50422,605.19574 655.2551,574.64536L669.85968,588.8673C681.71956,576.69162 692.36698,563.34254 701.6199,549.00762z"
              id="p1"
            /> </g> </svg> )} <div className="absolute" style={{
          left: '50%',
          transform: 'scale(1.5) rotate(-45deg)',
          top: '100px'
        }} > <motion.div initial={{boxShadow: `0 0 9px ${color}`}} animate={{
            boxShadow: `0 0 18px ${color}`,
            transition: {duration: 1.5, repeat: Infinity, repeatType: 'mirror'}
          }} className="relative bg-white" style={{
            left: '-55px',
            width: '6px',
            height: '180px',
            'border-radius': '6px 10px',
            backgroundColor: color
          }} /> <div className="absolute" style={{
            left: '-56px',
            top: '175px',
            width: '8px',
            height: '12px',
            boxShadow: `1px 25px 0px 0px #555, 2px 25px 0px 0px silver, 2px 25px 0px #222`,
            backgroundImage: `linear-gradient(
            to right,
            transparent 1px,
            rgba(255, 255, 255, 0.4) 1px,
            rgba(255, 255, 255, 0.8) 3px,
            rgba(255, 255, 255, 0.3) 4px,
            rgba(0, 0, 0, 0.2) 7px,
            transparent 7px
          ),
          linear-gradient(
            to bottom,
            orange 3px,
            black 3px,
            black 4px,
            transparent 4px,
            transparent 8px,
            black 8px,
            black 9px,
            orange 9px,
            orange 11px,
            black 11px,
            black 12px
          ),
          linear-gradient(
            to left,
            transparent 1px,
            orange 1px,
            orange 7px,
            transparent 7px
          )`
          }} > &nbsp; </div> <div className="absolute" style={{
            top: '187px',
            left: '-56px',
            width: '8px',
            height: '60px',
            backgroundImage: `linear-gradient(
          to right,
          rgba(255, 255, 255, 0) 0px,
          rgba(255, 255, 255, 0.7) 2px,
          rgba(255, 255, 255, 0.2) 3px,
          rgba(0, 0, 0, 0.5) 8px
        ),
        linear-gradient(
          to bottom,
          grey 5px,
          black 5px,
          grey 6px,
          grey 7px,
          black 7px,
          grey 8px,
          grey 9px,
          black 9px,
          grey 10px,
          grey 11px,
          black 11px,
          grey 12px,
          grey 16px,
          black 16px,
          black 17px,
          orange 17px,
          orange 20px,
          black 20px,
          black 21px,
          transparent 21px,
          transparent 57px,
          black 57px,
          orange 58px
        ),
        linear-gradient(
          to right,
          silver 1px,
          black 1px,
          black 2px,
          transparent 3px,
          transparent 3px,
          silver 3px,
          silver 5px,
          black 5px,
          grey 6px,
          transparent 6px,
          transparent 7px,
          silver 7px,
          silver 8px
        ),
        linear-gradient(to bottom, grey 0px, grey 60px)`
          }} > &nbsp; </div> </div> <h2 className="text-yellow-500 text-center
text-4xl font-bold" style={{marginTop: '350px', color: 'rgb(234 179 8)'}} >
Happy Star Wars Day! </h2> </div> ) }

<StarWarsDay />
```
