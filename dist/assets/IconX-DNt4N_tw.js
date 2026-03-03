import{r as l,u as M,dZ as R,j as r,b6 as x}from"./index-Bp4DjzAT.js";import{c as s}from"./createReactComponent-FdeXSdV4.js";const I={multiple:!1},C=l.forwardRef((o,c)=>{const{onChange:a,children:u,multiple:n,accept:i,name:p,form:d,resetRef:f,disabled:g,capture:h,inputProps:m,...v}=M("FileButton",I,o),t=l.useRef(null),y=()=>{var e;!g&&((e=t.current)==null||e.click())},k=e=>{if(e.currentTarget.files===null)return a(n?[]:null);a(n?Array.from(e.currentTarget.files):e.currentTarget.files[0]||null)};return R(f,()=>{t.current&&(t.current.value="")}),r.jsxs(r.Fragment,{children:[r.jsx("input",{style:{display:"none"},type:"file",accept:i,multiple:n,onChange:k,ref:x(c,t),name:p,form:d,capture:h,...m}),u({onClick:y,...v})]})});C.displayName="@mantine/core/FileButton";/**
 * @license @tabler/icons-react v3.14.0 - MIT
 *
 * This source code is licensed under the MIT license.
 * See the LICENSE file in the root directory of this source tree.
 */var b=s("outline","download","IconDownload",[["path",{d:"M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2",key:"svg-0"}],["path",{d:"M7 11l5 5l5 -5",key:"svg-1"}],["path",{d:"M12 4l0 12",key:"svg-2"}]]);/**
 * @license @tabler/icons-react v3.14.0 - MIT
 *
 * This source code is licensed under the MIT license.
 * See the LICENSE file in the root directory of this source tree.
 */var B=s("outline","upload","IconUpload",[["path",{d:"M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2",key:"svg-0"}],["path",{d:"M7 9l5 -5l5 5",key:"svg-1"}],["path",{d:"M12 4l0 12",key:"svg-2"}]]);/**
 * @license @tabler/icons-react v3.14.0 - MIT
 *
 * This source code is licensed under the MIT license.
 * See the LICENSE file in the root directory of this source tree.
 */var P=s("outline","x","IconX",[["path",{d:"M18 6l-12 12",key:"svg-0"}],["path",{d:"M6 6l12 12",key:"svg-1"}]]);export{C as F,P as I,b as a,B as b};
