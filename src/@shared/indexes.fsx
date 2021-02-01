let types =
    [1..100]
    |> List.fold (fun seed x -> sprintf "%s | '%i'" seed x) "export type StrIndex100 = "

let array =
    [1..100]
    |> List.fold (fun seed x -> sprintf "%s,'%i'" seed x) "export const strIndex100Array: ReadonlyArray<StrIndex100> = ["
    |> (fun self -> self + "]")

printfn "%s\r\n%s" types array