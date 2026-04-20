import { Link, useParams } from 'react-router-dom'

export function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>()

  return (
    <div>
      <Link
        to="/"
        className="text-sm text-blue-600 hover:text-blue-800 inline-block mb-4"
      >
        ← ボード一覧に戻る
      </Link>
      <p className="text-slate-500">
        ボード詳細画面（boardId: {boardId}）
      </p>
      <p className="text-slate-400 text-sm mt-2">
        次のフェーズでリスト・カードの表示を実装します。
      </p>
    </div>
  )
}
