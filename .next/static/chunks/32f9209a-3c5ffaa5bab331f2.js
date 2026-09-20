"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[797],{9981:function(e,t,r){r.d(t,{C:function(){return tg},D:function(){return o5},F:function(){return tp},I:function(){return nT},K:function(){return nB},M:function(){return oQ},N:function(){return o7},Q:function(){return nE},S:function(){return o9},T:function(){return J},Y:function(){return K},_:function(){return rG},a:function(){return rH},a5:function(){return oW},a6:function(){return t$},a7:function(){return eR},a8:function(){return eh},a9:function(){return th},aL:function(){return nb},aV:function(){return o3},aa:function(){return tq},ab:function(){return F},ac:function(){return H},ad:function(){return oX},ae:function(){return T},am:function(){return p},b:function(){return ey},c:function(){return tz},d:function(){return o2},e:function(){return tQ},f:function(){return O},g:function(){return nU},h:function(){return tG},i:function(){return tI},j:function(){return tj},k:function(){return tK},l:function(){return nk},m:function(){return oJ},n:function(){return nL},o:function(){return rU},p:function(){return nO},q:function(){return nP},s:function(){return Y},t:function(){return P},u:function(){return o6},x:function(){return o4}});var n,s,i,a,o=r(1480),u=r(9074),l=r(6552),c=r(3693),h=r(4575),d=r(7120),m=r(6300).Buffer;r(357);/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let f="12.18.0";function p(e){f=e}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let g=new c.Yd("@firebase/firestore");function y(){return g.logLevel}function w(e,...t){if(g.logLevel<=c.in.DEBUG){let r=t.map(E);g.debug(`Firestore (${f}): ${e}`,...r)}}function v(e,...t){if(g.logLevel<=c.in.ERROR){let r=t.map(E);g.error(`Firestore (${f}): ${e}`,...r)}}function _(e,...t){if(g.logLevel<=c.in.WARN){let r=t.map(E);g.warn(`Firestore (${f}): ${e}`,...r)}}function E(e){if("string"==typeof e)return e;try{return JSON.stringify(e)}catch(t){return e}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function T(e,t,r){let n="Unexpected state";"string"==typeof t?n=t:r=t,x(e,n,r)}function x(e,t,r){let n=`FIRESTORE (${f}) INTERNAL ASSERTION FAILED: ${t} (ID: ${e.toString(16)})`;if(void 0!==r)try{n+=" CONTEXT: "+JSON.stringify(r)}catch(e){n+=" CONTEXT: "+r}throw v(n),Error(n)}function b(e,t,r,n){let s="Unexpected state";"string"==typeof r?s=r:n=r,e||x(t,s,n)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class N{static newId(){let e=62*Math.floor(256/62),t="";for(;t.length<20;){let r=/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function(e){let t="undefined"!=typeof self&&(self.crypto||self.msCrypto),r=new Uint8Array(40);if(t&&"function"==typeof t.getRandomValues)t.getRandomValues(r);else for(let e=0;e<40;e++)r[e]=Math.floor(256*Math.random());return r}(0);for(let n=0;n<r.length;++n)t.length<20&&r[n]<e&&(t+="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".charAt(r[n]%62))}return t}}function S(e,t){return e<t?-1:e>t?1:0}function I(e,t){let r=Math.min(e.length,t.length);for(let n=0;n<r;n++){let r=e.charAt(n),s=t.charAt(n);if(r!==s)return C(r)===C(s)?S(r,s):C(r)?1:-1}return S(e.length,t.length)}function C(e){let t=e.charCodeAt(0);return t>=55296&&t<=57343}function V(e,t,r){return e.length===t.length&&e.every((e,n)=>r(e,t[n]))}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class A{constructor(e,t){this.comparator=e,this.root=t||k.EMPTY}insert(e,t){return new A(this.comparator,this.root.insert(e,t,this.comparator).copy(null,null,k.BLACK,null,null))}remove(e){return new A(this.comparator,this.root.remove(e,this.comparator).copy(null,null,k.BLACK,null,null))}get(e){let t=this.root;for(;!t.isEmpty();){let r=this.comparator(e,t.key);if(0===r)return t.value;r<0?t=t.left:r>0&&(t=t.right)}return null}indexOf(e){let t=0,r=this.root;for(;!r.isEmpty();){let n=this.comparator(e,r.key);if(0===n)return t+r.left.size;n<0?r=r.left:(t+=r.left.size+1,r=r.right)}return -1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal((t,r)=>(e(t,r),!1))}toString(){let e=[];return this.inorderTraversal((t,r)=>(e.push(`${t}:${r}`),!1)),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new D(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new D(this.root,e,this.comparator,!1)}getReverseIterator(){return new D(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new D(this.root,e,this.comparator,!0)}}class D{constructor(e,t,r,n){this.isReverse=n,this.nodeStack=[];let s=1;for(;!e.isEmpty();)if(s=t?r(e.key,t):1,t&&n&&(s*=-1),s<0)e=this.isReverse?e.left:e.right;else{if(0===s){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop(),t={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return t}hasNext(){return this.nodeStack.length>0}peek(){if(0===this.nodeStack.length)return null;let e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}}class k{constructor(e,t,r,n,s){this.key=e,this.value=t,this.color=null!=r?r:k.RED,this.left=null!=n?n:k.EMPTY,this.right=null!=s?s:k.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,t,r,n,s){return new k(null!=e?e:this.key,null!=t?t:this.value,null!=r?r:this.color,null!=n?n:this.left,null!=s?s:this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,t,r){let n=this,s=r(e,n.key);return(n=s<0?n.copy(null,null,null,n.left.insert(e,t,r),null):0===s?n.copy(null,t,null,null,null):n.copy(null,null,null,null,n.right.insert(e,t,r))).fixUp()}removeMin(){if(this.left.isEmpty())return k.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),(e=e.copy(null,null,null,e.left.removeMin(),null)).fixUp()}remove(e,t){let r,n=this;if(0>t(e,n.key))n.left.isEmpty()||n.left.isRed()||n.left.left.isRed()||(n=n.moveRedLeft()),n=n.copy(null,null,null,n.left.remove(e,t),null);else{if(n.left.isRed()&&(n=n.rotateRight()),n.right.isEmpty()||n.right.isRed()||n.right.left.isRed()||(n=n.moveRedRight()),0===t(e,n.key)){if(n.right.isEmpty())return k.EMPTY;r=n.right.min(),n=n.copy(r.key,r.value,null,null,n.right.removeMin())}n=n.copy(null,null,null,null,n.right.remove(e,t))}return n.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=(e=(e=e.copy(null,null,null,null,e.right.rotateRight())).rotateLeft()).colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=(e=e.rotateRight()).colorFlip()),e}rotateLeft(){let e=this.copy(null,null,k.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){let e=this.copy(null,null,k.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){let e=this.left.copy(null,null,!this.left.color,null,null),t=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,t)}checkMaxDepth(){return Math.pow(2,this.check())<=this.size+1}check(){if(this.isRed()&&this.left.isRed())throw T(43730,{key:this.key,value:this.value});if(this.right.isRed())throw T(14113,{key:this.key,value:this.value});let e=this.left.check();if(e!==this.right.check())throw T(27949);return e+(this.isRed()?0:1)}}k.EMPTY=null,k.RED=!0,k.BLACK=!1,k.EMPTY=new class{constructor(){this.size=0}get key(){throw T(57766)}get value(){throw T(16141)}get color(){throw T(16727)}get left(){throw T(29726)}get right(){throw T(36894)}copy(e,t,r,n,s){return this}insert(e,t,r){return new k(e,t)}remove(e,t){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class L{constructor(e){this.comparator=e,this.data=new A(this.comparator)}has(e){return null!==this.data.get(e)}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal((t,r)=>(e(t),!1))}forEachInRange(e,t){let r=this.data.getIteratorFrom(e[0]);for(;r.hasNext();){let n=r.getNext();if(this.comparator(n.key,e[1])>=0)return;t(n.key)}}forEachWhile(e,t){let r;for(r=void 0!==t?this.data.getIteratorFrom(t):this.data.getIterator();r.hasNext();)if(!e(r.getNext().key))return}firstAfterOrEqual(e){let t=this.data.getIteratorFrom(e);return t.hasNext()?t.getNext().key:null}getIterator(){return new R(this.data.getIterator())}getIteratorFrom(e){return new R(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let t=this;return t.size<e.size&&(t=e,e=this),e.forEach(e=>{t=t.add(e)}),t}isEqual(e){if(!(e instanceof L)||this.size!==e.size)return!1;let t=this.data.getIterator(),r=e.data.getIterator();for(;t.hasNext();){let e=t.getNext().key,n=r.getNext().key;if(0!==this.comparator(e,n))return!1}return!0}toArray(){let e=[];return this.forEach(t=>{e.push(t)}),e}toString(){let e=[];return this.forEach(t=>e.push(t)),"SortedSet("+e.toString()+")"}copy(e){let t=new L(this.comparator);return t.data=e,t}}class R{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let P={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class O extends u.ZR{constructor(e,t){super(e,t),this.code=e,this.message=t,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let U="__name__";class M{constructor(e,t,r){void 0===t?t=0:t>e.length&&T(637,{offset:t,range:e.length}),void 0===r?r=e.length-t:r>e.length-t&&T(1746,{length:r,range:e.length-t}),this.segments=e,this.offset=t,this.len=r}get length(){return this.len}isEqual(e){return 0===M.comparator(this,e)}child(e){let t=this.segments.slice(this.offset,this.limit());return e instanceof M?e.forEach(e=>{t.push(e)}):t.push(e),this.construct(t)}limit(){return this.offset+this.length}popFirst(e){return e=void 0===e?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return 0===this.length}isPrefixOf(e){if(e.length<this.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}forEach(e){for(let t=this.offset,r=this.limit();t<r;t++)e(this.segments[t])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,t){let r=Math.min(e.length,t.length);for(let n=0;n<r;n++){let r=M.compareSegments(e.get(n),t.get(n));if(0!==r)return r}return S(e.length,t.length)}static compareSegments(e,t){let r=M.isNumericId(e),n=M.isNumericId(t);return r&&!n?-1:!r&&n?1:r&&n?M.extractNumericId(e).compare(M.extractNumericId(t)):I(e,t)}static isNumericId(e){return e.startsWith("__id")&&e.endsWith("__")}static extractNumericId(e){return l.z8.fromString(e.substring(4,e.length-2))}}class F extends M{construct(e,t,r){return new F(e,t,r)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toStringWithLeadingSlash(){return`/${this.canonicalString()}`}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){let t=[];for(let r of e){if(r.indexOf("//")>=0)throw new O(P.INVALID_ARGUMENT,`Invalid segment (${r}). Paths must not contain // in them.`);t.push(...r.split("/").filter(e=>e.length>0))}return new F(t)}static emptyPath(){return new F([])}}let q=/^[_a-zA-Z][_a-zA-Z0-9]*$/,$=class e extends M{construct(t,r,n){return new e(t,r,n)}static isValidIdentifier(e){return q.test(e)}canonicalString(){return this.toArray().map(t=>(t=t.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),e.isValidIdentifier(t)||(t="`"+t+"`"),t)).join(".")}toString(){return this.canonicalString()}isKeyField(){return 1===this.length&&this.get(0)===U}static keyField(){return new e([U])}static fromServerFormat(t){let r=[],n="",s=0,i=()=>{if(0===n.length)throw new O(P.INVALID_ARGUMENT,`Invalid field path (${t}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);r.push(n),n=""},a=!1;for(;s<t.length;){let e=t[s];if("\\"===e){if(s+1===t.length)throw new O(P.INVALID_ARGUMENT,"Path has trailing escape character: "+t);let e=t[s+1];if("\\"!==e&&"."!==e&&"`"!==e)throw new O(P.INVALID_ARGUMENT,"Path has invalid escape sequence: "+t);n+=e,s+=2}else"`"===e?a=!a:"."!==e||a?n+=e:i(),s++}if(i(),a)throw new O(P.INVALID_ARGUMENT,"Unterminated ` in path: "+t);return new e(r)}static emptyPath(){return new e([])}};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class B{constructor(e){this.fields=e,e.sort($.comparator)}static empty(){return new B([])}unionWith(e){let t=new L($.comparator);for(let e of this.fields)t=t.add(e);for(let r of e)t=t.add(r);return new B(t.toArray())}covers(e){for(let t of this.fields)if(t.isPrefixOf(e))return!0;return!1}isEqual(e){return V(this.fields,e.fields,(e,t)=>e.isEqual(t))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function z(e){let t=0;for(let r in e)Object.prototype.hasOwnProperty.call(e,r)&&t++;return t}function j(e,t){for(let r in e)Object.prototype.hasOwnProperty.call(e,r)&&t(r,e[r])}function G(e){for(let t in e)if(Object.prototype.hasOwnProperty.call(e,t))return!1;return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class K{constructor(e){this.path=e}static fromPath(e){return new K(F.fromString(e))}static fromName(e){return new K(F.fromString(e).popFirst(5))}static empty(){return new K(F.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return null!==e&&0===F.comparator(this.path,e.path)}toString(){return this.path.toString()}static comparator(e,t){return F.comparator(e.path,t.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new K(new F(e.slice()))}}function Q(e){if(K.isDocumentKey(e))throw new O(P.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${e} has ${e.length}.`)}function W(e){return"object"==typeof e&&null!==e&&(Object.getPrototypeOf(e)===Object.prototype||null===Object.getPrototypeOf(e))}function H(e){if(void 0===e)return"undefined";if(null===e)return"null";if("string"==typeof e)return e.length>20&&(e=`${e.substring(0,20)}...`),JSON.stringify(e);if("number"==typeof e||"boolean"==typeof e)return""+e;if("object"==typeof e){if(e instanceof Array)return"an array";{var t;let r=(t=e).constructor?t.constructor.name:null;return r?`a custom ${r} object`:"an object"}}return"function"==typeof e?"a function":T(12329,{type:typeof e})}function Y(e,t){if("_delegate"in e&&(e=e._delegate),!(e instanceof t)){if(t.name===e.constructor.name)throw new O(P.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{let r=H(e);throw new O(P.INVALID_ARGUMENT,`Expected type '${t.name}', but it was: ${r}`)}}return e}function J(e,t){if(t<=0)throw new O(P.INVALID_ARGUMENT,`Function ${e}() requires a positive number, but it was: ${t}.`)}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function X(e,t){let r={typeString:e};return t&&(r.value=t),r}function Z(e,t){let r;if(!W(e))throw new O(P.INVALID_ARGUMENT,"JSON must be an object");for(let n in t)if(t[n]){let s=t[n].typeString,i="value"in t[n]?{value:t[n].value}:void 0;if(!(n in e)){r=`JSON missing required field: '${n}'`;break}let a=e[n];if(s&&typeof a!==s){r=`JSON field '${n}' must be a ${s}.`;break}if(void 0!==i&&a!==i.value){r=`Expected '${n}' field to equal '${i.value}'`;break}}if(r)throw new O(P.INVALID_ARGUMENT,r);return!0}class ee{static now(){return ee.fromMillis(Date.now())}static fromDate(e){return ee.fromMillis(e.getTime())}static fromMillis(e){let t=Math.floor(e/1e3);return new ee(t,Math.floor((e-1e3*t)*1e6))}constructor(e,t){if(this.seconds=e,this.nanoseconds=t,t<0||t>=1e9)throw new O(P.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(e<-62135596800||e>=253402300800)throw new O(P.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/1e6}_compareTo(e){return this.seconds===e.seconds?S(this.nanoseconds,e.nanoseconds):S(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{type:ee._jsonSchemaVersion,seconds:this.seconds,nanoseconds:this.nanoseconds}}static fromJSON(e){if(Z(e,ee._jsonSchema))return new ee(e.seconds,e.nanoseconds)}valueOf(){return String(this.seconds- -62135596800).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}ee._jsonSchemaVersion="firestore/timestamp/1.0",ee._jsonSchema={type:X("string",ee._jsonSchemaVersion),seconds:X("number"),nanoseconds:X("number")};/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class et extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class er{constructor(e){this.binaryString=e}static fromBase64String(e){return new er(function(e){try{return atob(e)}catch(e){throw"undefined"!=typeof DOMException&&e instanceof DOMException?new et("Invalid base64 string: "+e):e}}(e))}static fromUint8Array(e){return new er(function(e){let t="";for(let r=0;r<e.length;++r)t+=String.fromCharCode(e[r]);return t}(e))}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return btoa(this.binaryString)}toUint8Array(){return function(e){let t=new Uint8Array(e.length);for(let r=0;r<e.length;r++)t[r]=e.charCodeAt(r);return t}(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return S(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}}er.EMPTY_BYTE_STRING=new er("");let en=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function es(e){if(b(!!e,39018),"string"==typeof e){let t=0,r=en.exec(e);if(b(!!r,46558,{timestamp:e}),r[1]){let e=r[1];t=Number(e=(e+"000000000").substr(0,9))}return{seconds:Math.floor(new Date(e).getTime()/1e3),nanos:t}}return{seconds:ei(e.seconds),nanos:ei(e.nanos)}}function ei(e){return"number"==typeof e?e:"string"==typeof e?Number(e):0}function ea(e){return"string"==typeof e?er.fromBase64String(e):er.fromUint8Array(e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let eo="server_timestamp",eu="__type__",el="__previous_value__",ec="__local_write_time__";function eh(e){return(e?.mapValue?.fields||{})[eu]?.stringValue===eo}function ed(e){let t=e.mapValue.fields[el];return eh(t)?ed(t):t}function em(e){let t=es(e.mapValue.fields[ec].timestampValue);return new ee(t.seconds,t.nanos)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ef{constructor(e,t,r,n,s,i,a,o,u,l,c,h,d){this.databaseId=e,this.appId=t,this.persistenceKey=r,this.host=n,this.ssl=s,this.forceLongPolling=i,this.autoDetectLongPolling=a,this.longPollingOptions=o,this.useFetchStreams=u,this.isUsingEmulator=l,this.apiKey=c,this._customHeaders=h,this.grpcFlowControlWindow=d}}let ep="(default)";class eg{constructor(e,t){this.projectId=e,this.database=t||ep}static empty(){return new eg("","")}get isDefaultDatabase(){return this.database===ep}isEqual(e){return e instanceof eg&&e.projectId===this.projectId&&e.database===this.database}}function ey(e,t){if(!Object.prototype.hasOwnProperty.apply(e.options,["projectId"]))throw new O(P.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new eg(e.options.projectId,t)}function ew(e){return 0===e&&1/e==-1/0}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let ev="__type__",e_="__max__",eE={mapValue:{fields:{__type__:{stringValue:e_}}}},eT="__vector__",ex="value",eb={nullValue:"NULL_VALUE"},eN={booleanValue:!0},eS={booleanValue:!1};function eI(e){return"nullValue"in e?0:"booleanValue"in e?1:"integerValue"in e||"doubleValue"in e?2:"timestampValue"in e?3:"stringValue"in e?5:"bytesValue"in e?6:"referenceValue"in e?7:"geoPointValue"in e?8:"arrayValue"in e?9:"mapValue"in e?eh(e)?4:eG(e)?9007199254740991:eB(e)?10:11:T(28295,{value:e})}function eC(e,t,r){if(e===t)return!0;let n=eI(e);if(n!==eI(t))return!1;switch(n){case 0:case 9007199254740991:return!0;case 1:return e.booleanValue===t.booleanValue;case 4:return em(e).isEqual(em(t));case 3:return function(e,t){if("string"==typeof e.timestampValue&&"string"==typeof t.timestampValue&&e.timestampValue.length===t.timestampValue.length)return e.timestampValue===t.timestampValue;let r=es(e.timestampValue),n=es(t.timestampValue);return r.seconds===n.seconds&&r.nanos===n.nanos}(e,t);case 5:return e.stringValue===t.stringValue;case 6:return ea(e.bytesValue).isEqual(ea(t.bytesValue));case 7:return e.referenceValue===t.referenceValue;case 8:return ei(e.geoPointValue.latitude)===ei(t.geoPointValue.latitude)&&ei(e.geoPointValue.longitude)===ei(t.geoPointValue.longitude);case 2:return function(e,t,r){let n,s;if("integerValue"in e&&"integerValue"in t)return ei(e.integerValue)===ei(t.integerValue);if("doubleValue"in e&&"doubleValue"in t)n=ei(e.doubleValue),s=ei(t.doubleValue);else{if(!r?.t)return!1;n=ei(e.integerValue??e.doubleValue),s=ei(t.integerValue??t.doubleValue)}return n===s?!!r?.i||ew(n)===ew(s):!!(void 0===r||r.o)&&isNaN(n)&&isNaN(s)}(e,t,r);case 9:return V(e.arrayValue.values||[],t.arrayValue.values||[],(e,t)=>eC(e,t,r));case 10:case 11:return function(e,t,r){let n=e.mapValue.fields||{},s=t.mapValue.fields||{};if(z(n)!==z(s))return!1;for(let e in n)if(n.hasOwnProperty(e)&&(void 0===s[e]||!eC(n[e],s[e],r)))return!1;return!0}(e,t,r);default:return T(52216,{left:e})}}function eV(e,t){return void 0!==(e.values||[]).find(e=>eC(e,t))}function eA(e,t){if(e===t)return 0;let r=eI(e),n=eI(t);if(r!==n)return S(r,n);switch(r){case 0:case 9007199254740991:return 0;case 1:return S(e.booleanValue,t.booleanValue);case 2:return function(e,t){let r=ei(e.integerValue||e.doubleValue),n=ei(t.integerValue||t.doubleValue);return r<n?-1:r>n?1:r===n?0:isNaN(r)?isNaN(n)?0:-1:1}(e,t);case 3:return eD(e.timestampValue,t.timestampValue);case 4:return eD(em(e),em(t));case 5:return I(e.stringValue,t.stringValue);case 6:return function(e,t){let r=ea(e),n=ea(t);return r.compareTo(n)}(e.bytesValue,t.bytesValue);case 7:return function(e,t){let r=e.split("/"),n=t.split("/");for(let e=0;e<r.length&&e<n.length;e++){let t=S(r[e],n[e]);if(0!==t)return t}return S(r.length,n.length)}(e.referenceValue,t.referenceValue);case 8:return function(e,t){let r=S(ei(e.latitude),ei(t.latitude));return 0!==r?r:S(ei(e.longitude),ei(t.longitude))}(e.geoPointValue,t.geoPointValue);case 9:return ek(e.arrayValue,t.arrayValue);case 10:return function(e,t){let r=e.fields||{},n=t.fields||{},s=r[ex]?.arrayValue,i=n[ex]?.arrayValue,a=S(s?.values?.length||0,i?.values?.length||0);return 0!==a?a:ek(s,i)}(e.mapValue,t.mapValue);case 11:return function(e,t){if(e===eE.mapValue&&t===eE.mapValue)return 0;if(e===eE.mapValue)return 1;if(t===eE.mapValue)return -1;let r=e.fields||{},n=Object.keys(r),s=t.fields||{},i=Object.keys(s);n.sort(),i.sort();for(let e=0;e<n.length&&e<i.length;++e){let t=I(n[e],i[e]);if(0!==t)return t;let a=eA(r[n[e]],s[i[e]]);if(0!==a)return a}return S(n.length,i.length)}(e.mapValue,t.mapValue);default:throw T(23264,{u:r})}}function eD(e,t){if("string"==typeof e&&"string"==typeof t&&e.length===t.length)return S(e,t);let r=es(e),n=es(t),s=S(r.seconds,n.seconds);return 0!==s?s:S(r.nanos,n.nanos)}function ek(e,t){let r=e.values||[],n=t.values||[];for(let e=0;e<r.length&&e<n.length;++e){let t=eA(r[e],n[e]);if(void 0!==t&&0!==t)return t}return S(r.length,n.length)}function eL(e){var t,r;return"nullValue"in e?"null":"booleanValue"in e?""+e.booleanValue:"integerValue"in e?""+e.integerValue:"doubleValue"in e?""+e.doubleValue:"timestampValue"in e?function(e){let t=es(e);return`time(${t.seconds},${t.nanos})`}(e.timestampValue):"stringValue"in e?e.stringValue:"bytesValue"in e?ea(e.bytesValue).toBase64():"referenceValue"in e?(t=e.referenceValue,K.fromName(t).toString()):"geoPointValue"in e?(r=e.geoPointValue,`geo(${r.latitude},${r.longitude})`):"arrayValue"in e?function(e){let t="[",r=!0;for(let n of e.values||[])r?r=!1:t+=",",t+=eL(n);return t+"]"}(e.arrayValue):"mapValue"in e?function(e){let t=Object.keys(e.fields||{}).sort(),r="{",n=!0;for(let s of t)n?n=!1:r+=",",r+=`${s}:${eL(e.fields[s])}`;return r+"}"}(e.mapValue):T(61005,{value:e})}function eR(e,t){return{referenceValue:`projects/${e.projectId}/databases/${e.database}/documents/${t.path.canonicalString()}`}}function eP(e){return!!e&&"integerValue"in e}function eO(e){return!!e&&"doubleValue"in e}function eU(e){return eP(e)||eO(e)}function eM(e){return!!e&&"arrayValue"in e}function eF(e){return!!e&&"nullValue"in e}function eq(e){return!!e&&"doubleValue"in e&&isNaN(Number(e.doubleValue))}function e$(e){return!!e&&"mapValue"in e}function eB(e){return(e?.mapValue?.fields||{})[ev]?.stringValue===eT}function ez(e){return(e?.mapValue?.fields||{})[ex]?.arrayValue}function ej(e){if(e.geoPointValue)return{geoPointValue:{...e.geoPointValue}};if(e.timestampValue&&"object"==typeof e.timestampValue)return{timestampValue:{...e.timestampValue}};if(e.mapValue){let t={mapValue:{fields:{}}};return j(e.mapValue.fields,(e,r)=>t.mapValue.fields[e]=ej(r)),t}if(e.arrayValue){let t={arrayValue:{values:[]}};for(let r=0;r<(e.arrayValue.values||[]).length;++r)t.arrayValue.values[r]=ej(e.arrayValue.values[r]);return t}return{...e}}function eG(e){return(((e.mapValue||{}).fields||{}).__type__||{}).stringValue===e_}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class eK{constructor(e){this.value=e}static empty(){return new eK({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let t=this.value;for(let r=0;r<e.length-1;++r)if(!e$(t=(t.mapValue.fields||{})[e.get(r)]))return null;return(t=(t.mapValue.fields||{})[e.lastSegment()])||null}}set(e,t){this.getFieldsMap(e.popLast())[e.lastSegment()]=ej(t)}setAll(e){let t=$.emptyPath(),r={},n=[];e.forEach((e,s)=>{if(!t.isImmediateParentOf(s)){let e=this.getFieldsMap(t);this.applyChanges(e,r,n),r={},n=[],t=s.popLast()}e?r[s.lastSegment()]=ej(e):n.push(s.lastSegment())});let s=this.getFieldsMap(t);this.applyChanges(s,r,n)}delete(e){let t=this.field(e.popLast());e$(t)&&t.mapValue.fields&&delete t.mapValue.fields[e.lastSegment()]}isEqual(e){return eC(this.value,e.value)}getFieldsMap(e){let t=this.value;t.mapValue.fields||(t.mapValue={fields:{}});for(let r=0;r<e.length;++r){let n=t.mapValue.fields[e.get(r)];e$(n)&&n.mapValue.fields||(n={mapValue:{fields:{}}},t.mapValue.fields[e.get(r)]=n),t=n}return t.mapValue.fields}applyChanges(e,t,r){for(let n of(j(t,(t,r)=>e[t]=r),r))delete e[n]}clone(){return new eK(ej(this.value))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function eQ(e,t){if(e.useProto3Json){if(isNaN(t))return{doubleValue:"NaN"};if(t===1/0)return{doubleValue:"Infinity"};if(t===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:ew(t)?"-0":t}}function eW(e){return{integerValue:""+e}}function eH(e,t,r){return"number"==typeof t&&Number.isInteger(t)&&!ew(t)&&t<=Number.MAX_SAFE_INTEGER&&t>=Number.MIN_SAFE_INTEGER?eW(t):eQ(e,t)}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class eY{constructor(){this._=void 0}}class eJ extends eY{}class eX extends eY{constructor(e){super(),this.elements=e}}function eZ(e,t){let r=e8(t);for(let t of e.elements)r.some(e=>eC(e,t))||r.push(t);return{arrayValue:{values:r}}}class e0 extends eY{constructor(e){super(),this.elements=e}}function e1(e,t){let r=e8(t);for(let t of e.elements)r=r.filter(e=>!eC(e,t));return{arrayValue:{values:r}}}class e2 extends eY{constructor(e,t){super(),this.serializer=e,this.l=t}}class e3 extends e2{}class e4 extends e2{}class e6 extends e2{}function e9(e,t,r){if(!eU(t))return e.l;let n=r(e5(t),e5(e.l));return eP(t)&&eP(e.l)?eW(n):eQ(e.serializer,n)}function e5(e){return ei(e.integerValue||e.doubleValue)}function e8(e){return eM(e)&&e.arrayValue.values?e.arrayValue.values.slice():[]}class e7{constructor(e,t){this.updateTime=e,this.exists=t}static none(){return new e7}static exists(e){return new e7(void 0,e)}static updateTime(e){return new e7(e)}get isNone(){return void 0===this.updateTime&&void 0===this.exists}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}}function te(e,t){return void 0!==e.updateTime?t.isFoundDocument()&&t.version.isEqual(e.updateTime):void 0===e.exists||e.exists===t.isFoundDocument()}class tt{}function tr(e,t){if(!e.hasLocalMutations||t&&0===t.fields.length)return null;if(null===t)return e.isNoDocument()?new tc(e.key,e7.none()):new ti(e.key,e.data,e7.none());{let r=e.data,n=eK.empty(),s=new L($.comparator);for(let e of t.fields)if(!s.has(e)){let t=r.field(e);null===t&&e.length>1&&(e=e.popLast(),t=r.field(e)),null===t?n.delete(e):n.set(e,t),s=s.add(e)}return new ta(e.key,n,new B(s.toArray()),e7.none())}}function tn(e,t,r,n){return e instanceof ti?function(e,t,r,n){if(!te(e.precondition,t))return r;let s=e.value.clone(),i=tl(e.fieldTransforms,n,t);return s.setAll(i),t.convertToFoundDocument(t.version,s).setHasLocalMutations(),null}(e,t,r,n):e instanceof ta?function(e,t,r,n){if(!te(e.precondition,t))return r;let s=tl(e.fieldTransforms,n,t),i=t.data;return(i.setAll(to(e)),i.setAll(s),t.convertToFoundDocument(t.version,i).setHasLocalMutations(),null===r)?null:r.unionWith(e.fieldMask.fields).unionWith(e.fieldTransforms.map(e=>e.field))}(e,t,r,n):te(e.precondition,t)?(t.convertToNoDocument(t.version).setHasLocalMutations(),null):r}function ts(e,t){var r,n;return e.type===t.type&&!!e.key.isEqual(t.key)&&!!e.precondition.isEqual(t.precondition)&&(r=e.fieldTransforms,n=t.fieldTransforms,!!(void 0===r&&void 0===n||!(!r||!n)&&V(r,n,(e,t)=>{var r,n;return e.field.isEqual(t.field)&&(r=e.transform,n=t.transform,r instanceof eX&&n instanceof eX||r instanceof e0&&n instanceof e0?V(r.elements,n.elements,eC):r instanceof e3&&n instanceof e3||r instanceof e4&&n instanceof e4||r instanceof e6&&n instanceof e6?eC(r.l,n.l):r instanceof eJ&&n instanceof eJ)})))&&(0===e.type?e.value.isEqual(t.value):1!==e.type||e.data.isEqual(t.data)&&e.fieldMask.isEqual(t.fieldMask))}class ti extends tt{constructor(e,t,r,n=[]){super(),this.key=e,this.value=t,this.precondition=r,this.fieldTransforms=n,this.type=0}getFieldMask(){return null}}class ta extends tt{constructor(e,t,r,n,s=[]){super(),this.key=e,this.data=t,this.fieldMask=r,this.precondition=n,this.fieldTransforms=s,this.type=1}getFieldMask(){return this.fieldMask}}function to(e){let t=new Map;return e.fieldMask.fields.forEach(r=>{if(!r.isEmpty()){let n=e.data.field(r);t.set(r,n)}}),t}function tu(e,t,r){let n=new Map;b(e.length===r.length,32656,{h:r.length,T:e.length});for(let i=0;i<r.length;i++){var s;let a=e[i],o=a.transform,u=t.data.field(a.field);n.set(a.field,(s=r[i],o instanceof eX?eZ(o,u):o instanceof e0?e1(o,u):s))}return n}function tl(e,t,r){let n=new Map;for(let s of e){let e=s.transform,i=r.data.field(s.field);n.set(s.field,e instanceof eJ?function(e,t){let r={fields:{[eu]:{stringValue:eo},[ec]:{timestampValue:{seconds:e.seconds,nanos:e.nanoseconds}}}};return t&&eh(t)&&(t=ed(t)),t&&(r.fields[el]=t),{mapValue:r}}(t,i):e instanceof eX?eZ(e,i):e instanceof e0?e1(e,i):e instanceof e3?function(e,t){let r=e instanceof e3?eU(t)?t:{integerValue:0}:null,n=e5(r)+e5(e.l);return eP(r)&&eP(e.l)?eW(n):eQ(e.serializer,n)}(e,i):e instanceof e4?e9(e,i,Math.min):e instanceof e6?e9(e,i,Math.max):void 0)}return n}class tc extends tt{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class th{constructor(e,t){this.position=e,this.inclusive=t}}function td(e,t,r){let n=0;for(let s=0;s<e.position.length;s++){let i=t[s],a=e.position[s];if(n=i.field.isKeyField()?K.comparator(K.fromName(a.referenceValue),r.key):eA(a,r.data.field(i.field)),"desc"===i.dir&&(n*=-1),0!==n)break}return n}function tm(e,t){if(null===e)return null===t;if(null===t||e.inclusive!==t.inclusive||e.position.length!==t.position.length)return!1;for(let r=0;r<e.position.length;r++)if(!eC(e.position[r],t.position[r]))return!1;return!0}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tf{}class tp extends tf{constructor(e,t,r){super(),this.field=e,this.op=t,this.value=r}static create(e,t,r){return e.isKeyField()?"in"===t||"not-in"===t?this.createKeyFieldInFilter(e,t,r):new tv(e,t,r):"array-contains"===t?new tx(e,r):"in"===t?new tb(e,r):"not-in"===t?new tN(e,r):"array-contains-any"===t?new tS(e,r):new tp(e,t,r)}static createKeyFieldInFilter(e,t,r){return"in"===t?new t_(e,r):new tE(e,r)}matches(e){let t=e.data.field(this.field);return"!="===this.op?null!==t&&void 0===t.nullValue&&this.matchesComparison(eA(t,this.value)):null!==t&&eI(this.value)===eI(t)&&this.matchesComparison(eA(t,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return 0===e;case"!=":return 0!==e;case">":return e>0;case">=":return e>=0;default:return T(47266,{operator:this.op})}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class tg extends tf{constructor(e,t){super(),this.filters=e,this.op=t,this.P=null}static create(e,t){return new tg(e,t)}matches(e){return ty(this)?void 0===this.filters.find(t=>!t.matches(e)):void 0!==this.filters.find(t=>t.matches(e))}getFlattenedFilters(){return null!==this.P||(this.P=this.filters.reduce((e,t)=>e.concat(t.getFlattenedFilters()),[])),this.P}getFilters(){return Object.assign([],this.filters)}}function ty(e){return"and"===e.op}function tw(e){for(let t of e.filters)if(t instanceof tg)return!1;return!0}class tv extends tp{constructor(e,t,r){super(e,t,r),this.key=K.fromName(r.referenceValue)}matches(e){let t=K.comparator(e.key,this.key);return this.matchesComparison(t)}}class t_ extends tp{constructor(e,t){super(e,"in",t),this.keys=tT("in",t)}matches(e){return this.keys.some(t=>t.isEqual(e.key))}}class tE extends tp{constructor(e,t){super(e,"not-in",t),this.keys=tT("not-in",t)}matches(e){return!this.keys.some(t=>t.isEqual(e.key))}}function tT(e,t){return(t.arrayValue?.values||[]).map(e=>K.fromName(e.referenceValue))}class tx extends tp{constructor(e,t){super(e,"array-contains",t)}matches(e){let t=e.data.field(this.field);return eM(t)&&eV(t.arrayValue,this.value)}}class tb extends tp{constructor(e,t){super(e,"in",t)}matches(e){let t=e.data.field(this.field);return null!==t&&eV(this.value.arrayValue,t)}}class tN extends tp{constructor(e,t){super(e,"not-in",t)}matches(e){if(eV(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;let t=e.data.field(this.field);return null!==t&&void 0===t.nullValue&&!eV(this.value.arrayValue,t)}}class tS extends tp{constructor(e,t){super(e,"array-contains-any",t)}matches(e){let t=e.data.field(this.field);return!(!eM(t)||!t.arrayValue.values)&&t.arrayValue.values.some(e=>eV(this.value.arrayValue,e))}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tI{constructor(e,t="asc"){this.field=e,this.dir=t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tC{static fromTimestamp(e){return new tC(e)}static min(){return new tC(new ee(0,0))}static max(){return new tC(new ee(253402300799,999999999))}constructor(e){this.timestamp=e}compareTo(e){return this.timestamp._compareTo(e.timestamp)}isEqual(e){return this.timestamp.isEqual(e.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tV{constructor(e,t,r,n,s,i,a){this.key=e,this.documentType=t,this.version=r,this.readTime=n,this.createTime=s,this.data=i,this.documentState=a}static newInvalidDocument(e){return new tV(e,0,tC.min(),tC.min(),tC.min(),eK.empty(),0)}static newFoundDocument(e,t,r,n){return new tV(e,1,t,tC.min(),r,n,0)}static newNoDocument(e,t){return new tV(e,2,t,tC.min(),tC.min(),eK.empty(),0)}static newUnknownDocument(e,t){return new tV(e,3,t,tC.min(),tC.min(),eK.empty(),2)}convertToFoundDocument(e,t){return this.createTime.isEqual(tC.min())&&(2===this.documentType||0===this.documentType)&&(this.createTime=e),this.version=e,this.documentType=1,this.data=t,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=eK.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=eK.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=tC.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return 1===this.documentState}get hasCommittedMutations(){return 2===this.documentState}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return 0!==this.documentType}isFoundDocument(){return 1===this.documentType}isNoDocument(){return 2===this.documentType}isUnknownDocument(){return 3===this.documentType}isEqual(e){return e instanceof tV&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new tV(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}class tA{constructor(e,t,r,n){this.indexId=e,this.collectionGroup=t,this.fields=r,this.indexState=n}}tA.UNKNOWN_ID=-1;class tD{constructor(e,t,r){this.readTime=e,this.documentKey=t,this.largestBatchId=r}static min(){return new tD(tC.min(),K.empty(),-1)}static max(){return new tD(tC.max(),K.empty(),-1)}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tk{constructor(e,t=null,r=[],n=[],s=null,i=null,a=null){this.path=e,this.collectionGroup=t,this.orderBy=r,this.filters=n,this.limit=s,this.startAt=i,this.endAt=a,this.R=null}}function tL(e,t=null,r=[],n=[],s=null,i=null,a=null){return new tk(e,t,r,n,s,i,a)}function tR(e){if(null===e.R){let t=e.path.canonicalString();null!==e.collectionGroup&&(t+="|cg:"+e.collectionGroup),t+="|f:"+e.filters.map(e=>(function e(t){if(t instanceof tp)return t.field.canonicalString()+t.op.toString()+eL(t.value);if(tw(t)&&ty(t))return t.filters.map(t=>e(t)).join(",");{let r=t.filters.map(t=>e(t)).join(",");return`${t.op}(${r})`}})(e)).join(",")+"|ob:"+e.orderBy.map(e=>e.field.canonicalString()+e.dir).join(","),null==e.limit||(t+="|l:"+e.limit),e.startAt&&(t+="|lb:"+(e.startAt.inclusive?"b:":"a:")+e.startAt.position.map(e=>eL(e)).join(",")),e.endAt&&(t+="|ub:"+(e.endAt.inclusive?"a:":"b:")+e.endAt.position.map(e=>eL(e)).join(",")),e.R=t}return e.R}function tP(e,t){if(e.limit!==t.limit||e.orderBy.length!==t.orderBy.length)return!1;for(let s=0;s<e.orderBy.length;s++){var r,n;if(r=e.orderBy[s],n=t.orderBy[s],!(r.dir===n.dir&&r.field.isEqual(n.field)))return!1}if(e.filters.length!==t.filters.length)return!1;for(let r=0;r<e.filters.length;r++)if(!function e(t,r){return t instanceof tp?r instanceof tp&&t.op===r.op&&t.field.isEqual(r.field)&&eC(t.value,r.value):t instanceof tg?r instanceof tg&&t.op===r.op&&t.filters.length===r.filters.length&&t.filters.reduce((t,n,s)=>t&&e(n,r.filters[s]),!0):void T(19439)}(e.filters[r],t.filters[r]))return!1;return e.collectionGroup===t.collectionGroup&&!!e.path.isEqual(t.path)&&!!tm(e.startAt,t.startAt)&&tm(e.endAt,t.endAt)}function tO(e){return!!e.isCorePipeline}function tU(e){return!!e.path&&K.isDocumentKey(e.path)&&null===e.collectionGroup&&0===e.filters.length}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tM{constructor(e,t=null,r=[],n=[],s=null,i="F",a=null,o=null){this.path=e,this.collectionGroup=t,this.explicitOrderBy=r,this.filters=n,this.limit=s,this.limitType=i,this.startAt=a,this.endAt=o,this.I=null,this.A=null,this.V=null,this.startAt,this.endAt}}function tF(e){return 0===e.filters.length&&null===e.limit&&null==e.startAt&&null==e.endAt&&(0===e.explicitOrderBy.length||1===e.explicitOrderBy.length&&e.explicitOrderBy[0].field.isKeyField())}function tq(e){return null!==e.collectionGroup}function t$(e){if(null===e.I){let t;e.I=[];let r=new Set;for(let t of e.explicitOrderBy)e.I.push(t),r.add(t.field.canonicalString());let n=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc";(t=new L($.comparator),e.filters.forEach(e=>{e.getFlattenedFilters().forEach(e=>{e.isInequality()&&(t=t.add(e.field))})}),t).forEach(t=>{r.has(t.canonicalString())||t.isKeyField()||e.I.push(new tI(t,n))}),r.has($.keyField().canonicalString())||e.I.push(new tI($.keyField(),n))}return e.I}function tB(e){return e.A||(e.A=function(e,t){if("F"===e.limitType)return tL(e.path,e.collectionGroup,t,e.filters,e.limit,e.startAt,e.endAt);{t=t.map(e=>{let t="desc"===e.dir?"asc":"desc";return new tI(e.field,t)});let r=e.endAt?new th(e.endAt.position,e.endAt.inclusive):null,n=e.startAt?new th(e.startAt.position,e.startAt.inclusive):null;return tL(e.path,e.collectionGroup,t,e.filters,e.limit,r,n)}}(e,t$(e))),e.A}function tz(e,t){let r=e.filters.concat([t]);return new tM(e.path,e.collectionGroup,e.explicitOrderBy.slice(),r,e.limit,e.limitType,e.startAt,e.endAt)}function tj(e,t){let r=e.explicitOrderBy.concat([t]);return new tM(e.path,e.collectionGroup,r,e.filters.slice(),e.limit,e.limitType,e.startAt,e.endAt)}function tG(e,t,r){return new tM(e.path,e.collectionGroup,e.explicitOrderBy.slice(),e.filters.slice(),t,r,e.startAt,e.endAt)}function tK(e,t){return new tM(e.path,e.collectionGroup,e.explicitOrderBy.slice(),e.filters.slice(),e.limit,e.limitType,t,e.endAt)}function tQ(e,t){return new tM(e.path,e.collectionGroup,e.explicitOrderBy.slice(),e.filters.slice(),e.limit,e.limitType,e.startAt,t)}function tW(e){var t;let r;return`Query(target=${r=(t=tB(e)).path.canonicalString(),null!==t.collectionGroup&&(r+=" collectionGroup="+t.collectionGroup),t.filters.length>0&&(r+=`, filters: [${t.filters.map(e=>(function e(t){return t instanceof tp?`${t.field.canonicalString()} ${t.op} ${eL(t.value)}`:t instanceof tg?t.op.toString()+" {"+t.getFilters().map(e).join(" ,")+"}":"Filter"})(e)).join(", ")}]`),null==t.limit||(r+=", limit: "+t.limit),t.orderBy.length>0&&(r+=`, orderBy: [${t.orderBy.map(e=>`${e.field.canonicalString()} (${e.dir})`).join(", ")}]`),t.startAt&&(r+=", startAt: "+(t.startAt.inclusive?"b:":"a:")+t.startAt.position.map(e=>eL(e)).join(",")),t.endAt&&(r+=", endAt: "+(t.endAt.inclusive?"a:":"b:")+t.endAt.position.map(e=>eL(e)).join(",")),`Target(${r})`}; limitType=${e.limitType})`}function tH(e,t){return t.isFoundDocument()&&function(e,t){let r=t.key.path;return null!==e.collectionGroup?t.key.hasCollectionId(e.collectionGroup)&&e.path.isPrefixOf(r):K.isDocumentKey(e.path)?e.path.isEqual(r):e.path.isImmediateParentOf(r)}(e,t)&&function(e,t){for(let r of t$(e))if(!r.field.isKeyField()&&null===t.data.field(r.field))return!1;return!0}(e,t)&&function(e,t){for(let r of e.filters)if(!r.matches(t))return!1;return!0}(e,t)&&(!e.startAt||!!function(e,t,r){let n=td(e,t,r);return e.inclusive?n<=0:n<0}(e.startAt,t$(e),t))&&(!e.endAt||!!function(e,t,r){let n=td(e,t,r);return e.inclusive?n>=0:n>0}(e.endAt,t$(e),t))}function tY(e){return(t,r)=>{let n=!1;for(let s of t$(e)){let e=function(e,t,r){let n=e.field.isKeyField()?K.comparator(t.key,r.key):function(e,t,r){let n=t.data.field(e),s=r.data.field(e);return null!==n&&null!==s?eA(n,s):T(42886)}(e.field,t,r);switch(e.dir){case"asc":return n;case"desc":return -1*n;default:return T(19790,{direction:e.dir})}}(s,t,r);if(0!==e)return e;n=n||s.field.isKeyField()}return 0}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tJ{constructor(e,t){this.count=e,this.unchangedNames=t}}function tX(e){if(void 0===e)return v("GRPC error has no .code"),P.UNKNOWN;switch(e){case s.OK:return P.OK;case s.CANCELLED:return P.CANCELLED;case s.UNKNOWN:return P.UNKNOWN;case s.DEADLINE_EXCEEDED:return P.DEADLINE_EXCEEDED;case s.RESOURCE_EXHAUSTED:return P.RESOURCE_EXHAUSTED;case s.INTERNAL:return P.INTERNAL;case s.UNAVAILABLE:return P.UNAVAILABLE;case s.UNAUTHENTICATED:return P.UNAUTHENTICATED;case s.INVALID_ARGUMENT:return P.INVALID_ARGUMENT;case s.NOT_FOUND:return P.NOT_FOUND;case s.ALREADY_EXISTS:return P.ALREADY_EXISTS;case s.PERMISSION_DENIED:return P.PERMISSION_DENIED;case s.FAILED_PRECONDITION:return P.FAILED_PRECONDITION;case s.ABORTED:return P.ABORTED;case s.OUT_OF_RANGE:return P.OUT_OF_RANGE;case s.UNIMPLEMENTED:return P.UNIMPLEMENTED;case s.DATA_LOSS:return P.DATA_LOSS;default:return T(39323,{code:e})}}(i=s||(s={}))[i.OK=0]="OK",i[i.CANCELLED=1]="CANCELLED",i[i.UNKNOWN=2]="UNKNOWN",i[i.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",i[i.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",i[i.NOT_FOUND=5]="NOT_FOUND",i[i.ALREADY_EXISTS=6]="ALREADY_EXISTS",i[i.PERMISSION_DENIED=7]="PERMISSION_DENIED",i[i.UNAUTHENTICATED=16]="UNAUTHENTICATED",i[i.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",i[i.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",i[i.ABORTED=10]="ABORTED",i[i.OUT_OF_RANGE=11]="OUT_OF_RANGE",i[i.UNIMPLEMENTED=12]="UNIMPLEMENTED",i[i.INTERNAL=13]="INTERNAL",i[i.UNAVAILABLE=14]="UNAVAILABLE",i[i.DATA_LOSS=15]="DATA_LOSS";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tZ{constructor(e,t){this.mapKeyFn=e,this.equalsFn=t,this.inner={},this.innerSize=0}get(e){let t=this.mapKeyFn(e),r=this.inner[t];if(void 0!==r){for(let[t,n]of r)if(this.equalsFn(t,e))return n}}has(e){return void 0!==this.get(e)}set(e,t){let r=this.mapKeyFn(e),n=this.inner[r];if(void 0===n)return this.inner[r]=[[e,t]],void this.innerSize++;for(let r=0;r<n.length;r++)if(this.equalsFn(n[r][0],e))return void(n[r]=[e,t]);n.push([e,t]),this.innerSize++}delete(e){let t=this.mapKeyFn(e),r=this.inner[t];if(void 0===r)return!1;for(let n=0;n<r.length;n++)if(this.equalsFn(r[n][0],e))return 1===r.length?delete this.inner[t]:r.splice(n,1),this.innerSize--,!0;return!1}forEach(e){j(this.inner,(t,r)=>{for(let[t,n]of r)e(t,n)})}isEmpty(){return G(this.inner)}size(){return this.innerSize}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let t0=new A(K.comparator),t1=new A(K.comparator);function t2(...e){let t=t1;for(let r of e)t=t.insert(r.key,r);return t}function t3(){return new tZ(e=>e.toString(),(e,t)=>e.isEqual(t))}new A(K.comparator);let t4=new L(K.comparator);function t6(...e){let t=t4;for(let r of e)t=t.add(r);return t}let t9=new L(S),t5=new l.z8([4294967295,4294967295],0);function t8(e){let t=(new TextEncoder).encode(e),r=new l.V8;return r.update(t),new Uint8Array(r.digest())}function t7(e){let t=new DataView(e.buffer),r=t.getUint32(0,!0),n=t.getUint32(4,!0),s=t.getUint32(8,!0),i=t.getUint32(12,!0);return[new l.z8([r,n],0),new l.z8([s,i],0)]}class re{constructor(e,t,r){if(this.bitmap=e,this.padding=t,this.hashCount=r,t<0||t>=8)throw new rt(`Invalid padding: ${t}`);if(r<0||e.length>0&&0===this.hashCount)throw new rt(`Invalid hash count: ${r}`);if(0===e.length&&0!==t)throw new rt(`Invalid padding when bitmap length is 0: ${t}`);this.m=8*e.length-t,this.p=l.z8.fromNumber(this.m)}S(e,t,r){let n=e.add(t.multiply(l.z8.fromNumber(r)));return 1===n.compare(t5)&&(n=new l.z8([n.getBits(0),n.getBits(1)],0)),n.modulo(this.p).toNumber()}v(e){return!!(this.bitmap[Math.floor(e/8)]&1<<e%8)}mightContain(e){if(0===this.m)return!1;let[t,r]=t7(t8(e));for(let e=0;e<this.hashCount;e++){let n=this.S(t,r,e);if(!this.v(n))return!1}return!0}static create(e,t,r){let n=new re(new Uint8Array(Math.ceil(e/8)),e%8==0?0:8-e%8,t);return r.forEach(e=>n.insert(e)),n}insert(e){if(0===this.m)return;let[t,r]=t7(t8(e));for(let e=0;e<this.hashCount;e++){let n=this.S(t,r,e);this.D(n)}}D(e){this.bitmap[Math.floor(e/8)]|=1<<e%8}}class rt extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rr{constructor(e,t,r,n,s,i){this.snapshotVersion=e,this.targetChanges=t,this.targetMismatches=r,this.documentUpdates=n,this.augmentedDocumentUpdates=s,this.resolvedLimboDocuments=i}static createSynthesizedRemoteEventForCurrentChange(e,t,r){let n=new Map;return n.set(e,rn.createSynthesizedTargetChangeForCurrentChange(e,t,r)),new rr(tC.min(),n,new A(S),t0,t0,t6())}}class rn{constructor(e,t,r,n,s){this.resumeToken=e,this.current=t,this.addedDocuments=r,this.modifiedDocuments=n,this.removedDocuments=s}static createSynthesizedTargetChangeForCurrentChange(e,t,r){return new rn(r,t,t6(),t6(),t6())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rs{constructor(e,t,r,n){this.C=e,this.removedTargetIds=t,this.key=r,this.F=n}}class ri{constructor(e,t){this.targetId=e,this.O=t}}class ra{constructor(e,t,r=er.EMPTY_BYTE_STRING,n=null){this.state=e,this.targetIds=t,this.resumeToken=r,this.cause=n}}class ro{constructor(e){this.targetId=e,this.M=0,this.N=rh(),this.L=er.EMPTY_BYTE_STRING,this.B=!1,this.U=!0}get current(){return this.B}get resumeToken(){return this.L}get k(){return 0!==this.M}get q(){return this.U}$(e){e.approximateByteSize()>0&&(this.U=!0,this.L=e)}K(){let e=t6(),t=t6(),r=t6();return this.N.forEach((n,s)=>{switch(s){case 0:e=e.add(n);break;case 2:t=t.add(n);break;case 1:r=r.add(n);break;default:T(38017,{changeType:s})}}),new rn(this.L,this.B,e,t,r)}W(){this.U=!1,this.N=rh()}G(e,t){this.U=!0,this.N=this.N.insert(e,t)}j(e){this.U=!0,this.N=this.N.remove(e)}H(){this.M+=1}J(){this.M-=1,b(this.M>=0,3241,{M:this.M,targetId:this.targetId})}Y(){this.U=!0,this.B=!0}}let ru="WatchChangeAggregator";class rl{constructor(e){this.Z=e,this.X=new Map,this.ee=t0,this.te=rc(),this.ne=t0,this.re=rc(),this.ie=new A(S)}se(e){for(let t of e.C)e.F&&e.F.isFoundDocument()?this._e(t,e.F):this.oe(t,e.key,e.F);for(let t of e.removedTargetIds)this.oe(t,e.key,e.F)}ae(e){this.forEachTarget(e,t=>{let r=this.X.get(t);if(r)switch(e.state){case 0:this.ue(t)&&r.$(e.resumeToken);break;case 1:r.J(),r.k||r.W(),r.$(e.resumeToken);break;case 2:r.J(),r.k||this.removeTarget(t);break;case 3:this.ue(t)&&(r.Y(),r.$(e.resumeToken));break;case 4:this.ue(t)&&(this.ce(t),r.$(e.resumeToken));break;default:T(56790,{state:e.state})}else w(ru,`handleTargetChange received targetChange for untracked target ID (${t}) with state (${e.state})`)})}forEachTarget(e,t){e.targetIds.length>0?e.targetIds.forEach(t):this.X.forEach((e,r)=>{this.ue(r)&&t(r)})}le(e){return tO(e)?"documents"===e.getPipelineSourceType()&&1===e.getPipelineDocuments()?.length:tU(e)}Ee(e){let t=e.targetId,r=e.O.count,n=this.he(t);if(n){let s=n.target;if(this.le(s)){if(0===r){let e=new K(tO(s)?F.fromString(s.getPipelineDocuments()[0]):s.path);this.oe(t,e,tV.newNoDocument(e,tC.min()))}else b(1===r,20013,"Single document existence filter with count: "+r)}else{let n=this.Te(t);if(n!==r){let r=this.Pe(e),s=r?this.Re(r,e,n):1;0!==s&&(this.ce(t),this.ie=this.ie.insert(t,2===s?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch"))}}}}Pe(e){let t,r;let n=e.O.unchangedNames;if(!n||!n.bits)return null;let{bits:{bitmap:s="",padding:i=0},hashCount:a=0}=n;try{t=ea(s).toUint8Array()}catch(e){if(e instanceof et)return _("Decoding the base64 bloom filter in existence filter failed ("+e.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw e}try{r=new re(t,i,a)}catch(e){return _(e instanceof rt?"BloomFilter error: ":"Applying bloom filter failed: ",e),null}return 0===r.m?null:r}Re(e,t,r){return t.O.count===r-this.Ve(e,t.targetId)?0:2}Ve(e,t){let r=this.Z.getRemoteKeysForTarget(t),n=0;return r.forEach(r=>{let s=this.Z.Ae(),i=`projects/${s.projectId}/databases/${s.database}/documents/${r.path.canonicalString()}`;e.mightContain(i)||(this.oe(t,r,null),n++)}),n}de(e){let t=new Map;this.X.forEach((r,n)=>{let s=this.he(n);if(s){if(r.current&&this.le(s.target)){let t=new K(tO(s.target)?F.fromString(s.target.getPipelineDocuments()[0]):s.target.path);this.fe(t).has(n)||this.me(n,t)||this.oe(n,t,tV.newNoDocument(t,e))}r.q&&(t.set(n,r.K()),r.W())}});let r=t6();this.re.forEach((e,t)=>{let n=!0;t.forEachWhile(e=>{let t=this.he(e);return!t||"TargetPurposeLimboResolution"===t.purpose||(n=!1,!1)}),n&&(r=r.add(e))}),this.ee.forEach((t,r)=>r.setReadTime(e)),this.ne.forEach((t,r)=>r.setReadTime(e));let n=new rr(e,t,this.ie,this.ee,this.ne,r);return this.ee=t0,this.te=rc(),this.ne=t0,this.re=rc(),this.ie=new A(S),n}_e(e,t){let r=this.X.get(e);if(!r||!this.ue(e))return void w(ru,`addDocumentToTarget received document for unknown inactive target (${e})`);let n=this.me(e,t.key)?2:0;r.G(t.key,n),tO(this.he(e).target)&&"exact"!==this.he(e).target.getPipelineFlavor()?this.ne=this.ne.insert(t.key,t):this.ee=this.ee.insert(t.key,t),this.te=this.te.insert(t.key,this.fe(t.key).add(e)),this.re=this.re.insert(t.key,this.pe(t.key).add(e))}oe(e,t,r){let n=this.X.get(e);n&&this.ue(e)?(this.me(e,t)?n.G(t,1):n.j(t),this.re=this.re.insert(t,this.pe(t).delete(e)),this.re=this.re.insert(t,this.pe(t).add(e)),r&&(tO(this.he(e).target)&&"exact"!==this.he(e).target.getPipelineFlavor()?this.ne=this.ne.insert(t,r):this.ee=this.ee.insert(t,r))):w(ru,`removeDocumentFromTarget received document for unknown or inactive target (${e})`)}removeTarget(e){this.X.delete(e)}Te(e){let t=this.X.get(e);if(!t)return 0;let r=t.K();return this.Z.getRemoteKeysForTarget(e).size+r.addedDocuments.size-r.removedDocuments.size}H(e){let t=this.X.get(e);t||(w(ru,`recordPendingTargetRequest set up tracking for target ID ${e}`),t=new ro(e),this.X.set(e,t)),t.H()}pe(e){let t=this.re.get(e);return t||(t=new L(S),this.re=this.re.insert(e,t)),t}fe(e){let t=this.te.get(e);return t||(t=new L(S),this.te=this.te.insert(e,t)),t}ue(e){let t=null!==this.he(e);return t||w(ru,"Detected inactive target",e),t}he(e){let t=this.X.get(e);return void 0===t||t.k?null:this.Z.ge(e)}ce(e){this.X.set(e,new ro(e)),this.Z.getRemoteKeysForTarget(e).forEach(t=>{this.oe(e,t,null)})}me(e,t){return this.Z.getRemoteKeysForTarget(e).has(t)}}function rc(){return new A(K.comparator)}function rh(){return new A(K.comparator)}let rd={asc:"ASCENDING",desc:"DESCENDING"},rm={"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"},rf={and:"AND",or:"OR"};class rp{constructor(e,t){this.databaseId=e,this.useProto3Json=t}}function rg(e,t){return e.useProto3Json||null==t?t:{value:t}}function ry(e,t){return e.useProto3Json?`${new Date(1e3*t.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+t.nanoseconds).slice(-9)}Z`:{seconds:""+t.seconds,nanos:t.nanoseconds}}function rw(e){let t=es(e);return new ee(t.seconds,t.nanos)}function rv(e,t){return e.useProto3Json?t.toBase64():t.toUint8Array()}function r_(e,t){return ry(e,t.toTimestamp())}function rE(e){return b(!!e,49232),tC.fromTimestamp(rw(e))}function rT(e,t){return rx(e,t).canonicalString()}function rx(e,t){let r=new F(["projects",e.projectId,"databases",e.database]).child("documents");return void 0===t?r:r.child(t)}function rb(e){let t=F.fromString(e);return b(rD(t),10190,{key:t.toString()}),t}function rN(e,t){let r=rb(t);if(r.get(1)!==e.databaseId.projectId)throw new O(P.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+r.get(1)+" vs "+e.databaseId.projectId);if(r.get(3)!==e.databaseId.database)throw new O(P.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+r.get(3)+" vs "+e.databaseId.database);return new K(rC(r))}function rS(e,t){return rT(e.databaseId,t)}function rI(e){return new F(["projects",e.databaseId.projectId,"databases",e.databaseId.database]).canonicalString()}function rC(e){return b(e.length>4&&"documents"===e.get(4),29091,{key:e.toString()}),e.popFirst(5)}function rV(e){return{fieldPath:e.canonicalString()}}function rA(e){return $.fromServerFormat(e.fieldPath)}function rD(e){return e.length>=4&&"projects"===e.get(0)&&"databases"===e.get(2)}function rk(e){return!!e&&"function"==typeof e._toProto&&"ProtoValue"===e._protoValueType}function rL(e,t){let r={fields:{}};return t.forEach((t,n)=>{if("string"!=typeof n)throw Error(`Cannot encode map with non-string key: ${n}`);r.fields[n]=t._toProto(e)}),{mapValue:r}}function rR(e){return{stringValue:e}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function rP(e){return new rp(e,!0)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rO{constructor(e){this._byteString=e}static fromBase64String(e){try{return new rO(er.fromBase64String(e))}catch(e){throw new O(P.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+e)}}static fromUint8Array(e){return new rO(er.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}toJSON(){return{type:rO._jsonSchemaVersion,bytes:this.toBase64()}}static fromJSON(e){if(Z(e,rO._jsonSchema))return rO.fromBase64String(e.bytes)}}rO._jsonSchemaVersion="firestore/bytes/1.0",rO._jsonSchema={type:X("string",rO._jsonSchemaVersion),bytes:X("string")};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rU{constructor(...e){for(let t=0;t<e.length;++t)if(0===e[t].length)throw new O(P.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new $(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rM{constructor(e){this._methodName=e}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rF{constructor(e,t){if(!isFinite(e)||e<-90||e>90)throw new O(P.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(t)||t<-180||t>180)throw new O(P.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+t);this._lat=e,this._long=t}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}_compareTo(e){return S(this._lat,e._lat)||S(this._long,e._long)}toJSON(){return{latitude:this._lat,longitude:this._long,type:rF._jsonSchemaVersion}}static fromJSON(e){if(Z(e,rF._jsonSchema))return new rF(e.latitude,e.longitude)}}rF._jsonSchemaVersion="firestore/geoPoint/1.0",rF._jsonSchema={type:X("string",rF._jsonSchemaVersion),latitude:X("number"),longitude:X("number")};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rq{constructor(e){this.uid=e}isAuthenticated(){return null!=this.uid}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}}rq.UNAUTHENTICATED=new rq(null),rq.GOOGLE_CREDENTIALS=new rq("google-credentials-uid"),rq.FIRST_PARTY=new rq("first-party-uid"),rq.MOCK_USER=new rq("mock-user");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class r${constructor(){this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rB{constructor(e,t){this.user=t,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class rz{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,t){e.enqueueRetryable(()=>t(rq.UNAUTHENTICATED))}shutdown(){}}class rj{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,t){this.changeListener=t,e.enqueueRetryable(()=>t(this.token.user))}shutdown(){this.changeListener=null}}class rG{constructor(e){this.ve=e,this.currentUser=rq.UNAUTHENTICATED,this.De=0,this.forceRefresh=!1,this.auth=null}start(e,t){b(void 0===this.xe,42304);let r=this.De,n=e=>this.De!==r?(r=this.De,t(e)):Promise.resolve(),s=new r$;this.xe=()=>{this.De++,this.currentUser=this.Ce(),s.resolve(),s=new r$,e.enqueueRetryable(()=>n(this.currentUser))};let i=()=>{let t=s;e.enqueueRetryable(async()=>{await t.promise,await n(this.currentUser)})},a=e=>{w("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=e,this.xe&&(this.auth.addAuthTokenListener(this.xe),i())};this.ve.onInit(e=>a(e)),setTimeout(()=>{if(!this.auth){let e=this.ve.getImmediate({optional:!0});e?a(e):(w("FirebaseAuthCredentialsProvider","Auth not yet detected"),s.resolve(),s=new r$)}},0),i()}getToken(){let e=this.De,t=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(t).then(t=>this.De!==e?(w("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):t?(b("string"==typeof t.accessToken,31837,{Fe:t}),new rB(t.accessToken,this.currentUser)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.xe&&this.auth.removeAuthTokenListener(this.xe),this.xe=void 0}Ce(){let e=this.auth&&this.auth.getUid();return b(null===e||"string"==typeof e,2055,{Oe:e}),new rq(e)}}class rK{constructor(e,t,r){this.Me=e,this.Ne=t,this.Le=r,this.type="FirstParty",this.user=rq.FIRST_PARTY,this.Be=new Map}Ue(){return this.Le?this.Le():null}get headers(){this.Be.set("X-Goog-AuthUser",this.Me);let e=this.Ue();return e&&this.Be.set("Authorization",e),this.Ne&&this.Be.set("X-Goog-Iam-Authorization-Token",this.Ne),this.Be}}class rQ{constructor(e,t,r){this.Me=e,this.Ne=t,this.Le=r}getToken(){return Promise.resolve(new rK(this.Me,this.Ne,this.Le))}start(e,t){e.enqueueRetryable(()=>t(rq.FIRST_PARTY))}shutdown(){}invalidateToken(){}}class rW{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class rH{constructor(e,t){this.ke=t,this.forceRefresh=!1,this.appCheck=null,this.qe=null,this.$e=null,(0,o.rh)(e)&&e.settings.appCheckToken&&(this.$e=e.settings.appCheckToken)}start(e,t){b(void 0===this.xe,3512);let r=e=>{null!=e.error&&w("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${e.error.message}`);let r=e.token!==this.qe;return this.qe=e.token,w("FirebaseAppCheckTokenProvider",`Received ${r?"new":"existing"} token.`),r?t(e.token):Promise.resolve()};this.xe=t=>{e.enqueueRetryable(()=>r(t))};let n=e=>{w("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=e,this.xe&&this.appCheck.addTokenListener(this.xe)};this.ke.onInit(e=>n(e)),setTimeout(()=>{if(!this.appCheck){let e=this.ke.getImmediate({optional:!0});e?n(e):w("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}},0)}getToken(){if(this.$e)return Promise.resolve(new rW(this.$e));let e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then(e=>e?(b("string"==typeof e.token,44558,{tokenResult:e}),this.qe=e.token,new rW(e.token)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.xe&&this.appCheck.removeTokenListener(this.xe),this.xe=void 0}}function rY(e){let t={};return void 0!==e.timeoutSeconds&&(t.timeoutSeconds=e.timeoutSeconds),t}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rJ{Ke(e){}shutdown(){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let rX="ConnectivityMonitor";class rZ{constructor(){this.Qe=()=>this.We(),this.Ge=()=>this.ze(),this.je=[],this.He()}Ke(e){this.je.push(e)}shutdown(){window.removeEventListener("online",this.Qe),window.removeEventListener("offline",this.Ge)}He(){window.addEventListener("online",this.Qe),window.addEventListener("offline",this.Ge)}We(){for(let e of(w(rX,"Network connectivity changed: AVAILABLE"),this.je))e(0)}ze(){for(let e of(w(rX,"Network connectivity changed: UNAVAILABLE"),this.je))e(1)}static Je(){return"undefined"!=typeof window&&void 0!==window.addEventListener&&void 0!==window.removeEventListener}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let r0=null;function r1(){return null===r0?r0=268435456+Math.round(2147483648*Math.random()):r0++,"0x"+r0.toString(16)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let r2="RestConnection",r3={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery",ExecutePipeline:"executePipeline"};class r4{get Ye(){return!1}constructor(e){this.databaseInfo=e,this.databaseId=e.databaseId;let t=e.ssl?"https":"http",r=encodeURIComponent(this.databaseId.projectId),n=encodeURIComponent(this.databaseId.database);this.Ze=t+"://"+e.host,this.Xe=`projects/${r}/databases/${n}`,this.et=this.databaseId.database===ep?`project_id=${r}`:`project_id=${r}&database_id=${n}`}tt(e,t,r,n,s){let i=r1(),a=this.nt(e,t.toUriEncodedString());w(r2,`Sending RPC '${e}' ${i}:`,a,r);let o={"google-cloud-resource-prefix":this.Xe,"x-goog-request-params":this.et};this.rt(o,n,s);let{host:l}=new URL(a),c=(0,u.Xx)(l);return this.it(e,a,o,r,c).then(t=>(w(r2,`Received RPC '${e}' ${i}: `,t),t),t=>{throw _(r2,`RPC '${e}' ${i} failed with error: `,t,"url: ",a,"request:",r),t})}st(e,t,r,n,s,i){return this.tt(e,t,r,n,s)}rt(e,t,r){if(e["X-Goog-Api-Client"]="gl-js/ fire/"+f,e["Content-Type"]="text/plain",this.databaseInfo.appId&&(e["X-Firebase-GMPID"]=this.databaseInfo.appId),t&&t.headers.forEach((t,r)=>e[r]=t),r&&r.headers.forEach((t,r)=>e[r]=t),this.databaseInfo._customHeaders)for(let t of Object.keys(this.databaseInfo._customHeaders))e[t]=this.databaseInfo._customHeaders[t]}nt(e,t){let r=r3[e],n=`${this.Ze}/v1/${t}:${r}`;return this.databaseInfo.apiKey&&(n=`${n}?key=${encodeURIComponent(this.databaseInfo.apiKey)}`),n}terminate(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class r6{constructor(e){this._t=e._t,this.ot=e.ot}ut(e){this.ct=e}lt(e){this.Et=e}ht(e){this.Tt=e}onMessage(e){this.Pt=e}close(){this.ot()}send(e){this._t(e)}Rt(){this.ct()}It(){this.Et()}At(e){this.Tt(e)}Vt(e){this.Pt(e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let r9="WebChannelConnection",r5=(e,t,r)=>{e.listen(t,e=>{try{r(e)}catch(e){setTimeout(()=>{throw e},0)}})};class r8 extends r4{constructor(e){super(e),this.dt=[],this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}static ft(){r8.gt||(r5((0,h.FJ)(),h.ju.STAT_EVENT,e=>{e.stat===h.kN.PROXY?w(r9,"STAT_EVENT: detected buffering proxy"):e.stat===h.kN.NOPROXY&&w(r9,"STAT_EVENT: detected no buffering proxy")}),r8.gt=!0)}it(e,t,r,n,s){let i=r1();return new Promise((s,a)=>{let o=new h.JJ;o.setWithCredentials(!0),o.listenOnce(h.tw.COMPLETE,()=>{try{switch(o.getLastErrorCode()){case h.jK.NO_ERROR:let t=o.getResponseJson();w(r9,`XHR for RPC '${e}' ${i} received:`,JSON.stringify(t)),s(t);break;case h.jK.TIMEOUT:w(r9,`RPC '${e}' ${i} timed out`),a(new O(P.DEADLINE_EXCEEDED,"Request time out"));break;case h.jK.HTTP_ERROR:let r=o.getStatus();if(w(r9,`RPC '${e}' ${i} failed with status:`,r,"response text:",o.getResponseText()),r>0){let e=o.getResponseJson();Array.isArray(e)&&(e=e[0]);let t=e?.error;if(t&&t.status&&t.message){let e=function(e){let t=e.toLowerCase().replace(/_/g,"-");return Object.values(P).indexOf(t)>=0?t:P.UNKNOWN}(t.status);a(new O(e,t.message))}else a(new O(P.UNKNOWN,"Server responded with status "+o.getStatus()))}else a(new O(P.UNAVAILABLE,"Connection failed."));break;default:T(9055,{yt:e,streamId:i,wt:o.getLastErrorCode(),bt:o.getLastError()})}}finally{w(r9,`RPC '${e}' ${i} completed.`)}});let u=JSON.stringify(n);w(r9,`RPC '${e}' ${i} sending request:`,n),o.send(t,"POST",u,r,15)})}St(e,t,r){let n=r1(),i=[this.Ze,"/","google.firestore.v1.Firestore","/",e,"/channel"],a=this.createWebChannelTransport(),o={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},u=this.longPollingOptions.timeoutSeconds;void 0!==u&&(o.longPollingTimeout=Math.round(1e3*u)),this.useFetchStreams&&(o.useFetchStreams=!0),this.rt(o.initMessageHeaders,t,r),o.encodeInitMessageHeaders=!0;let l=i.join("");w(r9,`Creating RPC '${e}' stream ${n}: ${l}`,o);let c=a.createWebChannel(l,o);this.vt(c);let d=!1,m=!1,f=new r6({_t:t=>{m?w(r9,`Not sending because RPC '${e}' stream ${n} is closed:`,t):(d||(w(r9,`Opening RPC '${e}' stream ${n} transport.`),c.open(),d=!0),w(r9,`RPC '${e}' stream ${n} sending:`,t),c.send(t))},ot:()=>c.close()});return r5(c,h.ii.EventType.OPEN,()=>{m||(w(r9,`RPC '${e}' stream ${n} transport opened.`),f.Rt())}),r5(c,h.ii.EventType.CLOSE,()=>{m||(m=!0,w(r9,`RPC '${e}' stream ${n} transport closed`),f.At(),this.Dt(c))}),r5(c,h.ii.EventType.ERROR,t=>{m||(m=!0,_(r9,`RPC '${e}' stream ${n} transport errored. Name:`,t.name,"Message:",t.message),f.At(new O(P.UNAVAILABLE,"The operation could not be completed")))}),r5(c,h.ii.EventType.MESSAGE,t=>{if(!m){let r=t.data[0];b(!!r,16349);let i=r?.error||r[0]?.error;if(i){w(r9,`RPC '${e}' stream ${n} received error:`,i);let t=i.status,r=function(e){let t=s[e];if(void 0!==t)return tX(t)}(t),a=i.message;"NOT_FOUND"===t&&a.includes("database")&&a.includes("does not exist")&&a.includes(this.databaseId.database)&&_(`Database '${this.databaseId.database}' not found. Please check your project configuration.`),void 0===r&&(r=P.INTERNAL,a="Unknown error status: "+t+" with message "+i.message),m=!0,f.At(new O(r,a)),c.close()}else w(r9,`RPC '${e}' stream ${n} received:`,r),f.Vt(r)}}),r8.ft(),setTimeout(()=>{f.It()},0),f}terminate(){this.dt.forEach(e=>e.close()),this.dt=[]}vt(e){this.dt.push(e)}Dt(e){this.dt=this.dt.filter(t=>t===e)}rt(e,t,r){super.rt(e,t,r),this.databaseInfo.apiKey&&(e["x-goog-api-key"]=this.databaseInfo.apiKey)}createWebChannelTransport(){return(0,h.UE)()}}r8.gt=!1;class r7{constructor(e,t,r=1e3,n=1.5,s=6e4){this.xt=e,this.timerId=t,this.Ct=r,this.Ft=n,this.Ot=s,this.Mt=0,this.Nt=null,this.Lt=Date.now(),this.reset()}reset(){this.Mt=0}Bt(){this.Mt=this.Ot}Ut(e){this.cancel();let t=Math.floor(this.Mt+this.kt()),r=Math.max(0,Date.now()-this.Lt),n=Math.max(0,t-r);n>0&&w("ExponentialBackoff",`Backing off for ${n} ms (base delay: ${this.Mt} ms, delay with jitter: ${t} ms, last attempt: ${r} ms ago)`),this.Nt=this.xt.enqueueAfterDelay(this.timerId,n,()=>(this.Lt=Date.now(),e())),this.Mt*=this.Ft,this.Mt<this.Ct&&(this.Mt=this.Ct),this.Mt>this.Ot&&(this.Mt=this.Ot)}qt(){null!==this.Nt&&(this.Nt.skipDelay(),this.Nt=null)}cancel(){null!==this.Nt&&(this.Nt.cancel(),this.Nt=null)}kt(){return(Math.random()-.5)*this.Mt}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let ne="PersistentStream";class nt{constructor(e,t,r,n,s,i,a,o){this.xt=e,this.$t=r,this.Kt=n,this.connection=s,this.authCredentialsProvider=i,this.appCheckCredentialsProvider=a,this.listener=o,this.state=0,this.Qt=0,this.Wt=null,this.Gt=null,this.stream=null,this.zt=0,this.jt=new r7(e,t)}Ht(){return 1===this.state||5===this.state||this.Jt()}Jt(){return 2===this.state||3===this.state}start(){this.zt=0,4!==this.state?this.auth():this.Yt()}async stop(){this.Ht()&&await this.close(0)}Zt(){this.state=0,this.jt.reset()}Xt(){this.Jt()&&null===this.Wt&&(this.Wt=this.xt.enqueueAfterDelay(this.$t,6e4,()=>this.en()))}tn(e){this.nn(),this.stream.send(e)}async en(){if(this.Jt())return this.close(0)}nn(){this.Wt&&(this.Wt.cancel(),this.Wt=null)}rn(){this.Gt&&(this.Gt.cancel(),this.Gt=null)}async close(e,t){this.nn(),this.rn(),this.jt.cancel(),this.Qt++,4!==e?this.jt.reset():t&&t.code===P.RESOURCE_EXHAUSTED?(v(t.toString()),v("Using maximum backoff delay to prevent overloading the backend."),this.jt.Bt()):t&&t.code===P.UNAUTHENTICATED&&3!==this.state&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),null!==this.stream&&(this.sn(),this.stream.close(),this.stream=null),this.state=e,await this.listener.ht(t)}sn(){}auth(){this.state=1;let e=this._n(this.Qt),t=this.Qt;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then(([e,r])=>{this.Qt===t&&this.an(e,r)},t=>{e(()=>{let e=new O(P.UNKNOWN,"Fetching auth token failed: "+t.message);return this.un(e)})})}an(e,t){let r=this._n(this.Qt);this.stream=this.cn(e,t),this.stream.ut(()=>{r(()=>this.listener.ut())}),this.stream.lt(()=>{r(()=>(this.state=2,this.Gt=this.xt.enqueueAfterDelay(this.Kt,1e4,()=>(this.Jt()&&(this.state=3),Promise.resolve())),this.listener.lt()))}),this.stream.ht(e=>{r(()=>this.un(e))}),this.stream.onMessage(e=>{r(()=>1==++this.zt?this.En(e):this.onNext(e))})}Yt(){this.state=5,this.jt.Ut(async()=>{this.state=0,this.start()})}un(e){return w(ne,`close with error: ${e}`),this.stream=null,this.close(4,e)}_n(e){return t=>{this.xt.enqueueAndForget(()=>this.Qt===e?t():(w(ne,"stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve()))}}}class nr extends nt{constructor(e,t,r,n,s,i){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",t,r,n,i),this.serializer=s}cn(e,t){return this.connection.St("Listen",e,t)}En(e){return this.onNext(e)}onNext(e){this.jt.reset();let t=function(e,t){let r;if("targetChange"in t){var n,s;t.targetChange;let i="NO_CHANGE"===(n=t.targetChange.targetChangeType||"NO_CHANGE")?0:"ADD"===n?1:"REMOVE"===n?2:"CURRENT"===n?3:"RESET"===n?4:T(39313,{state:n}),a=t.targetChange.targetIds||[],o=(s=t.targetChange.resumeToken,e.useProto3Json?(b(void 0===s||"string"==typeof s,58123),er.fromBase64String(s||"")):(b(void 0===s||s instanceof m||s instanceof Uint8Array,16193),er.fromUint8Array(s||new Uint8Array))),u=t.targetChange.cause;r=new ra(i,a,o,u&&new O(void 0===u.code?P.UNKNOWN:tX(u.code),u.message||"")||null)}else if("documentChange"in t){t.documentChange;let n=t.documentChange;n.document,n.document.name,n.document.updateTime;let s=rN(e,n.document.name),i=rE(n.document.updateTime),a=n.document.createTime?rE(n.document.createTime):tC.min(),o=new eK({mapValue:{fields:n.document.fields}}),u=tV.newFoundDocument(s,i,a,o);r=new rs(n.targetIds||[],n.removedTargetIds||[],u.key,u)}else if("documentDelete"in t){t.documentDelete;let n=t.documentDelete;n.document;let s=rN(e,n.document),i=n.readTime?rE(n.readTime):tC.min(),a=tV.newNoDocument(s,i);r=new rs([],n.removedTargetIds||[],a.key,a)}else if("documentRemove"in t){t.documentRemove;let n=t.documentRemove;n.document;let s=rN(e,n.document);r=new rs([],n.removedTargetIds||[],s,null)}else{if(!("filter"in t))return T(11601,{ye:t});{t.filter;let e=t.filter;e.targetId;let{count:n=0,unchangedNames:s}=e,i=new tJ(n,s);r=new ri(e.targetId,i)}}return r}(this.serializer,e),r=function(e){if(!("targetChange"in e))return tC.min();let t=e.targetChange;return t.targetIds&&t.targetIds.length?tC.min():t.readTime?rE(t.readTime):tC.min()}(e);return this.listener.hn(t,r)}Tn(e){let t={};t.database=rI(this.serializer),t.addTarget=function(e,t){let r;let n=t.target;if((r=tO(n)?{pipelineQuery:{structuredPipeline:{pipeline:{stages:n.stages.map(t=>t._toProto(e))}}}}:tU(n)?{documents:{documents:[rS(e,n.path)]}}:{query:function(e,t){var r,n;let s;let i={structuredQuery:{}},a=t.path;null!==t.collectionGroup?(s=a,i.structuredQuery.from=[{collectionId:t.collectionGroup,allDescendants:!0}]):(s=a.popLast(),i.structuredQuery.from=[{collectionId:a.lastSegment()}]),i.parent=rS(e,s);let o=function(e){if(0!==e.length)return function e(t){return t instanceof tp?function(e){if("=="===e.op){if(eq(e.value))return{unaryFilter:{field:rV(e.field),op:"IS_NAN"}};if(eF(e.value))return{unaryFilter:{field:rV(e.field),op:"IS_NULL"}}}else if("!="===e.op){if(eq(e.value))return{unaryFilter:{field:rV(e.field),op:"IS_NOT_NAN"}};if(eF(e.value))return{unaryFilter:{field:rV(e.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:rV(e.field),op:rm[e.op],value:e.value}}}(t):t instanceof tg?function(t){let r=t.getFilters().map(t=>e(t));return 1===r.length?r[0]:{compositeFilter:{op:rf[t.op],filters:r}}}(t):T(54877,{filter:t})}(tg.create(e,"and"))}(t.filters);o&&(i.structuredQuery.where=o);let u=function(e){if(0!==e.length)return e.map(e=>({field:rV(e.field),direction:rd[e.dir]}))}(t.orderBy);u&&(i.structuredQuery.orderBy=u);let l=rg(e,t.limit);return null!==l&&(i.structuredQuery.limit=l),t.startAt&&(i.structuredQuery.startAt={before:(r=t.startAt).inclusive,values:r.position}),t.endAt&&(i.structuredQuery.endAt={before:!(n=t.endAt).inclusive,values:n.position}),{be:i,parent:s}}(e,n).be}).targetId=t.targetId,t.resumeToken.approximateByteSize()>0){r.resumeToken=rv(e,t.resumeToken);let n=rg(e,t.expectedCount);null!==n&&(r.expectedCount=n)}else if(t.snapshotVersion.compareTo(tC.min())>0){r.readTime=ry(e,t.snapshotVersion.toTimestamp());let n=rg(e,t.expectedCount);null!==n&&(r.expectedCount=n)}return r}(this.serializer,e);let r=function(e,t){let r=function(e){switch(e){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return T(28987,{purpose:e})}}(t.purpose);return null==r?null:{"goog-listen-tags":r}}(this.serializer,e);r&&(t.labels=r),this.tn(t)}Pn(e){let t={};t.database=rI(this.serializer),t.removeTarget=e,this.tn(t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class nn{}class ns extends nn{constructor(e,t,r,n){super(),this.authCredentials=e,this.appCheckCredentials=t,this.connection=r,this.serializer=n,this.fn=!1}mn(){if(this.fn)throw new O(P.FAILED_PRECONDITION,"The client has already been terminated.")}tt(e,t,r,n){return this.mn(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([s,i])=>this.connection.tt(e,rx(t,r),n,s,i)).catch(e=>{throw"FirebaseError"===e.name?(e.code===P.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),e):new O(P.UNKNOWN,e.toString())})}st(e,t,r,n,s){return this.mn(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([i,a])=>this.connection.st(e,rx(t,r),n,i,a,s)).catch(e=>{throw"FirebaseError"===e.name?(e.code===P.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),e):new O(P.UNKNOWN,e.toString())})}terminate(){this.fn=!0,this.connection.terminate()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let ni=new Map,na={didRun:!1,sequenceNumbersCollected:0,targetsRemoved:0,documentsRemoved:0};class no{static withCacheSize(e){return new no(e,no.DEFAULT_COLLECTION_PERCENTILE,no.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT)}constructor(e,t,r){this.cacheSizeCollectionThreshold=e,this.percentileToCollect=t,this.maximumSequenceNumbersToCollect=r}}no.DEFAULT_COLLECTION_PERCENTILE=10,no.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT=1e3,no.DEFAULT=new no(41943040,no.DEFAULT_COLLECTION_PERCENTILE,no.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT),no.DISABLED=new no(-1,0,0);/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class nu{constructor(e,t){this.previousValue=e,t&&(t.sequenceNumberHandler=e=>this.pn(e),this.gn=e=>t.writeSequenceNumber(e))}pn(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){let e=++this.previousValue;return this.gn&&this.gn(e),e}}nu.yn=-1;class nl{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach(e=>e())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function nc(e){if(e.code!==P.FAILED_PRECONDITION||"The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab."!==e.message)throw e;w("LocalStore","Unexpectedly lost primary lease")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class nh{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e(e=>{this.isDone=!0,this.result=e,this.nextCallback&&this.nextCallback(e)},e=>{this.isDone=!0,this.error=e,this.catchCallback&&this.catchCallback(e)})}catch(e){return this.next(void 0,e)}next(e,t){return this.callbackAttached&&T(59440),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(t,this.error):this.wrapSuccess(e,this.result):new nh((r,n)=>{this.nextCallback=t=>{this.wrapSuccess(e,t).next(r,n)},this.catchCallback=e=>{this.wrapFailure(t,e).next(r,n)}})}toPromise(){return new Promise((e,t)=>{this.next(e,t)})}wrapUserFunction(e){try{let t=e();return t instanceof nh?t:nh.resolve(t)}catch(e){return nh.reject(e)}}wrapSuccess(e,t){return e?this.wrapUserFunction(()=>e(t)):nh.resolve(t)}wrapFailure(e,t){return e?this.wrapUserFunction(()=>e(t)):nh.reject(t)}static resolve(e){return new nh((t,r)=>{t(e)})}static reject(e){return new nh((t,r)=>{r(e)})}static waitFor(e){return new nh((t,r)=>{let n=0,s=0,i=!1;e.forEach(e=>{++n,e.next(()=>{++s,i&&s===n&&t()},e=>r(e))}),i=!0,s===n&&t()})}static or(e){let t=nh.resolve(!1);for(let r of e)t=t.next(e=>e?nh.resolve(e):r());return t}static forEach(e,t){let r=[];return e.forEach((e,n)=>{r.push(t.call(this,e,n))}),this.waitFor(r)}static mapArray(e,t){return new nh((r,n)=>{let s=e.length,i=Array(s),a=0;for(let o=0;o<s;o++){let u=o;t(e[u]).next(e=>{i[u]=e,++a===s&&r(i)},e=>n(e))}})}static doWhile(e,t){return new nh((r,n)=>{let s=()=>{!0===e()?t().next(()=>{s()},n):r()};s()})}}function nd(e){return"IndexedDbTransactionError"===e.name}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let nm="LruGarbageCollector";function nf([e,t],[r,n]){let s=S(e,r);return 0===s?S(t,n):s}class np{constructor(e){this.Jn=e,this.buffer=new L(nf),this.Yn=0}Zn(){return++this.Yn}Xn(e){let t=[e,this.Zn()];if(this.buffer.size<this.Jn)this.buffer=this.buffer.add(t);else{let e=this.buffer.last();0>nf(t,e)&&(this.buffer=this.buffer.delete(e).add(t))}}get maxValue(){return this.buffer.last()[0]}}class ng{constructor(e,t,r){this.garbageCollector=e,this.asyncQueue=t,this.localStore=r,this.er=null}start(){-1!==this.garbageCollector.params.cacheSizeCollectionThreshold&&this.tr(6e4)}stop(){this.er&&(this.er.cancel(),this.er=null)}get started(){return null!==this.er}tr(e){w(nm,`Garbage collection scheduled in ${e}ms`),this.er=this.asyncQueue.enqueueAfterDelay("lru_garbage_collection",e,async()=>{this.er=null;try{await this.localStore.collectGarbage(this.garbageCollector)}catch(e){nd(e)?w(nm,"Ignoring IndexedDB error during garbage collection: ",e):await nc(e)}await this.tr(3e5)})}}class ny{constructor(e,t){this.nr=e,this.params=t}calculateTargetCount(e,t){return this.nr.rr(e).next(e=>Math.floor(t/100*e))}nthSequenceNumber(e,t){if(0===t)return nh.resolve(nu.yn);let r=new np(t);return this.nr.forEachTarget(e,e=>r.Xn(e.sequenceNumber)).next(()=>this.nr.ir(e,e=>r.Xn(e))).next(()=>r.maxValue)}removeTargets(e,t,r){return this.nr.removeTargets(e,t,r)}removeOrphanedDocuments(e,t){return this.nr.removeOrphanedDocuments(e,t)}collect(e,t){return -1===this.params.cacheSizeCollectionThreshold?(w("LruGarbageCollector","Garbage collection skipped; disabled"),nh.resolve(na)):this.getCacheSize(e).next(r=>r<this.params.cacheSizeCollectionThreshold?(w("LruGarbageCollector",`Garbage collection skipped; Cache size ${r} is lower than threshold ${this.params.cacheSizeCollectionThreshold}`),na):this.sr(e,t))}getCacheSize(e){return this.nr.getCacheSize(e)}sr(e,t){let r,n,s,i,a,o,u;let l=Date.now();return this.calculateTargetCount(e,this.params.percentileToCollect).next(t=>(t>this.params.maximumSequenceNumbersToCollect?(w("LruGarbageCollector",`Capping sequence numbers to collect down to the maximum of ${this.params.maximumSequenceNumbersToCollect} from ${t}`),n=this.params.maximumSequenceNumbersToCollect):n=t,i=Date.now(),this.nthSequenceNumber(e,n))).next(n=>(r=n,a=Date.now(),this.removeTargets(e,r,t))).next(t=>(s=t,o=Date.now(),this.removeOrphanedDocuments(e,r))).next(e=>(u=Date.now(),y()<=c.in.DEBUG&&w("LruGarbageCollector",`LRU Garbage Collection
	Counted targets in ${i-l}ms
	Determined least recently used ${n} in `+(a-i)+"ms\n"+`	Removed ${s} targets in `+(o-a)+"ms\n"+`	Removed ${e} documents in `+(u-o)+"ms\n"+`Total Duration: ${u-l}ms`),nh.resolve({didRun:!0,sequenceNumbersCollected:n,targetsRemoved:s,documentsRemoved:e})))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let nw="firestore.googleapis.com";class nv{constructor(e){if(void 0===e.host){if(void 0!==e.ssl)throw new O(P.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host=nw,this.ssl=!0}else this.host=e.host,this.ssl=e.ssl??!0;if(this.isUsingEmulator=void 0!==e.emulatorOptions,this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e._customHeaders&&(this._customHeaders={...e._customHeaders}),void 0===e.cacheSizeBytes)this.cacheSizeBytes=41943040;else{if(-1!==e.cacheSizeBytes&&e.cacheSizeBytes<1048576)throw new O(P.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}if(function(e,t,r,n){if(!0===t&&!0===n)throw new O(P.INVALID_ARGUMENT,`${e} and ${r} cannot be used together.`)}("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:void 0===e.experimentalAutoDetectLongPolling?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=rY(e.experimentalLongPollingOptions??{}),function(e){if(void 0!==e.timeoutSeconds){if(isNaN(e.timeoutSeconds))throw new O(P.INVALID_ARGUMENT,`invalid long polling timeout: ${e.timeoutSeconds} (must not be NaN)`);if(e.timeoutSeconds<5)throw new O(P.INVALID_ARGUMENT,`invalid long polling timeout: ${e.timeoutSeconds} (minimum allowed value is 5)`);if(e.timeoutSeconds>30)throw new O(P.INVALID_ARGUMENT,`invalid long polling timeout: ${e.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams,void 0!==e.grpcFlowControlWindow){if("number"!=typeof e.grpcFlowControlWindow||e.grpcFlowControlWindow<=0||e.grpcFlowControlWindow>2147483647||!Number.isInteger(e.grpcFlowControlWindow))throw new O(P.INVALID_ARGUMENT,"grpcFlowControlWindow must be a positive integer and cannot exceed 2147483647");this.grpcFlowControlWindow=e.grpcFlowControlWindow}}isEqual(e){var t,r;return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&(t=this.experimentalLongPollingOptions,r=e.experimentalLongPollingOptions,t.timeoutSeconds===r.timeoutSeconds)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams&&this.grpcFlowControlWindow===e.grpcFlowControlWindow&&function(e,t){if(e===t)return!0;if(!e||!t)return!1;let r=Object.keys(e),n=Object.keys(t);if(r.length!==n.length)return!1;for(let n of r)if(e[n]!==t[n])return!1;return!0}(this._customHeaders,e._customHeaders)}}let n_=class{constructor(e,t,r,n){this._authCredentials=e,this._appCheckCredentials=t,this._databaseId=r,this._app=n,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new nv({}),this._settingsFrozen=!1,this._emulatorOptions={},this._terminateTask="notTerminated"}get app(){if(!this._app)throw new O(P.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return"notTerminated"!==this._terminateTask}_setSettings(e){if(this._settingsFrozen)throw new O(P.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new nv(e),this._emulatorOptions=e.emulatorOptions||{},void 0!==e.credentials&&(this._authCredentials=function(e){if(!e)return new rz;switch(e.type){case"firstParty":return new rQ(e.sessionIndex||"0",e.iamToken||null,e.authTokenFactory||null);case"provider":return e.client;default:throw new O(P.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(e.credentials))}_getSettings(){return this._settings}_getEmulatorOptions(){return this._emulatorOptions}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return"notTerminated"===this._terminateTask&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){"notTerminated"===this._terminateTask?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(e){let t=ni.get(e);t&&(w("ComponentProvider","Removing Datastore"),ni.delete(e),t.terminate())}(this),Promise.resolve()}};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class nE{constructor(e,t,r){this.converter=t,this._query=r,this.type="query",this.firestore=e}withConverter(e){return new nE(this.firestore,e,this._query)}}class nT{constructor(e,t,r){this.converter=t,this._key=r,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new nx(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new nT(this.firestore,e,this._key)}toJSON(){return{type:nT._jsonSchemaVersion,referencePath:this._key.toString()}}static fromJSON(e,t,r){if(Z(t,nT._jsonSchema))return new nT(e,r||null,new K(F.fromString(t.referencePath)))}}nT._jsonSchemaVersion="firestore/documentReference/1.0",nT._jsonSchema={type:X("string",nT._jsonSchemaVersion),referencePath:X("string")};class nx extends nE{constructor(e,t,r){super(e,t,new tM(r)),this._path=r,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){let e=this._path.popLast();return e.isEmpty()?null:new nT(this.firestore,null,new K(e))}withConverter(e){return new nx(this.firestore,e,this._path)}}function nb(e,t,...r){if(e=(0,u.m9)(e),/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function(e,t,r){if(!r)throw new O(P.INVALID_ARGUMENT,`Function ${e}() cannot be called with an empty ${t}.`)}("collection","path",t),e instanceof n_){let n=F.fromString(t,...r);return Q(n),new nx(e,null,n)}{if(!(e instanceof nT||e instanceof nx))throw new O(P.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");let n=e._path.child(F.fromString(t,...r));return Q(n),new nx(e.firestore,null,n)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class nN{constructor(e){this._values=(e||[]).map(e=>e)}toArray(){return this._values.map(e=>e)}isEqual(e){return function(e,t){if(e.length!==t.length)return!1;for(let r=0;r<e.length;++r)if(e[r]!==t[r])return!1;return!0}(this._values,e._values)}toJSON(){return{type:nN._jsonSchemaVersion,vectorValues:this._values}}static fromJSON(e){if(Z(e,nN._jsonSchema)){if(Array.isArray(e.vectorValues)&&e.vectorValues.every(e=>"number"==typeof e))return new nN(e.vectorValues);throw new O(P.INVALID_ARGUMENT,"Expected 'vectorValues' field to be a number array")}}}nN._jsonSchemaVersion="firestore/vectorValue/1.0",nN._jsonSchema={type:X("string",nN._jsonSchemaVersion),vectorValues:X("object")};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let nS=/^__.*__$/;class nI{constructor(e,t,r){this.data=e,this.fieldMask=t,this.fieldTransforms=r}toMutation(e,t){return null!==this.fieldMask?new ta(e,this.data,this.fieldMask,t,this.fieldTransforms):new ti(e,this.data,t,this.fieldTransforms)}}class nC{constructor(e,t,r){this.data=e,this.fieldMask=t,this.fieldTransforms=r}toMutation(e,t){return new ta(e,this.data,this.fieldMask,t,this.fieldTransforms)}}function nV(e){switch(e){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw T(40011,{dataSource:e})}}class nA{constructor(e,t,r,n,s,i){this.settings=e,this.databaseId=t,this.serializer=r,this.ignoreUndefinedProperties=n,void 0===s&&this.validatePath(),this.fieldTransforms=s||[],this.fieldMask=i||[]}get path(){return this.settings.path}get dataSource(){return this.settings.dataSource}contextWith(e){return new nA({...this.settings,...e},this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}childContextForField(e){let t=this.path?.child(e),r=this.contextWith({path:t,arrayElement:!1});return r.validatePathSegment(e),r}childContextForFieldPath(e){let t=this.path?.child(e),r=this.contextWith({path:t,arrayElement:!1});return r.validatePath(),r}childContextForArray(e){return this.contextWith({path:void 0,arrayElement:!0})}createError(e){return nG(e,this.settings.methodName,this.settings.hasConverter||!1,this.path,this.settings.targetDoc)}contains(e){return void 0!==this.fieldMask.find(t=>e.isPrefixOf(t))||void 0!==this.fieldTransforms.find(t=>e.isPrefixOf(t.field))}validatePath(){if(this.path)for(let e=0;e<this.path.length;e++)this.validatePathSegment(this.path.get(e))}validatePathSegment(e){if(0===e.length)throw this.createError("Document fields must not be empty");if(nV(this.dataSource)&&nS.test(e))throw this.createError('Document fields cannot begin and end with "__"')}}class nD{constructor(e,t,r){this.databaseId=e,this.ignoreUndefinedProperties=t,this.serializer=r||rP(e)}createContext(e,t,r,n=!1){return new nA({dataSource:e,methodName:t,targetDoc:r,path:$.emptyPath(),arrayElement:!1,hasConverter:n},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function nk(e){let t=e._freezeSettings(),r=rP(e._databaseId);return new nD(e._databaseId,!!t.ignoreUndefinedProperties,r)}function nL(e,t,r,n,s,i={}){let a,o;let u=e.createContext(i.merge||i.mergeFields?2:0,t,r,s);n$("Data must be an object, but it was:",u,n);let l=nF(n,u);if(i.merge)a=new B(u.fieldMask),o=u.fieldTransforms;else if(i.mergeFields){let e=[];for(let n of i.mergeFields){let s=nB(t,n,r);if(!u.contains(s))throw new O(P.INVALID_ARGUMENT,`Field '${s}' is specified in your field mask but missing from your input data.`);nK(e,s)||e.push(s)}a=new B(e),o=u.fieldTransforms.filter(e=>a.covers(e.field))}else a=null,o=u.fieldTransforms;return new nI(new eK(l),a,o)}class nR extends rM{_toFieldTransform(e){if(2!==e.dataSource)throw 1===e.dataSource?e.createError(`${this._methodName}() can only appear at the top level of your update data`):e.createError(`${this._methodName}() cannot be used with set() unless you pass {merge:true}`);return e.fieldMask.push(e.path),null}isEqual(e){return e instanceof nR}}function nP(e,t,r,n){let s=e.createContext(1,t,r);n$("Data must be an object, but it was:",s,n);let i=[],a=eK.empty();return j(n,(e,n)=>{let o=nj(t,e,r);n=(0,u.m9)(n);let l=s.childContextForFieldPath(o);if(n instanceof nR)i.push(o);else{let e=nM(n,l);null!=e&&(i.push(o),a.set(o,e))}}),new nC(a,new B(i),s.fieldTransforms)}function nO(e,t,r,n,s,i){let a=e.createContext(1,t,r),o=[nB(t,n,r)],l=[s];if(i.length%2!=0)throw new O(P.INVALID_ARGUMENT,`Function ${t}() needs to be called with an even number of arguments that alternate between field names and values.`);for(let e=0;e<i.length;e+=2)o.push(nB(t,i[e])),l.push(i[e+1]);let c=[],h=eK.empty();for(let e=o.length-1;e>=0;--e)if(!nK(c,o[e])){let t=o[e],r=l[e];r=(0,u.m9)(r);let n=a.childContextForFieldPath(t);if(r instanceof nR)c.push(t);else{let e=nM(r,n);null!=e&&(c.push(t),h.set(t,e))}}return new nC(h,new B(c),a.fieldTransforms)}function nU(e,t,r,n=!1){return nM(r,e.createContext(n?4:3,t))}function nM(e,t,r){if(nq(e=(0,u.m9)(e)))return n$("Unsupported field value:",t,e),nF(e,t);if(e instanceof rM)return function(e,t){if(!nV(t.dataSource))throw t.createError(`${e._methodName}() can only be used with update() and set()`);if(!t.path)throw t.createError(`${e._methodName}() is not currently supported inside arrays`);let r=e._toFieldTransform(t);r&&t.fieldTransforms.push(r)}(e,t),null;if(void 0===e&&t.ignoreUndefinedProperties)return null;if(t.path&&t.fieldMask.push(t.path),e instanceof Array){if(t.settings.arrayElement&&4!==t.dataSource)throw t.createError("Nested arrays are not supported");return function(e,t){let r=[],n=0;for(let s of e){let e=nM(s,t.childContextForArray(n));null==e&&(e={nullValue:"NULL_VALUE"}),r.push(e),n++}return{arrayValue:{values:r}}}(e,t)}return function(e,t,r){if(null===(e=(0,u.m9)(e)))return{nullValue:"NULL_VALUE"};if("number"==typeof e)return eH(t.serializer,e);if("boolean"==typeof e)return{booleanValue:e};if("string"==typeof e)return{stringValue:e};if(e instanceof Date){let r=ee.fromDate(e);return{timestampValue:ry(t.serializer,r)}}if(e instanceof ee){let r=new ee(e.seconds,1e3*Math.floor(e.nanoseconds/1e3));return{timestampValue:ry(t.serializer,r)}}if(e instanceof rF)return{geoPointValue:{latitude:e.latitude,longitude:e.longitude}};if(e instanceof rO)return{bytesValue:rv(t.serializer,e._byteString)};if(e instanceof nT){let r=t.databaseId,n=e.firestore._databaseId;if(!n.isEqual(r))throw t.createError(`Document reference is for database ${n.projectId}/${n.database} but should be for database ${r.projectId}/${r.database}`);return{referenceValue:rT(e.firestore._databaseId||t.databaseId,e._key.path)}}if(e instanceof nN){var n;return{mapValue:{fields:{[ev]:{stringValue:eT},[ex]:{arrayValue:{values:((n=e)instanceof nN?n.toArray():n).map(e=>{if("number"!=typeof e)throw t.createError("VectorValues must only contain numeric values.");return eQ(t.serializer,e)})}}}}}}if(rk(e))return e._toProto(t.serializer);throw t.createError(`Unsupported field value: ${H(e)}`)}(e,t)}function nF(e,t){let r={};return G(e)?t.path&&t.path.length>0&&t.fieldMask.push(t.path):j(e,(e,n)=>{let s=nM(n,t.childContextForField(e));null!=s&&(r[e]=s)}),{mapValue:{fields:r}}}function nq(e){return!("object"!=typeof e||null===e||e instanceof Array||e instanceof Date||e instanceof ee||e instanceof rF||e instanceof rO||e instanceof nT||e instanceof rM||e instanceof nN||rk(e))}function n$(e,t,r){if(!nq(r)||!W(r)){let n=H(r);throw"an object"===n?t.createError(e+" a custom object"):t.createError(e+" "+n)}}function nB(e,t,r){if((t=(0,u.m9)(t))instanceof rU)return t._internalPath;if("string"==typeof t)return nj(e,t);throw nG("Field path arguments must be of type string or ",e,!1,void 0,r)}let nz=RegExp("[~\\*/\\[\\]]");function nj(e,t,r){if(t.search(nz)>=0)throw nG(`Invalid field path (${t}). Paths must not contain '~', '*', '/', '[', or ']'`,e,!1,void 0,r);try{return new rU(...t.split("."))._internalPath}catch(n){throw nG(`Invalid field path (${t}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,e,!1,void 0,r)}}function nG(e,t,r,n,s){let i=n&&!n.isEmpty(),a=void 0!==s,o=`Function ${t}() called with invalid data`;r&&(o+=" (via `toFirestore()`)"),o+=". ";let u="";return(i||a)&&(u+=" (found",i&&(u+=` in field ${n}`),a&&(u+=` in document ${s}`),u+=")"),new O(P.INVALID_ARGUMENT,o+e+u)}function nK(e,t){return e.some(e=>e.isEqual(t))}function nQ(e){return"function"==typeof e._readUserData}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class nW{constructor(e){this.optionDefinitions=e}_getKnownOptions(e,t){let r=eK.empty();for(let n in this.optionDefinitions)if(this.optionDefinitions.hasOwnProperty(n)){let s=this.optionDefinitions[n];if(n in e){let i;let a=e[n];s.nestedOptions&&W(a)?i={mapValue:{fields:new nW(s.nestedOptions).getOptionsProto(t,a)}}:a&&(i=nM(a,t)??void 0),i&&r.set($.fromServerFormat(s.serverName),i)}}return r}getOptionsProto(e,t,r){let n=this._getKnownOptions(t,e);if(r){let t=new Map(function(e,t){let r=[];for(let n in e)Object.prototype.hasOwnProperty.call(e,n)&&r.push(t(e[n],n,e));return r}(r,(t,r)=>[$.fromServerFormat(r),void 0!==t?nM(t,e):null]));n.setAll(t)}return n.value.mapValue.fields??{}}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function nH(e){var t;return e instanceof nX?e:W(e)?function(e,t){let r=[];for(let t in e)if(Object.prototype.hasOwnProperty.call(e,t)){let n=e[t];r.push(n9(t)),r.push(nH(n))}return new n8("map",r,"map")}(e):e instanceof Array?(t="array",new n8("array",e.map(e=>nH(e)),t)):n5(e,void 0)}function nY(e){if(e instanceof nX)return e;if(e instanceof nN)return n9(e);if(Array.isArray(e))return n9(new nN(e));throw Error("Unsupported value: "+typeof e)}function nJ(e){return"string"==typeof e?n4(e):nH(e)}class nX{constructor(){this._protoValueType="ProtoValue"}add(e){return new n8("add",[this,nH(e)],"add")}asBoolean(){if(this instanceof n7)return this;if(this instanceof n6)return new st(this);if(this instanceof n3)return new sr(this);if(this instanceof n8)return new se(this);throw new O("invalid-argument",`Conversion of type ${typeof this} to BooleanExpression not supported.`)}subtract(e){return new n8("subtract",[this,nH(e)],"subtract")}multiply(e){return new n8("multiply",[this,nH(e)],"multiply")}divide(e){return new n8("divide",[this,nH(e)],"divide")}mod(e){return new n8("mod",[this,nH(e)],"mod")}equal(e){return new n8("equal",[this,nH(e)],"equal").asBoolean()}notEqual(e){return new n8("not_equal",[this,nH(e)],"notEqual").asBoolean()}lessThan(e){return new n8("less_than",[this,nH(e)],"lessThan").asBoolean()}lessThanOrEqual(e){return new n8("less_than_or_equal",[this,nH(e)],"lessThanOrEqual").asBoolean()}greaterThan(e){return new n8("greater_than",[this,nH(e)],"greaterThan").asBoolean()}greaterThanOrEqual(e){return new n8("greater_than_or_equal",[this,nH(e)],"greaterThanOrEqual").asBoolean()}arrayConcat(e,...t){return new n8("array_concat",[this,...[e,...t].map(e=>nH(e))],"arrayConcat")}arrayContains(e){return new n8("array_contains",[this,nH(e)],"arrayContains").asBoolean()}arrayContainsAll(e){return new n8("array_contains_all",[this,Array.isArray(e)?new n2(e.map(nH),"arrayContainsAll"):e],"arrayContainsAll").asBoolean()}arrayContainsAny(e){return new n8("array_contains_any",[this,Array.isArray(e)?new n2(e.map(nH),"arrayContainsAny"):e],"arrayContainsAny").asBoolean()}arrayReverse(){return new n8("array_reverse",[this])}arrayLength(){return new n8("array_length",[this],"arrayLength")}equalAny(e){return new n8("equal_any",[this,Array.isArray(e)?new n2(e.map(nH),"equalAny"):e],"equalAny").asBoolean()}notEqualAny(e){return new n8("not_equal_any",[this,Array.isArray(e)?new n2(e.map(nH),"notEqualAny"):e],"notEqualAny").asBoolean()}exists(){return new n8("exists",[this],"exists").asBoolean()}charLength(){return new n8("char_length",[this],"charLength")}like(e){return new n8("like",[this,nH(e)],"like").asBoolean()}regexContains(e){return new n8("regex_contains",[this,nH(e)],"regexContains").asBoolean()}regexFind(e){return new n8("regex_find",[this,nH(e)],"regexFind")}regexFindAll(e){return new n8("regex_find_all",[this,nH(e)],"regexFindAll")}regexMatch(e){return new n8("regex_match",[this,nH(e)],"regexMatch").asBoolean()}stringContains(e){return new n8("string_contains",[this,nH(e)],"stringContains").asBoolean()}startsWith(e){return new n8("starts_with",[this,nH(e)],"startsWith").asBoolean()}endsWith(e){return new n8("ends_with",[this,nH(e)],"endsWith").asBoolean()}toLower(){return new n8("to_lower",[this],"toLower")}toUpper(){return new n8("to_upper",[this],"toUpper")}trim(e){let t=[this];return e&&t.push(nH(e)),new n8("trim",t,"trim")}ltrim(e){let t=[this];return e&&t.push(nH(e)),new n8("ltrim",t,"ltrim")}rtrim(e){let t=[this];return e&&t.push(nH(e)),new n8("rtrim",t,"rtrim")}type(){return new n8("type",[this])}isType(e){return new n8("is_type",[this,n9(e)],"isType").asBoolean()}stringConcat(e,...t){return new n8("string_concat",[this,...[e,...t].map(nH)],"stringConcat")}stringIndexOf(e){return new n8("string_index_of",[this,nH(e)],"stringIndexOf")}stringRepeat(e){return new n8("string_repeat",[this,nH(e)],"stringRepeat")}stringReplaceAll(e,t){return new n8("string_replace_all",[this,nH(e),nH(t)],"stringReplaceAll")}stringReplaceOne(e,t){return new n8("string_replace_one",[this,nH(e),nH(t)],"stringReplaceOne")}concat(e,...t){return new n8("concat",[this,...[e,...t].map(nH)],"concat")}reverse(){return new n8("reverse",[this],"reverse")}arrayFilter(e,t){return new n8("array_filter",[this,nH(e),t],"arrayFilter")}arrayTransform(e,t){return new n8("array_transform",[this,nH(e),t],"arrayTransform")}arrayTransformWithIndex(e,t,r){return new n8("array_transform",[this,nH(e),nH(t),r],"arrayTransformWithIndex")}arraySlice(e,t){let r=[this,nH(e)];return void 0!==t&&r.push(nH(t)),new n8("array_slice",r,"arraySlice")}arrayFirst(){return new n8("array_first",[this],"arrayFirst")}arrayFirstN(e){return new n8("array_first_n",[this,nH(e)],"arrayFirstN")}arrayLast(){return new n8("array_last",[this],"arrayLast")}arrayLastN(e){return new n8("array_last_n",[this,nH(e)],"arrayLastN")}arrayMaximum(){return new n8("maximum",[this],"arrayMaximum")}arrayMaximumN(e){return new n8("maximum_n",[this,nH(e)],"arrayMaximumN")}arrayMinimum(){return new n8("minimum",[this],"arrayMinimum")}arrayMinimumN(e){return new n8("minimum_n",[this,nH(e)],"arrayMinimumN")}arrayIndexOf(e){return new n8("array_index_of",[this,nH(e),nH("first")],"arrayIndexOf")}arrayLastIndexOf(e){return new n8("array_index_of",[this,nH(e),nH("last")],"arrayLastIndexOf")}arrayIndexOfAll(e){return new n8("array_index_of_all",[this,nH(e)],"arrayIndexOfAll")}byteLength(){return new n8("byte_length",[this],"byteLength")}ceil(){return new n8("ceil",[this])}floor(){return new n8("floor",[this])}abs(){return new n8("abs",[this])}exp(){return new n8("exp",[this])}mapGet(e){return new n8("map_get",[this,n9(e)],"mapGet")}mapSet(e,t,...r){return new n8("map_set",[this,nH(e),nH(t),...r.map(nH)],"mapSet")}mapKeys(){return new n8("map_keys",[this],"mapKeys")}mapValues(){return new n8("map_values",[this],"mapValues")}mapEntries(){return new n8("map_entries",[this],"mapEntries")}getField(e){return new n8("get_field",[this,nH(e)],"get_field")}count(){return nZ._create("count",[this],"count")}sum(){return nZ._create("sum",[this],"sum")}average(){return nZ._create("average",[this],"average")}minimum(){return nZ._create("minimum",[this],"minimum")}maximum(){return nZ._create("maximum",[this],"maximum")}first(){return nZ._create("first",[this],"first")}last(){return nZ._create("last",[this],"last")}arrayAgg(){return nZ._create("array_agg",[this],"arrayAgg")}arrayAggDistinct(){return nZ._create("array_agg_distinct",[this],"arrayAggDistinct")}countDistinct(){return nZ._create("count_distinct",[this],"countDistinct")}logicalMaximum(e,...t){return new n8("maximum",[this,...[e,...t].map(nH)],"logicalMaximum")}logicalMinimum(e,...t){return new n8("minimum",[this,...[e,...t].map(nH)],"minimum")}vectorLength(){return new n8("vector_length",[this],"vectorLength")}cosineDistance(e){return new n8("cosine_distance",[this,nY(e)],"cosineDistance")}dotProduct(e){return new n8("dot_product",[this,nY(e)],"dotProduct")}euclideanDistance(e){return new n8("euclidean_distance",[this,nY(e)],"euclideanDistance")}unixMicrosToTimestamp(){return new n8("unix_micros_to_timestamp",[this],"unixMicrosToTimestamp")}timestampToUnixMicros(){return new n8("timestamp_to_unix_micros",[this],"timestampToUnixMicros")}unixMillisToTimestamp(){return new n8("unix_millis_to_timestamp",[this],"unixMillisToTimestamp")}timestampToUnixMillis(){return new n8("timestamp_to_unix_millis",[this],"timestampToUnixMillis")}unixSecondsToTimestamp(){return new n8("unix_seconds_to_timestamp",[this],"unixSecondsToTimestamp")}timestampToUnixSeconds(){return new n8("timestamp_to_unix_seconds",[this],"timestampToUnixSeconds")}timestampAdd(e,t){return new n8("timestamp_add",[this,nH(e),nH(t)],"timestampAdd")}timestampSubtract(e,t){return new n8("timestamp_subtract",[this,nH(e),nH(t)],"timestampSubtract")}timestampDiff(e,t){return new n8("timestamp_diff",[this,nJ(e),nH(t)],"timestampDiff")}timestampExtract(e,t){let r=[this,nH(e)];return t&&r.push(nH(t)),new n8("timestamp_extract",r,"timestampExtract")}documentId(){return new n8("document_id",[this],"documentId")}parent(){return new n8("parent",[this],"parent")}substring(e,t){let r=nH(e);return new n8("substring",void 0===t?[this,r]:[this,r,nH(t)],"substring")}arrayGet(e){return new n8("array_get",[this,nH(e)],"arrayGet")}isError(){return new n8("is_error",[this],"isError").asBoolean()}ifError(e){let t=new n8("if_error",[this,nH(e)],"ifError");return e instanceof n7?t.asBoolean():t}isAbsent(){return new n8("is_absent",[this],"isAbsent").asBoolean()}mapRemove(e){return new n8("map_remove",[this,nH(e)],"mapRemove")}mapMerge(e,...t){return new n8("map_merge",[this,nH(e),...t.map(nH)],"mapMerge")}pow(e){return new n8("pow",[this,nH(e)])}trunc(e){return void 0===e?new n8("trunc",[this]):new n8("trunc",[this,nH(e)],"trunc")}round(e){return void 0===e?new n8("round",[this]):new n8("round",[this,nH(e)],"round")}collectionId(){return new n8("collection_id",[this])}length(){return new n8("length",[this])}ln(){return new n8("ln",[this])}sqrt(){return new n8("sqrt",[this])}stringReverse(){return new n8("string_reverse",[this])}ifAbsent(e){return new n8("if_absent",[this,nH(e)],"ifAbsent")}ifNull(e){return new n8("if_null",[this,nH(e)],"ifNull")}coalesce(e,...t){return new n8("coalesce",[this,nH(e),...t.map(nH)],"coalesce")}join(e){return new n8("join",[this,nH(e)],"join")}log10(){return new n8("log10",[this])}arraySum(){return new n8("sum",[this])}split(e){return new n8("split",[this,nH(e)])}timestampTruncate(e,t){let r=[this,nH(e)];return t&&r.push(nH(t)),new n8("timestamp_trunc",r)}ascending(){return new sn(nJ(this),"ascending","ascending")}descending(){return new sn(nJ(this),"descending","descending")}as(e){return new n1(this,e,"as")}}class nZ{constructor(e,t){this.name=e,this.params=t,this.exprType="AggregateFunction",this._protoValueType="ProtoValue"}static _create(e,t,r){let n=new nZ(e,t);return n._methodName=r,n}as(e){return new n0(this,e,"as")}_toProto(e){return{functionValue:{name:this.name,args:this.params.map(t=>t._toProto(e))}}}_readUserData(e){e=this._methodName?e.contextWith({methodName:this._methodName}):e,this.params.forEach(t=>t._readUserData(e))}}class n0{constructor(e,t,r){this.aggregate=e,this.alias=t,this._methodName=r}_readUserData(e){this.aggregate._readUserData(e)}}class n1{constructor(e,t,r){this.expr=e,this.alias=t,this._methodName=r,this.exprType="AliasedExpression",this.selectable=!0}_readUserData(e){this.expr._readUserData(e)}}class n2 extends nX{constructor(e,t){super(),this.ur=e,this._methodName=t,this.expressionType="ListOfExpressions"}_toProto(e){return{arrayValue:{values:this.ur.map(t=>t._toProto(e))}}}_readUserData(e){this.ur.forEach(t=>t._readUserData(e))}}class n3 extends nX{constructor(e,t){super(),this.fieldPath=e,this._methodName=t,this.expressionType="Field",this.selectable=!0}get _fieldPath(){return this.fieldPath}get fieldName(){return this.fieldPath.canonicalString()}get alias(){return this.fieldName}get expr(){return this}geoDistance(e){return new n8("geo_distance",[this,nH(e)],"geoDistance")}_toProto(e){return{fieldReferenceValue:this.fieldPath.canonicalString()}}_readUserData(e){}}function n4(e){var t;return t="field",new n3("string"==typeof e?U===e?new rU(U)._internalPath:nB("field",e):e._internalPath,t)}class n6 extends nX{constructor(e,t){super(),this.value=e,this._methodName=t,this.expressionType="Constant"}static _fromProto(e){let t=new n6(e,void 0);return t._protoValue=e,t}_toProto(e){return b(void 0!==this._protoValue,237),this._protoValue}_getValue(){return this._protoValue}_readUserData(e){var t,r,n,s,i,a,o;e=this._methodName?e.contextWith({methodName:this._methodName}):e,"object"==typeof(t=this._protoValue)&&null!==t&&("nullValue"in t&&(null===t.nullValue||"NULL_VALUE"===t.nullValue)||"booleanValue"in t&&(null===t.booleanValue||"boolean"==typeof t.booleanValue)||"integerValue"in t&&(null===t.integerValue||"number"==typeof t.integerValue||"string"==typeof t.integerValue)||"doubleValue"in t&&(null===t.doubleValue||"number"==typeof t.doubleValue)||"timestampValue"in t&&(null===t.timestampValue||"object"==typeof(r=t.timestampValue)&&null!==r&&"seconds"in r&&(null===r.seconds||"number"==typeof r.seconds||"string"==typeof r.seconds)&&"nanos"in r&&(null===r.nanos||"number"==typeof r.nanos))||"stringValue"in t&&(null===t.stringValue||"string"==typeof t.stringValue)||"bytesValue"in t&&(null===t.bytesValue||t.bytesValue instanceof Uint8Array)||"referenceValue"in t&&(null===t.referenceValue||"string"==typeof t.referenceValue)||"geoPointValue"in t&&(null===t.geoPointValue||"object"==typeof(n=t.geoPointValue)&&null!==n&&"latitude"in n&&(null===n.latitude||"number"==typeof n.latitude)&&"longitude"in n&&(null===n.longitude||"number"==typeof n.longitude))||"arrayValue"in t&&(null===t.arrayValue||"object"==typeof(s=t.arrayValue)&&null!==s&&!(!("values"in s)||null!==s.values&&!Array.isArray(s.values)))||"mapValue"in t&&(null===t.mapValue||"object"==typeof(i=t.mapValue)&&null!==i&&!(!("fields"in i)||null!==i.fields&&!W(i.fields)))||"fieldReferenceValue"in t&&(null===t.fieldReferenceValue||"string"==typeof t.fieldReferenceValue)||"functionValue"in t&&(null===t.functionValue||"object"==typeof(a=t.functionValue)&&null!==a&&!(!("name"in a)||null!==a.name&&"string"!=typeof a.name||!("args"in a)||null!==a.args&&!Array.isArray(a.args)))||"pipelineValue"in t&&(null===t.pipelineValue||"object"==typeof(o=t.pipelineValue)&&null!==o&&!(!("stages"in o)||null!==o.stages&&!Array.isArray(o.stages))))||(this._protoValue=nM(this.value,e))}}function n9(e,t){return n5(e,"constant")}function n5(e,t){let r=new n6(e,t);return"boolean"==typeof e?new st(r):r}class n8 extends nX{constructor(e,t,r,n){super(),this.name=e,this.params=t,this.expressionType="Function",this._optionsProto=void 0,void 0!==r&&(this._methodName=r),void 0!==n&&(this._options=n)}get _optionsUtil(){return new nW({})}_toProto(e){let t={functionValue:{name:this.name,args:this.params.map(t=>t._toProto(e))}};return this._optionsProto&&(t.functionValue.options=this._optionsProto),t}_readUserData(e){e=this._methodName?e.contextWith({methodName:this._methodName}):e,this.params.forEach(t=>t._readUserData(e)),this._options&&(this._optionsProto=this._optionsUtil.getOptionsProto(e,this._options))}}class n7 extends nX{get _methodName(){return this._expr._methodName}countIf(){return nZ._create("count_if",[this],"countIf")}not(){return new n8("not",[this],"not").asBoolean()}conditional(e,t){return new n8("conditional",[this,e,t],"conditional")}ifError(e){let t=nH(e),r=new n8("if_error",[this,t],"ifError");return t instanceof n7?r.asBoolean():r}_toProto(e){return this._expr._toProto(e)}_readUserData(e){this._expr._readUserData(e)}}class se extends n7{constructor(e){super(),this._expr=e,this.expressionType="Function"}}class st extends n7{constructor(e){super(),this._expr=e,this.expressionType="Constant"}_getValue(){return this._expr._getValue()}}class sr extends n7{constructor(e){super(),this._expr=e,this.expressionType="Field"}}class sn{constructor(e,t,r){this.expr=e,this.direction=t,this._methodName=r,this._protoValueType="ProtoValue"}_toProto(e){return{mapValue:{fields:{direction:rR(this.direction),expression:this.expr._toProto(e)}}}}_readUserData(e){this.expr._readUserData(e)}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ss{constructor(e){this.optionsProto=void 0,{rawOptions:this.rawOptions,...this.knownOptions}=e}_readUserData(e){this.optionsProto=this._optionsUtil.getOptionsProto(e,this.knownOptions,this.rawOptions)}_toProto(e){return{name:this._name,options:this.optionsProto}}}class si extends ss{get _name(){return"add_fields"}get _optionsUtil(){return new nW({})}constructor(e,t){super(t),this.fields=e}_toProto(e){return{...super._toProto(e),args:[rL(e,this.fields)]}}_readUserData(e){super._readUserData(e),sw(this.fields,e)}}class sa extends ss{get _name(){return"aggregate"}get _optionsUtil(){return new nW({})}constructor(e,t,r){super(r),this.groups=e,this.accumulators=t}_toProto(e){return{...super._toProto(e),args:[rL(e,this.accumulators),rL(e,this.groups)]}}_readUserData(e){super._readUserData(e),sw(this.groups,e),sw(this.accumulators,e)}}class so extends ss{get _name(){return"distinct"}get _optionsUtil(){return new nW({})}constructor(e,t){super(t),this.groups=e}_toProto(e){return{...super._toProto(e),args:[rL(e,this.groups)]}}_readUserData(e){super._readUserData(e),sw(this.groups,e)}}class su extends ss{get _name(){return"collection"}get _optionsUtil(){return new nW({forceIndex:{serverName:"force_index"}})}constructor(e,t){super(t),this.Er=e.startsWith("/")?e:"/"+e}_toProto(e){return{...super._toProto(e),args:[{referenceValue:this.Er}]}}_readUserData(e){super._readUserData(e)}}class sl extends ss{get _name(){return"collection_group"}get _optionsUtil(){return new nW({forceIndex:{serverName:"force_index"}})}constructor(e,t){super(t),this.collectionId=e}_toProto(e){return{...super._toProto(e),args:[{referenceValue:""},{stringValue:this.collectionId}]}}_readUserData(e){super._readUserData(e)}}class sc extends ss{get _name(){return"database"}get _optionsUtil(){return new nW({})}_toProto(e){return{...super._toProto(e)}}_readUserData(e){super._readUserData(e)}}class sh extends ss{get _name(){return"documents"}get _optionsUtil(){return new nW({})}constructor(e,t){if(super(t),!e||0===e.length)throw new O(P.INVALID_ARGUMENT,"Empty document paths are not allowed in DocumentsSource");let r=e.map(e=>e.startsWith("/")?e:"/"+e),n=new Set(r);if(n.size!==r.length)throw new O(P.INVALID_ARGUMENT,"Duplicate document paths are not allowed in DocumentsSource");this.hr=r,this.Tr=n}_toProto(e){return{...super._toProto(e),args:this.hr.map(e=>({referenceValue:e}))}}_readUserData(e){super._readUserData(e)}}class sd extends ss{get _name(){return"where"}get _optionsUtil(){return new nW({})}constructor(e,t){super(t),this.condition=e}_toProto(e){return{...super._toProto(e),args:[this.condition._toProto(e)]}}_readUserData(e){super._readUserData(e),sw(this.condition,e)}}class sm extends ss{get _name(){return"limit"}get _optionsUtil(){return new nW({})}constructor(e,t){b(!isNaN(e)&&e!==1/0&&e!==-1/0,34860),super(t),this.limit=e}_toProto(e){return{...super._toProto(e),args:[eH(e,this.limit)]}}}class sf extends ss{get _name(){return"offset"}get _optionsUtil(){return new nW({})}constructor(e,t){super(t),this.offset=e}_toProto(e){return{...super._toProto(e),args:[eH(e,this.offset)]}}}class sp extends ss{get _name(){return"select"}get _optionsUtil(){return new nW({})}constructor(e,t){super(t),this.selections=e}_toProto(e){return{...super._toProto(e),args:[rL(e,this.selections)]}}_readUserData(e){super._readUserData(e),sw(this.selections,e)}}class sg extends ss{get _name(){return"sort"}get _optionsUtil(){return new nW({})}constructor(e,t){super(t),this.orderings=e}_toProto(e){return{...super._toProto(e),args:this.orderings.map(t=>t._toProto(e))}}_readUserData(e){super._readUserData(e),sw(this.orderings,e)}}class sy extends ss{get _name(){return"replace_with"}get _optionsUtil(){return new nW({})}constructor(e,t){super(t),this.map=e}_toProto(e){return{...super._toProto(e),args:[this.map._toProto(e),rR(sy.Pr)]}}_readUserData(e){super._readUserData(e),sw(this.map,e)}}function sw(e,t){return nQ(e)?e._readUserData(t):Array.isArray(e)?e.forEach(e=>e._readUserData(t)):e instanceof Map?e.forEach(e=>e._readUserData(t)):Object.values(e).forEach(e=>e._readUserData(t)),e}sy.Pr="full_replace";/**
 * @license
 * Copyright 2026 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class sv{constructor(e,t,r,n){this._db=e,this.userDataReader=t,this._userDataWriter=r,this.stages=n}Ar(e,t){let r=this.userDataReader.createContext(3,e);return nQ(t)?t._readUserData(r):Array.isArray(t)?t.forEach(e=>e._readUserData(r)):t.forEach(e=>e._readUserData(r)),t}where(e){let t=this.stages.map(e=>e);return this.Ar("where",e),t.push(new sd(e,{})),new sv(this._db,this.userDataReader,this._userDataWriter,t)}limit(e){let t=this.stages.map(e=>e);return t.push(new sm(e,{})),new sv(this._db,this.userDataReader,this._userDataWriter,t)}sort(e,...t){let r=this.stages.map(e=>e);return"orderings"in e?r.push(new sg(this.Ar("sort",e.orderings),{})):r.push(new sg(this.Ar("sort",[e,...t]),{})),new sv(this._db,this.userDataReader,this._userDataWriter,r)}Vr(e){return{pipeline:{stages:this.stages.map(t=>t._toProto(e))}}}}// Copyright 2024 Google LLC* @license
class s_{constructor(e,t,r){this.serializer=e,this.stages=t,this.listenOptions=r,this.isCorePipeline=!0}getPipelineCollection(){return sT(this)}getPipelineCollectionGroup(){return sx(this)}getPipelineCollectionId(){return function(e){switch(sE(e)){case"collection":return F.fromString(sT(e)).lastSegment();case"collection_group":return sx(e);default:return}}(this)}getPipelineDocuments(){return sb(this)}getPipelineFlavor(){var e;let t;return e=this,t="exact",e.stages.forEach((r,n)=>{r._name!==so.name&&r._name!==sa.name||(t="keyless"),r._name===sp.name&&"exact"===t&&(t="augmented"),r._name===si.name&&n<e.stages.length-1&&"exact"===t&&(t="augmented")}),t}getPipelineSourceType(){return sE(this)}}function sE(e){let t=e.stages[0];return t instanceof su||t instanceof sl||t instanceof sc||t instanceof sh?t._name:"unknown"}function sT(e){if("collection"===sE(e))return e.stages[0].Er}function sx(e){if("collection_group"===sE(e))return e.stages[0].collectionId}function sb(e){if("documents"===sE(e))return e.stages[0].hr}class sN{constructor(e,t){this.type=e,this.value=t}static dr(){return new sN("ERROR",void 0)}static mr(){return new sN("UNSET",void 0)}static pr(){return new sN("NULL",eb)}static newValue(e){return eF(e)?new sN("NULL",eb):e&&"booleanValue"in e?new sN("BOOLEAN",e):eP(e)?new sN("INT",e):eO(e)?new sN("DOUBLE",e):e&&"timestampValue"in e&&e.timestampValue?new sN("TIMESTAMP",e):e&&"stringValue"in e?new sN("STRING",e):e&&"bytesValue"in e?new sN("BYTES",e):e.referenceValue?new sN("REFERENCE",e):e.geoPointValue?new sN("GEO_POINT",e):eM(e)?new sN("ARRAY",e):eB(e)?new sN("VECTOR",e):e$(e)?new sN("MAP",e):new sN("ERROR",void 0)}gr(){return"ERROR"===this.type||"UNSET"===this.type}yr(){return"NULL"===this.type}}function sS(e){if(!e.gr())return e.value}function sI(e){return e instanceof n7?e._expr:e}function sC(e){if((e=sI(e))instanceof n3)return new sV(e);if(e instanceof n6)return new sA(e);if(e instanceof n2)return new sD(e);if(e instanceof n8){if("add"===e.name)return new sM(e);if("subtract"===e.name)return new sF(e);if("multiply"===e.name)return new sq(e);if("divide"===e.name)return new s$(e);if("mod"===e.name)return new sB(e);if("and"===e.name)return new sz(e);if("equal"===e.name)return new s6(e);if("not_equal"===e.name)return new s9(e);if("less_than"===e.name)return new s5(e);if("less_than_or_equal"===e.name)return new s8(e);if("greater_than"===e.name)return new s7(e);if("greater_than_or_equal"===e.name)return new ie(e);if("array_concat"===e.name)return new it(e);if("array_reverse"===e.name)return new ir(e);if("array_contains"===e.name)return new is(e);if("array_contains_all"===e.name)return new ii(e);if("array_contains_any"===e.name)return new ia(e);if("array_length"===e.name)return new io(e);if("array_element"===e.name)return new iu(e);if("equal_any"===e.name)return new sQ(e);if("not_equal_any"===e.name)return new sW(e);if("is_nan"===e.name)return new sH(e);if("is_not_nan"===e.name)return new sY(e);if("is_null"===e.name)return new sJ(e);if("is_not_null"===e.name)return new sX(e);if("is_error"===e.name)return new sZ(e);if("exists"===e.name)return new s0(e);if("not"===e.name)return new sj(e);if("or"===e.name)return new sG(e);if("xor"===e.name)return new sK(e);if("conditional"===e.name)return new s1(e);if("maximum"===e.name)return new s2(e);if("minimum"===e.name)return new s3(e);if("reverse"===e.name)return new il(e);if("replace_first"===e.name)return new ic(e);if("replace_all"===e.name)return new ih(e);if("char_length"===e.name)return new id(e);if("byte_length"===e.name)return new im(e);if("like"===e.name)return new ig(e);if("regex_contains"===e.name)return new iy(e);if("regex_match"===e.name)return new iw(e);if("string_contains"===e.name)return new iv(e);if("starts_with"===e.name)return new i_(e);if("ends_with"===e.name)return new iE(e);if("to_lower"===e.name)return new iT(e);if("to_upper"===e.name)return new ix(e);if("trim"===e.name)return new ib(e);if("string_concat"===e.name)return new iN(e);if("map_get"===e.name)return new iS(e);if("cosine_distance"===e.name)return new iC(e);if("dot_product"===e.name)return new iV(e);if("euclidean_distance"===e.name)return new iA(e);if("vector_length"===e.name)return new iD(e);if("unix_micros_to_timestamp"===e.name)return new iG(e);if("timestamp_to_unix_micros"===e.name)return new iH(e);if("unix_millis_to_timestamp"===e.name)return new iK(e);if("timestamp_to_unix_millis"===e.name)return new iY(e);if("unix_seconds_to_timestamp"===e.name)return new iQ(e);if("timestamp_to_unix_seconds"===e.name)return new iJ(e);if("timestamp_add"===e.name)return new iZ(e);if("timestamp_subtract"===e.name)return new i0(e)}throw Error(`Unknown Expr : ${e}`)}class sV{constructor(e){this.expr=e}evaluate(e,t){if(this.expr.fieldName===U){var r,n;return sN.newValue({referenceValue:(r=e.serializer,n=t.key,rT(r.databaseId,n.path))})}if("__update_time__"===this.expr.fieldName)return sN.newValue({timestampValue:r_(e.serializer,t.version)});if("__create_time__"===this.expr.fieldName)return sN.newValue({timestampValue:r_(e.serializer,t.createTime)});let s=t.data.field(this.expr._fieldPath);return s?eh(s)?sN.newValue(function(e,t){if("estimate"===e.serverTimestampBehavior)return{timestampValue:r_(e.serializer,tC.fromTimestamp(em(t)))};if("previous"===e.serverTimestampBehavior){let e=ed(t);if(e)return e}return{nullValue:"NULL_VALUE"}}(e,s)):sN.newValue(s):sN.mr()}}class sA{constructor(e){this.expr=e}evaluate(e,t){return sN.newValue(this.expr._getValue())}}class sD{constructor(e){this.expr=e}evaluate(e,t){let r=this.expr.ur.map(r=>sC(r).evaluate(e,t));return r.some(e=>e.gr())?sN.dr():sN.newValue({arrayValue:{values:r.map(e=>e.value)}})}}function sk(e){return eO(e)?Number(e.doubleValue):Number(e.integerValue)}function sL(e){return BigInt(e.integerValue)}let sR=BigInt("0x7fffffffffffffff"),sP=-BigInt("0x8000000000000000");class sO{constructor(e){this.expr=e}evaluate(e,t){b(this.expr.params.length>=2,24778);let r=sC(this.expr.params[0]).evaluate(e,t),n=sC(this.expr.params[1]).evaluate(e,t),s=this.wr(r,n);for(let r of this.expr.params.slice(2)){let n=sC(r).evaluate(e,t);s=this.wr(s,n)}return s}wr(e,t){if(e.gr()||t.gr())return sN.dr();if(e.yr()||t.yr())return sN.pr();let r=e.value,n=t.value;if(!eO(r)&&!eP(r)||!eO(n)&&!eP(n))return sN.dr();if(eO(r)||eO(n)){let e=this.br(r,n);return e?sN.newValue(e):sN.dr()}if(eP(r)&&eP(n)){let e=this.Sr(r,n);return void 0===e?sN.dr():"number"==typeof e?sN.newValue({doubleValue:e}):e<sP||e>sR?sN.dr():sN.newValue({integerValue:`${e}`})}return sN.dr()}}function sU(e,t){return eI(e)!==eI(t)?"TYPE_MISMATCH":eq(e)||eq(t)?"NOT_EQ":eF(e)&&eF(t)?"EQ":eF(e)||eF(t)?"NULL":eM(e)&&eM(t)?function(e,t){if(e.values?.length!==t.values?.length)return"NOT_EQ";let r=!1;for(let n=0;n<(e.values?.length??0);n++){let s=e.values[n],i=t.values[n];switch(sU(s,i)){case"EQ":break;case"NOT_EQ":case"TYPE_MISMATCH":return"NOT_EQ";case"NULL":r=!0;break;default:T(44609,{vr:s,Dr:i})}}return r?"NULL":"EQ"}(e.arrayValue,t.arrayValue):eB(e)&&eB(t)||e$(e)&&e$(t)?function(e,t){let r=e.fields||{},n=t.fields||{};if(z(r)!==z(n))return"NOT_EQ";let s=!1;for(let e in r)if(r.hasOwnProperty(e)){if(void 0===n[e])return"NOT_EQ";switch(sU(r[e],n[e])){case"NOT_EQ":case"TYPE_MISMATCH":return"NOT_EQ";case"NULL":s=!0}}return s?"NULL":"EQ"}(e.mapValue,t.mapValue):eC(e,t,{o:!1,t:!0,i:!0})?"EQ":"NOT_EQ"}class sM extends sO{Sr(e,t){return sL(e)+sL(t)}br(e,t){return{doubleValue:sk(e)+sk(t)}}}class sF extends sO{constructor(e){super(e),this.expr=e}Sr(e,t){return sL(e)-sL(t)}br(e,t){return{doubleValue:sk(e)-sk(t)}}}class sq extends sO{constructor(e){super(e),this.expr=e}Sr(e,t){return sL(e)*sL(t)}br(e,t){return{doubleValue:sk(e)*sk(t)}}}class s$ extends sO{constructor(e){super(e),this.expr=e}Sr(e,t){let r=sL(t);if(r!==BigInt(0))return sL(e)/r}br(e,t){let r=sk(t);return 0===r?{doubleValue:ew(r)?Number.NEGATIVE_INFINITY:Number.POSITIVE_INFINITY}:{doubleValue:sk(e)/r}}}class sB extends sO{constructor(e){super(e),this.expr=e}Sr(e,t){let r=sL(t);if(r!==BigInt(0))return sL(e)%r}br(e,t){let r=sk(t);if(0!==r)return{doubleValue:sk(e)%r}}}class sz{constructor(e){this.expr=e}evaluate(e,t){let r=!1,n=!1;for(let s of this.expr.params){let i=sC(s).evaluate(e,t);switch(i.type){case"BOOLEAN":if(!i.value?.booleanValue)return sN.newValue(eS);break;case"NULL":n=!0;break;default:r=!0}}return r?sN.dr():n?sN.pr():sN.newValue(eN)}}class sj{constructor(e){this.expr=e}evaluate(e,t){b(1===this.expr.params.length,9634);let r=sC(this.expr.params[0]).evaluate(e,t);switch(r.type){case"BOOLEAN":return sN.newValue({booleanValue:!r.value?.booleanValue});case"NULL":return sN.pr();default:return sN.dr()}}}class sG{constructor(e){this.expr=e}evaluate(e,t){let r=!1,n=!1;for(let s of this.expr.params){let i=sC(s).evaluate(e,t);switch(i.type){case"BOOLEAN":if(i.value?.booleanValue)return sN.newValue(eN);break;case"NULL":n=!0;break;default:r=!0}}return r?sN.dr():n?sN.pr():sN.newValue(eS)}}class sK{constructor(e){this.expr=e}evaluate(e,t){let r=!1,n=!1;for(let s of this.expr.params){let i=sC(s).evaluate(e,t);switch(i.type){case"BOOLEAN":r=sK.xor(r,!!i.value?.booleanValue);break;case"NULL":n=!0;break;default:return sN.dr()}}return n?sN.pr():sN.newValue({booleanValue:r})}static xor(e,t){return(e||t)&&!(e&&t)}}class sQ{constructor(e){this.expr=e}evaluate(e,t){b(2===this.expr.params.length,55094);let r=!1,n=sC(this.expr.params[0]).evaluate(e,t);switch(n.type){case"NULL":r=!0;break;case"ERROR":case"UNSET":return sN.dr()}let s=sC(this.expr.params[1]).evaluate(e,t);switch(s.type){case"ARRAY":break;case"NULL":r=!0;break;default:return sN.dr()}if(r)return sN.pr();for(let e of s.value?.arrayValue?.values??[])switch(eF(n.value)&&eF(e)?"EQ":sU(n.value,e)){case"EQ":return sN.newValue(eN);case"NOT_EQ":case"TYPE_MISMATCH":break;case"NULL":r=!0;break;default:T(44608,{value:n.value,candidate:e})}return r?sN.pr():sN.newValue(eS)}}class sW{constructor(e){this.expr=e}evaluate(e,t){return new sj(new n8("not",[new n8("equal_any",this.expr.params)])).evaluate(e,t)}}class sH{constructor(e){this.expr=e}evaluate(e,t){b(1===this.expr.params.length,23322);let r=sC(this.expr.params[0]).evaluate(e,t);switch(r.type){case"INT":return sN.newValue(eS);case"DOUBLE":return sN.newValue({booleanValue:isNaN(sk(r.value))});case"NULL":return sN.pr();default:return sN.dr()}}}class sY{constructor(e){this.expr=e}evaluate(e,t){return b(1===this.expr.params.length,50406),new sj(new n8("not",[new n8("is_nan",this.expr.params)])).evaluate(e,t)}}class sJ{constructor(e){this.expr=e}evaluate(e,t){switch(b(1===this.expr.params.length,23123),sC(this.expr.params[0]).evaluate(e,t).type){case"NULL":return sN.newValue(eN);case"UNSET":case"ERROR":return sN.dr();default:return sN.newValue(eS)}}}class sX{constructor(e){this.expr=e}evaluate(e,t){return b(1===this.expr.params.length,23167),new sj(new n8("not",[new n8("is_null",this.expr.params)])).evaluate(e,t)}}class sZ{constructor(e){this.expr=e}evaluate(e,t){return b(1===this.expr.params.length,5228),"ERROR"===sC(this.expr.params[0]).evaluate(e,t).type?sN.newValue(eN):sN.newValue(eS)}}class s0{constructor(e){this.expr=e}evaluate(e,t){switch(b(1===this.expr.params.length,6877),sC(this.expr.params[0]).evaluate(e,t).type){case"ERROR":return sN.dr();case"UNSET":return sN.newValue(eS);default:return sN.newValue(eN)}}}class s1{constructor(e){this.expr=e}evaluate(e,t){b(3===this.expr.params.length,11706);let r=sC(this.expr.params[0]).evaluate(e,t);switch(r.type){case"BOOLEAN":return r.value?.booleanValue?sC(this.expr.params[1]).evaluate(e,t):sC(this.expr.params[2]).evaluate(e,t);case"NULL":return sC(this.expr.params[2]).evaluate(e,t);default:return sN.dr()}}}class s2{constructor(e){this.expr=e}evaluate(e,t){let r;for(let n of this.expr.params.map(r=>sC(r).evaluate(e,t)))switch(n.type){case"ERROR":case"UNSET":case"NULL":continue;default:r=void 0===r||eA(n.value,r.value)>0?n:r}return void 0===r?sN.pr():r}}class s3{constructor(e){this.expr=e}evaluate(e,t){let r;for(let n of this.expr.params.map(r=>sC(r).evaluate(e,t)))switch(n.type){case"ERROR":case"UNSET":case"NULL":continue;default:r=void 0===r||0>eA(n.value,r.value)?n:r}return void 0===r?sN.pr():r}}class s4{constructor(e){this.expr=e}evaluate(e,t){b(2===this.expr.params.length,31033,`${this.expr.name}() function should have exactly 2 params`);let r=sC(this.expr.params[0]).evaluate(e,t);switch(r.type){case"ERROR":case"UNSET":return sN.dr()}let n=sC(this.expr.params[1]).evaluate(e,t);switch(n.type){case"ERROR":case"UNSET":return sN.dr()}return this.Cr(r,n)}}class s6 extends s4{constructor(e){super(e),this.expr=e}Cr(e,t){if(e.yr()&&t.yr())return sN.newValue(eN);if(e.yr()||t.yr()||eq(e.value)||eq(t.value)||eI(e.value)!==eI(t.value))return sN.newValue(eS);switch(sU(e.value,t.value)){case"EQ":return sN.newValue(eN);case"NOT_EQ":return sN.newValue(eS);case"NULL":return sN.pr();default:T(44615,{left:e,right:t})}}}class s9 extends s4{constructor(e){super(e),this.expr=e}Cr(e,t){switch(sU(e.value,t.value)){case"EQ":return sN.newValue(eS);case"NOT_EQ":case"TYPE_MISMATCH":return sN.newValue(eN);case"NULL":return sN.pr();default:T(44614,{left:e,right:t})}}}class s5 extends s4{constructor(e){super(e),this.expr=e}Cr(e,t){return eI(e.value)!==eI(t.value)||eq(e.value)||eq(t.value)?sN.newValue(eS):sN.newValue({booleanValue:0>eA(e.value,t.value)})}}class s8 extends s4{constructor(e){super(e),this.expr=e}Cr(e,t){return eI(e.value)!==eI(t.value)||eq(e.value)||eq(t.value)?sN.newValue(eS):"EQ"===sU(e.value,t.value)?sN.newValue(eN):sN.newValue({booleanValue:0>eA(e.value,t.value)})}}class s7 extends s4{constructor(e){super(e),this.expr=e}Cr(e,t){return eI(e.value)!==eI(t.value)||eq(e.value)||eq(t.value)?sN.newValue(eS):sN.newValue({booleanValue:eA(e.value,t.value)>0})}}class ie extends s4{constructor(e){super(e),this.expr=e}Cr(e,t){return eI(e.value)!==eI(t.value)||eq(e.value)||eq(t.value)?sN.newValue(eS):"EQ"===sU(e.value,t.value)?sN.newValue(eN):sN.newValue({booleanValue:eA(e.value,t.value)>0})}}class it{constructor(e){this.expr=e}evaluate(e,t){throw Error("Unimplemented")}}class ir{constructor(e){this.expr=e}evaluate(e,t){b(1===this.expr.params.length,216);let r=sC(this.expr.params[0]).evaluate(e,t);switch(r.type){case"NULL":return sN.pr();case"ARRAY":{let e=r.value.arrayValue?.values??[];return sN.newValue({arrayValue:{values:[...e].reverse()}})}default:return sN.dr()}}}class is{constructor(e){this.expr=e}evaluate(e,t){return b(2===this.expr.params.length,52884),new sQ(new n8("eq_any",[this.expr.params[1],this.expr.params[0]])).evaluate(e,t)}}class ii{constructor(e){this.expr=e}evaluate(e,t){b(2===this.expr.params.length,1392);let r=!1,n=sC(this.expr.params[0]).evaluate(e,t);switch(n.type){case"ARRAY":break;case"NULL":r=!0;break;default:return sN.dr()}let s=sC(this.expr.params[1]).evaluate(e,t);switch(s.type){case"ARRAY":break;case"NULL":r=!0;break;default:return sN.dr()}if(r)return sN.pr();let i=s.value?.arrayValue?.values??[],a=n.value?.arrayValue?.values??[];for(let e of i){let t=!1;for(let n of(r=!1,a)){switch(eF(e)&&eF(n)?"EQ":sU(e,n)){case"EQ":t=!0;break;case"NOT_EQ":case"TYPE_MISMATCH":break;case"NULL":r=!0;break;default:T(44613,{value:n,search:e})}if(t)break}if(!t)return sN.newValue(eS)}return sN.newValue(eN)}}class ia{constructor(e){this.expr=e}evaluate(e,t){b(2===this.expr.params.length,2680);let r=!1,n=sC(this.expr.params[0]).evaluate(e,t);switch(n.type){case"ARRAY":break;case"NULL":r=!0;break;default:return sN.dr()}let s=sC(this.expr.params[1]).evaluate(e,t);switch(s.type){case"ARRAY":break;case"NULL":r=!0;break;default:return sN.dr()}if(r)return sN.pr();let i=s.value?.arrayValue?.values??[];for(let e of n.value?.arrayValue?.values??[])for(let t of i)switch(eF(e)&&eF(t)?"EQ":sU(e,t)){case"EQ":return sN.newValue(eN);case"NOT_EQ":case"TYPE_MISMATCH":break;case"NULL":r=!0;break;default:T(60403,{value:e,search:t})}return r?sN.pr():sN.newValue(eS)}}class io{constructor(e){this.expr=e}evaluate(e,t){b(1===this.expr.params.length,38605);let r=sC(this.expr.params[0]).evaluate(e,t);switch(r.type){case"NULL":return sN.pr();case"ARRAY":return sN.newValue({integerValue:`${r.value?.arrayValue?.values?.length??0}`});default:return sN.dr()}}}class iu{constructor(e){this.expr=e}evaluate(e,t){throw Error("Unimplemented")}}class il{constructor(e){this.expr=e}evaluate(e,t){b(1===this.expr.params.length,1508);let r=sC(this.expr.params[0]).evaluate(e,t);switch(r.type){case"NULL":return sN.pr();case"BYTES":{let e=r.value?.bytesValue;if("string"==typeof e){let t=er.fromBase64String(e).toUint8Array();return t.reverse(),sN.newValue({bytesValue:er.fromUint8Array(t).toBase64()})}return sN.newValue({bytesValue:new Uint8Array(e).reverse()})}case"STRING":{let e=r.value?.stringValue,t=Array.from(new Intl.__PRIVATE_Segmenter(void 0,{granularity:"grapheme"}).segment(e),e=>e.segment).reverse();return sN.newValue({stringValue:t.join("")})}default:return sN.dr()}}}class ic{constructor(e){this.expr=e}evaluate(e,t){throw Error("Unimplemented")}}class ih{constructor(e){this.expr=e}evaluate(e,t){throw Error("Unimplemented")}}class id{constructor(e){this.expr=e}evaluate(e,t){b(1===this.expr.params.length,19400);let r=sC(this.expr.params[0]).evaluate(e,t);switch(r.type){case"NULL":return sN.pr();case"STRING":{let e=function(e){let t=0;for(let r=0;r<e.length;r++){let n=e.codePointAt(r);if(void 0===n)return;if(n<=65535){if(n>=55296&&n<=57343){if(n<=56319){let n=e.codePointAt(r+1);void 0!==n&&n>=56320&&n<=57343?(t+=1,r++):t+=1}else t+=1}else t+=1}else{if(!(n<=1114111))return;t+=1,r++}}return t}(r.value.stringValue);return void 0===e?sN.dr():sN.newValue({integerValue:e})}default:return sN.dr()}}}class im{constructor(e){this.expr=e}evaluate(e,t){b(1===this.expr.params.length,8486);let r=sC(this.expr.params[0]).evaluate(e,t);switch(r.type){case"BYTES":{let e=r.value?.bytesValue;return"string"==typeof e?sN.newValue({integerValue:er.fromBase64String(e).toUint8Array().length}):sN.newValue({integerValue:new Uint8Array(e).length})}case"STRING":{let e=function(e){let t=0;for(let r=0;r<e.length;r++){let n=e.codePointAt(r);if(void 0===n)return;if(n>=55296&&n<=57343){if(!(n<=56319))return;{let n=e.codePointAt(r+1);if(void 0===n||!(n>=56320&&n<=57343))return;t+=4,r++}}else if(n<=127)t+=1;else if(n<=2047)t+=2;else if(n<=65535)t+=3;else{if(!(n<=1114111))return;t+=4,r++}}return t}(r.value?.stringValue);return void 0===e?sN.dr():sN.newValue({integerValue:e})}case"NULL":return sN.pr();default:return sN.dr()}}}class ip{constructor(e){this.expr=e}evaluate(e,t){b(2===this.expr.params.length,39773,`${this.expr.name}() function should have exactly two parameters`);let r=!1,n=sC(this.expr.params[0]).evaluate(e,t);switch(n.type){case"STRING":break;case"NULL":r=!0;break;default:return sN.dr()}let s=sC(this.expr.params[1]).evaluate(e,t);switch(s.type){case"STRING":break;case"NULL":r=!0;break;default:return sN.dr()}return r?sN.pr():this.Fr(n.value?.stringValue,s.value?.stringValue)}}class ig extends ip{Fr(e,t){try{let r=function(e){let t="";for(let r=0;r<e.length;r++){let n=e.charAt(r);switch(n){case"_":t+=".";break;case"%":t+=".*";break;case"\\":case".":case"*":case"?":case"+":case"^":case"$":case"|":case"(":case")":case"[":case"]":case"{":case"}":t+="\\"+n;break;default:t+=n}}return"^"+t+"$"}(t),n=d.n_.compile(r);return sN.newValue({booleanValue:n.matches(e)})}catch(e){return _(`Invalid LIKE pattern converted to regex: ${t}, returning error. Error: ${e}`),sN.dr()}}}class iy extends ip{Fr(e,t){try{let r=d.n_.compile(t);return sN.newValue({booleanValue:r.test(e)})}catch(e){return _(`Invalid regex pattern found in regex_contains: ${t}, returning error`),sN.dr()}}}class iw extends ip{Fr(e,t){try{return sN.newValue({booleanValue:d.n_.compile(t).matches(e)})}catch(e){return _(`Invalid regex pattern found in regex_match: ${t}, returning error`),sN.dr()}}}class iv extends ip{Fr(e,t){return sN.newValue({booleanValue:e.includes(t)})}}class i_ extends ip{Fr(e,t){return sN.newValue({booleanValue:e.startsWith(t)})}}class iE extends ip{Fr(e,t){return sN.newValue({booleanValue:e.endsWith(t)})}}class iT{constructor(e){this.expr=e}evaluate(e,t){b(1===this.expr.params.length,29079);let r=sC(this.expr.params[0]).evaluate(e,t);switch(r.type){case"STRING":return sN.newValue({stringValue:r.value?.stringValue?.toLowerCase()});case"NULL":return sN.pr();default:return sN.dr()}}}class ix{constructor(e){this.expr=e}evaluate(e,t){b(1===this.expr.params.length,60487);let r=sC(this.expr.params[0]).evaluate(e,t);switch(r.type){case"STRING":return sN.newValue({stringValue:r.value?.stringValue?.toUpperCase()});case"NULL":return sN.pr();default:return sN.dr()}}}class ib{constructor(e){this.expr=e}evaluate(e,t){b(1===this.expr.params.length,28544);let r=sC(this.expr.params[0]).evaluate(e,t);switch(r.type){case"STRING":return sN.newValue({stringValue:r.value?.stringValue?.trim()});case"NULL":return sN.pr();default:return sN.dr()}}}class iN{constructor(e){this.expr=e}evaluate(e,t){let r=this.expr.params.map(r=>sC(r).evaluate(e,t)),n="",s=!1;for(let e of r)switch(e.type){case"STRING":n+=e.value.stringValue;break;case"NULL":s=!0;break;default:return sN.dr()}return s?sN.pr():sN.newValue({stringValue:n})}}class iS{constructor(e){this.expr=e}evaluate(e,t){b(2===this.expr.params.length,4483);let r=sC(this.expr.params[0]).evaluate(e,t);switch(r.type){case"UNSET":return sN.mr();case"MAP":break;default:return sN.dr()}let n=sC(this.expr.params[1]).evaluate(e,t);if("STRING"!==n.type)return sN.dr();let s=r.value?.mapValue?.fields?.[n.value?.stringValue];return void 0===s?sN.mr():sN.newValue(s)}}class iI{constructor(e){this.expr=e}evaluate(e,t){b(2===this.expr.params.length,25231,`${this.expr.name}() function should have exactly 2 params`);let r=!1,n=sC(this.expr.params[0]).evaluate(e,t);switch(n.type){case"VECTOR":break;case"NULL":r=!0;break;default:return sN.dr()}let s=sC(this.expr.params[1]).evaluate(e,t);switch(s.type){case"VECTOR":break;case"NULL":r=!0;break;default:return sN.dr()}if(r)return sN.pr();let i=ez(n.value),a=ez(s.value);if(void 0===i||void 0===a||i.values?.length!==a.values?.length)return sN.dr();let o=this.Or(i,a);return void 0===o||isNaN(o)?sN.dr():sN.newValue({doubleValue:o})}}class iC extends iI{Or(e,t){let r=e?.values??[],n=t?.values??[];if(0===r.length)return;let s=0,i=0,a=0;for(let e=0;e<r.length;e++){if(!eU(r[e])||!eU(n[e]))return;let t=sk(r[e]),o=sk(n[e]);s+=t*o,i+=t*t,a+=o*o}let o=Math.sqrt(i)*Math.sqrt(a);if(0!==o)return 1-Math.max(-1,Math.min(1,s/o))}}class iV extends iI{Or(e,t){let r=e?.values??[],n=t?.values??[];if(0===r.length)return 0;let s=0;for(let e=0;e<r.length;e++){if(!eU(r[e])||!eU(n[e]))return;s+=sk(r[e])*sk(n[e])}return s}}class iA extends iI{Or(e,t){let r=e?.values??[],n=t?.values??[];if(0===r.length)return 0;let s=0;for(let e=0;e<r.length;e++){if(!eU(r[e])||!eU(n[e]))return;s+=Math.pow(sk(r[e])-sk(n[e]),2)}return Math.sqrt(s)}}class iD{constructor(e){this.expr=e}evaluate(e,t){b(1===this.expr.params.length,39044);let r=sC(this.expr.params[0]).evaluate(e,t);switch(r.type){case"VECTOR":{let e=ez(r.value);return sN.newValue({integerValue:e?.values?.length??0})}case"NULL":return sN.pr();default:return sN.dr()}}}let ik=BigInt(-62135596800),iL=BigInt(253402300799),iR=BigInt(1e3),iP=BigInt(1e6),iO=ik*iR,iU=iL*iR+BigInt(999),iM=ik*iP,iF=iL*iP+BigInt(999999);function iq(e){return e>=iM&&e<=iF}function i$(e,t){let r=BigInt(e);return!(r<ik||r>iL)&&!(t<0||t>=1e9)&&(r!==ik||0===t)&&!(r===iL&&t>999999999)}function iB(e,t){return t<0?{seconds:e-1,nanos:t+1e9}:{seconds:e,nanos:t}}function iz(e){return BigInt(e.seconds)*iP+BigInt(Math.trunc(e.nanoseconds/1e3))}class ij{constructor(e){this.expr=e}evaluate(e,t){b(1===this.expr.params.length,49262,`${this.expr.name}() function should have exactly one parameter`);let r=sC(this.expr.params[0]).evaluate(e,t);switch(r.type){case"INT":return this.toTimestamp(BigInt(r.value.integerValue));case"NULL":return sN.pr();default:return sN.dr()}}}class iG extends ij{toTimestamp(e){if(!iq(e))return sN.dr();let t=Number(e/iP),r=Number(e%iP*BigInt(1e3)),n=iB(t,r);return i$(t=n.seconds,r=n.nanos)?sN.newValue({timestampValue:{seconds:t,nanos:r}}):sN.dr()}}class iK extends ij{toTimestamp(e){if(!(e>=iO&&e<=iU))return sN.dr();let t=Number(e/iR),r=Number(e%iR*BigInt(1e6)),n=iB(t,r);return i$(t=n.seconds,r=n.nanos)?sN.newValue({timestampValue:{seconds:t,nanos:r}}):sN.dr()}}class iQ extends ij{toTimestamp(e){if(!(e>=ik&&e<=iL))return sN.dr();let t=Number(e);return sN.newValue({timestampValue:{seconds:t,nanos:0}})}}class iW{constructor(e){this.expr=e}evaluate(e,t){b(1===this.expr.params.length,1265,`${this.expr.name}() function should have exactly one parameter`);let r=sC(this.expr.params[0]).evaluate(e,t);switch(r.type){case"TIMESTAMP":break;case"NULL":return sN.pr();default:return sN.dr()}let n=rw(r.value.timestampValue);return i$(n.seconds,n.nanoseconds)?this.Mr(n):sN.dr()}}class iH extends iW{Mr(e){let t=iz(e);return iq(t)?sN.newValue({integerValue:`${t.toString()}`}):sN.dr()}}class iY extends iW{Mr(e){let t=iz(e),r=t/BigInt(1e3),n=t%BigInt(1e3);return r>BigInt(0)||n===BigInt(0)?sN.newValue({integerValue:r.toString()}):sN.newValue({integerValue:(r-BigInt(1)).toString()})}}class iJ extends iW{Mr(e){let t=BigInt(e.seconds);return t>=ik&&t<=iL?sN.newValue({integerValue:t.toString()}):sN.dr()}}class iX{constructor(e){this.expr=e}evaluate(e,t){let r,n;b(3===this.expr.params.length,2775,`${this.expr.name}() function should have exactly 3 parameters`);let s=!1,i=sC(this.expr.params[0]).evaluate(e,t);switch(i.type){case"TIMESTAMP":break;case"NULL":s=!0;break;default:return sN.dr()}let a=sC(this.expr.params[1]).evaluate(e,t);switch(a.type){case"STRING":if(void 0===(r=function(e){switch(e){case"microsecond":return"microsecond";case"millisecond":return"millisecond";case"second":return"second";case"minute":return"minute";case"hour":return"hour";case"day":return"day";default:return}}(a.value.stringValue)))return sN.dr();break;case"NULL":s=!0;break;default:return sN.dr()}let o=sC(this.expr.params[2]).evaluate(e,t);switch(o.type){case"INT":break;case"NULL":s=!0;break;default:return sN.dr()}if(s)return sN.pr();let u=BigInt(o.value.integerValue);try{switch(r){case"microsecond":n=u;break;case"millisecond":n=u*BigInt(1e3);break;case"second":n=u*BigInt(1e6);break;case"minute":n=u*BigInt(6e7);break;case"hour":n=u*BigInt(36e8);break;case"day":n=u*BigInt(864e8);break;default:return sN.dr()}if("microsecond"!==r&&u!==BigInt(0)&&n/u!==BigInt(this.Nr(r)))return sN.dr()}catch(e){return _(`Error during timestamp arithmetic: ${e}`),sN.dr()}let l=rw(i.value.timestampValue);if(!i$(l.seconds,l.nanoseconds))return sN.dr();let c=iz(l),h=this.Lr(c,n);if(!iq(h))return sN.dr();let d=Number(h/iP),m=h%iP,f=Number((m<0?m+iP:m)*BigInt(1e3)),p=m<0?d-1:d;return i$(p,f)?sN.newValue({timestampValue:{seconds:p,nanos:f}}):sN.dr()}Nr(e){switch(e){case"millisecond":return 1e3;case"second":return 1e6;case"minute":return 6e7;case"hour":return 36e8;case"day":return 864e8;default:return 1}}}class iZ extends iX{Lr(e,t){return e+t}}class i0 extends iX{Lr(e,t){return e-t}}function i1(e){if((e=sI(e))instanceof n3)return`fld(${e.fieldName})`;if(e instanceof n6){var t;return`cst(${null===(t=e.value)?"null":"number"==typeof t?t.toString():"string"==typeof t?`"${t}"`:t instanceof nT?`ref(${t.path})`:t instanceof nN?`vec(${JSON.stringify(t)})`:JSON.stringify(t)})`}if(e instanceof n8)return`fn(${e.name},[${e.params.map(i1).join(",")}])`;if("ListOfExpressions"===e.expressionType)return`list([${e.ur.map(i1).join(",")}])`;throw Error(`Unrecognized expr ${JSON.stringify(e,null,2)}`)}function i2(e){return`${Array.from(e.entries()).sort().map(([e,t])=>`${e}=${i1(t)}`).join(",")}`}function i3(e){return e.stages.map(e=>(function(e){if(e instanceof si)return`${e._name}(${i2(e.fields)})`;if(e instanceof sa){let t=`${e._name}(${i2(e.accumulators)})`;return e.groups.size>0&&(t+=`grouping(${i2(e.groups)})`),t}if(e instanceof so)return`${e._name}(${i2(e.groups)})`;if(e instanceof su)return`${e._name}(${e.Er})`;if(e instanceof sl)return`${e._name}(${e.collectionId})`;if(e instanceof sc)return`${e._name}()`;if(e instanceof sh)return`${e._name}(${e.hr.sort()})`;if(e instanceof sd)return`${e._name}(${i1(e.condition)})`;if(e instanceof sm)return`${e._name}(${e.limit})`;if(e instanceof sg)return`${e._name}(${e.orderings.map(e=>`${i1(e.expr)}${e.direction}`).join(",")})`;throw Error(`Unrecognized stage ${e._name}`)})(e)).join("|")}function i4(e){return e instanceof s_}function i6(e){return i4(e)?i3(e):tW(e)}function i9(e){return i4(e)?i3(e):`${tR(tB(e))}|lt:${e.limitType}`}function i5(e,t){return e instanceof s_&&t instanceof s_?i3(e)===i3(t):!(e instanceof s_&&!(t instanceof s_)||!(e instanceof s_)&&t instanceof s_)&&tP(tB(e),tB(t))&&e.limitType===t.limitType}function i8(e){return tO(e)?i3(e):tR(e)}function i7(e,t){return e instanceof s_&&t instanceof s_?i3(e)===i3(t):!(e instanceof s_&&!(t instanceof s_)||!(e instanceof s_)&&t instanceof s_)&&tP(e,t)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ae{constructor(e,t,r,n){this.batchId=e,this.localWriteTime=t,this.baseMutations=r,this.mutations=n}applyToRemoteDocument(e,t){let r=t.mutationResults;for(let t=0;t<this.mutations.length;t++){let s=this.mutations[t];if(s.key.isEqual(e.key)){var n;n=r[t],s instanceof ti?function(e,t,r){let n=e.value.clone(),s=tu(e.fieldTransforms,t,r.transformResults);n.setAll(s),t.convertToFoundDocument(r.version,n).setHasCommittedMutations()}(s,e,n):s instanceof ta?function(e,t,r){if(!te(e.precondition,t))return void t.convertToUnknownDocument(r.version);let n=tu(e.fieldTransforms,t,r.transformResults),s=t.data;s.setAll(to(e)),s.setAll(n),t.convertToFoundDocument(r.version,s).setHasCommittedMutations()}(s,e,n):function(e,t,r){t.convertToNoDocument(r.version).setHasCommittedMutations()}(0,e,n)}}}applyToLocalView(e,t){for(let r of this.baseMutations)r.key.isEqual(e.key)&&(t=tn(r,e,t,this.localWriteTime));for(let r of this.mutations)r.key.isEqual(e.key)&&(t=tn(r,e,t,this.localWriteTime));return t}applyToLocalDocumentSet(e,t){let r=t3();return this.mutations.forEach(n=>{let s=e.get(n.key),i=s.overlayedDocument,a=this.applyToLocalView(i,s.mutatedFields),o=tr(i,a=t.has(n.key)?null:a);null!==o&&r.set(n.key,o),i.isValidDocument()||i.convertToNoDocument(tC.min())}),r}keys(){return this.mutations.reduce((e,t)=>e.add(t.key),t6())}isEqual(e){return this.batchId===e.batchId&&V(this.mutations,e.mutations,(e,t)=>ts(e,t))&&V(this.baseMutations,e.baseMutations,(e,t)=>ts(e,t))}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class at{constructor(e,t){this.largestBatchId=e,this.mutation=t}getKey(){return this.mutation.key}isEqual(e){return null!==e&&this.mutation===e.mutation}toString(){return`Overlay{
      largestBatchId: ${this.largestBatchId},
      mutation: ${this.mutation.toString()}
    }`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ar{constructor(e,t,r,n,s=tC.min(),i=tC.min(),a=er.EMPTY_BYTE_STRING,o=null){this.target=e,this.targetId=t,this.purpose=r,this.sequenceNumber=n,this.snapshotVersion=s,this.lastLimboFreeSnapshotVersion=i,this.resumeToken=a,this.expectedCount=o}withSequenceNumber(e){return new ar(this.target,this.targetId,this.purpose,e,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(e,t){return new ar(this.target,this.targetId,this.purpose,this.sequenceNumber,t,this.lastLimboFreeSnapshotVersion,e,null)}withExpectedCount(e){return new ar(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,e)}withLastLimboFreeSnapshotVersion(e){return new ar(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,e,this.resumeToken,this.expectedCount)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class an{constructor(e){this.qr=e}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class as{constructor(){}Xr(e,t){this.ei(e,t),t.ti()}ei(e,t){if("nullValue"in e)this.ni(t,5);else if("booleanValue"in e)this.ni(t,10),t.ri(e.booleanValue?1:0);else if("integerValue"in e)this.ni(t,15),t.ri(ei(e.integerValue));else if("doubleValue"in e){let r=ei(e.doubleValue);isNaN(r)?this.ni(t,13):(this.ni(t,15),ew(r)?t.ri(0):t.ri(r))}else if("timestampValue"in e){let r=e.timestampValue;this.ni(t,20),"string"==typeof r&&(r=es(r)),t.ii(`${r.seconds||""}`),t.ri(r.nanos||0)}else if("stringValue"in e)this.si(e.stringValue,t),this._i(t);else if("bytesValue"in e)this.ni(t,30),t.oi(ea(e.bytesValue)),this._i(t);else if("referenceValue"in e)this.ai(e.referenceValue,t);else if("geoPointValue"in e){let r=e.geoPointValue;this.ni(t,45),t.ri(r.latitude||0),t.ri(r.longitude||0)}else"mapValue"in e?eG(e)?this.ni(t,Number.MAX_SAFE_INTEGER):eB(e)?this.ui(e.mapValue,t):(this.ci(e.mapValue,t),this._i(t)):"arrayValue"in e?(this.li(e.arrayValue,t),this._i(t)):T(19022,{Ei:e})}si(e,t){this.ni(t,25),this.hi(e,t)}hi(e,t){t.ii(e)}ci(e,t){let r=e.fields||{};for(let e of(this.ni(t,55),Object.keys(r)))this.si(e,t),this.ei(r[e],t)}ui(e,t){let r=e.fields||{};this.ni(t,53);let n=r[ex].arrayValue?.values?.length||0;this.ni(t,15),t.ri(ei(n)),this.si(ex,t),this.ei(r[ex],t)}li(e,t){let r=e.values||[];for(let e of(this.ni(t,50),r))this.ei(e,t)}ai(e,t){this.ni(t,37),K.fromName(e).path.forEach(e=>{this.ni(t,60),this.hi(e,t)})}ni(e,t){e.ri(t)}_i(e){e.ri(2)}}as.Ti=new as;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ai{constructor(){this.Yi=new aa}addToCollectionParentIndex(e,t){return this.Yi.add(t),nh.resolve()}getCollectionParents(e,t){return nh.resolve(this.Yi.getEntries(t))}addFieldIndex(e,t){return nh.resolve()}deleteFieldIndex(e,t){return nh.resolve()}deleteAllFieldIndexes(e){return nh.resolve()}createTargetIndexes(e,t){return nh.resolve()}getDocumentsMatchingTarget(e,t){return nh.resolve(null)}getIndexType(e,t){return nh.resolve(0)}getFieldIndexes(e,t){return nh.resolve([])}getNextCollectionGroupToUpdate(e){return nh.resolve(null)}getMinOffset(e,t){return nh.resolve(tD.min())}getMinOffsetFromCollectionGroup(e,t){return nh.resolve(tD.min())}updateCollectionGroup(e,t,r){return nh.resolve()}updateIndexEntries(e,t){return nh.resolve()}}class aa{constructor(){this.index={}}add(e){let t=e.lastSegment(),r=e.popLast(),n=this.index[t]||new L(F.comparator),s=!n.has(r);return this.index[t]=n.add(r),s}has(e){let t=e.lastSegment(),r=e.popLast(),n=this.index[t];return n&&n.has(r)}getEntries(e){return(this.index[e]||new L(F.comparator)).toArray()}}new Uint8Array(0);/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ao{constructor(e){this.gs=e}next(){return this.gs+=2,this.gs}static ys(){return new ao(0)}static ws(){return new ao(-1)}}// Copyright 2024 Google LLC* @license
function au(e,t){let r=t;for(let t of e.stages)r=function(e,t,r){if(t instanceof su)return r.filter(e=>e.isFoundDocument()&&`/${e.key.getCollectionPath().canonicalString()}`===t.Er);if(t instanceof sd)return r.filter(r=>{let n=sS(sC(t.condition).evaluate(e,r));return void 0!==n&&eC(n,eN)});if(t instanceof sl)return r.filter(e=>e.isFoundDocument()&&e.key.getCollectionPath().lastSegment()===t.collectionId);if(t instanceof sc)return r.filter(e=>e.isFoundDocument());if(t instanceof sh)return r.filter(e=>e.isFoundDocument()&&t.Tr.has(e.key.path.toStringWithLeadingSlash()));if(t instanceof sm)return r.slice(0,t.limit);if(t instanceof sg)return function(e,t,r){let n=t.orderings.map(e=>({Os:sC(e.expr),direction:e.direction}));return[...r].sort((t,r)=>{for(let{Os:s,direction:i}of n){let n=eA(sS(s.evaluate(e,t))??eb,sS(s.evaluate(e,r))??eb);if(0!==n)return"ascending"===i?n:-n}return 0})}(e,t,r);throw Error(`Unknown stage: ${t._name}`)}({serializer:e.serializer,serverTimestampBehavior:e.listenOptions?.serverTimestampBehavior},t,r);return r}function al(e,t){return au(e,[t]).length>0}function ac(e){let t=function(e){for(let t=e.stages.length-1;t>=0;t--){let r=e.stages[t];if(r instanceof sg)return r.orderings}throw Error("Pipeline must contain at least one Sort stage")}(e);return(r,n)=>{for(let s of t){let t=eA(sS(sC(s.expr).evaluate({serializer:e.serializer},r))||eb,sS(sC(s.expr).evaluate({serializer:e.serializer},n))||eb);if(0!==t)return"ascending"===s.direction?t:-t}return 0}}function ah(e){for(let t=e.stages.length-1;t>=0;t--){let r=e.stages[t];if(r instanceof sm)return{limit:r.limit}}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ad{constructor(){this.changes=new tZ(e=>e.toString(),(e,t)=>e.isEqual(t)),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,t){this.assertNotApplied(),this.changes.set(e,tV.newInvalidDocument(e).setReadTime(t))}getEntry(e,t){this.assertNotApplied();let r=this.changes.get(t);return void 0!==r?nh.resolve(r):this.getFromCache(e,t)}getEntries(e,t){return this.getAllFromCache(e,t)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class am{constructor(e,t){this.overlayedDocument=e,this.mutatedFields=t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class af{constructor(e,t,r,n){this.remoteDocumentCache=e,this.mutationQueue=t,this.documentOverlayCache=r,this.indexManager=n}getDocument(e,t){let r=null;return this.documentOverlayCache.getOverlay(e,t).next(n=>(r=n,this.remoteDocumentCache.getEntry(e,t))).next(e=>(null!==r&&tn(r.mutation,e,B.empty(),ee.now()),e))}getDocuments(e,t){return this.remoteDocumentCache.getEntries(e,t).next(t=>this.getLocalViewOfDocuments(e,t,t6()).next(()=>t))}getLocalViewOfDocuments(e,t,r=t6()){let n=t3();return this.populateOverlays(e,n,t).next(()=>this.computeViews(e,t,n,r).next(e=>{let t=t2();return e.forEach((e,r)=>{t=t.insert(e,r.overlayedDocument)}),t}))}getOverlayedDocuments(e,t){let r=t3();return this.populateOverlays(e,r,t).next(()=>this.computeViews(e,t,r,t6()))}populateOverlays(e,t,r){let n=[];return r.forEach(e=>{t.has(e)||n.push(e)}),this.documentOverlayCache.getOverlays(e,n).next(e=>{e.forEach((e,r)=>{t.set(e,r)})})}computeViews(e,t,r,n){let s=t0,i=t3(),a=t3();return t.forEach((e,t)=>{let a=r.get(t.key);n.has(t.key)&&(void 0===a||a.mutation instanceof ta)?s=s.insert(t.key,t):void 0!==a?(i.set(t.key,a.mutation.getFieldMask()),tn(a.mutation,t,a.mutation.getFieldMask(),ee.now())):i.set(t.key,B.empty())}),this.recalculateAndSaveOverlays(e,s).next(e=>(e.forEach((e,t)=>i.set(e,t)),t.forEach((e,t)=>a.set(e,new am(t,i.get(e)??null))),a))}recalculateAndSaveOverlays(e,t){let r=t3(),n=new A((e,t)=>e-t),s=t6();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,t).next(e=>{for(let s of e)s.keys().forEach(e=>{let i=t.get(e);if(null===i)return;let a=r.get(e)||B.empty();a=s.applyToLocalView(i,a),r.set(e,a);let o=(n.get(s.batchId)||t6()).add(e);n=n.insert(s.batchId,o)})}).next(()=>{let i=[],a=n.getReverseIterator();for(;a.hasNext();){let n=a.getNext(),o=n.key,u=n.value,l=t3();u.forEach(e=>{if(!s.has(e)){let n=tr(t.get(e),r.get(e));null!==n&&l.set(e,n),s=s.add(e)}}),i.push(this.documentOverlayCache.saveOverlays(e,o,l))}return nh.waitFor(i)}).next(()=>r)}recalculateAndSaveOverlaysForDocumentKeys(e,t){return this.remoteDocumentCache.getEntries(e,t).next(t=>this.recalculateAndSaveOverlays(e,t))}getDocumentsMatchingQuery(e,t,r,n){return i4(t)?this.getDocumentsMatchingPipeline(e,t,r,n):K.isDocumentKey(t.path)&&null===t.collectionGroup&&0===t.filters.length?this.getDocumentsMatchingDocumentQuery(e,t.path):tq(t)?this.getDocumentsMatchingCollectionGroupQuery(e,t,r,n):this.getDocumentsMatchingCollectionQuery(e,t,r,n)}getNextDocuments(e,t,r,n){return this.remoteDocumentCache.getAllFromCollectionGroup(e,t,r,n).next(s=>{let i=n-s.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,t,r.largestBatchId,n-s.size):nh.resolve(t3()),a=-1,o=s;return i.next(t=>nh.forEach(t,(t,r)=>(a<r.largestBatchId&&(a=r.largestBatchId),s.get(t)?nh.resolve():this.remoteDocumentCache.getEntry(e,t).next(e=>{o=o.insert(t,e)}))).next(()=>this.populateOverlays(e,t,s)).next(()=>this.computeViews(e,o,t,t6())).next(e=>{let t;return{batchId:a,changes:(t=t1,e.forEach((e,r)=>t=t.insert(e,r.overlayedDocument)),t)}}))})}getDocumentsMatchingDocumentQuery(e,t){return this.getDocument(e,new K(t)).next(e=>{let t=t2();return e.isFoundDocument()&&(t=t.insert(e.key,e)),t})}getDocumentsMatchingCollectionGroupQuery(e,t,r,n){let s=t.collectionGroup,i=t2();return this.indexManager.getCollectionParents(e,s).next(a=>nh.forEach(a,a=>{let o=new tM(a.child(s),null,t.explicitOrderBy.slice(),t.filters.slice(),t.limit,t.limitType,t.startAt,t.endAt);return this.getDocumentsMatchingCollectionQuery(e,o,r,n).next(e=>{e.forEach((e,t)=>{i=i.insert(e,t)})})}).next(()=>i))}getDocumentsMatchingCollectionQuery(e,t,r,n){let s;return this.documentOverlayCache.getOverlaysForCollection(e,t.path,r.largestBatchId).next(i=>(s=i,this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,r,s,n))).next(e=>this.retrieveMatchingLocalDocuments(s,e,e=>tH(t,e)))}getDocumentsMatchingPipeline(e,t,r,n){if("collection_group"===sE(t)){let s=sx(t),i=t2();return this.indexManager.getCollectionParents(e,s).next(a=>nh.forEach(a,a=>{let o=function(e,t){let r=e.stages.map(e=>e instanceof sl?new su(t.canonicalString(),{}):e);return new s_(e.serializer,r)}(t,a.child(s));return this.getDocumentsMatchingPipeline(e,o,r,n).next(e=>{e.forEach((e,t)=>{i=i.insert(e,t)})})}).next(()=>i))}{let s;return this.getOverlaysForPipeline(e,t,r.largestBatchId).next(i=>{switch(s=i,sE(t)){case"collection":return this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,r,s,n);case"documents":let a=t6();for(let e of sb(t))a=a.add(K.fromPath(e));return this.remoteDocumentCache.getEntries(e,a);case"database":return this.remoteDocumentCache.getAllEntries(e);default:throw new O("invalid-argument",`Invalid pipeline source to execute offline: ${i3(t)}`)}}).next(e=>this.retrieveMatchingLocalDocuments(s,e,e=>al(t,e)))}}retrieveMatchingLocalDocuments(e,t,r){e.forEach((e,r)=>{let n=r.getKey();null===t.get(n)&&(t=t.insert(n,tV.newInvalidDocument(n)))});let n=t2();return t.forEach((t,s)=>{let i=e.get(t);void 0!==i&&tn(i.mutation,s,B.empty(),ee.now()),r(s)&&(n=n.insert(t,s))}),n}getOverlaysForPipeline(e,t,r){switch(sE(t)){case"collection":return this.documentOverlayCache.getOverlaysForCollection(e,F.fromString(sT(t)),r);case"collection_group":throw new O("invalid-argument",`Unexpected collection group pipeline: ${i3(t)}`);case"documents":return this.documentOverlayCache.getOverlays(e,sb(t).map(e=>K.fromPath(e)));case"database":return this.documentOverlayCache.getAllOverlays(e,r);default:throw new O("invalid-argument",`Failed to get overlays for pipeline: ${i3(t)}`)}}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ap{constructor(e){this.serializer=e,this.Ks=new Map,this.Qs=new Map}getBundleMetadata(e,t){return nh.resolve(this.Ks.get(t))}saveBundleMetadata(e,t){return this.Ks.set(t.id,{id:t.id,version:t.version,createTime:rE(t.createTime)}),nh.resolve()}getNamedQuery(e,t){return nh.resolve(this.Qs.get(t))}saveNamedQuery(e,t){return this.Qs.set(t.name,{name:t.name,query:function(e){let t=function(e){var t;let r,n=function(e){let t=rb(e);return 4===t.length?F.emptyPath():rC(t)}(e.parent),s=e.structuredQuery,i=s.from?s.from.length:0,a=null;if(i>0){b(1===i,65062);let e=s.from[0];e.allDescendants?a=e.collectionId:n=n.child(e.collectionId)}let o=[];s.where&&(o=function(e){var t;let r=function e(t){return void 0!==t.unaryFilter?function(e){switch(e.unaryFilter.op){case"IS_NAN":let t=rA(e.unaryFilter.field);return tp.create(t,"==",{doubleValue:NaN});case"IS_NULL":let r=rA(e.unaryFilter.field);return tp.create(r,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":let n=rA(e.unaryFilter.field);return tp.create(n,"!=",{doubleValue:NaN});case"IS_NOT_NULL":let s=rA(e.unaryFilter.field);return tp.create(s,"!=",{nullValue:"NULL_VALUE"});case"OPERATOR_UNSPECIFIED":return T(61313);default:return T(60726)}}(t):void 0!==t.fieldFilter?tp.create(rA(t.fieldFilter.field),function(e){switch(e){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";case"OPERATOR_UNSPECIFIED":return T(58110);default:return T(50506)}}(t.fieldFilter.op),t.fieldFilter.value):void 0!==t.compositeFilter?tg.create(t.compositeFilter.filters.map(t=>e(t)),function(e){switch(e){case"AND":return"and";case"OR":return"or";default:return T(1026)}}(t.compositeFilter.op)):T(30097,{filter:t})}(e);return r instanceof tg&&tw(t=r)&&ty(t)?r.getFilters():[r]}(s.where));let u=[];s.orderBy&&(u=s.orderBy.map(e=>new tI(rA(e.field),function(e){switch(e){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}}(e.direction))));let l=null;s.limit&&(l=null==(r="object"==typeof(t=s.limit)?t.value:t)?null:r);let c=null;s.startAt&&(c=function(e){let t=!!e.before;return new th(e.values||[],t)}(s.startAt));let h=null;return s.endAt&&(h=function(e){let t=!e.before;return new th(e.values||[],t)}(s.endAt)),new tM(n,a,u,o,l,"F",c,h)}({parent:e.parent,structuredQuery:e.structuredQuery});return"LAST"===e.limitType?tG(t,t.limit,"L"):t}(t.bundledQuery),readTime:rE(t.readTime)}),nh.resolve()}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ag{constructor(){this.overlays=new A(K.comparator),this.Ws=new Map}getOverlay(e,t){return nh.resolve(this.overlays.get(t))}getOverlays(e,t){let r=t3();return nh.forEach(t,t=>this.getOverlay(e,t).next(e=>{null!==e&&r.set(t,e)})).next(()=>r)}getAllOverlays(e,t){let r=t3();return this.overlays.forEach((e,n)=>{n.largestBatchId>t&&r.set(e,n)}),nh.resolve(r)}saveOverlays(e,t,r){return r.forEach((r,n)=>{this.Yr(e,t,n)}),nh.resolve()}removeOverlaysForBatchId(e,t,r){let n=this.Ws.get(r);return void 0!==n&&(n.forEach(e=>this.overlays=this.overlays.remove(e)),this.Ws.delete(r)),nh.resolve()}getOverlaysForCollection(e,t,r){let n=t3(),s=t.length+1,i=new K(t.child("")),a=this.overlays.getIteratorFrom(i);for(;a.hasNext();){let e=a.getNext().value,i=e.getKey();if(!t.isPrefixOf(i.path))break;i.path.length===s&&e.largestBatchId>r&&n.set(e.getKey(),e)}return nh.resolve(n)}getOverlaysForCollectionGroup(e,t,r,n){let s=new A((e,t)=>e-t),i=this.overlays.getIterator();for(;i.hasNext();){let e=i.getNext().value;if(e.getKey().getCollectionGroup()===t&&e.largestBatchId>r){let t=s.get(e.largestBatchId);null===t&&(t=t3(),s=s.insert(e.largestBatchId,t)),t.set(e.getKey(),e)}}let a=t3(),o=s.getIterator();for(;o.hasNext()&&(o.getNext().value.forEach((e,t)=>a.set(e,t)),!(a.size()>=n)););return nh.resolve(a)}Yr(e,t,r){let n=this.overlays.get(r.key);if(null!==n){let e=this.Ws.get(n.largestBatchId).delete(r.key);this.Ws.set(n.largestBatchId,e)}this.overlays=this.overlays.insert(r.key,new at(t,r));let s=this.Ws.get(t);void 0===s&&(s=t6(),this.Ws.set(t,s)),this.Ws.set(t,s.add(r.key))}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ay{constructor(){this.sessionToken=er.EMPTY_BYTE_STRING}getSessionToken(e){return nh.resolve(this.sessionToken)}setSessionToken(e,t){return this.sessionToken=t,nh.resolve()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class aw{constructor(){this.Gs=new L(av.zs),this.js=new L(av.Hs)}isEmpty(){return this.Gs.isEmpty()}addReference(e,t){let r=new av(e,t);this.Gs=this.Gs.add(r),this.js=this.js.add(r)}Js(e,t){e.forEach(e=>this.addReference(e,t))}removeReference(e,t){this.Ys(new av(e,t))}Zs(e,t){e.forEach(e=>this.removeReference(e,t))}Xs(e){let t=new K(new F([])),r=new av(t,e),n=new av(t,e+1),s=[];return this.js.forEachInRange([r,n],e=>{this.Ys(e),s.push(e.key)}),s}e_(){this.Gs.forEach(e=>this.Ys(e))}Ys(e){this.Gs=this.Gs.delete(e),this.js=this.js.delete(e)}t_(e){let t=new K(new F([])),r=new av(t,e),n=new av(t,e+1),s=t6();return this.js.forEachInRange([r,n],e=>{s=s.add(e.key)}),s}containsKey(e){let t=new av(e,0),r=this.Gs.firstAfterOrEqual(t);return null!==r&&e.isEqual(r.key)}}class av{constructor(e,t){this.key=e,this.n_=t}static zs(e,t){return K.comparator(e.key,t.key)||S(e.n_,t.n_)}static Hs(e,t){return S(e.n_,t.n_)||K.comparator(e.key,t.key)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class a_{constructor(e,t){this.indexManager=e,this.referenceDelegate=t,this.mutationQueue=[],this.Wr=1,this.r_=new L(av.zs)}checkEmpty(e){return nh.resolve(0===this.mutationQueue.length)}addMutationBatch(e,t,r,n){let s=this.Wr;this.Wr++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];let i=new ae(s,t,r,n);for(let t of(this.mutationQueue.push(i),n))this.r_=this.r_.add(new av(t.key,s)),this.indexManager.addToCollectionParentIndex(e,t.key.path.popLast());return nh.resolve(i)}lookupMutationBatch(e,t){return nh.resolve(this.i_(t))}getNextMutationBatchAfterBatchId(e,t){let r=this.s_(t+1),n=r<0?0:r;return nh.resolve(this.mutationQueue.length>n?this.mutationQueue[n]:null)}getHighestUnacknowledgedBatchId(){return nh.resolve(0===this.mutationQueue.length?-1:this.Wr-1)}getAllMutationBatches(e){return nh.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,t){let r=new av(t,0),n=new av(t,Number.POSITIVE_INFINITY),s=[];return this.r_.forEachInRange([r,n],e=>{let t=this.i_(e.n_);s.push(t)}),nh.resolve(s)}getAllMutationBatchesAffectingDocumentKeys(e,t){let r=new L(S);return t.forEach(e=>{let t=new av(e,0),n=new av(e,Number.POSITIVE_INFINITY);this.r_.forEachInRange([t,n],e=>{r=r.add(e.n_)})}),nh.resolve(this.__(r))}getAllMutationBatchesAffectingQuery(e,t){let r=t.path,n=r.length+1,s=r;K.isDocumentKey(s)||(s=s.child(""));let i=new av(new K(s),0),a=new L(S);return this.r_.forEachWhile(e=>{let t=e.key.path;return!!r.isPrefixOf(t)&&(t.length===n&&(a=a.add(e.n_)),!0)},i),nh.resolve(this.__(a))}__(e){let t=[];return e.forEach(e=>{let r=this.i_(e);null!==r&&t.push(r)}),t}removeMutationBatch(e,t){b(0===this.o_(t.batchId,"removed"),55003),this.mutationQueue.shift();let r=this.r_;return nh.forEach(t.mutations,n=>{let s=new av(n.key,t.batchId);return r=r.delete(s),this.referenceDelegate.markPotentiallyOrphaned(e,n.key)}).next(()=>{this.r_=r})}jr(e){}containsKey(e,t){let r=new av(t,0),n=this.r_.firstAfterOrEqual(r);return nh.resolve(t.isEqual(n&&n.key))}performConsistencyCheck(e){return this.mutationQueue.length,nh.resolve()}o_(e,t){return this.s_(e)}s_(e){return 0===this.mutationQueue.length?0:e-this.mutationQueue[0].batchId}i_(e){let t=this.s_(e);return t<0||t>=this.mutationQueue.length?null:this.mutationQueue[t]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class aE{constructor(e){this.a_=e,this.docs=new A(K.comparator),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,t){let r=t.key,n=this.docs.get(r),s=n?n.size:0,i=this.a_(t);return this.docs=this.docs.insert(r,{document:t.mutableCopy(),size:i}),this.size+=i-s,this.indexManager.addToCollectionParentIndex(e,r.path.popLast())}removeEntry(e){let t=this.docs.get(e);t&&(this.docs=this.docs.remove(e),this.size-=t.size)}getEntry(e,t){let r=this.docs.get(t);return nh.resolve(r?r.document.mutableCopy():tV.newInvalidDocument(t))}getEntries(e,t){let r=t0;return t.forEach(e=>{let t=this.docs.get(e);r=r.insert(e,t?t.document.mutableCopy():tV.newInvalidDocument(e))}),nh.resolve(r)}getAllEntries(e){let t=t0;return this.docs.forEach((e,r)=>{t=t.insert(e,r.document)}),nh.resolve(t)}getDocumentsMatchingQuery(e,t,r,n){let s,i;i4(t)?(s=F.fromString(sT(t)),i=e=>al(t,e)):(s=t.path,i=e=>tH(t,e));let a=t0,o=new K(s.child("__id-9223372036854775808__")),u=this.docs.getIteratorFrom(o);for(;u.hasNext();){let{key:e,value:{document:t}}=u.getNext();if(!s.isPrefixOf(e.path))break;e.path.length>s.length+1||0>=function(e,t){let r=e.readTime.compareTo(t.readTime);return 0!==r?r:0!==(r=K.comparator(e.documentKey,t.documentKey))?r:S(e.largestBatchId,t.largestBatchId)}(new tD(t.readTime,t.key,-1),r)||(n.has(t.key)||i(t))&&(a=a.insert(t.key,t.mutableCopy()))}return nh.resolve(a)}getAllFromCollectionGroup(e,t,r,n){T(9500)}u_(e,t){return nh.forEach(this.docs,e=>t(e))}newChangeBuffer(e){return new aT(this)}getSize(e){return nh.resolve(this.size)}}class aT extends ad{constructor(e){super(),this.qs=e}applyChanges(e){let t=[];return this.changes.forEach((r,n)=>{n.isValidDocument()?t.push(this.qs.addEntry(e,n)):this.qs.removeEntry(r)}),nh.waitFor(t)}getFromCache(e,t){return this.qs.getEntry(e,t)}getAllFromCache(e,t){return this.qs.getEntries(e,t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ax{constructor(e){this.persistence=e,this.c_=new tZ(e=>i8(e),i7),this.lastRemoteSnapshotVersion=tC.min(),this.highestTargetId=0,this.l_=0,this.E_=new aw,this.targetCount=0,this.h_=ao.ys()}forEachTarget(e,t){return this.c_.forEach((e,r)=>t(r)),nh.resolve()}getLastRemoteSnapshotVersion(e){return nh.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return nh.resolve(this.l_)}allocateTargetId(e){return this.highestTargetId=this.h_.next(),nh.resolve(this.highestTargetId)}setTargetsMetadata(e,t,r){return r&&(this.lastRemoteSnapshotVersion=r),t>this.l_&&(this.l_=t),nh.resolve()}vs(e){this.c_.set(e.target,e);let t=e.targetId;t>this.highestTargetId&&(this.h_=new ao(t),this.highestTargetId=t),e.sequenceNumber>this.l_&&(this.l_=e.sequenceNumber)}addTargetData(e,t){return this.vs(t),this.targetCount+=1,nh.resolve()}updateTargetData(e,t){return this.vs(t),nh.resolve()}removeTargetData(e,t){return this.c_.delete(t.target),this.E_.Xs(t.targetId),this.targetCount-=1,nh.resolve()}removeTargets(e,t,r){let n=0,s=[];return this.c_.forEach((i,a)=>{a.sequenceNumber<=t&&null===r.get(a.targetId)&&(this.c_.delete(i),s.push(this.removeMatchingKeysForTargetId(e,a.targetId)),n++)}),nh.waitFor(s).next(()=>n)}getTargetCount(e){return nh.resolve(this.targetCount)}getTargetData(e,t){let r=this.c_.get(t)||null;return nh.resolve(r)}addMatchingKeys(e,t,r){return this.E_.Js(t,r),nh.resolve()}removeMatchingKeys(e,t,r){this.E_.Zs(t,r);let n=this.persistence.referenceDelegate,s=[];return n&&t.forEach(t=>{s.push(n.markPotentiallyOrphaned(e,t))}),nh.waitFor(s)}removeMatchingKeysForTargetId(e,t){return this.E_.Xs(t),nh.resolve()}getMatchingKeysForTargetId(e,t){let r=this.E_.t_(t);return nh.resolve(r)}containsKey(e,t){return nh.resolve(this.E_.containsKey(t))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ab{constructor(e,t){this.T_={},this.overlays={},this.P_=new nu(0),this.R_=!1,this.R_=!0,this.I_=new ay,this.referenceDelegate=e(this),this.A_=new ax(this),this.indexManager=new ai,this.remoteDocumentCache=new aE(e=>this.referenceDelegate.V_(e)),this.serializer=new an(t),this.d_=new ap(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.R_=!1,Promise.resolve()}get started(){return this.R_}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let t=this.overlays[e.toKey()];return t||(t=new ag,this.overlays[e.toKey()]=t),t}getMutationQueue(e,t){let r=this.T_[e.toKey()];return r||(r=new a_(t,this.referenceDelegate),this.T_[e.toKey()]=r),r}getGlobalsCache(){return this.I_}getTargetCache(){return this.A_}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.d_}runTransaction(e,t,r){w("MemoryPersistence","Starting transaction:",e);let n=new aN(this.P_.next());return this.referenceDelegate.f_(),r(n).next(e=>this.referenceDelegate.m_(n).next(()=>e)).toPromise().then(e=>(n.raiseOnCommittedEvent(),e))}p_(e,t){return nh.or(Object.values(this.T_).map(r=>()=>r.containsKey(e,t)))}}class aN extends nl{constructor(e){super(),this.currentSequenceNumber=e}}class aS{constructor(e){this.persistence=e,this.g_=new aw,this.y_=null}static w_(e){return new aS(e)}get b_(){if(this.y_)return this.y_;throw T(60996)}addReference(e,t,r){return this.g_.addReference(r,t),this.b_.delete(r.toString()),nh.resolve()}removeReference(e,t,r){return this.g_.removeReference(r,t),this.b_.add(r.toString()),nh.resolve()}markPotentiallyOrphaned(e,t){return this.b_.add(t.toString()),nh.resolve()}removeTarget(e,t){this.g_.Xs(t.targetId).forEach(e=>this.b_.add(e.toString()));let r=this.persistence.getTargetCache();return r.getMatchingKeysForTargetId(e,t.targetId).next(e=>{e.forEach(e=>this.b_.add(e.toString()))}).next(()=>r.removeTargetData(e,t))}f_(){this.y_=new Set}m_(e){let t=this.persistence.getRemoteDocumentCache().newChangeBuffer();return nh.forEach(this.b_,r=>{let n=K.fromPath(r);return this.S_(e,n).next(e=>{e||t.removeEntry(n,tC.min())})}).next(()=>(this.y_=null,t.apply(e)))}updateLimboDocument(e,t){return this.S_(e,t).next(e=>{e?this.b_.delete(t.toString()):this.b_.add(t.toString())})}V_(e){return 0}S_(e,t){return nh.or([()=>nh.resolve(this.g_.containsKey(t)),()=>this.persistence.getTargetCache().containsKey(e,t),()=>this.persistence.p_(e,t)])}}class aI{constructor(e,t){this.persistence=e,this.v_=new tZ(e=>(function(e){let t="";for(let r=0;r<e.length;r++)t.length>0&&(t+="\x01\x01"),t=function(e,t){let r=t,n=e.length;for(let t=0;t<n;t++){let n=e.charAt(t);switch(n){case"\0":r+="\x01\x10";break;case"\x01":r+="\x01\x11";break;default:r+=n}}return r}(e.get(r),t);return t+"\x01\x01"})(e.path),(e,t)=>e.isEqual(t)),this.garbageCollector=new ny(this,t)}static w_(e,t){return new aI(e,t)}f_(){}m_(e){return nh.resolve()}forEachTarget(e,t){return this.persistence.getTargetCache().forEachTarget(e,t)}rr(e){let t=this.xs(e);return this.persistence.getTargetCache().getTargetCount(e).next(e=>t.next(t=>e+t))}xs(e){let t=0;return this.ir(e,e=>{t++}).next(()=>t)}ir(e,t){return nh.forEach(this.v_,(r,n)=>this.Fs(e,r,n).next(e=>e?nh.resolve():t(n)))}removeTargets(e,t,r){return this.persistence.getTargetCache().removeTargets(e,t,r)}removeOrphanedDocuments(e,t){let r=0,n=this.persistence.getRemoteDocumentCache(),s=n.newChangeBuffer();return n.u_(e,n=>this.Fs(e,n,t).next(e=>{e||(r++,s.removeEntry(n,tC.min()))})).next(()=>s.apply(e)).next(()=>r)}markPotentiallyOrphaned(e,t){return this.v_.set(t,e.currentSequenceNumber),nh.resolve()}removeTarget(e,t){let r=t.withSequenceNumber(e.currentSequenceNumber);return this.persistence.getTargetCache().updateTargetData(e,r)}addReference(e,t,r){return this.v_.set(r,e.currentSequenceNumber),nh.resolve()}removeReference(e,t,r){return this.v_.set(r,e.currentSequenceNumber),nh.resolve()}updateLimboDocument(e,t){return this.v_.set(t,e.currentSequenceNumber),nh.resolve()}V_(e){let t=e.key.toString().length;return e.isFoundDocument()&&(t+=function e(t){switch(eI(t)){case 0:case 1:return 4;case 2:return 8;case 3:case 8:return 16;case 4:let r=ed(t);return r?16+e(r):16;case 5:return 2*t.stringValue.length;case 6:return ea(t.bytesValue).approximateByteSize();case 7:return t.referenceValue.length;case 9:return(t.arrayValue.values||[]).reduce((t,r)=>t+e(r),0);case 10:case 11:var n;let s;return n=t.mapValue,s=0,j(n.fields,(t,r)=>{s+=t.length+e(r)}),s;default:throw T(13486,{value:t})}}(e.data.value)),t}Fs(e,t,r){return nh.or([()=>this.persistence.p_(e,t),()=>this.persistence.getTargetCache().containsKey(e,t),()=>{let e=this.v_.get(t);return nh.resolve(void 0!==e&&e>r)}])}getCacheSize(e){return this.persistence.getRemoteDocumentCache().getSize(e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class aC{constructor(e,t,r,n){this.targetId=e,this.fromCache=t,this.Ao=r,this.Vo=n}static fo(e,t){let r=t6(),n=t6();for(let e of t.docChanges)switch(e.type){case 0:r=r.add(e.doc.key);break;case 1:n=n.add(e.doc.key)}return new aC(e,t.fromCache,r,n)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function aV(e,t){return K.comparator(e.key,t.key)}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class aA{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(e){this._documentReadCount+=e}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class aD{constructor(){this.mo=!1,this.po=!1,this.yo=100,this.wo=(0,u.G6)()?8:function(e){let t=e.match(/Android ([\d.]+)/i);return Number(t?t[1].split(".").slice(0,2).join("."):"-1")}((0,u.z$)())>0?6:4}initialize(e,t){this.bo=e,this.indexManager=t,this.mo=!0}getDocumentsMatchingQuery(e,t,r,n){let s={result:null};return this.So(e,t).next(e=>{s.result=e}).next(()=>{if(!s.result)return this.vo(e,t,n,r).next(e=>{s.result=e})}).next(()=>{if(s.result)return;let r=new aA;return this.Do(e,t,r).next(n=>{if(s.result=n,this.po)return this.xo(e,t,r,n.size)})}).next(()=>s.result)}xo(e,t,r,n){return i4(t)?nh.resolve():r.documentReadCount<this.yo?(y()<=c.in.DEBUG&&w("QueryEngine","SDK will not create cache indexes for query:",tW(t),"since it only creates cache indexes for collection contains","more than or equal to",this.yo,"documents"),nh.resolve()):(y()<=c.in.DEBUG&&w("QueryEngine","Query:",tW(t),"scans",r.documentReadCount,"local documents and returns",n,"documents as results."),r.documentReadCount>this.wo*n?(y()<=c.in.DEBUG&&w("QueryEngine","The SDK decides to create cache indexes for query:",tW(t),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,tB(t))):nh.resolve())}So(e,t){if(i4(t))return nh.resolve(null);let r=t;if(tF(r))return nh.resolve(null);let n=tB(r);return this.indexManager.getIndexType(e,n).next(t=>0===t?null:(null!==r.limit&&1===t&&(n=tB(r=tG(r,null,"F"))),this.indexManager.getDocumentsMatchingTarget(e,n).next(t=>{let s=t6(...t);return this.bo.getDocuments(e,s).next(t=>this.indexManager.getMinOffset(e,n).next(n=>{let i=this.Co(r,t);return this.Fo(r,i,s,n.readTime)?this.So(e,tG(r,null,"F")):this.Oo(e,i,r,n)}))})))}vo(e,t,r,n){return(i4(t)?function(e){for(let t of e.stages){if(t instanceof sm||t instanceof sf)return!1;if(t instanceof sd){if(t.condition instanceof se&&"exists"===t.condition._expr.name&&t.condition._expr.params[0]instanceof n3&&t.condition._expr.params[0].fieldName===U)continue;return!1}}return!0}(t):tF(t))||n.isEqual(tC.min())?nh.resolve(null):this.bo.getDocuments(e,r).next(s=>{let i=this.Co(t,s);return this.Fo(t,i,r,n)?nh.resolve(null):(y()<=c.in.DEBUG&&w("QueryEngine","Re-using previous result from %s to execute query: %s",n.toString(),i6(t)),this.Oo(e,i,t,function(e,t){let r=e.toTimestamp().seconds,n=e.toTimestamp().nanoseconds+1;return new tD(tC.fromTimestamp(1e9===n?new ee(r+1,0):new ee(r,n)),K.empty(),-1)}(n,0)).next(e=>e))})}Co(e,t){let r,n;return i4(e)?(r=new L(aV),n=t=>al(e,t)):(r=new L(tY(e)),n=t=>tH(e,t)),t.forEach((e,t)=>{n(t)&&(r=r.add(t))}),r}Fo(e,t,r,n){if(i4(e))return e.stages.some(e=>e instanceof sm||e instanceof sf);if(null===e.limit)return!1;if(r.size!==t.size)return!0;let s="F"===e.limitType?t.last():t.first();return!!s&&(s.hasPendingWrites||s.version.compareTo(n)>0)}Do(e,t,r){return y()<=c.in.DEBUG&&w("QueryEngine","Using full collection scan to execute query:",i6(t)),this.bo.getDocumentsMatchingQuery(e,t,tD.min(),r)}Oo(e,t,r,n){return this.bo.getDocumentsMatchingQuery(e,r,n).next(e=>(t.forEach(t=>{e=e.insert(t.key,t)}),e))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let ak="LocalStore";class aL{constructor(e,t,r,n){this.persistence=e,this.Mo=t,this.serializer=n,this.No=new A(S),this.Lo=new tZ(e=>i8(e),i7),this.Bo=new Map,this.Uo=e.getRemoteDocumentCache(),this.A_=e.getTargetCache(),this.d_=e.getBundleCache(),this.ko(r)}ko(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new af(this.Uo,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.Uo.setIndexManager(this.indexManager),this.Mo.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",t=>e.collect(t,this.No))}}async function aR(e,t){return await e.persistence.runTransaction("Handle user change","readonly",r=>{let n;return e.mutationQueue.getAllMutationBatches(r).next(s=>(n=s,e.ko(t),e.mutationQueue.getAllMutationBatches(r))).next(t=>{let s=[],i=[],a=t6();for(let e of n)for(let t of(s.push(e.batchId),e.mutations))a=a.add(t.key);for(let e of t)for(let t of(i.push(e.batchId),e.mutations))a=a.add(t.key);return e.localDocuments.getDocuments(r,a).next(e=>({qo:e,removedBatchIds:s,addedBatchIds:i}))})})}function aP(e){return e.persistence.runTransaction("Get last remote snapshot version","readonly",t=>e.A_.getLastRemoteSnapshotVersion(t))}async function aO(e,t,r){let n=e.No.get(t);try{r||await e.persistence.runTransaction("Release target",r?"readwrite":"readwrite-primary",t=>e.persistence.referenceDelegate.removeTarget(t,n))}catch(e){if(!nd(e))throw e;w(ak,`Failed to update sequence numbers for target ${t}: ${e}`)}e.No=e.No.remove(t),e.Lo.delete(n.target)}function aU(e,t,r){let n=tC.min(),s=t6();return e.persistence.runTransaction("Execute query","readwrite",i=>(function(e,t,r){let n=e.Lo.get(r);return void 0!==n?nh.resolve(e.No.get(n)):e.A_.getTargetData(t,r)})(e,i,i4(t)?t:tB(t)).next(t=>{if(t)return n=t.lastLimboFreeSnapshotVersion,e.A_.getMatchingKeysForTargetId(i,t.targetId).next(e=>{s=e})}).next(()=>e.Mo.getDocumentsMatchingQuery(i,t,r?n:tC.min(),r?s:t6())).next(t=>((function(e,t){t.forEach((t,r)=>{let n=r.key.getCollectionGroup(),s=e.Bo.get(n)||tC.min();r.readTime.compareTo(s)>0&&e.Bo.set(n,r.readTime)})})(e,t),{documents:t,Qo:s})))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class aM{constructor(e,t){this.asyncQueue=e,this.onlineStateHandler=t,this.state="Unknown",this.Jo=0,this.Yo=null,this.Zo=!0}Xo(){0===this.Jo&&(this.ea("Unknown"),this.Yo=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,()=>(this.Yo=null,this.ta("Backend didn't respond within 10 seconds."),this.ea("Offline"),Promise.resolve())))}na(e){"Online"===this.state?this.ea("Unknown"):(this.Jo++,this.Jo>=1&&(this.ra(),this.ta(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.ea("Offline")))}set(e){this.ra(),this.Jo=0,"Online"===e&&(this.Zo=!1),this.ea(e)}ea(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}ta(e){let t=`Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.Zo?(v(t),this.Zo=!1):w("OnlineStateTracker",t)}ra(){null!==this.Yo&&(this.Yo.cancel(),this.Yo=null)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let aF="RemoteStore";class aq{constructor(e,t,r,n,s){this.localStore=e,this.datastore=t,this.asyncQueue=r,this.remoteSyncer={},this.ia=[],this.sa=new Map,this._a=new Map,this.oa=new Map,this.aa=new ao(1e3),this.ua=new ao(1001),this.ca=new Set,this.la=[],this.Ea=s,this.Ea.Ke(e=>{r.enqueueAndForget(async()=>{aY(this)&&(w(aF,"Restarting streams for network reachability change."),await async function(e){e.ca.add(4),await aB(e),e.ha.set("Unknown"),e.ca.delete(4),await a$(e)}(this))})}),this.ha=new aM(r,n)}}async function a$(e){if(aY(e))for(let t of e.la)await t(!0)}async function aB(e){for(let t of e.la)await t(!1)}function az(e,t){return e._a.get(t)||void 0}function aj(e,t){let r=az(e,t.targetId);if(void 0!==r&&e.sa.has(r))return;let n=function(e,t){let r=az(e,t);void 0!==r&&e.oa.delete(r);let n=t%2!=0?e.ua.next():e.aa.next();return e._a.set(t,n),e.oa.set(n,t),n}(e,t.targetId);w(aF,"remoteStoreListen mapping SDK target ID to remote",t.targetId,n);let s=new ar(t.target,n,t.purpose,t.sequenceNumber,t.snapshotVersion,t.lastLimboFreeSnapshotVersion,t.resumeToken);e.sa.set(n,s),aH(e)?aW(e):a4(e).Jt()&&aK(e,s)}function aG(e,t){let r=a4(e),n=az(e,t);w(aF,"remoteStoreUnlisten removing mapping of SDK target ID to remote",t,n),e.sa.delete(n),e._a.delete(t),e.oa.delete(n),r.Jt()&&aQ(e,n),0===e.sa.size&&(r.Jt()?r.Xt():aY(e)&&e.ha.set("Unknown"))}function aK(e,t){if(e.Ta.H(t.targetId),t.resumeToken.approximateByteSize()>0||t.snapshotVersion.compareTo(tC.min())>0){let r=e.oa.get(t.targetId);if(void 0===r)return void w(aF,"SDK target ID not found for remote ID: "+t.targetId);let n=e.remoteSyncer.getRemoteKeysForTarget(r).size;t=t.withExpectedCount(n)}a4(e).Tn(t)}function aQ(e,t){e.Ta.H(t),a4(e).Pn(t)}function aW(e){e.Ta=new rl({getRemoteKeysForTarget:t=>{let r=e.oa.get(t);return void 0!==r?e.remoteSyncer.getRemoteKeysForTarget(r):t6()},ge:t=>e.sa.get(t)||null,Ae:()=>e.datastore.serializer.databaseId}),a4(e).start(),e.ha.Xo()}function aH(e){return aY(e)&&!a4(e).Ht()&&e.sa.size>0}function aY(e){return 0===e.ca.size}async function aJ(e){e.ha.set("Online")}async function aX(e){e.sa.forEach((t,r)=>{aK(e,t)})}async function aZ(e,t){e.Ta=void 0,aH(e)?(e.ha.na(t),aW(e)):e.ha.set("Unknown")}async function a0(e,t,r){if(e.ha.set("Online"),t instanceof ra&&2===t.state&&t.cause)try{await async function(e,t){let r=t.cause;for(let n of t.targetIds){if(e.sa.has(n)){let t=e.oa.get(n);void 0!==t&&(await e.remoteSyncer.rejectListen(t,r),e._a.delete(t),e.oa.delete(n)),e.sa.delete(n)}e.Ta.removeTarget(n)}}(e,t)}catch(r){w(aF,"Failed to remove targets %s: %s ",t.targetIds.join(","),r),await a1(e,r)}else if(t instanceof rs?e.Ta.se(t):t instanceof ri?e.Ta.Ee(t):e.Ta.ae(t),!r.isEqual(tC.min()))try{let t=await aP(e.localStore);r.compareTo(t)>=0&&await function(e,t){let r=e.Ta.de(t);r.targetChanges.forEach((r,n)=>{if(r.resumeToken.approximateByteSize()>0){let s=e.sa.get(n);s&&e.sa.set(n,s.withResumeToken(r.resumeToken,t))}}),r.targetMismatches.forEach((t,r)=>{let n=e.sa.get(t);if(!n)return;e.sa.set(t,n.withResumeToken(er.EMPTY_BYTE_STRING,n.snapshotVersion)),aQ(e,t);let s=new ar(n.target,t,r,n.sequenceNumber);aK(e,s)});let n=function(e,t){let r=new Map;t.targetChanges.forEach((t,n)=>{let s=e.oa.get(n);void 0!==s&&r.set(s,t)});let n=new A(S);return t.targetMismatches.forEach((t,r)=>{let s=e.oa.get(t);void 0!==s&&(n=n.insert(s,r))}),new rr(t.snapshotVersion,r,n,t.documentUpdates,t.augmentedDocumentUpdates,t.resolvedLimboDocuments)}(e,r);return e.remoteSyncer.applyRemoteEvent(n)}(e,r)}catch(t){w(aF,"Failed to raise snapshot:",t),await a1(e,t)}}async function a1(e,t,r){if(!nd(t))throw t;e.ca.add(1),await aB(e),e.ha.set("Offline"),r||(r=()=>aP(e.localStore)),e.asyncQueue.enqueueRetryable(async()=>{w(aF,"Retrying IndexedDB access"),await r(),e.ca.delete(1),await a$(e)})}async function a2(e,t){e.asyncQueue.verifyOperationInProgress(),w(aF,"RemoteStore received new credentials");let r=aY(e);e.ca.add(3),await aB(e),r&&e.ha.set("Unknown"),await e.remoteSyncer.handleCredentialChange(t),e.ca.delete(3),await a$(e)}async function a3(e,t){t?(e.ca.delete(2),await a$(e)):t||(e.ca.add(2),await aB(e),e.ha.set("Unknown"))}function a4(e){var t,r,n;return e.Pa||(e.Pa=(t=e.datastore,r=e.asyncQueue,n={ut:aJ.bind(null,e),lt:aX.bind(null,e),ht:aZ.bind(null,e),hn:a0.bind(null,e)},t.mn(),new nr(r,t.connection,t.authCredentials,t.appCheckCredentials,t.serializer,n)),e.la.push(async t=>{t?(e.Pa.Zt(),aH(e)?aW(e):e.ha.set("Unknown")):(await e.Pa.stop(),e.Ta=void 0)})),e.Pa}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class a6{constructor(e){this.observer=e,this.muted=!1}next(e){this.muted||this.observer.next&&this.Ia(this.observer.next,e)}error(e){this.muted||(this.observer.error?this.Ia(this.observer.error,e):v("Uncaught Error in snapshot listener:",e.toString()))}Aa(){this.muted=!0}Ia(e,t){setTimeout(()=>{this.muted||e(t)},0)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class a9{constructor(e,t,r,n,s){this.asyncQueue=e,this.timerId=t,this.targetTimeMs=r,this.op=n,this.removalCallback=s,this.deferred=new r$,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(e=>{})}get promise(){return this.deferred.promise}static createAndSchedule(e,t,r,n,s){let i=new a9(e,t,Date.now()+r,n,s);return i.start(r),i}start(e){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){null!==this.timerHandle&&(this.clearTimeout(),this.deferred.reject(new O(P.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>null!==this.timerHandle?(this.clearTimeout(),this.op().then(e=>this.deferred.resolve(e))):Promise.resolve())}clearTimeout(){null!==this.timerHandle&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function a5(e,t){if(v("AsyncQueue",`${t}: ${e}`),nd(e))return new O(P.UNAVAILABLE,`${t}: ${e}`);throw e}class a8{constructor(){this.activeTargetIds=t9}La(e){this.activeTargetIds=this.activeTargetIds.add(e)}Ba(e){this.activeTargetIds=this.activeTargetIds.delete(e)}Na(){return JSON.stringify({activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()})}}class a7{constructor(){this.du=new a8,this.fu={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,t,r){}addLocalQueryTarget(e,t=!0){return t&&this.du.La(e),this.fu[e]||"not-current"}updateQueryState(e,t,r){this.fu[e]=t}removeLocalQueryTarget(e){this.du.Ba(e)}isLocalQueryTarget(e){return this.du.activeTargetIds.has(e)}clearQueryState(e){delete this.fu[e]}getAllActiveQueryTargets(){return this.du.activeTargetIds}isActiveQueryTarget(e){return this.du.activeTargetIds.has(e)}start(){return this.du=new a8,Promise.resolve()}handleUserChange(e,t,r){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}}function oe(){return"undefined"!=typeof document?document:null}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ot{static emptySet(e){return new ot(e.comparator)}constructor(e){this.comparator=e?(t,r)=>e(t,r)||K.comparator(t.key,r.key):(e,t)=>K.comparator(e.key,t.key),this.keyedMap=t2(),this.sortedSet=new A(this.comparator)}has(e){return null!=this.keyedMap.get(e)}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){let t=this.keyedMap.get(e);return t?this.sortedSet.indexOf(t):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal((t,r)=>(e(t),!1))}add(e){let t=this.delete(e.key);return t.copy(t.keyedMap.insert(e.key,e),t.sortedSet.insert(e,null))}delete(e){let t=this.get(e);return t?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(t)):this}isEqual(e){if(!(e instanceof ot)||this.size!==e.size)return!1;let t=this.sortedSet.getIterator(),r=e.sortedSet.getIterator();for(;t.hasNext();){let e=t.getNext().key,n=r.getNext().key;if(!e.isEqual(n))return!1}return!0}toString(){let e=[];return this.forEach(t=>{e.push(t.toString())}),0===e.length?"DocumentSet ()":"DocumentSet (\n  "+e.join("  \n")+"\n)"}copy(e,t){let r=new ot;return r.comparator=this.comparator,r.keyedMap=e,r.sortedSet=t,r}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class or{constructor(){this.mu=new A(K.comparator)}track(e){let t=e.doc.key,r=this.mu.get(t);r?0!==e.type&&3===r.type?this.mu=this.mu.insert(t,e):3===e.type&&1!==r.type?this.mu=this.mu.insert(t,{type:r.type,doc:e.doc}):2===e.type&&2===r.type?this.mu=this.mu.insert(t,{type:2,doc:e.doc}):2===e.type&&0===r.type?this.mu=this.mu.insert(t,{type:0,doc:e.doc}):1===e.type&&0===r.type?this.mu=this.mu.remove(t):1===e.type&&2===r.type?this.mu=this.mu.insert(t,{type:1,doc:r.doc}):0===e.type&&1===r.type?this.mu=this.mu.insert(t,{type:2,doc:e.doc}):T(63341,{ye:e,pu:r}):this.mu=this.mu.insert(t,e)}gu(){let e=[];return this.mu.inorderTraversal((t,r)=>{e.push(r)}),e}}class on{constructor(e,t,r,n,s,i,a,o,u){this.query=e,this.docs=t,this.oldDocs=r,this.docChanges=n,this.mutatedKeys=s,this.fromCache=i,this.syncStateChanged=a,this.excludesMetadataChanges=o,this.hasCachedResults=u}static fromInitialDocuments(e,t,r,n,s){let i=[];return t.forEach(e=>{i.push({type:0,doc:e})}),new on(e,t,ot.emptySet(t),i,r,n,!0,!1,s)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&i5(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;let t=this.docChanges,r=e.docChanges;if(t.length!==r.length)return!1;for(let e=0;e<t.length;e++)if(t[e].type!==r[e].type||!t[e].doc.isEqual(r[e].doc))return!1;return!0}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class os{constructor(){this.yu=void 0,this.wu=[]}bu(){return this.wu.some(e=>e.Su())}}class oi{constructor(){this.queries=oa(),this.onlineState="Unknown",this.vu=new Set}terminate(){!function(e,t){let r=e.queries;e.queries=oa(),r.forEach((e,r)=>{for(let e of r.wu)e.onError(t)})}(this,new O(P.ABORTED,"Firestore shutting down"))}}function oa(){return new tZ(e=>i9(e),i5)}async function oo(e,t){let r=3,n=t.query,s=e.queries.get(n);s?!s.bu()&&t.Su()&&(r=2):(s=new os,r=t.Su()?0:1);try{switch(r){case 0:s.yu=await e.onListen(n,!0);break;case 1:s.yu=await e.onListen(n,!1);break;case 2:await e.onFirstRemoteStoreListen(n)}}catch(r){let e=a5(r,`Initialization of query '${i4(t.query)?i3(t.query):tW(t.query)}' failed`);return void t.onError(e)}e.queries.set(n,s),s.wu.push(t),t.Du(e.onlineState),s.yu&&t.xu(s.yu)&&oh(e)}async function ou(e,t){let r=t.query,n=3,s=e.queries.get(r);if(s){let e=s.wu.indexOf(t);e>=0&&(s.wu.splice(e,1),0===s.wu.length?n=t.Su()?0:1:!s.bu()&&t.Su()&&(n=2))}switch(n){case 0:return e.queries.delete(r),e.onUnlisten(r,!0);case 1:return e.queries.delete(r),e.onUnlisten(r,!1);case 2:return e.onLastRemoteStoreUnlisten(r);default:return}}function ol(e,t){let r=!1;for(let n of t){let t=n.query,s=e.queries.get(t);if(s){for(let e of s.wu)e.xu(n)&&(r=!0);s.yu=n}}r&&oh(e)}function oc(e,t,r){let n=e.queries.get(t);if(n)for(let e of n.wu)e.onError(r);e.queries.delete(t)}function oh(e){e.vu.forEach(e=>{e.next()})}(n=a||(a={})).Default="default",n.Cache="cache";class od{constructor(e,t,r){this.query=e,this.Cu=t,this.Fu=!1,this.Ou=null,this.onlineState="Unknown",this.options=r||{}}xu(e){if(!this.options.includeMetadataChanges){let t=[];for(let r of e.docChanges)3!==r.type&&t.push(r);e=new on(e.query,e.docs,e.oldDocs,t,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let t=!1;return this.Fu?this.Mu(e)&&(this.Cu.next(e),t=!0):this.Nu(e,this.onlineState)&&(this.Lu(e),t=!0),this.Ou=e,t}onError(e){this.Cu.error(e)}Du(e){this.onlineState=e;let t=!1;return this.Ou&&!this.Fu&&this.Nu(this.Ou,e)&&(this.Lu(this.Ou),t=!0),t}Nu(e,t){return!(e.fromCache&&this.Su())||(!this.options.waitForSyncWhenOnline||!("Offline"!==t))&&(!e.docs.isEmpty()||e.hasCachedResults||"Offline"===t)}Mu(e){if(e.docChanges.length>0)return!0;let t=this.Ou&&this.Ou.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!t)&&!0===this.options.includeMetadataChanges}Lu(e){e=on.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.Fu=!0,this.Cu.next(e)}Su(){return this.options.source!==a.Cache}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class om{constructor(e){this.key=e}}class of{constructor(e){this.key=e}}class op{constructor(e,t){this.query=e,this.Gu=t,this.zu=null,this.hasCachedResults=!1,this.current=!1,this.ju=t6(),this.mutatedKeys=t6(),this.Hu=i4(e)?ac(e):tY(e),this.Ju=new ot(this.Hu)}get Yu(){return this.Gu}Zu(e,t){let r=t?t.Xu:new or,n=t?t.Ju:this.Ju,s=t?t.mutatedKeys:this.mutatedKeys,i=n,a=!1,[o,u]=this.ec(this.query,n);e.inorderTraversal((e,t)=>{var l;let c=n.get(e),h=(i4(l=this.query)?al(l,t):tH(l,t))?t:null,d=!!c&&this.mutatedKeys.has(c.key),m=!!h&&(h.hasLocalMutations||this.mutatedKeys.has(h.key)&&h.hasCommittedMutations),f=!1;c&&h?c.data.isEqual(h.data)?d!==m&&(r.track({type:3,doc:h}),f=!0):this.tc(c,h)||(r.track({type:2,doc:h}),f=!0,(o&&this.Hu(h,o)>0||u&&0>this.Hu(h,u))&&(a=!0)):!c&&h?(r.track({type:0,doc:h}),f=!0):c&&!h&&(r.track({type:1,doc:c}),f=!0,(o||u)&&(a=!0)),f&&(h?(i=i.add(h),s=m?s.add(e):s.delete(e)):(i=i.delete(e),s=s.delete(e)))});let l=this.nc(this.query);if(l){if(i4(this.query)){let e=[];i.forEach(t=>e.push(t));let t=au(this.query,e),n=new ot(ac(this.query));for(let e of t)n=n.add(e);i.forEach(e=>{n.has(e.key)||(s=s.delete(e.key),r.track({type:1,doc:e}))}),i=n}else{let e=this.rc(this.query);for(;i.size>l;){let t="F"===e?i.last():i.first();i=i.delete(t.key),s=s.delete(t.key),r.track({type:1,doc:t})}}}return{Ju:i,Xu:r,Fo:a,mutatedKeys:s}}nc(e){return i4(e)?ah(e)?.limit:e.limit||void 0}rc(e){if(i4(e)){let t=ah(e);return t&&t.limit<0?"L":"F"}return e.limitType}ec(e,t){if(i4(e)){let r=ah(e)?.limit;return[t.size===r?t.last():null,null]}return["F"===e.limitType&&t.size===this.nc(this.query)?t.last():null,"L"===e.limitType&&t.size===this.nc(this.query)?t.first():null]}tc(e,t){return e.hasLocalMutations&&t.hasCommittedMutations&&!t.hasLocalMutations}applyChanges(e,t,r,n){let s=this.Ju;this.Ju=e.Ju,this.mutatedKeys=e.mutatedKeys;let i=e.Xu.gu();i.sort((e,t)=>(function(e,t){let r=e=>{switch(e){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return T(20277,{ye:e})}};return r(e)-r(t)})(e.type,t.type)||this.Hu(e.doc,t.doc)),this.sc(r),n=n??!1;let a=t&&!n?this._c():[],o=0===this.ju.size&&this.current&&!n?1:0,u=o!==this.zu;return(this.zu=o,0!==i.length||u)?{snapshot:new on(this.query,e.Ju,s,i,e.mutatedKeys,0===o,u,!1,!!r&&r.resumeToken.approximateByteSize()>0),oc:a}:{oc:a}}Du(e){return this.current&&"Offline"===e?(this.current=!1,this.applyChanges({Ju:this.Ju,Xu:new or,mutatedKeys:this.mutatedKeys,Fo:!1},!1)):{oc:[]}}ac(e){return!this.Gu.has(e)&&!!this.Ju.has(e)&&!this.Ju.get(e).hasLocalMutations}sc(e){e&&(e.addedDocuments.forEach(e=>this.Gu=this.Gu.add(e)),e.modifiedDocuments.forEach(e=>{}),e.removedDocuments.forEach(e=>this.Gu=this.Gu.delete(e)),this.current=e.current)}_c(){if(!this.current)return[];let e=this.ju;this.ju=t6(),this.Ju.forEach(e=>{this.ac(e.key)&&(this.ju=this.ju.add(e.key))});let t=[];return e.forEach(e=>{this.ju.has(e)||t.push(new of(e))}),this.ju.forEach(r=>{e.has(r)||t.push(new om(r))}),t}uc(e){this.Gu=e.Qo,this.ju=t6();let t=this.Zu(e.documents);return this.applyChanges(t,!0)}cc(){return on.fromInitialDocuments(this.query,this.Ju,this.mutatedKeys,0===this.zu,this.hasCachedResults)}}let og="SyncEngine";class oy{constructor(e,t,r){this.query=e,this.targetId=t,this.view=r}}class ow{constructor(e){this.key=e,this.lc=!1}}class ov{constructor(e,t,r,n,s,i){this.localStore=e,this.remoteStore=t,this.eventManager=r,this.sharedClientState=n,this.currentUser=s,this.maxConcurrentLimboResolutions=i,this.Ec={},this.hc=new tZ(e=>i9(e),i5),this.Tc=new Map,this.Pc=new Set,this.Rc=new A(K.comparator),this.Ic=new Map,this.Ac=new aw,this.Vc={},this.dc=new Map,this.fc=ao.ws(),this.onlineState="Unknown",this.mc=void 0}get isPrimaryClient(){return!0===this.mc}}async function o_(e,t,r=!0){let n;let s=oO(e),i=s.hc.get(t);return i?(s.sharedClientState.addLocalQueryTarget(i.targetId),n=i.view.cc()):n=await oT(s,t,r,!0),n}async function oE(e,t){let r=oO(e);await oT(r,t,!0,!1)}async function oT(e,t,r,n){var s,i;let a;let o=await (s=e.localStore,i=i4(t)?t:tB(t),s.persistence.runTransaction("Allocate target","readwrite",e=>{let t;return s.A_.getTargetData(e,i).next(r=>r?(t=r,nh.resolve(t)):s.A_.allocateTargetId(e).next(r=>(t=new ar(i,r,"TargetPurposeListen",e.currentSequenceNumber),s.A_.addTargetData(e,t).next(()=>t))))}).then(e=>{let t=s.No.get(e.targetId);return(null===t||e.snapshotVersion.compareTo(t.snapshotVersion)>0)&&(s.No=s.No.insert(e.targetId,e),s.Lo.set(i,e.targetId)),e})),u=o.targetId,l=e.sharedClientState.addLocalQueryTarget(u,r);return n&&(a=await ox(e,t,u,"current"===l,o.resumeToken)),e.isPrimaryClient&&r&&aj(e.remoteStore,o),a}async function ox(e,t,r,n,s){e.gc=(t,r,n)=>(async function(e,t,r,n){let s=t.view.Zu(r);s.Fo&&(s=await aU(e.localStore,t.query,!1).then(({documents:e})=>t.view.Zu(e,s)));let i=n&&n.targetChanges.get(t.targetId),a=n&&null!=n.targetMismatches.get(t.targetId),o=t.view.applyChanges(s,e.isPrimaryClient,i,a);return oD(e,t.targetId,o.oc),o.snapshot})(e,t,r,n);let i=await aU(e.localStore,t,!0),a=new op(t,i.Qo),o=a.Zu(i.documents),u=rn.createSynthesizedTargetChangeForCurrentChange(r,n&&"Offline"!==e.onlineState,s),l=a.applyChanges(o,e.isPrimaryClient,u);oD(e,r,l.oc);let c=new oy(t,r,a);return e.hc.set(t,c),e.Tc.has(r)?e.Tc.get(r).push(t):e.Tc.set(r,[t]),l.snapshot}async function ob(e,t,r){let n=e.hc.get(t),s=e.Tc.get(n.targetId);if(s.length>1)return e.Tc.set(n.targetId,s.filter(e=>!i5(e,t))),void e.hc.delete(t);e.isPrimaryClient?(e.sharedClientState.removeLocalQueryTarget(n.targetId),e.sharedClientState.isActiveQueryTarget(n.targetId)||await aO(e.localStore,n.targetId,!1).then(()=>{e.sharedClientState.clearQueryState(n.targetId),r&&aG(e.remoteStore,n.targetId),oV(e,n.targetId)}).catch(nc)):(oV(e,n.targetId),await aO(e.localStore,n.targetId,!0))}async function oN(e,t){let r=e.hc.get(t),n=e.Tc.get(r.targetId);e.isPrimaryClient&&1===n.length&&(e.sharedClientState.removeLocalQueryTarget(r.targetId),aG(e.remoteStore,r.targetId))}async function oS(e,t){try{let r=await function(e,t){let r=t.snapshotVersion,n=e.No;return e.persistence.runTransaction("Apply remote event","readwrite-primary",s=>{var i;let a,o;let u=e.Uo.newChangeBuffer({trackRemovals:!0});n=e.No;let l=[];t.targetChanges.forEach((i,a)=>{var o;let u=n.get(a);if(!u)return;l.push(e.A_.removeMatchingKeys(s,i.removedDocuments,a).next(()=>e.A_.addMatchingKeys(s,i.addedDocuments,a)));let c=u.withSequenceNumber(s.currentSequenceNumber);null!==t.targetMismatches.get(a)?c=c.withResumeToken(er.EMPTY_BYTE_STRING,tC.min()).withLastLimboFreeSnapshotVersion(tC.min()):i.resumeToken.approximateByteSize()>0&&(c=c.withResumeToken(i.resumeToken,r)),n=n.insert(a,c),o=c,(0===u.resumeToken.approximateByteSize()||o.snapshotVersion.toMicroseconds()-u.snapshotVersion.toMicroseconds()>=3e8||i.addedDocuments.size+i.modifiedDocuments.size+i.removedDocuments.size>0)&&l.push(e.A_.updateTargetData(s,c))});let c=t0,h=t6();if(t.documentUpdates.forEach(r=>{t.resolvedLimboDocuments.has(r)&&l.push(e.persistence.referenceDelegate.updateLimboDocument(s,r))}),l.push((i=t.documentUpdates,a=t6(),o=t6(),i.forEach(e=>a=a.add(e)),u.getEntries(s,a).next(e=>{let t=t0;return i.forEach((r,n)=>{let s=e.get(r);n.isFoundDocument()!==s.isFoundDocument()&&(o=o.add(r)),n.isNoDocument()&&n.version.isEqual(tC.min())?(u.removeEntry(r,n.readTime),t=t.insert(r,n)):!s.isValidDocument()||n.version.compareTo(s.version)>0||0===n.version.compareTo(s.version)&&s.hasPendingWrites?(u.addEntry(n),t=t.insert(r,n)):w(ak,"Ignoring outdated watch update for ",r,". Current version:",s.version," Watch version:",n.version)}),{$o:t,Ko:o}})).next(e=>{c=e.$o,h=e.Ko})),!r.isEqual(tC.min())){let t=e.A_.getLastRemoteSnapshotVersion(s).next(t=>e.A_.setTargetsMetadata(s,s.currentSequenceNumber,r));l.push(t)}return nh.waitFor(l).next(()=>u.apply(s)).next(()=>e.localDocuments.getLocalViewOfDocuments(s,c,h)).next(()=>c)}).then(t=>(e.No=n,t))}(e.localStore,t);t.targetChanges.forEach((t,r)=>{let n=e.Ic.get(r);n&&(b(t.addedDocuments.size+t.modifiedDocuments.size+t.removedDocuments.size<=1,22616),t.addedDocuments.size>0?n.lc=!0:t.modifiedDocuments.size>0?b(n.lc,14607):t.removedDocuments.size>0&&(b(n.lc,42227),n.lc=!1))}),await oL(e,r,t)}catch(e){await nc(e)}}function oI(e,t,r){var n;if(e.isPrimaryClient&&0===r||!e.isPrimaryClient&&1===r){let r;let s=[];e.hc.forEach((e,r)=>{let n=r.view.Du(t);n.snapshot&&s.push(n.snapshot)}),(n=e.eventManager).onlineState=t,r=!1,n.queries.forEach((e,n)=>{for(let e of n.wu)e.Du(t)&&(r=!0)}),r&&oh(n),s.length&&e.Ec.hn(s),e.onlineState=t,e.isPrimaryClient&&e.sharedClientState.setOnlineState(t)}}async function oC(e,t,r){e.sharedClientState.updateQueryState(t,"rejected",r);let n=e.Ic.get(t),s=n&&n.key;if(s){let r=new A(K.comparator);r=r.insert(s,tV.newNoDocument(s,tC.min()));let n=t6().add(s),i=new rr(tC.min(),new Map,new A(S),r,t0,n);await oS(e,i),e.Rc=e.Rc.remove(s),e.Ic.delete(t),ok(e)}else await aO(e.localStore,t,!1).then(()=>oV(e,t,r)).catch(nc)}function oV(e,t,r=null){for(let n of(e.sharedClientState.removeLocalQueryTarget(t),e.Tc.get(t)))e.hc.delete(n),r&&e.Ec.yc(n,r);e.Tc.delete(t),e.isPrimaryClient&&e.Ac.Xs(t).forEach(t=>{e.Ac.containsKey(t)||oA(e,t)})}function oA(e,t){e.Pc.delete(t.path.canonicalString());let r=e.Rc.get(t);null!==r&&(aG(e.remoteStore,r),e.Rc=e.Rc.remove(t),e.Ic.delete(r),ok(e))}function oD(e,t,r){for(let n of r)n instanceof om?(e.Ac.addReference(n.key,t),function(e,t){let r=t.key,n=r.path.canonicalString();e.Rc.get(r)||e.Pc.has(n)||(w(og,"New document in limbo: "+r),e.Pc.add(n),ok(e))}(e,n)):n instanceof of?(w(og,"Document no longer in limbo: "+n.key),e.Ac.removeReference(n.key,t),e.Ac.containsKey(n.key)||oA(e,n.key)):T(19791,{wc:n})}function ok(e){for(;e.Pc.size>0&&e.Rc.size<e.maxConcurrentLimboResolutions;){let t=e.Pc.values().next().value;e.Pc.delete(t);let r=new K(F.fromString(t)),n=e.fc.next();e.Ic.set(n,new ow(r)),e.Rc=e.Rc.insert(r,n),aj(e.remoteStore,new ar(tB(new tM(r.path)),n,"TargetPurposeLimboResolution",nu.yn))}}async function oL(e,t,r){let n=[],s=[],i=[];e.hc.isEmpty()||(e.hc.forEach((a,o)=>{i.push(e.gc(o,t,r).then(t=>{if((t||r)&&e.isPrimaryClient){let n=t?!t.fromCache:r?.targetChanges.get(o.targetId)?.current;e.sharedClientState.updateQueryState(o.targetId,n?"current":"not-current")}if(t){n.push(t);let e=aC.fo(o.targetId,t);s.push(e)}}))}),await Promise.all(i),e.Ec.hn(n),await async function(e,t){try{await e.persistence.runTransaction("notifyLocalViewChanges","readwrite",r=>nh.forEach(t,t=>nh.forEach(t.Ao,n=>e.persistence.referenceDelegate.addReference(r,t.targetId,n)).next(()=>nh.forEach(t.Vo,n=>e.persistence.referenceDelegate.removeReference(r,t.targetId,n)))))}catch(e){if(!nd(e))throw e;w(ak,"Failed to update sequence numbers: "+e)}for(let r of t){let t=r.targetId;if(!r.fromCache){let r=e.No.get(t),n=r.snapshotVersion,s=r.withLastLimboFreeSnapshotVersion(n);e.No=e.No.insert(t,s)}}}(e.localStore,s))}async function oR(e,t){var r;if(!e.currentUser.isEqual(t)){w(og,"User change. New user:",t.toKey());let n=await aR(e.localStore,t);e.currentUser=t,r="'waitForPendingWrites' promise is rejected due to a user change.",e.dc.forEach(e=>{e.forEach(e=>{e.reject(new O(P.CANCELLED,r))})}),e.dc.clear(),e.sharedClientState.handleUserChange(t,n.removedBatchIds,n.addedBatchIds),await oL(e,n.qo)}}function oP(e,t){let r=e.Ic.get(t);if(r&&r.lc)return t6().add(r.key);{let r=t6(),n=e.Tc.get(t);if(!n)return r;for(let t of n??[]){let n=e.hc.get(t);r=r.unionWith(n.view.Yu)}return r}}function oO(e){return e.remoteStore.remoteSyncer.applyRemoteEvent=oS.bind(null,e),e.remoteStore.remoteSyncer.getRemoteKeysForTarget=oP.bind(null,e),e.remoteStore.remoteSyncer.rejectListen=oC.bind(null,e),e.Ec.hn=ol.bind(null,e.eventManager),e.Ec.yc=oc.bind(null,e.eventManager),e}class oU{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(e){this.serializer=rP(e.databaseInfo.databaseId),this.sharedClientState=this.Sc(e),this.persistence=this.vc(e),await this.persistence.start(),this.localStore=this.Dc(e),this.gcScheduler=this.xc(e,this.localStore),this.indexBackfillerScheduler=this.Cc(e,this.localStore)}xc(e,t){return null}Cc(e,t){return null}Dc(e){var t;return t=this.persistence,new aL(t,new aD,e.initialUser,this.serializer)}vc(e){return new ab(aS.w_,this.serializer)}Sc(e){return new a7}async terminate(){this.gcScheduler?.stop(),this.indexBackfillerScheduler?.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}}oU.provider={build:()=>new oU};class oM extends oU{constructor(e){super(),this.cacheSizeBytes=e}xc(e,t){return b(this.persistence.referenceDelegate instanceof aI,46915),new ng(this.persistence.referenceDelegate.garbageCollector,e.asyncQueue,t)}vc(e){let t=void 0!==this.cacheSizeBytes?no.withCacheSize(this.cacheSizeBytes):no.DEFAULT;return new ab(e=>aI.w_(e,t),this.serializer)}}class oF{async initialize(e,t){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(t),this.remoteStore=this.createRemoteStore(t),this.eventManager=this.createEventManager(t),this.syncEngine=this.createSyncEngine(t,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=e=>oI(this.syncEngine,e,1),this.remoteStore.remoteSyncer.handleCredentialChange=oR.bind(null,this.syncEngine),await a3(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return new oi}createDatastore(e){let t=rP(e.databaseInfo.databaseId),r=new r8(e.databaseInfo);return new ns(e.authCredentials,e.appCheckCredentials,r,t)}createRemoteStore(e){var t;return t=this.localStore,new aq(t,this.datastore,e.asyncQueue,e=>oI(this.syncEngine,e,0),rZ.Je()?new rZ:new rJ)}createSyncEngine(e,t){return function(e,t,r,n,s,i,a){let o=new ov(e,t,r,n,s,i);return a&&(o.mc=!0),o}(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,t)}async terminate(){await async function(e){w(aF,"RemoteStore shutting down."),e.ca.add(5),await aB(e),e.Ea.shutdown(),e.ha.set("Unknown")}(this.remoteStore),this.datastore?.terminate(),this.eventManager?.terminate()}}oF.provider={build:()=>new oF};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let oq="FirestoreClient";class o${constructor(e,t,r,n,s){this.authCredentials=e,this.appCheckCredentials=t,this.asyncQueue=r,this._databaseInfo=n,this.user=rq.UNAUTHENTICATED,this.clientId=N.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=s,this.authCredentials.start(r,async e=>{w(oq,"Received user=",e.uid),await this.authCredentialListener(e),this.user=e}),this.appCheckCredentials.start(r,e=>(w(oq,"Received new app check token=",e),this.appCheckCredentialListener(e,this.user)))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this._databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}terminate(){this.asyncQueue.enterRestrictedMode();let e=new r$;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted(async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(r){let t=a5(r,"Failed to shutdown persistence");e.reject(t)}}),e.promise}}async function oB(e,t){e.asyncQueue.verifyOperationInProgress(),w(oq,"Initializing OfflineComponentProvider");let r=e.configuration;await t.initialize(r);let n=r.initialUser;e.setCredentialChangeListener(async e=>{n.isEqual(e)||(await aR(t.localStore,e),n=e)}),t.persistence.setDatabaseDeletedListener(()=>e.terminate()),e._offlineComponents=t}async function oz(e,t){e.asyncQueue.verifyOperationInProgress();let r=await oj(e);w(oq,"Initializing OnlineComponentProvider"),await t.initialize(r,e.configuration),e.setCredentialChangeListener(e=>a2(t.remoteStore,e)),e.setAppCheckTokenChangeListener((e,r)=>a2(t.remoteStore,r)),e._onlineComponents=t}async function oj(e){if(!e._offlineComponents){if(e._uninitializedComponentsProvider){w(oq,"Using user provided OfflineComponentProvider");try{await oB(e,e._uninitializedComponentsProvider._offline)}catch(t){if(!("FirebaseError"===t.name?t.code===P.FAILED_PRECONDITION||t.code===P.UNIMPLEMENTED:!("undefined"!=typeof DOMException&&t instanceof DOMException)||22===t.code||20===t.code||11===t.code))throw t;_("Error using user provided cache. Falling back to memory cache: "+t),await oB(e,new oU)}}else w(oq,"Using default OfflineComponentProvider"),await oB(e,new oM(void 0))}return e._offlineComponents}async function oG(e){return e._onlineComponents||(e._uninitializedComponentsProvider?(w(oq,"Using user provided OnlineComponentProvider"),await oz(e,e._uninitializedComponentsProvider._online)):(w(oq,"Using default OnlineComponentProvider"),await oz(e,new oF))),e._onlineComponents}async function oK(e){let t=await oG(e),r=t.eventManager;return r.onListen=o_.bind(null,t.syncEngine),r.onUnlisten=ob.bind(null,t.syncEngine),r.onFirstRemoteStoreListen=oE.bind(null,t.syncEngine),r.onLastRemoteStoreUnlisten=oN.bind(null,t.syncEngine),r}function oQ(e,t,r={}){let n=new r$;return e.asyncQueue.enqueueAndForget(async()=>(function(e,t,r,n,s){let i=new a6({next:r=>{i.Aa(),t.enqueueAndForget(()=>ou(e,a)),r.fromCache&&"server"===n.source?s.reject(new O(P.UNAVAILABLE,'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')):s.resolve(r)},error:e=>s.reject(e)}),a=new od(r instanceof sv?function(e,t){let r=function(e){let t=!1,r=[];for(let n of e)if(n instanceof sg){if(t=!0,n.orderings.some(e=>e.expr instanceof n3&&e.expr.fieldName===U))r.push(n);else{let e=n.orderings.map(e=>e);e.push(n4(U).ascending()),r.push(new sg(e,{}))}}else n instanceof sm&&(t||(r.push(new sg([n4(U).ascending()],{})),t=!0)),r.push(n);return t||r.push(new sg([n4(U).ascending()],{})),r}(e.stages);if(e.userDataReader){let t=e.userDataReader.createContext(3,"toCorePipeline");r.forEach(e=>e._readUserData(t))}return new s_(e.userDataReader.serializer,r,void 0)}(r):r,i,{includeMetadataChanges:!0,waitForSyncWhenOnline:!0});return oo(e,a)})(await oK(e),e.asyncQueue,t,r,n)),n.promise}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let oW=class{constructor(e,t,r,n,s){this._firestore=e,this._userDataWriter=t,this._key=r,this._document=n,this._converter=s}get id(){return this._key.path.lastSegment()}get ref(){return new nT(this._firestore,this._converter,this._key)}exists(){return null!==this._document}data(){if(this._document){if(this._converter){let e=new oH(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}_fieldsProto(){return this._document?.data.clone().value.mapValue.fields??void 0}get(e){if(this._document){let t=this._document.data.field(nB("DocumentSnapshot.get",e));if(null!==t)return this._userDataWriter.convertValue(t)}}},oH=class extends oW{data(){return super.data()}};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class oY{convertValue(e,t="none"){switch(eI(e)){case 0:return null;case 1:return e.booleanValue;case 2:return ei(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,t);case 5:return e.stringValue;case 6:return this.convertBytes(ea(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,t);case 11:return this.convertObject(e.mapValue,t);case 10:return this.convertVectorValue(e.mapValue);default:throw T(62114,{value:e})}}convertObject(e,t){return this.convertObjectMap(e.fields,t)}convertObjectMap(e,t="none"){let r={};return j(e,(e,n)=>{r[e]=this.convertValue(n,t)}),r}convertVectorValue(e){return new nN(e.fields?.[ex].arrayValue?.values?.map(e=>ei(e.doubleValue)))}convertGeoPoint(e){return new rF(ei(e.latitude),ei(e.longitude))}convertArray(e,t){return(e.values||[]).map(e=>this.convertValue(e,t))}convertServerTimestamp(e,t){switch(t){case"previous":let r=ed(e);return null==r?null:this.convertValue(r,t);case"estimate":return this.convertTimestamp(em(e));default:return null}}convertTimestamp(e){let t=es(e);return new ee(t.seconds,t.nanos)}convertDocumentKey(e,t){let r=F.fromString(e);b(rD(r),9688,{name:e});let n=new eg(r.get(1),r.get(3)),s=new K(r.popFirst(5));return n.isEqual(t)||v(`A document reference to ${s} refers to a different database (${n.projectId}/${n.database}), which is not supported. It will be treated as a reference in the current database (${t.projectId}/${t.database}) instead.`),s}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function oJ(e,t,r){return e?r&&(r.merge||r.mergeFields)?e.toFirestore(t,r):e.toFirestore(t):t}class oX extends oY{constructor(e){super(),this.firestore=e}convertBytes(e){return new rO(e)}convertReference(e){let t=this.convertDocumentKey(e,this.firestore._databaseId);return new nT(this.firestore,null,t)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let oZ="AsyncQueue";class o0{constructor(e=Promise.resolve()){this.qc=[],this.$c=!1,this.Kc=[],this.Qc=null,this.Wc=!1,this.Gc=!1,this.zc=[],this.jt=new r7(this,"async_queue_retry"),this.jc=()=>{let e=oe();e&&w(oZ,"Visibility state changed to "+e.visibilityState),this.jt.qt()},this.Hc=e;let t=oe();t&&"function"==typeof t.addEventListener&&t.addEventListener("visibilitychange",this.jc)}get isShuttingDown(){return this.$c}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.Jc(),this.Yc(e)}enterRestrictedMode(e){if(!this.$c){this.$c=!0,this.Gc=e||!1;let t=oe();t&&"function"==typeof t.removeEventListener&&t.removeEventListener("visibilitychange",this.jc)}}enqueue(e){if(this.Jc(),this.$c)return new Promise(()=>{});let t=new r$;return this.Yc(()=>this.$c&&this.Gc?Promise.resolve():(e().then(t.resolve,t.reject),t.promise)).then(()=>t.promise)}enqueueRetryable(e){this.enqueueAndForget(()=>(this.qc.push(e),this.Zc()))}async Zc(){if(0!==this.qc.length){try{await this.qc[0](),this.qc.shift(),this.jt.reset()}catch(e){if(!nd(e))throw e;w(oZ,"Operation failed with retryable error: "+e)}this.qc.length>0&&this.jt.Ut(()=>this.Zc())}}Yc(e){let t=this.Hc.then(()=>(this.Wc=!0,e().catch(e=>{throw this.Qc=e,this.Wc=!1,v("INTERNAL UNHANDLED ERROR: ",o1(e)),e}).then(e=>(this.Wc=!1,e))));return this.Hc=t,t}enqueueAfterDelay(e,t,r){this.Jc(),this.zc.indexOf(e)>-1&&(t=0);let n=a9.createAndSchedule(this,e,t,r,e=>this.Xc(e));return this.Kc.push(n),n}Jc(){this.Qc&&T(47125,{el:o1(this.Qc)})}verifyOperationInProgress(){}async tl(){let e;do e=this.Hc,await e;while(e!==this.Hc)}nl(e){for(let t of this.Kc)if(t.timerId===e)return!0;return!1}rl(e){return this.tl().then(()=>{for(let t of(this.Kc.sort((e,t)=>e.targetTimeMs-t.targetTimeMs),this.Kc))if(t.skipDelay(),"all"!==e&&t.timerId===e)break;return this.tl()})}il(e){this.zc.push(e)}Xc(e){let t=this.Kc.indexOf(e);this.Kc.splice(t,1)}}function o1(e){let t=e.message||"";return e.stack&&(t=e.stack.includes(e.message)?e.stack:e.message+"\n"+e.stack),t}class o2 extends n_{constructor(e,t,r,n){super(e,t,r,n),this.type="firestore",this._queue=new o0,this._persistenceKey=n?.name||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){let e=this._firestoreClient.terminate();this._queue=new o0(e),this._firestoreClient=void 0,await e}}}function o3(e,t){let r="object"==typeof e?e:(0,o.Mq)(),n=(0,o.qX)(r,"firestore").getImmediate({identifier:"string"==typeof e?e:t||ep});if(!n._initialized){let e=(0,u.P0)("firestore");e&&function(e,t,r,n={}){e=Y(e,n_);let s=(0,u.Xx)(t),i=e._getSettings(),a={...i,emulatorOptions:e._getEmulatorOptions()},o=`${t}:${r}`;s&&(0,u.Uo)(`https://${o}`),i.host!==nw&&i.host!==o&&_("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used.");let l={...i,host:o,ssl:s,emulatorOptions:n};if(!(0,u.vZ)(l,a)&&(e._setSettings(l),n.mockUserToken)){let t,r;if("string"==typeof n.mockUserToken)t=n.mockUserToken,r=rq.MOCK_USER;else{t=(0,u.Sg)(n.mockUserToken,e._app?.options.projectId);let s=n.mockUserToken.sub||n.mockUserToken.user_id;if(!s)throw new O(P.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");r=new rq(s)}e._authCredentials=new rj(new rB(t,r))}}(n,...e)}return n}function o4(e){if(e._terminated)throw new O(P.FAILED_PRECONDITION,"The client has already been terminated.");return e._firestoreClient||function(e){var t,r,n,s;let i=e._freezeSettings(),a=(t=e._databaseId,r=e._app?.options.appId||"",n=e._persistenceKey,s=e._app?.options.apiKey,new ef(t,r,n,i.host,i.ssl,i.experimentalForceLongPolling,i.experimentalAutoDetectLongPolling,rY(i.experimentalLongPollingOptions),i.useFetchStreams,i.isUsingEmulator,s,i._customHeaders,i.grpcFlowControlWindow));e._componentsProvider||i.localCache?._offlineComponentProvider&&i.localCache?._onlineComponentProvider&&(e._componentsProvider={_offline:i.localCache._offlineComponentProvider,_online:i.localCache._onlineComponentProvider}),e._firestoreClient=new o$(e._authCredentials,e._appCheckCredentials,e._queue,a,e._componentsProvider&&function(e){let t=e?._online.build();return{_offline:e?._offline.build(t),_online:t}}(e._componentsProvider))}(e),e._firestoreClient}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class o6 extends oY{constructor(e){super(),this.firestore=e}convertBytes(e){return new rO(e)}convertReference(e){let t=this.convertDocumentKey(e,this.firestore._databaseId);return new nT(this.firestore,null,t)}}class o9{constructor(e,t){this.hasPendingWrites=e,this.fromCache=t}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}}class o5 extends oW{constructor(e,t,r,n,s,i){super(e,t,r,n,i),this._firestore=e,this._firestoreImpl=e,this.metadata=s}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){let t=new o8(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(t,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,t={}){if(this._document){let r=this._document.data.field(nB("DocumentSnapshot.get",e));if(null!==r)return this._userDataWriter.convertValue(r,t.serverTimestamps)}}toJSON(){if(this.metadata.hasPendingWrites)throw new O(P.FAILED_PRECONDITION,"DocumentSnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");let e=this._document,t={};return t.type=o5._jsonSchemaVersion,t.bundle="",t.bundleSource="DocumentSnapshot",t.bundleName=this._key.toString(),e&&e.isValidDocument()&&e.isFoundDocument()&&(this._userDataWriter.convertObjectMap(e.data.value.mapValue.fields,"previous"),t.bundle=(this._firestore,this.ref.path,"NOT SUPPORTED")),t}}o5._jsonSchemaVersion="firestore/documentSnapshot/1.0",o5._jsonSchema={type:X("string",o5._jsonSchemaVersion),bundleSource:X("string","DocumentSnapshot"),bundleName:X("string"),bundle:X("string")};class o8 extends o5{data(e={}){return super.data(e)}}class o7{constructor(e,t,r,n){this._firestore=e,this._userDataWriter=t,this._snapshot=n,this.metadata=new o9(n.hasPendingWrites,n.fromCache),this.query=r}get docs(){let e=[];return this.forEach(t=>e.push(t)),e}get size(){return this._snapshot.docs.size}get empty(){return 0===this.size}forEach(e,t){this._snapshot.docs.forEach(r=>{e.call(t,new o8(this._firestore,this._userDataWriter,r.key,r,new o9(this._snapshot.mutatedKeys.has(r.key),this._snapshot.fromCache),this.query.converter))})}docChanges(e={}){let t=!!e.includeMetadataChanges;if(t&&this._snapshot.excludesMetadataChanges)throw new O(P.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===t||(this._cachedChanges=function(e,t){if(e._snapshot.oldDocs.isEmpty()){let t=0;return e._snapshot.docChanges.map(r=>{i4(e._snapshot.query)?ac(e._snapshot.query):tY(e.query._query);let n=new o8(e._firestore,e._userDataWriter,r.doc.key,r.doc,new o9(e._snapshot.mutatedKeys.has(r.doc.key),e._snapshot.fromCache),e.query.converter);return r.doc,{type:"added",doc:n,oldIndex:-1,newIndex:t++}})}{let r=e._snapshot.oldDocs;return e._snapshot.docChanges.filter(e=>t||3!==e.type).map(t=>{let n=new o8(e._firestore,e._userDataWriter,t.doc.key,t.doc,new o9(e._snapshot.mutatedKeys.has(t.doc.key),e._snapshot.fromCache),e.query.converter),s=-1,i=-1;return 0!==t.type&&(s=r.indexOf(t.doc.key),r=r.delete(t.doc.key)),1!==t.type&&(i=(r=r.add(t.doc)).indexOf(t.doc.key)),{type:function(e){switch(e){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return T(61501,{type:e})}}(t.type),doc:n,oldIndex:s,newIndex:i}})}}(this,t),this._cachedChangesIncludeMetadataChanges=t),this._cachedChanges}toJSON(){if(this.metadata.hasPendingWrites)throw new O(P.FAILED_PRECONDITION,"QuerySnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");let e={};e.type=o7._jsonSchemaVersion,e.bundleSource="QuerySnapshot",e.bundleName=N.newId(),this._firestore._databaseId.database,this._firestore._databaseId.projectId;let t=[],r=[],n=[];return this.docs.forEach(e=>{null!==e._document&&(t.push(e._document),r.push(this._userDataWriter.convertObjectMap(e._document.data.value.mapValue.fields,"previous")),n.push(e.ref.path))}),e.bundle=(this._firestore,this.query._query,e.bundleName,"NOT SUPPORTED"),e}}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */o7._jsonSchemaVersion="firestore/querySnapshot/1.0",o7._jsonSchema={type:X("string",o7._jsonSchemaVersion),bundleSource:X("string","QuerySnapshot"),bundleName:X("string"),bundle:X("string")}}}]);