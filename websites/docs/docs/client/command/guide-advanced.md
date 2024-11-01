---
sidebar_position: 2
title: '詳細'
---

（書きかけ）

## コマンドの言語

コマンドの言語は、端的に言うと機能を制限した TypeScript です。そのため例えば`let x: number = 1;`といったコードは有効であり、正常に処理されます。ただし、TypeScript は将来非対応にする可能性があるため、TypeScript 独自の書き方をせず、JavaScriptの文法の範囲で書くことを推奨します。

## 一般的な JavaScript との言語仕様の差異

| 機能                                                                                                                         | 対応状況 | 将来実装する可能性 | 備考                                           |
| ---------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------ | ---------------------------------------------- |
| var                                                                                                                          | ❌       | 低                 | 代わりに let もしくは const を使用してください |
| let                                                                                                                          | ⭕       |
| const                                                                                                                        | ⭕       |
| bigint                                                                                                                       | ❌       | 低                 |
| symbol                                                                                                                       | ❌       | 低                 |
| 正規表現                                                                                                                     | ❌       | 高                 |
| globalThis                                                                                                                   | ⭕       |
| [funcion キーワードを用いた関数宣言](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Statements/function)     | ❌       | 高                 | 代わりにアロー関数を使用してください           |
| [アロー関数](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Functions/Arrow_functions)                       | ⭕       |
| if, else                                                                                                                     | ⭕       |
| switch, case                                                                                                                 | ⭕       |
| for 文(for in, for of も含む)                                                                                                | ❌       | 中                 |                                                |
| while 文                                                                                                                     | ❌       | 中                 |                                                |
| throw                                                                                                                        | ❌       | 中                 |
| try, catch, finally                                                                                                          | ❌       | 中                 |
| async, await, Promise                                                                                                        | ❌       | 低                 |
| function\*, yield                                                                                                            | ❌       | やや低             |
| import, export                                                                                                               | ❌       | やや低             |
| delete 演算子                                                                                                                | ❌       | やや低             |
| void 演算子                                                                                                                  | ❌       | 低                 |
| typeof 演算子                                                                                                                | ❌       | やや高             |
| 単項演算子としての+, -, ~, !                                                                                                 | ⭕       |
| in, instanceof を除く二項演算子                                                                                              | ⭕       |
| [Null 合体演算子](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing_operator)      | ⭕       |
| in 演算子                                                                                                                    | ❌       | やや高             |
| instanceof 演算子                                                                                                            | ❌       | 未定               |
| [条件演算子](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Operators/Conditional_Operator)                  | ⭕       |
| [オプショナルチェイニング演算子](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Operators/Optional_chaining) | ⭕       |
| [分割代入](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment)                | ❌       | 中                 |
| [残余引数](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Functions/rest_parameters)                         | ❌       | 中                 |
| クラス                                                                                                                       | ❌       | 中                 | 継承などがあり、複雑な機能のため実装が難しいか |
| console                                                                                                                      | ❌       | 高                 |
| alert                                                                                                                        | ❌       | 中                 |
| setTimeout, setInterval                                                                                                      | ❌       | 低                 |
| prototype, \_\_proto\_\_                                                                                                     | ❌       | 低                 |

この他にも、例えば Array.filter などのように現時点では実装していないメソッドがあります。

## コマンドの書き方

グローバル変数として`character`と`room`が定義されています。前者はキャラクターコマンドが実行されたキャラクターを、後者は部屋を表すオブジェクトです。

定義されているプロパティやメソッドは、エディターの機能を利用して参照してください（例えば`character.`と入力して出てくるリスト）。

## コマンドの実行の流れ

JavaScript は、風呂独自のプログラムによって解析、実行されます。JavaScript の機能が大きく制限されている代わりに、例えば何らかの情報を密かに悪意のあるサイトへ送信するなどといった問題のあるコードを作成できなくなることが期待されます。

Floconでは、部屋の現在の状態を表すJavaScriptオブジェクトがブラウザ内に存在します。このオブジェクトが deep clone され、グローバル変数の`room`となります。また、`room`の中にはキャラクターを表すオブジェクトも存在するので、キャラクターコマンドが属するキャラクターを探して、それがグローバル変数の`character`となります。

コマンドが実行されると、`room`と`character`のオブジェクトの中身が編集されます。これらは元のオブジェクトを deep clone したものなので、この時点では元のオブジェクトは変更されていません。

コマンドの実行が正常に完了したら、`room`オブジェクトとdeep clone前の部屋のオブジェクトの差分を取ります。これがコピー元のオブジェクトに適用され、ブラウザに反映され、時間が経ったらサーバーにも送信されます。もし正常に完了しなかった場合は、`room`オブジェクトと`character`オブジェクトは破棄され、部屋の状態は変更されずに終了します。
