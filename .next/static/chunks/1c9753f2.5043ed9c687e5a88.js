"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[280],{3206:function(e,t,n){n.d(t,{$:function(){return np},A:function(){return d},B:function(){return t4},C:function(){return nu},D:function(){return rs},E:function(){return ts},F:function(){return tT},G:function(){return tE},H:function(){return ee},I:function(){return et},J:function(){return ny},K:function(){return ib},L:function(){return ev},M:function(){return nZ},N:function(){return eQ},O:function(){return to},P:function(){return tp},Q:function(){return nh},R:function(){return n5},S:function(){return tA},T:function(){return i4},U:function(){return t9},V:function(){return tx},W:function(){return ie},X:function(){return iI},Y:function(){return iO},Z:function(){return nk},_:function(){return nm},a:function(){return tf},a0:function(){return tm},a1:function(){return m},a2:function(){return tH},a3:function(){return it},a4:function(){return ig},a5:function(){return iP},a6:function(){return eu},a7:function(){return nv},a8:function(){return t6},a9:function(){return tB},aa:function(){return t1},ab:function(){return nl},ac:function(){return tN},ad:function(){return tF},ae:function(){return tq},af:function(){return t0},ag:function(){return t3},ah:function(){return n7},ai:function(){return im},aj:function(){return iR},ak:function(){return n_},al:function(){return tL},am:function(){return nI},an:function(){return ne},ao:function(){return nt},ap:function(){return ir},aq:function(){return t7},ar:function(){return ng},as:function(){return nd},at:function(){return t5},au:function(){return tQ},b:function(){return e9},c:function(){return I},d:function(){return tg},e:function(){return c},f:function(){return tw},g:function(){return tv},h:function(){return h},i:function(){return ia},j:function(){return i2},k:function(){return u},l:function(){return l},m:function(){return i5},n:function(){return tS},o:function(){return tY},p:function(){return nf},q:function(){return nU},r:function(){return nC},s:function(){return i1},t:function(){return nV},u:function(){return tX},v:function(){return tJ},w:function(){return eZ},x:function(){return tZ},y:function(){return f},z:function(){return nT}});var i,r=n(1480),s=n(9074),a=n(3693),o=n(5980);/**
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
 */let c={PHONE:"phone",TOTP:"totp"},u={FACEBOOK:"facebook.com",GITHUB:"github.com",GOOGLE:"google.com",PASSWORD:"password",PHONE:"phone",TWITTER:"twitter.com"},l={EMAIL_LINK:"emailLink",EMAIL_PASSWORD:"password",FACEBOOK:"facebook.com",GITHUB:"github.com",GOOGLE:"google.com",PHONE:"phone",TWITTER:"twitter.com"},h={LINK:"link",REAUTHENTICATE:"reauthenticate",SIGN_IN:"signIn"},d={EMAIL_SIGNIN:"EMAIL_SIGNIN",PASSWORD_RESET:"PASSWORD_RESET",RECOVER_EMAIL:"RECOVER_EMAIL",REVERT_SECOND_FACTOR_ADDITION:"REVERT_SECOND_FACTOR_ADDITION",VERIFY_AND_CHANGE_EMAIL:"VERIFY_AND_CHANGE_EMAIL",VERIFY_EMAIL:"VERIFY_EMAIL"};function p(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}let f=/**
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
 */function(){return{"admin-restricted-operation":"This operation is restricted to administrators only.","argument-error":"","app-not-authorized":"This app, identified by the domain where it's hosted, is not authorized to use Firebase Authentication with the provided API key. Review your key configuration in the Google API console.","app-not-installed":"The requested mobile application corresponding to the identifier (Android package name or iOS bundle ID) provided is not installed on this device.","captcha-check-failed":"The reCAPTCHA response token provided is either invalid, expired, already used or the domain associated with it does not match the list of whitelisted domains.","code-expired":"The SMS code has expired. Please re-send the verification code to try again.","cordova-not-ready":"Cordova framework is not ready.","cors-unsupported":"This browser is not supported.","credential-already-in-use":"This credential is already associated with a different user account.","custom-token-mismatch":"The custom token corresponds to a different audience.","requires-recent-login":"This operation is sensitive and requires recent authentication. Log in again before retrying this request.","dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK.","dynamic-link-not-activated":"Please activate Dynamic Links in the Firebase Console and agree to the terms and conditions.","email-change-needs-verification":"Multi-factor users must always have a verified email.","email-already-in-use":"The email address is already in use by another account.","emulator-config-failed":'Auth instance has already been used to make a network call. Auth can no longer be configured to use the emulator. Try calling "connectAuthEmulator()" sooner.',"expired-action-code":"The action code has expired.","cancelled-popup-request":"This operation has been cancelled due to another conflicting popup being opened.","internal-error":"An internal AuthError has occurred.","invalid-app-credential":"The phone verification request contains an invalid application verifier. The reCAPTCHA token response is either invalid or expired.","invalid-app-id":"The mobile app identifier is not registered for the current project.","invalid-user-token":"This user's credential isn't valid for this project. This can happen if the user's token has been tampered with, or if the user isn't for the project associated with this API key.","invalid-auth-event":"An internal AuthError has occurred.","invalid-verification-code":"The SMS verification code used to create the phone auth credential is invalid. Please resend the verification code sms and be sure to use the verification code provided by the user.","invalid-continue-uri":"The continue URL provided in the request is invalid.","invalid-cordova-configuration":"The following Cordova plugins must be installed to enable OAuth sign-in: cordova-plugin-buildinfo, cordova-universal-links-plugin, cordova-plugin-browsertab, cordova-plugin-inappbrowser and cordova-plugin-customurlscheme.","invalid-custom-token":"The custom token format is incorrect. Please check the documentation.","invalid-dynamic-link-domain":"The provided dynamic link domain is not configured or authorized for the current project.","invalid-email":"The email address is badly formatted.","invalid-emulator-scheme":"Emulator URL must start with a valid scheme (http:// or https://).","invalid-api-key":"Your API key is invalid, please check you have copied it correctly.","invalid-cert-hash":"The SHA-1 certificate hash provided is invalid.","invalid-credential":"The supplied auth credential is incorrect, malformed or has expired.","invalid-message-payload":"The email template corresponding to this action contains invalid characters in its message. Please fix by going to the Auth email templates section in the Firebase Console.","invalid-multi-factor-session":"The request does not contain a valid proof of first factor successful sign-in.","invalid-oauth-provider":"EmailAuthProvider is not supported for this operation. This operation only supports OAuth providers.","invalid-oauth-client-id":"The OAuth client ID provided is either invalid or does not match the specified API key.","unauthorized-domain":"This domain is not authorized for OAuth operations for your Firebase project. Edit the list of authorized domains from the Firebase console.","invalid-action-code":"The action code is invalid. This can happen if the code is malformed, expired, or has already been used.","wrong-password":"The password is invalid or the user does not have a password.","invalid-persistence-type":"The specified persistence type is invalid. It can only be local, session or none.","invalid-phone-number":"The format of the phone number provided is incorrect. Please enter the phone number in a format that can be parsed into E.164 format. E.164 phone numbers are written in the format [+][country code][subscriber number including area code].","invalid-provider-id":"The specified provider ID is invalid.","invalid-recipient-email":"The email corresponding to this action failed to send as the provided recipient email address is invalid.","invalid-sender":"The email template corresponding to this action contains an invalid sender email or name. Please fix by going to the Auth email templates section in the Firebase Console.","invalid-verification-id":"The verification ID used to create the phone auth credential is invalid.","invalid-tenant-id":"The Auth instance's tenant ID is invalid.","login-blocked":"Login blocked by user-provided method: {$originalMessage}","missing-android-pkg-name":"An Android Package Name must be provided if the Android App is required to be installed.","auth-domain-config-required":"Be sure to include authDomain when calling firebase.initializeApp(), by following the instructions in the Firebase console.","missing-app-credential":"The phone verification request is missing an application verifier assertion. A reCAPTCHA response token needs to be provided.","missing-verification-code":"The phone auth credential was created with an empty SMS verification code.","missing-continue-uri":"A continue URL must be provided in the request.","missing-iframe-start":"An internal AuthError has occurred.","missing-ios-bundle-id":"An iOS Bundle ID must be provided if an App Store ID is provided.","missing-or-invalid-nonce":"The request does not contain a valid nonce. This can occur if the SHA-256 hash of the provided raw nonce does not match the hashed nonce in the ID token payload.","missing-password":"A non-empty password must be provided","missing-multi-factor-info":"No second factor identifier is provided.","missing-multi-factor-session":"The request is missing proof of first factor successful sign-in.","missing-phone-number":"To send verification codes, provide a phone number for the recipient.","missing-verification-id":"The phone auth credential was created with an empty verification ID.","app-deleted":"This instance of FirebaseApp has been deleted.","multi-factor-info-not-found":"The user does not have a second factor matching the identifier provided.","multi-factor-auth-required":"Proof of ownership of a second factor is required to complete sign-in.","account-exists-with-different-credential":"An account already exists with the same email address but different sign-in credentials. Sign in using a provider associated with this email address.","network-request-failed":"A network AuthError (such as timeout, interrupted connection or unreachable host) has occurred.","no-auth-event":"An internal AuthError has occurred.","no-such-provider":"User was not linked to an account with the given provider.","null-user":"A null user object was provided as the argument for an operation which requires a non-null user object.","operation-not-allowed":"The given sign-in provider is disabled for this Firebase project. Enable it in the Firebase console, under the sign-in method tab of the Auth section.","operation-not-supported-in-this-environment":'This operation is not supported in the environment this application is running on. "location.protocol" must be http, https or chrome-extension and web storage must be enabled.',"popup-blocked":"Unable to establish a connection with the popup. It may have been blocked by the browser.","popup-closed-by-user":"The popup has been closed by the user before finalizing the operation.","provider-already-linked":"User can only be linked to one identity for the given provider.","quota-exceeded":"The project's quota for this operation has been exceeded.","redirect-cancelled-by-user":"The redirect operation has been cancelled by the user before finalizing.","redirect-operation-pending":"A redirect sign-in operation is already pending.","rejected-credential":"The request contains malformed or mismatching credentials.","second-factor-already-in-use":"The second factor is already enrolled on this account.","maximum-second-factor-count-exceeded":"The maximum allowed number of second factors on a user has been exceeded.","tenant-id-mismatch":"The provided tenant ID does not match the Auth instance's tenant ID",timeout:"The operation has timed out.","user-token-expired":"The user's credential is no longer valid. The user must sign in again.","too-many-requests":"We have blocked all requests from this device due to unusual activity. Try again later.","unauthorized-continue-uri":"The domain of the continue URL is not whitelisted.  Please whitelist the domain in the Firebase console.","unsupported-first-factor":"Enrolling a second factor or signing in with a multi-factor account requires sign-in with a supported first factor.","unsupported-persistence-type":"The current environment does not support the specified persistence type.","unsupported-tenant-operation":"This operation is not supported in a multi-tenant context.","unverified-email":"The operation requires a verified email.","user-cancelled":"The user did not grant your application the permissions it requested.","user-not-found":"There is no user record corresponding to this identifier. The user may have been deleted.","user-disabled":"The user account has been disabled by an administrator.","user-mismatch":"The supplied credentials do not correspond to the previously signed in user.","user-signed-out":"","weak-password":"The password must be 6 characters long or more.","web-storage-unsupported":"This browser is not supported or 3rd party cookies and data may be disabled.","already-initialized":"initializeAuth() has already been called with different options. To avoid this error, call initializeAuth() with the same options as when it was originally called, or call getAuth() to return the already initialized instance.","missing-recaptcha-token":"The reCAPTCHA token is missing when sending request to the backend.","invalid-recaptcha-token":"The reCAPTCHA token is invalid when sending request to the backend.","invalid-recaptcha-action":"The reCAPTCHA action is invalid when sending request to the backend.","recaptcha-not-enabled":"reCAPTCHA Enterprise integration is not enabled for this project.","missing-client-type":"The reCAPTCHA client type is missing when sending request to the backend.","missing-recaptcha-version":"The reCAPTCHA version is missing when sending request to the backend.","invalid-req-type":"Invalid request parameters.","invalid-recaptcha-version":"The reCAPTCHA version is invalid when sending request to the backend.","unsupported-password-policy-schema-version":"The password policy received from the backend uses a schema version that is not supported by this version of the Firebase SDK.","password-does-not-meet-requirements":"The password does not meet the requirements.","invalid-hosting-link-domain":"The provided Hosting link domain is not configured in Firebase Hosting or is not owned by the current project. This cannot be a default Hosting domain (`web.app` or `firebaseapp.com`)."}},m=p,g=new s.LL("auth","Firebase",p()),I={ADMIN_ONLY_OPERATION:"auth/admin-restricted-operation",ARGUMENT_ERROR:"auth/argument-error",APP_NOT_AUTHORIZED:"auth/app-not-authorized",APP_NOT_INSTALLED:"auth/app-not-installed",CAPTCHA_CHECK_FAILED:"auth/captcha-check-failed",CODE_EXPIRED:"auth/code-expired",CORDOVA_NOT_READY:"auth/cordova-not-ready",CORS_UNSUPPORTED:"auth/cors-unsupported",CREDENTIAL_ALREADY_IN_USE:"auth/credential-already-in-use",CREDENTIAL_MISMATCH:"auth/custom-token-mismatch",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"auth/requires-recent-login",DEPENDENT_SDK_INIT_BEFORE_AUTH:"auth/dependent-sdk-initialized-before-auth",DYNAMIC_LINK_NOT_ACTIVATED:"auth/dynamic-link-not-activated",EMAIL_CHANGE_NEEDS_VERIFICATION:"auth/email-change-needs-verification",EMAIL_EXISTS:"auth/email-already-in-use",EMULATOR_CONFIG_FAILED:"auth/emulator-config-failed",EXPIRED_OOB_CODE:"auth/expired-action-code",EXPIRED_POPUP_REQUEST:"auth/cancelled-popup-request",INTERNAL_ERROR:"auth/internal-error",INVALID_API_KEY:"auth/invalid-api-key",INVALID_APP_CREDENTIAL:"auth/invalid-app-credential",INVALID_APP_ID:"auth/invalid-app-id",INVALID_AUTH:"auth/invalid-user-token",INVALID_AUTH_EVENT:"auth/invalid-auth-event",INVALID_CERT_HASH:"auth/invalid-cert-hash",INVALID_CODE:"auth/invalid-verification-code",INVALID_CONTINUE_URI:"auth/invalid-continue-uri",INVALID_CORDOVA_CONFIGURATION:"auth/invalid-cordova-configuration",INVALID_CUSTOM_TOKEN:"auth/invalid-custom-token",INVALID_DYNAMIC_LINK_DOMAIN:"auth/invalid-dynamic-link-domain",INVALID_EMAIL:"auth/invalid-email",INVALID_EMULATOR_SCHEME:"auth/invalid-emulator-scheme",INVALID_IDP_RESPONSE:"auth/invalid-credential",INVALID_LOGIN_CREDENTIALS:"auth/invalid-credential",INVALID_MESSAGE_PAYLOAD:"auth/invalid-message-payload",INVALID_MFA_SESSION:"auth/invalid-multi-factor-session",INVALID_OAUTH_CLIENT_ID:"auth/invalid-oauth-client-id",INVALID_OAUTH_PROVIDER:"auth/invalid-oauth-provider",INVALID_OOB_CODE:"auth/invalid-action-code",INVALID_ORIGIN:"auth/unauthorized-domain",INVALID_PASSWORD:"auth/wrong-password",INVALID_PERSISTENCE:"auth/invalid-persistence-type",INVALID_PHONE_NUMBER:"auth/invalid-phone-number",INVALID_PROVIDER_ID:"auth/invalid-provider-id",INVALID_RECIPIENT_EMAIL:"auth/invalid-recipient-email",INVALID_SENDER:"auth/invalid-sender",INVALID_SESSION_INFO:"auth/invalid-verification-id",INVALID_TENANT_ID:"auth/invalid-tenant-id",MFA_INFO_NOT_FOUND:"auth/multi-factor-info-not-found",MFA_REQUIRED:"auth/multi-factor-auth-required",MISSING_ANDROID_PACKAGE_NAME:"auth/missing-android-pkg-name",MISSING_APP_CREDENTIAL:"auth/missing-app-credential",MISSING_AUTH_DOMAIN:"auth/auth-domain-config-required",MISSING_CODE:"auth/missing-verification-code",MISSING_CONTINUE_URI:"auth/missing-continue-uri",MISSING_IFRAME_START:"auth/missing-iframe-start",MISSING_IOS_BUNDLE_ID:"auth/missing-ios-bundle-id",MISSING_OR_INVALID_NONCE:"auth/missing-or-invalid-nonce",MISSING_MFA_INFO:"auth/missing-multi-factor-info",MISSING_MFA_SESSION:"auth/missing-multi-factor-session",MISSING_PHONE_NUMBER:"auth/missing-phone-number",MISSING_PASSWORD:"auth/missing-password",MISSING_SESSION_INFO:"auth/missing-verification-id",MODULE_DESTROYED:"auth/app-deleted",NEED_CONFIRMATION:"auth/account-exists-with-different-credential",NETWORK_REQUEST_FAILED:"auth/network-request-failed",NULL_USER:"auth/null-user",NO_AUTH_EVENT:"auth/no-auth-event",NO_SUCH_PROVIDER:"auth/no-such-provider",OPERATION_NOT_ALLOWED:"auth/operation-not-allowed",OPERATION_NOT_SUPPORTED:"auth/operation-not-supported-in-this-environment",POPUP_BLOCKED:"auth/popup-blocked",POPUP_CLOSED_BY_USER:"auth/popup-closed-by-user",PROVIDER_ALREADY_LINKED:"auth/provider-already-linked",QUOTA_EXCEEDED:"auth/quota-exceeded",REDIRECT_CANCELLED_BY_USER:"auth/redirect-cancelled-by-user",REDIRECT_OPERATION_PENDING:"auth/redirect-operation-pending",REJECTED_CREDENTIAL:"auth/rejected-credential",SECOND_FACTOR_ALREADY_ENROLLED:"auth/second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"auth/maximum-second-factor-count-exceeded",TENANT_ID_MISMATCH:"auth/tenant-id-mismatch",TIMEOUT:"auth/timeout",TOKEN_EXPIRED:"auth/user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"auth/too-many-requests",UNAUTHORIZED_DOMAIN:"auth/unauthorized-continue-uri",UNSUPPORTED_FIRST_FACTOR:"auth/unsupported-first-factor",UNSUPPORTED_PERSISTENCE:"auth/unsupported-persistence-type",UNSUPPORTED_TENANT_OPERATION:"auth/unsupported-tenant-operation",UNVERIFIED_EMAIL:"auth/unverified-email",USER_CANCELLED:"auth/user-cancelled",USER_DELETED:"auth/user-not-found",USER_DISABLED:"auth/user-disabled",USER_MISMATCH:"auth/user-mismatch",USER_SIGNED_OUT:"auth/user-signed-out",WEAK_PASSWORD:"auth/weak-password",WEB_STORAGE_UNSUPPORTED:"auth/web-storage-unsupported",ALREADY_INITIALIZED:"auth/already-initialized",RECAPTCHA_NOT_ENABLED:"auth/recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"auth/missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"auth/invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"auth/invalid-recaptcha-action",MISSING_CLIENT_TYPE:"auth/missing-client-type",MISSING_RECAPTCHA_VERSION:"auth/missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"auth/invalid-recaptcha-version",INVALID_REQ_TYPE:"auth/invalid-req-type",INVALID_HOSTING_LINK_DOMAIN:"auth/invalid-hosting-link-domain"},_=new a.Yd("@firebase/auth");function v(e,...t){_.logLevel<=a.in.WARN&&_.warn(`Auth (${r.Jn}): ${e}`,...t)}function T(e,...t){_.logLevel<=a.in.ERROR&&_.error(`Auth (${r.Jn}): ${e}`,...t)}/**
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
 */function w(e,...t){throw R(e,...t)}function E(e,...t){return R(e,...t)}function y(e,t,n){let i={...m(),[t]:n};return new s.LL("auth","Firebase",i).create(t,{appName:e.name})}function A(e){return y(e,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function S(e,t,n){if(!(t instanceof n))throw n.name!==t.constructor.name&&w(e,"argument-error"),y(e,"argument-error",`Type of ${t.constructor.name} does not match expected instance.Did you pass a reference from a different Auth SDK?`)}function R(e,...t){if("string"!=typeof e){let n=t[0],i=[...t.slice(1)];return i[0]&&(i[0].appName=e.name),e._errorFactory.create(n,...i)}return g.create(e,...t)}function k(e,t,...n){if(!e)throw R(t,...n)}function P(e){let t="INTERNAL ASSERTION FAILED: "+e;throw T(t),Error(t)}/**
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
 */function N(){return"undefined"!=typeof self&&self.location?.href||""}function O(){return"http:"===C()||"https:"===C()}function C(){return"undefined"!=typeof self&&self.location?.protocol||null}/**
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
 */class b{constructor(e,t){var n;this.shortDelay=e,this.longDelay=t,n="Short delay should be less than long delay!",t>e||P(n),this.isMobile=(0,s.uI)()||(0,s.b$)()}get(){return!("undefined"!=typeof navigator&&navigator&&"onLine"in navigator&&"boolean"==typeof navigator.onLine&&(O()||(0,s.ru)()||"connection"in navigator))||navigator.onLine?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
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
 */function L(e,t){var n,i;n=e.emulator,i="Emulator should always be set here",n||P(i);let{url:r}=e.emulator;return t?`${r}${t.startsWith("/")?t.slice(1):t}`:r}/**
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
 */class D{static initialize(e,t,n){this.fetchImpl=e,t&&(this.headersImpl=t),n&&(this.responseImpl=n)}static fetch(){return this.fetchImpl?this.fetchImpl:"undefined"!=typeof self&&"fetch"in self?self.fetch:"undefined"!=typeof globalThis&&globalThis.fetch?globalThis.fetch:"undefined"!=typeof fetch?fetch:void P("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){return this.headersImpl?this.headersImpl:"undefined"!=typeof self&&"Headers"in self?self.Headers:"undefined"!=typeof globalThis&&globalThis.Headers?globalThis.Headers:"undefined"!=typeof Headers?Headers:void P("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){return this.responseImpl?this.responseImpl:"undefined"!=typeof self&&"Response"in self?self.Response:"undefined"!=typeof globalThis&&globalThis.Response?globalThis.Response:"undefined"!=typeof Response?Response:void P("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
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
 */let U={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"},M=["/v1/accounts:signInWithCustomToken","/v1/accounts:signInWithEmailLink","/v1/accounts:signInWithIdp","/v1/accounts:signInWithPassword","/v1/accounts:signInWithPhoneNumber","/v1/token"],V=new b(3e4,6e4);function F(e,t){return e.tenantId&&!t.tenantId?{...t,tenantId:e.tenantId}:t}async function x(e,t,n,i,r={}){return H(e,r,async()=>{let r={},a={};i&&("GET"===t?a=i:r={body:JSON.stringify(i)});let o=(0,s.xO)({...a,key:e.config.apiKey}).slice(1),c=await e._getAdditionalHeaders();c["Content-Type"]="application/json",e.languageCode&&(c["X-Firebase-Locale"]=e.languageCode);let u={method:t,headers:c,...r};return(0,s.L_)()||(u.referrerPolicy="strict-origin-when-cross-origin"),e.emulatorConfig&&(0,s.Xx)(e.emulatorConfig.host)&&(u.credentials="include"),D.fetch()(await q(e,e.config.apiHost,n,o),u)})}async function H(e,t,n){e._canInitEmulator=!1;let i={...U,...t};try{let t=new z(e),r=await Promise.race([n(),t.promise]);t.clearNetworkTimeout();let s=await r.json();if("needConfirmation"in s)throw W(e,"account-exists-with-different-credential",s);if(r.ok&&!("errorMessage"in s))return s;{let[t,n]=(r.ok?s.errorMessage:s.error.message).split(" : ");if("FEDERATED_USER_ID_ALREADY_LINKED"===t)throw W(e,"credential-already-in-use",s);if("EMAIL_EXISTS"===t)throw W(e,"email-already-in-use",s);if("USER_DISABLED"===t)throw W(e,"user-disabled",s);let a=i[t]||t.toLowerCase().replace(/[_\s]+/g,"-");if(n)throw y(e,a,n);w(e,a)}}catch(t){if(t instanceof s.ZR)throw t;w(e,"network-request-failed",{message:String(t)})}}async function j(e,t,n,i,r={}){let s=await x(e,t,n,i,r);return"mfaPendingCredential"in s&&w(e,"multi-factor-auth-required",{_serverResponse:s}),s}async function q(e,t,n,i){let r=`${t}${n}?${i}`,s=e.config.emulator?L(e.config,r):`${e.config.apiScheme}://${r}`;return M.includes(n)&&(await e._persistenceManagerAvailable,"COOKIE"===e._getPersistenceType())?e._getPersistence()._getFinalTarget(s).toString():s}class z{clearNetworkTimeout(){clearTimeout(this.timer)}constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((e,t)=>{this.timer=setTimeout(()=>t(E(this.auth,"network-request-failed")),V.get())})}}function W(e,t,n){let i={appName:e.name};n.email&&(i.email=n.email),n.phoneNumber&&(i.phoneNumber=n.phoneNumber);let r=E(e,t,i);return r.customData._tokenResponse=n,r}/**
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
 */function G(e){return void 0!==e&&void 0!==e.getResponse}function K(e){return void 0!==e&&void 0!==e.enterprise}class ${constructor(e){if(this.siteKey="",this.recaptchaEnforcementState=[],void 0===e.recaptchaKey)throw Error("recaptchaKey undefined");this.siteKey=e.recaptchaKey.split("/")[3],this.recaptchaEnforcementState=e.recaptchaEnforcementState}getProviderEnforcementState(e){if(!this.recaptchaEnforcementState||0===this.recaptchaEnforcementState.length)return null;for(let t of this.recaptchaEnforcementState)if(t.provider&&t.provider===e)return function(e){switch(e){case"ENFORCE":return"ENFORCE";case"AUDIT":return"AUDIT";case"OFF":return"OFF";default:return"ENFORCEMENT_STATE_UNSPECIFIED"}}(t.enforcementState);return null}isProviderEnabled(e){return"ENFORCE"===this.getProviderEnforcementState(e)||"AUDIT"===this.getProviderEnforcementState(e)}isAnyProviderEnabled(){return this.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")||this.isProviderEnabled("PHONE_PROVIDER")}}/**
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
 */async function B(e){return(await x(e,"GET","/v1/recaptchaParams")).recaptchaSiteKey||""}async function J(e,t){return x(e,"GET","/v2/recaptchaConfig",F(e,t))}/**
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
 */async function Y(e,t){return x(e,"POST","/v1/accounts:delete",t)}async function X(e,t){return x(e,"POST","/v1/accounts:update",t)}async function Q(e,t){return x(e,"POST","/v1/accounts:lookup",t)}/**
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
 */function Z(e){if(e)try{let t=new Date(Number(e));if(!isNaN(t.getTime()))return t.toUTCString()}catch(e){}}/**
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
 */function ee(e,t=!1){return(0,s.m9)(e).getIdToken(t)}async function et(e,t=!1){let n=(0,s.m9)(e),i=await n.getIdToken(t),r=ei(i);k(r&&r.exp&&r.auth_time&&r.iat,n.auth,"internal-error");let a="object"==typeof r.firebase?r.firebase:void 0,o=a?.sign_in_provider;return{claims:r,token:i,authTime:Z(en(r.auth_time)),issuedAtTime:Z(en(r.iat)),expirationTime:Z(en(r.exp)),signInProvider:o||null,signInSecondFactor:a?.sign_in_second_factor||null}}function en(e){return 1e3*Number(e)}function ei(e){let[t,n,i]=e.split(".");if(void 0===t||void 0===n||void 0===i)return T("JWT malformed, contained fewer than 3 sections"),null;try{let e=(0,s.tV)(n);if(!e)return T("Failed to decode base64 JWT payload"),null;return JSON.parse(e)}catch(e){return T("Caught error parsing JWT payload as JSON",e?.toString()),null}}function er(e){let t=ei(e);return k(t,"internal-error"),k(void 0!==t.exp,"internal-error"),k(void 0!==t.iat,"internal-error"),Number(t.exp)-Number(t.iat)}/**
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
 */async function es(e,t,n=!1){if(n)return t;try{return await t}catch(t){throw t instanceof s.ZR&&function({code:e}){return"auth/user-disabled"===e||"auth/user-token-expired"===e}(t)&&e.auth.currentUser===e&&await e.auth.signOut(),t}}/**
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
 */class ea{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,null!==this.timerId&&clearTimeout(this.timerId))}getInterval(e){if(!e)return this.errorBackoff=3e4,Math.max(0,(this.user.stsTokenManager.expirationTime??0)-Date.now()-3e5);{let e=this.errorBackoff;return this.errorBackoff=Math.min(2*this.errorBackoff,96e4),e}}schedule(e=!1){if(!this.isRunning)return;let t=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},t)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){e?.code==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
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
 */class eo{constructor(e,t){this.createdAt=e,this.lastLoginAt=t,this._initializeTime()}_initializeTime(){this.lastSignInTime=Z(this.lastLoginAt),this.creationTime=Z(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
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
 */async function ec(e){let t=e.auth,n=await e.getIdToken(),i=await es(e,Q(t,{idToken:n}));k(i?.users.length,t,"internal-error");let r=i.users[0];e._notifyReloadListener(r);let s=r.providerUserInfo?.length?el(r.providerUserInfo):[],a=[...e.providerData.filter(e=>!s.some(t=>t.providerId===e.providerId)),...s],o=e.isAnonymous,c=!(e.email&&r.passwordHash)&&!a?.length;Object.assign(e,{uid:r.localId,displayName:r.displayName||null,photoURL:r.photoUrl||null,email:r.email||null,emailVerified:r.emailVerified||!1,phoneNumber:r.phoneNumber||null,tenantId:r.tenantId||null,providerData:a,metadata:new eo(r.createdAt,r.lastLoginAt),isAnonymous:!!o&&c})}async function eu(e){let t=(0,s.m9)(e);await ec(t),await t.auth._persistUserIfCurrent(t),t.auth._notifyListenersIfCurrent(t)}function el(e){return e.map(({providerId:e,...t})=>({providerId:e,uid:t.rawId||"",displayName:t.displayName||null,email:t.email||null,phoneNumber:t.phoneNumber||null,photoURL:t.photoUrl||null}))}/**
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
 */async function eh(e,t){let n=await H(e,{},async()=>{let n=(0,s.xO)({grant_type:"refresh_token",refresh_token:t}).slice(1),{tokenApiHost:i,apiKey:r}=e.config,a=await q(e,i,"/v1/token",`key=${r}`),o=await e._getAdditionalHeaders();o["Content-Type"]="application/x-www-form-urlencoded";let c={method:"POST",headers:o,body:n};return e.emulatorConfig&&(0,s.Xx)(e.emulatorConfig.host)&&(c.credentials="include"),D.fetch()(a,c)});return{accessToken:n.access_token,expiresIn:n.expires_in,refreshToken:n.refresh_token}}async function ed(e,t){return x(e,"POST","/v2/accounts:revokeToken",F(e,t))}/**
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
 */class ep{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){k(e.idToken,"internal-error"),k(void 0!==e.idToken,"internal-error"),k(void 0!==e.refreshToken,"internal-error");let t="expiresIn"in e&&void 0!==e.expiresIn?Number(e.expiresIn):er(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,t)}updateFromIdToken(e){k(0!==e.length,"internal-error");let t=er(e);this.updateTokensAndExpiration(e,null,t)}async getToken(e,t=!1){return t||!this.accessToken||this.isExpired?(k(this.refreshToken,e,"user-token-expired"),this.refreshToken)?(await this.refresh(e,this.refreshToken),this.accessToken):null:this.accessToken}clearRefreshToken(){this.refreshToken=null}async refresh(e,t){let{accessToken:n,refreshToken:i,expiresIn:r}=await eh(e,t);this.updateTokensAndExpiration(n,i,Number(r))}updateTokensAndExpiration(e,t,n){this.refreshToken=t||null,this.accessToken=e||null,this.expirationTime=Date.now()+1e3*n}static fromJSON(e,t){let{refreshToken:n,accessToken:i,expirationTime:r}=t,s=new ep;return n&&(k("string"==typeof n,"internal-error",{appName:e}),s.refreshToken=n),i&&(k("string"==typeof i,"internal-error",{appName:e}),s.accessToken=i),r&&(k("number"==typeof r,"internal-error",{appName:e}),s.expirationTime=r),s}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new ep,this.toJSON())}_performRefresh(){return P("not implemented")}}/**
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
 */function ef(e,t){k("string"==typeof e||void 0===e,"internal-error",{appName:t})}class em{constructor({uid:e,auth:t,stsTokenManager:n,...i}){this.providerId="firebase",this.proactiveRefresh=new ea(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=e,this.auth=t,this.stsTokenManager=n,this.accessToken=n.accessToken,this.displayName=i.displayName||null,this.email=i.email||null,this.emailVerified=i.emailVerified||!1,this.phoneNumber=i.phoneNumber||null,this.photoURL=i.photoURL||null,this.isAnonymous=i.isAnonymous||!1,this.tenantId=i.tenantId||null,this.providerData=i.providerData?[...i.providerData]:[],this.metadata=new eo(i.createdAt||void 0,i.lastLoginAt||void 0)}async getIdToken(e){let t=await es(this,this.stsTokenManager.getToken(this.auth,e));return k(t,this.auth,"internal-error"),this.accessToken!==t&&(this.accessToken=t,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),t}getIdTokenResult(e){return et(this,e)}reload(){return eu(this)}_assign(e){this!==e&&(k(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(e=>({...e})),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){let t=new em({...this,auth:e,stsTokenManager:this.stsTokenManager._clone()});return t.metadata._copy(this.metadata),t}_onReload(e){k(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,t=!1){let n=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),n=!0),t&&await ec(this),await this.auth._persistUserIfCurrent(this),n&&this.auth._notifyListenersIfCurrent(this)}async delete(){if((0,r.rh)(this.auth.app))return Promise.reject(A(this.auth));let e=await this.getIdToken();return await es(this,Y(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return{uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>({...e})),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId,...this.metadata.toJSON(),apiKey:this.auth.config.apiKey,appName:this.auth.name}}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,t){let n=t.displayName??void 0,i=t.email??void 0,r=t.phoneNumber??void 0,s=t.photoURL??void 0,a=t.tenantId??void 0,o=t._redirectEventId??void 0,c=t.createdAt??void 0,u=t.lastLoginAt??void 0,{uid:l,emailVerified:h,isAnonymous:d,providerData:p,stsTokenManager:f}=t;k(l&&f,e,"internal-error");let m=ep.fromJSON(this.name,f);k("string"==typeof l,e,"internal-error"),ef(n,e.name),ef(i,e.name),k("boolean"==typeof h,e,"internal-error"),k("boolean"==typeof d,e,"internal-error"),ef(r,e.name),ef(s,e.name),ef(a,e.name),ef(o,e.name),ef(c,e.name),ef(u,e.name);let g=new em({uid:l,auth:e,email:i,emailVerified:h,displayName:n,isAnonymous:d,photoURL:s,phoneNumber:r,tenantId:a,stsTokenManager:m,createdAt:c,lastLoginAt:u});return p&&Array.isArray(p)&&(g.providerData=p.map(e=>({...e}))),o&&(g._redirectEventId=o),g}static async _fromIdTokenResponse(e,t,n=!1){let i=new ep;i.updateFromServerResponse(t);let r=new em({uid:t.localId,auth:e,stsTokenManager:i,isAnonymous:n});return await ec(r),r}static async _fromGetAccountInfoResponse(e,t,n){let i=t.users[0];k(void 0!==i.localId,"internal-error");let r=void 0!==i.providerUserInfo?el(i.providerUserInfo):[],s=!(i.email&&i.passwordHash)&&!r?.length,a=new ep;a.updateFromIdToken(n);let o=new em({uid:i.localId,auth:e,stsTokenManager:a,isAnonymous:s});return Object.assign(o,{uid:i.localId,displayName:i.displayName||null,photoURL:i.photoUrl||null,email:i.email||null,emailVerified:i.emailVerified||!1,phoneNumber:i.phoneNumber||null,tenantId:i.tenantId||null,providerData:r,metadata:new eo(i.createdAt,i.lastLoginAt),isAnonymous:!(i.email&&i.passwordHash)&&!r?.length}),o}}/**
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
 */let eg=new Map;function eI(e){var t,n;t="Expected a class definition",e instanceof Function||P(t);let i=eg.get(e);return i?(n="Instance stored in cache mismatched with class",i instanceof e||P(n)):(i=new e,eg.set(e,i)),i}/**
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
 */class e_{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,t){this.storage[e]=t}async _get(e){let t=this.storage[e];return void 0===t?null:t}async _remove(e){delete this.storage[e]}_addListener(e,t){}_removeListener(e,t){}}e_.type="NONE";let ev=e_;/**
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
 */function eT(e,t,n){return`firebase:${e}:${t}:${n}`}class ew{constructor(e,t,n){this.persistence=e,this.auth=t,this.userKey=n;let{config:i,name:r}=this.auth;this.fullUserKey=eT(this.userKey,i.apiKey,r),this.fullPersistenceKey=eT("persistence",i.apiKey,r),this.boundEventHandler=t._onStorageEvent.bind(t),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){let e=await this.persistence._get(this.fullUserKey);if(!e)return null;if("string"==typeof e){let t=await Q(this.auth,{idToken:e}).catch(()=>void 0);return t?em._fromGetAccountInfoResponse(this.auth,t,e):null}return em._fromJSON(this.auth,e)}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;let t=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,t)return this.setCurrentUser(t)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,t,n="authUser"){if(!t.length)return new ew(eI(ev),e,n);let i=(await Promise.all(t.map(async e=>{if(await e._isAvailable())return e}))).filter(e=>e),r=i[0]||eI(ev),s=eT(n,e.config.apiKey,e.name),a=null;for(let n of t)try{let t=await n._get(s);if(t){let i;if("string"==typeof t){let n=await Q(e,{idToken:t}).catch(()=>void 0);if(!n)break;i=await em._fromGetAccountInfoResponse(e,n,t)}else i=em._fromJSON(e,t);n!==r&&(a=i),r=n;break}}catch{}let o=i.filter(e=>e._shouldAllowMigration);return r._shouldAllowMigration&&o.length&&(r=o[0],a&&await r._set(s,a.toJSON()),await Promise.all(t.map(async e=>{if(e!==r)try{await e._remove(s)}catch{}}))),new ew(r,e,n)}}/**
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
 */function eE(e){let t=e.toLowerCase();if(t.includes("opera/")||t.includes("opr/")||t.includes("opios/"))return"Opera";if(eR(t))return"IEMobile";if(t.includes("msie")||t.includes("trident/"))return"IE";{if(t.includes("edge/"))return"Edge";if(ey(t))return"Firefox";if(t.includes("silk/"))return"Silk";if(eP(t))return"Blackberry";if(eN(t))return"Webos";if(eA(t))return"Safari";if((t.includes("chrome/")||eS(t))&&!t.includes("edge/"))return"Chrome";if(ek(t))return"Android";let n=e.match(/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/);if(n?.length===2)return n[1]}return"Other"}function ey(e=(0,s.z$)()){return/firefox\//i.test(e)}function eA(e=(0,s.z$)()){let t=e.toLowerCase();return t.includes("safari/")&&!t.includes("chrome/")&&!t.includes("crios/")&&!t.includes("android")}function eS(e=(0,s.z$)()){return/crios\//i.test(e)}function eR(e=(0,s.z$)()){return/iemobile/i.test(e)}function ek(e=(0,s.z$)()){return/android/i.test(e)}function eP(e=(0,s.z$)()){return/blackberry/i.test(e)}function eN(e=(0,s.z$)()){return/webos/i.test(e)}function eO(e=(0,s.z$)()){return/iphone|ipad|ipod/i.test(e)||/macintosh/i.test(e)&&/mobile/i.test(e)}function eC(e=(0,s.z$)()){return eO(e)||ek(e)||eN(e)||eP(e)||/windows phone/i.test(e)||eR(e)}/**
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
 */function eb(e,t=[]){let n;switch(e){case"Browser":n=eE((0,s.z$)());break;case"Worker":n=`${eE((0,s.z$)())}-${e}`;break;default:n=e}let i=t.length?t.join(","):"FirebaseCore-web";return`${n}/JsCore/${r.Jn}/${i}`}/**
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
 */class eL{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,t){let n=t=>new Promise((n,i)=>{try{let i=e(t);n(i)}catch(e){i(e)}});n.onAbort=t,this.queue.push(n);let i=this.queue.length-1;return()=>{this.queue[i]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;let t=[];try{for(let n of this.queue)await n(e),n.onAbort&&t.push(n.onAbort)}catch(e){for(let e of(t.reverse(),t))try{e()}catch(e){}throw this.auth._errorFactory.create("login-blocked",{originalMessage:e?.message})}}}/**
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
 */async function eD(e,t={}){return x(e,"GET","/v2/passwordPolicy",F(e,t))}class eU{constructor(e){let t=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=t.minPasswordLength??6,t.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=t.maxPasswordLength),void 0!==t.containsLowercaseCharacter&&(this.customStrengthOptions.containsLowercaseLetter=t.containsLowercaseCharacter),void 0!==t.containsUppercaseCharacter&&(this.customStrengthOptions.containsUppercaseLetter=t.containsUppercaseCharacter),void 0!==t.containsNumericCharacter&&(this.customStrengthOptions.containsNumericCharacter=t.containsNumericCharacter),void 0!==t.containsNonAlphanumericCharacter&&(this.customStrengthOptions.containsNonAlphanumericCharacter=t.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,"ENFORCEMENT_STATE_UNSPECIFIED"===this.enforcementState&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=e.allowedNonAlphanumericCharacters?.join("")??"",this.forceUpgradeOnSignin=e.forceUpgradeOnSignin??!1,this.schemaVersion=e.schemaVersion}validatePassword(e){let t={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,t),this.validatePasswordCharacterOptions(e,t),t.isValid&&(t.isValid=t.meetsMinPasswordLength??!0),t.isValid&&(t.isValid=t.meetsMaxPasswordLength??!0),t.isValid&&(t.isValid=t.containsLowercaseLetter??!0),t.isValid&&(t.isValid=t.containsUppercaseLetter??!0),t.isValid&&(t.isValid=t.containsNumericCharacter??!0),t.isValid&&(t.isValid=t.containsNonAlphanumericCharacter??!0),t}validatePasswordLengthOptions(e,t){let n=this.customStrengthOptions.minPasswordLength,i=this.customStrengthOptions.maxPasswordLength;n&&(t.meetsMinPasswordLength=e.length>=n),i&&(t.meetsMaxPasswordLength=e.length<=i)}validatePasswordCharacterOptions(e,t){let n;this.updatePasswordCharacterOptionsStatuses(t,!1,!1,!1,!1);for(let i=0;i<e.length;i++)n=e.charAt(i),this.updatePasswordCharacterOptionsStatuses(t,n>="a"&&n<="z",n>="A"&&n<="Z",n>="0"&&n<="9",this.allowedNonAlphanumericCharacters.includes(n))}updatePasswordCharacterOptionsStatuses(e,t,n,i,r){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=t)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=n)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=i)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=r))}}/**
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
 */class eM{constructor(e,t,n,i){this.app=e,this.heartbeatServiceProvider=t,this.appCheckServiceProvider=n,this.config=i,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new eF(this),this.idTokenSubscription=new eF(this),this.beforeStateQueue=new eL(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=g,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this._resolvePersistenceManagerAvailable=void 0,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=i.sdkClientVersion,this._persistenceManagerAvailable=new Promise(e=>this._resolvePersistenceManagerAvailable=e)}_initializeWithPersistence(e,t){return t&&(this._popupRedirectResolver=eI(t)),this._initializationPromise=this.queue(async()=>{if(!this._deleted&&(this.persistenceManager=await ew.create(this,e),this._resolvePersistenceManagerAvailable?.(),!this._deleted)){if(this._popupRedirectResolver?._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch(e){}await this.initializeCurrentUser(t),this.lastNotifiedUid=this.currentUser?.uid||null,this._deleted||(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;let e=await this.assertedPersistence.getCurrentUser();if(this.currentUser||e){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{let t=await Q(this,{idToken:e}),n=await em._fromGetAccountInfoResponse(this,t,e);await this.directlySetCurrentUser(n)}catch(e){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",e),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){if((0,r.rh)(this.app)){let e=this.app.settings.authIdToken;return e?new Promise(t=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(e).then(t,t))}):this.directlySetCurrentUser(null)}let t=await this.assertedPersistence.getCurrentUser(),n=t,i=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();let t=this.redirectUser?._redirectEventId,r=n?._redirectEventId,s=await this.tryRedirectSignIn(e);(!t||t===r)&&s?.user&&(n=s.user,i=!0)}if(!n)return this.directlySetCurrentUser(null);if(!n._redirectEventId){if(i)try{await this.beforeStateQueue.runMiddleware(n)}catch(e){n=t,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(e))}return n?this.reloadAndSetCurrentUserOrClear(n):this.directlySetCurrentUser(null)}return(k(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===n._redirectEventId)?this.directlySetCurrentUser(n):this.reloadAndSetCurrentUserOrClear(n)}async tryRedirectSignIn(e){let t=null;try{t=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch(e){await this._setRedirectUser(null)}return t}async reloadAndSetCurrentUserOrClear(e){try{await ec(e)}catch(e){if(e?.code!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=function(){if("undefined"==typeof navigator)return null;let e=navigator;return e.languages&&e.languages[0]||e.language||null}()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if((0,r.rh)(this.app))return Promise.reject(A(this));let t=e?(0,s.m9)(e):null;return t&&k(t.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(t&&t._clone(this))}async _updateCurrentUser(e,t=!1){if(!this._deleted)return e&&k(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),t||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return(0,r.rh)(this.app)?Promise.reject(A(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return(0,r.rh)(this.app)?Promise.reject(A(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(eI(e))})}_getRecaptchaConfig(){return null==this.tenantId?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();let t=this._getPasswordPolicyInternal();return t.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):t.validatePassword(e)}_getPasswordPolicyInternal(){return null===this.tenantId?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){let e=new eU(await eD(this));null===this.tenantId?this._projectPasswordPolicy=e:this._tenantPasswordPolicies[this.tenantId]=e}_getPersistenceType(){return this.assertedPersistence.persistence.type}_getPersistence(){return this.assertedPersistence.persistence}_updateErrorMap(e){this._errorFactory=new s.LL("auth","Firebase",e())}onAuthStateChanged(e,t,n){return this.registerStateListener(this.authStateSubscription,e,t,n)}beforeAuthStateChanged(e,t){return this.beforeStateQueue.pushCallback(e,t)}onIdTokenChanged(e,t,n){return this.registerStateListener(this.idTokenSubscription,e,t,n)}authStateReady(){return new Promise((e,t)=>{if(this.currentUser)e();else{let n=this.onAuthStateChanged(()=>{n(),e()},t)}})}async revokeAccessToken(e){if(this.currentUser){let t={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:await this.currentUser.getIdToken()};null!=this.tenantId&&(t.tenantId=this.tenantId),await ed(this,t)}}toJSON(){return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:this._currentUser?.toJSON()}}async _setRedirectUser(e,t){let n=await this.getOrInitRedirectPersistenceManager(t);return null===e?n.removeCurrentUser():n.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){let t=e&&eI(e)||this._popupRedirectResolver;k(t,this,"argument-error"),this.redirectPersistenceManager=await ew.create(this,[eI(t._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){return(this._isInitialized&&await this.queue(async()=>{}),this._currentUser?._redirectEventId===e)?this._currentUser:this.redirectUser?._redirectEventId===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);let e=this.currentUser?.uid??null;this.lastNotifiedUid!==e&&(this.lastNotifiedUid=e,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,t,n,i){if(this._deleted)return()=>{};let r="function"==typeof t?t:t.next.bind(t),s=!1,a=this._isInitialized?Promise.resolve():this._initializationPromise;if(k(a,this,"internal-error"),a.then(()=>{s||r(this.currentUser)}),"function"==typeof t){let r=e.addObserver(t,n,i);return()=>{s=!0,r()}}{let n=e.addObserver(t);return()=>{s=!0,n()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return k(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=eb(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){let e={"X-Client-Version":this.clientVersion};this.app.options.appId&&(e["X-Firebase-gmpid"]=this.app.options.appId);let t=await this.heartbeatServiceProvider.getImmediate({optional:!0})?.getHeartbeatsHeader();t&&(e["X-Firebase-Client"]=t);let n=await this._getAppCheckToken();return n&&(e["X-Firebase-AppCheck"]=n),e}async _getAppCheckToken(){if((0,r.rh)(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;let e=await this.appCheckServiceProvider.getImmediate({optional:!0})?.getToken();return e?.error&&v(`Error while retrieving App Check token: ${e.error}`),e?.token}}function eV(e){return(0,s.m9)(e)}class eF{constructor(e){this.auth=e,this.observer=null,this.addObserver=(0,s.ne)(e=>this.observer=e)}get next(){return k(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
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
 */let ex={async loadJS(){throw Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function eH(e){return ex.loadJS(e)}function ej(e){return`__${e}${Math.floor(1e6*Math.random())}`}class eq{constructor(e){this.auth=e,this.counter=1e12,this._widgets=new Map}render(e,t){let n=this.counter;return this._widgets.set(n,new eG(e,this.auth.name,t||{})),this.counter++,n}reset(e){let t=e||1e12;this._widgets.get(t)?.delete(),this._widgets.delete(t)}getResponse(e){return this._widgets.get(e||1e12)?.getResponse()||""}async execute(e){return this._widgets.get(e||1e12)?.execute(),""}}class ez{constructor(){this.enterprise=new eW}ready(e){e()}execute(e,t){return Promise.resolve("token")}render(e,t){return""}}class eW{ready(e){e()}execute(e,t){return Promise.resolve("token")}render(e,t){return""}}class eG{constructor(e,t,n){this.params=n,this.timerId=null,this.deleted=!1,this.responseToken=null,this.clickHandler=()=>{this.execute()};let i="string"==typeof e?document.getElementById(e):e;k(i,"argument-error",{appName:t}),this.container=i,this.isVisible="invisible"!==this.params.size,this.isVisible?this.execute():this.container.addEventListener("click",this.clickHandler)}getResponse(){return this.checkIfDeleted(),this.responseToken}delete(){this.checkIfDeleted(),this.deleted=!0,this.timerId&&(clearTimeout(this.timerId),this.timerId=null),this.container.removeEventListener("click",this.clickHandler)}execute(){this.checkIfDeleted(),this.timerId||(this.timerId=window.setTimeout(()=>{this.responseToken=function(e){let t=[],n="1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";for(let e=0;e<50;e++)t.push(n.charAt(Math.floor(Math.random()*n.length)));return t.join("")}(0);let{callback:e,"expired-callback":t}=this.params;if(e)try{e(this.responseToken)}catch(e){}this.timerId=window.setTimeout(()=>{if(this.timerId=null,this.responseToken=null,t)try{t()}catch(e){}this.isVisible&&this.execute()},6e4)},500))}checkIfDeleted(){if(this.deleted)throw Error("reCAPTCHA mock was already deleted!")}}let eK="NO_RECAPTCHA",e$="onFirebaseAuthREInstanceReady";class eB{constructor(e){this.type="recaptcha-enterprise",this.auth=eV(e)}async verify(e="verify",t=!1){async function n(e){if(!t){if(null==e.tenantId&&null!=e._agentRecaptchaConfig)return e._agentRecaptchaConfig.siteKey;if(null!=e.tenantId&&void 0!==e._tenantRecaptchaConfigs[e.tenantId])return e._tenantRecaptchaConfigs[e.tenantId].siteKey}return new Promise(async(t,n)=>{J(e,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}).then(i=>{if(void 0===i.recaptchaKey)n(Error("recaptcha Enterprise site key undefined"));else{let n=new $(i);return null==e.tenantId?e._agentRecaptchaConfig=n:e._tenantRecaptchaConfigs[e.tenantId]=n,t(n.siteKey)}}).catch(e=>{n(e)})})}function i(t,n,i){let r=window.grecaptcha;K(r)?r.enterprise.ready(()=>{r.enterprise.execute(t,{action:e}).then(e=>{n(e)}).catch(()=>{n(eK)})}):i(Error("No reCAPTCHA enterprise script loaded."))}return this.auth.settings.appVerificationDisabledForTesting?new ez().execute("siteKey",{action:"verify"}):new Promise((e,r)=>{n(this.auth).then(async n=>{if(!t&&K(window.grecaptcha)&&eB.scriptInjectionDeferred)await eB.scriptInjectionDeferred.promise,i(n,e,r);else{if("undefined"==typeof window){r(Error("RecaptchaVerifier is only supported in browser"));return}let t=ex.recaptchaEnterpriseScript;0!==t.length&&(t+=n+`&onload=${e$}`),eB.scriptInjectionDeferred=new s.BH,window[e$]=()=>{eB.scriptInjectionDeferred?.resolve()},eH(t).then(()=>eB.scriptInjectionDeferred?.promise).then(()=>{i(n,e,r)}).catch(e=>{r(e)})}}).catch(e=>{r(e)})})}}async function eJ(e,t,n,i=!1,r=!1){let s;let a=new eB(e);if(r)s=eK;else try{s=await a.verify(n)}catch(e){s=await a.verify(n,!0)}let o={...t};if("mfaSmsEnrollment"===n||"mfaSmsSignIn"===n){if("phoneEnrollmentInfo"in o){let e=o.phoneEnrollmentInfo.phoneNumber,t=o.phoneEnrollmentInfo.recaptchaToken;Object.assign(o,{phoneEnrollmentInfo:{phoneNumber:e,recaptchaToken:t,captchaResponse:s,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}else if("phoneSignInInfo"in o){let e=o.phoneSignInInfo.recaptchaToken;Object.assign(o,{phoneSignInInfo:{recaptchaToken:e,captchaResponse:s,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}return o}return i?Object.assign(o,{captchaResp:s}):Object.assign(o,{captchaResponse:s}),Object.assign(o,{clientType:"CLIENT_TYPE_WEB"}),Object.assign(o,{recaptchaVersion:"RECAPTCHA_ENTERPRISE"}),o}async function eY(e,t,n,i,r){if("EMAIL_PASSWORD_PROVIDER"===r){if(!e._getRecaptchaConfig()?.isProviderEnabled("EMAIL_PASSWORD_PROVIDER"))return i(e,t).catch(async r=>{if("auth/missing-recaptcha-token"!==r.code)return Promise.reject(r);{console.log(`${n} is protected by reCAPTCHA Enterprise for this project. Automatically triggering the reCAPTCHA flow and restarting the flow.`);let r=await eJ(e,t,n,"getOobCode"===n);return i(e,r)}});{let r=await eJ(e,t,n,"getOobCode"===n);return i(e,r)}}if("PHONE_PROVIDER"!==r)return Promise.reject(r+" provider is not supported.");if(e._getRecaptchaConfig()?.isProviderEnabled("PHONE_PROVIDER")){let r=await eJ(e,t,n);return i(e,r).catch(async r=>{if(e._getRecaptchaConfig()?.getProviderEnforcementState("PHONE_PROVIDER")==="AUDIT"&&("auth/missing-recaptcha-token"===r.code||"auth/invalid-app-credential"===r.code)){console.log(`Failed to verify with reCAPTCHA Enterprise. Automatically triggering the reCAPTCHA v2 flow to complete the ${n} flow.`);let r=await eJ(e,t,n,!1,!0);return i(e,r)}return Promise.reject(r)})}{let r=await eJ(e,t,n,!1,!0);return i(e,r)}}async function eX(e){let t=eV(e),n=new $(await J(t,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}));null==t.tenantId?t._agentRecaptchaConfig=n:t._tenantRecaptchaConfigs[t.tenantId]=n,n.isAnyProviderEnabled()&&new eB(t).verify()}/**
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
 */function eQ(e,t){let n=(0,r.qX)(e,"auth");if(n.isInitialized()){let e=n.getImmediate(),i=n.getOptions();if((0,s.vZ)(i,t??{}))return e;w(e,"already-initialized")}return n.initialize({options:t})}function eZ(e,t,n){let i=eV(e);k(/^https?:\/\//.test(t),i,"invalid-emulator-scheme");let r=!!n?.disableWarnings,a=e0(t),{host:o,port:c}=function(e){let t=e0(e),n=/(\/\/)?([^?#/]+)/.exec(e.substr(t.length));if(!n)return{host:"",port:null};let i=n[2].split("@").pop()||"",r=/^(\[[^\]]+\])(:|$)/.exec(i);if(r){let e=r[1];return{host:e,port:e1(i.substr(e.length+1))}}{let[e,t]=i.split(":");return{host:e,port:e1(t)}}}(t),u=null===c?"":`:${c}`,l={url:`${a}//${o}${u}/`},h=Object.freeze({host:o,port:c,protocol:a.replace(":",""),options:Object.freeze({disableWarnings:r})});if(!i._canInitEmulator){k(i.config.emulator&&i.emulatorConfig,i,"emulator-config-failed"),k((0,s.vZ)(l,i.config.emulator)&&(0,s.vZ)(h,i.emulatorConfig),i,"emulator-config-failed");return}i.config.emulator=l,i.emulatorConfig=h,i.settings.appVerificationDisabledForTesting=!0,(0,s.Xx)(o)?(0,s.Uo)(`${a}//${o}${u}`):r||function(){function e(){let e=document.createElement("p"),t=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",t.position="fixed",t.width="100%",t.backgroundColor="#ffffff",t.border=".1em solid #000000",t.color="#b50000",t.bottom="0px",t.left="0px",t.margin="0px",t.zIndex="10000",t.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}"undefined"!=typeof console&&"function"==typeof console.info&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),"undefined"!=typeof window&&"undefined"!=typeof document&&("loading"===document.readyState?window.addEventListener("DOMContentLoaded",e):e())}()}function e0(e){let t=e.indexOf(":");return t<0?"":e.substr(0,t+1)}function e1(e){if(!e)return null;let t=Number(e);return isNaN(t)?null:t}eB.scriptInjectionDeferred=null;/**
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
 */class e9{constructor(e,t){this.providerId=e,this.signInMethod=t}toJSON(){return P("not implemented")}_getIdTokenResponse(e){return P("not implemented")}_linkToIdToken(e,t){return P("not implemented")}_getReauthenticationResolver(e){return P("not implemented")}}/**
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
 */async function e3(e,t){return x(e,"POST","/v1/accounts:resetPassword",F(e,t))}async function e2(e,t){return x(e,"POST","/v1/accounts:update",t)}async function e4(e,t){return x(e,"POST","/v1/accounts:signUp",t)}async function e6(e,t){return x(e,"POST","/v1/accounts:update",F(e,t))}/**
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
 */async function e5(e,t){return j(e,"POST","/v1/accounts:signInWithPassword",F(e,t))}async function e8(e,t){return x(e,"POST","/v1/accounts:sendOobCode",F(e,t))}async function e7(e,t){return e8(e,t)}async function te(e,t){return e8(e,t)}async function tt(e,t){return e8(e,t)}async function tn(e,t){return e8(e,t)}/**
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
 */async function ti(e,t){return j(e,"POST","/v1/accounts:signInWithEmailLink",F(e,t))}async function tr(e,t){return j(e,"POST","/v1/accounts:signInWithEmailLink",F(e,t))}/**
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
 */class ts extends e9{constructor(e,t,n,i=null){super("password",n),this._email=e,this._password=t,this._tenantId=i}static _fromEmailAndPassword(e,t){return new ts(e,t,"password")}static _fromEmailAndCode(e,t,n=null){return new ts(e,t,"emailLink",n)}toJSON(){return{email:this._email,password:this._password,signInMethod:this.signInMethod,tenantId:this._tenantId}}static fromJSON(e){let t="string"==typeof e?JSON.parse(e):e;if(t?.email&&t?.password){if("password"===t.signInMethod)return this._fromEmailAndPassword(t.email,t.password);if("emailLink"===t.signInMethod)return this._fromEmailAndCode(t.email,t.password,t.tenantId)}return null}async _getIdTokenResponse(e){switch(this.signInMethod){case"password":return eY(e,{returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"},"signInWithPassword",e5,"EMAIL_PASSWORD_PROVIDER");case"emailLink":return ti(e,{email:this._email,oobCode:this._password});default:w(e,"internal-error")}}async _linkToIdToken(e,t){switch(this.signInMethod){case"password":return eY(e,{idToken:t,returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"},"signUpPassword",e4,"EMAIL_PASSWORD_PROVIDER");case"emailLink":return tr(e,{idToken:t,email:this._email,oobCode:this._password});default:w(e,"internal-error")}}_getReauthenticationResolver(e){return this._getIdTokenResponse(e)}}/**
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
 */async function ta(e,t){return j(e,"POST","/v1/accounts:signInWithIdp",F(e,t))}class to extends e9{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){let t=new to(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(t.idToken=e.idToken),e.accessToken&&(t.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(t.nonce=e.nonce),e.pendingToken&&(t.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(t.accessToken=e.oauthToken,t.secret=e.oauthTokenSecret):w("argument-error"),t}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){let{providerId:t,signInMethod:n,...i}="string"==typeof e?JSON.parse(e):e;if(!t||!n)return null;let r=new to(t,n);return r.idToken=i.idToken||void 0,r.accessToken=i.accessToken||void 0,r.secret=i.secret,r.nonce=i.nonce,r.pendingToken=i.pendingToken||null,r}_getIdTokenResponse(e){return ta(e,this.buildRequest())}_linkToIdToken(e,t){let n=this.buildRequest();return n.idToken=t,ta(e,n)}_getReauthenticationResolver(e){let t=this.buildRequest();return t.autoCreate=!1,ta(e,t)}buildRequest(){let e={requestUri:"http://localhost",returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{let t={};this.idToken&&(t.id_token=this.idToken),this.accessToken&&(t.access_token=this.accessToken),this.secret&&(t.oauth_token_secret=this.secret),t.providerId=this.providerId,this.nonce&&!this.pendingToken&&(t.nonce=this.nonce),e.postBody=(0,s.xO)(t)}return e}}/**
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
 */async function tc(e,t){return x(e,"POST","/v1/accounts:sendVerificationCode",F(e,t))}async function tu(e,t){return j(e,"POST","/v1/accounts:signInWithPhoneNumber",F(e,t))}async function tl(e,t){let n=await j(e,"POST","/v1/accounts:signInWithPhoneNumber",F(e,t));if(n.temporaryProof)throw W(e,"account-exists-with-different-credential",n);return n}let th={USER_NOT_FOUND:"user-not-found"};async function td(e,t){return j(e,"POST","/v1/accounts:signInWithPhoneNumber",F(e,{...t,operation:"REAUTH"}),th)}/**
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
 */class tp extends e9{constructor(e){super("phone","phone"),this.params=e}static _fromVerification(e,t){return new tp({verificationId:e,verificationCode:t})}static _fromTokenResponse(e,t){return new tp({phoneNumber:e,temporaryProof:t})}_getIdTokenResponse(e){return tu(e,this._makeVerificationRequest())}_linkToIdToken(e,t){return tl(e,{idToken:t,...this._makeVerificationRequest()})}_getReauthenticationResolver(e){return td(e,this._makeVerificationRequest())}_makeVerificationRequest(){let{temporaryProof:e,phoneNumber:t,verificationId:n,verificationCode:i}=this.params;return e&&t?{temporaryProof:e,phoneNumber:t}:{sessionInfo:n,code:i}}toJSON(){let e={providerId:this.providerId};return this.params.phoneNumber&&(e.phoneNumber=this.params.phoneNumber),this.params.temporaryProof&&(e.temporaryProof=this.params.temporaryProof),this.params.verificationCode&&(e.verificationCode=this.params.verificationCode),this.params.verificationId&&(e.verificationId=this.params.verificationId),e}static fromJSON(e){"string"==typeof e&&(e=JSON.parse(e));let{verificationId:t,verificationCode:n,phoneNumber:i,temporaryProof:r}=e;return n||t||i||r?new tp({verificationId:t,verificationCode:n,phoneNumber:i,temporaryProof:r}):null}}class tf{constructor(e){let t=(0,s.zd)((0,s.pd)(e)),n=t.apiKey??null,i=t.oobCode??null,r=/**
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
 */function(e){switch(e){case"recoverEmail":return"RECOVER_EMAIL";case"resetPassword":return"PASSWORD_RESET";case"signIn":return"EMAIL_SIGNIN";case"verifyEmail":return"VERIFY_EMAIL";case"verifyAndChangeEmail":return"VERIFY_AND_CHANGE_EMAIL";case"revertSecondFactorAddition":return"REVERT_SECOND_FACTOR_ADDITION";default:return null}}(t.mode??null);k(n&&i&&r,"argument-error"),this.apiKey=n,this.operation=r,this.code=i,this.continueUrl=t.continueUrl??null,this.languageCode=t.lang??null,this.tenantId=t.tenantId??null}static parseLink(e){let t=function(e){let t=(0,s.zd)((0,s.pd)(e)).link,n=t?(0,s.zd)((0,s.pd)(t)).deep_link_id:null,i=(0,s.zd)((0,s.pd)(e)).deep_link_id;return(i?(0,s.zd)((0,s.pd)(i)).link:null)||i||n||t||e}(e);try{return new tf(t)}catch{return null}}}function tm(e){return tf.parseLink(e)}/**
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
 */class tg{constructor(){this.providerId=tg.PROVIDER_ID}static credential(e,t){return ts._fromEmailAndPassword(e,t)}static credentialWithLink(e,t){let n=tf.parseLink(t);return k(n,"argument-error"),ts._fromEmailAndCode(e,n.code,n.tenantId)}}tg.PROVIDER_ID="password",tg.EMAIL_PASSWORD_SIGN_IN_METHOD="password",tg.EMAIL_LINK_SIGN_IN_METHOD="emailLink";/**
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
 */class tI{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
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
 */class t_ extends tI{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}class tv extends t_{static credentialFromJSON(e){let t="string"==typeof e?JSON.parse(e):e;return k("providerId"in t&&"signInMethod"in t,"argument-error"),to._fromParams(t)}credential(e){return this._credential({...e,nonce:e.rawNonce})}_credential(e){return k(e.idToken||e.accessToken,"argument-error"),to._fromParams({...e,providerId:this.providerId,signInMethod:this.providerId})}static credentialFromResult(e){return tv.oauthCredentialFromTaggedObject(e)}static credentialFromError(e){return tv.oauthCredentialFromTaggedObject(e.customData||{})}static oauthCredentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;let{oauthIdToken:t,oauthAccessToken:n,oauthTokenSecret:i,pendingToken:r,nonce:s,providerId:a}=e;if(!n&&!i&&!t&&!r||!a)return null;try{return new tv(a)._credential({idToken:t,accessToken:n,nonce:s,pendingToken:r})}catch(e){return null}}}/**
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
 */class tT extends t_{constructor(){super("facebook.com")}static credential(e){return to._fromParams({providerId:tT.PROVIDER_ID,signInMethod:tT.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return tT.credentialFromTaggedObject(e)}static credentialFromError(e){return tT.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return tT.credential(e.oauthAccessToken)}catch{return null}}}tT.FACEBOOK_SIGN_IN_METHOD="facebook.com",tT.PROVIDER_ID="facebook.com";/**
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
 */class tw extends t_{constructor(){super("google.com"),this.addScope("profile")}static credential(e,t){return to._fromParams({providerId:tw.PROVIDER_ID,signInMethod:tw.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:t})}static credentialFromResult(e){return tw.credentialFromTaggedObject(e)}static credentialFromError(e){return tw.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;let{oauthIdToken:t,oauthAccessToken:n}=e;if(!t&&!n)return null;try{return tw.credential(t,n)}catch{return null}}}tw.GOOGLE_SIGN_IN_METHOD="google.com",tw.PROVIDER_ID="google.com";/**
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
 */class tE extends t_{constructor(){super("github.com")}static credential(e){return to._fromParams({providerId:tE.PROVIDER_ID,signInMethod:tE.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return tE.credentialFromTaggedObject(e)}static credentialFromError(e){return tE.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return tE.credential(e.oauthAccessToken)}catch{return null}}}tE.GITHUB_SIGN_IN_METHOD="github.com",tE.PROVIDER_ID="github.com";class ty extends e9{constructor(e,t){super(e,e),this.pendingToken=t}_getIdTokenResponse(e){return ta(e,this.buildRequest())}_linkToIdToken(e,t){let n=this.buildRequest();return n.idToken=t,ta(e,n)}_getReauthenticationResolver(e){let t=this.buildRequest();return t.autoCreate=!1,ta(e,t)}toJSON(){return{signInMethod:this.signInMethod,providerId:this.providerId,pendingToken:this.pendingToken}}static fromJSON(e){let{providerId:t,signInMethod:n,pendingToken:i}="string"==typeof e?JSON.parse(e):e;return t&&n&&i&&t===n?new ty(t,i):null}static _create(e,t){return new ty(e,t)}buildRequest(){return{requestUri:"http://localhost",returnSecureToken:!0,pendingToken:this.pendingToken}}}class tA extends tI{constructor(e){k(e.startsWith("saml."),"argument-error"),super(e)}static credentialFromResult(e){return tA.samlCredentialFromTaggedObject(e)}static credentialFromError(e){return tA.samlCredentialFromTaggedObject(e.customData||{})}static credentialFromJSON(e){let t=ty.fromJSON(e);return k(t,"argument-error"),t}static samlCredentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;let{pendingToken:t,providerId:n}=e;if(!t||!n)return null;try{return ty._create(n,t)}catch(e){return null}}}/**
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
 */class tS extends t_{constructor(){super("twitter.com")}static credential(e,t){return to._fromParams({providerId:tS.PROVIDER_ID,signInMethod:tS.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:t})}static credentialFromResult(e){return tS.credentialFromTaggedObject(e)}static credentialFromError(e){return tS.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;let{oauthAccessToken:t,oauthTokenSecret:n}=e;if(!t||!n)return null;try{return tS.credential(t,n)}catch{return null}}}/**
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
 */async function tR(e,t){return j(e,"POST","/v1/accounts:signUp",F(e,t))}tS.TWITTER_SIGN_IN_METHOD="twitter.com",tS.PROVIDER_ID="twitter.com";/**
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
 */class tk{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,t,n,i=!1){return new tk({user:await em._fromIdTokenResponse(e,n,i),providerId:tP(n),_tokenResponse:n,operationType:t})}static async _forOperation(e,t,n){return await e._updateTokensIfNecessary(n,!0),new tk({user:e,providerId:tP(n),_tokenResponse:n,operationType:t})}}function tP(e){return e.providerId?e.providerId:"phoneNumber"in e?"phone":null}/**
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
 */async function tN(e){if((0,r.rh)(e.app))return Promise.reject(A(e));let t=eV(e);if(await t._initializationPromise,t.currentUser?.isAnonymous)return new tk({user:t.currentUser,providerId:null,operationType:"signIn"});let n=await tR(t,{returnSecureToken:!0}),i=await tk._fromIdTokenResponse(t,"signIn",n,!0);return await t._updateCurrentUser(i.user),i}/**
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
 */class tO extends s.ZR{constructor(e,t,n,i){super(t.code,t.message),this.operationType=n,this.user=i,Object.setPrototypeOf(this,tO.prototype),this.customData={appName:e.name,tenantId:e.tenantId??void 0,_serverResponse:t.customData._serverResponse,operationType:n}}static _fromErrorAndOperation(e,t,n,i){return new tO(e,t,n,i)}}function tC(e,t,n,i){return("reauthenticate"===t?n._getReauthenticationResolver(e):n._getIdTokenResponse(e)).catch(n=>{if("auth/multi-factor-auth-required"===n.code)throw tO._fromErrorAndOperation(e,n,t,i);throw n})}/**
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
 */function tb(e){return new Set(e.map(({providerId:e})=>e).filter(e=>!!e))}/**
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
 */async function tL(e,t){let n=(0,s.m9)(e);await tU(!0,n,t);let{providerUserInfo:i}=await X(n.auth,{idToken:await n.getIdToken(),deleteProvider:[t]}),r=tb(i||[]);return n.providerData=n.providerData.filter(e=>r.has(e.providerId)),r.has("phone")||(n.phoneNumber=null),await n.auth._persistUserIfCurrent(n),n}async function tD(e,t,n=!1){let i=await es(e,t._linkToIdToken(e.auth,await e.getIdToken()),n);return tk._forOperation(e,"link",i)}async function tU(e,t,n){await ec(t),k(tb(t.providerData).has(n)===e,t.auth,!1===e?"provider-already-linked":"no-such-provider")}/**
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
 */async function tM(e,t,n=!1){let{auth:i}=e;if((0,r.rh)(i.app))return Promise.reject(A(i));let s="reauthenticate";try{let r=await es(e,tC(i,s,t,e),n);k(r.idToken,i,"internal-error");let a=ei(r.idToken);k(a,i,"internal-error");let{sub:o}=a;return k(e.uid===o,i,"user-mismatch"),tk._forOperation(e,s,r)}catch(e){throw e?.code==="auth/user-not-found"&&w(i,"user-mismatch"),e}}/**
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
 */async function tV(e,t,n=!1){if((0,r.rh)(e.app))return Promise.reject(A(e));let i="signIn",s=await tC(e,i,t),a=await tk._fromIdTokenResponse(e,i,s);return n||await e._updateCurrentUser(a.user),a}async function tF(e,t){return tV(eV(e),t)}async function tx(e,t){let n=(0,s.m9)(e);return await tU(!1,n,t.providerId),tD(n,t)}async function tH(e,t){return tM((0,s.m9)(e),t)}/**
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
 */async function tj(e,t){return j(e,"POST","/v1/accounts:signInWithCustomToken",F(e,t))}/**
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
 */async function tq(e,t){if((0,r.rh)(e.app))return Promise.reject(A(e));let n=eV(e),i=await tj(n,{token:t,returnSecureToken:!0}),s=await tk._fromIdTokenResponse(n,"signIn",i);return await n._updateCurrentUser(s.user),s}/**
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
 */class tz{constructor(e,t){this.factorId=e,this.uid=t.mfaEnrollmentId,this.enrollmentTime=new Date(t.enrolledAt).toUTCString(),this.displayName=t.displayName}static _fromServerResponse(e,t){return"phoneInfo"in t?tW._fromServerResponse(e,t):"totpInfo"in t?tG._fromServerResponse(e,t):w(e,"internal-error")}}class tW extends tz{constructor(e){super("phone",e),this.phoneNumber=e.phoneInfo}static _fromServerResponse(e,t){return new tW(t)}}class tG extends tz{constructor(e){super("totp",e)}static _fromServerResponse(e,t){return new tG(t)}}/**
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
 */function tK(e,t,n){k(n.url?.length>0,e,"invalid-continue-uri"),k(void 0===n.dynamicLinkDomain||n.dynamicLinkDomain.length>0,e,"invalid-dynamic-link-domain"),k(void 0===n.linkDomain||n.linkDomain.length>0,e,"invalid-hosting-link-domain"),t.continueUrl=n.url,t.dynamicLinkDomain=n.dynamicLinkDomain,t.linkDomain=n.linkDomain,t.canHandleCodeInApp=n.handleCodeInApp,n.iOS&&(k(n.iOS.bundleId.length>0,e,"missing-ios-bundle-id"),t.iOSBundleId=n.iOS.bundleId),n.android&&(k(n.android.packageName.length>0,e,"missing-android-pkg-name"),t.androidInstallApp=n.android.installApp,t.androidMinimumVersionCode=n.android.minimumVersion,t.androidPackageName=n.android.packageName)}/**
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
 */async function t$(e){let t=eV(e);t._getPasswordPolicyInternal()&&await t._updatePasswordPolicy()}async function tB(e,t,n){let i=eV(e),r={requestType:"PASSWORD_RESET",email:t,clientType:"CLIENT_TYPE_WEB"};n&&tK(i,r,n),await eY(i,r,"getOobCode",te,"EMAIL_PASSWORD_PROVIDER")}async function tJ(e,t,n){await e3((0,s.m9)(e),{oobCode:t,newPassword:n}).catch(async t=>{throw"auth/password-does-not-meet-requirements"===t.code&&t$(e),t})}async function tY(e,t){await e6((0,s.m9)(e),{oobCode:t})}async function tX(e,t){let n=(0,s.m9)(e),i=await e3(n,{oobCode:t}),r=i.requestType;switch(k(r,n,"internal-error"),r){case"EMAIL_SIGNIN":break;case"VERIFY_AND_CHANGE_EMAIL":k(i.newEmail,n,"internal-error");break;case"REVERT_SECOND_FACTOR_ADDITION":k(i.mfaInfo,n,"internal-error");default:k(i.email,n,"internal-error")}let a=null;return i.mfaInfo&&(a=tz._fromServerResponse(eV(n),i.mfaInfo)),{data:{email:("VERIFY_AND_CHANGE_EMAIL"===i.requestType?i.newEmail:i.email)||null,previousEmail:("VERIFY_AND_CHANGE_EMAIL"===i.requestType?i.email:i.newEmail)||null,multiFactorInfo:a},operation:r}}async function tQ(e,t){let{data:n}=await tX((0,s.m9)(e),t);return n.email}async function tZ(e,t,n){if((0,r.rh)(e.app))return Promise.reject(A(e));let i=eV(e),s=eY(i,{returnSecureToken:!0,email:t,password:n,clientType:"CLIENT_TYPE_WEB"},"signUpPassword",tR,"EMAIL_PASSWORD_PROVIDER"),a=await s.catch(t=>{throw"auth/password-does-not-meet-requirements"===t.code&&t$(e),t}),o=await tk._fromIdTokenResponse(i,"signIn",a);return await i._updateCurrentUser(o.user),o}function t0(e,t,n){return(0,r.rh)(e.app)?Promise.reject(A(e)):tF((0,s.m9)(e),tg.credential(t,n)).catch(async t=>{throw"auth/password-does-not-meet-requirements"===t.code&&t$(e),t})}/**
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
 */async function t1(e,t,n){let i=eV(e),r={requestType:"EMAIL_SIGNIN",email:t,clientType:"CLIENT_TYPE_WEB"};k(n.handleCodeInApp,i,"argument-error"),n&&tK(i,r,n),await eY(i,r,"getOobCode",tt,"EMAIL_PASSWORD_PROVIDER")}function t9(e,t){let n=tf.parseLink(t);return n?.operation==="EMAIL_SIGNIN"}async function t3(e,t,n){if((0,r.rh)(e.app))return Promise.reject(A(e));let i=(0,s.m9)(e),a=tg.credentialWithLink(t,n||N());return k(a._tenantId===(i.tenantId||null),i,"tenant-id-mismatch"),tF(i,a)}/**
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
 */async function t2(e,t){return x(e,"POST","/v1/accounts:createAuthUri",F(e,t))}/**
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
 */async function t4(e,t){let n=O()?N():"http://localhost",{signinMethods:i}=await t2((0,s.m9)(e),{identifier:t,continueUri:n});return i||[]}async function t6(e,t){let n=(0,s.m9)(e),i={requestType:"VERIFY_EMAIL",idToken:await e.getIdToken()};t&&tK(n.auth,i,t);let{email:r}=await e7(n.auth,i);r!==e.email&&await e.reload()}async function t5(e,t,n){let i=(0,s.m9)(e),r={requestType:"VERIFY_AND_CHANGE_EMAIL",idToken:await e.getIdToken(),newEmail:t};n&&tK(i.auth,r,n);let{email:a}=await tn(i.auth,r);a!==e.email&&await e.reload()}/**
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
 */async function t8(e,t){return x(e,"POST","/v1/accounts:update",t)}/**
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
 */async function t7(e,{displayName:t,photoURL:n}){if(void 0===t&&void 0===n)return;let i=(0,s.m9)(e),r=await i.getIdToken(),a=await es(i,t8(i.auth,{idToken:r,displayName:t,photoUrl:n,returnSecureToken:!0}));i.displayName=a.displayName||null,i.photoURL=a.photoUrl||null;let o=i.providerData.find(({providerId:e})=>"password"===e);o&&(o.displayName=i.displayName,o.photoURL=i.photoURL),await i._updateTokensIfNecessary(a)}function ne(e,t){let n=(0,s.m9)(e);return(0,r.rh)(n.auth.app)?Promise.reject(A(n.auth)):nn(n,t,null)}function nt(e,t){return nn((0,s.m9)(e),null,t)}async function nn(e,t,n){let{auth:i}=e,r={idToken:await e.getIdToken(),returnSecureToken:!0};t&&(r.email=t),n&&(r.password=n);let s=await es(e,e2(i,r));await e._updateTokensIfNecessary(s,!0)}class ni{constructor(e,t,n={}){this.isNewUser=e,this.providerId=t,this.profile=n}}class nr extends ni{constructor(e,t,n,i){super(e,t,n),this.username=i}}class ns extends ni{constructor(e,t){super(e,"facebook.com",t)}}class na extends nr{constructor(e,t){super(e,"github.com",t,"string"==typeof t?.login?t?.login:null)}}class no extends ni{constructor(e,t){super(e,"google.com",t)}}class nc extends nr{constructor(e,t,n){super(e,"twitter.com",t,n)}}function nu(e){let{user:t,_tokenResponse:n}=e;return t.isAnonymous&&!n?{providerId:null,isNewUser:!1,profile:null}:/**
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
 */function(e){if(!e)return null;let{providerId:t}=e,n=e.rawUserInfo?JSON.parse(e.rawUserInfo):{},i=e.isNewUser||"identitytoolkit#SignupNewUserResponse"===e.kind;if(!t&&e?.idToken){let t=ei(e.idToken)?.firebase?.sign_in_provider;if(t)return new ni(i,"anonymous"!==t&&"custom"!==t?t:null)}if(!t)return null;switch(t){case"facebook.com":return new ns(i,n);case"github.com":return new na(i,n);case"google.com":return new no(i,n);case"twitter.com":return new nc(i,n,e.screenName||null);case"custom":case"anonymous":return new ni(i,null);default:return new ni(i,t,n)}}(n)}/**
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
 */function nl(e,t){return(0,s.m9)(e).setPersistence(t)}function nh(e){return eX(e)}async function nd(e,t){return eV(e).validatePassword(t)}function np(e,t,n,i){return(0,s.m9)(e).onIdTokenChanged(t,n,i)}function nf(e,t,n){return(0,s.m9)(e).beforeAuthStateChanged(t,n)}function nm(e,t,n,i){return(0,s.m9)(e).onAuthStateChanged(t,n,i)}function ng(e){(0,s.m9)(e).useDeviceLanguage()}function nI(e,t){return(0,s.m9)(e).updateCurrentUser(t)}function n_(e){return(0,s.m9)(e).signOut()}function nv(e,t){return eV(e).revokeAccessToken(t)}async function nT(e){return(0,s.m9)(e).delete()}/**
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
 */class nw{constructor(e,t,n){this.type=e,this.credential=t,this.user=n}static _fromIdtoken(e,t){return new nw("enroll",e,t)}static _fromMfaPendingCredential(e){return new nw("signin",e)}toJSON(){return{multiFactorSession:{["enroll"===this.type?"idToken":"pendingCredential"]:this.credential}}}static fromJSON(e){if(e?.multiFactorSession){if(e.multiFactorSession?.pendingCredential)return nw._fromMfaPendingCredential(e.multiFactorSession.pendingCredential);if(e.multiFactorSession?.idToken)return nw._fromIdtoken(e.multiFactorSession.idToken)}return null}}/**
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
 */class nE{constructor(e,t,n){this.session=e,this.hints=t,this.signInResolver=n}static _fromError(e,t){let n=eV(e),i=t.customData._serverResponse,r=(i.mfaInfo||[]).map(e=>tz._fromServerResponse(n,e));k(i.mfaPendingCredential,n,"internal-error");let s=nw._fromMfaPendingCredential(i.mfaPendingCredential);return new nE(s,r,async e=>{let r=await e._process(n,s);delete i.mfaInfo,delete i.mfaPendingCredential;let a={...i,idToken:r.idToken,refreshToken:r.refreshToken};switch(t.operationType){case"signIn":let o=await tk._fromIdTokenResponse(n,t.operationType,a);return await n._updateCurrentUser(o.user),o;case"reauthenticate":return k(t.user,n,"internal-error"),tk._forOperation(t.user,t.operationType,a);default:w(n,"internal-error")}})}async resolveSignIn(e){return this.signInResolver(e)}}function ny(e,t){let n=(0,s.m9)(e);return k(t.customData.operationType,n,"argument-error"),k(t.customData._serverResponse?.mfaPendingCredential,n,"argument-error"),nE._fromError(n,t)}/**
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
 */function nA(e,t){return x(e,"POST","/v2/accounts/mfaEnrollment:start",F(e,t))}class nS{constructor(e){this.user=e,this.enrolledFactors=[],e._onReload(t=>{t.mfaInfo&&(this.enrolledFactors=t.mfaInfo.map(t=>tz._fromServerResponse(e.auth,t)))})}static _fromUser(e){return new nS(e)}async getSession(){return nw._fromIdtoken(await this.user.getIdToken(),this.user)}async enroll(e,t){let n=await this.getSession(),i=await es(this.user,e._process(this.user.auth,n,t));return await this.user._updateTokensIfNecessary(i),this.user.reload()}async unenroll(e){let t="string"==typeof e?e:e.uid,n=await this.user.getIdToken();try{var i,r;let e=await es(this.user,(i=this.user.auth,r={idToken:n,mfaEnrollmentId:t},x(i,"POST","/v2/accounts/mfaEnrollment:withdraw",F(i,r))));this.enrolledFactors=this.enrolledFactors.filter(({uid:e})=>e!==t),await this.user._updateTokensIfNecessary(e),await this.user.reload()}catch(e){throw e}}}let nR=new WeakMap;function nk(e){let t=(0,s.m9)(e);return nR.has(t)||nR.set(t,nS._fromUser(t)),nR.get(t)}let nP="__sak";/**
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
 */class nN{constructor(e,t){this.storageRetriever=e,this.type=t}_isAvailable(){try{if(!this.storage)return Promise.resolve(!1);return this.storage.setItem(nP,"1"),this.storage.removeItem(nP),Promise.resolve(!0)}catch{return Promise.resolve(!1)}}_set(e,t){return this.storage.setItem(e,JSON.stringify(t)),Promise.resolve()}_get(e){let t=this.storage.getItem(e);return Promise.resolve(t?JSON.parse(t):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}class nO extends nN{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,t)=>this.onStorageEvent(e,t),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=eC(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(let t of Object.keys(this.listeners)){let n=this.storage.getItem(t),i=this.localCache[t];n!==i&&e(t,i,n)}}onStorageEvent(e,t=!1){if(!e.key){this.forAllChangedKeys((e,t,n)=>{this.notifyListeners(e,n)});return}let n=e.key;t?this.detachListener():this.stopPolling();let i=()=>{let e=this.storage.getItem(n);(t||this.localCache[n]!==e)&&this.notifyListeners(n,e)},r=this.storage.getItem(n);(0,s.w1)()&&10===document.documentMode&&r!==e.newValue&&e.newValue!==e.oldValue?setTimeout(i,10):i()}notifyListeners(e,t){this.localCache[e]=t;let n=this.listeners[e];if(n)for(let e of Array.from(n))e(t?JSON.parse(t):t)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,t,n)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:t,newValue:n}),!0)})},1e3)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,t){0===Object.keys(this.listeners).length&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),0===this.listeners[e].size&&delete this.listeners[e]),0===Object.keys(this.listeners).length&&(this.detachListener(),this.stopPolling())}async _set(e,t){await super._set(e,t),this.localCache[e]=JSON.stringify(t)}async _get(e){let t=await super._get(e);return this.localCache[e]=JSON.stringify(t),t}async _remove(e){await super._remove(e),delete this.localCache[e]}}nO.type="LOCAL";let nC=nO;function nb(e){let t=e.replace(/[\\^$.*+?()[\]{}|]/g,"\\$&"),n=RegExp(`${t}=([^;]+)`);return document.cookie.match(n)?.[1]??null}function nL(e){let t="http:"===window.location.protocol;return`${t?"__dev_":"__HOST-"}FIREBASE_${e.split(":")[3]}`}class nD{constructor(){this.type="COOKIE",this.listenerUnsubscribes=new Map}_getFinalTarget(e){let t=new URL(`${window.location.origin}/__cookies__`);return t.searchParams.set("finalTarget",e),t}async _isAvailable(){return!!("boolean"!=typeof isSecureContext||isSecureContext)&&"undefined"!=typeof navigator&&"undefined"!=typeof document&&(navigator.cookieEnabled??!0)}async _set(e,t){}async _get(e){if(!this._isAvailable())return null;let t=nL(e);if(window.cookieStore){let e=await window.cookieStore.get(t);return e?.value}return nb(t)}async _remove(e){if(!this._isAvailable()||!await this._get(e))return;let t=nL(e);document.cookie=`${t}=;Max-Age=34560000;Partitioned;Secure;SameSite=Strict;Path=/;Priority=High`,await fetch("/__cookies__",{method:"DELETE"}).catch(()=>void 0)}_addListener(e,t){if(!this._isAvailable())return;let n=nL(e);if(window.cookieStore){let e=e=>{let i=e.changed.find(e=>e.name===n);i&&t(i.value),e.deleted.find(e=>e.name===n)&&t(null)};return this.listenerUnsubscribes.set(t,()=>window.cookieStore.removeEventListener("change",e)),window.cookieStore.addEventListener("change",e)}let i=nb(n),r=setInterval(()=>{let e=nb(n);e!==i&&(t(e),i=e)},1e3);this.listenerUnsubscribes.set(t,()=>clearInterval(r))}_removeListener(e,t){let n=this.listenerUnsubscribes.get(t);n&&(n(),this.listenerUnsubscribes.delete(t))}}nD.type="COOKIE";let nU=nD;/**
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
 */class nM extends nN{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,t){}_removeListener(e,t){}}nM.type="SESSION";let nV=nM;/**
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
 */class nF{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){let t=this.receivers.find(t=>t.isListeningto(e));if(t)return t;let n=new nF(e);return this.receivers.push(n),n}isListeningto(e){return this.eventTarget===e}async handleEvent(e){let{eventId:t,eventType:n,data:i}=e.data,r=this.handlersMap[n];if(!r?.size)return;e.ports[0].postMessage({status:"ack",eventId:t,eventType:n});let s=Array.from(r).map(async t=>t(e.origin,i)),a=await Promise.all(s.map(async e=>{try{let t=await e;return{fulfilled:!0,value:t}}catch(e){return{fulfilled:!1,reason:e}}}));e.ports[0].postMessage({status:"done",eventId:t,eventType:n,response:a})}_subscribe(e,t){0===Object.keys(this.handlersMap).length&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(t)}_unsubscribe(e,t){this.handlersMap[e]&&t&&this.handlersMap[e].delete(t),t&&0!==this.handlersMap[e].size||delete this.handlersMap[e],0===Object.keys(this.handlersMap).length&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}/**
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
 */function nx(e="",t=10){let n="";for(let e=0;e<t;e++)n+=Math.floor(10*Math.random());return e+n}nF.receivers=[];/**
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
 */class nH{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,t,n=50){let i,r;let s="undefined"!=typeof MessageChannel?new MessageChannel:null;if(!s)throw Error("connection_unavailable");return new Promise((a,o)=>{let c=nx("",20);s.port1.start();let u=setTimeout(()=>{o(Error("unsupported_event"))},n);r={messageChannel:s,onMessage(e){if(e.data.eventId===c)switch(e.data.status){case"ack":clearTimeout(u),i=setTimeout(()=>{o(Error("timeout"))},3e3);break;case"done":clearTimeout(i),a(e.data.response);break;default:clearTimeout(u),clearTimeout(i),o(Error("invalid_response"))}}},this.handlers.add(r),s.port1.addEventListener("message",r.onMessage),this.target.postMessage({eventType:e,eventId:c,data:t},[s.port2])}).finally(()=>{r&&this.removeMessageHandler(r)})}}/**
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
 */function nj(){return window}/**
 * @license
 * Copyright 2020 Google LLC.
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
 */function nq(){return void 0!==nj().WorkerGlobalScope&&"function"==typeof nj().importScripts}async function nz(){if(!navigator?.serviceWorker)return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}/**
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
 */let nW="firebaseLocalStorageDb",nG="firebaseLocalStorage",nK="fbase_key";class n${constructor(e){this.request=e}toPromise(){return new Promise((e,t)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{t(this.request.error)})})}}function nB(e,t){return e.transaction([nG],t?"readwrite":"readonly").objectStore(nG)}async function nJ(e,t,n){return new n$(nB(e,!0).put({[nK]:t,value:n})).toPromise()}async function nY(e,t){let n=nB(e,!1).get(t),i=await new n$(n).toPromise();return void 0===i?null:i.value}function nX(e,t){return new n$(nB(e,!0).delete(t)).toPromise()}class nQ{registerLifecycleListeners(){"undefined"!=typeof window&&"function"==typeof window.addEventListener&&(window.addEventListener("pagehide",this.onPageHide),window.addEventListener("pageshow",this.onPageShow))}unregisterLifecycleListeners(){"undefined"!=typeof window&&"function"==typeof window.removeEventListener&&(window.removeEventListener("pagehide",this.onPageHide),window.removeEventListener("pageshow",this.onPageShow))}constructor(){this.type="LOCAL",this.dbPromise=null,this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.isClosing=!1,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this.onPageHide=()=>{this.isClosing=!0,this.stopPolling(),this.dbPromise&&(this.dbPromise.then(e=>e.close()).catch(()=>{}),this.dbPromise=null)},this.onPageShow=()=>{this.isClosing&&(this.isClosing=!1,Object.keys(this.listeners).length>0&&this.startPolling())},this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){if(this.isClosing)throw Error("Database is closing");return this.dbPromise||(this.dbPromise=function e(){let t=indexedDB.open(nW,1);return new Promise((n,i)=>{t.addEventListener("error",()=>{i(t.error)}),t.addEventListener("upgradeneeded",()=>{let e=t.result;try{e.createObjectStore(nG,{keyPath:nK})}catch(e){i(e)}}),t.addEventListener("success",async()=>{let i=t.result;i.objectStoreNames.contains(nG)?n(i):(i.close(),await new n$(indexedDB.deleteDatabase(nW)).toPromise(),n(await e()))})})}(),this.dbPromise.catch(()=>{this.dbPromise=null})),this.dbPromise}async _withRetries(e){let t=0;for(;;)try{let t=await this._openDb();return await e(t)}catch(e){if(this.isClosing||t++>3)throw e;this.dbPromise&&((await this.dbPromise).close(),this.dbPromise=null)}}async initializeServiceWorkerMessaging(){return nq()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=nF._getInstance(nq()?self:null),this.receiver._subscribe("keyChanged",async(e,t)=>({keyProcessed:(await this._poll()).includes(t.key)})),this.receiver._subscribe("ping",async(e,t)=>["keyChanged"])}async initializeSender(){if(this.activeServiceWorker=await nz(),!this.activeServiceWorker)return;this.sender=new nH(this.activeServiceWorker);let e=await this.sender._send("ping",{},800);e&&e[0]?.fulfilled&&e[0]?.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(this.sender&&this.activeServiceWorker&&(navigator?.serviceWorker?.controller||null)===this.activeServiceWorker)try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{if(!indexedDB)return!1;return await this._withRetries(async e=>{await nJ(e,nP,"1"),await nX(e,nP)}),!0}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,t){return this._withPendingWrite(async()=>(await this._withRetries(n=>nJ(n,e,t)),this.localCache[e]=t,this.notifyServiceWorker(e)))}async _get(e){let t=await this._withRetries(t=>nY(t,e));return this.localCache[e]=t,t}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(t=>nX(t,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){if(this.isClosing)return[];try{let e=await this._withRetries(e=>{let t=nB(e,!1).getAll();return new n$(t).toPromise()});if(this.isClosing||!e||0!==this.pendingWrites)return[];let t=[],n=new Set;if(0!==e.length)for(let{fbase_key:i,value:r}of e)n.add(i),JSON.stringify(this.localCache[i])!==JSON.stringify(r)&&(this.notifyListeners(i,r),t.push(i));for(let e of Object.keys(this.localCache))this.localCache[e]&&!n.has(e)&&(this.notifyListeners(e,null),t.push(e));return t}catch(e){return this.isClosing||v(`Firebase Auth cross-tab polling failed with error: ${e}`),[]}}notifyListeners(e,t){this.localCache[e]=t;let n=this.listeners[e];if(n)for(let e of Array.from(n))e(t)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),800)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,t){0===Object.keys(this.listeners).length&&(this.startPolling(),this.registerLifecycleListeners()),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),0===this.listeners[e].size&&delete this.listeners[e]),0===Object.keys(this.listeners).length&&(this.stopPolling(),this.unregisterLifecycleListeners())}}nQ.type="LOCAL";let nZ=nQ;/**
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
 */function n0(e,t){return x(e,"POST","/v2/accounts/mfaSignIn:start",F(e,t))}/**
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
 */let n1=ej("rcb"),n9=new b(3e4,6e4);class n3{constructor(){this.hostLanguage="",this.counter=0,this.librarySeparatelyLoaded=!!nj().grecaptcha?.render}load(e,t=""){return(k(t.length<=6&&/^\s*[a-zA-Z0-9\-]*\s*$/.test(t),e,"argument-error"),this.shouldResolveImmediately(t)&&G(nj().grecaptcha))?Promise.resolve(nj().grecaptcha):new Promise((n,i)=>{let r=nj().setTimeout(()=>{i(E(e,"network-request-failed"))},n9.get());nj()[n1]=()=>{nj().clearTimeout(r),delete nj()[n1];let s=nj().grecaptcha;if(!s||!G(s)){i(E(e,"internal-error"));return}let a=s.render;s.render=(e,t)=>{let n=a(e,t);return this.counter++,n},this.hostLanguage=t,n(s)},eH(`${ex.recaptchaV2Script}?${(0,s.xO)({onload:n1,render:"explicit",hl:t})}`).catch(()=>{clearTimeout(r),i(E(e,"internal-error"))})})}clearedOneInstance(){this.counter--}shouldResolveImmediately(e){return!!nj().grecaptcha?.render&&(e===this.hostLanguage||this.counter>0||this.librarySeparatelyLoaded)}}class n2{async load(e){return new eq(e)}clearedOneInstance(){}}/**
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
 */let n4="recaptcha",n6={theme:"light",type:"image"};class n5{constructor(e,t,n={...n6}){this.parameters=n,this.type=n4,this.destroyed=!1,this.widgetId=null,this.tokenChangeListeners=new Set,this.renderPromise=null,this.recaptcha=null,this.auth=eV(e),this.isInvisible="invisible"===this.parameters.size,k("undefined"!=typeof document,this.auth,"operation-not-supported-in-this-environment");let i="string"==typeof t?document.getElementById(t):t;k(i,this.auth,"argument-error"),this.container=i,this.parameters.callback=this.makeTokenCallback(this.parameters.callback),this._recaptchaLoader=this.auth.settings.appVerificationDisabledForTesting?new n2:new n3,this.validateStartingState()}async verify(){this.assertNotDestroyed();let e=await this.render(),t=this.getAssertedRecaptcha();return t.getResponse(e)||new Promise(n=>{let i=e=>{e&&(this.tokenChangeListeners.delete(i),n(e))};this.tokenChangeListeners.add(i),this.isInvisible&&t.execute(e)})}render(){try{this.assertNotDestroyed()}catch(e){return Promise.reject(e)}return this.renderPromise||(this.renderPromise=this.makeRenderPromise().catch(e=>{throw this.renderPromise=null,e})),this.renderPromise}_reset(){this.assertNotDestroyed(),null!==this.widgetId&&this.getAssertedRecaptcha().reset(this.widgetId)}clear(){this.assertNotDestroyed(),this.destroyed=!0,this._recaptchaLoader.clearedOneInstance(),this.isInvisible||this.container.childNodes.forEach(e=>{this.container.removeChild(e)})}validateStartingState(){k(!this.parameters.sitekey,this.auth,"argument-error"),k(this.isInvisible||!this.container.hasChildNodes(),this.auth,"argument-error"),k("undefined"!=typeof document,this.auth,"operation-not-supported-in-this-environment")}makeTokenCallback(e){return t=>{if(this.tokenChangeListeners.forEach(e=>e(t)),"function"==typeof e)e(t);else if("string"==typeof e){let n=nj()[e];"function"==typeof n&&n(t)}}}assertNotDestroyed(){k(!this.destroyed,this.auth,"internal-error")}async makeRenderPromise(){if(await this.init(),!this.widgetId){let e=this.container;if(!this.isInvisible){let t=document.createElement("div");e.appendChild(t),e=t}this.widgetId=this.getAssertedRecaptcha().render(e,this.parameters)}return this.widgetId}async init(){let e;k(O()&&!nq(),this.auth,"internal-error"),await (e=null,new Promise(t=>{if("complete"===document.readyState){t();return}e=()=>t(),window.addEventListener("load",e)}).catch(t=>{throw e&&window.removeEventListener("load",e),t})),this.recaptcha=await this._recaptchaLoader.load(this.auth,this.auth.languageCode||void 0);let t=await B(this.auth);k(t,this.auth,"internal-error"),this.parameters.sitekey=t}getAssertedRecaptcha(){return k(this.recaptcha,this.auth,"internal-error"),this.recaptcha}}/**
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
 */class n8{constructor(e,t){this.verificationId=e,this.onConfirmation=t}confirm(e){let t=tp._fromVerification(this.verificationId,e);return this.onConfirmation(t)}}async function n7(e,t,n){if((0,r.rh)(e.app))return Promise.reject(A(e));let i=eV(e);return new n8(await ii(i,t,(0,s.m9)(n)),e=>tF(i,e))}async function ie(e,t,n){let i=(0,s.m9)(e);return await tU(!1,i,"phone"),new n8(await ii(i.auth,t,(0,s.m9)(n)),e=>tx(i,e))}async function it(e,t,n){let i=(0,s.m9)(e);return(0,r.rh)(i.auth.app)?Promise.reject(A(i.auth)):new n8(await ii(i.auth,t,(0,s.m9)(n)),e=>tH(i,e))}async function ii(e,t,n){if(!e._getRecaptchaConfig())try{await eX(e)}catch(e){console.log("Failed to initialize reCAPTCHA Enterprise config. Triggering the reCAPTCHA v2 verification.")}try{let i;if(i="string"==typeof t?{phoneNumber:t}:t,"session"in i){let t=i.session;if("phoneNumber"in i){k("enroll"===t.type,e,"internal-error");let r={idToken:t.credential,phoneEnrollmentInfo:{phoneNumber:i.phoneNumber,clientType:"CLIENT_TYPE_WEB"}},s=async(e,t)=>{if(t.phoneEnrollmentInfo.captchaResponse===eK){k(n?.type===n4,e,"argument-error");let i=await is(e,t,n);return nA(e,i)}return nA(e,t)},a=eY(e,r,"mfaSmsEnrollment",s,"PHONE_PROVIDER");return(await a.catch(e=>Promise.reject(e))).phoneSessionInfo.sessionInfo}{k("signin"===t.type,e,"internal-error");let r=i.multiFactorHint?.uid||i.multiFactorUid;k(r,e,"missing-multi-factor-info");let s={mfaPendingCredential:t.credential,mfaEnrollmentId:r,phoneSignInInfo:{clientType:"CLIENT_TYPE_WEB"}},a=async(e,t)=>{if(t.phoneSignInInfo.captchaResponse===eK){k(n?.type===n4,e,"argument-error");let i=await is(e,t,n);return n0(e,i)}return n0(e,t)},o=eY(e,s,"mfaSmsSignIn",a,"PHONE_PROVIDER");return(await o.catch(e=>Promise.reject(e))).phoneResponseInfo.sessionInfo}}{let t={phoneNumber:i.phoneNumber,clientType:"CLIENT_TYPE_WEB"},r=async(e,t)=>{if(t.captchaResponse===eK){k(n?.type===n4,e,"argument-error");let i=await is(e,t,n);return tc(e,i)}return tc(e,t)},s=eY(e,t,"sendVerificationCode",r,"PHONE_PROVIDER");return(await s.catch(e=>Promise.reject(e))).sessionInfo}}finally{n?._reset()}}async function ir(e,t){let n=(0,s.m9)(e);if((0,r.rh)(n.auth.app))return Promise.reject(A(n.auth));await tD(n,t)}async function is(e,t,n){k(n.type===n4,e,"argument-error");let i=await n.verify();k("string"==typeof i,e,"argument-error");let r={...t};if("phoneEnrollmentInfo"in r){let e=r.phoneEnrollmentInfo.phoneNumber,t=r.phoneEnrollmentInfo.captchaResponse,n=r.phoneEnrollmentInfo.clientType,s=r.phoneEnrollmentInfo.recaptchaVersion;return Object.assign(r,{phoneEnrollmentInfo:{phoneNumber:e,recaptchaToken:i,captchaResponse:t,clientType:n,recaptchaVersion:s}}),r}if(!("phoneSignInInfo"in r))return Object.assign(r,{recaptchaToken:i}),r;{let e=r.phoneSignInInfo.captchaResponse,t=r.phoneSignInInfo.clientType,n=r.phoneSignInInfo.recaptchaVersion;return Object.assign(r,{phoneSignInInfo:{recaptchaToken:i,captchaResponse:e,clientType:t,recaptchaVersion:n}}),r}}/**
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
 */class ia{constructor(e){this.providerId=ia.PROVIDER_ID,this.auth=eV(e)}verifyPhoneNumber(e,t){return ii(this.auth,e,(0,s.m9)(t))}static credential(e,t){return tp._fromVerification(e,t)}static credentialFromResult(e){return ia.credentialFromTaggedObject(e)}static credentialFromError(e){return ia.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;let{phoneNumber:t,temporaryProof:n}=e;return t&&n?tp._fromTokenResponse(t,n):null}}/**
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
 */function io(e,t){return t?eI(t):(k(e._popupRedirectResolver,e,"argument-error"),e._popupRedirectResolver)}ia.PROVIDER_ID="phone",ia.PHONE_SIGN_IN_METHOD="phone";/**
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
 */class ic extends e9{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return ta(e,this._buildIdpRequest())}_linkToIdToken(e,t){return ta(e,this._buildIdpRequest(t))}_getReauthenticationResolver(e){return ta(e,this._buildIdpRequest())}_buildIdpRequest(e){let t={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(t.idToken=e),t}}function iu(e){return tV(e.auth,new ic(e),e.bypassAuthState)}function il(e){let{auth:t,user:n}=e;return k(n,t,"internal-error"),tM(n,new ic(e),e.bypassAuthState)}async function ih(e){let{auth:t,user:n}=e;return k(n,t,"internal-error"),tD(n,new ic(e),e.bypassAuthState)}/**
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
 */class id{constructor(e,t,n,i,r=!1){this.auth=e,this.resolver=n,this.user=i,this.bypassAuthState=r,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(t)?t:[t]}execute(){return new Promise(async(e,t)=>{this.pendingPromise={resolve:e,reject:t};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(e){this.reject(e)}})}async onAuthEvent(e){let{urlResponse:t,sessionId:n,postBody:i,tenantId:r,error:s,type:a}=e;if(s){this.reject(s);return}let o={auth:this.auth,requestUri:t,sessionId:n,tenantId:r||void 0,postBody:i||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(a)(o))}catch(e){this.reject(e)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return iu;case"linkViaPopup":case"linkViaRedirect":return ih;case"reauthViaPopup":case"reauthViaRedirect":return il;default:w(this.auth,"internal-error")}}resolve(e){var t,n;t=this.pendingPromise,n="Pending promise was never set",t||P(n),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){var t,n;t=this.pendingPromise,n="Pending promise was never set",t||P(n),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
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
 */let ip=new b(2e3,1e4);async function im(e,t,n){if((0,r.rh)(e.app))return Promise.reject(E(e,"operation-not-supported-in-this-environment"));let i=eV(e);S(e,t,tI);let s=io(i,n);return new i_(i,"signInViaPopup",t,s).executeNotNull()}async function ig(e,t,n){let i=(0,s.m9)(e);if((0,r.rh)(i.auth.app))return Promise.reject(E(i.auth,"operation-not-supported-in-this-environment"));S(i.auth,t,tI);let a=io(i.auth,n);return new i_(i.auth,"reauthViaPopup",t,a,i).executeNotNull()}async function iI(e,t,n){let i=(0,s.m9)(e);S(i.auth,t,tI);let r=io(i.auth,n);return new i_(i.auth,"linkViaPopup",t,r,i).executeNotNull()}class i_ extends id{constructor(e,t,n,i,r){super(e,t,i,r),this.provider=n,this.authWindow=null,this.pollId=null,i_.currentPopupAction&&i_.currentPopupAction.cancel(),i_.currentPopupAction=this}async executeNotNull(){let e=await this.execute();return k(e,this.auth,"internal-error"),e}async onExecution(){var e,t;e=1===this.filter.length,t="Popup operations only handle one event",e||P(t);let n=nx();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],n),this.authWindow.associatedEvent=n,this.resolver._originValidation(this.auth).catch(e=>{this.reject(e)}),this.resolver._isIframeWebStorageSupported(this.auth,e=>{e||this.reject(E(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){return this.authWindow?.associatedEvent||null}cancel(){this.reject(E(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,i_.currentPopupAction=null}pollUserCancellation(){let e=()=>{if(this.authWindow?.window?.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(E(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,ip.get())};e()}}i_.currentPopupAction=null;let iv=new Map;class iT extends id{constructor(e,t,n=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],t,void 0,n),this.eventId=null}async execute(){let e=iv.get(this.auth._key());if(!e){try{let t=await iw(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(t)}catch(t){e=()=>Promise.reject(t)}iv.set(this.auth._key(),e)}return this.bypassAuthState||iv.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if("signInViaRedirect"===e.type)return super.onAuthEvent(e);if("unknown"===e.type){this.resolve(null);return}if(e.eventId){let t=await this.auth._redirectUserForId(e.eventId);if(t)return this.user=t,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function iw(e,t){let n=iS(t),i=iA(e);if(!await i._isAvailable())return!1;let r=await i._get(n)==="true";return await i._remove(n),r}async function iE(e,t){return iA(e)._set(iS(t),"true")}function iy(e,t){iv.set(e._key(),t)}function iA(e){return eI(e._redirectPersistence)}function iS(e){return eT("pendingRedirect",e.config.apiKey,e.name)}/**
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
 */function iR(e,t,n){return ik(e,t,n)}async function ik(e,t,n){if((0,r.rh)(e.app))return Promise.reject(A(e));let i=eV(e);S(e,t,tI),await i._initializationPromise;let s=io(i,n);return await iE(s,i),s._openRedirect(i,t,"signInViaRedirect")}function iP(e,t,n){return iN(e,t,n)}async function iN(e,t,n){let i=(0,s.m9)(e);if(S(i.auth,t,tI),(0,r.rh)(i.auth.app))return Promise.reject(A(i.auth));await i.auth._initializationPromise;let a=io(i.auth,n);await iE(a,i.auth);let o=await iD(i);return a._openRedirect(i.auth,t,"reauthViaRedirect",o)}function iO(e,t,n){return iC(e,t,n)}async function iC(e,t,n){let i=(0,s.m9)(e);S(i.auth,t,tI),await i.auth._initializationPromise;let r=io(i.auth,n);await tU(!1,i,t.providerId),await iE(r,i.auth);let a=await iD(i);return r._openRedirect(i.auth,t,"linkViaRedirect",a)}async function ib(e,t){return await eV(e)._initializationPromise,iL(e,t,!1)}async function iL(e,t,n=!1){if((0,r.rh)(e.app))return Promise.reject(A(e));let i=eV(e),s=io(i,t),a=new iT(i,s,n),o=await a.execute();return o&&!n&&(delete o.user._redirectEventId,await i._persistUserIfCurrent(o.user),await i._setRedirectUser(null,t)),o}async function iD(e){let t=nx(`${e.uid}:::`);return e._redirectEventId=t,await e.auth._setRedirectUser(e),await e.auth._persistUserIfCurrent(e),t}class iU{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let t=!1;return this.consumers.forEach(n=>{this.isEventForConsumer(e,n)&&(t=!0,this.sendToConsumer(e,n),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!function(e){switch(e.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return iV(e);default:return!1}}(e)||(this.hasHandledPotentialRedirect=!0,t||(this.queuedRedirectEvent=e,t=!0)),t}sendToConsumer(e,t){if(e.error&&!iV(e)){let n=e.error.code?.split("auth/")[1]||"internal-error";t.onError(E(this.auth,n))}else t.onAuthEvent(e)}isEventForConsumer(e,t){let n=null===t.eventId||!!e.eventId&&e.eventId===t.eventId;return t.filter.includes(e.type)&&n}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=6e5&&this.cachedEventUids.clear(),this.cachedEventUids.has(iM(e))}saveEventToCache(e){this.cachedEventUids.add(iM(e)),this.lastProcessedEventTime=Date.now()}}function iM(e){return[e.type,e.eventId,e.sessionId,e.tenantId].filter(e=>e).join("-")}function iV({type:e,error:t}){return"unknown"===e&&t?.code==="auth/no-auth-event"}/**
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
 */async function iF(e,t={}){return x(e,"GET","/v1/projects",t)}/**
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
 */let ix=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,iH=/^https?/;async function ij(e){if(e.config.emulator)return;let{authorizedDomains:t}=await iF(e);for(let e of t)try{if(function(e){let t=N(),{protocol:n,hostname:i}=new URL(t);if(e.startsWith("chrome-extension://")){let r=new URL(e);return""===r.hostname&&""===i?"chrome-extension:"===n&&e.replace("chrome-extension://","")===t.replace("chrome-extension://",""):"chrome-extension:"===n&&r.hostname===i}if(!iH.test(n))return!1;if(ix.test(e))return i===e;let r=e.replace(/\./g,"\\.");return RegExp("^(.+\\."+r+"|"+r+")$","i").test(i)}(e))return}catch{}w(e,"unauthorized-domain")}/**
 * @license
 * Copyright 2020 Google LLC.
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
 */let iq=new b(3e4,6e4);function iz(){let e=nj().___jsl;if(e?.H){for(let t of Object.keys(e.H))if(e.H[t].r=e.H[t].r||[],e.H[t].L=e.H[t].L||[],e.H[t].r=[...e.H[t].L],e.CP)for(let t=0;t<e.CP.length;t++)e.CP[t]=null}}let iW=null,iG=new b(5e3,15e3),iK={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},i$=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);async function iB(e){let t=await (iW=iW||new Promise((t,n)=>{function i(){iz(),gapi.load("gapi.iframes",{callback:()=>{t(gapi.iframes.getContext())},ontimeout:()=>{iz(),n(E(e,"network-request-failed"))},timeout:iq.get()})}if(nj().gapi?.iframes?.Iframe)t(gapi.iframes.getContext());else if(nj().gapi?.load)i();else{let t=ej("iframefcb");return nj()[t]=()=>{gapi.load?i():n(E(e,"network-request-failed"))},eH(`${ex.gapiScript}?onload=${t}`).catch(e=>n(e))}}).catch(e=>{throw iW=null,e})),n=nj().gapi;return k(n,e,"internal-error"),t.open({where:document.body,url:function(e){let t=e.config;k(t.authDomain,e,"auth-domain-config-required");let n=t.emulator?L(t,"emulator/auth/iframe"):`https://${e.config.authDomain}/__/auth/iframe`,i={apiKey:t.apiKey,appName:e.name,v:r.Jn},a=i$.get(e.config.apiHost);a&&(i.eid=a);let o=e._getFrameworks();return o.length&&(i.fw=o.join(",")),`${n}?${(0,s.xO)(i).slice(1)}`}(e),messageHandlersFilter:n.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:iK,dontclear:!0},t=>new Promise(async(n,i)=>{await t.restyle({setHideOnLeave:!1});let r=E(e,"network-request-failed"),s=nj().setTimeout(()=>{i(r)},iG.get());function a(){nj().clearTimeout(s),n(t)}t.ping(a).then(a,()=>{i(r)})}))}/**
 * @license
 * Copyright 2020 Google LLC.
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
 */let iJ={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"};class iY{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch(e){}}}let iX=encodeURIComponent("fac");async function iQ(e,t,n,i,a,o){k(e.config.authDomain,e,"auth-domain-config-required"),k(e.config.apiKey,e,"invalid-api-key");let c={apiKey:e.config.apiKey,appName:e.name,authType:n,redirectUrl:i,v:r.Jn,eventId:a};if(t instanceof tI)for(let[n,i]of(t.setDefaultLanguage(e.languageCode),c.providerId=t.providerId||"",(0,s.xb)(t.getCustomParameters())||(c.customParameters=JSON.stringify(t.getCustomParameters())),Object.entries(o||{})))c[n]=i;if(t instanceof t_){let e=t.getScopes().filter(e=>""!==e);e.length>0&&(c.scopes=e.join(","))}for(let t of(e.tenantId&&(c.tid=e.tenantId),Object.keys(c)))void 0===c[t]&&delete c[t];let u=await e._getAppCheckToken(),l=u?`#${iX}=${encodeURIComponent(u)}`:"";return`${function({config:e}){return e.emulator?L(e,"emulator/auth/handler"):`https://${e.authDomain}/__/auth/handler`}(e)}?${(0,s.xO)(c).slice(1)}${l}`}/**
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
 */let iZ="webStorageSupport";class i0{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=nV,this._completeRedirectFn=iL,this._overrideRedirectResult=iy}async _openPopup(e,t,n,i){var r,a;r=this.eventManagers[e._key()]?.manager,a="_initialize() not called before _openPopup()",r||P(a);let o=await iQ(e,t,n,N(),i);return function(e,t,n,i=500,r=600){let a=Math.max((window.screen.availHeight-r)/2,0).toString(),o=Math.max((window.screen.availWidth-i)/2,0).toString(),c="",u={...iJ,width:i.toString(),height:r.toString(),top:a,left:o},l=(0,s.z$)().toLowerCase();n&&(c=eS(l)?"_blank":n),ey(l)&&(t=t||"http://localhost",u.scrollbars="yes");let h=Object.entries(u).reduce((e,[t,n])=>`${e}${t}=${n},`,"");if(function(e=(0,s.z$)()){return eO(e)&&!!window.navigator?.standalone}(l)&&"_self"!==c)return function(e,t){let n=document.createElement("a");n.href=e,n.target=t;let i=document.createEvent("MouseEvent");i.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),n.dispatchEvent(i)}(t||"",c),new iY(null);let d=window.open(t||"",c,h);k(d,e,"popup-blocked");try{d.focus()}catch(e){}return new iY(d)}(e,o,nx())}async _openRedirect(e,t,n,i){var r;return await this._originValidation(e),r=await iQ(e,t,n,N(),i),nj().location.href=r,new Promise(()=>{})}_initialize(e){let t=e._key();if(this.eventManagers[t]){var n;let{manager:e,promise:i}=this.eventManagers[t];return e?Promise.resolve(e):(n="If manager is not set, promise should be",i||P(n),i)}let i=this.initAndGetManager(e);return this.eventManagers[t]={promise:i},i.catch(()=>{delete this.eventManagers[t]}),i}async initAndGetManager(e){let t=await iB(e),n=new iU(e);return t.register("authEvent",t=>(k(t?.authEvent,e,"invalid-auth-event"),{status:n.onEvent(t.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:n},this.iframes[e._key()]=t,n}_isIframeWebStorageSupported(e,t){this.iframes[e._key()].send(iZ,{type:iZ},n=>{let i=n?.[0]?.[iZ];void 0!==i&&t(!!i),w(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){let t=e._key();return this.originValidationPromises[t]||(this.originValidationPromises[t]=ij(e)),this.originValidationPromises[t]}get _shouldInitProactively(){return eC()||eA()||eO()}}let i1=i0;class i9{constructor(e){this.factorId=e}_process(e,t,n){switch(t.type){case"enroll":return this._finalizeEnroll(e,t.credential,n);case"signin":return this._finalizeSignIn(e,t.credential);default:return P("unexpected MultiFactorSessionType")}}}class i3 extends i9{constructor(e){super("phone"),this.credential=e}static _fromCredential(e){return new i3(e)}_finalizeEnroll(e,t,n){return x(e,"POST","/v2/accounts/mfaEnrollment:finalize",F(e,{idToken:t,displayName:n,phoneVerificationInfo:this.credential._makeVerificationRequest()}))}_finalizeSignIn(e,t){return x(e,"POST","/v2/accounts/mfaSignIn:finalize",F(e,{mfaPendingCredential:t,phoneVerificationInfo:this.credential._makeVerificationRequest()}))}}class i2{constructor(){}static assertion(e){return i3._fromCredential(e)}}i2.FACTOR_ID="phone";class i4{static assertionForEnrollment(e,t){return i6._fromSecret(e,t)}static assertionForSignIn(e,t){return i6._fromEnrollmentId(e,t)}static async generateSecret(e){var t;k(void 0!==e.user?.auth,"internal-error");let n=await x(t=e.user.auth,"POST","/v2/accounts/mfaEnrollment:start",F(t,{idToken:e.credential,totpEnrollmentInfo:{}}));return i5._fromStartTotpMfaEnrollmentResponse(n,e.user.auth)}}i4.FACTOR_ID="totp";class i6 extends i9{constructor(e,t,n){super("totp"),this.otp=e,this.enrollmentId=t,this.secret=n}static _fromSecret(e,t){return new i6(t,void 0,e)}static _fromEnrollmentId(e,t){return new i6(t,e)}async _finalizeEnroll(e,t,n){return k(void 0!==this.secret,e,"argument-error"),x(e,"POST","/v2/accounts/mfaEnrollment:finalize",F(e,{idToken:t,displayName:n,totpVerificationInfo:this.secret._makeTotpVerificationInfo(this.otp)}))}async _finalizeSignIn(e,t){k(void 0!==this.enrollmentId&&void 0!==this.otp,e,"argument-error");let n={verificationCode:this.otp};return x(e,"POST","/v2/accounts/mfaSignIn:finalize",F(e,{mfaPendingCredential:t,mfaEnrollmentId:this.enrollmentId,totpVerificationInfo:n}))}}class i5{constructor(e,t,n,i,r,s,a){this.sessionInfo=s,this.auth=a,this.secretKey=e,this.hashingAlgorithm=t,this.codeLength=n,this.codeIntervalSeconds=i,this.enrollmentCompletionDeadline=r}static _fromStartTotpMfaEnrollmentResponse(e,t){return new i5(e.totpSessionInfo.sharedSecretKey,e.totpSessionInfo.hashingAlgorithm,e.totpSessionInfo.verificationCodeLength,e.totpSessionInfo.periodSec,new Date(e.totpSessionInfo.finalizeEnrollmentTime).toUTCString(),e.totpSessionInfo.sessionInfo,t)}_makeTotpVerificationInfo(e){return{sessionInfo:this.sessionInfo,verificationCode:e}}generateQrCodeUrl(e,t){let n=!1;return(i8(e)||i8(t))&&(n=!0),n&&(i8(e)&&(e=this.auth.currentUser?.email||"unknownuser"),i8(t)&&(t=this.auth.name)),`otpauth://totp/${t}:${e}?secret=${this.secretKey}&issuer=${t}&algorithm=${this.hashingAlgorithm}&digits=${this.codeLength}`}}function i8(e){return void 0===e||e?.length===0}var i7="@firebase/auth",re="1.13.5";/**
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
 */class rt{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){return this.assertAuthConfigured(),this.auth.currentUser?.uid||null}async getToken(e){return(this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser)?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;let t=this.auth.onIdTokenChanged(t=>{e(t?.stsTokenManager.accessToken||null)});this.internalListeners.set(e,t),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();let t=this.internalListeners.get(e);t&&(this.internalListeners.delete(e),t(),this.updateProactiveRefresh())}assertAuthConfigured(){k(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}let rn=(0,s.Pz)("authIdTokenMaxAge")||300,ri=null,rr=e=>async t=>{let n=t&&await t.getIdTokenResult(),i=n&&(new Date().getTime()-Date.parse(n.issuedAtTime))/1e3;if(i&&i>rn)return;let r=n?.token;ri!==r&&(ri=r,await fetch(e,{method:r?"POST":"DELETE",headers:r?{Authorization:`Bearer ${r}`}:{}}))};function rs(e=(0,r.Mq)()){let t=(0,r.qX)(e,"auth");if(t.isInitialized())return t.getImmediate();let n=eQ(e,{popupRedirectResolver:i1,persistence:[nZ,nC,nV]}),i=(0,s.Pz)("authTokenSyncURL");if(i&&"boolean"==typeof isSecureContext&&isSecureContext){let e=new URL(i,location.origin);if(location.origin===e.origin){let t=rr(e.toString());nf(n,t,()=>t(n.currentUser)),np(n,e=>t(e))}}let a=(0,s.q4)("auth");return a&&eZ(n,`http://${a}`),n}ex={loadJS:e=>new Promise((t,n)=>{let i=document.createElement("script");i.setAttribute("src",e),i.onload=t,i.onerror=e=>{let t=E("internal-error");t.customData=e,n(t)},i.type="text/javascript",i.charset="UTF-8",(document.getElementsByTagName("head")?.[0]??document).appendChild(i)}),gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="},i="Browser",(0,r.Xd)(new o.wA("auth",(e,{options:t})=>{let n=e.getProvider("app").getImmediate(),r=e.getProvider("heartbeat"),s=e.getProvider("app-check-internal"),{apiKey:a,authDomain:o}=n.options;k(a&&!a.includes(":"),"invalid-api-key",{appName:n.name});let c=new eM(n,r,s,{apiKey:a,authDomain:o,clientPlatform:i,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:eb(i)});return function(e,t){let n=t?.persistence||[],i=(Array.isArray(n)?n:[n]).map(eI);t?.errorMap&&e._updateErrorMap(t.errorMap),e._initializeWithPersistence(i,t?.popupRedirectResolver)}(c,t),c},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,t,n)=>{e.getProvider("auth-internal").initialize()})),(0,r.Xd)(new o.wA("auth-internal",e=>new rt(eV(e.getProvider("auth").getImmediate())),"PRIVATE").setInstantiationMode("EXPLICIT")),(0,r.KN)(i7,re,/**
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
 */function(e){switch(e){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}(i)),(0,r.KN)(i7,re,"esm2020")}}]);