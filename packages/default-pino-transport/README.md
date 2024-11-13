# default-pino-transport

Flocon における pino のデフォルトの transport およびそれに直接用いられる値などからなります。

pino の transport は JavaScript のファイルパスもしくはモジュールを指定する必要があるが、ファイルパスだと Rollup で 1 つの JavaScript ファイルに結合されたり、ts-node からロガーを利用するときに参照できないケースがあるため、1 つのモジュールとして独立させている。
