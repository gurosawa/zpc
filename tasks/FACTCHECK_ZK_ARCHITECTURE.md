# ZK·MPC·아키텍처 팩트체크 (항목 11–18, 20)

검증일: 2026-07-31 (KST)
대상: `tasks/START_HERE_EVIDENCE_PACK.md`의 항목 11–18, 20
방법: 원 논문·IACR·공식 TLSNotary 프로토콜 문서·공식 저장소만 사용했다. 강의 노트와 제품 설명 페이지는 정의의 근거로 채택하지 않았다.

## 판정 요약

| 항목 | 판정 | 핵심 이유 |
|---|---|---|
| 11 | REVISE | proof가 참이라고 보이는 대상은 일반 명제 자체가 아니라 명시된 relation/circuit 및 public input이다. |
| 12 | PASS | commitment의 binding/hiding 및 opening, 제한 공개의 구분은 정확하다. |
| 13 | PASS | soundness·zero-knowledge의 구분과 제약 누락 위험의 방향이 맞다. |
| 14 | REVISE | MPC의 보안은 adversary model에 의존하며, abort·fairness·guaranteed output delivery는 별도 속성이다. |
| 15 | REVISE | 세 축은 유용한 분석 프레임이지만 DECO/TLSNotary가 정한 보편 분류 체계는 아니다. |
| 16 | REVISE | TLSNotary가 두 모드를 구분한다는 점은 맞지만, artifact·claim의 층위는 구현/정책에 따라 더 엄밀히 나눠야 한다. |
| 17 | REVISE | 단계별 trace는 권장 설계·감사 방법이지 TLSNotary/RFC가 요구하는 보편 프로토콜 속성은 아니다. |
| 18 | REVISE | wrong origin/request/path/policy의 거부와 freshness는 검증기가 해당 입력을 명시적으로 binding하고 검사할 때에만 성립한다. |
| 20 | PASS | toy circuit을 학습·음성 테스트 용도로 한정하고 production 보장을 주장하지 않는 범위에서 정확하다. |

## 11. prover·verifier와 proof relation — REVISE

**문제 문장**: “prover는 statement가 참임을 보이는 proof를 만들고, public input과 circuit은 verifier가 확인할 relation을 정한다.”

**판정 근거**: ZK proof system은 통상 relation `R`에 대해 public statement `x`와 비공개 witness `w`가 `(x,w) ∈ R`임을 다룬다. completeness는 참 관계의 정직한 증명자가 수락됨을, soundness는 거짓 관계를 부정한 증명자가 수락시킬 확률이 제한됨을 뜻한다. 따라서 circuit은 관계를 구현할 수 있지만, proof가 애플리케이션의 자연어 주장 전체를 자동으로 확정하지는 않는다. 그것은 `x`, `R`, parser, 그리고 verifier policy가 무엇을 포함하는지에 달렸다.

**안전한 대체 문장**: “prover는 공개 입력 `x`와 비공개 witness `w`가 명시된 relation(회로가 구현할 수 있음)을 만족한다는 proof를 만든다. verifier는 proof·public input·검증 키 또는 회로 정의에 대해 그 relation의 수락 여부를 확인한다. 애플리케이션 주장은 그 relation과 별도로 정확히 명세·binding되어야 한다.”

