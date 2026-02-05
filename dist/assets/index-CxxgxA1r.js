function a(o,t){return n=>{const r=o.safeParse(n);if(r.success)return{};const s={};return"error"in r&&r.error.errors.forEach(e=>{s[e.path.join(".")]=e.message}),s}}export{a as z};
