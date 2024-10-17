# Semantic version comparison in Flocon

## prerelease

`1.0.0-alpha.1` < `1.0.0-alpha.1` ⇒ `false`

`1.0.0-alpha.1` < `1.0.0-alpha.2` ⇒ `true`

`1.0.0-alpha.2` < `1.0.0-beta.1` ⇒ `true`

`1.0.0-alpha.2` < `1.1.0-alpha.1` ⇒ `true` (intentional different behavior from Node.js)

`1.0.0-beta.1` < `1.1.0-alpha.1` ⇒ `true` (intentional different behavior from Node.js)

`1.0.0` < `1.1.0-alpha.1` ⇒ `true` (intentional different behavior from Node.js)

## range

`~1.2.3` := `>=1.2.3 <1.3.0-0`

`^1.2.3` := `>=1.2.3 <2.0.0-0`
