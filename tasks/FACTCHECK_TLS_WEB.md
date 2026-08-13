# TLS·웹 보안 팩트체크 — Evidence Pack 1~10, 17~19

## 판정 기준

- 범위: `tasks/START_HERE_EVIDENCE_PACK.md`의 항목 1~10, 17~19만 검토했다.
- 근거는 IETF RFC, OWASP, TLSNotary 공식 문서, DECO 원 논문으로 제한했다.
- `PASS`는 주장 자체가 해당 범위 안에서 성립함을, `REVISE`는 문구 또는 근거의 범위 제한이 필요함을, `REJECT`는 제시 근거로 일반화할 수 없음을 뜻한다.

## 항목별 결과

### 1. 복사본·스크린샷·provenance — REVISE

- 문제가 된 문장: “HTTPS 응답 복사본은 검증 가능한 출처 증명이 아니다.”
- 이유: 일반적인 복사본만 놓고 보면 타당하지만, 서버가 별도의 서명·검증 가능한 토큰을 응답에 넣는 경우까지 배제하는 절대 표현이다. TLS만으로 제3자 provenance를 주지 않는다는 한정이 필요하다. DECO도 TLS의 기밀성·무결성만으로는 제3자에게 특정 웹사이트 출처를 증명할 수 없다고 설명한다.
- 안전한 대체 문장: “일반적인 HTTPS 응답의 복사본이나 스크린샷만으로는 제3자가 TLS 출처와 무결성을 검증할 수 없다. 서버가 별도 검증 가능 서명을 제공하지 않는 한, TLS 연결의 인증·무결성은 그 TLS 세션의 endpoint에 한정된다.”
- 근거: [DECO 원 논문](https://arxiv.org/abs/1909.00938), [TLS 1.3 RFC 8446 §1](https://www.rfc-editor.org/rfc/rfc8446#section-1)
- 범위 조건: 여기서 “복사본”은 서버가 별도 서명한 애플리케이션 객체가 아닌 일반 HTTP 응답의 사본이다.

### 2. zkTLS 참여자와 산출물 — PASS

- 문제가 된 문장: 없음. 다만 `Origin`은 TLSNotary 문서의 `Server`와 같은 뜻으로 정의해야 한다.
- 안전한 대체 문장: “TLSNotary에서 Server는 TLS 데이터를 제공하고, Prover는 선택한 transcript 부분의 증명을 Verifier에게 제시한다. Verifier 또는 relying application은 자신의 정책에 따라 그 증명을 받아들일지 결정한다.”
- 근거: [TLSNotary Introduction](https://tlsnotary.org/docs/intro/), [DECO 원 논문](https://arxiv.org/abs/1909.00938)
- 범위 조건: notary는 TLSNotary의 한 설계 선택이지 모든 zkTLS 계열의 필수 참여자는 아니다.

### 3. 신뢰 경계와 공격 표면 — REVISE

- 문제가 된 문장: “trust boundary는 권한·데이터·신뢰가 바뀌는 지점이다.”
- 이유: 실무적으로 유용한 정의지만, 제시한 OWASP Threat Modeling 페이지는 이 정의나 browser/API/prover/verifier 경계를 직접 규정하지 않는다.
- 안전한 대체 문장: “위협 모델에서는 시스템 범위, 가능한 실패, 대응책을 먼저 정한다. 이 문서에서는 브라우저, API, prover, verifier 사이에서 누가 어떤 데이터와 검증 책임을 갖는지 경계로 명시한다.”
- 근거: [OWASP Threat Modeling](https://owasp.org/www-community/Threat_Modeling)
- 범위 조건: 경계도는 보안 증거가 아니라 위협 모델과 검증 책임을 명시하는 설계 산출물이다.

### 4. HTTPS 보호 경로 — PASS

- 문제가 된 문장: 없음.
- 안전한 대체 문장: “TLS handshake는 peer 인증, 암호 모드 협상, 공유 키 자료 수립을 수행하고, record protocol은 그 결과의 traffic key로 애플리케이션 트래픽을 record 단위로 보호한다.”
- 근거: [TLS 1.3 RFC 8446 §1](https://www.rfc-editor.org/rfc/rfc8446#section-1), [TLS 1.2 RFC 5246](https://www.rfc-editor.org/rfc/rfc5246)
- 범위 조건: TLS는 데이터를 받은 사람이 그 내용을 제3자에게 자동으로 서명해 주는 프로토콜이 아니다. RFC 5246은 TLS 1.3에 의해 폐기된 TLS 1.2 명세이므로, 1.2 동작 설명에만 사용한다.

### 5. TLS transcript와 origin binding — REVISE

- 문제가 된 문장: “CertificateVerify와 Finished가 handshake transcript를 결합한다.”
- 이유: 이는 TLS 1.3의 표현이다. TLS 1.2에는 TLS 1.3의 `CertificateVerify` 메시지가 없고, 인증·키 교환·Finished의 구성은 cipher suite에 따라 다르다. 또 certificate 검증은 연결 peer의 신원 인증이지, 특정 HTTP 응답 전체의 제3자 provenance 자체는 아니다.
- 안전한 대체 문장: “TLS 1.3에서 CertificateVerify와 Finished는 transcript hash에 결합되어 서버 인증과 handshake 무결성을 확인한다. TLS 1.2는 별도 handshake 구조를 사용하므로, 버전별 transcript·인증 메시지를 구분해 검증해야 한다. 어느 경우에도 TLS endpoint authentication만으로 특정 HTTP 응답의 제3자 provenance가 자동으로 생기지는 않는다.”
- 근거: [TLS 1.3 RFC 8446 §4.4](https://www.rfc-editor.org/rfc/rfc8446#section-4.4), [TLS 1.2 RFC 5246](https://www.rfc-editor.org/rfc/rfc5246), [DECO 원 논문](https://arxiv.org/abs/1909.00938)
- 범위 조건: certificate identity는 신뢰하는 CA와 hostname 검증 등 애플리케이션의 인증 규칙을 전제한다.

### 6. record 인증과 출처 검증의 차이 — REVISE

- 문제가 된 문장: “AEAD tag는 record 무결성 검증에 사용된다. endpoint secret을 아는 당사자는 record를 만들 수 있다.”
- 이유: TLS record 인증은 수신 endpoint가 해당 방향의 traffic key로 확인하는 대칭키 인증이다. “endpoint secret”은 방향별 traffic secret과 키 갱신을 가리는 부정확한 표현이며, 공개 검증 가능한 서명과 다르다는 결론은 맞지만 이를 AEAD tag 하나로 설명하면 과도하게 단순화된다.
- 안전한 대체 문장: “TLS 1.3 record는 해당 송신 방향의 traffic key로 AEAD 보호되며, 수신 endpoint는 그 키에서 파생한 값으로 무결성을 확인한다. 이 대칭키 검증은 독립 제3자가 공개 정보만으로 확인하는 디지털 서명이 아니므로, 제3자 provenance에는 transcript·키 수립·공개 범위까지 묶는 별도 프로토콜이 필요하다.”
- 근거: [TLS 1.3 RFC 8446 §5](https://www.rfc-editor.org/rfc/rfc8446#section-5), [NIST SP 800-38D](https://csrc.nist.gov/pubs/sp/800/38/d/final), [DECO 원 논문](https://arxiv.org/abs/1909.00938)
- 범위 조건: “제3자 provenance”의 성질은 TLS 자체가 아니라 채택한 TLSNotary·DECO 등 상위 프로토콜과 신뢰 가정에 달려 있다.

### 7. TLS 1.2·1.3과 구현 지원 경계 — PASS

- 문제가 된 문장: 없음.
- 안전한 대체 문장: “TLS 1.2와 TLS 1.3은 handshake 및 키 수립·파생 구조가 다르다. 따라서 zkTLS 구현의 지원 여부와 보장은 ‘TLS 지원’이라는 단일 플래그가 아니라, 명시한 프로토콜 버전·cipher suite·구현 경로에 따라 확인해야 한다.”
- 근거: [TLS 1.3 RFC 8446 §1.2](https://www.rfc-editor.org/rfc/rfc8446#section-1.2), [TLS 1.2 RFC 5246](https://www.rfc-editor.org/rfc/rfc5246)
- 범위 조건: RFC 8446은 RFC 5246을 폐기한다. 과거 1.2 연결을 지원하는 구현의 실제 지원 범위는 해당 구현의 공식 사양으로 별도 확인해야 한다.

### 8. claim specification — REJECT

- 문제가 된 문장: “challenge는 freshness를 시사하는 표현을 줄이는 정책 입력이다.” 및 RFC 9449를 일반 zkTLS challenge 근거로 제시한 부분.
- 이유: RFC 9449는 OAuth DPoP proof JWT의 선택적 authorization server/resource server nonce 규격이다. nonce, `jti` 보관, 수락 시간 창, 대상 URI·HTTP method 검증이 함께 있을 때 DPoP replay 위험을 줄인다. 일반 zkTLS fetch·증명·검증 흐름의 challenge 규격이나 충분조건을 정의하지 않는다.
- 안전한 대체 문장: “relying verifier가 freshness를 요구한다면, 예측 불가능한 verifier nonce를 증명 대상 요청 또는 응답에 명시적으로 결합하고, 발급 주체·대상·유효 시간·재사용 정책을 검증해야 한다. nonce만 추가했다고 재생이 자동 차단되지는 않는다.”
- 근거: [RFC 9449 §§3, 8, 11.1](https://www.rfc-editor.org/rfc/rfc9449), [TLSNotary Introduction](https://tlsnotary.org/docs/intro/)
- 범위 조건: 위 대체 문장은 DPoP를 그대로 zkTLS에 적용한다는 뜻이 아니라, freshness가 nonce의 형식뿐 아니라 verifier의 상태와 수락 정책을 필요로 한다는 설계 원칙이다.

### 9. bytes-to-claim binding — REVISE

- 문제가 된 문장: “canonicalization 차이는 같은 데이터를 다르게 해석하게 할 수 있다.”
- 이유: RFC 8259는 JSON canonicalization을 정의하지 않는다. 다만 객체 이름은 유일해야 하며, 중복 이름일 때 수신 구현의 동작이 예측 불가능하다고 명시한다. 따라서 중복 이름과 member ordering 문제는 직접 근거가 있지만, 일반 canonicalization 주장은 별도 형식 규격이나 애플리케이션 프로필이 필요하다.
- 안전한 대체 문장: “bytes에서 JSON field claim을 만들면 parser 규칙을 증명 관계에 고정해야 한다. 특히 RFC 8259는 객체 이름의 유일성을 권고하고, 중복 이름은 구현마다 마지막 값·오류·전체 쌍 노출 등 다르게 처리될 수 있다고 설명한다. claim 프로필은 중복 이름을 거부하고, 숫자·문자열·경로 해석과 필요한 정규화 규칙을 명시해야 한다.”
- 근거: [RFC 8259 §4](https://www.rfc-editor.org/rfc/rfc8259#section-4), [HTTP Semantics RFC 9110](https://www.rfc-editor.org/rfc/rfc9110)
- 범위 조건: canonicalization이 필요하다는 것은 파싱된 구조를 재서명·재해시하거나 다른 구현 간 동일 바이트 표현을 요구할 때다. 원본 바이트와 단일 결정적 parser를 직접 증명한다면 별도 canonicalization은 항상 필수는 아니다.

### 10. credential 격리와 응답 claim — REVISE

- 문제가 된 문장: “session·token은 비공개 credential이다.”
- 이유: bearer token은 보유자 누구나 사용할 수 있는 보안 토큰이지만, `session`은 구현마다 쿠키, 서버 측 상태 식별자, 일회성 값 등으로 달라 일괄적으로 credential이라 단정할 수 없다. “인증된 응답이 relying party의 권한을 뜻하지 않는다”는 결론은 타당하다.
- 안전한 대체 문장: “access token이나 인증 쿠키처럼 보유 자체가 접근 권한에 영향을 주는 값은 prover와 verifier 사이에 공개하지 않는다. 증명이 특정 응답의 출처·내용을 확인하더라도, relying party는 자신의 정책과 대상 객체에 대한 authorization을 별도로 수행해야 한다.”
- 근거: [RFC 6750 §§1.2–1.3](https://www.rfc-editor.org/rfc/rfc6750#section-1.2), [OWASP API1:2023 BOLA](https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/)
- 범위 조건: token의 성질과 전송·저장 규칙은 OAuth/세션 방식별로 다르다. BOLA는 object-level authorization 예시이며 모든 relying-party 정책을 규정하지는 않는다.

### 17. 통합 trace — REVISE

- 문제가 된 문장: “verify 성공과 rely 허용은 별도 결정이다.” 및 이를 RFC 9449로 뒷받침하는 부분.
- 이유: 전자는 설계 원칙으로 타당하지만 TLSNotary와 RFC 9449가 모든 시스템에 적용되는 일반 명제를 직접 규정하지는 않는다. RFC 9449는 DPoP resource server가 proof 검증뿐 아니라 token의 다른 유효성도 확인해야 한다고 할 뿐이다.
- 안전한 대체 문장: “검증 단계는 증명이 프로토콜과 claim 프로필에 맞는지만 판정하고, relying 단계는 issuer·origin·freshness·업무 정책을 포함한 별도 수락 정책을 적용하도록 분리한다. DPoP에서도 resource server는 proof 검증 외에 access token의 다른 유효성을 확인해야 한다.”
- 근거: [TLSNotary Introduction](https://tlsnotary.org/docs/intro/), [RFC 9449 §3](https://www.rfc-editor.org/rfc/rfc9449#section-3)
- 범위 조건: trace의 단계·입출력·ownership은 채택한 프로토콜과 애플리케이션이 정의해야 하며 RFC 9449의 OAuth 흐름을 일반 zkTLS 표준으로 제시해서는 안 된다.

### 18. negative-test capstone — REVISE

- 문제가 된 문장: “wrong origin·request·path·policy mismatch는 거절되어야 한다. stale challenge와 replay는 freshness 정책의 실패 대상이다.”
- 이유: 잘 설계한 해당 claim 프로필에서는 맞는 요구사항이지만, 제시 근거만으로 모든 zkTLS 시스템의 프로토콜 요구사항이라고 할 수 없다. RFC 9449의 URI·method·nonce·`jti` 검증은 DPoP 문맥에 한정된다.
- 안전한 대체 문장: “claim 프로필이 origin·요청 범위·field path·policy·freshness를 입력으로 삼는다면, 각 불일치와 허용되지 않은 공개 범위를 negative test로 거절해야 한다. freshness 테스트는 nonce 발급자, 예측 불가능성, 유효 시간, 재사용 추적을 함께 검증한다.”
- 근거: [RFC 9449 §§8, 11.1](https://www.rfc-editor.org/rfc/rfc9449), [OWASP Threat Modeling](https://owasp.org/www-community/Threat_Modeling)
- 범위 조건: replay 차단은 nonce 존재만으로 성립하지 않는다. RFC 9449도 제한된 수락 시간과 `jti` 중복 거부 또는 server nonce 정책을 함께 요구·권고한다.

### 19. fixture 기반 Fetch·credential 격리 실습 — REVISE

- 문제가 된 문장: “fixture는 실제 계정·토큰 없이 메커니즘을 재현하는 입력이다. allowed origin과 challenge를 명시해야 한다.”
- 이유: fixture의 교육적 정의와 disclosure manifest는 유효한 프로젝트 설계지만 RFC 6750이나 TLSNotary Introduction이 직접 정한 프로토콜 요구사항은 아니다. 실습 결과를 production 보안 보장으로 제시하지 말라는 경고는 적절하다.
- 안전한 대체 문장: “실습 fixture에는 실제 bearer token·인증 쿠키·개인정보를 넣지 않고, 허용 origin·요청 범위·공개 필드·freshness 가정을 명시한다. fixture 통과는 해당 테스트 입력에서의 구현 동작만 보여 주며 production 보안 보장은 아니다.”
- 근거: [RFC 6750 §1.2](https://www.rfc-editor.org/rfc/rfc6750#section-1.2), [TLSNotary Introduction](https://tlsnotary.org/docs/intro/)
- 범위 조건: fixture의 정확한 필드, manifest 형식, secret 처리 절차는 이 프로젝트가 정의해야 한다. RFC 6750은 bearer token의 보유 위험을 설명하지만 fixture 규격은 제공하지 않는다.

## 공통 정정 원칙

1. TLS endpoint authentication과 제3자 provenance를 같은 보장으로 쓰지 않는다. 전자는 TLS peer의 인증이고, 후자는 독립 verifier가 출처·선택 공개·프로토콜 신뢰 가정을 확인할 수 있게 하는 별도 성질이다.
2. RFC 9449는 OAuth DPoP의 구체적 proof-of-possession·replay 완화 규격이다. zkTLS의 범용 challenge 표준 또는 nonce만으로 충분한 replay 방지의 근거로 인용하지 않는다.
3. JSON claim은 parser profile을 명시하고 중복 이름을 거부한다. RFC 8259만으로 canonicalization 규칙이 정해졌다고 쓰지 않는다.
4. TLS 1.3의 `CertificateVerify`, transcript hash, traffic secret 용어를 TLS 1.2 일반 설명으로 확장하지 않는다.
5. 증명 검증의 성공과 relying party의 authorization은 분리한다. proof가 맞아도 정책·대상 객체 권한·freshness·신뢰 anchor 검증은 별도다.
