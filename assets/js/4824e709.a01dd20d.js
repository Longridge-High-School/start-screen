"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[323],{3905:(e,t,r)=>{r.d(t,{Zo:()=>u,kt:()=>h});var n=r(7294);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function o(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function i(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?o(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):o(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function s(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},o=Object.keys(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var c=n.createContext({}),l=function(e){var t=n.useContext(c),r=t;return e&&(r="function"==typeof e?e(t):i(i({},t),e)),r},u=function(e){var t=l(e.components);return n.createElement(c.Provider,{value:t},e.children)},p="mdxType",f={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},d=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,o=e.originalType,c=e.parentName,u=s(e,["components","mdxType","originalType","parentName"]),p=l(r),d=a,h=p["".concat(c,".").concat(d)]||p[d]||f[d]||o;return r?n.createElement(h,i(i({ref:t},u),{},{components:r})):n.createElement(h,i({ref:t},u))}));function h(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var o=r.length,i=new Array(o);i[0]=d;var s={};for(var c in t)hasOwnProperty.call(t,c)&&(s[c]=t[c]);s.originalType=e,s[p]="string"==typeof e?e:a,i[1]=s;for(var l=2;l<o;l++)i[l]=r[l];return n.createElement.apply(null,i)}return n.createElement.apply(null,r)}d.displayName="MDXCreateElement"},6125:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>c,contentTitle:()=>i,default:()=>f,frontMatter:()=>o,metadata:()=>s,toc:()=>l});var n=r(7462),a=(r(7294),r(3905));const o={},i="Acceptable Use Policy",s={unversionedId:"features/acceptable-use-policy",id:"features/acceptable-use-policy",title:"Acceptable Use Policy",description:"Start Screen has a system for enforcing users must sign an AUP before using it.",source:"@site/docs/features/acceptable-use-policy.md",sourceDirName:"features",slug:"/features/acceptable-use-policy",permalink:"/start-screen/features/acceptable-use-policy",draft:!1,editUrl:"https://github.com/longridge-high-school/start-screen/tree/main/docs/docs/features/acceptable-use-policy.md",tags:[],version:"current",frontMatter:{},sidebar:"docsSidebar",previous:{title:"Features",permalink:"/start-screen/features/"},next:{title:"Doodles",permalink:"/start-screen/features/doodles"}},c={},l=[{value:"Configuration",id:"configuration",level:2},{value:"Group DN",id:"group-dn",level:3},{value:"Signing",id:"signing",level:2}],u={toc:l},p="wrapper";function f(e){let{components:t,...r}=e;return(0,a.kt)(p,(0,n.Z)({},u,r,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("h1",{id:"acceptable-use-policy"},"Acceptable Use Policy"),(0,a.kt)("p",null,"Start Screen has a system for enforcing users must sign an AUP before using it.\nCouple this with a filtering system that sends members of a group to this page\nand you can put a hard requirement on using the internet."),(0,a.kt)("p",null,"It ",(0,a.kt)("strong",{parentName:"p"},"only applies to students")," as staff should be agreeing to policies during\ntheir induction etc..."),(0,a.kt)("h2",{id:"configuration"},"Configuration"),(0,a.kt)("p",null,"Through the admin panl you can access the ",(0,a.kt)("em",{parentName:"p"},"Acceptable Use Policy")," which allows\nyou to set:"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},"The body of the policy as ",(0,a.kt)("a",{parentName:"li",href:"/guides/working-with-mdx"},"MDX"),"."),(0,a.kt)("li",{parentName:"ul"},"Yes/No is the SUP required to view the start screen. (Turns the feature on and\noff)."),(0,a.kt)("li",{parentName:"ul"},"Yes/No should all users have their AUP acceptance reset on save."),(0,a.kt)("li",{parentName:"ul"},"The DN of the group to ",(0,a.kt)("strong",{parentName:"li"},"remove")," users from."),(0,a.kt)("li",{parentName:"ul"},"The username of a user to reset thier AUP acceptance.")),(0,a.kt)("h3",{id:"group-dn"},"Group DN"),(0,a.kt)("p",null,"If supplied the password resetting user set in config will be used to remove the\ncurrent user from the group. If this is left blank nothing happens."),(0,a.kt)("p",null,"If you reset the AUP acceptance in Start Screen it ",(0,a.kt)("em",{parentName:"p"},"does not")," add them back to\nthe group."),(0,a.kt)("h2",{id:"signing"},"Signing"),(0,a.kt)("p",null,"Users are directed to ",(0,a.kt)("inlineCode",{parentName:"p"},"/aup")," which has the full AUP on it and a box for them to\nenter their name as defined in teh database (it is shown to the user). Once they\nenter their name they will be able to click the sign button."))}f.isMDXComponent=!0}}]);