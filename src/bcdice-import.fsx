(* 
    import のコードを自動生成するF#スクリプト
    Ionide-fsharpがインストールされたVisual Studio Codeで、右上に表示される「F#: Run script」を実行して使うことを想定
 *)

let path = System.IO.Path.Join(System.IO.Directory.GetCurrentDirectory(), "..", "node_modules/bcdice/lib/diceBot")
printfn "%s" path
let filenames = System.IO.Directory.GetFiles(path) |> Array.choose (fun path -> 
    let regex = System.Text.RegularExpressions.Regex(@"bcdice[/\\]lib[/\\]diceBot[/\\](?<filename>.*)\.js")
    let result = regex.Match(path)
    if result.Success then
        Some result.Groups.["filename"].Value
    else
        None)
let imports = filenames |> Array.fold (fun seed x -> sprintf "%s\r\nimport 'bcdice/lib/diceBot/%s';" seed x) ""

printfn "import 'bcdice'%s" imports