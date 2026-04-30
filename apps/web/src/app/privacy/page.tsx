import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '개인정보처리방침 - Singcode',
  description: 'Singcode 개인정보처리방침',
};

export default function PrivacyPage() {
  return (
    <div className="space-y-8 pb-8 text-sm leading-relaxed">
      <div>
        <h1 className="mb-2 text-2xl font-bold">개인정보처리방침</h1>
        <p className="text-muted-foreground">최종 수정일: 2025년 5월 1일</p>
      </div>

      <p>
        Singcode(이하 &quot;서비스&quot;)는 이용자의 개인정보를 소중히 여기며, 관련 법령을
        준수합니다. 본 방침은 서비스 이용 과정에서 수집되는 정보와 그 처리 방법을 안내합니다.
      </p>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">1. 수집하는 개인정보 항목</h2>
        <div className="space-y-2">
          <p className="font-medium">카카오 소셜 로그인</p>
          <ul className="text-muted-foreground ml-4 list-disc space-y-1">
            <li>카카오 계정 이메일 (선택)</li>
            <li>카카오 고유 사용자 ID</li>
            <li>닉네임 (선택)</li>
          </ul>
        </div>
        <div className="space-y-2">
          <p className="font-medium">서비스 이용 과정에서 생성되는 정보</p>
          <ul className="text-muted-foreground ml-4 list-disc space-y-1">
            <li>즐겨찾기(좋아요) 곡 목록</li>
            <li>재생목록(폴더) 및 저장된 곡 목록</li>
            <li>부를 곡 목록</li>
            <li>서비스 이용 기록 (접속 로그, IP 주소)</li>
          </ul>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">2. 개인정보 수집 및 이용 목적</h2>
        <ul className="text-muted-foreground ml-4 list-disc space-y-1">
          <li>회원 인증 및 계정 관리</li>
          <li>곡 저장·즐겨찾기·재생목록 등 서비스 핵심 기능 제공</li>
          <li>서비스 품질 개선 및 오류 분석</li>
          <li>관계 법령 준수</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">3. 개인정보 보유 및 이용 기간</h2>
        <p className="text-muted-foreground">
          회원 탈퇴 시 또는 이용 목적 달성 즉시 해당 개인정보를 지체 없이 파기합니다. 단, 관계
          법령에 따라 일정 기간 보존이 필요한 경우 해당 기간 동안 보관 후 파기합니다.
        </p>
        <div className="bg-muted rounded-md p-3">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b">
                <th className="pb-2 text-left font-medium">항목</th>
                <th className="pb-2 text-left font-medium">보존 기간</th>
                <th className="pb-2 text-left font-medium">근거</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr>
                <td className="py-1">서비스 이용 기록</td>
                <td className="py-1">3개월</td>
                <td className="py-1">통신비밀보호법</td>
              </tr>
              <tr>
                <td className="py-1">전자상거래 기록</td>
                <td className="py-1">5년</td>
                <td className="py-1">전자상거래법</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">4. 개인정보 제3자 제공</h2>
        <p className="text-muted-foreground">
          서비스는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다. 단, 아래 외부
          서비스는 각 서비스 고유의 개인정보처리방침에 따라 처리됩니다.
        </p>
        <ul className="text-muted-foreground ml-4 list-disc space-y-1">
          <li>
            <strong>Supabase</strong> — 데이터베이스 및 인증 (미국 소재)
          </li>
          <li>
            <strong>Kakao</strong> — 소셜 로그인 인증
          </li>
          <li>
            <strong>Vercel</strong> — 웹 호스팅 및 성능 분석
          </li>
          <li>
            <strong>Google Analytics</strong> — 서비스 이용 통계 분석
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">5. 이용자의 권리</h2>
        <p className="text-muted-foreground">이용자는 언제든지 다음 권리를 행사할 수 있습니다.</p>
        <ul className="text-muted-foreground ml-4 list-disc space-y-1">
          <li>개인정보 열람, 정정, 삭제 요청</li>
          <li>개인정보 처리 정지 요청</li>
          <li>회원 탈퇴 (/withdrawal 페이지에서 직접 처리 가능)</li>
        </ul>
        <p className="text-muted-foreground">
          탈퇴 시 계정 및 모든 저장 데이터(즐겨찾기, 재생목록, 부를 곡)는 즉시 삭제됩니다.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">6. 개인정보 보호책임자</h2>
        <div className="bg-muted rounded-md p-3 text-sm">
          <p>
            <span className="font-medium">서비스명</span>: Singcode
          </p>
          <p>
            <span className="font-medium">문의</span>: singcode.kr 서비스 내 문의 채널 이용
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">7. 방침 변경 안내</h2>
        <p className="text-muted-foreground">
          본 방침이 변경될 경우, 변경 7일 전부터 서비스 내 공지를 통해 안내합니다.
        </p>
      </section>
    </div>
  );
}