**1차 URL**: [Goldwasser–Micali–Rackoff, *The Knowledge Complexity of Interactive Proof Systems*](https://doi.org/10.1145/22145.22178)

**가정/버전**: 일반적인 계산 복잡도 기반 ZK proof/argument 모델이다. proof, argument, proof of knowledge는 추출 가능성·계산 가정에서 서로 다른 보안 정의를 가질 수 있다.

## 12. commitment와 selective disclosure — PASS

**문제 문장**: “commitment는 값을 숨긴 채 고정하고, opening은 commitment와 값의 일치를 확인하며, selective disclosure는 필요한 범위만 공개한다.”

**판정 근거**: commitment scheme의 핵심은 숨김성(hiding)과 결속성(binding)이다. opening/decommitment는 보통 message와 randomness를 함께 제시해 commitment를 검증한다. selective disclosure는 이 primitive 하나의 자동 성질이 아니라, transcript의 선택 범위와 그 범위의 commitment/opening 또는 별도 ZK proof를 조합한 프로토콜 수준 성질이다. DECO는 데이터 자체를 숨긴 채 그 데이터에 관한 명제를 ZK로 증명할 수 있음을 제시한다. TLSNotary의 현행 릴리스도 transcript range의 hash commitment와 `(hash, blinder)` opening을 명시한다.

**안전한 대체 문장**: “commitment는 선택한 값(및 보통 난수)을 먼저 고정하면서 값은 숨기는 primitive다. opening은 값과 decommitment 정보를 통해 그 commitment에 열리는지 확인한다. selective disclosure는 프로토콜이 선택 범위만 opening하거나, 숨긴 데이터에 관한 ZK predicate만 증명하도록 설계했을 때 얻어진다.”

**1차 URL**: [Pedersen, *Non-Interactive and Information-Theoretic Secure Verifiable Secret Sharing*](https://www.iacr.org/cryptodb/data/paper.php?pubkey=1151), [DECO 원 논문](https://arxiv.org/abs/1909.00938), [TLSNotary `tlsn` 공식 릴리스 v0.1.0-alpha.15](https://github.com/tlsnotary/tlsn/releases/tag/v0.1.0-alpha.15)

**가정/버전**: opening 형식과 “범위”의 의미는 commitment scheme·TLSNotary 구현 버전에 따라 다르다. 현행 TLSNotary 릴리스의 hash commitment 설명을 기준으로 했다.

## 13. soundness와 under-constrained circuit — PASS

**문제 문장**: “soundness는 거짓 statement 수락과 관련되고 zero-knowledge는 witness 비공개 성질이며, circuit constraint 누락은 의도와 다른 statement를 증명하게 할 수 있다.”

**판정 근거**: soundness와 zero-knowledge는 별개의 성질이다. 회로가 의도한 관계보다 약하게 구현되면 proof verifier는 ‘의도한 관계’가 아니라 실제로 인코딩된 약한 관계만 검증한다. 따라서 누락 제약은 public input·witness·출력 사이의 의도한 binding을 잃게 해, 애플리케이션이 의도하지 않은 입력도 수락될 수 있게 한다. 다만 이것은 proof system의 soundness 붕괴가 아니라 회로/statement 명세 오류다.

**안전한 대체 문장**: “soundness는 실제로 검증하는 relation에서 거짓인 public statement의 수락을 제한하고, zero-knowledge는 witness 외의 정보를 누설하지 않도록 한다. 회로 제약이 누락되면 proof는 여전히 그 약해진 회로에 대해서는 sound할 수 있지만, 애플리케이션이 의도한 claim을 보장하지 못할 수 있다.”

**1차 URL**: [Goldwasser–Micali–Rackoff 원 논문](https://doi.org/10.1145/22145.22178), [Groth16 논문 (IACR ePrint 2016/260)](https://eprint.iacr.org/2016/260)

**가정/버전**: “under-constrained”는 회로 구현과 intended relation의 불일치를 뜻하며, 구체적 취약점의 성립은 해당 proving system의 field arithmetic·range check·parser binding에 따라 달라진다.

## 14. MPC 기초 — REVISE

**문제 문장**: “MPC는 여러 참여자가 입력을 직접 공개하지 않고 공동 계산하며, 보장 범위는 adversary model에 의존하고 collusion·abort는 별도 고려 대상이다.”

**판정 근거**: 공동 계산과 입력 프라이버시는 MPC의 적절한 개괄이다. 하지만 어떤 collusion까지 견디는지, malicious participant가 abort할 수 있는지, fairness 또는 guaranteed output delivery가 있는지는 프로토콜과 adversary model(정직 다수/부정 다수, semi-honest/malicious, 동기성 등)에 의존한다. 일반 MPC에 “항상 비밀을 지킨다” 또는 “항상 결과를 낸다”를 부여해서는 안 된다.

**안전한 대체 문장**: “MPC는 여러 참여자가 자신의 입력을 모두 공개하지 않은 채 지정한 함수를 함께 계산하는 프로토콜 계열이다. 프라이버시·정확성·허용되는 공모 수·악의적 참여자의 abort에 대한 처리·fairness·결과 전달 보장은 채택한 adversary model과 프로토콜의 명시적 보안 정의를 확인해야 한다.”

**1차 URL**: [Goldreich–Micali–Wigderson, *How to Play ANY Mental Game*](https://doi.org/10.1145/62212.62222), [Damgård et al., *SPDZ* (IACR ePrint 2011/535)](https://eprint.iacr.org/2011/535)

**가정/버전**: secret sharing은 흔한 구현 기법이지만 MPC의 필요조건이나 단일 구현 방식은 아니다.

## 15. architecture 결정 축 — REVISE

**문제 문장**: “provenance 획득 방식, verifier 주체, 공개 방식은 별개 축이며 proxy·MPC-TLS·DECO 계열은 trust 가정이 다르다.”

**판정 근거**: TLSNotary 공식 문서는 MPC-TLS와 proxy mode를 서로 다른 신뢰 가정과 절차로 설명한다. MPC-TLS에서는 prover·verifier가 TLS 암호 연산을 공동 수행하고, proxy mode에서는 verifier가 암호화된 TLS 트래픽을 전달한 뒤 ZK proof를 검증하며 네트워크 경로 가정이 추가된다. DECO 원 논문은 TLS를 통해 얻은 데이터의 provenance와 선택적 ZK 명제를 목표로 한다. 그러나 “provenance 획득/검증 주체/공개 방식”이라는 정확히 세 축의 표준 분류는 이들 문서가 정의한 taxonomy가 아니라 저자의 분석 프레임이다.

**안전한 대체 문장**: “설계 비교에서는 최소한 (a) provenance를 TLS 세션에 어떻게 binding하는지, (b) 누가 어떤 검증을 수행하는지, (c) 원문·commitment·ZK predicate 중 무엇을 공개하는지를 분리해 기록할 수 있다. 이는 비교용 분석 프레임이며, DECO·MPC-TLS·proxy mode를 동일한 표준 분류의 상호 배타적 범주로 간주해서는 안 된다.”

**1차 URL**: [TLSNotary MPC-TLS 명세](https://tlsnotary.org/docs/protocol/mpc-tls/), [TLSNotary proxy mode 명세](https://tlsnotary.org/docs/protocol/proxy-mode/), [DECO 원 논문](https://arxiv.org/abs/1909.00938)

**가정/버전**: TLSNotary 문서가 2026-07-31에 설명하는 default MPC-TLS와 alternative proxy mode를 기준으로 했다.

## 16. TLSNotary/MPC-TLS artifact — REVISE

**문제 문장**: “TLSNotary는 MPC-TLS와 proxy mode를 구분하며, session artifact와 application claim을 구분하고 parser·disclosure 규칙이 claim 범위를 좌우한다.”

**판정 근거**: 첫 문장은 공식 명세와 일치한다. MPC-TLS는 공동 암호 연산으로 prover가 단독으로 request를 만들거나 server response를 위조하지 못하게 하며, proxy mode는 별도 ZK 검증 단계와 추가 network-path 가정을 둔다. 다만 TLSNotary core API는 attestations/notarization과 commitments/proofs를 분리·선택 사항으로 다루기 시작했으며, “session artifact”와 “application claim”은 고정된 단일 형식이 아니다. parser와 disclosure rule이 claim의 *의미*를 자동 확정하는 것이 아니라, application verifier가 그 parser 결과·범위·정책을 proof/attestation과 binding할 때에만 그 범위를 제한한다.

**안전한 대체 문장**: “TLSNotary는 기본 MPC-TLS와 대안 proxy mode를 구분한다. MPC-TLS는 공동 TLS 연산으로 transcript provenance를 만들고, proxy mode는 관찰한 TLS 트래픽에 대한 사후 ZK 검증을 사용한다. transcript commitment/opening 또는 attestation, parser 결과, 애플리케이션 claim, 최종 정책 결정을 서로 다른 산출물로 기록하고, claim이 어떤 bytes와 parsing rule에 binding되는지 verifier가 명시적으로 검사해야 한다.”

**1차 URL**: [TLSNotary 소개](https://tlsnotary.org/docs/intro/), [MPC-TLS handshake 명세](https://tlsnotary.org/docs/protocol/mpc-tls/handshake/), [proxy mode 명세](https://tlsnotary.org/docs/protocol/proxy-mode/), [공식 `tlsn` 릴리스의 attestation/commitment 분리 설명](https://github.com/tlsnotary/tlsn/releases/tag/v0.1.0-alpha.15)

**가정/버전**: TLSNotary `v0.1.0-alpha.15` 릴리스와 해당 시점 공식 문서를 기준으로 했다. API와 artifact 형식은 pre-release에서 변경될 수 있다.

## 17. 통합 trace — REVISE

**문제 문장**: “Specify부터 Rely까지 단계별 입력·출력·실패 조건과 artifact ownership을 추적해야 하고, verify 성공과 rely 허용은 별도 결정이다.”

**판정 근거**: verify와 application reliance의 분리는 정확한 설계 원칙이다. TLSNotary도 data verifier가 signed data를 받아들일 trust 조건을 별도로 둔다. 그러나 모든 zkTLS 시스템에 `Specify → Challenge → Fetch → Prove → Verify → Rely`라는 동일한 단계명·ownership trace가 반드시 존재한다는 원 논문/표준 근거는 없다. RFC 9449는 OAuth의 DPoP proof를 다루며 일반 zkTLS 흐름의 근거가 아니다.

**안전한 대체 문장**: “이 문서의 설계·감사 표기법으로, claim 명세·요청·TLS provenance artifact·공개 또는 ZK proof·검증·애플리케이션 정책 결정을 단계별로 추적하자. proof/attestation 검증 성공은 정책의 입력일 뿐이며, relying application은 issuer trust, audience, freshness, authorization 등 자신의 조건을 추가로 검사한 뒤에만 허용해야 한다.”

**1차 URL**: [TLSNotary 소개](https://tlsnotary.org/docs/intro/), [TLSNotary FAQ](https://tlsnotary.org/docs/faq/), [RFC 9449: OAuth 2.0 Demonstrating Proof of Possession](https://www.rfc-editor.org/rfc/rfc9449)

**가정/버전**: “Rely”는 애플리케이션 레벨의 정책 결정을 뜻한다. RFC 9449는 freshness-bound proof의 한 표준 사례일 뿐 zkTLS trace 표준은 아니다.

## 18. negative-test capstone — REVISE

**문제 문장**: “wrong origin·request·path·policy mismatch는 거절되어야 하며 stale challenge/replay와 parser mismatch·과다 공개도 실패 조건이다.”

**판정 근거**: 보안 테스트 항목으로는 타당하지만 보편적 프로토콜 사실로 단정할 수는 없다. origin, request, field path, challenge, disclosure manifest가 proof의 public input/committed bytes/attestation에 binding되지 않았거나 verifier policy가 이를 검사하지 않으면, 해당 mismatch가 암호 검증에서 자동 거절되지 않는다. TLSNotary proxy mode도 verifier가 관찰한 세션·proof를 검증하는 범위를 설명할 뿐, 임의의 애플리케이션 policy와 freshness 방식을 자동 제공한다고 하지 않는다.

**안전한 대체 문장**: “negative test에서는 verifier가 검사하도록 설계한 모든 binding을 반증한다. 예를 들어 origin·request scope·field path·challenge·정책 식별자 중 하나를 바꿨을 때 거절되어야 한다면, 각 값이 commitment/attestation/proof의 검증 대상 또는 verifier의 신뢰된 입력에 명시적으로 포함되어 있는지 먼저 확인한다. 과다 공개는 암호 검증 실패가 아니라 privacy policy 위반으로 별도 검출될 수도 있다.”

**1차 URL**: [TLSNotary proxy mode 명세](https://tlsnotary.org/docs/protocol/proxy-mode/), [RFC 9449](https://www.rfc-editor.org/rfc/rfc9449), [DECO 원 논문](https://arxiv.org/abs/1909.00938)

**가정/버전**: freshness는 challenge, timestamp, nonce, session binding 등 설계에 따라 구현되며 각각 replay 방지 범위가 다르다.

## 20. toy predicate·reject-case 실습 — PASS

**문제 문장**: “toy circuit은 statement·witness·public input 관계를 익히는 도구이고, wrong-path·stale·policy mismatch를 reject case로 실험하며, production circuit 보장을 주장하지 않는다.”

**판정 근거**: 관계의 public statement와 witness를 분리해 작은 회로에서 수락·거절을 시험하는 방식은 ZK proof 관계를 학습하고 검증기 조건을 점검하는 데 적합하다. 또한 production 적합성으로 일반화하지 않는다는 금지 문구가 중요하다. 단, stale 또는 policy mismatch가 회로의 입력이나 검증기 정책에 실제로 모델링되지 않으면, toy verifier가 이를 거절할 이유는 없다.

**안전한 대체 문장**: “toy predicate는 public input·witness·constraint·verifier policy의 연결을 학습하는 제한된 모델이다. reject case를 만들려면 wrong path, stale value, policy identifier를 실제 검증 입력 또는 policy gate에 포함해야 한다. 이 실습의 통과는 production 회로의 soundness, parser binding, key management, 또는 end-to-end 보안을 보장하지 않는다.”

**1차 URL**: [Goldwasser–Micali–Rackoff 원 논문](https://doi.org/10.1145/22145.22178), [Groth16 논문 (IACR ePrint 2016/260)](https://eprint.iacr.org/2016/260)

**가정/버전**: toy circuit의 구체적 proving system과 verifier 구현은 지정되지 않았다. 판정은 일반 relation-based proof model에 한정한다.

## 층위 분리 체크리스트

다음 대상을 같은 단어로 뭉뚱그리면 잘못된 보안 결론에 이르기 쉽다.

| 층위 | 무엇인가 | 무엇을 단독으로 보장하지 않는가 |
|---|---|---|
| TLS session/handshake·transcript | 서버 인증과 세션 무결성에 관련된 프로토콜 실행 기록 | 특정 애플리케이션 claim이나 권한 부여 |
| commitment | 선택한 bytes 또는 값에 대한 숨김·결속 참조 | 그 bytes의 의미, parser 결과, 정책 허용 |
| opening | commitment에 해당 값/난수를 열어 보이는 정보 | 공개하지 않은 범위의 진실성이나 애플리케이션 권한 |
| ZK proof | 명시한 relation과 public input의 만족 | relation에 포함되지 않은 origin/path/policy/freshness |
| application decision | verifier가 policy를 적용해 allow/deny하는 결과 | proof 검증 자체와 동의어가 아님 |

이 표의 구분은 TLSNotary·DECO의 구현·논문에서 드러나는 역할을 교육용으로 정리한 것이며, 특정 표준의 정식 데이터 모델은 아니다.

## 가장 위험한 오류 5개

1. **회로가 약한데 proof가 valid하므로 claim도 참이라고 결론내리는 오류**: soundness는 실제 인코딩한 relation에만 적용된다.
2. **TLS session artifact·commitment·opening·ZK proof·애플리케이션 allow를 같은 ‘증명’으로 부르는 오류**: 어느 binding 또는 정책 검사가 빠졌는지 보이지 않게 된다.
3. **MPC가 collusion과 abort를 자동 해결한다고 보는 오류**: 허용 공모 수, 악의적 보안, fairness, output delivery는 별도 정의다.
4. **TLSNotary proxy mode를 MPC-TLS와 동등한 trust model로 취급하는 오류**: proxy mode는 verifier–server 네트워크 경로 가정을 추가하며, 공식 문서도 stronger MPC guarantees와의 교환이라고 명시한다.
5. **origin/request/path/challenge/policy mismatch가 자동 거절된다고 가정하는 오류**: 해당 값이 proof·attestation·commitment 또는 verifier의 신뢰된 policy input에 binding되고 검사되어야 한다.
