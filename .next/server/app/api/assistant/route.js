"use strict";(()=>{var e={};e.id=410,e.ids=[410],e.modules={20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},44880:(e,t,n)=>{n.r(t),n.d(t,{originalPathname:()=>el,patchFetch:()=>ed,requestAsyncStorage:()=>ea,routeModule:()=>ei,serverHooks:()=>ec,staticGenerationAsyncStorage:()=>er});var s,o,i,a,r,c,l,d,u,h,f,p,E={};n.r(E),n.d(E,{POST:()=>eo,dynamic:()=>en,runtime:()=>et});var g=n(49303),m=n(88716),C=n(60670),O=n(87070);(function(e){e.STRING="string",e.NUMBER="number",e.INTEGER="integer",e.BOOLEAN="boolean",e.ARRAY="array",e.OBJECT="object"})(s||(s={})),function(e){e.LANGUAGE_UNSPECIFIED="language_unspecified",e.PYTHON="python"}(o||(o={})),function(e){e.OUTCOME_UNSPECIFIED="outcome_unspecified",e.OUTCOME_OK="outcome_ok",e.OUTCOME_FAILED="outcome_failed",e.OUTCOME_DEADLINE_EXCEEDED="outcome_deadline_exceeded"}(i||(i={}));/**
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
 */let _=["user","model","function","system"];(function(e){e.HARM_CATEGORY_UNSPECIFIED="HARM_CATEGORY_UNSPECIFIED",e.HARM_CATEGORY_HATE_SPEECH="HARM_CATEGORY_HATE_SPEECH",e.HARM_CATEGORY_SEXUALLY_EXPLICIT="HARM_CATEGORY_SEXUALLY_EXPLICIT",e.HARM_CATEGORY_HARASSMENT="HARM_CATEGORY_HARASSMENT",e.HARM_CATEGORY_DANGEROUS_CONTENT="HARM_CATEGORY_DANGEROUS_CONTENT",e.HARM_CATEGORY_CIVIC_INTEGRITY="HARM_CATEGORY_CIVIC_INTEGRITY"})(a||(a={})),function(e){e.HARM_BLOCK_THRESHOLD_UNSPECIFIED="HARM_BLOCK_THRESHOLD_UNSPECIFIED",e.BLOCK_LOW_AND_ABOVE="BLOCK_LOW_AND_ABOVE",e.BLOCK_MEDIUM_AND_ABOVE="BLOCK_MEDIUM_AND_ABOVE",e.BLOCK_ONLY_HIGH="BLOCK_ONLY_HIGH",e.BLOCK_NONE="BLOCK_NONE"}(r||(r={})),function(e){e.HARM_PROBABILITY_UNSPECIFIED="HARM_PROBABILITY_UNSPECIFIED",e.NEGLIGIBLE="NEGLIGIBLE",e.LOW="LOW",e.MEDIUM="MEDIUM",e.HIGH="HIGH"}(c||(c={})),function(e){e.BLOCKED_REASON_UNSPECIFIED="BLOCKED_REASON_UNSPECIFIED",e.SAFETY="SAFETY",e.OTHER="OTHER"}(l||(l={})),function(e){e.FINISH_REASON_UNSPECIFIED="FINISH_REASON_UNSPECIFIED",e.STOP="STOP",e.MAX_TOKENS="MAX_TOKENS",e.SAFETY="SAFETY",e.RECITATION="RECITATION",e.LANGUAGE="LANGUAGE",e.BLOCKLIST="BLOCKLIST",e.PROHIBITED_CONTENT="PROHIBITED_CONTENT",e.SPII="SPII",e.MALFORMED_FUNCTION_CALL="MALFORMED_FUNCTION_CALL",e.OTHER="OTHER"}(d||(d={})),function(e){e.TASK_TYPE_UNSPECIFIED="TASK_TYPE_UNSPECIFIED",e.RETRIEVAL_QUERY="RETRIEVAL_QUERY",e.RETRIEVAL_DOCUMENT="RETRIEVAL_DOCUMENT",e.SEMANTIC_SIMILARITY="SEMANTIC_SIMILARITY",e.CLASSIFICATION="CLASSIFICATION",e.CLUSTERING="CLUSTERING"}(u||(u={})),function(e){e.MODE_UNSPECIFIED="MODE_UNSPECIFIED",e.AUTO="AUTO",e.ANY="ANY",e.NONE="NONE"}(h||(h={})),function(e){e.MODE_UNSPECIFIED="MODE_UNSPECIFIED",e.MODE_DYNAMIC="MODE_DYNAMIC"}(f||(f={}));/**
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
 */class T extends Error{constructor(e){super(`[GoogleGenerativeAI Error]: ${e}`)}}class y extends T{constructor(e,t){super(e),this.response=t}}class A extends T{constructor(e,t,n,s){super(e),this.status=t,this.statusText=n,this.errorDetails=s}}class I extends T{}class N extends T{}!function(e){e.GENERATE_CONTENT="generateContent",e.STREAM_GENERATE_CONTENT="streamGenerateContent",e.COUNT_TOKENS="countTokens",e.EMBED_CONTENT="embedContent",e.BATCH_EMBED_CONTENTS="batchEmbedContents"}(p||(p={}));class R{constructor(e,t,n,s,o){this.model=e,this.task=t,this.apiKey=n,this.stream=s,this.requestOptions=o}toString(){var e,t;let n=(null===(e=this.requestOptions)||void 0===e?void 0:e.apiVersion)||"v1beta",s=(null===(t=this.requestOptions)||void 0===t?void 0:t.baseUrl)||"https://generativelanguage.googleapis.com",o=`${s}/${n}/${this.model}:${this.task}`;return this.stream&&(o+="?alt=sse"),o}}async function v(e){var t;let n=new Headers;n.append("Content-Type","application/json"),n.append("x-goog-api-client",function(e){let t=[];return(null==e?void 0:e.apiClient)&&t.push(e.apiClient),t.push("genai-js/0.24.1"),t.join(" ")}(e.requestOptions)),n.append("x-goog-api-key",e.apiKey);let s=null===(t=e.requestOptions)||void 0===t?void 0:t.customHeaders;if(s){if(!(s instanceof Headers))try{s=new Headers(s)}catch(e){throw new I(`unable to convert customHeaders value ${JSON.stringify(s)} to Headers: ${e.message}`)}for(let[e,t]of s.entries()){if("x-goog-api-key"===e)throw new I(`Cannot set reserved header name ${e}`);if("x-goog-api-client"===e)throw new I(`Header name ${e} can only be set using the apiClient field`);n.append(e,t)}}return n}async function S(e,t,n,s,o,i){let a=new R(e,t,n,s,i);return{url:a.toString(),fetchOptions:Object.assign(Object.assign({},function(e){let t={};if((null==e?void 0:e.signal)!==void 0||(null==e?void 0:e.timeout)>=0){let n=new AbortController;(null==e?void 0:e.timeout)>=0&&setTimeout(()=>n.abort(),e.timeout),(null==e?void 0:e.signal)&&e.signal.addEventListener("abort",()=>{n.abort()}),t.signal=n.signal}return t}(i)),{method:"POST",headers:await v(a),body:o})}}async function w(e,t,n,s,o,i={},a=fetch){let{url:r,fetchOptions:c}=await S(e,t,n,s,o,i);return M(r,c,a)}async function M(e,t,n=fetch){let s;try{s=await n(e,t)}catch(t){(function(e,t){let n=e;throw"AbortError"===n.name?(n=new N(`Request aborted when fetching ${t.toString()}: ${e.message}`)).stack=e.stack:e instanceof A||e instanceof I||((n=new T(`Error fetching from ${t.toString()}: ${e.message}`)).stack=e.stack),n})(t,e)}return s.ok||await b(s,e),s}async function b(e,t){let n,s="";try{let t=await e.json();s=t.error.message,t.error.details&&(s+=` ${JSON.stringify(t.error.details)}`,n=t.error.details)}catch(e){}throw new A(`Error fetching from ${t.toString()}: [${e.status} ${e.statusText}] ${s}`,e.status,e.statusText,n)}/**
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
 */function x(e){return e.text=()=>{if(e.candidates&&e.candidates.length>0){if(e.candidates.length>1&&console.warn(`This response had ${e.candidates.length} candidates. Returning text from the first candidate only. Access response.candidates directly to use the other candidates.`),j(e.candidates[0]))throw new y(`${P(e)}`,e);return function(e){var t,n,s,o;let i=[];if(null===(n=null===(t=e.candidates)||void 0===t?void 0:t[0].content)||void 0===n?void 0:n.parts)for(let t of null===(o=null===(s=e.candidates)||void 0===s?void 0:s[0].content)||void 0===o?void 0:o.parts)t.text&&i.push(t.text),t.executableCode&&i.push("\n```"+t.executableCode.language+"\n"+t.executableCode.code+"\n```\n"),t.codeExecutionResult&&i.push("\n```\n"+t.codeExecutionResult.output+"\n```\n");return i.length>0?i.join(""):""}(e)}if(e.promptFeedback)throw new y(`Text not available. ${P(e)}`,e);return""},e.functionCall=()=>{if(e.candidates&&e.candidates.length>0){if(e.candidates.length>1&&console.warn(`This response had ${e.candidates.length} candidates. Returning function calls from the first candidate only. Access response.candidates directly to use the other candidates.`),j(e.candidates[0]))throw new y(`${P(e)}`,e);return console.warn("response.functionCall() is deprecated. Use response.functionCalls() instead."),D(e)[0]}if(e.promptFeedback)throw new y(`Function call not available. ${P(e)}`,e)},e.functionCalls=()=>{if(e.candidates&&e.candidates.length>0){if(e.candidates.length>1&&console.warn(`This response had ${e.candidates.length} candidates. Returning function calls from the first candidate only. Access response.candidates directly to use the other candidates.`),j(e.candidates[0]))throw new y(`${P(e)}`,e);return D(e)}if(e.promptFeedback)throw new y(`Function call not available. ${P(e)}`,e)},e}function D(e){var t,n,s,o;let i=[];if(null===(n=null===(t=e.candidates)||void 0===t?void 0:t[0].content)||void 0===n?void 0:n.parts)for(let t of null===(o=null===(s=e.candidates)||void 0===s?void 0:s[0].content)||void 0===o?void 0:o.parts)t.functionCall&&i.push(t.functionCall);return i.length>0?i:void 0}let L=[d.RECITATION,d.SAFETY,d.LANGUAGE];function j(e){return!!e.finishReason&&L.includes(e.finishReason)}function P(e){var t,n,s;let o="";if((!e.candidates||0===e.candidates.length)&&e.promptFeedback)o+="Response was blocked",(null===(t=e.promptFeedback)||void 0===t?void 0:t.blockReason)&&(o+=` due to ${e.promptFeedback.blockReason}`),(null===(n=e.promptFeedback)||void 0===n?void 0:n.blockReasonMessage)&&(o+=`: ${e.promptFeedback.blockReasonMessage}`);else if(null===(s=e.candidates)||void 0===s?void 0:s[0]){let t=e.candidates[0];j(t)&&(o+=`Candidate was blocked due to ${t.finishReason}`,t.finishMessage&&(o+=`: ${t.finishMessage}`))}return o}function U(e){return this instanceof U?(this.v=e,this):new U(e)}"function"==typeof SuppressedError&&SuppressedError;/**
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
 */let G=/^data\: (.*)(?:\n\n|\r\r|\r\n\r\n)/;async function H(e){let t=[],n=e.getReader();for(;;){let{done:e,value:s}=await n.read();if(e)return x(function(e){let t=e[e.length-1],n={promptFeedback:null==t?void 0:t.promptFeedback};for(let t of e){if(t.candidates){let e=0;for(let s of t.candidates)if(n.candidates||(n.candidates=[]),n.candidates[e]||(n.candidates[e]={index:e}),n.candidates[e].citationMetadata=s.citationMetadata,n.candidates[e].groundingMetadata=s.groundingMetadata,n.candidates[e].finishReason=s.finishReason,n.candidates[e].finishMessage=s.finishMessage,n.candidates[e].safetyRatings=s.safetyRatings,s.content&&s.content.parts){n.candidates[e].content||(n.candidates[e].content={role:s.content.role||"user",parts:[]});let t={};for(let o of s.content.parts)o.text&&(t.text=o.text),o.functionCall&&(t.functionCall=o.functionCall),o.executableCode&&(t.executableCode=o.executableCode),o.codeExecutionResult&&(t.codeExecutionResult=o.codeExecutionResult),0===Object.keys(t).length&&(t.text=""),n.candidates[e].content.parts.push(t)}e++}t.usageMetadata&&(n.usageMetadata=t.usageMetadata)}return n}(t));t.push(s)}}/**
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
 */async function F(e,t,n,s){return function(e){let[t,n]=(function(e){let t=e.getReader();return new ReadableStream({start(e){let n="";return function s(){return t.read().then(({value:t,done:o})=>{let i;if(o){if(n.trim()){e.error(new T("Failed to parse stream"));return}e.close();return}let a=(n+=t).match(G);for(;a;){try{i=JSON.parse(a[1])}catch(t){e.error(new T(`Error parsing JSON response: "${a[1]}"`));return}e.enqueue(i),a=(n=n.substring(a[0].length)).match(G)}return s()}).catch(e=>{let t=e;throw t.stack=e.stack,t="AbortError"===t.name?new N("Request aborted when reading from the stream"):new T("Error reading from the stream")})}()}})})(e.body.pipeThrough(new TextDecoderStream("utf8",{fatal:!0}))).tee();return{stream:function(e){return function(e,t,n){if(!Symbol.asyncIterator)throw TypeError("Symbol.asyncIterator is not defined.");var s,o=n.apply(e,t||[]),i=[];return s={},a("next"),a("throw"),a("return"),s[Symbol.asyncIterator]=function(){return this},s;function a(e){o[e]&&(s[e]=function(t){return new Promise(function(n,s){i.push([e,t,n,s])>1||r(e,t)})})}function r(e,t){try{var n;(n=o[e](t)).value instanceof U?Promise.resolve(n.value.v).then(c,l):d(i[0][2],n)}catch(e){d(i[0][3],e)}}function c(e){r("next",e)}function l(e){r("throw",e)}function d(e,t){e(t),i.shift(),i.length&&r(i[0][0],i[0][1])}}(this,arguments,function*(){let t=e.getReader();for(;;){let{value:e,done:n}=yield U(t.read());if(n)break;yield yield U(x(e))}})}(t),response:H(n)}}(await w(t,p.STREAM_GENERATE_CONTENT,e,!0,JSON.stringify(n),s))}async function $(e,t,n,s){let o=await w(t,p.GENERATE_CONTENT,e,!1,JSON.stringify(n),s);return{response:x(await o.json())}}/**
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
 */function Y(e){if(null!=e){if("string"==typeof e)return{role:"system",parts:[{text:e}]};if(e.text)return{role:"system",parts:[e]};if(e.parts)return e.role?e:{role:"system",parts:e.parts}}}function B(e){let t=[];if("string"==typeof e)t=[{text:e}];else for(let n of e)"string"==typeof n?t.push({text:n}):t.push(n);return function(e){let t={role:"user",parts:[]},n={role:"function",parts:[]},s=!1,o=!1;for(let i of e)"functionResponse"in i?(n.parts.push(i),o=!0):(t.parts.push(i),s=!0);if(s&&o)throw new T("Within a single message, FunctionResponse cannot be mixed with other type of part in the request for sending chat message.");if(!s&&!o)throw new T("No content is provided for sending chat message.");return s?t:n}(t)}function K(e){let t;return t=e.contents?e:{contents:[B(e)]},e.systemInstruction&&(t.systemInstruction=Y(e.systemInstruction)),t}/**
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
 */let q=["text","inlineData","functionCall","functionResponse","executableCode","codeExecutionResult"],k={user:["text","inlineData"],function:["functionResponse"],model:["text","functionCall","executableCode","codeExecutionResult"],system:["text"]};function V(e){var t;if(void 0===e.candidates||0===e.candidates.length)return!1;let n=null===(t=e.candidates[0])||void 0===t?void 0:t.content;if(void 0===n||void 0===n.parts||0===n.parts.length)return!1;for(let e of n.parts)if(void 0===e||0===Object.keys(e).length||void 0!==e.text&&""===e.text)return!1;return!0}/**
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
 */let J="SILENT_ERROR";class X{constructor(e,t,n,s={}){this.model=t,this.params=n,this._requestOptions=s,this._history=[],this._sendPromise=Promise.resolve(),this._apiKey=e,(null==n?void 0:n.history)&&(function(e){let t=!1;for(let n of e){let{role:e,parts:s}=n;if(!t&&"user"!==e)throw new T(`First content should be with role 'user', got ${e}`);if(!_.includes(e))throw new T(`Each item should include role field. Got ${e} but valid roles are: ${JSON.stringify(_)}`);if(!Array.isArray(s))throw new T("Content should have 'parts' property with an array of Parts");if(0===s.length)throw new T("Each Content should have at least one part");let o={text:0,inlineData:0,functionCall:0,functionResponse:0,fileData:0,executableCode:0,codeExecutionResult:0};for(let e of s)for(let t of q)t in e&&(o[t]+=1);let i=k[e];for(let t of q)if(!i.includes(t)&&o[t]>0)throw new T(`Content with role '${e}' can't contain '${t}' part`);t=!0}}(n.history),this._history=n.history)}async getHistory(){return await this._sendPromise,this._history}async sendMessage(e,t={}){var n,s,o,i,a,r;let c;await this._sendPromise;let l=B(e),d={safetySettings:null===(n=this.params)||void 0===n?void 0:n.safetySettings,generationConfig:null===(s=this.params)||void 0===s?void 0:s.generationConfig,tools:null===(o=this.params)||void 0===o?void 0:o.tools,toolConfig:null===(i=this.params)||void 0===i?void 0:i.toolConfig,systemInstruction:null===(a=this.params)||void 0===a?void 0:a.systemInstruction,cachedContent:null===(r=this.params)||void 0===r?void 0:r.cachedContent,contents:[...this._history,l]},u=Object.assign(Object.assign({},this._requestOptions),t);return this._sendPromise=this._sendPromise.then(()=>$(this._apiKey,this.model,d,u)).then(e=>{var t;if(V(e.response)){this._history.push(l);let n=Object.assign({parts:[],role:"model"},null===(t=e.response.candidates)||void 0===t?void 0:t[0].content);this._history.push(n)}else{let t=P(e.response);t&&console.warn(`sendMessage() was unsuccessful. ${t}. Inspect response object for details.`)}c=e}).catch(e=>{throw this._sendPromise=Promise.resolve(),e}),await this._sendPromise,c}async sendMessageStream(e,t={}){var n,s,o,i,a,r;await this._sendPromise;let c=B(e),l={safetySettings:null===(n=this.params)||void 0===n?void 0:n.safetySettings,generationConfig:null===(s=this.params)||void 0===s?void 0:s.generationConfig,tools:null===(o=this.params)||void 0===o?void 0:o.tools,toolConfig:null===(i=this.params)||void 0===i?void 0:i.toolConfig,systemInstruction:null===(a=this.params)||void 0===a?void 0:a.systemInstruction,cachedContent:null===(r=this.params)||void 0===r?void 0:r.cachedContent,contents:[...this._history,c]},d=Object.assign(Object.assign({},this._requestOptions),t),u=F(this._apiKey,this.model,l,d);return this._sendPromise=this._sendPromise.then(()=>u).catch(e=>{throw Error(J)}).then(e=>e.response).then(e=>{if(V(e)){this._history.push(c);let t=Object.assign({},e.candidates[0].content);t.role||(t.role="model"),this._history.push(t)}else{let t=P(e);t&&console.warn(`sendMessageStream() was unsuccessful. ${t}. Inspect response object for details.`)}}).catch(e=>{e.message!==J&&console.error(e)}),u}}/**
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
 */async function W(e,t,n,s){return(await w(t,p.COUNT_TOKENS,e,!1,JSON.stringify(n),s)).json()}/**
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
 */async function Q(e,t,n,s){return(await w(t,p.EMBED_CONTENT,e,!1,JSON.stringify(n),s)).json()}async function z(e,t,n,s){let o=n.requests.map(e=>Object.assign(Object.assign({},e),{model:t}));return(await w(t,p.BATCH_EMBED_CONTENTS,e,!1,JSON.stringify({requests:o}),s)).json()}/**
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
 */class Z{constructor(e,t,n={}){this.apiKey=e,this._requestOptions=n,t.model.includes("/")?this.model=t.model:this.model=`models/${t.model}`,this.generationConfig=t.generationConfig||{},this.safetySettings=t.safetySettings||[],this.tools=t.tools,this.toolConfig=t.toolConfig,this.systemInstruction=Y(t.systemInstruction),this.cachedContent=t.cachedContent}async generateContent(e,t={}){var n;let s=K(e),o=Object.assign(Object.assign({},this._requestOptions),t);return $(this.apiKey,this.model,Object.assign({generationConfig:this.generationConfig,safetySettings:this.safetySettings,tools:this.tools,toolConfig:this.toolConfig,systemInstruction:this.systemInstruction,cachedContent:null===(n=this.cachedContent)||void 0===n?void 0:n.name},s),o)}async generateContentStream(e,t={}){var n;let s=K(e),o=Object.assign(Object.assign({},this._requestOptions),t);return F(this.apiKey,this.model,Object.assign({generationConfig:this.generationConfig,safetySettings:this.safetySettings,tools:this.tools,toolConfig:this.toolConfig,systemInstruction:this.systemInstruction,cachedContent:null===(n=this.cachedContent)||void 0===n?void 0:n.name},s),o)}startChat(e){var t;return new X(this.apiKey,this.model,Object.assign({generationConfig:this.generationConfig,safetySettings:this.safetySettings,tools:this.tools,toolConfig:this.toolConfig,systemInstruction:this.systemInstruction,cachedContent:null===(t=this.cachedContent)||void 0===t?void 0:t.name},e),this._requestOptions)}async countTokens(e,t={}){let n=function(e,t){var n;let s={model:null==t?void 0:t.model,generationConfig:null==t?void 0:t.generationConfig,safetySettings:null==t?void 0:t.safetySettings,tools:null==t?void 0:t.tools,toolConfig:null==t?void 0:t.toolConfig,systemInstruction:null==t?void 0:t.systemInstruction,cachedContent:null===(n=null==t?void 0:t.cachedContent)||void 0===n?void 0:n.name,contents:[]},o=null!=e.generateContentRequest;if(e.contents){if(o)throw new I("CountTokensRequest must have one of contents or generateContentRequest, not both.");s.contents=e.contents}else if(o)s=Object.assign(Object.assign({},s),e.generateContentRequest);else{let t=B(e);s.contents=[t]}return{generateContentRequest:s}}(e,{model:this.model,generationConfig:this.generationConfig,safetySettings:this.safetySettings,tools:this.tools,toolConfig:this.toolConfig,systemInstruction:this.systemInstruction,cachedContent:this.cachedContent}),s=Object.assign(Object.assign({},this._requestOptions),t);return W(this.apiKey,this.model,n,s)}async embedContent(e,t={}){let n="string"==typeof e||Array.isArray(e)?{content:B(e)}:e,s=Object.assign(Object.assign({},this._requestOptions),t);return Q(this.apiKey,this.model,n,s)}async batchEmbedContents(e,t={}){let n=Object.assign(Object.assign({},this._requestOptions),t);return z(this.apiKey,this.model,e,n)}}/**
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
 */class ee{constructor(e){this.apiKey=e}getGenerativeModel(e,t){if(!e.model)throw new T("Must provide a model name. Example: genai.getGenerativeModel({ model: 'my-model-name' })");return new Z(this.apiKey,e,t)}getGenerativeModelFromCachedContent(e,t,n){if(!e.name)throw new I("Cached content must contain a `name` field.");if(!e.model)throw new I("Cached content must contain a `model` field.");for(let n of["model","systemInstruction"])if((null==t?void 0:t[n])&&e[n]&&(null==t?void 0:t[n])!==e[n]){if("model"===n&&(t.model.startsWith("models/")?t.model.replace("models/",""):t.model)===(e.model.startsWith("models/")?e.model.replace("models/",""):e.model))continue;throw new I(`Different value for "${n}" specified in modelParams (${t[n]}) and cachedContent (${e[n]})`)}let s=Object.assign(Object.assign({},t),{model:e.model,tools:e.tools,toolConfig:e.toolConfig,systemInstruction:e.systemInstruction,cachedContent:e});return new Z(this.apiKey,s,n)}}let et="nodejs",en="force-dynamic",es=[{category:a.HARM_CATEGORY_HARASSMENT,threshold:r.BLOCK_NONE},{category:a.HARM_CATEGORY_HATE_SPEECH,threshold:r.BLOCK_NONE},{category:a.HARM_CATEGORY_SEXUALLY_EXPLICIT,threshold:r.BLOCK_NONE},{category:a.HARM_CATEGORY_DANGEROUS_CONTENT,threshold:r.BLOCK_NONE}];async function eo(e){let t=process.env.GEMINI_API_KEY;if(!t)return O.NextResponse.json({success:!1,error:"Asistente no configurado"},{status:503});let n="",s="",o="";try{let t=await e.json(),i="string"==typeof t?.prompt?t.prompt:t?.message;n="string"==typeof i?i.trim():"",s="string"==typeof t?.menuContext?t.menuContext.trim().slice(0,1500):"",o="string"==typeof t?.cartContext?t.cartContext.trim().slice(0,700):""}catch{return O.NextResponse.json({success:!1,error:"Solicitud inv\xe1lida"},{status:400})}if(!n)return O.NextResponse.json({success:!1,error:"Mensaje vac\xedo"},{status:400});n=n.slice(0,500);try{let e=new ee(t).getGenerativeModel({model:process.env.GEMINI_MODEL||"gemini-3.6-flash",systemInstruction:"Eres Mercedes, la vendedora estrella del ecosistema D'una en Cabimas. Tu \xfanico objetivo es guiar al usuario a comprar de forma r\xe1pida, persuasiva y sin fricciones.\nREGLAS DE VENTA:\n1. S\xe9 extremadamente breve, c\xe1lida y carism\xe1tica (m\xe1ximo 2 oraciones).\n2. Usa cierres de micro-compromiso: termina siempre con una pregunta que invite a la acci\xf3n (ej. '\xbfTe lo agrego al carrito?', '\xbfPasamos a pagar?').\n3. Si te piden sugerencias, recomienda los productos con entusiasmo.\n4. MANEJO DE OBJECIONES: Si el cliente hace preguntas m\xe9dicas (ej. dolores de est\xf3mago) o temas fuera de contexto, NUNCA te niegues de forma rob\xf3tica. Usa el humor comercial para redirigir. (Ejemplo: '\xa1Uy, no soy doctora, pero te aseguro que algo rico de nuestro men\xfa te alegrar\xe1 el alma! \xbfQu\xe9 te provoca hoy?').\n5. MODO SILENCIOSO: Si el usuario expresa frustraci\xf3n, te pide que te calles, que lo dejes en paz, o indica expl\xedcitamente que prefiere comprar sin asistencia manual, desp\xeddete de forma muy cort\xe9s y respetuosa, e incluye EXACTAMENTE al final de tu respuesta la etiqueta `[MUTE_ASSISTANT]`. Ejemplo: 'Entendido, te dejo hacer tu pedido a tu ritmo. \xa1Buen provecho! [MUTE_ASSISTANT]'\n6. FORMATO ESTRICTO DE VOZ: Responde \xdaNICAMENTE en texto plano. Est\xe1 ESTRICTAMENTE PROHIBIDO usar formato Markdown (nada de asteriscos, vi\xf1etas, guiones, ni negritas). Usa lenguaje natural.\n7. COMANDOS DE NAVEGACI\xd3N: Si el usuario muestra inter\xe9s en un producto, te pide un producto en espec\xedfico, o pregunta por sus sabores, busca el ID de ese producto en tu contexto de cat\xe1logo (aparece como [ID n]) y agrega EXACTAMENTE la etiqueta `[VER_PRODUCTO:id]` al final de tu respuesta. Ejemplo: '\xa1Claro! Aqu\xed tienes las opciones para que elijas tu sabor. [VER_PRODUCTO:101]'\n8. CERRAR VENTA: Si el usuario te pide expl\xedcitamente agregar un producto al pedido (ej. 'dame 2 de fresa', 'agr\xe9galo al carrito'), busca su ID en el cat\xe1logo y agrega EXACTAMENTE la etiqueta `[AGREGAR_CARRITO:id:cantidad]` al final de tu respuesta. Ejemplo: '\xa1Listo, mi vida! Ya te lo preparo. [AGREGAR_CARRITO:2172:2]'\nJam\xe1s rompas tu personaje de vendedora Mercedes.",safetySettings:es,generationConfig:{maxOutputTokens:300,temperature:.6}}),i=`[CONTEXTO INVISIBLE PARA MERCEDES: Cat\xe1logo disponible: ${s||"No especificado"}. Carrito actual del usuario: ${o||"Vac\xedo"}]. Mensaje del usuario: ${n}`,a=(await e.generateContent(i)).response.text().trim();if(!a)return O.NextResponse.json({success:!1,error:"Sin respuesta del asistente"},{status:502});return O.NextResponse.json({success:!0,reply:a})}catch(e){return console.error("Error en /api/assistant",e instanceof Error?e.message:e),O.NextResponse.json({success:!1,error:"El asistente no est\xe1 disponible por ahora"},{status:502})}}let ei=new g.AppRouteRouteModule({definition:{kind:m.x.APP_ROUTE,page:"/api/assistant/route",pathname:"/api/assistant",filename:"route",bundlePath:"app/api/assistant/route"},resolvedPagePath:"C:\\Users\\Usuario\\Documents\\Proyectos de programacion omar soto\\plantillas new\\Nextjs\\src\\app\\api\\assistant\\route.ts",nextConfigOutput:"",userland:E}),{requestAsyncStorage:ea,staticGenerationAsyncStorage:er,serverHooks:ec}=ei,el="/api/assistant/route";function ed(){return(0,C.patchFetch)({serverHooks:ec,staticGenerationAsyncStorage:er})}}};var t=require("../../../webpack-runtime.js");t.C(e);var n=e=>t(t.s=e),s=t.X(0,[948,972],()=>n(44880));module.exports=s})();