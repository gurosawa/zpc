# START HERE 최종 데스크 리뷰

검토일: 2026-08-03 (KST)
판정: **승인**

## 총평

START HERE 20편은 웹·API·기본 보안을 아는 독자가 TLS 응답을 검증 가능한 최소 공개 claim으로 읽는 데 필요한 순서를 갖췄다. 문제·역할·TLS 경계·claim binding·proof/MPC·architecture·음성 테스트·안전한 실습으로 이어지는 흐름은 과설계 없이 필요한 개념만 단계적으로 도입한다.

자동 감사 결과는 20편, `VisualPlaceholder` 40개, 문서당 고정 H2 9개, 모든 `bodyChars <= readingBudget`, `assumes`의 선행 `introduces` 충족이다. 실제 이미지 파일은 포함하지 않고 자리표시자만 사용한다.

역할 1~6의 결과는 최종 승인 가능하다. 신규 초안·로드맵·교차 검토·보수 윤문·결합 산출물이 모두 계약 범위에 맞는다.

## 확인한 사실 경계

- RFC 9449는 OAuth DPoP 사례로 한정되어 있으며, 범용 zkTLS challenge 표준으로 쓰지 않았다.
- 일반 HTTPS 응답 사본, TLS endpoint authentication, 독립 제3자 provenance를 구분했다.
- TLS 1.2와 TLS 1.3의 구조·지원 범위를 혼용하지 않았고, TLS 1.3의 `CertificateVerify`와 `Finished` 설명도 버전 범위 안에 두었다.
- RFC 8259가 canonicalization을 정의한다고 쓰지 않았고, 중복 JSON 이름·parser profile·field path의 binding을 분리했다.
- proof relation 검증, parser/claim binding, relying application의 authorization을 다른 결정으로 다뤘다.
- MPC의 공모·abort·fairness·결과 전달은 adversary model과 프로토콜별 속성으로 한정했다.
- TLSNotary의 MPC-TLS와 proxy mode는 절차와 network-path 신뢰 가정이 다른 사례로 설명했고, DECO와 함께 표준 taxonomy가 아닌 분석 프레임에 놓았다.
- session/transcript, commitment, opening, attestation, ZK proof, parser 결과, application claim, decision을 같은 산출물로 뭉뚱그리지 않았다.

## 이슈

P0/P1/P2 이슈 없음.

### 해결됨 — 출시 전 렌더링 확인

- 범위: `content/articles/start-here/*.mdx`의 `VisualPlaceholder`
- 발견: 공통 문서 셸이 Start Here 상단에도 기존 `ArtifactDiagram` SVG를 삽입해 이미지 제작을 보류한다는 계약과 충돌했다.
- 조치: `core`·`developer-lab` 경로에서는 공통 `ArtifactDiagram`을 숨기고, 기존 48편에는 유지했다.
- 검증: 대표 본문과 실습 라우트에서 HTTP 200, 문서당 자리표시자 2개, 실제 `img`·`svg` 0개, 오류 오버레이·콘솔 오류·실패 요청 0개를 확인했다. 390px viewport에서도 가로 넘침이 없었다.

잔여 P0~P3 이슈가 없으므로 판정은 승인이다.

## 출시 전 체크리스트

- [x] `c00-a01`~`c00-a20`의 ID·order·slug가 고유하다.
- [x] 20편의 `assumes`가 앞선 `introduces`만 참조한다.
- [x] Phase 분량은 10,000·15,000·13,000·15,000·17,000, 실습은 12,000이다.
- [x] 문서별 H2 9개와 `readingBudget` 상한을 지킨다.
- [x] 문서별 `VisualPlaceholder` 두 개, 전체 40개를 확인했다.
- [x] 팩트체크의 TLS·웹·ZK·MPC·architecture 한정이 본문과 체크리스트에 반영됐다.
- [x] 프로덕션 정적 빌드의 대표 본문·실습 route에서 자리표시자 렌더와 오류 부재를 확인한다.
- [ ] 실제 시각 자료를 제작할 때 `mustShow`와 `alt`를 새 사실 없이 유지한다.

## 독자에게 의도적으로 남기는 고급 개념

이 경로는 구현 세부를 의도적으로 열어 둔다. TLSNotary API와 pre-release artifact 형식, 구체 proving system, circuit audit, key management, proxy 운영, DECO의 세부 계보, SNARK/STARK 선택, garbled circuit·OT, production freshness 저장소 설계는 후속 심화 자료의 범위다. 독자는 이 경로를 마친 뒤에도 각 프로토콜의 공식 명세와 adversary model을 별도로 확인해야 한다.
