import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '개인정보처리방침 - Singcode',
  description: 'Singcode 개인정보처리방침',
};

export default function PrivacyPage() {
  return (
    <div className="space-y-8 pb-8 text-sm leading-relaxed">
      <div>
        <h1 className="mb-2 text-2xl font-bold">Singcode 개인정보처리방침</h1>
        <p className="text-muted-foreground">본 방침은 2025년 6월 18일부터 적용됩니다.</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">총칙</h2>
        <p className="text-muted-foreground">
          Singcode(이하 &ldquo;서비스&rdquo;)는 사용자의 개인정보를 소중하게 생각하며, 이를 보호하기
          위해 최선을 다하고 있습니다.
        </p>
        <p className="text-muted-foreground">
          서비스는 『개인정보 보호법』, 『정보통신망 이용촉진 및 정보보호 등에 관한 법률』 등 관련
          법령을 준수하며, 본 개인정보처리방침을 통해 사용자의 개인정보가 어떤 방식으로
          수집·이용되고 있는지, 어떤 보호 조치를 취하고 있는지를 안내드립니다.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">개인정보의 수집·이용에 대한 동의</h2>
        <p className="text-muted-foreground">
          Singcode는 개인정보 수집 및 이용에 대한 동의를 받기 위해, 회원가입 및 소셜 로그인 시 관련
          내용을 안내하고 사용자가 &lsquo;동의&rsquo; 버튼을 클릭한 경우에만 개인정보를
          수집·이용합니다.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">수집하는 개인정보 항목 및 수집방법</h2>
        <p className="text-muted-foreground">
          서비스는 회원가입 및 기능 제공을 위하여 아래와 같은 정보를 수집합니다.
        </p>

        <div className="space-y-2">
          <p className="font-medium">1. 수집 항목</p>
          <ul className="text-muted-foreground ml-4 list-disc space-y-1">
            <li>필수: 이메일 주소 (회원가입 및 로그인 시)</li>
            <li>선택: 닉네임, 프로필 이미지 (소셜 로그인 시 제공될 경우)</li>
          </ul>
        </div>

        <div className="space-y-2">
          <p className="font-medium">2. 자동 수집 항목</p>
          <ul className="text-muted-foreground ml-4 list-disc space-y-1">
            <li>접속 일시, IP 주소, 브라우저 정보 등 (서비스 운영 및 로그 기록 목적)</li>
          </ul>
        </div>

        <div className="space-y-2">
          <p className="font-medium">3. 수집 방법</p>
          <ul className="text-muted-foreground ml-4 list-disc space-y-1">
            <li>사용자가 직접 입력한 경우</li>
            <li>Google, Naver, Kakao 등 소셜 로그인 연동을 통해 제공된 경우</li>
            <li>서비스 이용 중 자동으로 생성되는 정보 수집 도구를 통한 수집</li>
          </ul>
        </div>

        <div className="space-y-2">
          <p className="font-medium">4. 수집하지 않는 항목</p>
          <p className="text-muted-foreground">
            서비스는 아래와 같은 민감정보는 수집하지 않습니다.
          </p>
          <ul className="text-muted-foreground ml-4 list-disc space-y-1">
            <li>인종, 종교, 건강, 정치적 성향 등 민감 정보</li>
            <li>실명, 주민등록번호, 주소, 전화번호 등 신원 확인 정보</li>
          </ul>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">개인정보의 수집 및 이용 목적</h2>
        <p className="text-muted-foreground">
          Singcode는 수집된 개인정보를 다음의 목적에 한하여 사용합니다.
        </p>

        <ol className="ml-4 list-decimal space-y-3">
          <li>
            <p className="font-medium">회원 인증 및 서비스 제공</p>
            <ul className="text-muted-foreground ml-4 list-disc space-y-1">
              <li>이메일을 통한 사용자 식별 및 로그인 기능 제공</li>
              <li>사용자별 데이터 접근 및 기능 활성화</li>
            </ul>
          </li>
          <li>
            <p className="font-medium">서비스 개선 및 운영</p>
            <ul className="text-muted-foreground ml-4 list-disc space-y-1">
              <li>오류 분석, 트래픽 분석 등 통계적 목적의 서비스 개선</li>
              <li>기능 고도화를 위한 사용자 패턴 분석 (익명화 처리)</li>
            </ul>
          </li>
          <li>
            <p className="font-medium">문의 대응 및 알림</p>
            <ul className="text-muted-foreground ml-4 list-disc space-y-1">
              <li>사용자의 문의 대응</li>
              <li>서비스 변경 사항 등의 공지 전달</li>
            </ul>
          </li>
        </ol>

        <p className="text-muted-foreground">※ 마케팅, 광고성 활용은 하지 않습니다.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">개인정보의 보유 및 이용 기간</h2>
        <ul className="text-muted-foreground ml-4 list-disc space-y-1">
          <li>회원 탈퇴 시 개인정보는 즉시 삭제됩니다.</li>
          <li>단, 관계 법령에 따라 일정 기간 보관이 필요한 경우, 해당 법령에 따릅니다.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">개인정보의 제3자 제공</h2>
        <p className="text-muted-foreground">
          Singcode는 사용자의 동의 없이 개인정보를 외부에 제공하지 않습니다.
        </p>
        <p className="text-muted-foreground">단, 다음의 경우는 예외로 합니다.</p>
        <ul className="text-muted-foreground ml-4 list-disc space-y-1">
          <li>법령에 따른 요청이 있는 경우</li>
          <li>사용자의 별도 동의를 받은 경우</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">이용자의 권리와 행사 방법</h2>
        <p className="text-muted-foreground">
          이용자는 언제든지 본인의 개인정보에 대해 다음의 권리를 행사할 수 있습니다.
        </p>
        <ul className="text-muted-foreground ml-4 list-disc space-y-1">
          <li>개인정보 열람, 수정, 삭제 요청</li>
          <li>회원 탈퇴 및 계정 삭제 요청</li>
        </ul>
        <p className="text-muted-foreground">요청은 아래 이메일을 통해 접수하실 수 있습니다.</p>
        <div className="bg-muted rounded-md p-3">
          <a href="mailto:gulsamcono@gmail.com" className="font-medium underline">
            gulsamcono@gmail.com
          </a>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">개인정보 보호책임자 안내</h2>
        <div className="bg-muted rounded-md p-3 text-sm">
          <p>
            <span className="font-medium">이름</span>: 함상준
          </p>
          <p>
            <span className="font-medium">이메일</span>:{' '}
            <a href="mailto:gulsamcono@gmail.com" className="underline">
              gulsamcono@gmail.com
            </a>
          </p>
          <p>
            <span className="font-medium">문의 가능 시간</span>: 평일 10:00 ~ 18:00 (KST)
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">정책 변경에 대한 고지</h2>
        <p className="text-muted-foreground">
          본 개인정보처리방침은 서비스 페이지를 통해 공개되며, 내용이 변경될 경우 개정일자 및 주요
          변경 내용을 명확히 안내합니다.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">부칙</h2>
        <p className="text-muted-foreground">본 방침은 2025년 6월 18일부터 적용됩니다.</p>
        <p className="text-muted-foreground">
          본 방침 시행 이전에 수집한 사용자 개인정보(이메일 등)에 대해서는 오직 서비스 운영에 필요한
          최소한의 목적으로만 이용하며, 이후로는 본 방침에 따라 수집·이용·보관·파기 절차를 따릅니다.
        </p>
      </section>
    </div>
  );
}
