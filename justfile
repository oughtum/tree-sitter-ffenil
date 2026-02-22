# purely for testing in my local environment
helix:
    helix --grammar fetch
    helix --grammar build

gen:
    just helix
    tree-sitter generate

parse FILE="example.ffnl":
    just gen
    tree-sitter parse {{FILE}}

hl FILE="example.ffnl":
    just parse {{FILE}}
    tree-sitter highlight {{FILE}}

web:
    tree-sitter build --wasm && tree-sitter playground
