function t(){}function n(t,n){for(const e in n)t[e]=n[e];return t}function e(t){return t()}function o(){return Object.create(null)}function r(t){t.forEach(e)}function i(t){return"function"==typeof t}function c(t,n){return t!=t?n==n:t!==n||t&&"object"==typeof t||"function"==typeof t}function a(t){const n={};for(const e in t)"$"!==e[0]&&(n[e]=t[e]);return n}let l,s=!1;function u(t,n,e,o){for(;t<n;){const r=t+(n-t>>1);e(r)<=o?t=r+1:n=r}return t}function f(t,n){if(s){for(!function(t){if(t.hydrate_init)return;t.hydrate_init=!0;let n=t.childNodes;if("HEAD"===t.nodeName){const t=[];for(let e=0;e<n.length;e++){const o=n[e];void 0!==o.claim_order&&t.push(o)}n=t}const e=new Int32Array(n.length+1),o=new Int32Array(n.length);e[0]=-1;let r=0;for(let t=0;t<n.length;t++){const i=n[t].claim_order,c=(r>0&&n[e[r]].claim_order<=i?r+1:u(1,r,(t=>n[e[t]].claim_order),i))-1;o[t]=e[c]+1;const a=c+1;e[a]=t,r=Math.max(a,r)}const i=[],c=[];let a=n.length-1;for(let t=e[r]+1;0!=t;t=o[t-1]){for(i.push(n[t-1]);a>=t;a--)c.push(n[a]);a--}for(;a>=0;a--)c.push(n[a]);i.reverse(),c.sort(((t,n)=>t.claim_order-n.claim_order));for(let n=0,e=0;n<c.length;n++){for(;e<i.length&&c[n].claim_order>=i[e].claim_order;)e++;const o=e<i.length?i[e]:null;t.insertBefore(c[n],o)}}(t),(void 0===t.actual_end_child||null!==t.actual_end_child&&t.actual_end_child.parentElement!==t)&&(t.actual_end_child=t.firstChild);null!==t.actual_end_child&&void 0===t.actual_end_child.claim_order;)t.actual_end_child=t.actual_end_child.nextSibling;n!==t.actual_end_child?void 0===n.claim_order&&n.parentNode===t||t.insertBefore(n,t.actual_end_child):t.actual_end_child=n.nextSibling}else n.parentNode===t&&null===n.nextSibling||t.appendChild(n)}function d(t,n,e){s&&!e?f(t,n):n.parentNode===t&&n.nextSibling==e||t.insertBefore(n,e||null)}function h(t){t.parentNode.removeChild(t)}function _(t,n){for(let e=0;e<t.length;e+=1)t[e]&&t[e].d(n)}function m(t){return document.createElement(t)}function p(t){return document.createTextNode(t)}function g(){return p(" ")}function $(){return p("")}function b(t,n,e,o){return t.addEventListener(n,e,o),()=>t.removeEventListener(n,e,o)}function x(t,n,e){null==e?t.removeAttribute(n):t.getAttribute(n)!==e&&t.setAttribute(n,e)}function y(t){return Array.from(t.childNodes)}function v(t,n,e,o,r=!1){!function(t){void 0===t.claim_info&&(t.claim_info={last_index:0,total_claimed:0})}(t);const i=(()=>{for(let o=t.claim_info.last_index;o<t.length;o++){const i=t[o];if(n(i)){const n=e(i);return void 0===n?t.splice(o,1):t[o]=n,r||(t.claim_info.last_index=o),i}}for(let o=t.claim_info.last_index-1;o>=0;o--){const i=t[o];if(n(i)){const n=e(i);return void 0===n?t.splice(o,1):t[o]=n,r?void 0===n&&t.claim_info.last_index--:t.claim_info.last_index=o,i}}return o()})();return i.claim_order=t.claim_info.total_claimed,t.claim_info.total_claimed+=1,i}function E(t,n,e){return function(t,n,e,o){return v(t,(t=>t.nodeName===n),(t=>{const n=[];for(let o=0;o<t.attributes.length;o++){const r=t.attributes[o];e[r.name]||n.push(r.name)}n.forEach((n=>t.removeAttribute(n)))}),(()=>o(n)))}(t,n,e,m)}function k(t,n){return v(t,(t=>3===t.nodeType),(t=>{const e=""+n;if(t.data.startsWith(e)){if(t.data.length!==e.length)return t.splitText(e.length)}else t.data=e}),(()=>p(n)),!0)}function A(t){return k(t," ")}function N(t,n){n=""+n,t.wholeText!==n&&(t.data=n)}function w(t,n){t.value=null==n?"":n}function S(t){l=t}const j=[],B=[],C=[],T=[],O=Promise.resolve();let q=!1;function D(t){C.push(t)}let I=!1;const L=new Set;function M(){if(!I){I=!0;do{for(let t=0;t<j.length;t+=1){const n=j[t];S(n),z(n.$$)}for(S(null),j.length=0;B.length;)B.pop()();for(let t=0;t<C.length;t+=1){const n=C[t];L.has(n)||(L.add(n),n())}C.length=0}while(j.length);for(;T.length;)T.pop()();q=!1,I=!1,L.clear()}}function z(t){if(null!==t.fragment){t.update(),r(t.before_update);const n=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,n),t.after_update.forEach(D)}}const F=new Set;let H;function P(){H={r:0,c:[],p:H}}function W(){H.r||r(H.c),H=H.p}function G(t,n){t&&t.i&&(F.delete(t),t.i(n))}function J(t,n,e,o){if(t&&t.o){if(F.has(t))return;F.add(t),H.c.push((()=>{F.delete(t),o&&(e&&t.d(1),o())})),t.o(n)}}function K(t,n){const e={},o={},r={$$scope:1};let i=t.length;for(;i--;){const c=t[i],a=n[i];if(a){for(const t in c)t in a||(o[t]=1);for(const t in a)r[t]||(e[t]=a[t],r[t]=1);t[i]=a}else for(const t in c)r[t]=1}for(const t in o)t in e||(e[t]=void 0);return e}function Q(t){return"object"==typeof t&&null!==t?t:{}}function R(t){t&&t.c()}function U(t,n){t&&t.l(n)}function V(t,n,o,c){const{fragment:a,on_mount:l,on_destroy:s,after_update:u}=t.$$;a&&a.m(n,o),c||D((()=>{const n=l.map(e).filter(i);s?s.push(...n):r(n),t.$$.on_mount=[]})),u.forEach(D)}function X(t,n){const e=t.$$;null!==e.fragment&&(r(e.on_destroy),e.fragment&&e.fragment.d(n),e.on_destroy=e.fragment=null,e.ctx=[])}function Y(t,n){-1===t.$$.dirty[0]&&(j.push(t),q||(q=!0,O.then(M)),t.$$.dirty.fill(0)),t.$$.dirty[n/31|0]|=1<<n%31}function Z(n,e,i,c,a,u,f,d=[-1]){const _=l;S(n);const m=n.$$={fragment:null,ctx:null,props:u,update:t,not_equal:a,bound:o(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(e.context||(_?_.$$.context:[])),callbacks:o(),dirty:d,skip_bound:!1,root:e.target||_.$$.root};f&&f(m.root);let p=!1;if(m.ctx=i?i(n,e.props||{},((t,e,...o)=>{const r=o.length?o[0]:e;return m.ctx&&a(m.ctx[t],m.ctx[t]=r)&&(!m.skip_bound&&m.bound[t]&&m.bound[t](r),p&&Y(n,t)),e})):[],m.update(),p=!0,r(m.before_update),m.fragment=!!c&&c(m.ctx),e.target){if(e.hydrate){s=!0;const t=y(e.target);m.fragment&&m.fragment.l(t),t.forEach(h)}else m.fragment&&m.fragment.c();e.intro&&G(n.$$.fragment),V(n,e.target,e.anchor,e.customElement),s=!1,M()}S(_)}class tt{$destroy(){X(this,1),this.$destroy=t}$on(t,n){const e=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return e.push(n),()=>{const t=e.indexOf(n);-1!==t&&e.splice(t,1)}}$set(t){var n;this.$$set&&(n=t,0!==Object.keys(n).length)&&(this.$$.skip_bound=!0,this.$$set(t),this.$$.skip_bound=!1)}}export{W as A,G as B,X as C,n as D,a as E,P as F,tt as S,g as a,y as b,E as c,A as d,m as e,k as f,h as g,x as h,Z as i,d as j,f as k,b as l,N as m,w as n,t as o,_ as p,R as q,r,c as s,p as t,$ as u,U as v,V as w,K as x,Q as y,J as z};
