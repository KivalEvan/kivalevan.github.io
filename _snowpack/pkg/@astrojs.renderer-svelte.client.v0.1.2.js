import{S as t,i as s,s as a,q as e,u as n,v as r,w as o,j as c,x as $,y as f,z as l,A as i,B as m,g as p,C as u,D as d,E as _,F as g,e as h,c as v,b as x,o as w}from"../../svelte.internal.v3.43.1-e86fc44a.js";function y(t){let s,a=t[1]&&function(t){let s;return{c(){s=h("astro-fragment")},l(t){s=v(t,"ASTRO-FRAGMENT",{}),x(s).forEach(p)},m(a,e){c(a,s,e),s.innerHTML=t[1]},p:w,d(t){t&&p(s)}}}(t);return{c(){a&&a.c(),s=n()},l(t){a&&a.l(t),s=n()},m(t,e){a&&a.m(t,e),c(t,s,e)},p(t,s){t[1]&&a.p(t,s)},d(t){a&&a.d(t),t&&p(s)}}}function A(t){let s,a,_;const h=[t[2]];var v=t[0];function x(t){let s={$$slots:{default:[y]},$$scope:{ctx:t}};for(let t=0;t<h.length;t+=1)s=d(s,h[t]);return{props:s}}return v&&(s=new v(x(t))),{c(){s&&e(s.$$.fragment),a=n()},l(t){s&&r(s.$$.fragment,t),a=n()},m(t,e){s&&o(s,t,e),c(t,a,e),_=!0},p(t,[n]){const r=4&n?$(h,[f(t[2])]):{};if(16&n&&(r.$$scope={dirty:n,ctx:t}),v!==(v=t[0])){if(s){g();const t=s;l(t.$$.fragment,1,0,(()=>{u(t,1)})),i()}v?(s=new v(x(t)),e(s.$$.fragment),m(s.$$.fragment,1),o(s,a.parentNode,a)):s=null}else v&&s.$set(r)},i(t){_||(s&&m(s.$$.fragment,t),_=!0)},o(t){s&&l(s.$$.fragment,t),_=!1},d(t){t&&p(a),s&&u(s,t)}}}function E(t,s,a){const{__astro_component:e,__astro_children:n,...r}=s;return t.$$set=t=>{a(3,s=d(d({},s),_(t)))},s=_(s),[e,n,r]}class T extends t{constructor(t){super(),s(this,t,E,A,a,{})}}var j=t=>(s,a,e)=>{try{new T({target:t,props:{__astro_component:s,__astro_children:e,...a},hydrate:!0})}catch(t){}};export{j as default};
