export const getErrorMessage = (errorCode: string | null) => {
  if (!errorCode) {
    return {
      isSuccess: false,
      errorTitle: '알 수 없는 오류',
      errorMessage: '회원가입이 실패했어요.',
    };
  }
  switch (errorCode) {
    case 'email_address_invalid':
      return {
        isSuccess: false,
        errorTitle: '유효하지 않은 이메일',
        errorMessage: '이메일 주소가 올바르지 않아요.',
      };
    case 'weak_password':
      return {
        isSuccess: false,
        errorTitle: '약한 비밀번호',
        errorMessage: '비밀번호가 최소 6자 이상이어야 해요.',
      };
    case 'email_not_confirmed':
      return {
        isSuccess: false,
        errorTitle: '인증되지 않은 계정',
        errorMessage: '이메일 인증이 필요해요.',
      };
    case 'invalid_credentials':
      return {
        isSuccess: false,
        errorTitle: '잘못된 정보',
        errorMessage: '이메일 또는 비밀번호가 일치하지 않아요.',
      };
    default:
      return {
        isSuccess: false,
        errorTitle: '알 수 없는 오류',
        errorMessage: '회원가입이 실패했어요.',
      };
  }
};
