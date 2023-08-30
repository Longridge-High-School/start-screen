"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[109],{3905:(e,t,n)=>{n.d(t,{Zo:()=>m,kt:()=>c});var a=n(7294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function s(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function i(e,t){if(null==e)return{};var n,a,r=function(e,t){if(null==e)return{};var n,a,r={},o=Object.keys(e);for(a=0;a<o.length;a++)n=o[a],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(a=0;a<o.length;a++)n=o[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var l=a.createContext({}),d=function(e){var t=a.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):s(s({},t),e)),n},m=function(e){var t=d(e.components);return a.createElement(l.Provider,{value:t},e.children)},h="mdxType",p={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},u=a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,o=e.originalType,l=e.parentName,m=i(e,["components","mdxType","originalType","parentName"]),h=d(n),u=r,c=h["".concat(l,".").concat(u)]||h[u]||p[u]||o;return n?a.createElement(c,s(s({ref:t},m),{},{components:n})):a.createElement(c,s({ref:t},m))}));function c(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var o=n.length,s=new Array(o);s[0]=u;var i={};for(var l in t)hasOwnProperty.call(t,l)&&(i[l]=t[l]);i.originalType=e,i[h]="string"==typeof e?e:r,s[1]=i;for(var d=2;d<o;d++)s[d]=n[d];return a.createElement.apply(null,s)}return a.createElement.apply(null,n)}u.displayName="MDXCreateElement"},5428:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>l,contentTitle:()=>s,default:()=>p,frontMatter:()=>o,metadata:()=>i,toc:()=>d});var a=n(7462),r=(n(7294),n(3905));const o={},s="Working with MDX",i={unversionedId:"guides/working-with-mdx",id:"guides/working-with-mdx",title:"Working with MDX",description:"MDX merges",source:"@site/docs/guides/working-with-mdx.md",sourceDirName:"guides",slug:"/guides/working-with-mdx",permalink:"/start-screen/guides/working-with-mdx",draft:!1,editUrl:"https://github.com/longridge-high-school/start-screen/tree/main/docs/docs/guides/working-with-mdx.md",tags:[],version:"current",frontMatter:{},sidebar:"docsSidebar",previous:{title:"Importing from your MIS",permalink:"/start-screen/guides/importing-from-your-mis"}},l={},d=[{value:"A Full Component",id:"a-full-component",level:2},{value:"Imports",id:"imports",level:2},{value:"Variables",id:"variables",level:2},{value:"Merry Christmas",id:"merry-christmas",level:2},{value:"Hydration Issues",id:"hydration-issues",level:3},{value:"Tailwind",id:"tailwind",level:3},{value:"Safe Classes",id:"safe-classes",level:4},{value:"Colours",id:"colours",level:5},{value:"Box Styling",id:"box-styling",level:5}],m={toc:d},h="wrapper";function p(e){let{components:t,...o}=e;return(0,r.kt)(h,(0,a.Z)({},m,o,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("h1",{id:"working-with-mdx"},"Working with MDX"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"https://mdxjs.com/"},"MDX")," merges\n",(0,r.kt)("a",{parentName:"p",href:"https://en.wikipedia.org/wiki/Markdown"},"Markdown")," with\n",(0,r.kt)("a",{parentName:"p",href:"https://react.dev/"},"React")," (at least in the case of Start Screen) allowing you\nto create dynamic components for the Start Screen that are saved into the\ndatabase."),(0,r.kt)("p",null,"Within Start Screen it is used for ",(0,r.kt)("a",{parentName:"p",href:"/features/pages"},"Pages")," and\n",(0,r.kt)("a",{parentName:"p",href:"/features/doodles"},"Doodles")," as well as a couple of other places."),(0,r.kt)("p",null,"In the background Start Screen is using\n",(0,r.kt)("a",{parentName:"p",href:"https://github.com/kentcdodds/mdx-bundler"},"mdx-bundler")," which in-turn uses\n",(0,r.kt)("a",{parentName:"p",href:"https://esbuild.github.io/"},"esbuild")," to bundle the mdx code into self-contained\nchunks of code."),(0,r.kt)("h2",{id:"a-full-component"},"A Full Component"),(0,r.kt)("p",null,"To build a fully dynamic component it needs to be exported and then rendered on\nthe page, in its simpliest form"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-mdx"},"export const MyDoodle = () => {\n  return <div>Doodle Content</div>\n}\n\n<MyDoodle />\n")),(0,r.kt)("p",null,"From here you can build a normal React Component"),(0,r.kt)("h2",{id:"imports"},"Imports"),(0,r.kt)("p",null,"As Start Screen has access to esbuild you can use standard JavaScript imports\nand it will bundle them into the code."),(0,r.kt)("p",null,"To avoid bloating the bundles some imports are provided from the app."),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Import"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Provides"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"import motion from 'framer-motion/motion'")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"motion")," from ",(0,r.kt)("a",{parentName:"td",href:"https://www.framer.com/motion/"},"Framer Motion"),".")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"import useHydrated from 'lib-hooks-use-hydrated'")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The ",(0,r.kt)("inlineCode",{parentName:"td"},"useHydrated")," React hook which returns ",(0,r.kt)("inlineCode",{parentName:"td"},"true")," on the client.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"import currentUser from 'data-current-user'")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The current users username.")))),(0,r.kt)("h2",{id:"variables"},"Variables"),(0,r.kt)("p",null,"Some components/utils are provided as variables to MDX."),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Variable"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Provides"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"dateFns")),(0,r.kt)("td",{parentName:"tr",align:"left"},"All of date-fns")))),(0,r.kt)("h2",{id:"merry-christmas"},"Merry Christmas"),(0,r.kt)("p",null,"A Great example of how MDX can be used is the Christmas 2022 Doodle from\nLongridge High."),(0,r.kt)("p",null,(0,r.kt)("img",{alt:"LHS Christmas Doodle",src:n(9058).Z,width:"379",height:"655"})),(0,r.kt)("p",null,"As per the ",(0,r.kt)("a",{parentName:"p",href:"#a-full-component"},"Full Component")," example, we start with an empty\ndiv."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-mdx"},"export const Christmas22 = () => {\n  return (\n    <div\n      className=\"rounded-xl text-center shadow h-full\"\n      style={{\n        backgroundImage: 'linear-gradient(to bottom right, #011627, #586497)'\n      }}\n    >\n      Merry Christmas\n    </div>\n  )\n}\n\n<Christmas22 />\n")),(0,r.kt)("blockquote",null,(0,r.kt)("p",{parentName:"blockquote"},"Notice the mix of ",(0,r.kt)("a",{parentName:"p",href:"#tailwind"},"Tailwind")," classes and in-line styles. The\ngradient class isn't used anywhere in Start Screen so must be manually set on\nthe element.")),(0,r.kt)("p",null,"This produces a full-size box with a background gradient, rounded corners and a\nshadow that contains ",(0,r.kt)("em",{parentName:"p"},"Merry Christmas"),"."),(0,r.kt)("p",null,"From here lets expand it to the full component with no dynamic elements."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-mdx"},'import motion from \'framer-motion/motion\'\n\nexport const Christmas22 = () => {\n  return (\n    <div\n      className="rounded-xl text-center shadow h-full"\n      style={{\n        backgroundImage: \'linear-gradient(to bottom right, #011627, #586497)\'\n      }}\n    >\n      <h1 className="text-white text-4xl">Merry Christmas!</h1>\n      <img\n        src="/assets/christmas-tree.png"\n        className="m-auto"\n        alt="A Christmas Tree"\n        style={{\n          width: \'80%\'\n        }}\n      />\n      <h2 className="text-white text-2xl mb-2">X sleeps til Christmas!</h2>\n      <div>\n        <p className="text-lg text-white">JOKE</p>\n        <motion.p\n          initial={{opacity: 0}}\n          animate={{\n            opacity: 1,\n            transition: {type: \'spring\', mass: 1, delay: 3}\n          }}\n          className="text-white mb-2"\n        >\n          ANSWER\n        </motion.p>\n      </div>\n    </div>\n  )\n}\n\n<Christmas22 />\n')),(0,r.kt)("p",null,"From here it can now get its dynamic elements."),(0,r.kt)("p",null,"For the countdown we need the current time, and then the distance to Christmas."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-js"},"const christmas = new Date(new Date().getFullYear(), 11, 25) // Don't ask me why months count from 0 but days don't.\nconst now = new Date()\n\nconst days = Math.ceil(\n  (christmas.getTime() - now.getTime()) / (1000 * 3600 * 24)\n)\n")),(0,r.kt)("p",null,"It's now a simple matter to replace ",(0,r.kt)("inlineCode",{parentName:"p"},"X")," with ",(0,r.kt)("inlineCode",{parentName:"p"},"{days}")),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-mdx"},'<h2 className="text-white text-2xl mb-2">{days} sleeps til Christmas!</h2>\n')),(0,r.kt)("p",null,"For the jokes we want an array of arrays that are ",(0,r.kt)("inlineCode",{parentName:"p"},"[joke, answer]"),", then to pick\na random entry from that list."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-js"},"// Add this import at the top\nimport {randomEntry} from '@arcath/utils'\n\nconst JOKES = [\n  ['What do angry mice send to each other at Christmas?', 'Cross Mouse Cards'],\n  [\n    \"What do they sing at a snowman's birthday party?\",\n    'Freeze a jolly good fellow'\n  ],\n  ['Why does Santa have three gardens?', \"So he can 'ho ho ho'\"],\n  ['What does Miley Cyrus have at Christmas?', 'Twerky'],\n  [\"What do vampires sing on New Year's Eve?\", 'Auld Fang Syne'],\n  [\"Why did Santa's helper see the doctor?\", 'Because he had low elf esteem'],\n  ['What happened to the man who stole an Advent Calendar?', 'He got 25 days'],\n  ['What kind of motorbike does Santa ride?', 'A Holly Davidson'],\n  ['What do you get if you cross Santa with a duck?', 'A Christmas quacker'],\n  [\n    'What is the best Christmas present in the world?',\n    \"A broken drum... you just can't beat it\"\n  ],\n  ['How did Scrooge win the football game?', 'The ghost of Christmas passed'],\n  ['Who delivers presents to baby sharks at Christmas?', 'Santa Jaws'],\n  [\"Who is Santa's favorite singer?\", 'Elf-is Presley'],\n  [\"What do Santa's little helpers learn at school?\", 'The elf-abet'],\n  [\n    'What did Santa say to the smoker?',\n    \"Please don't smoke, it's bad for my elf\"\n  ],\n  ['What do you get if you eat Christmas decorations?', 'Tinselitis!'],\n  ['What do you get when you cross a snowman with a vampire?', 'Frostbite.']\n]\n\nconst [joke, answer] = randomEntry(JOKES)\n")),(0,r.kt)("p",null,"With the joke it's not as simple as just putting ",(0,r.kt)("inlineCode",{parentName:"p"},"{joke}")," and ",(0,r.kt)("inlineCode",{parentName:"p"},"{answer}")," into\nthe page. As described in ",(0,r.kt)("a",{parentName:"p",href:"#hydration-issues"},"Hydration Issues")," the client and\nserver would pick a different joke and mis-match the HTML that gets rendered. A\nuser would see one joke for a split second that then gets replaced with another."),(0,r.kt)("p",null,"The solution is to use ",(0,r.kt)("inlineCode",{parentName:"p"},"useHydrated")," and only render the joke on the client."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-mdx"},"const hydrated = useHydrated()\n\n{hydrated ? (\n\n{' '}\n\n<div>\n  <p className=\"text-lg text-white\">{joke}</p>\n  <motion.p\n    initial={{opacity: 0}}\n    animate={{\n      opacity: 1,\n      transition: {type: 'spring', mass: 1, delay: 3}\n    }}\n    className=\"text-white mb-2\"\n  >\n    {answer}\n  </motion.p>\n</div>\n) : ( '' )}\n")),(0,r.kt)("p",null,"Putting it all together gives us this:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-mdx"},"import {randomEntry} from '@arcath/utils'\nimport motion from 'framer-motion/motion'\n\nimport useHydrated from 'lib-hooks-use-hydrated'\n\nexport const Christmas22 = () => {\nconst JOKES = [\n  ['What do angry mice send to each other at Christmas?', 'Cross Mouse Cards'],\n  [\n    \"What do they sing at a snowman's birthday party?\",\n    'Freeze a jolly good fellow'\n  ],\n  ['Why does Santa have three gardens?', \"So he can 'ho ho ho'\"],\n  ['What does Miley Cyrus have at Christmas?', 'Twerky'],\n  [\"What do vampires sing on New Year's Eve?\", 'Auld Fang Syne'],\n  [\"Why did Santa's helper see the doctor?\", 'Because he had low elf esteem'],\n  ['What happened to the man who stole an Advent Calendar?', 'He got 25 days'],\n  ['What kind of motorbike does Santa ride?', 'A Holly Davidson'],\n  ['What do you get if you cross Santa with a duck?', 'A Christmas quacker'],\n  [\n    'What is the best Christmas present in the world?',\n    \"A broken drum... you just can't beat it\"\n  ],\n  ['How did Scrooge win the football game?', 'The ghost of Christmas passed'],\n  ['Who delivers presents to baby sharks at Christmas?', 'Santa Jaws'],\n  [\"Who is Santa's favorite singer?\", 'Elf-is Presley'],\n  [\"What do Santa's little helpers learn at school?\", 'The elf-abet'],\n  [\n    'What did Santa say to the smoker?',\n    \"Please don't smoke, it's bad for my elf\"\n  ],\n  ['What do you get if you eat Christmas decorations?', 'Tinselitis!'],\n  ['What do you get when you cross a snowman with a vampire?', 'Frostbite.']\n]\n\nconst christmas = new Date(new Date().getFullYear(), 11, 25) const now = new\nDate()\n\nconst days = Math.ceil( (christmas.getTime() - now.getTime()) / (1000 _ 3600\n_ 24) )\n\nconst [joke, answer] = randomEntry(JOKES) const hydrated = useHydrated()\n\nreturn <div className=\"rounded-xl text-center shadow h-full\" style={{\n  backgroundImage: 'linear-gradient(to bottom right, #011627, #586497)'\n}}><h1 className=\"text-white text-4xl\">Merry Christmas!</h1> <img\nsrc=\"/assets/christmas-tree.png\" className=\"m-auto\" alt=\"A Christmas Tree\"\nstyle={{\n          width: '80%'\n        }} />\n\n<h2 className=\"text-white text-2xl mb-2\">{days} sleeps til Christmas!</h2>\n{hydrated ? (\n        <div>\n          <p className=\"text-lg text-white\">{joke}</p>\n          <motion.p\n            initial={{opacity: 0}}\n            animate={{\n              opacity: 1,\n              transition: {type: 'spring', mass: 1, delay: 3}\n            }}\n            className=\"text-white mb-2\"\n          >\n            {answer}\n          </motion.p>\n        </div>\n      ) : (\n        ''\n      )}\n</div>\n}\n\n<Christmas22 />\n")),(0,r.kt)("h3",{id:"hydration-issues"},"Hydration Issues"),(0,r.kt)("p",null,"Remix generates the HTML on the server side and the ",(0,r.kt)("em",{parentName:"p"},"hydrates")," it with the React\napp once the client has loaded. This system only works if the client and server\nreturn the same result from rendering. In the\n",(0,r.kt)("a",{parentName:"p",href:"#merry-christmas"},"Merry Christmas")," example above without ",(0,r.kt)("inlineCode",{parentName:"p"},"useHydrated")," the\nserver would pick a joke randomly at render and then the client would (most\nlikely) pick a different joke. This will cause the client to completely replace\nthe page contents and may cause issues."),(0,r.kt)("p",null,"If you do anything that can only happen on the client, or will always return a\ndifferent answer then it needs to only render when the result of ",(0,r.kt)("inlineCode",{parentName:"p"},"useHydrated"),"\nis ",(0,r.kt)("inlineCode",{parentName:"p"},"true")),(0,r.kt)("h3",{id:"tailwind"},"Tailwind"),(0,r.kt)("p",null,"Start Screen uses ",(0,r.kt)("a",{parentName:"p",href:"https://tailwindcss.com/"},"Tailwind")," for its styling. This\nmeans that MDX has access to any of the classes that are used in the source\ncode. Tailwind compiles the ",(0,r.kt)("em",{parentName:"p"},"minimum")," amount of CSS it needs to produce the site\nas a result if we never use ",(0,r.kt)("inlineCode",{parentName:"p"},"text-red-100")," it doesn't get put into the\nstylesheet."),(0,r.kt)("p",null,"Unfortunatly this happens at build time so there is no way for MDX content to\nadd styles. It also means that whilst a style might be available at the time you\nmake your content it might get removed at a later date."),(0,r.kt)("h4",{id:"safe-classes"},"Safe Classes"),(0,r.kt)("p",null,"This is a non-exhaustive list of the classes that should never be removed."),(0,r.kt)("blockquote",null,(0,r.kt)("p",{parentName:"blockquote"},"Their presense in this file will cause tailwind to include them.")),(0,r.kt)("h5",{id:"colours"},"Colours"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"text-brand-dark")),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"text-brand-light")),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"bg-brand-dark")),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"bg-brand-light")),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"border-brand-dark")),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"border-brand-light")),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"text-white")),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"bg-white"))),(0,r.kt)("h5",{id:"box-styling"},"Box Styling"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"rounded")),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"rounded-xl")),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"shadow")),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"shadow-xl"))))}p.isMDXComponent=!0},9058:(e,t,n)=>{n.d(t,{Z:()=>a});const a=n.p+"assets/images/christmas-doodle-867a37fa1a99a0b8ca542bc3f59f99e7.png"}}]);