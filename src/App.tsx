import localforage from 'localforage';
import { useEffect, useState } from "react";
import { isTodos } from './lib/isTodos';

// "Todo型"　の定義
type Todo = {
  // プロパティ　value は文字列型
  value: string;
  readonly id: number;
  // 完了/未完了を示すプロパティ
  checked: boolean;
  removed: boolean;
};

type Filter = 'all' | 'checked' | 'unchecked' | 'removed';

export const App = () => {
  // 初期値: 空文字列　''
  const [text, setText] = useState('');
  // 追加
  const [todos, setTodos] = useState<Todo[]>([]);
  // 追加
  const [filter, setFilter] = useState<Filter>('all');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  };

  //todosステートを更新する関数
  const handleSubmit = () => {
    //何も入力されていなかったらリターン
    if (!text) return;
    const newTodo: Todo = {
      value: text,
      id: new Date().getTime(),
      // 初期値(todo 作成時)はfalse
      checked: false,
      removed: false, //←追加
    };
    /**
     * 更新前のtodosステートを元に
     * スプレッド構文で展開した要素へ
     * newTodoを加えた新しい配列でステートを更新
     **/
    setTodos((todos) => [newTodo, ...todos]);
    // フォームへの入力をクリアする
    setText('');
      };    
  const handleTodo = <K extends keyof Todo, V extends Todo[K]>(
    id: number,
    key: K,
    value: V
  ) => {
    setTodos((todos) => {
      const newTodos = todos.map((todo) => {
        if(todo.id === id) {
          return { ...todo, [key]: value };
        } else {
          return todo;
        }
      });

      return newTodos;
    });
  };
  const handleFilter = (filter: Filter) => {
    setFilter(filter);
  };
  const handleEmpty =() => {
    // シャローコピーで事足りる
    setTodos((todos) => todos.filter((todo) => !todo.removed));
  };

  const filteredTodos = todos.filter((todo) => {
    // filter ステートの値に応じて異なる内容の配列を返す
    switch (filter){
      case 'all':
        //削除されていないもの
        return !todo.removed;
      case 'checked':
        // 完了済　**かつ**削除されていないもの
        return todo.checked && !todo.removed;
      case 'unchecked':
        //　未完了　**かつ**削除されていないもの
        return todo.checked && !todo.removed;
      case 'removed':
        // 削除済みのもの
        return todo.removed;
      default:
        return todo;
    }
  });
  
  /**
   * キー名('todo-20200101')
   * 第2引数の配列が空なのでコンポーネントのマウント時にのみ実行される
   */
  useEffect(() => {
    localforage
    .getItem('todo-20200101')
    .then((values) => isTodos(values) && setTodos(values));
  },[]);

  // todosステートが更新されたら、その値を保存

  useEffect(() => {
    localforage.setItem('todo-20200101', todos);
  }, [todos]);

  return(
    <div>
      {/*e.target.value: string を Filter型にアサーションする*/}
      <select 
      defaultValue="all"
      onChange={(e) => handleFilter(e.target.value as Filter)}
      >
        <option value="all">すべてのタスク</option>
        <option value="checked">完了したタスク</option>
        <option value="unchecked">現在のタスク</option>
        <option value="removed">ごみ箱</option>
      </select>
    {/* コールバックとして()=> handleSubmit() を渡す */}
      {filter === 'removed' ? (
        <button onClick={handleEmpty}
        disabled={todos.filter((todo) => todo.removed).length === 0}>
          ごみ箱を空にする
        </button>
      ) : (
        // フィルターが `checked`出なければTodo入力フォームを表示
        filter !== 'checked' && (
      <form
       onSubmit={(e)=> {
        e.preventDefault();
         handleSubmit();
       }}
      >
        <input
          type="text"
          // text ステートが持っている入力中テキストの値を valueとして表示
          value={text}
          // onChage イベント（＝入力テキストの変化）を　text ステートに反映する
          onChange={(e) => handleChange(e)}
        />
        {/* 上に同じ*/}
        <input 
          type="submit"
          value="追加" 
          onSubmit={handleSubmit}/>
      </form>
        )
      )}
      <ul>
        {filteredTodos.map((todo) =>{
          return (
          <li key={todo.id}>
            <input
             type="checkbox"
             disabled={todo.removed}
             // 呼び出し側で　chekede フラグを反転させる
             onChange={() => handleTodo(todo.id, 'checked', !todo.checked!)}
            />
            <input
            type="text"
            disabled={todo.checked || todo.removed}
            value={todo.value}
            onChange={(e) => handleTodo(todo.id, 'value', e.target.value)}
             />
             <button onClick={() => handleTodo(todo.id, 'removed', !todo.removed)}>
              {todo.removed ? '復元' : '削除'}
             </button>
             </li>
            );
          })}
      </ul>
    </div>
  );
};