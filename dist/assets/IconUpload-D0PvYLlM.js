import{r as s,u as R,bw as M,j as r,bL as x}from"./index-ioEK-4XP.js";import{c as l}from"./createReactComponent-2piXsRCk.js";const w={multiple:!1},C=s.forwardRef((o,u)=>{const{onChange:a,children:c,multiple:n,accept:i,name:p,form:d,resetRef:f,disabled:g,capture:h,inputProps:m,...v}=R("FileButton",w,o),t=s.useRef(null),y=()=>{var e;!g&&((e=t.current)==null||e.click())},k=e=>{if(e.currentTarget.files===null)return a(n?[]:null);a(n?Array.from(e.currentTarget.files):e.currentTarget.files[0]||null)};return M(f,()=>{t.current&&(t.current.value="")}),r.jsxs(r.Fragment,{children:[r.jsx("input",{style:{display:"none"},type:"file",accept:i,multiple:n,onChange:k,ref:x(u,t),name:p,form:d,capture:h,...m}),c({onClick:y,...v})]})});C.displayName="@mantine/core/FileButton";/**
 * @license @tabler/icons-react v3.14.0 - MIT
 *
 * This source code is licensed under the MIT license.
 * See the LICENSE file in the root directory of this source tree.
 */var b=l("outline","download","IconDownload",[["path",{d:"M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2",key:"svg-0"}],["path",{d:"M7 11l5 5l5 -5",key:"svg-1"}],["path",{d:"M12 4l0 12",key:"svg-2"}]]);/**
 * @license @tabler/icons-react v3.14.0 - MIT
 *
 * This source code is licensed under the MIT license.
 * See the LICENSE file in the root directory of this source tree.
 */var B=l("outline","upload","IconUpload",[["path",{d:"M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2",key:"svg-0"}],["path",{d:"M7 9l5 -5l5 5",key:"svg-1"}],["path",{d:"M12 4l0 12",key:"svg-2"}]]);export{C as F,b as I,B as a};
