const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth/email-already-in-use': 'このメールアドレスは既に登録されています',
  'auth/invalid-email': 'メールアドレスの形式が正しくありません',
  'auth/weak-password': 'パスワードは6文字以上で入力してください',
  'auth/user-not-found': 'アカウントが見つかりません',
  'auth/wrong-password': 'パスワードが正しくありません',
  'auth/invalid-credential': 'メールアドレスまたはパスワードが正しくありません',
  'auth/user-disabled': 'このアカウントは無効化されています',
  'auth/too-many-requests':
    '試行回数が多すぎます。しばらく時間をおいてから再度お試しください',
  'auth/network-request-failed':
    'ネットワークエラーが発生しました。接続を確認してください',
  'auth/missing-password': 'パスワードを入力してください',
}

export function translateAuthError(error: unknown): string {
  if (error instanceof Error) {
    const match = error.message.match(/\(auth\/([a-z-]+)\)/)
    if (match) {
      const code = `auth/${match[1]}`
      if (AUTH_ERROR_MESSAGES[code]) {
        return AUTH_ERROR_MESSAGES[code]
      }
    }
    return error.message
  }
  return '予期しないエラーが発生しました'
}
